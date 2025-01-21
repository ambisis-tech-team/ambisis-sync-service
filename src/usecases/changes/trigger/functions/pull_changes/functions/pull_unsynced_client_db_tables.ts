import { log, LogLevel } from "ambisis_node_helper";
import { Err, Ok, type Result } from "void-ts";
import { FailedToPullClientDbTable } from "./error/error";
import { startSpan, withActiveSpan } from "@sentry/node";
import { SPAN_STATUS_ERROR, SPAN_STATUS_OK, type Span } from "@sentry/core";
import { pullUnsyncedTables } from "./functions/pull_unsynced_table";
import type { MappedForeignKeys } from "../../push_changes/functions/map_foreign_keys/types/mapped_foreign_keys";
import type { Transaction } from "mysql-all-in-one/DataAccessObject/types";

export const pullUnsyncedClientDbTables = async (
  tx: Transaction,
  span: Span,
  database: string,
  syncedMobileClientTables: string[],
  tablesInSync: string[],
  mappedForeignKeys: MappedForeignKeys
): Promise<
  Result<
    { table: string; data: Record<string, unknown>[] }[],
    FailedToPullClientDbTable
  >
> =>
  withActiveSpan(span, async () =>
    startSpan(
      {
        name: "trigger.pull_changes.pull_unsynced_client_db_tables.pull_client_db_tables",
      },
      async (span) => {
        try {
          const unsyncedMobileTables = tablesInSync.filter(
            (table) => !syncedMobileClientTables.includes(table)
          );
          const data = await Promise.all(
            unsyncedMobileTables.map(
              async (table) =>
                await pullUnsyncedTables(tx, table, database, mappedForeignKeys)
            )
          );
          if (data.some((table) => table.isErr()))
            return new Err(new FailedToPullClientDbTable());
          span.setStatus({
            code: SPAN_STATUS_OK,
            message: "Pulled client db tables",
          });
          return new Ok(data.flatMap((table) => table.unwrap()));
        } catch (error) {
          span.setStatus({
            code: SPAN_STATUS_ERROR,
            message: "Failed to pull client db tables",
          });
          log(
            ` Failed to pull client db tables - ${error} - pull_client_db_tables.ts`,
            LogLevel.ERROR
          );
          return new Err(new FailedToPullClientDbTable());
        }
      }
    )
  );
