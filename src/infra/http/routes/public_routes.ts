import type { Application } from "express";
import { healthCheckRoute } from "./health_check";
import { testRouter } from "./test";

export const publicRouter = (app: Application) => {
  healthCheckRoute(app);
  testRouter(app);
};
