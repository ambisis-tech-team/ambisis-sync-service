export function guessIfColumnIsForeignKey(column: string): boolean {
	return (column.endsWith("_id") || column.endsWith("Id")) && column !== "ufId" && column !== "cidadeId" && column !== "estadoId";
}
