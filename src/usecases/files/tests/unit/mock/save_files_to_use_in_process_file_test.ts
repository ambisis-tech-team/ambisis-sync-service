import { insertFile } from "../../../../../domain/file/functions/insert_file";
import { SyncContext } from "../../../../changes/trigger/functions/utils/sync_context";
import type { ProcessFile } from "../../../types/process_file";

export const saveFilesToUseInProcessFileTest = async (): Promise<
  ProcessFile[]
> => {
  await SyncContext.db.query(
    "CREATE TABLE arquivo (id INT PRIMARY KEY AUTO_INCREMENT, keyS3 VARCHAR(255), s3FileStatus ENUM('synced', 'not_synced') NOT NULL DEFAULT 'synced');"
  );

  const firstFileId = await insertFile(
    SyncContext.db,
    { keyS3: "file_key_s3_1" },
    SyncContext.database
  );

  const secondFiledId = await insertFile(
    SyncContext.db,
    { keyS3: "file_key_s3_2" },
    SyncContext.database
  );

  const thirdFileId = await insertFile(
    SyncContext.db,
    { keyS3: "file_key_s3_1" },
    SyncContext.database
  );

  const fourthFiledId = await insertFile(
    SyncContext.db,
    { keyS3: "file_key_s3_2" },
    SyncContext.database
  );

  return [
    {
      fieldname: firstFileId.toString(),
      filename: "file1",
      mimetype: "text/plain",
      buffer: Buffer.from(""),
    },
    {
      fieldname: secondFiledId.toString(),
      filename: "file2",
      mimetype: "text/plain",
      buffer: Buffer.from(""),
    },
    {
      fieldname: thirdFileId.toString(),
      filename: "file3",
      mimetype: "text/plain",
      buffer: Buffer.from(""),
    },
    {
      fieldname: fourthFiledId.toString(),
      filename: "file4",
      mimetype: "text/plain",
      buffer: Buffer.from(""),
    },
  ];
};
