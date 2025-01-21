import type { Application } from "express";
import { CHANGES } from "../endpoints.json";
import { trigger } from "../../../../usecases/changes/trigger/trigger";

export const triggerRoute = (app: Application) => {
  app.post(CHANGES.TRIGGER, trigger);
};
