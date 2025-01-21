import type { Application } from "express";
import { FILES } from "./endpoints.json";
import { files } from "../../../usecases/files/files";

export const filesRoute = (app: Application) => {
  app.post(FILES, files);
};
