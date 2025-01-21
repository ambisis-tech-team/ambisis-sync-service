import { db } from "../../../infra/db/db";
import { syncProcessTransactionsByUserId } from "./get_sync_process_transaction_by_user_id";

export const addSyncProcessTransactionByUserId = async (
  userId: number,
  database: string
) => {
  const txn = {
    transactionClient: await db.startTransaction(database),
    transactionCentral: await db.startTransaction("ambisis"),
  };
  syncProcessTransactionsByUserId.set(userId, txn);
  return txn;
};
