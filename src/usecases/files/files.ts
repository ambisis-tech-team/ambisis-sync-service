import { startSpan } from "@sentry/node";
import { ambisisResponse, log, LogLevel } from "ambisis_node_helper";
import type { Request, Response } from "express";
import { SPAN_STATUS_ERROR, SPAN_STATUS_OK } from "@sentry/core";
import busboy from "busboy";
import { s3Client } from "../../infra/s3/client";
import { Upload } from "@aws-sdk/lib-storage";
import { env } from "../../infra/env/env";
import { getFileById } from "../../domain/file/functions/get_file_by_id";
import { EventEmitter } from "stream";
import { updateFile } from "../../domain/file/functions/update_file";
import { db } from "../../infra/db/db";
import { FileIsSynced } from "../../domain/file/types/file";
import { Time } from "../../shared/types/time";

export const files = (req: Request, res: Response) =>
  startSpan({ name: "file" }, async (span) => {
    const { database, user_id } = req.session;
    try {
      log(
        `Starting files sync - userId: ${user_id} - database: ${database}`,
        LogLevel.INFO
      );

      const abortController = new AbortController();

      abortController.signal.addEventListener("abort", () => {
        if (res.writableEnded) return;
        log(
          `Files sync aborted - userId: ${user_id} - database: ${database}`,
          LogLevel.INFO
        );
        span.setStatus({ code: SPAN_STATUS_ERROR, message: "Aborted" });
        ambisisResponse(res, 400, "ABORTED");
        res.end();
      });

      setTimeout(() => abortController.abort(), Time.MINUTE * 5);

      const bb = busboy({ headers: req.headers });

      const failedSuccessfulFiles: {
        successUploadedFiles: Array<number>;
        failedUploadedFiles: Array<number>;
      } = { failedUploadedFiles: [], successUploadedFiles: [] };
      let totalFiles: number = 0;

      const uploads = new EventEmitter();

      uploads.addListener("upload", () => {
        if (res.writableEnded) return;
        if (
          !totalFiles ||
          failedSuccessfulFiles.successUploadedFiles.length +
            failedSuccessfulFiles.failedUploadedFiles.length !==
            totalFiles
        )
          return;
        log(
          `Finished files sync - userId: ${user_id} - database: ${database}`,
          LogLevel.INFO
        );
        span.setStatus({ code: SPAN_STATUS_OK, message: "Files synced" });
        ambisisResponse(res, 200, "SUCCESS", failedSuccessfulFiles);
        res.end();
      });

      bb.on("field", (fieldName, value) => {
        if (fieldName === "totalFiles") totalFiles = Number(value);
      });

      bb.on("file", (fieldName, body, info) => {
        const { mimeType } = info;
        const fileId = Math.abs(Number(fieldName));

        getFileById(fileId, database)
          .then((file) => {
            if (file.s3FileStatus === FileIsSynced.SYNCED) {
              failedSuccessfulFiles.successUploadedFiles.push(fileId);
              uploads.emit("upload");
              return;
            }

            const upload = new Upload({
              client: s3Client,
              params: {
                Bucket: env.AWS_S3_BUCKET,
                Key: file.keyS3,
                Body: body,
                ContentType: mimeType,
              },
            });

            upload
              .done()
              .then(() => {
                log(
                  `File uploaded - fileId: ${fileId} - userId: ${user_id} - database: ${database}`
                );
                updateFile(
                  db,
                  {
                    id: fileId,
                    s3FileStatus: FileIsSynced.SYNCED,
                    modificacaoData: new Date(),
                  },
                  database
                )
                  .then(() => {
                    failedSuccessfulFiles.successUploadedFiles.push(fileId);
                    uploads.emit("upload");
                  })
                  .catch((err) => {
                    log(
                      `Error setting file as synced - ${fileId} - ${user_id} - ${database}: ${err.message}`,
                      LogLevel.ERROR
                    );
                    failedSuccessfulFiles.failedUploadedFiles.push(fileId);
                    uploads.emit("upload");
                  });
              })
              .catch((err) => {
                log(
                  `Error uploading file - ${fileId} - ${user_id} - ${database}: ${err.message}`,
                  LogLevel.ERROR
                );
                failedSuccessfulFiles.failedUploadedFiles.push(fileId);
                uploads.emit("upload");
              });
          })
          .catch((err) => {
            log(
              `Error fetching file by ID - ${fileId} - ${user_id} - ${database}: ${err.message}`,
              LogLevel.ERROR
            );
            failedSuccessfulFiles.failedUploadedFiles.push(fileId);
            uploads.emit("upload");
          });
      });

      req.pipe(bb);
    } catch (error) {
      span.setStatus({
        code: SPAN_STATUS_ERROR,
        message: "Internal server error",
      });
      log(
        `Unexpected error while syncing files - userId: ${user_id} - database: ${database}`,
        LogLevel.INFO
      );
      return ambisisResponse(res, 500, "INTERNAL SERVER ERROR");
    }
  });
