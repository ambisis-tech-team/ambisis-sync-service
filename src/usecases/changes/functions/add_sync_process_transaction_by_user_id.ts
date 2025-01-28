import { db } from "../../../infra/db/db";
import { syncProcessTransactionsByUserId } from "./get_sync_process_transaction_by_user_id";

export const addSyncProcessTransactionByUserId = async (
  userId: number,
  database: string
) => {
  try {
    console.log(`Starting transactions - ${syncProcessTransactionsByUserId}`);
    console.log("Starting transactions-central");
    const transactionCentral = await db.startTransaction("ambisis");
    console.log("Starting transactions-client");
    const transactionClient = await db.startTransaction(database);
    console.log("Starting transactions-set");
    syncProcessTransactionsByUserId.set(userId, {
      transactionCentral,
      transactionClient,
    });
    console.log("Starting transactions-return");
    return { transactionCentral, transactionClient };
  } catch (error) {
    console.error(error);
    throw error;
  }
};
