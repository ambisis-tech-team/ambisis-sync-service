import { log } from "ambisis_node_helper";
import { getSyncProcessByUser } from "../../../domain/process_sync/functions/db/get_sync_process_by_user";
import { isProcessSyncStuck } from "../../../domain/process_sync/functions/domain/is_process_stuck";
import {
  removeSyncProcessTransactionByUserId,
  syncProcessTransactionsByUserId,
} from "../../../usecases/changes/functions/get_sync_process_transaction_by_user_id";
import { Time } from "../../../shared/types/time";

const clearStuckSyncProcesses = async () => {
  log(`Cleaning sync processes`);
  await Promise.all(
    Array.from(syncProcessTransactionsByUserId.entries()).map(
      async ([userId, { transactionCentral, transactionClient }]) => {
        const syncProcess = await getSyncProcessByUser(userId);
        if (isProcessSyncStuck(syncProcess)) {
          try {
            await transactionCentral.rollback();
            await transactionClient.rollback();
            removeSyncProcessTransactionByUserId(userId);
          } catch (error) {
            log(`Failed to rollback stuck sync process  - ${error}`);
          }
        }
      }
    )
  );
};

setInterval(clearStuckSyncProcesses, Time.MINUTE * 5);

clearStuckSyncProcesses();

export default {};
