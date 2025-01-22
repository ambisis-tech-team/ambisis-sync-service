import { startSpan } from "@sentry/node";
import { ambisisResponse, log, LogLevel } from "ambisis_node_helper";
import type { Request, Response } from "express";
import { processFile } from "./functions/process_file";
import { collectFailedAndSuccessfulFiles } from "./functions/collect_failed_and_successful_files";
import { SPAN_STATUS_ERROR, SPAN_STATUS_OK } from "@sentry/core";
import { db } from "src/infra/db/db";

export const files = (req: Request, res: Response) =>
  startSpan({ name: "file" }, async (span) => {
    const { database, user_id } = req.session;
    try {
      log(
        `Starting files sync - userId: ${user_id} - database: ${database}`,
        LogLevel.INFO
      );

      const files = req.files as Express.Multer.File[];

      const processedFiles = await Promise.allSettled(
        files.map((file) => processFile(db, span, file, database))
      );

      const failedSuccessfulFiles = collectFailedAndSuccessfulFiles(
        processedFiles,
        files
      );
      log(
        `Finished files sync - userId: ${user_id} - database: ${database}`,
        LogLevel.INFO
      );

      span.setStatus({ code: SPAN_STATUS_OK, message: "Files synced" });

      return ambisisResponse(res, 200, "SUCCESS", failedSuccessfulFiles);
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
