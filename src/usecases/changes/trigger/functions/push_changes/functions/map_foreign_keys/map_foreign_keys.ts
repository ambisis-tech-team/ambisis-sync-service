import { Err, Ok, type AssertError, type Result } from "void-ts";
import type { MappedForeignKeys } from "./types/mapped_foreign_keys";
import { FailedToMapForeignKeys } from "./error/failed_to_map_foreign_keys";
import type { GetForeignKeysError } from "./functions/error/get_foreign_keys_error";
import { getForeignKeys } from "./functions/get_foreign_keys";
import { log, LogLevel } from "ambisis_node_helper";
import { startSpan, withActiveSpan, type Span } from "@sentry/node";
import { SPAN_STATUS_ERROR, SPAN_STATUS_OK } from "@sentry/core";

export const mapForeignKeys = async (
  span: Span,
  database: string
): Promise<
  Result<
    MappedForeignKeys,
    FailedToMapForeignKeys | GetForeignKeysError | AssertError
  >
> =>
  await withActiveSpan(
    span,
    async () =>
      await startSpan(
        { name: "trigger.push_changes.map_foreign_keys" },
        async (span) => {
          try {
            const foreignKeys = await getForeignKeys(span, database);
            return foreignKeys.match({
              isErr: (error) => {
                span.setStatus({
                  code: SPAN_STATUS_ERROR,
                  message: "Failed to map foreign keys",
                });
                span.setAttributes({ error: error.message });
                return new Err(error);
              },
              isOk: (foreignKeys) => {
                const mappedForeignKeys = foreignKeys.reduce<MappedForeignKeys>(
                  (acc, curr) => {
                    if (!acc[curr.parentTable]) acc[curr.parentTable] = [];
                    acc[curr.parentTable].push({
                      parentColumn: curr.parentColumn,
                      referencedTable: curr.referencedTable,
                      referencedColumn: curr.referencedColumn,
                    });
                    return acc;
                  },
                  {}
                );
                span.setStatus({
                  code: SPAN_STATUS_OK,
                  message: "Mapped foreign keys",
                });
                return new Ok(mappedForeignKeys);
              },
            });
          } catch (error) {
            const err = new FailedToMapForeignKeys();
            span.setStatus({
              code: SPAN_STATUS_ERROR,
              message: "Failed to map foreign keys",
            });
            span.setAttributes({ error: err.message });
            log(
              ` Failed to map foreign keys - ${error} - map_foreign_keys.ts`,
              LogLevel.ERROR
            );
            return new Err(err);
          }
        }
      )
  );
