import type { Transaction } from "mysql-all-in-one/DataAccessObject/types";

export const setupDeletedItemsToTestPull = async (tx: Transaction) => {
	try {
		const deletedPersonId = await tx.insert("exclusao_log", { tabelaExclusao: "person", itemId: 1 });
		const deletedParentId = await tx.insert("exclusao_log", { tabelaExclusao: "parent", itemId: 1 });
		const deletedChildrenId = await tx.insert("exclusao_log", { tabelaExclusao: "children", itemId: 1 });
		const deletedBoardId = await tx.insert("exclusao_log", { tabelaExclusao: "board", itemId: 1 });
		return async () => {
			await tx.delete("exclusao_log", { id: { in: [deletedPersonId, deletedBoardId, deletedChildrenId, deletedParentId] } });
		};
	} catch (error) {
		console.error(error);
		throw error;
	}
};
