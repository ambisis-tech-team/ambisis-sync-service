import { log, LogLevel } from "ambisis_node_helper";
import { z } from "zod";

export const tableColumnsNamesSchema = z.array(
	z.object({
		columnName: z.string(),
	})
);

export type TableColumnsNames = z.infer<typeof tableColumnsNamesSchema>;

export const isTableColumnsNames = (data: unknown): data is TableColumnsNames => {
	const { success, error } = tableColumnsNamesSchema.safeParse(data);
	if (error) log(` Value given doesn't match table columns name schema - ${error} - ${JSON.stringify(data)} - table_columns_names.ts`, LogLevel.ERROR);
	return success;
};
