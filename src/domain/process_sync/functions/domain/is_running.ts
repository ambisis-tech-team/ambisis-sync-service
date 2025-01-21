import { ProcessSyncStatus, type ProcessSync } from "../../types/sync_process";

export const isRunning = (processSync: ProcessSync): boolean => processSync.status === ProcessSyncStatus.PROCESSING;
