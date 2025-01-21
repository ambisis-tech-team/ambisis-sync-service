import { startSpan, withActiveSpan } from "@sentry/node";
import type { Span } from "@sentry/core";
import type { Transaction } from "mysql-all-in-one/DataAccessObject/types";
import { Err, Ok, type Result } from "void-ts";
import { log, LogLevel } from "ambisis_node_helper";
import { FailedToSwapForeignKeys } from "./error/failed_to_swap_foreign_keys";
import { SPAN_STATUS_ERROR, SPAN_STATUS_OK } from "@sentry/core";
import type { MappedForeignKeys } from "../map_foreign_keys/types/mapped_foreign_keys";
import type { InsertedIdsByTable } from "../types/inserted_ids_by_table";
import type { InsertedAndUpdatedChangesMappedToTable } from "../extract_updated_and_inserted_rows_from_data_changes/types/inserted_and_updated_changes_mapped_to_table";
import { extractTableFromColumn } from "./functions/extract_table_from_column";
import { guessIfColumnIsForeignKey } from "../../../guess_if_column_is_foreign_key/guess_if_column_is_foreign_key";

export const swapForeignKeys = async (
  tx: Transaction,
  span: Span,
  dataChanges: InsertedAndUpdatedChangesMappedToTable,
  insertedIdsByTable: InsertedIdsByTable,
  foreignKeyMapping: MappedForeignKeys
): Promise<Result<[], FailedToSwapForeignKeys>> =>
  await withActiveSpan(
    span,
    async () =>
      await startSpan({ name: "trigger.push_changes." }, async (span) => {
        try {
          for (const [table, { insertedRows, updatedRows }] of Object.entries(
            dataChanges
          )) {
            for (const { data, swapMapping } of [
              ...insertedRows,
              ...updatedRows,
            ]) {
              const updatedColumns = new Map<string, number>();
              for (const [column, value] of swapMapping.entries()) {
                if (column === "id") {
                  const newId = insertedIdsByTable[table][data.id];
                  if (!newId) continue;
                  updatedColumns.set(column, Math.abs(newId));
                  continue;
                }
                const mappingFk = foreignKeyMapping[table];
                if (!mappingFk) {
                  if (guessIfColumnIsForeignKey(column)) {
                    const extractedTable = extractTableFromColumn(column);
                    if (!extractedTable) continue;
                    const fkToSwap = insertedIdsByTable[extractedTable][value];
                    if (!fkToSwap) continue;
                    updatedColumns.set(column, Math.abs(fkToSwap));
                    continue;
                  }
                  continue;
                }
                const fk = mappingFk.find((fk) => fk.parentColumn === column);
                if (!fk) continue;
                const fkToSwap = insertedIdsByTable[fk.referencedTable][value];
                if (!fkToSwap) continue;
                updatedColumns.set(column, Math.abs(fkToSwap));
              }

              try {
                const swappedFKs = Object.fromEntries(updatedColumns.entries());
                if (!Object.keys(swappedFKs).length) continue;
                if (data.id > 0) {
                  const newId = insertedIdsByTable[table][data.id];
                  if (!newId) continue;
                  await tx.update(table, swappedFKs, { id: Math.abs(newId) });
                  continue;
                }
                await tx.update(table, swappedFKs, { id: Math.abs(data.id) });
              } catch (error) {
                log(
                  ` Failed to swap foreign keys - ${error} - swap_foreign_keys.ts`,
                  LogLevel.ERROR
                );
                return new Err(new FailedToSwapForeignKeys());
              }
            }
          }
          span.setStatus({
            code: SPAN_STATUS_OK,
            message: "Swapped foreign keys",
          });
          return new Ok([]);
        } catch (error) {
          span.setStatus({
            code: SPAN_STATUS_ERROR,
            message: "Failed to swap foreign keys",
          });
          log(
            ` Failed to swap foreign keys - ${error} - swap_foreign_keys.ts`,
            LogLevel.ERROR
          );
          return new Err(new FailedToSwapForeignKeys());
        }
      })
  );
