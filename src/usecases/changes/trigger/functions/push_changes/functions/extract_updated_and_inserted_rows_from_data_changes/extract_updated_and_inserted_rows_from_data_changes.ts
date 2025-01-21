import { startSpan, withActiveSpan, type Span } from "@sentry/node";
import type { DataChanges } from "../../../../types/trigger_request";
import type { MappedForeignKeys } from "../map_foreign_keys/types/mapped_foreign_keys";
import type { InsertedAndUpdatedChangesMappedToTable } from "./types/inserted_and_updated_changes_mapped_to_table";
import { Err, Ok, type Result } from "void-ts";
import { SPAN_STATUS_ERROR, SPAN_STATUS_OK } from "@sentry/core";
import { FailedToExtractUpdatedAndInsertedRowsFromDataChanges } from "./error/failed_to_extract_updated_and_inserted_rows_from_data_changes";
import { extractSwapMappingAndReplaceFksFromRow } from "./functions/extract_swap_mapping_and_replace_fks_from_row";

/**
 * @param span The current span running in Sentry
 * @param dataChanges The changes from the sync request
 * @param foreignKeyMap The relational mapping of the foreign keys
 * @returns A object that separates insert from updates rows, and creates a swap mapping for each row to be used in the sync process
 *
 * Extract the updated and inserted rows from the data changes,
 * inserted rows have a positive id, updated rows have a negative id.
 * And replaces foreign keys with -1, if the foreign key was inserted in the same sync request.
 *
 * The swap mapping for each row is created to be used in conjuntion with the inserted ids mapping,
 * it keeps tracks of which foreign keys were replaced for a -1 in the row, and what was the original value.
 * With that you can use the swap mapping to replace the -1 with the inserted id by using the inserted id mapping.
 *
 * @example
 * ```ts
 * const extractedChanges = await extractUpdatedAndInsertedRowsFromDataChanges(span, dataChanges, foreignKeyMap);
 *
 * extractedChanges.map((changes) => {
 * 	changes.a.insertedRows.map((row) => {
 * 		console.log(row.data); // { id: 2, name: "Row 2", bId: -1 }
 * 		console.log(row.swapMapping); // Map { "bId" => 2 }
 * 		row.swapMapping.entries().forEach(([column, originalValue]) => {
 * 				console.log(column); // "bId"
 * 				console.log(originalValue); // 2
 *
 * 				const newId = insertedIdsMapping["b"].get(originalValue); // New id for the inserted row
 * 				await swap(table, column, newId);
 * 		})
 * });
 * ```
 */
export const extractUpdatedAndInsertedRowsFromDataChanges = async (
  span: Span,
  dataChanges: DataChanges,
  foreignKeyMap: MappedForeignKeys
): Promise<
  Result<
    InsertedAndUpdatedChangesMappedToTable,
    FailedToExtractUpdatedAndInsertedRowsFromDataChanges
  >
> =>
  await withActiveSpan(
    span,
    async () =>
      await startSpan(
        {
          name: "trigger.push_changes.extract_updated_and_inserted_rows_from_data_changes",
        },
        async (span) => {
          try {
            const insertedAndUpdatedMappedToTable: InsertedAndUpdatedChangesMappedToTable =
              {};

            for (const change of dataChanges) {
              if (!insertedAndUpdatedMappedToTable[change.table])
                insertedAndUpdatedMappedToTable[change.table] = {
                  insertedRows: [],
                  updatedRows: [],
                };

              await Promise.all(
                change.rows.map((row) =>
                  extractSwapMappingAndReplaceFksFromRow(
                    insertedAndUpdatedMappedToTable,
                    row,
                    change,
                    foreignKeyMap
                  )
                )
              );
            }

            span.setStatus({
              code: SPAN_STATUS_OK,
              message: "Extracted updated and inserted rows from data changes",
            });

            return new Ok(insertedAndUpdatedMappedToTable);
          } catch (error) {
            span.setStatus({
              code: SPAN_STATUS_ERROR,
              message:
                "Failed to extract the updated and inserted rows from data changes",
            });
            return new Err(
              new FailedToExtractUpdatedAndInsertedRowsFromDataChanges()
            );
          }
        }
      )
  );
