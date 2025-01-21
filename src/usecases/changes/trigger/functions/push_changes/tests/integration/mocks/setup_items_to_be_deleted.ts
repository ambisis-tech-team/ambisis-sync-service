import type { Transaction } from "mysql-all-in-one/DataAccessObject/types";
import type { Deleted } from "../../../../../types/trigger_request";

export const DELETED_MOCK: Deleted = [
  { table: "person", ids: [-2, -4] },
  { table: "address", ids: [-2] },
  { table: "children", ids: [-2, -3] },
  { table: "parent", ids: [-1] },
];

export async function setupItemsToBeDeleted(tx: Transaction) {
  await tx.insert("person", { id: 2, name: "A" });
  await tx.insert("person", { id: 4, name: "A" });

  await tx.insert("address", { id: 2, name: "A", personId: 2 });

  await tx.insert("parent", { id: 1, name: "A" });

  await tx.insert("children", { id: 2, name: "A", parentId: 1 });
  await tx.insert("children", { id: 3, name: "A", parentId: 1 });
}
