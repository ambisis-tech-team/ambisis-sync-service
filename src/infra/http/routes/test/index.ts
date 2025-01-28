import type { Application } from "express";
import { trigger } from "./trigger_without_auth";
import { commit } from "./commit_without_auth";
import { TEST } from "../endpoints.json";

export const testRouter = (app: Application) => {
  app.post(TEST.CHANGES.TRIGGER, trigger);
  app.post(TEST.CHANGES.COMMIT, commit);
};
