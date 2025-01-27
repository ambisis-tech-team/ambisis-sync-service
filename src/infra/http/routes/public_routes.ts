import type { Application } from "express";
import { healthCheckRoute } from "./health_check";

export const publicRouter = (app: Application) => {
  healthCheckRoute(app);
};
