import { Err, Ok, type Result } from "void-ts";
import { FailedToEnableForeignKeyChecks } from "./error/error";
import { startSpan, withActiveSpan, type Span } from "@sentry/node";
import { log, LogLevel } from "ambisis_node_helper";
import { SPAN_STATUS_ERROR, SPAN_STATUS_OK } from "@sentry/core";
import type { Transaction } from "mysql-all-in-one/DataAccessObject/types";

export const enableForeignKeysCheck = async (
  tx: Transaction,
  span: Span
): Promise<Result<[], FailedToEnableForeignKeyChecks>> =>
  withActiveSpan(
    span,
    async () =>
      await startSpan(
        { name: "trigger.push_changes.enable_foreign_keys_checks" },
        async (span) => {
          try {
            await tx.query("SET FOREIGN_KEY_CHECKS = 0");
            span.setStatus({
              code: SPAN_STATUS_OK,
              message: "enabled foreign key checks",
            });
            return new Ok([]);
          } catch (error) {
            span.setStatus({
              code: SPAN_STATUS_ERROR,
              message: "Failed to enable foreign key checks",
            });
            log(
              ` Failed to enable foreign key checks - ${error} - enable_foreign_keys_check.ts`,
              LogLevel.ERROR
            );
            return new Err(new FailedToEnableForeignKeyChecks());
          }
        }
      )
  );
