import { log, LogLevel } from "ambisis_node_helper";
import { assert, AssertError, Err, Ok, type Result } from "void-ts";
import { GetForeignKeysError } from "./error/get_foreign_keys_error";
import { isForeignKeys, type ForeignKeys } from "./type/foreign_keys";
import { startSpan, withActiveSpan, type Span } from "@sentry/node";
import { SPAN_STATUS_ERROR, SPAN_STATUS_OK } from "@sentry/core";
import { db } from "../../../../../../../../infra/db/db";

export const getForeignKeys = async (
  span: Span,
  database: string
): Promise<Result<ForeignKeys, GetForeignKeysError | AssertError>> =>
  await withActiveSpan(
    span,
    async () =>
      await startSpan(
        { name: "trigger.push_changes.map_foreign_keys.get_foreign_keys" },
        async (span) => {
          try {
            const result = await db.query(
              `
							SELECT 
								kcu.TABLE_NAME AS parentTable,
								kcu.COLUMN_NAME AS parentColumn,
								kcu.REFERENCED_TABLE_NAME AS referencedTable,
								kcu.REFERENCED_COLUMN_NAME AS referencedColumn
							FROM 
								INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS kcu
							WHERE 
								kcu.REFERENCED_TABLE_NAME IS NOT NULL
								AND kcu.TABLE_SCHEMA = "?"
							ORDER BY 
								kcu.TABLE_NAME, kcu.COLUMN_NAME;
						`.replace("?", database),
              database
            );
            assert(isForeignKeys(result), "Failed to get foreign keys");
            span.setStatus({
              code: SPAN_STATUS_OK,
              message: "Succesfuly obtained foreign keys",
            });
            return new Ok(result);
          } catch (error) {
            span.setStatus({
              code: SPAN_STATUS_ERROR,
              message: "Failed to get foreign keys",
            });
            span.setAttributes({ database });
            if (error instanceof AssertError) return new Err(error);
            log(
              ` Failed to get foreign keys - ${error} - get_foreign_keys.ts`,
              LogLevel.ERROR
            );
            return new Err(new GetForeignKeysError());
          }
        }
      )
  );
