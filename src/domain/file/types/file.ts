import { log, LogLevel } from "ambisis_node_helper";
import { z } from "zod";

export enum FileIsSynced {
  NOT_SYNCED = "not_synced",
  SYNCED = "synced",
}

export const fileSchema = z.object({
  id: z.number(),
  s3FileStatus: z.nativeEnum(FileIsSynced),
  keyS3: z.string(),
  modificacaoData: z.coerce.date(),
});

export type File = z.infer<typeof fileSchema>;

export const fileUpdateSchema = z.object({
  ...fileSchema.partial().shape,
  id: z.number(),
});

export type FileUpdate = z.infer<typeof fileUpdateSchema>;

export const fileSchemaArray = z.array(fileSchema);

export type FileArray = z.infer<typeof fileSchemaArray>;

export const isFile = (data: unknown): data is File => {
  const { success, error } = fileSchema.safeParse(data);
  if (!success) log(`Object is not an archivw - ${error}`, LogLevel.ERROR);
  return success;
};

const fileInsertSchema = z.object({
  ...fileSchema.pick({ keyS3: true }).shape,
  s3FileStatus: z.nativeEnum(FileIsSynced).optional(),
});

export type FileInsert = z.infer<typeof fileInsertSchema>;

export const isFileInsert = (data: unknown): data is FileInsert => {
  const { success, error } = fileInsertSchema.safeParse(data);
  if (!success) log(`Object is not an archive - ${error}`, LogLevel.ERROR);
  return success;
};
