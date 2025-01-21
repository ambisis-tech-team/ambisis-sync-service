import { S3Client } from "@aws-sdk/client-s3";
import { env } from "../env/env";

export const s3Client = new S3Client({
  region: env.AWS_S3_REGION,
  credentials: {
    accessKeyId: env.AWS_S3_KEY,
    secretAccessKey: env.AWS_S3_SECRET,
  },
  apiVersion: "latest",
});
