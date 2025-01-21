import { Application } from "express";
import fs from "fs";
import upload from "multer";
import path from "path";
import { extensoesPermitidas } from "../../../domain/file/allowed_extensions.json";
import { randomUUID } from "crypto";

export const multer = (app: Application) => {
  app.use(
    upload({
      dest: "upload/",
      fileFilter(req, file, callback) {
        if (!file.originalname.includes(".")) return callback(null, false);
        const extensionArray = file.originalname.split(".");
        const extension =
          extensionArray[extensionArray.length - 1].toLowerCase();

        return extensoesPermitidas.includes(extension)
          ? callback(null, true)
          : callback(null, false);
      },
      storage: upload.diskStorage({
        destination: (req, file, cb) => {
          cb(null, "upload/");
        },
        filename: (req, file, cb) => {
          const fileExtension = path.extname(file.originalname);
          const fileName = file.originalname.substring(
            0,
            file.originalname.lastIndexOf(".")
          );
          const fullFilePath = `${Date.now()}-${fileName}-${randomUUID()}${fileExtension}`;

          // Creates the "upload" folder if it doesn't exist
          if (!fs.existsSync("upload/")) {
            fs.mkdirSync("upload");
          }

          cb(null, fullFilePath);
        },
      }),
    }).any()
  );
};
