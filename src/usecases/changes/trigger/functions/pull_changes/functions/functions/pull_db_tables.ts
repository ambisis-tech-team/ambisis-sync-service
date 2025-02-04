import { assert, Err, Ok, type Result } from "void-ts";
import { FailedToPullTables } from "./error/error";
import { log, LogLevel } from "ambisis_node_helper";
import { getColumnsSelectFromColumnNamesAndForeignKeyMappings } from "./get_columns_select_from_column_names_and_foreign_key_mapping";
import type { MappedForeignKeys } from "../../../push_changes/functions/map_foreign_keys/types/mapped_foreign_keys";
import { getTableColumns } from "./get_table_columns";
import type { Transaction } from "mysql-all-in-one/DataAccessObject/types";
import { sqlExpression } from "mysql-all-in-one/QueryBuilder/sql_expression";
import { isObjectArray } from "../../../../../../../shared/functions/is_object_array";

export const pullDbTables = async (
  tx: Transaction,
  lastSyncDate: number,
  table: string,
  database: string,
  foreignKeyMap: MappedForeignKeys,
  opts: { isCentralDb: boolean; userDatabase?: string } = {
    isCentralDb: false,
  }
): Promise<
  Result<{ table: string; data: Record<string, unknown>[] }, FailedToPullTables>
> => {
  try {
    const columnsResult = await getTableColumns(tx, database, table);
    if (columnsResult.isErr()) return new Err(columnsResult.unwrapErr());
    const tableColumnNames = columnsResult
      .unwrap()
      .map((column) => column.columnName);
    const columns = getColumnsSelectFromColumnNamesAndForeignKeyMappings(
      table,
      foreignKeyMap,
      tableColumnNames
    );

    const { isCentralDb, userDatabase } = opts;
    if (isCentralDb && table === "cliente") {
      const data = await tx.select({
        from: table,
        where: [
          sqlExpression`UNIX_TIMESTAMP(modificacaoData) * 1000 >= ${lastSyncDate}`,
          sqlExpression`database = ${userDatabase}`,
        ],
        columns: columns,
      });
      assert(isObjectArray(data), "Should always be an object array");
      return new Ok({ table, data });
    }

    const data = await tx.select({
      from: table,
      where: [
        sqlExpression`UNIX_TIMESTAMP(modificacaoData) * 1000 >= ${lastSyncDate}`,
      ],
      columns: columns,
    });
    assert(isObjectArray(data), "Should always be an object array");
    return new Ok({ table, data });
  } catch (error) {
    log(
      ` Failed to pull tables - ${error} - pull_db_tables.ts`,
      LogLevel.ERROR
    );
    return new Err(new FailedToPullTables());
  }
};
