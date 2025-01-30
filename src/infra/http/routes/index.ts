import type { Application } from "express";
import { filesRoute } from "./files";
import { changesRouter } from "./changes";
import { healthCheckRoute } from "./health_check";

export const privateRouter = (app: Application) => {
  filesRoute(app);
  changesRouter(app);
};

export const publicRouter = (app: Application) => {
  healthCheckRoute(app);
};
