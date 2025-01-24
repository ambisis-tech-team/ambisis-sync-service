import { syncProcessTransactionsByUserId } from "./get_sync_process_transaction_by_user_id";

export const doesUserHaveTransaction = (userId: number) => {
  const txn = syncProcessTransactionsByUserId.get(userId);

  return !!txn;
};
