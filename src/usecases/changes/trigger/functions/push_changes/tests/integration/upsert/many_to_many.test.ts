import type { Transaction } from "mysql-all-in-one/DataAccessObject/types";
import type { DataChanges } from "../../../../../types/trigger_request";
import {
  EXPECTED_QUERY_CONTENTS_MESSAGE_IN_BOARD,
  prepareDatabaseForManyToManyMock,
} from "../mocks/many_to_many_mock";
import { startSpan } from "@sentry/node";
import { pushChanges } from "../../../push_changes";
import {
  MAPPED_FOREIGN_KEYS,
  SyncContext,
} from "../../../../utils/sync_context";
import { describe, it, expect, beforeAll, afterAll } from "vitest";

describe("Should correctly insert items with many to many relations", () => {
  let tx: Transaction;
  let MOCK: DataChanges;

  beforeAll(async () => {
    if (!SyncContext.db) throw new Error("Database was not initialized");
    tx = await SyncContext.db.startTransaction(SyncContext.database);
    MOCK = await prepareDatabaseForManyToManyMock(tx);
  });

  afterAll(async () => {
    await tx.rollback();
  });

  it("Should test the push function for the many to many relations", async () =>
    await startSpan({ name: "Test" }, async (span) => {
      if (!SyncContext.database)
        throw new Error("Database was not initialized");
      const pushedChanges = await pushChanges(
        tx,
        span,
        MOCK,
        [],
        MAPPED_FOREIGN_KEYS,
        SyncContext.database
      );
      expect(pushedChanges.isOk()).toBe(true);
      const resultMessagesOnBoard = await tx.query(
        "SELECT CONCAT(b.name, ' => ', m.name) name FROM message_in_board mib INNER JOIN message m ON mib.messageId = m.id INNER JOIN board b ON mib.boardId = b.id"
      );
      if (!Array.isArray(resultMessagesOnBoard))
        throw new Error("Invalid result");
      expect(resultMessagesOnBoard.length).toBe(16);
      resultMessagesOnBoard.forEach((message, index) => {
        expect(message.name).toBe(
          EXPECTED_QUERY_CONTENTS_MESSAGE_IN_BOARD[index].name
        );
      });
    }));
});
