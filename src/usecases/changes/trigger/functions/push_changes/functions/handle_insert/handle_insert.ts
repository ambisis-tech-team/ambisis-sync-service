import type { Transaction } from "mysql-all-in-one/DataAccessObject/types";
import type { InsertedAndUpdatedChangesMappedToTable } from "../extract_updated_and_inserted_rows_from_data_changes/types/inserted_and_updated_changes_mapped_to_table";
import { startSpan, withActiveSpan } from "@sentry/node";
import { SPAN_STATUS_ERROR, SPAN_STATUS_OK, type Span } from "@sentry/core";
import { assert, AssertError, Err, Ok, type Result } from "void-ts";
import { isInsertRows } from "mysql-all-in-one/QueryBuilder/insert/types";
import { log, LogLevel } from "ambisis_node_helper";
import { FailedToHandleInsert } from "./error/failed_to_handle_insert";
import { FailedToInsertRows } from "./error/failed_to_insert_rows";
import type { InsertedIdsByTable } from "../types/inserted_ids_by_table";
import { getTableColumns } from "../../../pull_changes/functions/functions/get_table_columns";
import { cleanRow } from "../clean_row/clean_row";
import { isNumberArray } from "../../../../../../../shared/functions/is_number_array";

export const handleInsert = async (
  tx: Transaction,
  span: Span,
  data: InsertedAndUpdatedChangesMappedToTable,
  database: string
): Promise<
  Result<
    InsertedIdsByTable,
    FailedToInsertRows | AssertError | FailedToHandleInsert
  >
> =>
  withActiveSpan(span, async () =>
    startSpan({ name: "trigger.push_changes.handle_insert" }, async (span) => {
      try {
        const insertedIds = await Promise.all(
          Object.entries(data).map(
            async ([table, { insertedRows }]): Promise<
              Result<InsertedIdsByTable, FailedToInsertRows>
            > => {
              if (insertedRows.length === 0) return new Ok({ [table]: {} });
              const tableCols = await getTableColumns(tx, database, table);
              if (tableCols.isErr())
                return new Err(new FailedToInsertRows(table, insertedRows));
              const tableColsMappedToColumnName = tableCols
                .unwrap()
                .map((col) => col.columnName);
              try {
                const insertData = insertedRows.map((row) =>
                  cleanRow(
                    { ...row.data, id: undefined },
                    tableColsMappedToColumnName
                  )
                );
                assert(
                  isInsertRows(insertData),
                  "Rows should always should be insert rows"
                );
                const insertedIds = await tx.insert(table, insertData);
                assert(
                  isNumberArray(insertedIds) &&
                    insertedIds.length === insertedRows.length,
                  "Ids should always be a number array"
                );
                const insertedIdsMappedToDataChangedId = insertedIds.reduce<
                  Record<number, number>
                >(
                  (acc, id, index) => ({
                    ...acc,
                    [insertedRows[index].data.id]: -id,
                  }),
                  {}
                );
                return new Ok({ [table]: insertedIdsMappedToDataChangedId });
              } catch (error) {
                span.setStatus({
                  code: SPAN_STATUS_ERROR,
                  message: `Failed to insert rows from table ${table}`,
                  [table]: JSON.stringify(insertedRows),
                });
                if (error instanceof AssertError) throw error;
                log(
                  ` Failed to handle insert of row - ${error} - ${table} - ${JSON.stringify(
                    insertedRows
                  )} - handle_insert.ts`,
                  LogLevel.ERROR
                );
                return new Err(new FailedToInsertRows(table, insertedRows));
              }
            }
          )
        );
        if (insertedIds.some((insertedIds) => insertedIds.isErr()))
          return new Err(new FailedToHandleInsert());
        span.setStatus({ code: SPAN_STATUS_OK, message: "Inserted rows" });
        const insertedIdsMappedToTable = insertedIds.reduce<InsertedIdsByTable>(
          (acc, insertedIds) => ({
            ...acc,
            ...insertedIds.unwrap(),
          }),
          {}
        );
        return new Ok(insertedIdsMappedToTable);
      } catch (error) {
        span.setStatus({
          code: SPAN_STATUS_ERROR,
          message: "Failed to handle insert",
        });
        if (error instanceof AssertError) return new Err(error);
        log(
          ` Failed to handle insert - ${error} - handle_insert.ts`,
          LogLevel.ERROR
        );
        return new Err(new FailedToHandleInsert());
      }
    })
  );
