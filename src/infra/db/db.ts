import { DataAccessObject } from "mysql-all-in-one";
import { env } from "../env/env";
import { Time } from "../../shared/types/time";

const db = new DataAccessObject({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  timezone: "Z",
  connectTimeout: Time.MINUTE,
  connectionLimit: 500,
});

export { db };
