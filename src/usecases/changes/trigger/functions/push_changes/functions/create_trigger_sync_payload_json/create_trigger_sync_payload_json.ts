import { env } from "../../../../../../../infra/env/env";
import { putObjectCommand } from "../../../../../../../infra/s3/put_object_command";
import type { SyncRequest } from "../../../../types/trigger_request";

export const createTriggerSyncPayloadJson = async (
  database: string,
  userId: number,
  syncLogId: string,
  payload: SyncRequest
) => {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(JSON.stringify(payload));

  await putObjectCommand({
    Bucket: env.AWS_S3_BUCKET,
    Key: `trigger_sync_payload/${database}/${userId}/${syncLogId}.json`,
    Body: bytes,
  });
};
