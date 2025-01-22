import type { FailedToProcessToFile } from "./error/failed_to_process_to_file";
import type { ProcessFile } from "../types/process_file";

export const collectFailedAndSuccessfulFiles = (
  processedFiles: PromiseSettledResult<
    [number, FailedToProcessToFile | null]
  >[],
  files: ProcessFile[]
) =>
  processedFiles.reduce<{
    successUploadedFiles: Array<number>;
    failedUploadedFiles: Array<number>;
  }>(
    (acc, iter, index) => {
      switch (iter.status) {
        case "rejected":
          return {
            ...acc,
            failedUploadedFiles: [
              ...acc.failedUploadedFiles,
              Number(files[index].fieldname),
            ],
          };
        case "fulfilled":
          const [fileId, error] = iter.value;
          if (error) {
            return {
              ...acc,
              failedUploadedFiles: [...acc.failedUploadedFiles, fileId],
            };
          }
          return {
            ...acc,
            successUploadedFiles: [...acc.successUploadedFiles, fileId],
          };
      }
    },
    {
      successUploadedFiles: [],
      failedUploadedFiles: [],
    }
  );
