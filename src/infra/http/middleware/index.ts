import type { Application } from "express";
import { sentry } from "./sentry";
import { cors } from "./cors";
import { multer } from "./multer";
import bodyParser from "./body_parser";
import { ambisisMiddlewarePackage } from "ambisis_node_helper";
import { env } from "../../env/env";
import { auth } from "./auth";

export const middleware = (app: Application) => {
  sentry();
  cors(app);
  multer(app);
  bodyParser(app);
  ambisisMiddlewarePackage(app, { publicKey: env.PUBLIC_KEY });
  auth(app);
};
