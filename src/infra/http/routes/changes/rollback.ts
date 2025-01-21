import type { Application } from "express";
import { CHANGES } from "../endpoints.json";
import { rollback } from "../../../../usecases/changes/rollback/rollback";

export const rollbackRoute = (app: Application) => {
  app.post(CHANGES.ROLLBACK, rollback);
};
