import { log, LogLevel } from "ambisis_node_helper";
import { z } from "zod";

export const dataChangesSchema = z.array(
	z.object({
		table: z.string(),
		rows: z.array(z.object({ id: z.number() }).and(z.record(z.unknown()))),
	})
);

export const deletedSchema = z.array(
	z.object({
		table: z.string(),
		ids: z.number().array(),
	})
);

export const syncRequestSchema = z.object({
	syncedClientDbTables: z.string().array(),
	syncedCentralDbTables: z.string().array(),
	lastSyncDate: z.number().int(),
	syncLogId: z.string(),
	dataChangesClientDb: dataChangesSchema,
	deletedClientDb: deletedSchema,
	dataChangesCentralDb: dataChangesSchema,
	deletedCentralDb: deletedSchema,
});

export type SyncRequest = z.infer<typeof syncRequestSchema>;

export type DataChanges = z.infer<typeof dataChangesSchema>;

export type Deleted = z.infer<typeof deletedSchema>;

export const isDeletedSchema = (data: unknown): data is Deleted => {
	const { success, error } = deletedSchema.safeParse(data);
	if (error) log(` Bad request: ${error}`, LogLevel.ERROR);
	return success;
};

export const isSyncRequestSchema = (data: unknown): data is SyncRequest => {
	const { success, error } = syncRequestSchema.safeParse(data);
	if (error) log(` Bad request: ${error}`, LogLevel.ERROR);
	return success;
};
