import {
  PutObjectCommand,
  type PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import { log, LogLevel } from "ambisis_node_helper";
import { FailedToPutObject } from "./error/failed_to_put_object";
import { s3Client } from "./client";

export const putObjectCommand = async (params: PutObjectCommandInput) => {
  try {
    return await s3Client.send(new PutObjectCommand(params));
  } catch (error) {
    log(`Failed to put object ${error}`, LogLevel.ERROR);
    throw new FailedToPutObject();
  }
};
