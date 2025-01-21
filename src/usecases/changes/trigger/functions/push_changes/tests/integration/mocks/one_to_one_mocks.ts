import type { Transaction } from "mysql-all-in-one/DataAccessObject/types";
import type { DataChanges } from "../../../../../types/trigger_request";

export const generateOneToOneMock = ({
  personOneId,
  personTwoId,
  addressOneId,
  addressTwoId,
}: {
  personOneId: number;
  personTwoId: number;
  addressOneId: number;
  addressTwoId: number;
}): DataChanges => [
  {
    table: "person",
    rows: [
      { id: 1, name: "Person mobile 1" },
      { id: 2, name: "Person mobile 2" },
      { id: personOneId * -1, name: "Person web 1" },
      { id: personTwoId * -1, name: "Person web 2" },
    ],
  },
  {
    table: "address",
    rows: [
      { id: addressOneId * -1, name: "Address web 1", personId: 2 },
      {
        id: addressTwoId * -1,
        name: "Address web 2",
        personId: personTwoId * -1,
      },
      { id: 1, name: "Address mobile 1", personId: 1 },
      { id: 2, name: "Address mobile 2", personId: personOneId * -1 },
    ],
  },
];

export const EXPECTED_QUERY_CONTENTS_PERSON = [
  { name: "Person web 1 => Address mobile 2" },
  { name: "Person web 2 => Address web 2" },
  { name: "Person mobile 1 => Address mobile 1" },
  { name: "Person mobile 2 => Address web 1" },
];

export async function prepareDatabaseForOneToOneMock(tx: Transaction) {
  const personOneId = await tx.insert("person", { id: 1, name: "A" });
  const personTwoId = await tx.insert("person", { id: 2, name: "B" });
  const addressOneId = await tx.insert("address", {
    id: 1,
    name: "A",
    personId: personOneId,
  });
  const addressTwoId = await tx.insert("address", {
    id: 2,
    name: "B",
    personId: personTwoId,
  });
  if (
    typeof personOneId !== "number" ||
    typeof personTwoId !== "number" ||
    typeof addressOneId !== "number" ||
    typeof addressTwoId !== "number"
  ) {
    throw new Error("Failed to prepare database for one to one mock");
  }
  return generateOneToOneMock({
    personOneId,
    personTwoId,
    addressOneId,
    addressTwoId,
  });
}
