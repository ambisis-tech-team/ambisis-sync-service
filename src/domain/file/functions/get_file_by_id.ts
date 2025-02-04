import { log, LogLevel } from "ambisis_node_helper";
import { assert } from "void-ts";
import { isFile, type File } from "../types/file";
import { FailedToGetFileById } from "../error/failed_to_get_file_by_id";
import { db } from "../../../infra/db/db";

export const getFileById = async (
  id: number,
  database: string
): Promise<File> => {
  try {
    const arquivo = await db.select(
      { from: "arquivo", where: { id: { "=": id } } },
      { database, returnMode: "firstRow" }
    );
    assert(isFile(arquivo), "Selected row isn't of expected shape");
    return arquivo;
  } catch (error) {
    log(
      `Failed to get file by id ${error} - get_file_by_id.ts`,
      LogLevel.ERROR
    );
    throw new FailedToGetFileById();
  }
};
