import { log, LogLevel } from "ambisis_node_helper";
import { Err, Ok, type Result } from "void-ts";
import { FailedToPullCentralDbTable } from "./error/error";
import { pullDbTables } from "./functions/pull_db_tables";
import { startSpan, withActiveSpan } from "@sentry/node";
import { SPAN_STATUS_ERROR, SPAN_STATUS_OK, type Span } from "@sentry/core";
import type { MappedForeignKeys } from "../../push_changes/functions/map_foreign_keys/types/mapped_foreign_keys";
import type { Transaction } from "mysql-all-in-one/DataAccessObject/types";

export const pullCentralDbTables = async (
  tx: Transaction,
  span: Span,
  lastSyncDate: number,
  mappedForeignKeys: MappedForeignKeys,
  tablesToSync: string[]
): Promise<
  Result<
    { table: string; data: Record<string, unknown>[] }[],
    FailedToPullCentralDbTable
  >
> =>
  withActiveSpan(span, async () =>
    startSpan(
      { name: "trigger.pull_changes.pull_central_db_tables" },
      async (span) => {
        try {
          const data = await Promise.all(
            tablesToSync.map(
              async (table) =>
                await pullDbTables(
                  tx,
                  lastSyncDate,
                  table,
                  "ambisis",
                  mappedForeignKeys
                )
            )
          );
          if (data.some((table) => table.isErr())) {
            const error = data
              .filter((table) => table.isErr())
              .map((table) => table.unwrapErr().message)
              .join(", ");
            span.setStatus({ code: SPAN_STATUS_ERROR, message: error });
            log(
              ` Failed to pull central db tables - ${error} - pull_central_db_tables.ts`,
              LogLevel.ERROR
            );
            return new Err(new FailedToPullCentralDbTable());
          }
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
          return new Err(new FailedToPullCentralDbTable());
        }
      }
    )
  );
