import { SPAN_STATUS_ERROR, startSpan } from "@sentry/core";
import { ambisisResponse, log, LogLevel } from "ambisis_node_helper";
import type { Request, Response } from "express";
import { randomUUID } from "crypto";
import { env } from "../../infra/env/env";
import { ambisisSpan } from "../../shared/functions/ambisis_span";
import busboy from "busboy";
import { Upload } from "@aws-sdk/lib-storage";
import { s3Client } from "../../infra/s3/client";
import { EventEmitter } from "stream";
import { Time } from "../../shared/types/time";

export const backup = async (req: Request, res: Response) =>
  startSpan({ name: "backup" }, async (span) => {
    const { user_id, database } = req.session;
    try {
      const bb = busboy({ headers: req.headers });

      const abortController = new AbortController();

      abortController.signal.addEventListener("abort", () => {
        if (res.writableEnded) return;
        log(
          `Timed out trying to create backup - userId: ${user_id} - database: ${database}`,
          LogLevel.INFO
        );
        span.setStatus({ code: SPAN_STATUS_ERROR, message: "Aborted" });
        ambisisResponse(res, 400, "ABORTED");
        res.end();
      });

      setTimeout(() => abortController.abort(), Time.MINUTE * 5);

      const backupUpload = new EventEmitter();

      backupUpload.addListener("finish", () => {
        if (res.writableEnded) return;
        log(
          `Finished mobile database backup - ${user_id} - ${database}`,
          LogLevel.INFO
        );
        ambisisResponse(res, 200, "SUCCESS");
        res.end();
      });

      bb.on("file", (fieldName, body, info) => {
        const { mimeType } = info;

        if (fieldName !== "database") return;

        log(
          `Starting mobile database backup - ${user_id} - ${database}`,
          LogLevel.INFO
        );

        const upload = new Upload({
          client: s3Client,
          params: {
            Bucket: env.AWS_S3_BUCKET,
            Key: `mobile-backups/${database}/${user_id}/${randomUUID()}.db`,
            Body: body,
            ContentType: mimeType,
          },
        });

        upload
          .done()
          .then(() => backupUpload.emit("finish"))
          .catch((error) => {
            if (res.writableEnded) return;
            log(
              `Failed to generate mobile database backup - ${user_id} - ${database} - ${error}`,
              LogLevel.ERROR
            );
            ambisisResponse(res, 500, "INTERNAL SERVER ERROR");
            ambisisSpan(span, { status: "error" });
            res.end();
          });
      });

      req.pipe(bb);
    } catch (error) {
      ambisisSpan(span, {
        status: "error",
        message: `Failed tot generate mobile database backup - ${user_id} - ${database} - ${error}`,
      });
      log(
        `Failed tot generate mobile database backup - ${user_id} - ${database} - ${error}`,
        LogLevel.ERROR
      );
      return ambisisResponse(res, 500, "INTERNAL SERVER ERROR");
    }
  });
