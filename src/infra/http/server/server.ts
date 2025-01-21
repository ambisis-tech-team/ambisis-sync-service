import type { Application } from "express";
import { middleware } from "../middleware";

export const server = (app: Application) => {
  middleware(app);
  
};
