import { Time } from "../../../../shared/types/time";
import { ProcessSyncStatus, type ProcessSync } from "../../types/sync_process";

/**
 * Checks if the process is processing and the last sync is less than the updated at date and
 * the updated at date is more than 5 minutes ago
 *
 * @param processSync The process sync from the user to check if it is stuck
 * @returns true if the process sync is stuck
 */
export const isProcessSyncStuck = (processSync: ProcessSync): boolean =>
  processSync.status === ProcessSyncStatus.PROCESSING &&
  (processSync.lastSync == null ||
    (processSync.lastSync !== null &&
      processSync.lastSync.getTime() < processSync.updatedAt.getTime() &&
      processSync.updatedAt.getTime() - new Date().getTime() > Time.MINUTE));
