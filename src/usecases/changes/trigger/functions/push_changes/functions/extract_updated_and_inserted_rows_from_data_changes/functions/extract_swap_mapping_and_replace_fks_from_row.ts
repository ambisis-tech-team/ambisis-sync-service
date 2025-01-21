import { option } from "void-ts";
import { isNullOrReferencingSyncedRow } from "./is_null_or_referencing_synced_row";
import type { InsertedAndUpdatedChangesMappedToTable } from "../types/inserted_and_updated_changes_mapped_to_table";
import type { DataChanges } from "../../../../../types/trigger_request";
import { isRowSynced } from "./is_row_synced";
import type { MappedForeignKeys } from "../../map_foreign_keys/types/mapped_foreign_keys";
import { guessIfColumnIsForeignKey } from "../../../../guess_if_column_is_foreign_key/guess_if_column_is_foreign_key";

export const extractSwapMappingAndReplaceFksFromRow = async (
  acc: InsertedAndUpdatedChangesMappedToTable,
  row: DataChanges[number]["rows"][number],
  iter: DataChanges[number],
  foreignKeyMap: MappedForeignKeys
) =>
  new Promise<void>((resolve) => {
    const swapMapping = new Map<string, number>();
    const foreignKeys = option(foreignKeyMap[iter.table]);
    const rowToMap = foreignKeys.match({
      isSome: (foreignKeys) => {
        foreignKeys.forEach((foreignKey) => {
          if (
            foreignKey.parentColumn === "ufId" ||
            foreignKey.parentColumn === "cidadeId" ||
            foreignKey.parentColumn === "estadoId"
          )
            return;
          const referencedColumn = row[foreignKey.parentColumn];
          if (typeof referencedColumn !== "number") return;
          if (isNullOrReferencingSyncedRow(referencedColumn)) {
            row[foreignKey.parentColumn] = Math.abs(referencedColumn);
            return;
          }
          swapMapping.set(foreignKey.parentColumn, referencedColumn);
          row[foreignKey.parentColumn] = -1;
        });
        const rowWithoutForeignKeys = Object.entries(row).filter(
          ([column]) => !foreignKeys.some((fk) => fk.parentColumn === column)
        );
        for (const [column, value] of rowWithoutForeignKeys) {
          if (guessIfColumnIsForeignKey(column)) {
            if (typeof value !== "number") continue;
            if (isNullOrReferencingSyncedRow(value)) {
              row[column] = Math.abs(value);
              continue;
            }
            swapMapping.set(column, value);
            row[column] = -1;
          }
        }
        return row;
      },
      isNone: () => {
        for (const [column, value] of Object.entries(row)) {
          if (guessIfColumnIsForeignKey(column)) {
            if (typeof value !== "number") continue;
            if (isNullOrReferencingSyncedRow(value)) {
              row[column] = Math.abs(value);
              continue;
            }
            swapMapping.set(column, value);
            row[column] = -1;
          }
        }
        return row;
      },
    });

    if (isRowSynced(rowToMap)) {
      acc[iter.table].updatedRows.push({ data: rowToMap, swapMapping });
      resolve();
      return;
    }
    acc[iter.table].insertedRows.push({ data: rowToMap, swapMapping });
    resolve();
  });
