import { log, LogLevel } from "ambisis_node_helper";
import { z } from "zod";

export const syncInsertedIdSchema = z.object({
  id: z.number().int(),
  table: z.string(),
  syncId: z.string(),
  webId: z.number().int(),
  mobileId: z.number().int(),
  isCentralTable: z.coerce.boolean(),
});

export type SyncInsertId = z.infer<typeof syncInsertedIdSchema>;

export const isSyncInsertedId = (data: unknown): data is SyncInsertId => {
  const { success, error } = syncInsertedIdSchema.safeParse(data);
  if (error)
    log(
      `Data is not sync inserted id - ${data} - ${error} sync_inserted_id.ts`,
      LogLevel.ERROR
    );
  return success;
};

export const syncInsertedIdsArraySchema = z.array(syncInsertedIdSchema);

export type SyncInsertIdsArray = z.infer<typeof syncInsertedIdsArraySchema>;

export const isSyncInsertedIdsArray = (
  data: unknown
): data is SyncInsertIdsArray => {
  const { success, error } = syncInsertedIdsArraySchema.safeParse(data);
  if (error)
    log(
      `Data is not an array of sync inserted ids - ${data} - ${error} sync_inserted_id.ts`,
      LogLevel.ERROR
    );
  return success;
};

export const syncInsertedIdsInsertSchema = z.object({
  id: z.number().int().optional(),
  table: z.string(),
  syncId: z.string(),
  webId: z.number().int(),
  mobileId: z.number().int(),
  isCentralTable: z.boolean().default(false).optional(),
});

export type SyncInsertIdInsert = z.infer<typeof syncInsertedIdsInsertSchema>;

export const syncInsertedIdsArrayInsertSchema = z.array(
  syncInsertedIdsInsertSchema
);

export type SyncInsertIdsArrayInsert = z.infer<
  typeof syncInsertedIdsArrayInsertSchema
>;
