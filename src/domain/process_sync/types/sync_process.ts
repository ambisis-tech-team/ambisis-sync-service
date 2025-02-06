import { log, LogLevel } from "ambisis_node_helper";
import { z } from "zod";

export enum ProcessSyncStatus {
  FINISHED,
  PROCESSING,
  AWAIT_COMMIT,
  ERROR,
}

export const processSyncSchema = z.object({
  id: z.number().int(),
  userId: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastSync: z.date().nullable(),
  status: z.nativeEnum(ProcessSyncStatus),
});

export type ProcessSync = z.infer<typeof processSyncSchema>;

export const isProcessSync = (data: unknown): data is ProcessSync => {
  const { success, error } = processSyncSchema.safeParse(data);
  if (error) {
    log(
      ` Data is not process sync - ${data} - ${error} process_sync.ts`,
      LogLevel.ERROR
    );
  }
  return success;
};

export const processSyncInsertSchema = processSyncSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ProcessSyncInsert = z.infer<typeof processSyncInsertSchema>;

const processSyncUpdateSchema = z
  .object({ ...processSyncSchema.partial().shape, id: z.number().int() })
  .pick({ id: true, lastSync: true, status: true, userId: true });

export type ProcessSyncUpdate = z.infer<typeof processSyncUpdateSchema>;
