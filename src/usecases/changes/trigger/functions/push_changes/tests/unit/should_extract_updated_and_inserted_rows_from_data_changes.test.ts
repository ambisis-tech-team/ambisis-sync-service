import { startSpan } from "@sentry/node";
import { extractUpdatedAndInsertedRowsFromDataChanges } from "../../functions/extract_updated_and_inserted_rows_from_data_changes/extract_updated_and_inserted_rows_from_data_changes";
import type { DataChanges } from "../../../../types/trigger_request";
import type { MappedForeignKeys } from "../../functions/map_foreign_keys/types/mapped_foreign_keys";
import type { InsertedAndUpdatedChangesMappedToTable } from "../../functions/extract_updated_and_inserted_rows_from_data_changes/types/inserted_and_updated_changes_mapped_to_table";
import { describe, it, expect } from "vitest";

describe("Should test the cases for the function that takes care of extracting the updated and inserted rows from the changes", () => {
  const dataChangesMock: DataChanges = [
    {
      table: "a",
      rows: [
        { id: -1, name: "Row 1", bId: 1 },
        { id: -3, name: "Row 3", bId: -3 },
        { id: -4, name: "Row 4", bId: 2 },
        { id: 2, name: "Row 2", bId: 2 },
        { id: 5, name: "Row 5", bId: -3 },
        { id: 6, name: "Row 6", bId: 1 },
      ],
    },
    {
      table: "b",
      rows: [
        { id: 1, name: "Row 1", cId: 1 },
        { id: 2, name: "Row 2", cId: -2 },
        { id: -3, name: "Row 3", cId: -3 },
      ],
    },
    {
      table: "c",
      rows: [
        { id: 1, name: "Row 1" },
        { id: -2, name: "Row 2" },
        { id: -3, name: "Row 3" },
        { id: 4, name: "Row 4" },
      ],
    },
  ];

  const foreignKeyMap: MappedForeignKeys = {
    a: [{ parentColumn: "id", referencedColumn: "bId", referencedTable: "b" }],
    b: [{ parentColumn: "id", referencedColumn: "cId", referencedTable: "c" }],
  };

  const mappingExpectedResult: InsertedAndUpdatedChangesMappedToTable = {
    a: {
      insertedRows: [
        {
          data: { id: 1, name: "Row 1", bId: -1 },
          swapMapping: new Map([["bId", 1]]),
        },
        { data: { id: 3, name: "Row 3", bId: 3 }, swapMapping: new Map() },
        {
          data: { id: 4, name: "Row 4", bId: -1 },
          swapMapping: new Map([["bId", 2]]),
        },
      ],
      updatedRows: [
        {
          data: { id: -1, name: "Row 2", bId: -1 },
          swapMapping: new Map([
            ["id", 2],
            ["bId", 2],
          ]),
        },
        {
          data: { id: -1, name: "Row 5", bId: 3 },
          swapMapping: new Map([["id", 5]]),
        },
        {
          data: { id: -1, name: "Row 6", bId: -1 },
          swapMapping: new Map([
            ["id", 6],
            ["bId", 1],
          ]),
        },
      ],
    },
    b: {
      insertedRows: [
        { data: { id: 3, name: "Row 3", cId: 3 }, swapMapping: new Map() },
      ],
      updatedRows: [
        {
          data: { id: -1, name: "Row 1", cId: -1 },
          swapMapping: new Map([
            ["id", 1],
            ["cId", 1],
          ]),
        },
        {
          data: { id: -1, name: "Row 2", cId: 2 },
          swapMapping: new Map([["id", 2]]),
        },
      ],
    },
    c: {
      insertedRows: [
        { data: { id: 1, name: "Row 1" }, swapMapping: new Map() },
        { data: { id: 4, name: "Row 4" }, swapMapping: new Map() },
      ],
      updatedRows: [
        { data: { id: -2, name: "Row 2" }, swapMapping: new Map() },
        { data: { id: -3, name: "Row 3" }, swapMapping: new Map() },
      ],
    },
  };

  it("GIVEN changes with inserted and updated rows THEN calling the extractor function ASSERT that the result contains the rows grouped correctly", async () =>
    await startSpan({ name: "test" }, async (span) => {
      const result = await extractUpdatedAndInsertedRowsFromDataChanges(
        span,
        dataChangesMock,
        foreignKeyMap
      );

      if (result.isErr()) {
        throw new Error("Expected the result to be Ok");
      }

      const mapping = result.unwrap();

      expect(mapping).toStrictEqual(mappingExpectedResult);
    }));
});
