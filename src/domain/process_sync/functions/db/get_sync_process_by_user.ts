import { log } from "ambisis_node_helper";
import { FailedToGetSyncProcessByUserId } from "./error/failed_to_get_sync_process_by_user";
import {
  isProcessSync,
  ProcessSyncStatus,
  type ProcessSync,
} from "../../types/sync_process";
import { assert, AssertError } from "void-ts";
import { insertSyncProcess } from "./insert_sync_process";
import { db } from "../../../../infra/db/db";
import { isObject } from "../../../../shared/functions/is_object";

/**
 * Obtains the currently running sync process for the user
 * If noone is found it will insert it and return the new one
 * @param userId User identifier for user request sync
 * @param database User database
 * @throws {FailedToGetSyncProcessByUserId} Failed to get sync process by user id
 */
export const getSyncProcessByUser = async (
  userId: number
): Promise<ProcessSync> => {
  try {
    const syncProcess = await db.select(
      { from: "process_sync", where: { user_id: userId } },
      { database: "ambisis", returnMode: "firstRow" }
    );
    if (!syncProcess) {
      await insertSyncProcess({
        userId,
        status: ProcessSyncStatus.FINISHED,
        lastSync: null,
      });
      return getSyncProcessByUser(userId);
    }
    assert(isObject(syncProcess), "sync_process must be an object");
    const formattedValue = {
      ...syncProcess,
      lastSync: syncProcess.last_sync,
      updatedAt: syncProcess.updated_at,
      createdAt: syncProcess.created_at,
      userId: syncProcess.user_id,
    };
    assert(isProcessSync(formattedValue), "sync_process must be a ProcessSync");
    return formattedValue;
  } catch (error) {
    if (error instanceof AssertError) throw error;
    log(
      ` Failed to obtain current sync process running for user - ${userId} - ${error}`
    );
    throw new FailedToGetSyncProcessByUserId();
  }
};
