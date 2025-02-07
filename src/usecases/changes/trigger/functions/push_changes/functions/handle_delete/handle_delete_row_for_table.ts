import { type Span } from "@sentry/node";
import { assert, Err, Ok, type Result } from "void-ts";
import { FailedToDeleteRow } from "./errors/failed_to_delete_row";
import type { Transaction } from "mysql-all-in-one/DataAccessObject/types";
import type { Deleted } from "../../../../types/trigger_request";
import { SPAN_STATUS_ERROR } from "@sentry/core";

export const handleDeleteForRow = async (
  tx: Transaction,
  span: Span,
  { table, ids }: Deleted[number]
): Promise<Result<number, FailedToDeleteRow>> => {
  try {
    if (!ids.length) return new Ok(0);
    const rowsDeleted = await tx.delete(table, {
      id: { in: ids.map(Math.abs) },
    });
    assert(rowsDeleted <= ids.length, "Deleted more rows than specified");
    span.setAttributes({ rowsDeleted, table, ids });
    return new Ok(rowsDeleted);
  } catch (error) {
    span.setStatus({ code: SPAN_STATUS_ERROR }).setAttributes({ table, ids });
    return new Err(new FailedToDeleteRow(error, table, ids));
  }
};
