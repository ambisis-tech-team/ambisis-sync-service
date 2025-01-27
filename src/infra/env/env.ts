import { z } from "zod";
import "dotenv/config";

export const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PUBLIC_KEY: z.string().default("12345"),
  AUTH_SERVICE_URL: z.string().default("http://auth_service:3031"),
  AUTH_SERVICE_PUBLIC_KEY: z.string().default("12345"),
  AUTH_SERVICE_PRIVATE_KEY: z.string().default("12345"),

  PRIVATE_SERVICE_URL: z.string().default("http://private_services:3036"),
  PRIVATE_SERVICE_PRIVATE_KEY: z.string().default("12345"),

  DB_HOST: z.string().default("mysql_local"),
  DB_PORT: z.coerce.number().default(3306),
  DB_USER: z.string().default("root"),
  DB_PASSWORD: z.string().default(""),

  AWS_S3_REGION: z.string(),
  AWS_S3_KEY: z.string(),
  AWS_S3_SECRET: z.string(),
  AWS_S3_BUCKET: z.string(),

  SENTRY_DSN: z.string(),
});

export const env = envSchema.parse(process.env);
