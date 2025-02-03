import type { Application } from "express";
import { BACKUP } from "./endpoints.json";
import { backup } from "../../../usecases/backup/backup";

export const backupRoute = (app: Application) => {
  app.post(BACKUP, backup);
};
