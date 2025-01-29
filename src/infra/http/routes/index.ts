import type { Application } from "express";
import { filesRoute } from "./files";
import { changesRouter } from "./changes";
import { healthCheckRoute } from "./health_check";
import { testRouter } from "./test";

export const privateRouter = (app: Application) => {
  filesRoute(app);
  changesRouter(app);
};

export const publicRouter = (app: Application) => {
  testRouter(app);
  healthCheckRoute(app);
};
