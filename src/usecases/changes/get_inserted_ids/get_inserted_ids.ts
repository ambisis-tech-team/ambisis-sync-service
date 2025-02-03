import { SPAN_STATUS_ERROR, startSpan } from "@sentry/core";
import { ambisisResponse, log, LogLevel } from "ambisis_node_helper";
import type { Request, Response } from "express";
import { getSyncInsertedIdsBySyncId } from "../../../domain/sync_inserted_ids/functions/get_sync_inserted_ids";
import { db } from "../../../infra/db/db";
import { assert, AssertError } from "void-ts";
import { isGetInsertedIdsBody } from "./types/get_inserted_ids_body";

export const getInsertedIds = async (req: Request, res: Response) =>
  startSpan({ name: "get_inserted_ids" }, async (span) => {
    const { user_id, database } = req.session;
    try {
      assert(isGetInsertedIdsBody(req.body), "Request body is invalid");
      log(
        `Obtaining inserted ids - userId: ${user_id} - database: ${database}`,
        LogLevel.INFO
      );
      const insertedIds = await getSyncInsertedIdsBySyncId(db, req.body.syncId);
      return insertedIds.match({
        isOk: (insertedIds) =>
          ambisisResponse(res, 200, "SUCCESS", insertedIds),
        isErr: (error) => ambisisResponse(res, 500, error.message),
      });
    } catch (error) {
      if (error instanceof AssertError)
        return ambisisResponse(res, 422, error.message);
      span.setStatus({
        code: SPAN_STATUS_ERROR,
        message: "Internal server error",
      });
      log(
        `Unexpected error while trying to commit sync transactions - userId: ${user_id} - database: ${database}`,
        LogLevel.INFO
      );
      return ambisisResponse(res, 500, "INTERNAL SERVER ERROR");
    }
  });
