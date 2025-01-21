import { getSyncProcessByUser } from "../../../domain/process_sync/functions/db/get_sync_process_by_user";
import { updateSyncProcess } from "../../../domain/process_sync/functions/db/update_sync_process";
import { ProcessSyncStatus } from "../../../domain/process_sync/types/sync_process";
import { SPAN_STATUS_ERROR } from "@sentry/core";
import { startSpan } from "@sentry/node";
import { ambisisResponse, log, LogLevel } from "ambisis_node_helper";
import type { Request, Response } from "express";
import { getSyncProcessTransactionByUserId } from "../functions/get_sync_process_transaction_by_user_id";

export const rollback = (req: Request, res: Response) =>
  startSpan({ name: "rollback" }, async (span) => {
    const { user_id, database } = req.session;
    try {
      log(
        `Rolling back sync transaction - ${user_id} - ${database}`,
        LogLevel.INFO
      );

      const processSync = await getSyncProcessByUser(user_id);

      const { transactionCentral, transactionClient } =
        getSyncProcessTransactionByUserId(user_id);

      await transactionCentral.rollback();
      await transactionClient.rollback();

      await updateSyncProcess({
        id: processSync.id,
        status: ProcessSyncStatus.ERROR,
      });

      log(
        `Rolled back sync transaction - ${user_id} - ${database}`,
        LogLevel.INFO
      );

      return ambisisResponse(res, 200, "OK");
    } catch (error) {
      span.setStatus({
        code: SPAN_STATUS_ERROR,
        message: "Internal server error",
      });
      log(
        `Unexpected error while trying to rollback sync transactions - userId: ${user_id} - database: ${database}`,
        LogLevel.INFO
      );
      return ambisisResponse(res, 500, "INTERNAL SERVER ERROR");
    }
  });
