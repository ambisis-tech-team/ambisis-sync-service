import type { Application } from "express";
import { CHANGES } from "../endpoints.json";

export const getInsertedIdsRoute = (app: Application) => {
  app.post(CHANGES.GET_INSERTED_IDS, getInsertedIdsRoute);
};
