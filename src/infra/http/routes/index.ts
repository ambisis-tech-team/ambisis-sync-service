import type { Application } from "express";
import { filesRoute } from "./files";
import { changesRoute } from "./changes";

export const router = (app: Application) => {
  filesRoute(app);
  changesRoute(app);
};
