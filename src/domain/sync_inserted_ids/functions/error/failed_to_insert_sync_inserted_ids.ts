export class FailedToInsertSyncInsertedIds extends Error {
  constructor() {
    super("Failed to insert sync inserted ids");
  }
}
