import { startSpan } from "@sentry/core";
import { ambisisResponse, log, LogLevel } from "ambisis_node_helper";
import type { Request, Response } from "express";
import { putObjectCommand } from "../../infra/s3/put_object_command";
import { randomUUID } from "crypto";
import { env } from "../../infra/env/env";
import { ambisisSpan } from "../../shared/functions/ambisis_span";

export const backup = async (req: Request, res: Response) =>
  startSpan({ name: "backup" }, async (span) => {
    const { user_id, database } = req.session;
    try {
      const files = req.files as Express.Multer.File[];
      const backupFile = files.find((file) => file.fieldname === "database");
      if (!backupFile)
        return ambisisResponse(res, 422, "Backup file not found");
      log(`Generating mobile database backup - ${user_id} - ${database}`);
      await putObjectCommand({
        Bucket: env.AWS_S3_BUCKET,
        Key: `mobile-backups/${database}/${user_id}/${randomUUID()}.db`,
        Body: backupFile.buffer,
      });
      ambisisSpan(span, { status: "ok" });
      return ambisisResponse(res, 200, "SUCCESS");
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
