import { log, LogLevel } from "ambisis_node_helper";
import { getSyncProcessByUser } from "../../../domain/process_sync/functions/db/get_sync_process_by_user";
import { isProcessSyncStuck } from "../../../domain/process_sync/functions/domain/is_process_stuck";
import {
  removeSyncProcessTransactionByUserId,
  syncProcessTransactionsByUserId,
} from "../../../usecases/changes/functions/get_sync_process_transaction_by_user_id";
import { Time } from "../../../shared/types/time";
import { hasFailed } from "../../../domain/process_sync/functions/domain/has_failed";

const clearStuckSyncProcesses = async () => {
  log(`Cleaning sync processes`, LogLevel.INFO);
  const processes = Array.from(syncProcessTransactionsByUserId.entries());

  const stuckProcessesRemoved = processes.map(
    async ([userId, { transactionCentral, transactionClient }]) => {
      const syncProcess = await getSyncProcessByUser(userId);
      if (isProcessSyncStuck(syncProcess) || hasFailed(syncProcess)) {
        try {
          await transactionCentral.rollback();
          await transactionClient.rollback();
          removeSyncProcessTransactionByUserId(userId);
          log(`Rolled back stuck sync process - userId: ${userId}`);
        } catch (error) {
          log(`Failed to rollback stuck sync process - ${error} - ${userId}`);
        }
      }
    }
  );

  await Promise.allSettled(stuckProcessesRemoved);

  log(`Finished cleaning sync processes`, LogLevel.INFO);
  log(`Current active processes - ${processes.length}`, LogLevel.INFO);
};

setInterval(clearStuckSyncProcesses, Time.MINUTE * 5);

clearStuckSyncProcesses();

export default {};
