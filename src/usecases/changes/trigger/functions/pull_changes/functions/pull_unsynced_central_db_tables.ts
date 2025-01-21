import { log, LogLevel } from "ambisis_node_helper";
import { Err, Ok, type Result } from "void-ts";
import { startSpan, withActiveSpan } from "@sentry/node";
import { SPAN_STATUS_ERROR, SPAN_STATUS_OK, type Span } from "@sentry/core";
import { pullUnsyncedTables } from "./functions/pull_unsynced_table";
import { FailedToPullUnsycedTable } from "./functions/error/error";
import type { MappedForeignKeys } from "../../push_changes/functions/map_foreign_keys/types/mapped_foreign_keys";
import type { Transaction } from "mysql-all-in-one/DataAccessObject/types";

export const pullUnsyncedCentralDbTables = async (
  tx: Transaction,
  span: Span,
  syncedMobileCentralTables: string[],
  tablesInSync: string[],
  mappedForeignKeys: MappedForeignKeys
): Promise<
  Result<
    { table: string; data: Record<string, unknown>[] }[],
    FailedToPullUnsycedTable
  >
> =>
  withActiveSpan(span, async () =>
    startSpan(
      {
        name: "trigger.pull_changes.pull_unsynced_central_db_tables.client_db_tables",
      },
      async (span) => {
        try {
          const unsyncedMobileTables = tablesInSync.filter(
            (table) => !syncedMobileCentralTables.includes(table)
          );
          const data = await Promise.all(
            unsyncedMobileTables.map(
              async (table) =>
                await pullUnsyncedTables(
                  tx,
                  table,
                  "ambisis",
                  mappedForeignKeys
                )
            )
          );
          if (data.some((table) => table.isErr()))
            return new Err(new FailedToPullUnsycedTable());
          span.setStatus({
            code: SPAN_STATUS_OK,
            message: "Pulled central db tables",
          });
          return new Ok(data.flatMap((table) => table.unwrap()));
        } catch (error) {
          span.setStatus({
            code: SPAN_STATUS_ERROR,
            message: "Failed to pull central db tables",
          });
          log(
            ` Failed to pull central db tables - ${error} - pull_central_db_tables.ts`,
            LogLevel.ERROR
          );
          return new Err(new FailedToPullUnsycedTable());
        }
      }
    )
  );
