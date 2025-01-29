import { db } from "../../../infra/db/db";
import { syncProcessTransactionsByUserId } from "./get_sync_process_transaction_by_user_id";

export const addSyncProcessTransactionByUserId = async (
  userId: number,
  database: string
) => {
  const transactionCentral = await db.startTransaction("ambisis");
  const transactionClient = await db.startTransaction(database);
  syncProcessTransactionsByUserId.set(userId, {
    transactionClient,
    transactionCentral,
  });
  return { transactionCentral, transactionClient };
};
