import type { Application } from "express";
import { CHANGES } from "../endpoints.json";
import { commit } from "../../../../usecases/changes/commit/commit";

export const commitRoute = (app: Application) => {
  app.get(CHANGES.COMMIT, commit);
};
