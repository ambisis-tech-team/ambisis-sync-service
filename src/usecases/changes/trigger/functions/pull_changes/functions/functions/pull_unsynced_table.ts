import { log, LogLevel } from "ambisis_node_helper";
import { assert, Err, Ok, type Result } from "void-ts";
import {
  FailedToPullUnsycedTable,
  type FailedToGetTableColumns,
} from "./error/error";
import type { MappedForeignKeys } from "../../../push_changes/functions/map_foreign_keys/types/mapped_foreign_keys";
import { getColumnsSelectFromColumnNamesAndForeignKeyMappings } from "./get_columns_select_from_column_names_and_foreign_key_mapping";
import { getTableColumns } from "./get_table_columns";
import type { Transaction } from "mysql-all-in-one/DataAccessObject/types";
import { isObjectArray } from "../../../../../../../shared/functions/object_array";

export const pullUnsyncedTables = async (
  tx: Transaction,
  table: string,
  database: string,
  foreignKeys: MappedForeignKeys
): Promise<
  Result<
    { table: string; data: Record<string, unknown>[] },
    FailedToPullUnsycedTable | FailedToGetTableColumns
  >
> => {
  try {
    const columnsResult = await getTableColumns(tx, database, table);
    if (columnsResult.isErr()) return new Err(columnsResult.unwrapErr());
    const tableColumnNames = columnsResult
      .unwrap()
      .map((column) => column.columnName);
    const selectedColumns =
      getColumnsSelectFromColumnNamesAndForeignKeyMappings(
        table,
        foreignKeys,
        tableColumnNames
      );
    const data = await tx.select({ from: table, columns: selectedColumns });
    assert(isObjectArray(data), "Should always be an object array");
    return new Ok({ table, data });
  } catch (error) {
    log(
      ` Failed to pull unsynced tables - ${error} - pull_unsynced_tables.ts`,
      LogLevel.ERROR
    );
    return new Err(new FailedToPullUnsycedTable());
  }
};
