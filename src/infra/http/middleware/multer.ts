import { Application } from "express";
import upload from "multer";

export const multer = (app: Application) => {
  app.use(upload().any());
};
