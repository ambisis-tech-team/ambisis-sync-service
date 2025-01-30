import { Application } from "express";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fieldSize: 25 * 1024 * 1024 } });

export default function (app: Application) {
  app.use(upload.any());
}
