import { log, LogLevel } from "ambisis_node_helper";
import type { FileUpdate } from "../types/file";
import { FailedToUpdateFile } from "../error/failed_to_update_file";
import type { DataAccessObject } from "mysql-all-in-one";

export const updateFile = async (
  db: DataAccessObject,
  arquivo: FileUpdate,
  database: string
) => {
  try {
    await db.update(
      "arquivo",
      arquivo,
      { id: { "=": arquivo.id } },
      { database }
    );
  } catch (error) {
    log(`Failed to update file ${error} - update_file.ts`, LogLevel.ERROR);
    throw new FailedToUpdateFile();
  }
};
