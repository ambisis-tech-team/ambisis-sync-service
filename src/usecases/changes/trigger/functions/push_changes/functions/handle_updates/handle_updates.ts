import type { Transaction } from "mysql-all-in-one/DataAccessObject/types";
import type { InsertedAndUpdatedChangesMappedToTable } from "../extract_updated_and_inserted_rows_from_data_changes/types/inserted_and_updated_changes_mapped_to_table";
import { startSpan, withActiveSpan } from "@sentry/node";
import { isUpdateValues } from "mysql-all-in-one/QueryBuilder/update/types";
import { assert, AssertError, Err, Ok, type Result } from "void-ts";
import { SPAN_STATUS_ERROR, SPAN_STATUS_OK, type Span } from "@sentry/core";
import { log, LogLevel } from "ambisis_node_helper";
import { FailedToHandleUpdate } from "./error/failed_to_handle_update";
import { FailedToHandleUpdates } from "./error/failed_to_handle_updates";
import { getTableColumns } from "../../../pull_changes/functions/functions/get_table_columns";
import { cleanRow } from "../clean_row/clean_row";

export const handleUpdates = async (
  tx: Transaction,
  span: Span,
  data: InsertedAndUpdatedChangesMappedToTable,
  database: string
): Promise<
  Result<[], FailedToHandleUpdate | AssertError | FailedToHandleUpdates>
> =>
  await withActiveSpan(
    span,
    async () =>
      await startSpan(
        { name: "trigger.push_changes.handle_updates" },
        async (span) => {
          try {
            const updatedRows = await Promise.all(
              Object.entries(data).map(async ([table, { updatedRows }]) => {
                const tableCols = await getTableColumns(tx, database, table);
                if (tableCols.isErr()) return [tableCols];
                return await Promise.all(
                  updatedRows.map(
                    async (
                      row
                    ): Promise<
                      Result<[], FailedToHandleUpdate | AssertError>
                    > => {
                      const { id, ...rest } = row.data;
                      const cleanedRow = cleanRow(
                        rest,
                        tableCols.unwrap().map((col) => col.columnName)
                      );
                      try {
                        assert(
                          isUpdateValues(cleanedRow),
                          "Rows should always be update values"
                        );
                        await tx.update(table, cleanedRow, {
                          id: Math.abs(id),
                        });
                        return new Ok([]);
                      } catch (error) {
                        log(
                          ` Failed to update - ${error} - handle_updates.ts`,
                          LogLevel.ERROR
                        );
                        if (error instanceof AssertError) throw error;
                        span.setStatus({
                          code: SPAN_STATUS_ERROR,
                          message: "Failed to handle update",
                        });
                        span.setAttributes({ table, id, ...rest });
                        return new Err(
                          new FailedToHandleUpdate(table, id, rest)
                        );
                      }
                    }
                  )
                );
              })
            );
            if (updatedRows.some((rows) => rows.some((row) => row.isErr())))
              throw new FailedToHandleUpdates();
            span.setStatus({ code: SPAN_STATUS_OK, message: "Updated rows" });
            return new Ok([]);
          } catch (error) {
            span.setStatus({
              code: SPAN_STATUS_ERROR,
              message: "Failed to handle updates",
            });
            if (error instanceof AssertError) return new Err(error);
            log(
              ` Failed to handle updates - ${error} - handle_updates.ts`,
              LogLevel.ERROR
            );
            return new Err(new FailedToHandleUpdates());
          }
        }
      )
  );
