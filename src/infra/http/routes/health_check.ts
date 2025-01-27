import type { Application } from "express";
import { HEALTH_CHECK } from "./endpoints.json";
import { healthCheck } from "../../../usecases/health_check/health_check";

export const healthCheckRoute = (app: Application) => {
  app.get(HEALTH_CHECK, healthCheck);
};
