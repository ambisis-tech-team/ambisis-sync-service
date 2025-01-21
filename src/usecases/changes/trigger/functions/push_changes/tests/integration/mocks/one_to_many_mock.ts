import type { Transaction } from "mysql-all-in-one/DataAccessObject/types";
import type { DataChanges } from "../../../../../types/trigger_request";

export async function prepareDatabaseForOneToManyMock(tx: Transaction) {
  const allOnWebParentId = await tx.insert("parent", { id: 1, name: "A" });
  const parentOnWebId = await tx.insert("parent", { id: 2, name: "B" });
  const parentOnWebAndSomeChildrenId = await tx.insert("parent", {
    id: 3,
    name: "C",
  });

  const allOnWebChildId = await tx.insert("children", {
    id: 1,
    name: "A",
    parentId: allOnWebParentId,
  });
  const secondAllOnWebChilId = await tx.insert("children", {
    id: 2,
    name: "B",
    parentId: allOnWebParentId,
  });

  const childOnWebAndParentId = await tx.insert("children", {
    id: 3,
    name: "B",
    parentId: parentOnWebAndSomeChildrenId,
  });
  const secondChildOnWebAndParentId = await tx.insert("children", {
    id: 4,
    name: "C",
    parentId: parentOnWebAndSomeChildrenId,
  });

  if (
    typeof allOnWebParentId !== "number" ||
    typeof parentOnWebId !== "number" ||
    typeof parentOnWebAndSomeChildrenId !== "number" ||
    typeof allOnWebChildId !== "number" ||
    typeof secondAllOnWebChilId !== "number" ||
    typeof childOnWebAndParentId !== "number" ||
    typeof secondChildOnWebAndParentId !== "number"
  ) {
    throw new Error("Failed to prepare database for one to many mock");
  }

  return generateMockForManyToOne({
    allOnWebParentId,
    parentOnWebId,
    parentOnWebAndSomeChildrenId,
    allOnWebChildId,
    secondAllOnWebChilId,
    childOnWebAndParentId,
    secondChildOnWebAndParentId,
  });
}

const generateMockForManyToOne = ({
  allOnWebParentId,
  parentOnWebId,
  parentOnWebAndSomeChildrenId,
  allOnWebChildId,
  secondAllOnWebChilId,
  childOnWebAndParentId,
  secondChildOnWebAndParentId,
}: {
  allOnWebParentId: number;
  parentOnWebId: number;
  parentOnWebAndSomeChildrenId: number;
  allOnWebChildId: number;
  secondAllOnWebChilId: number;
  childOnWebAndParentId: number;
  secondChildOnWebAndParentId: number;
}): DataChanges => [
  {
    table: "parent",
    rows: [
      { id: allOnWebParentId * -1, name: "Parent all on WEB" },
      { id: parentOnWebId * -1, name: "Parent on WEB" },
      {
        id: parentOnWebAndSomeChildrenId * -1,
        name: "Parent on WEB and some children",
      },
      { id: 1, name: "Parent mobile 1" },
    ],
  },
  {
    table: "children",
    rows: [
      {
        id: allOnWebChildId * -1,
        name: "Child all on WEB 1",
        parentId: allOnWebParentId * -1,
      },
      {
        id: secondAllOnWebChilId * -1,
        name: "Child all on WEB 2",
        parentId: allOnWebParentId * -1,
      },
      {
        id: childOnWebAndParentId * -1,
        name: "Some child on WEB 2",
        parentId: parentOnWebAndSomeChildrenId * -1,
      },
      {
        id: secondChildOnWebAndParentId * -1,
        name: "Some child on WEB 2",
        parentId: parentOnWebAndSomeChildrenId * -1,
      },
      {
        id: 5,
        name: "Some child on mobile 1",
        parentId: parentOnWebAndSomeChildrenId * -1,
      },
      {
        id: 6,
        name: "Some child on mobile 2",
        parentId: parentOnWebAndSomeChildrenId * -1,
      },
      { id: 1, name: "Child mobile 1 (only mobile)", parentId: 1 },
      { id: 2, name: "Child mobile 2 (only mobile)", parentId: 1 },
      {
        id: 3,
        name: "Child mobile 3 (with parent on WEB)",
        parentId: parentOnWebId * -1,
      },
      {
        id: 4,
        name: "Child mobile 4 (with parent on WEB)",
        parentId: parentOnWebId * -1,
      },
    ],
  },
];

export const EXPECTED_QUERY_CONTENTS_PERSON = [
  {
    name: "Parent all on WEB",
    children: "Child all on WEB 1, Child all on WEB 2",
  },
  {
    name: "Parent on WEB",
    children:
      "Child mobile 3 (with parent on WEB), Child mobile 4 (with parent on WEB)",
  },
  {
    name: "Parent on WEB and some children",
    children:
      "Some child on WEB 2, Some child on WEB 2, Some child on mobile 1, Some child on mobile 2",
  },
  {
    name: "Parent mobile 1",
    children: "Child mobile 1 (only mobile), Child mobile 2 (only mobile)",
  },
];
