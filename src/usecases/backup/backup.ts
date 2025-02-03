import { startSpan } from "@sentry/core";
import { ambisisResponse, log, LogLevel } from "ambisis_node_helper";
import type { Request, Response } from "express";
import { putObjectCommand } from "../../infra/s3/put_object_command";
import { randomUUID } from "crypto";
import { env } from "../../infra/env/env";
import { ambisisSpan } from "../../shared/functions/ambisis_span";

export const backup = async (req: Request, res: Response) =>
  startSpan({ name: "backup" }, async (span) => {
    const { user_id, database } = req.body;
    try {
      const files = req.files as Express.Multer.File[];
      const backupFile = files.find((file) => file.filename === "database.db");
      if (!backupFile)
        return ambisisResponse(res, 422, "Backup file not found");
      await putObjectCommand({
        Bucket: env.AWS_S3_BUCKET,
        Key: `mobile-backups/${user_id}/${database}/${randomUUID()}.db`,
        Body: backupFile.buffer,
      });
      ambisisSpan(span, { status: "ok" });
    } catch (error) {
      ambisisSpan(span, {
        status: "error",
        message: `Failed tot generate mobile database backup - ${user_id} - ${database} - ${error}`,
      });
      log(
        `Failed tot generate mobile database backup - ${user_id} - ${database} - ${error}`,
        LogLevel.ERROR
      );
      return ambisisResponse(res, 500, "Failed to generate backup");
    }
  });
