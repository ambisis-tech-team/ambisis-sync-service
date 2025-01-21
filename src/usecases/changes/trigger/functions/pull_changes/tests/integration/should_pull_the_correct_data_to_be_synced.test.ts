import { startSpan } from "@sentry/node";
import { pullChanges } from "../../pull_changes";
import { sub } from "date-fns";
import { setupItemsToTestPull } from "./mocks/setup_items_to_test_pull";
import type { Transaction } from "mysql-all-in-one/DataAccessObject/types";
import {
  MAPPED_FOREIGN_KEYS,
  SyncContext,
  TABLES,
} from "../../../utils/sync_context";
import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";

vi.mock("../../functions/pull_central_db_tables", () => ({
  pullCentralDbTables: vi
    .fn()
    .mockReturnValue(
      new Promise((resolve) =>
        resolve({ isErr: () => false, unwrap: () => [] })
      )
    ),
}));

describe("Tests the functions that obtain the data to be synced", () => {
  let tx: Transaction;

  beforeAll(async () => {
    if (!SyncContext.db) throw new Error("Database was not initialized");
    tx = await SyncContext.db.startTransaction(SyncContext.database);
    await setupItemsToTestPull(tx);
  });

  afterAll(async () => await tx.rollback());

  const LAST_SYNC_DATE_MOCK = sub(new Date(), { months: 1 }).getTime();

  it("Should pull the data because their modification dates are greater than the last sync and all tables have been synced", async () =>
    await startSpan({ name: "Test" }, async (span) => {
      if (!SyncContext.database)
        throw new Error("Database was not initialized");

      const pulledChanges = await pullChanges(
        tx,
        tx,
        span,
        SyncContext.database,
        LAST_SYNC_DATE_MOCK,
        TABLES,
        [],
        MAPPED_FOREIGN_KEYS,
        [],
        TABLES
      );

      expect(pulledChanges.isOk()).toBe(true);
      const { clientTables, unsyncedClientTables } = pulledChanges.unwrap();
      expect(unsyncedClientTables.length).toBe(0);
      expect(clientTables.length).toBe(7);
      clientTables.forEach((table) => {
        expect(TABLES.includes(table.table)).toBe(true);
        expect(table.data.length).toBeGreaterThan(0);
        table.data.forEach((row) => {
          expect(row).toHaveProperty("id");
          expect(row.id).toBeLessThan(0);
          Object.entries(row).forEach(([key, value]) => {
            if (!key.includes("Id")) return;
            expect(value).toBeLessThan(0);
          });
        });
      });
    }));

  it("Should pull the data, because there are no unsynced tables", async () =>
    await startSpan({ name: "Test" }, async (span) => {
      if (!SyncContext.database)
        throw new Error("Database was not initialized");

      const pulledChanges = await pullChanges(
        tx,
        tx,
        span,
        SyncContext.database,
        LAST_SYNC_DATE_MOCK,
        [],
        [],
        MAPPED_FOREIGN_KEYS,
        [],
        TABLES
      );

      expect(pulledChanges.isOk()).toBe(true);
      const { clientTables, unsyncedClientTables } = pulledChanges.unwrap();
      expect(clientTables.length).toBe(0);
      expect(unsyncedClientTables.length).toBe(7);
      unsyncedClientTables.forEach((table) => {
        expect(TABLES.includes(table.table)).toBe(true);
        expect(table.data.length).toBeGreaterThan(0);
        table.data.forEach((row) => {
          expect(row).toHaveProperty("id");
          expect(row.id).toBeLessThan(0);
          Object.entries(row).forEach(([key, value]) => {
            if (!key.includes("Id")) return;
            expect(value).toBeLessThan(0);
          });
        });
      });
    }));

  it("Should pull some tables as unsynced and others as synced tables", async () =>
    await startSpan({ name: "Test" }, async (span) => {
      if (!SyncContext.database)
        throw new Error("Database was not initialized");

      const pulledChanges = await pullChanges(
        tx,
        tx,
        span,
        SyncContext.database,
        LAST_SYNC_DATE_MOCK,
        ["person", "address", "parent", "children"],
        [],
        MAPPED_FOREIGN_KEYS,
        [],
        TABLES
      );

      expect(pulledChanges.isOk()).toBe(true);
      const { clientTables, unsyncedClientTables } = pulledChanges.unwrap();

      expect(clientTables.length).toBe(4);
      clientTables.forEach((table) => {
        expect(TABLES.includes(table.table)).toBe(true);
        expect(table.data.length).toBeGreaterThan(0);
        table.data.forEach((row) => {
          expect(row).toHaveProperty("id");
          expect(row.id).toBeLessThan(0);
          Object.entries(row).forEach(([key, value]) => {
            if (!key.includes("Id")) return;
            expect(value).toBeLessThan(0);
          });
        });
      });

      expect(unsyncedClientTables.length).toBe(3);
      unsyncedClientTables.forEach((table) => {
        expect(TABLES.includes(table.table)).toBe(true);
        expect(table.data.length).toBeGreaterThan(0);
        table.data.forEach((row) => {
          expect(row).toHaveProperty("id");
          expect(row.id).toBeLessThan(0);
          Object.entries(row).forEach(([key, value]) => {
            if (!key.includes("Id")) return;
            expect(value).toBeLessThan(0);
          });
        });
      });
    }));
});
