import type { Request, Response } from "express";
import { startSpan } from "@sentry/node";
import { ambisisResponse, log, LogLevel } from "ambisis_node_helper";
import { getSyncProcessByUser } from "../../../../domain/process_sync/functions/db/get_sync_process_by_user";
import { updateSyncProcess } from "../../../../domain/process_sync/functions/db/update_sync_process";
import { isProcessSyncStuck } from "../../../../domain/process_sync/functions/domain/is_process_stuck";
import { isRunning } from "../../../../domain/process_sync/functions/domain/is_running";
import { ProcessSyncStatus } from "../../../../domain/process_sync/types/sync_process";
import { ambisisSpan } from "../../../../shared/functions/ambisis_span";
import { sendEmailError } from "../../../../shared/functions/send_email_error";
import { addSyncProcessTransactionByUserId } from "../../../../usecases/changes/functions/add_sync_process_transaction_by_user_id";
import { doesUserHaveTransaction } from "../../../../usecases/changes/functions/does_user_have_transaction";
import { getSyncProcessTransactionByUserId } from "../../../../usecases/changes/functions/get_sync_process_transaction_by_user_id";
import { handleErrors } from "../../../../usecases/changes/trigger/functions/handle_errors";
import { mobileCentralTablesToSync } from "../../../../usecases/changes/trigger/functions/pull_changes/constants/mobile_central_tables_to_sync";
import { mobileClientTablesToSync } from "../../../../usecases/changes/trigger/functions/pull_changes/constants/mobile_client_tables_to_sync";
import { pullChanges } from "../../../../usecases/changes/trigger/functions/pull_changes/pull_changes";
import { mapForeignKeys } from "../../../../usecases/changes/trigger/functions/push_changes/functions/map_foreign_keys/map_foreign_keys";
import { pushChanges } from "../../../../usecases/changes/trigger/functions/push_changes/push_changes";
import { isSyncRequestSchema } from "../../../../usecases/changes/trigger/types/trigger_request";
import { db } from "../../../db/db";

export const trigger = (req: Request, res: Response) =>
  startSpan({ name: "trigger" }, async (span) => {
    const { database, user_id } = req.body;
    try {
      if (!isSyncRequestSchema(req.body)) {
        ambisisSpan(
          span,
          { status: "error", message: "Malformed sync request" },
          { userId: user_id, database: database }
        );
        return ambisisResponse(res, 422, "UNPROCESSABLE ENTITY");
      }

      const processSync = await getSyncProcessByUser(user_id);

      if (isProcessSyncStuck(processSync)) {
        log(
          `Sync process stuck - userId: ${user_id} - database: ${database}`,
          LogLevel.INFO
        );

        if (doesUserHaveTransaction(user_id)) {
          try {
            const { transactionCentral, transactionClient } =
              getSyncProcessTransactionByUserId(user_id);

            await transactionCentral.rollback();
            await transactionClient.rollback();
          } catch (error) {
            log(
              `Failed to rollback stuck sync process  - ${error}`,
              LogLevel.ERROR
            );

            ambisisSpan(
              span,
              {
                status: "error",
                message: "Sync process stuck and failed to recover",
              },
              { userId: user_id, database: database }
            );
            return ambisisResponse(res, 500, "INTERNAL SERVER ERROR");
          }
        }
      }

      if (isRunning(processSync) && !isProcessSyncStuck(processSync)) {
        log(
          `Sync already running - userId: ${user_id} - database: ${database}`,
          LogLevel.INFO
        );
        ambisisSpan(
          span,
          { status: "ok", message: "Sync already running" },
          { userId: user_id, database: database }
        );
        return ambisisResponse(res, 200, "SUCCESS", {
          message: "Sync already running",
        });
      }

      await updateSyncProcess({
        id: processSync.id,
        status: ProcessSyncStatus.PROCESSING,
      });

      const { transactionCentral, transactionClient } =
        await addSyncProcessTransactionByUserId(user_id, database);

      log(
        `Starting sync - userId: ${user_id} - database: ${database}`,
        LogLevel.INFO
      );

      const {
        dataChangesClientDb,
        deletedClientDb,
        lastSyncDate,
        syncLogId,
        dataChangesCentralDb,
        deletedCentralDb,
        syncedCentralDbTables,
        syncedClientDbTables,
      } = req.body;

      const foreignKeys = await mapForeignKeys(span, database);
      if (foreignKeys.isErr()) {
        await handleErrors({
          span,
          lastSyncDate,
          syncLogId,
          user_id,
          database,
          err: foreignKeys,
        });
        return ambisisResponse(res, 500, "INTERNAL SERVER ERROR");
      }

      const snapshotClient = await db.startTransaction(database);
      const snapshotCentral = await db.startTransaction("ambisis");

      const [pulledChanges, pushedClientChanges, pushedCentralChanges] =
        await Promise.all([
          pullChanges(
            snapshotClient,
            snapshotCentral,
            span,
            database,
            lastSyncDate,
            syncedClientDbTables,
            syncedCentralDbTables,
            foreignKeys.unwrap(),
            mobileCentralTablesToSync,
            mobileClientTablesToSync
          ),
          pushChanges(
            transactionClient,
            span,
            dataChangesClientDb,
            deletedClientDb,
            foreignKeys.unwrap(),
            database
          ),
          pushChanges(
            transactionCentral,
            span,
            dataChangesCentralDb,
            deletedCentralDb,
            foreignKeys.unwrap(),
            database
          ),
        ]);

      if (pushedClientChanges.isErr()) {
        await handleErrors({
          span,
          err: pushedClientChanges,
          lastSyncDate,
          syncLogId,
          user_id,
          database,
          snapshotClient,
          snapshotCentral,
        });
        return ambisisResponse(res, 500, "INTERNAL SERVER ERROR");
      }

      if (pushedCentralChanges.isErr()) {
        await handleErrors({
          span,
          err: pushedCentralChanges,
          lastSyncDate,
          syncLogId,
          user_id,
          database,
          snapshotClient,
          snapshotCentral,
        });
        return ambisisResponse(res, 500, "INTERNAL SERVER ERROR");
      }

      if (pulledChanges.isErr()) {
        await handleErrors({
          span,
          err: pulledChanges,
          lastSyncDate,
          syncLogId,
          user_id,
          database,
          snapshotClient,
          snapshotCentral,
        });
        return ambisisResponse(res, 500, "INTERNAL SERVER ERROR");
      }

      await snapshotClient.commit();
      await snapshotCentral.commit();

      ambisisSpan(
        span,
        { status: "ok" },
        {
          lastSyncDate: lastSyncDate,
          syncLogId: syncLogId,
          userId: user_id,
          database: database,
        }
      );

      log(
        `Finished sync - userId: ${user_id} - database: ${database}`,
        LogLevel.INFO
      );

      return ambisisResponse(res, 200, "SUCCESS", {
        ...pulledChanges.unwrap(),
        insertedClientIds: pushedClientChanges.unwrap(),
        insertedCentralIds: pushedCentralChanges.unwrap(),
      });
    } catch (error) {
      sendEmailError(
        "Erro inesperado ao rodando o sync 3.0",
        `Ocorreu um erro não tratado ao rodar o sync 3.0 - userId: ${user_id} - database: ${database} - ${error}`
      );
      log(` Unexpected error ${error} - sync.ts`, LogLevel.ERROR);
      ambisisSpan(
        span,
        { status: "error", message: "Unexpected error" },
        { userId: user_id, database: database }
      );
      return ambisisResponse(res, 500, "INTERNAL SERVER ERROR");
    }
  });
