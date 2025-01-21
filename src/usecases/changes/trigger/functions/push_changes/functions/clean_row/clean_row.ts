export const cleanRow = (row: Record<string, unknown>, columns: string[]): Record<string, unknown> => {
	const cleanedRow: Record<string, unknown> = {};
	for (const column of columns) {
		if (row[column] !== undefined) cleanedRow[column] = row[column];
	}
	return cleanedRow;
};
