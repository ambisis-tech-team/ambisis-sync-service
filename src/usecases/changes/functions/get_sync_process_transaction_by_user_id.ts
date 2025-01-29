import type { Transaction } from "mysql-all-in-one/DataAccessObject/types";
import { ExpectedToFindTransactionLinkedToUserId } from "./error/expected_to_find_transaction_linked_to_user_id";

export const syncProcessTransactionsByUserId = new Map<
  number,
  {
    transactionClient: Transaction;
    transactionCentral: Transaction;
  }
>();

export const getSyncProcessTransactionByUserId = (userId: number) => {
  const txn = syncProcessTransactionsByUserId.get(userId);

  if (!txn) throw new ExpectedToFindTransactionLinkedToUserId();
  return txn;
};

export const removeSyncProcessTransactionByUserId = (userId: number) => {
  console.log(syncProcessTransactionsByUserId.keys());
  syncProcessTransactionsByUserId.delete(userId);
};
