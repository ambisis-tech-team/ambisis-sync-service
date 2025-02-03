import { log, LogLevel } from "ambisis_node_helper";
import { assert, AssertError, Err, Ok, type Result } from "void-ts";
import {
  isSyncInsertedIdsArray,
  type SyncInsertIdsArray,
} from "../types/sync_inserted_id";
import { FailedToGetSyncInsertedIds } from "./error/failed_to_get_sync_inserted_ids";
import type { DataAccessObject } from "mysql-all-in-one";
import { isObjectArray } from "../../../shared/functions/is_object_array";

export const getSyncInsertedIdsBySyncId = async (
  db: DataAccessObject,
  syncId: string
): Promise<
  Result<SyncInsertIdsArray, FailedToGetSyncInsertedIds | AssertError>
> => {
  try {
    const syncInsertedIds = await db.select(
      {
        from: "sync_inserted_ids",
        where: { sync_id: syncId },
        columns: [
          "id",
          "table",
          "sync_id syncId",
          "web_id webId",
          "mobile_id mobileId",
          "is_central_table isCentralTable",
        ],
      },
      { database: "ambisis" }
    );
    if (!syncInsertedIds) return new Ok([]);
    assert(isObjectArray(syncInsertedIds), "syncInsertedIds is not an array");
    assert(
      isSyncInsertedIdsArray(syncInsertedIds),
      "syncInsertedIds is not a SyncInsertIdsArray"
    );
    return new Ok(syncInsertedIds);
  } catch (error) {
    if (error instanceof AssertError) return new Err(error);
    log(
      `Unexpected error while trying to get sync inserted ids - syncId: ${syncId}`,
      LogLevel.INFO
    );
    return new Err(new FailedToGetSyncInsertedIds());
  }
};
