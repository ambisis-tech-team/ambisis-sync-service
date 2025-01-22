import { log, LogLevel } from "ambisis_node_helper";
import type { FileInsert } from "../types/file";
import { FailedToUpdateFile } from "../error/failed_to_update_file";
import type { DataAccessObject } from "mysql-all-in-one";
import { assert } from "void-ts";

export const insertFile = async (
  db: DataAccessObject,
  arquivo: FileInsert,
  database: string
) => {
  try {
    const id = await db.insert("arquivo", arquivo, { database });
    assert(typeof id === "number", "Failed to insert file");
    return id;
  } catch (error) {
    log(`Failed to insert file ${error} - insert_file.ts`, LogLevel.ERROR);
    throw new FailedToUpdateFile();
  }
};
