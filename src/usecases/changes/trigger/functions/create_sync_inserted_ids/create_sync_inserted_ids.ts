import { log, LogLevel } from "ambisis_node_helper";
import type { InsertedIdsByTable } from "../push_changes/functions/types/inserted_ids_by_table";
import { Err, Ok, type Result } from "void-ts";
import { FailedToCreateSyncInsertedIds } from "./error/failed_to_create_sync_inserted_ids";
import { insertedSyncInsertedIds } from "../../../../../domain/sync_inserted_ids/functions/insert_sync_inserted_ids";
import type { DataAccessObject } from "mysql-all-in-one";
import type { Span } from "@sentry/core";
import { ambisisSpan } from "../../../../../shared/functions/ambisis_span";

export const createSyncInsertedIds = async (
  db: DataAccessObject,
  span: Span,
  syncId: string,
  clientInsertedIds: InsertedIdsByTable,
  centralInsertedIds: InsertedIdsByTable
): Promise<Result<[], FailedToCreateSyncInsertedIds>> => {
  try {
    await Promise.all(
      Object.entries(clientInsertedIds).map(async ([table, ids]) =>
        insertedSyncInsertedIds(
          db,
          Object.entries(ids).map(([mobileId, webId]) => ({
            mobileId: Number(mobileId),
            webId,
            table,
            syncId,
            isCentralTable: false,
          }))
        )
      )
    );

    await Promise.all(
      Object.entries(centralInsertedIds).map(async ([table, ids]) =>
        insertedSyncInsertedIds(
          db,
          Object.entries(ids).map(([mobileId, webId]) => ({
            mobileId: Number(mobileId),
            webId,
            table,
            syncId,
            isCentralTable: true,
          }))
        )
      )
    );
    return new Ok([]);
  } catch (error) {
    ambisisSpan(
      span,
      { status: "error" },
      {
        message: `Failed to inserted created sync inserted ids - ${error} - ${syncId}`,
      }
    );
    log(
      `Failed to inserted created sync inserted ids - ${error} - ${syncId}`,
      LogLevel.ERROR
    );
    return new Err(new FailedToCreateSyncInsertedIds());
  }
};
