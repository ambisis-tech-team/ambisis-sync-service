import type { Application } from "express";
import { trigger } from "./trigger_without_auth";
import { commit } from "./commit_without_auth";

export const testRouter = (app: Application) => {
  app.post("/test/trigger", trigger);
  app.post("/test/commit", commit);
};
