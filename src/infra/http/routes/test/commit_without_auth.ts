import { SPAN_STATUS_ERROR } from "@sentry/core";
import { startSpan } from "@sentry/node";
import { ambisisResponse, log, LogLevel } from "ambisis_node_helper";
import type { Request, Response } from "express";
import { getSyncProcessTransactionByUserId } from "../../../../usecases/changes/functions/get_sync_process_transaction_by_user_id";

export const commit = (req: Request, res: Response) =>
  startSpan({ name: "commit" }, async (span) => {
    try {
      const database = req.body.database;
      const user_id = req.body.user_id;

      try {
        log(
          `Commiting sync transaction - ${user_id} - ${database}`,
          LogLevel.INFO
        );

        const { transactionCentral, transactionClient } =
          getSyncProcessTransactionByUserId(user_id);

        await transactionCentral.commit();
        await transactionClient.commit();

        log(
          `Commited sync transaction - ${user_id} - ${database}`,
          LogLevel.INFO
        );

        return ambisisResponse(res, 200, "OK");
      } catch (error) {
        span.setStatus({
          code: SPAN_STATUS_ERROR,
          message: "Internal server error",
        });
        log(
          `Unexpected error while trying to commit sync transactions - userId: ${user_id} - database: ${database}`,
          LogLevel.INFO
        );
        return ambisisResponse(res, 500, "INTERNAL SERVER ERROR");
      }
    } catch (error) {
      console.error(error);
    }
  });
