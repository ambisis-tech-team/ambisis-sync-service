import type { Transaction } from "mysql-all-in-one/DataAccessObject/types";
import type { DataChanges } from "../../../../../types/trigger_request";
import {
  EXPECTED_QUERY_CONTENTS_PERSON,
  prepareDatabaseForOneToManyMock,
} from "../mocks/one_to_many_mock";
import { pushChanges } from "../../../push_changes";
import { startSpan } from "@sentry/node";
import {
  MAPPED_FOREIGN_KEYS,
  SyncContext,
} from "../../../../utils/sync_context";
import { describe, it, expect, beforeAll, afterAll } from "vitest";

describe("Should correctly insert items with one to many relations", () => {
  let tx: Transaction;
  let MOCK: DataChanges;

  beforeAll(async () => {
    if (!SyncContext.db) throw new Error("Database was not initialized");
    tx = await SyncContext.db.startTransaction(SyncContext.database);
    MOCK = await prepareDatabaseForOneToManyMock(tx);
  });

  afterAll(async () => {
    await tx.rollback();
  });

  it("Should correctly insert items with one to many relations", async () =>
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
      const resultParent = await tx.query(
        "SELECT p.name, GROUP_CONCAT(c.name SEPARATOR ', ') children FROM parent p INNER JOIN children c ON p.id = c.parentId GROUP BY p.id"
      );
      if (!Array.isArray(resultParent)) throw new Error("Invalid result");
      expect(resultParent.length).toBe(4);
      resultParent.forEach((parent, index) => {
        expect(parent.name).toBe(EXPECTED_QUERY_CONTENTS_PERSON[index].name);
      });
    }));
});
