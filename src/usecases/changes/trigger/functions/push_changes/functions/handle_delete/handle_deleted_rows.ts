import type { Span } from "@sentry/core";
import { captureException, startSpan, withActiveSpan } from "@sentry/node";
import { handleDeleteForRow } from "./handle_delete_row_for_table";
import { Err, Ok, type Result } from "void-ts";
import { FailedToHandleDeletedRows } from "./errors/failed_to_handle_deleted_rows";
import type { Transaction } from "mysql-all-in-one/DataAccessObject/types";
import type { Deleted } from "../../../../types/trigger_request";

export const handleDeletedRows = async (
  tx: Transaction,
  span: Span,
  deleted: Deleted
): Promise<Result<[], FailedToHandleDeletedRows>> =>
  await withActiveSpan(span, async () =>
    startSpan(
      { name: "trigger.push_changes.handle_deleted_rows" },
      async (span) => {
        const deletedRows = await Promise.all(
          deleted.map((row) => handleDeleteForRow(tx, span, row))
        );
        const failedRows = deletedRows
          .filter((deletedRow) =>
            deletedRow.match({
              isErr: ({ ids, error, table }) => {
                span.setAttributes({ ids, table });
                captureException(error, (scope) => {
                  scope.setTransactionName("trigger.handle_deleted_rows");
                  scope.setTags({ table });
                  return scope;
                });
                return true;
              },
              isOk: () => false,
            })
          )
          .map((row) => row.unwrapErr());
        if (failedRows.length > 0)
          return new Err(new FailedToHandleDeletedRows(failedRows));
        return new Ok([]);
      }
    )
  );
