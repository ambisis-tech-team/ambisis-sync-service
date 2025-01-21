import { handleDeletedRows } from "../../functions/handle_delete/handle_deleted_rows";
import { startSpan } from "@sentry/node";
import {
  DELETED_MOCK,
  setupItemsToBeDeleted,
} from "./mocks/setup_items_to_be_deleted";
import type { Transaction } from "mysql-all-in-one/DataAccessObject/types";
import { SyncContext } from "../../../utils/sync_context";
import { describe, it, expect, beforeAll, afterAll } from "vitest";

describe("The delete functionality of the push changes function", () => {
  let tx: Transaction;

  beforeAll(async () => {
    if (!SyncContext.db) throw new Error("Database was not initialized");
    tx = await SyncContext.db.startTransaction(SyncContext.database);
    await setupItemsToBeDeleted(tx);
  });

  afterAll(async () => {
    await tx.rollback();
  });

  it("should delete all rows given from the central database", async () =>
    startSpan({ name: "test" }, async (span) => {
      const deletedRows = await handleDeletedRows(tx, span, DELETED_MOCK);
      expect(deletedRows.isOk()).toBe(true);
    }));
});
