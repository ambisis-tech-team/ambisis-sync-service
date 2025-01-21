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
