import { SPAN_STATUS_ERROR } from "@sentry/core";
import type { Span } from "@sentry/core";
import { log, LogLevel } from "ambisis_node_helper";
import type { Transaction } from "mysql-all-in-one/DataAccessObject/types";
import type { Err } from "void-ts";

export async function handleErrors<T extends Error = Error>({
  span,
  err,
  lastSyncDate,
  syncLogId,
  user_id,
  database,
  snapshotClient,
  snapshotCentral,
}: {
  span: Span;
  err: Err<T>;
  lastSyncDate: number;
  syncLogId: string;
  user_id: number;
  database: string;
  snapshotClient?: Transaction;
  snapshotCentral?: Transaction;
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

  log(` ${error.message} - sync.ts`, LogLevel.ERROR);

  if (snapshotClient) await snapshotClient.rollback();
  if (snapshotCentral) await snapshotCentral.rollback();
}
