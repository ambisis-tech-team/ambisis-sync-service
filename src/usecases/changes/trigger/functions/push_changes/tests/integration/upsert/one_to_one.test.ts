import type { Transaction } from "mysql-all-in-one/DataAccessObject/types";
import { pushChanges } from "../../../push_changes";
import {
  EXPECTED_QUERY_CONTENTS_PERSON,
  prepareDatabaseForOneToOneMock,
} from "../mocks/one_to_one_mocks";
import { startSpan } from "@sentry/node";
import type { DataChanges } from "../../../../../types/trigger_request";
import {
  MAPPED_FOREIGN_KEYS,
  SyncContext,
} from "../../../../utils/sync_context";
import { describe, it, expect, beforeAll, afterAll } from "vitest";

describe("Should test the push behavior of sync when dealing with one to one relations", () => {
  let tx: Transaction;
  let MOCK: DataChanges;

  beforeAll(async () => {
    if (!SyncContext.db) throw new Error("Database was not initialized");
    tx = await SyncContext.db.startTransaction(SyncContext.database);
    MOCK = await prepareDatabaseForOneToOneMock(tx);
  });

  afterAll(async () => {
    await tx.rollback();
  });

  it("Should insert and update the rows with one to one relations", async () =>
    startSpan({ name: "Test" }, async (span) => {
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
      const resultPerson = await tx.query(
        "SELECT CONCAT(p.name, ' => ', a.name) name FROM person p INNER JOIN address a ON p.id = a.personId"
      );
      if (!Array.isArray(resultPerson)) throw new Error("Invalid result");
      expect(resultPerson.length).toBe(4);
      resultPerson.forEach((person, index) => {
        expect(person.name).toBe(EXPECTED_QUERY_CONTENTS_PERSON[index].name);
      });
    }));
});
