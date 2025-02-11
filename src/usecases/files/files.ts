import { startSpan } from "@sentry/node";
import { ambisisResponse, log, LogLevel } from "ambisis_node_helper";
import type { Request, Response } from "express";
import { SPAN_STATUS_ERROR, SPAN_STATUS_OK } from "@sentry/core";
import busboy from "busboy";
import { s3Client } from "../../infra/s3/client";
import { Upload } from "@aws-sdk/lib-storage";
import { env } from "../../infra/env/env";
import { getFileById } from "../../domain/file/functions/get_file_by_id";
import internal from "stream";
import { updateFile } from "../../domain/file/functions/update_file";
import { db } from "../../infra/db/db";
import { FileIsSynced } from "../../domain/file/types/file";
import { Time } from "../../shared/types/time";

export const files = (req: Request, res: Response) =>
  startSpan({ name: "file" }, async (span) => {
    const { database, user_id } = req.session;
    const abortController = new AbortController();

    const abortTimeout = setTimeout(
      () => abortController.abort(),
      Time.MINUTE * 10
    );

    try {
      log(
        `Starting files sync - userId: ${user_id} - database: ${database}`,
        LogLevel.INFO
      );

      req.on("close", () => {
        if (abortController.signal.aborted) return;
        log(
          `Request closed prematurely - userId: ${user_id} - database: ${database}`,
          LogLevel.INFO
        );
        abortController.abort("Client Disconnect");
      });

      abortController.signal.addEventListener("abort", () => {
        clearTimeout(abortTimeout);
        if (res.writableEnded) return;
        log(
          `Files sync aborted - userId: ${user_id} - database: ${database}`,
          LogLevel.INFO
        );
        span.setStatus({ code: SPAN_STATUS_ERROR, message: "Aborted" });
        ambisisResponse(res, 400, "ABORTED");
        res.end();
      });

      const bb = busboy({
        headers: req.headers,
        limits: { fields: 1, files: 5 },
      });

      const failedSuccessfulFiles: {
        successUploadedFiles: Array<number>;
        failedUploadedFiles: Array<number>;
      } = { failedUploadedFiles: [], successUploadedFiles: [] };
      let totalFiles: number = 0;
      let processedFiles: number = 0;

      bb.on("field", (fieldName, value) => {
        if (fieldName === "totalFiles") totalFiles = Number(value);
      });

      const processFile = async (
        fieldName: string,
        body: internal.Readable,
        info: busboy.FileInfo
      ) => {
        if (res.writableEnded || abortController.signal.aborted) {
          body.resume();
          return;
        }

        const { mimeType } = info;
        const fileId = Math.abs(Number(fieldName));

        try {
          const file = await getFileById(fileId, database);

          if (file.s3FileStatus === FileIsSynced.SYNCED) {
            failedSuccessfulFiles.successUploadedFiles.push(fileId);
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
            partSize: 5 * 1024 * 1024,
            leavePartsOnError: false,
          });

          await upload.done();

          log(
            `File uploaded - fileId: ${fileId} - userId: ${user_id} - database: ${database}`
          );

          await updateFile(
            db,
            {
              id: fileId,
              s3FileStatus: FileIsSynced.SYNCED,
              modificacaoData: new Date(),
            },
            database
          );

          failedSuccessfulFiles.successUploadedFiles.push(fileId);
        } catch (error) {
          log(
            `Error fetching file by ID - ${fileId} - ${user_id} - ${database}: ${error}`,
            LogLevel.ERROR
          );
          failedSuccessfulFiles.failedUploadedFiles.push(fileId);
        } finally {
          body.resume();
          processedFiles++;
          if (
            processedFiles !== totalFiles ||
            res.writableEnded ||
            abortController.signal.aborted
          )
            return;
          clearTimeout(abortTimeout);
          log(
            `Finished files sync - userId: ${user_id} - database: ${database}`,
            LogLevel.INFO
          );
          span.setStatus({
            code: SPAN_STATUS_OK,
            message: "Files synced",
          });
          ambisisResponse(res, 200, "SUCCESS", failedSuccessfulFiles);
          res.end();
        }
      };

      bb.on("file", (fieldName, body, info) => {
        processFile(fieldName, body, info);
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
