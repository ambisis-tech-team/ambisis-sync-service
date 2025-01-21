import { assert, Err, Ok, type Result } from "void-ts";
import { FailedToPullDeletedRows } from "./error/error";
import { log, LogLevel } from "ambisis_node_helper";
import { isDeletedRowQuery } from "./types/deleted_row_query";
import type { Deleted } from "../../../../types/trigger_request";
import type { Transaction } from "mysql-all-in-one/DataAccessObject/types";
import { sqlExpression } from "mysql-all-in-one/QueryBuilder/sql_expression";

export const pullDeletedRows = async (
  tx: Transaction,
  lastSyncDate: number
): Promise<Result<Deleted, FailedToPullDeletedRows>> => {
  try {
    const deletedRows = await tx.select({
      from: "exclusao_log",
      columns: {
        itemId: sqlExpression`(itemId * -1)`,
        tabelaExclusao: "tabelaExclusao",
      },
      where: [
        sqlExpression`UNIX_TIMESTAMP(dataExclusao) * 1000 >= ${lastSyncDate}`,
      ],
    });
    assert(isDeletedRowQuery(deletedRows), "Should always be an object array");
    const groupedByTableDeletedRows = deletedRows.reduce<Deleted>(
      (acc, iter) => {
        const tableEntryIndex = acc.findIndex(
          (entry) => entry.table === iter.tabelaExclusao
        );
        if (tableEntryIndex >= 0) {
          acc[tableEntryIndex].ids.push(iter.itemId);
        } else {
          acc.push({ table: iter.tabelaExclusao, ids: [iter.itemId] });
        }
        return acc;
      },
      []
    );
    return new Ok(groupedByTableDeletedRows);
  } catch (error) {
    log(
      ` Failed to pull deleted rows - ${error} - pull_deleted_rows.ts`,
      LogLevel.ERROR
    );
    return new Err(new FailedToPullDeletedRows());
  }
};
