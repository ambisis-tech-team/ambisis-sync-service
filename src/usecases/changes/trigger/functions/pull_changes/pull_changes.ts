import { Err, Ok, type Result } from "void-ts";
import type { Deleted } from "../../types/trigger_request";
import { startSpan, withActiveSpan } from "@sentry/node";
import { pullCentralDbTables } from "./functions/pull_central_db_tables";
import { pullClientDbTables } from "./functions/pull_client_db_tables";
import { SPAN_STATUS_ERROR, SPAN_STATUS_OK, type Span } from "@sentry/core";
import type {
  FailedToPullCentralDbTable,
  FailedToPullClientDbTable,
} from "./functions/error/error";
import { log } from "ambisis_node_helper";
import { pullUnsyncedCentralDbTables } from "./functions/pull_unsynced_central_db_tables";
import { pullUnsyncedClientDbTables } from "./functions/pull_unsynced_client_db_tables";
import { pullDeletedRows } from "./functions/functions/pull_deleted_rows";
import type { MappedForeignKeys } from "../push_changes/functions/map_foreign_keys/types/mapped_foreign_keys";
import type { Transaction } from "mysql-all-in-one/DataAccessObject/types";

export const pullChanges = async (
  clientDb: Transaction,
  centralDb: Transaction,
  span: Span,
  database: string,
  lastSyncDate: number,
  syncedClientDbTables: string[],
  syncedCentralDbTables: string[],
  mappedForeignKeys: MappedForeignKeys,
  tablesToSyncCentralDb: string[],
  tablesToSyncClientDb: string[]
): Promise<
  Result<
    {
      centralTables: { table: string; data: Record<string, unknown>[] }[];
      clientTables: { table: string; data: Record<string, unknown>[] }[];
      unsyncedCentralTables: {
        table: string;
        data: Record<string, unknown>[];
      }[];
      unsyncedClientTables: {
        table: string;
        data: Record<string, unknown>[];
      }[];
      deletedClientDbRows: Deleted;
    },
    FailedToPullClientDbTable | FailedToPullCentralDbTable
  >
> =>
  withActiveSpan(span, async () =>
    startSpan({ name: "trigger.pull_changes" }, async (span) => {
      const centralTables = await pullCentralDbTables(
        centralDb,
        span,
        lastSyncDate,
        mappedForeignKeys,
        syncedCentralDbTables
      );

      if (centralTables.isErr()) {
        const error = centralTables.unwrapErr();
        span.setStatus({ code: SPAN_STATUS_ERROR, message: error.message });
        log(` Failed to pull changes - ${error} - pull_changes.ts`);
        return new Err(error);
      }

      const clientTables = await pullClientDbTables(
        clientDb,
        span,
        database,
        lastSyncDate,
        mappedForeignKeys,
        syncedClientDbTables
      );

      if (clientTables.isErr()) {
        const error = clientTables.unwrapErr();
        span.setStatus({ code: SPAN_STATUS_ERROR, message: error.message });
        log(` Failed to pull changes - ${error} - pull_changes.ts`);
        return new Err(error);
      }

      const unsyncedCentralTables = await pullUnsyncedCentralDbTables(
        centralDb,
        span,
        syncedCentralDbTables,
        tablesToSyncCentralDb,
        mappedForeignKeys
      );

      if (unsyncedCentralTables.isErr()) {
        const error = unsyncedCentralTables.unwrapErr();
        span.setStatus({ code: SPAN_STATUS_ERROR, message: error.message });
        log(` Failed to pull changes - ${error} - pull_changes.ts`);
        return new Err(error);
      }

      const unsyncedClientTables = await pullUnsyncedClientDbTables(
        clientDb,
        span,
        database,
        syncedClientDbTables,
        tablesToSyncClientDb,
        mappedForeignKeys
      );

      if (unsyncedClientTables.isErr()) {
        const error = unsyncedClientTables.unwrapErr();
        span.setStatus({ code: SPAN_STATUS_ERROR, message: error.message });
        log(` Failed to pull changes - ${error} - pull_changes.ts`);
        return new Err(error);
      }

      const clientDbDeletedRows = await pullDeletedRows(clientDb, lastSyncDate);

      if (clientDbDeletedRows.isErr()) {
        const error = clientDbDeletedRows.unwrapErr();
        span.setStatus({ code: SPAN_STATUS_ERROR, message: error.message });
        log(` Failed to pull changes - ${error} - pull_changes.ts`);
        return new Err(error);
      }

      span.setStatus({ code: SPAN_STATUS_OK, message: "Pulled changes" });

      return new Ok({
        centralTables: centralTables.unwrap(),
        clientTables: clientTables.unwrap(),
        unsyncedCentralTables: unsyncedCentralTables.unwrap(),
        unsyncedClientTables: unsyncedClientTables.unwrap(),
        deletedClientDbRows: clientDbDeletedRows.unwrap(),
      });
    })
  );
