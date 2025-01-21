import { db } from "../../../infra/db/db";
import { log, LogLevel } from "ambisis_node_helper";
import type { FileUpdate } from "../types/file";
import { FailedToUpdateFile } from "../error/failed_to_update_file";

export const updateFile = async (arquivo: FileUpdate, database: string) => {
  try {
    await db.update(
      "arquivo",
      arquivo,
      { id: { "=": arquivo.id } },
      { database }
    );
  } catch (error) {
    log(
      `Failed to swap foreign keys ${error} - push_changes.ts`,
      LogLevel.ERROR
    );
    throw new FailedToUpdateFile();
  }
};
