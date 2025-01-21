export class ExpectedToFindTransactionLinkedToUserId extends Error {
  constructor() {
    super("Expected to find transaction linked to user id");
  }
}
