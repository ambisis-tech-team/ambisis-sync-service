import type { Request, Response } from "express";
import { isSyncRequestSchema } from "./types/trigger_request";
import { startSpan } from "@sentry/node";
import { ambisisResponse, log, LogLevel } from "ambisis_node_helper";
import { pushChanges } from "./functions/push_changes/push_changes";
import { pullChanges } from "./functions/pull_changes/pull_changes";
import { mapForeignKeys } from "./functions/push_changes/functions/map_foreign_keys/map_foreign_keys";
import { mobileCentralTablesToSync } from "./functions/pull_changes/constants/mobile_central_tables_to_sync";
import { mobileClientTablesToSync } from "./functions/pull_changes/constants/mobile_client_tables_to_sync";
import { handleErrors } from "./functions/handle_errors";
import { db } from "../../../infra/db/db";
import { ambisisSpan } from "../../../shared/functions/ambisis_span";
import { sendEmailError } from "../../../shared/functions/send_email_error";
import { createSyncInsertedIds } from "./functions/create_sync_inserted_ids/create_sync_inserted_ids";

export const trigger = (req: Request, res: Response) =>
  startSpan({ name: "trigger" }, async (span) => {
    const { database, user_id } = req.session;
    try {
      if (!isSyncRequestSchema(req.body)) {
        ambisisSpan(
          span,
          { status: "error", message: "Malformed sync request" },
          { userId: user_id, database: database }
        );
        return ambisisResponse(res, 422, "UNPROCESSABLE ENTITY");
      }

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
          request: req.body,
        });
        return ambisisResponse(res, 500, "INTERNAL SERVER ERROR");
      }

      const transactionCentral = await db.startTransaction("ambisis");
      const transactionClient = await db.startTransaction(database);
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
          request: req.body,
          transactionClient,
          transactionCentral,
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
          request: req.body,
          transactionClient,
          transactionCentral,
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
          request: req.body,
          transactionClient,
          transactionCentral,
        });
        return ambisisResponse(res, 500, "INTERNAL SERVER ERROR");
      }

      const insertedClientIds = pushedClientChanges.unwrap();
      const insertedCentralIds = pushedCentralChanges.unwrap();

      const syncInsertedIdsResult = await createSyncInsertedIds(
        db,
        span,
        syncLogId,
        insertedClientIds,
        insertedCentralIds
      );

      if (syncInsertedIdsResult.isErr()) {
        await handleErrors({
          span,
          err: syncInsertedIdsResult,
          lastSyncDate,
          syncLogId,
          user_id,
          database,
          request: req.body,
          transactionClient,
          transactionCentral,
        });
        return ambisisResponse(res, 500, "INTERNAL SERVER ERROR");
      }

      await snapshotClient.commit();
      await snapshotCentral.commit();
      await transactionClient.commit();
      await transactionCentral.commit();

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
        insertedClientIds,
        insertedCentralIds,
      });
    } catch (error) {
      sendEmailError(
        "Erro inesperado ao rodando o sync 3.0",
        `Ocorreu um erro não tratado ao rodar o sync 3.0 - userId: ${user_id} - database: ${database} - ${error}`
      );
      log(` Unexpected error ${error} - trigger.ts`, LogLevel.ERROR);
      ambisisSpan(
        span,
        { status: "error", message: "Unexpected error" },
        { userId: user_id, database: database }
      );
      return ambisisResponse(res, 500, "INTERNAL SERVER ERROR");
    }
  });
