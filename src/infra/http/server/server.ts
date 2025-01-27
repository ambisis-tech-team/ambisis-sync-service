import type { Application } from "express";
import { middleware } from "../middleware";
import { router } from "../routes";
import { healthCheckRoute } from "../routes/health_check";

export const server = (app: Application) => {
  healthCheckRoute(app);

  middleware(app);

  router(app);
};
