import type { Application } from "express";
import { authMiddleware, middleware } from "../middleware";
import { privateRouter, publicRouter } from "../routes";

export const server = (app: Application) => {
  middleware(app);

  publicRouter(app);

  authMiddleware(app);

  privateRouter(app);
};
