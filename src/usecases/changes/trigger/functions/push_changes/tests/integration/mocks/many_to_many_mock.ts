import type { Transaction } from "mysql-all-in-one/DataAccessObject/types";
import type { DataChanges } from "../../../../../types/trigger_request";

export async function prepareDatabaseForManyToManyMock(tx: Transaction) {
  const firstAllOnWebMessageId = await tx.insert("message", {
    id: 1,
    name: "A",
  });
  const secondAllOnWebMessageId = await tx.insert("message", {
    id: 2,
    name: "B",
  });

  const firstAllOnWebBoardId = await tx.insert("board", { id: 1, name: "A" });
  const secondAllOnWebBoardId = await tx.insert("board", { id: 2, name: "B" });

  const firstAllOnWebMessageInFirstBoardId = await tx.insert(
    "message_in_board",
    { id: 1, boardId: firstAllOnWebBoardId, messageId: firstAllOnWebMessageId }
  );
  const secondAllOnWebMessageInFirstBoardId = await tx.insert(
    "message_in_board",
    { id: 2, boardId: firstAllOnWebBoardId, messageId: secondAllOnWebMessageId }
  );
  const thirdAllOnWebMessageInFirstBoardId = await tx.insert(
    "message_in_board",
    {
      id: 3,
      boardId: secondAllOnWebBoardId,
      messageId: secondAllOnWebMessageId,
    }
  );
  const fourthAllOnWebMessageInFirstBoardId = await tx.insert(
    "message_in_board",
    { id: 4, boardId: secondAllOnWebBoardId, messageId: firstAllOnWebMessageId }
  );

  const firstOnlyWebMessageId = await tx.insert("message", {
    id: 3,
    name: "C",
  });
  const secondOnlyWebMessageId = await tx.insert("message", {
    id: 4,
    name: "D",
  });

  const firstOnlyWebBoardId = await tx.insert("board", { id: 3, name: "C" });
  const secondOnlyWebBoardId = await tx.insert("board", { id: 4, name: "D" });

  if (
    typeof firstAllOnWebMessageId !== "number" ||
    typeof secondAllOnWebMessageId !== "number" ||
    typeof firstAllOnWebBoardId !== "number" ||
    typeof secondAllOnWebBoardId !== "number" ||
    typeof firstAllOnWebMessageInFirstBoardId !== "number" ||
    typeof secondAllOnWebMessageInFirstBoardId !== "number" ||
    typeof thirdAllOnWebMessageInFirstBoardId !== "number" ||
    typeof fourthAllOnWebMessageInFirstBoardId !== "number" ||
    typeof firstOnlyWebMessageId !== "number" ||
    typeof secondOnlyWebMessageId !== "number" ||
    typeof firstOnlyWebBoardId !== "number" ||
    typeof secondOnlyWebBoardId !== "number"
  ) {
    throw new Error("Failed to prepare database for many to many mock");
  }

  return generateMockForManyToMany({
    firstAllOnWebMessageId,
    secondAllOnWebMessageId,
    firstAllOnWebBoardId,
    secondAllOnWebBoardId,
    firstAllOnWebMessageInFirstBoardId,
    secondAllOnWebMessageInFirstBoardId,
    thirdAllOnWebMessageInFirstBoardId,
    fourthAllOnWebMessageInFirstBoardId,
    firstOnlyWebMessageId,
    secondOnlyWebMessageId,
    firstOnlyWebBoardId,
    secondOnlyWebBoardId,
  });
}

const MESSAGE_ONLY_MOBILE_FIRST = 3;
const MESSAGE_ONLY_MOBILE_SECOND = 4;
const BOARD_ONLY_MOBILE_FIRST = 3;
const BOARD_ONLY_MOBILE_SECOND = 4;

const MESSAGE_JUST_CREATED_IN_MOBILE_FIRST = 1;
const MESSAGE_JUST_CREATED_IN_MOBILE_SECOND = 2;
const BOARD_JUST_CREATED_IN_MOBILE_FIRST = 1;
const BOARD_JUST_CREATED_IN_MOBILE_SECOND = 2;

const generateMockForManyToMany = ({
  firstAllOnWebMessageId,
  secondAllOnWebMessageId,
  firstAllOnWebBoardId,
  secondAllOnWebBoardId,
  firstAllOnWebMessageInFirstBoardId,
  secondAllOnWebMessageInFirstBoardId,
  thirdAllOnWebMessageInFirstBoardId,
  fourthAllOnWebMessageInFirstBoardId,
  firstOnlyWebMessageId,
  secondOnlyWebMessageId,
  firstOnlyWebBoardId,
  secondOnlyWebBoardId,
}: {
  firstAllOnWebMessageId: number;
  secondAllOnWebMessageId: number;
  firstAllOnWebBoardId: number;
  secondAllOnWebBoardId: number;
  firstAllOnWebMessageInFirstBoardId: number;
  secondAllOnWebMessageInFirstBoardId: number;
  thirdAllOnWebMessageInFirstBoardId: number;
  fourthAllOnWebMessageInFirstBoardId: number;
  firstOnlyWebMessageId: number;
  secondOnlyWebMessageId: number;
  firstOnlyWebBoardId: number;
  secondOnlyWebBoardId: number;
}): DataChanges => [
  {
    table: "message",
    rows: [
      { id: firstAllOnWebMessageId * -1, name: "First message (web only)" },
      { id: secondAllOnWebMessageId * -1, name: "Second message (web only)" },
      {
        id: firstOnlyWebMessageId * -1,
        name: "First message (just created in web)",
      },
      {
        id: secondOnlyWebMessageId * -1,
        name: "Second message (just created in web)",
      },
      {
        id: MESSAGE_JUST_CREATED_IN_MOBILE_FIRST,
        name: "First message (just create in mobile)",
      },
      {
        id: MESSAGE_JUST_CREATED_IN_MOBILE_SECOND,
        name: "Second message (just create in mobile)",
      },
      { id: MESSAGE_ONLY_MOBILE_FIRST, name: "First message (mobile only)" },
      { id: MESSAGE_ONLY_MOBILE_SECOND, name: "Second message (mobile only)" },
    ],
  },
  {
    table: "board",
    rows: [
      { id: firstAllOnWebBoardId * -1, name: "First board (web only)" },
      { id: secondAllOnWebBoardId * -1, name: "Second board (web only)" },
      {
        id: firstOnlyWebBoardId * -1,
        name: "First board (just created in web)",
      },
      {
        id: secondOnlyWebBoardId * -1,
        name: "Second board (just created in web)",
      },
      {
        id: BOARD_JUST_CREATED_IN_MOBILE_FIRST,
        name: "First board (just create in mobile)",
      },
      {
        id: BOARD_JUST_CREATED_IN_MOBILE_SECOND,
        name: "Second board (just create in mobile)",
      },
      { id: BOARD_ONLY_MOBILE_FIRST, name: "First board (mobile only)" },
      { id: BOARD_ONLY_MOBILE_SECOND, name: "Second board (mobile only)" },
    ],
  },
  {
    table: "message_in_board",
    rows: [
      {
        id: firstAllOnWebMessageInFirstBoardId * -1,
        boardId: firstAllOnWebBoardId * -1,
        messageId: firstAllOnWebMessageId * -1,
      },
      {
        id: secondAllOnWebMessageInFirstBoardId * -1,
        boardId: firstAllOnWebBoardId * -1,
        messageId: secondAllOnWebMessageId * -1,
      },
      {
        id: thirdAllOnWebMessageInFirstBoardId * -1,
        boardId: secondAllOnWebBoardId * -1,
        messageId: secondAllOnWebMessageId * -1,
      },
      {
        id: fourthAllOnWebMessageInFirstBoardId * -1,
        boardId: secondAllOnWebBoardId * -1,
        messageId: firstAllOnWebMessageId * -1,
      },

      {
        id: 1,
        boardId: firstOnlyWebBoardId * -1,
        messageId: MESSAGE_JUST_CREATED_IN_MOBILE_FIRST,
      },
      {
        id: 2,
        boardId: secondOnlyWebBoardId * -1,
        messageId: MESSAGE_JUST_CREATED_IN_MOBILE_SECOND,
      },
      {
        id: 11,
        boardId: firstOnlyWebBoardId * -1,
        messageId: firstOnlyWebMessageId * -1,
      },
      {
        id: 12,
        boardId: secondOnlyWebBoardId * -1,
        messageId: secondOnlyWebMessageId * -1,
      },

      {
        id: 5,
        boardId: BOARD_ONLY_MOBILE_FIRST,
        messageId: MESSAGE_ONLY_MOBILE_FIRST,
      },
      {
        id: 8,
        boardId: BOARD_ONLY_MOBILE_FIRST,
        messageId: MESSAGE_ONLY_MOBILE_SECOND,
      },

      {
        id: 6,
        boardId: BOARD_ONLY_MOBILE_SECOND,
        messageId: MESSAGE_ONLY_MOBILE_FIRST,
      },
      {
        id: 7,
        boardId: BOARD_ONLY_MOBILE_SECOND,
        messageId: MESSAGE_ONLY_MOBILE_SECOND,
      },

      {
        id: 3,
        boardId: BOARD_JUST_CREATED_IN_MOBILE_FIRST,
        messageId: firstOnlyWebMessageId * -1,
      },
      {
        id: 9,
        boardId: BOARD_JUST_CREATED_IN_MOBILE_FIRST,
        messageId: secondOnlyWebMessageId * -1,
      },

      {
        id: 4,
        boardId: BOARD_JUST_CREATED_IN_MOBILE_SECOND,
        messageId: secondOnlyWebMessageId * -1,
      },
      {
        id: 10,
        boardId: BOARD_JUST_CREATED_IN_MOBILE_SECOND,
        messageId: firstOnlyWebMessageId * -1,
      },
    ],
  },
];

export const EXPECTED_QUERY_CONTENTS_MESSAGE_IN_BOARD = [
  { id: 1, name: "First board (web only) => First message (web only)" },
  { id: 4, name: "Second board (web only) => First message (web only)" },
  { id: 2, name: "First board (web only) => Second message (web only)" },
  { id: 3, name: "Second board (web only) => Second message (web only)" },
  {
    id: 7,
    name: "First board (just created in web) => First message (just created in web)",
  },
  {
    id: 13,
    name: "First board (just create in mobile) => First message (just created in web)",
  },
  {
    id: 16,
    name: "Second board (just create in mobile) => First message (just created in web)",
  },
  {
    id: 8,
    name: "Second board (just created in web) => Second message (just created in web)",
  },
  {
    id: 14,
    name: "First board (just create in mobile) => Second message (just created in web)",
  },
  {
    id: 15,
    name: "Second board (just create in mobile) => Second message (just created in web)",
  },
  {
    id: 5,
    name: "First board (just created in web) => First message (just create in mobile)",
  },
  {
    id: 6,
    name: "Second board (just created in web) => Second message (just create in mobile)",
  },
  { id: 9, name: "First board (mobile only) => First message (mobile only)" },
  { id: 11, name: "Second board (mobile only) => First message (mobile only)" },
  { id: 10, name: "First board (mobile only) => Second message (mobile only)" },
  {
    id: 12,
    name: "Second board (mobile only) => Second message (mobile only)",
  },
];
