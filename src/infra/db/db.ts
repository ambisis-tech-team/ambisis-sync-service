import { DataAccessObject } from "mysql-all-in-one";
import { env } from "../env/env";

const db = new DataAccessObject({
  host: env.DATABASE_HOST,
  port: env.DATABASE_PORT,
  user: env.DATABASE_USER,
  password: env.DATABASE_PASSWORD,
  timezone: "Z",
});

export { db };
