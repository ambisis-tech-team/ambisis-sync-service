export type InsertedAndUpdatedChangesMappedToTable = {
	[table: string]: {
		insertedRows: { swapMapping: Map<string, number>; data: Record<string, unknown> & { id: number } }[];
		updatedRows: { swapMapping: Map<string, number>; data: Record<string, unknown> & { id: number } }[];
	};
};
