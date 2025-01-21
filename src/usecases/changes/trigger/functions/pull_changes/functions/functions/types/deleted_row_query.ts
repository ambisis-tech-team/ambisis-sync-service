import { log, LogLevel } from "ambisis_node_helper";
import { z } from "zod";

export const deleteRowQuerySchema = z.array(
	z.object({
		tabelaExclusao: z.string(),
		itemId: z.number(),
	})
);

export type DeleteRowQuery = z.infer<typeof deleteRowQuerySchema>;

export const isDeletedRowQuery = (data: unknown): data is DeleteRowQuery => {
	const { success, error } = deleteRowQuerySchema.safeParse(data);
	if (error) log(` ${error.message} - deleted_row_query.ts`, LogLevel.ERROR);
	return success;
};
