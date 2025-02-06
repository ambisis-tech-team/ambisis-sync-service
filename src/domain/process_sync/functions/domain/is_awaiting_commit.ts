import { ProcessSyncStatus, type ProcessSync } from "../../types/sync_process";

export const isAwaitingCommit = (processSync: ProcessSync): boolean =>
  processSync.status === ProcessSyncStatus.AWAIT_COMMIT;
