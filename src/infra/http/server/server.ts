import type { Application } from "express";
import { middleware } from "../middleware";
import { router } from "../routes";
import { publicRouter } from "../routes/public_routes";
import bodyParser from "../middleware/body_parser";

export const server = (app: Application) => {
  bodyParser(app);

  publicRouter(app);

  middleware(app);

  router(app);
};
