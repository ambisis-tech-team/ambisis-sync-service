import { QueryBuilder } from "mysql-all-in-one";
import type { MappedForeignKeys } from "../../../push_changes/functions/map_foreign_keys/types/mapped_foreign_keys";
import { getColumnsSelectFromColumnNamesAndForeignKeyMappings } from "../../functions/functions/get_columns_select_from_column_names_and_foreign_key_mapping";
import { describe, it, expect } from "vitest";

describe("Tests for the function that should get the correct select expression", () => {
  const expectedOutputQuery =
    "SELECT (CAST(`a`.`id` AS SIGNED) * -1) AS `id`,`a`.`name`,(CAST(`a`.`bId` AS SIGNED) * -1) AS `bId` FROM `a`;";

  const foreignKeyMapMock: MappedForeignKeys = {
    a: [{ parentColumn: "id", referencedColumn: "bId", referencedTable: "b" }],
    b: [{ parentColumn: "id", referencedColumn: "cId", referencedTable: "c" }],
  };

  it("Should build the correct object for selecting the columns", () => {
    const columns = getColumnsSelectFromColumnNamesAndForeignKeyMappings(
      "a",
      foreignKeyMapMock,
      ["id", "name", "bId"]
    );

    expect(QueryBuilder.select({ from: "a", columns })).toEqual(
      expectedOutputQuery
    );
  });
});
