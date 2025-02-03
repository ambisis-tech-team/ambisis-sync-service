import type { Application } from "express";
import { CHANGES } from "../endpoints.json";
import { getInsertedIds } from "../../../../usecases/changes/get_inserted_ids/get_inserted_ids";

export const getInsertedIdsRoute = (app: Application) => {
  app.post(CHANGES.GET_INSERTED_IDS, getInsertedIds);
};
