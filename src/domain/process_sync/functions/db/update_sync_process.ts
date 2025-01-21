import { log, LogLevel } from "ambisis_node_helper";
import { FailedToInsertSyncProcess } from "./error/failed_to_insert_sync_process";
import type { ProcessSyncUpdate } from "../../types/sync_process";
import { db } from "../../../../infra/db/db";

export const updateSyncProcess = async (
  syncProcess: ProcessSyncUpdate
): Promise<void> => {
  try {
    await db.update(
      "process_sync",
      {
        user_id: syncProcess.userId,
        last_sync: syncProcess.lastSync,
        status: syncProcess.status,
        updated_at: new Date(),
      },
      { id: syncProcess.id },
      { database: "ambisis" }
    );
  } catch (error) {
    log(
      ` Failed to insert sync process - ${error} insert_sync_process.ts`,
      LogLevel.ERROR
    );
    throw new FailedToInsertSyncProcess();
  }
};
