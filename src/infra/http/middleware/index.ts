import type { Application } from "express";
import { ambisisMiddlewarePackage } from "ambisis_node_helper";
import { env } from "../../env/env";
import { auth } from "./auth";
import bodyParser from "./body_parser";
import { cors } from "./cors";
import { sentry } from "./sentry";
import multer from "./multer";

export const authMiddleware = (app: Application) => {
  // ambisisMiddlewarePackage(app, { publicKey: env.PUBLIC_KEY });
  auth(app);
};

export const middleware = (app: Application) => {
  sentry();
  cors(app);
  bodyParser(app);
  multer(app);
};
