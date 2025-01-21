import { startSpan, withActiveSpan } from "@sentry/node";
import type { Transaction } from "mysql-all-in-one/DataAccessObject/types";
import type { DataChanges, Deleted } from "../../types/trigger_request";
import { extractUpdatedAndInsertedRowsFromDataChanges } from "./functions/extract_updated_and_inserted_rows_from_data_changes/extract_updated_and_inserted_rows_from_data_changes";
import { Err, Ok, type Result } from "void-ts";
import { log, LogLevel } from "ambisis_node_helper";
import { FailedToHandleChanges } from "./functions/error/failed_to_handle_changes";
import { handleUpdates } from "./functions/handle_updates/handle_updates";
import { SPAN_STATUS_ERROR, SPAN_STATUS_OK, type Span } from "@sentry/core";
import { handleInsert } from "./functions/handle_insert/handle_insert";
import { disableForeignKeysCheck } from "./functions/foreign_key_checks/disable_foreign_keys_check";
import { enableForeignKeysCheck } from "./functions/foreign_key_checks/enable_foreign_keys_check";
import { handleDeletedRows } from "./functions/handle_delete/handle_deleted_rows";
import { swapForeignKeys } from "./functions/swap_foreign_keys/swap_foreign_keys";
import type { InsertedIdsByTable } from "./functions/types/inserted_ids_by_table";
import type { MappedForeignKeys } from "./functions/map_foreign_keys/types/mapped_foreign_keys";

export const pushChanges = async (
  tx: Transaction,
  span: Span,
  dataChanges: DataChanges,
  deleted: Deleted,
  foreignKeys: MappedForeignKeys,
  database: string
): Promise<Result<InsertedIdsByTable, FailedToHandleChanges>> =>
  await withActiveSpan(
    span,
    async () =>
      await startSpan({ name: "trigger.push_changes" }, async (span) => {
        try {
          const updatedAndInsertedRowsFromDataChanges =
            await extractUpdatedAndInsertedRowsFromDataChanges(
              span,
              dataChanges,
              foreignKeys
            );
          if (updatedAndInsertedRowsFromDataChanges.isErr()) {
            const error = updatedAndInsertedRowsFromDataChanges.unwrapErr();
            log(
              ` failed to extract updated and inserted rows from changes - ${error.message} - push_changes.ts`,
              LogLevel.ERROR
            );
            span.setStatus({ code: SPAN_STATUS_ERROR, message: error.message });
            return updatedAndInsertedRowsFromDataChanges;
          }

          const disabledForeignKeyChecks = await disableForeignKeysCheck(
            tx,
            span
          );
          if (disabledForeignKeyChecks.isErr()) {
            const error = disabledForeignKeyChecks.unwrapErr();
            log(
              ` failed to disable foreign keys - ${error.message} - push_changes.ts`,
              LogLevel.ERROR
            );
            span.setStatus({ code: SPAN_STATUS_ERROR, message: error.message });
            return disabledForeignKeyChecks;
          }

          const insertedRows = await handleInsert(
            tx,
            span,
            updatedAndInsertedRowsFromDataChanges.unwrap(),
            database
          );
          if (insertedRows.isErr()) {
            const error = insertedRows.unwrapErr();
            log(
              ` failed to insert rows - ${error.message} - push_changes.ts`,
              LogLevel.ERROR
            );
            span.setStatus({ code: SPAN_STATUS_ERROR, message: error.message });
            return insertedRows;
          }

          const updatedRowsResult = await handleUpdates(
            tx,
            span,
            updatedAndInsertedRowsFromDataChanges.unwrap(),
            database
          );
          if (updatedRowsResult.isErr()) {
            const error = updatedRowsResult.unwrapErr();
            log(
              ` failed to update rows - ${error.message} - push_changes.ts`,
              LogLevel.ERROR
            );
            span.setStatus({ code: SPAN_STATUS_ERROR, message: error.message });
            return updatedRowsResult;
          }

          const deletedRows = await handleDeletedRows(tx, span, deleted);
          if (deletedRows.isErr()) {
            const error = deletedRows.unwrapErr();
            log(
              ` failed to delete rows - ${error.message} - push_changes.ts`,
              LogLevel.ERROR
            );
            span.setStatus({ code: SPAN_STATUS_ERROR, message: error.message });
            return deletedRows;
          }

          const swappedForeignKeys = await swapForeignKeys(
            tx,
            span,
            updatedAndInsertedRowsFromDataChanges.unwrap(),
            insertedRows.unwrap(),
            foreignKeys
          );
          if (swappedForeignKeys.isErr()) {
            const error = swappedForeignKeys.unwrapErr();
            log(
              ` failed to swap foreign keys ${error.message} - push_changes.ts`,
              LogLevel.ERROR
            );
            span.setStatus({ code: SPAN_STATUS_ERROR, message: error.message });
            return swappedForeignKeys;
          }

          const enabledForeignKeyChecks = await enableForeignKeysCheck(
            tx,
            span
          );
          if (enabledForeignKeyChecks.isErr()) {
            const error = enabledForeignKeyChecks.unwrapErr();
            log(
              ` failed to re enable foreign key checks in transaction ${error.message} - push_changes.ts`,
              LogLevel.ERROR
            );
            span.setStatus({ code: SPAN_STATUS_ERROR, message: error.message });
            return enabledForeignKeyChecks;
          }

          span.setStatus({ code: SPAN_STATUS_OK, message: "Handled changes" });

          return new Ok(insertedRows.unwrap());
        } catch (error) {
          span.setStatus({
            code: SPAN_STATUS_ERROR,
            message: "Failed to handle changes",
          });
          log(
            ` Failed to handle changes - ${error} - push_changes.ts`,
            LogLevel.ERROR
          );
          return new Err(new FailedToHandleChanges());
        }
      })
  );
