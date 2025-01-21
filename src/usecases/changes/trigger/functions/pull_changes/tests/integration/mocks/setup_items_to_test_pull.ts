import type { Transaction } from "mysql-all-in-one/DataAccessObject/types";

export const setupItemsToTestPull = async (tx: Transaction) => {
	try {
		const personId = await tx.insert("person", { name: "Person 1" });
		await tx.insert("address", { name: "Address 1", personId });

		const parentId = await tx.insert("parent", { name: "Parent 1" });
		await tx.insert("children", { name: "Children 1", parentId });
		await tx.insert("children", { name: "Children 2", parentId });

		const boardId = await tx.insert("board", { name: "Board 1" });
		const secondBoardId = await tx.insert("board", { name: "Board 2" });
		const messageId = await tx.insert("message", { name: "Message 1" });
		const secondMessageId = await tx.insert("message", { name: "Message 2" });
		await tx.insert("message_in_board", { boardId, messageId });
		await tx.insert("message_in_board", { boardId, messageId: secondMessageId });
		await tx.insert("message_in_board", { boardId: secondBoardId, messageId });
		await tx.insert("message_in_board", { boardId: secondBoardId, messageId: secondMessageId });

		return async () => {
			await tx.delete("message", { id: { in: [secondMessageId, messageId] } });
			await tx.delete("board", { id: { in: [secondBoardId, boardId] } });
			await tx.delete("person", { id: personId });
			await tx.delete("parent", { id: parentId });
		};
	} catch (error) {
		console.error(error);
		throw error;
	}
};
