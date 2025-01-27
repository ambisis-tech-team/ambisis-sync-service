import type { Application } from "express";
import { trigger } from "./trigger-without-auth";
import { commit } from "./commit-without-auth";

export const testRouter = (app: Application) => {
  app.post("/test/trigger", trigger);
  app.post("/test/commit", commit);
};
