import type { Application } from "express";
import { filesRoute } from "./files";

export const router = (app: Application) => {
  filesRoute(app);
};
