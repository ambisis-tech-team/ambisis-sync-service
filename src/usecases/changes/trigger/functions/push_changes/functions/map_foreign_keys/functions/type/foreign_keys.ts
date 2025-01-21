import { log, LogLevel } from "ambisis_node_helper";
import { z } from "zod";

const foreignKeysSchema = z.array(
	z.object({
		parentTable: z.string(),
		parentColumn: z.string(),
		referencedTable: z.string(),
		referencedColumn: z.string(),
	})
);

export type ForeignKeys = z.infer<typeof foreignKeysSchema>;

export const isForeignKeys = (value: unknown): value is ForeignKeys => {
	const { success, error } = foreignKeysSchema.safeParse(value);
	if (error) log(` ${error.message} - foreign_keys.ts`, LogLevel.ERROR);
	return success;
};
