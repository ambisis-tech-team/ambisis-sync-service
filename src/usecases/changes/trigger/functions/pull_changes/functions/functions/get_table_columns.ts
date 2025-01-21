import { assert, Err, Ok, type Result } from "void-ts";
import { FailedToGetTableColumns } from "./error/error";
import {
  isTableColumnsNames,
  type TableColumnsNames,
} from "./types/table_columns_names";
import { log } from "ambisis_node_helper";
import type { Transaction } from "mysql-all-in-one/DataAccessObject/types";

export const getTableColumns = async (
  tx: Transaction,
  database: string,
  table: string
): Promise<Result<TableColumnsNames, FailedToGetTableColumns>> => {
  try {
    const columns = await tx.query(`
      SELECT 
				COLUMN_NAME as columnName
      FROM 
				INFORMATION_SCHEMA.COLUMNS
			WHERE
				TABLE_SCHEMA = "${database}"
				AND TABLE_NAME = "${table}";
    `);
    assert(isTableColumnsNames(columns), "Table columns names is invalid");
    return new Ok(columns);
  } catch (error) {
    log(` Failed to get table columns - ${error} - get_table_columns.ts`);
    return new Err(new FailedToGetTableColumns());
  }
};
