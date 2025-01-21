import { log, LogLevel } from "ambisis_node_helper";
import { FailedToInsertSyncProcess } from "./error/failed_to_insert_sync_process";
import { assert } from "void-ts";
import type { ProcessSyncInsert } from "../../types/sync_process";
import { db } from "../../../../infra/db/db";

export const insertSyncProcess = async (
  syncProcess: ProcessSyncInsert
): Promise<number> => {
  try {
    const syncProcessId = await db.insert(
      "process_sync",
      {
        user_id: syncProcess.userId,
        last_sync: syncProcess.lastSync,
        status: syncProcess.status,
      },
      { database: "ambisis" }
    );
    assert(
      typeof syncProcessId === "number",
      "sync_process_id must be a number"
    );
    return syncProcessId;
  } catch (error) {
    log(
      ` Failed to insert sync process - ${error} insert_sync_process.ts`,
      LogLevel.ERROR
    );
    throw new FailedToInsertSyncProcess();
  }
};
