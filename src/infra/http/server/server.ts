import type { Application } from "express";
import { middleware } from "../middleware";
import { router } from "../routes";
import { publicRouter } from "../routes/public_routes";

export const server = (app: Application) => {
  publicRouter(app);

  middleware(app);

  router(app);
};
