import type { Application } from "express";
import { HEALTH_CHECK } from "./endpoints.json";

export const healthCheckRoute = (app: Application) => {
  app.get(HEALTH_CHECK, healthCheckRoute);
};
