import type { Application } from "express";
import { middleware } from "../middleware";
import { router } from "../routes";

export const server = (app: Application) => {
  middleware(app);

  router(app);
};
