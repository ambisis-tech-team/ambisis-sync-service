import { FailedToProcessToFile } from "./error/failed_to_process_to_file";
import { withActiveSpan, type Span } from "@sentry/node";
import { SPAN_STATUS_ERROR, SPAN_STATUS_OK, startSpan } from "@sentry/core";
import { log, LogLevel } from "ambisis_node_helper";
import { getFileById } from "../../../domain/file/functions/get_file_by_id";
import { putObjectCommand } from "../../../infra/s3/put_object_command";
import { env } from "../../../infra/env/env";
import { FileIsSynced } from "../../../domain/file/types/file";
import { updateFile } from "../../../domain/file/functions/update_file";

export const processFile = async (
  span: Span,
  file: Express.Multer.File,
  database: string
): Promise<[number, FailedToProcessToFile | null]> =>
  withActiveSpan(span, async () =>
    startSpan({ name: `file.processFile.${file.filename}` }, async (span) => {
      try {
        const archiveId = Math.abs(Number(file.fieldname));
        const archive = await getFileById(archiveId, database);
        await putObjectCommand({
          Bucket: env.AWS_S3_BUCKET,
          Key: archive.keyS3,
        });
        await updateFile(
          { id: archiveId, s3FileStatus: FileIsSynced.SYNCED },
          database
        );
        span.setStatus({
          code: SPAN_STATUS_OK,
          message: `File ${file.filename} uploaded - ${archive.keyS3}`,
        });
        return [Number(file.fieldname), null];
      } catch (error) {
        log(
          ` failed to swap foreign keys ${error} - push_changes.ts`,
          LogLevel.ERROR
        );
        span.setStatus({
          code: SPAN_STATUS_ERROR,
          message: `Failed to sync file ${file.fieldname}`,
        });
        return [Number(file.fieldname), new FailedToProcessToFile()];
      }
    })
  );
