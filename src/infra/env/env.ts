import { z } from "zod";
import "dotenv/config";

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  PUBLIC_KEY: z.string(),
  AUTH_SERVICE_URL: z.string(),
  AUTH_SERVICE_PUBLIC_KEY: z.string(),
  AUTH_SERVICE_PRIVATE_KEY: z.string(),

  PRIVATE_SERVICE_URL: z.string(),
  PRIVATE_SERVICE_PRIVATE_KEY: z.string(),

  DATABASE_HOST: z.string(),
  DATABASE_PORT: z.coerce.number(),
  DATABASE_USER: z.string(),
  DATABASE_PASSWORD: z.string(),

  AWS_S3_REGION: z.string(),
  AWS_S3_KEY: z.string(),
  AWS_S3_SECRET: z.string(),
  AWS_S3_BUCKET: z.string(),

  SENTRY_DSN: z.string(),
});

export const env = envSchema.parse(process.env);
