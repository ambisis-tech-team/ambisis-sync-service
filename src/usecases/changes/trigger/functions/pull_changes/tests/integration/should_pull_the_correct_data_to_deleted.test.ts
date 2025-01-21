import { pullDeletedRows } from "../../functions/functions/pull_deleted_rows";
import { setupDeletedItemsToTestPull } from "./mocks/setup_deleted_items_to_test_pull";
import { sub } from "date-fns";
import type { Transaction } from "mysql-all-in-one/DataAccessObject/types";
import { SyncContext, TABLES } from "../../../utils/sync_context";
import { describe, it, expect, beforeAll, afterAll } from "vitest";

describe("Should test pulling the deleted items to be synced", () => {
  let tx: Transaction;

  beforeAll(async () => {
    if (!SyncContext.db) throw new Error("Database was not initialized");
    tx = await SyncContext.db.startTransaction(SyncContext.database);
    await setupDeletedItemsToTestPull(tx);
  });

  afterAll(async () => {
    await tx.rollback();
  });

  it("Should pull the correct data to be deleted", async () => {
    const LAST_SYNC_DATE_MOCK = sub(new Date(), { months: 1 }).getTime();
    if (!SyncContext.database) throw new Error("Database was not initialized");
    const deletedRows = await pullDeletedRows(tx, LAST_SYNC_DATE_MOCK);
    expect(deletedRows.isOk()).toBe(true);
    const data = deletedRows.unwrap();
    data.forEach((table) => {
      expect(TABLES.includes(table.table)).toBe(true);
      expect(table.ids.length).toBeGreaterThan(0);
    });
  });
});
