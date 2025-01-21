import { Err, Ok, type Result } from "void-ts";
import { FailedToDisabledForeignKeyChecks } from "./error/error";
import { startSpan, withActiveSpan, type Span } from "@sentry/node";
import { log, LogLevel } from "ambisis_node_helper";
import { SPAN_STATUS_ERROR, SPAN_STATUS_OK } from "@sentry/core";
import type { Transaction } from "mysql-all-in-one/DataAccessObject/types";

export const disableForeignKeysCheck = async (
  tx: Transaction,
  span: Span
): Promise<Result<[], FailedToDisabledForeignKeyChecks>> =>
  withActiveSpan(
    span,
    async () =>
      await startSpan(
        { name: "trigger.push_changes.disable_foreign_keys_checks" },
        async (span) => {
          try {
            await tx.query("SET FOREIGN_KEY_CHECKS = 0");
            span.setStatus({
              code: SPAN_STATUS_OK,
              message: "Disabled foreign key checks",
            });
            return new Ok([]);
          } catch (error) {
            span.setStatus({
              code: SPAN_STATUS_ERROR,
              message: "Failed to disable foreign key checks",
            });
            log(
              ` Failed to disable foreign key checks - ${error} - disable_foreign_keys_check.ts`,
              LogLevel.ERROR
            );
            return new Err(new FailedToDisabledForeignKeyChecks());
          }
        }
      )
  );
