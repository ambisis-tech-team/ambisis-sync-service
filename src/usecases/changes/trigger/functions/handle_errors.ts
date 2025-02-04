import { SPAN_STATUS_ERROR } from "@sentry/core";
import type { Span } from "@sentry/core";
import { log, LogLevel } from "ambisis_node_helper";
import type { Transaction } from "mysql-all-in-one/DataAccessObject/types";
import type { Err } from "void-ts";
import { sendEmailError } from "../../../../shared/functions/send_email_error";
import type { SyncRequest } from "../types/trigger_request";
import { createTriggerSyncPayloadJson } from "./push_changes/functions/create_trigger_sync_payload_json/create_trigger_sync_payload_json";

export async function handleErrors<T extends Error = Error>({
  span,
  err,
  lastSyncDate,
  syncLogId,
  user_id,
  database,
  snapshotClient,
  snapshotCentral,
  request,
}: {
  span: Span;
  err: Err<T>;
  lastSyncDate: number;
  syncLogId: string;
  user_id: number;
  database: string;
  snapshotClient?: Transaction;
  snapshotCentral?: Transaction;
  request: SyncRequest;
}) {
  const error = err.unwrapErr();

  span
    .setStatus({
      code: SPAN_STATUS_ERROR,
      message: error.message,
    })
    .setAttributes({
      lastSyncDate: lastSyncDate,
      syncLogId: syncLogId,
      userId: user_id,
      database: database,
    });

  log(`${error.message} - trigger.ts`, LogLevel.ERROR);

  if (snapshotClient) await snapshotClient.rollback();
  if (snapshotCentral) await snapshotCentral.rollback();

  createTriggerSyncPayloadJson(database, user_id, syncLogId, request);

  sendEmailError(
    "Erro inesperado ao rodando o sync 3.0",
    `Ocorreu um erro ao rodar o sync 3.0 - userId: ${user_id} - database: ${database} - ${error} - ${syncLogId}`
  );
}
