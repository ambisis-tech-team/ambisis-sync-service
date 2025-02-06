import { ProcessSyncStatus, type ProcessSync } from "../../types/sync_process";

export const hasFailed = (processSync: ProcessSync) =>
  processSync.status === ProcessSyncStatus.ERROR;
