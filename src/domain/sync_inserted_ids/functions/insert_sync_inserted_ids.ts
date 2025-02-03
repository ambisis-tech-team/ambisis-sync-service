import type { SyncInsertIdsArrayInsert } from "../types/sync_inserted_id";
import { FailedToInsertSyncInsertedIds } from "./error/failed_to_insert_sync_inserted_ids";
import { log, LogLevel } from "ambisis_node_helper";
import type { DataAccessObject } from "mysql-all-in-one";

export const insertedSyncInsertedIds = async (
  db: DataAccessObject,
  values: SyncInsertIdsArrayInsert
) => {
  try {
    await db.insert(
      "sync_inserted_ids",
      values.map((value) => ({
        id: value.id,
        table: value.table,
        sync_id: value.syncId,
        web_id: value.webId,
        mobile_id: value.mobileId,
        is_central_table: value.isCentralTable,
      })),
      { database: "ambisis" }
    );
  } catch (error) {
    log(`Failed to inserted sync inserted ids - ${error}`, LogLevel.ERROR);
    throw new FailedToInsertSyncInsertedIds();
  }
};
