import { describe, expect, it } from "vitest";
import { collectFailedAndSuccessfulFiles } from "../../functions/collect_failed_and_successful_files";
import type { ProcessFile } from "../../types/process_file";
import { FailedToProcessToFile } from "../../functions/error/failed_to_process_to_file";

describe("Test the function that matches the successful and failed files sync", () => {
  it("All files sync correctly without problems", () => {
    const MOCK_FILES: ProcessFile[] = [
      {
        fieldname: "1",
        filename: "file1",
        mimetype: "text/plain",
        buffer: Buffer.from(""),
      },
      {
        fieldname: "2",
        filename: "file2",
        mimetype: "text/plain",
        buffer: Buffer.from(""),
      },
      {
        fieldname: "3",
        filename: "file3",
        mimetype: "text/plain",
        buffer: Buffer.from(""),
      },
      {
        fieldname: "4",
        filename: "file4",
        mimetype: "text/plain",
        buffer: Buffer.from(""),
      },
    ];
    const MOCK_PROCESSED_FILES: PromiseSettledResult<
      [number, FailedToProcessToFile | null]
    >[] = [
      { status: "fulfilled", value: [1, null] },
      { status: "fulfilled", value: [2, null] },
      { status: "fulfilled", value: [3, null] },
      { status: "fulfilled", value: [4, null] },
    ];

    const successAndErrorFiles = collectFailedAndSuccessfulFiles(
      MOCK_PROCESSED_FILES,
      MOCK_FILES
    );

    expect(successAndErrorFiles).toEqual({
      successUploadedFiles: [
        Number(MOCK_FILES[0].fieldname),
        Number(MOCK_FILES[1].fieldname),
        Number(MOCK_FILES[2].fieldname),
        Number(MOCK_FILES[3].fieldname),
      ],
      failedUploadedFiles: [],
    });
  });

  it("All files fail to sync", () => {
    const MOCK_FILES: ProcessFile[] = [
      {
        fieldname: "1",
        filename: "file1",
        mimetype: "text/plain",
        buffer: Buffer.from(""),
      },
      {
        fieldname: "2",
        filename: "file2",
        mimetype: "text/plain",
        buffer: Buffer.from(""),
      },
      {
        fieldname: "3",
        filename: "file3",
        mimetype: "text/plain",
        buffer: Buffer.from(""),
      },
      {
        fieldname: "4",
        filename: "file4",
        mimetype: "text/plain",
        buffer: Buffer.from(""),
      },
    ];
    const MOCK_PROCESSED_FILES: PromiseSettledResult<
      [number, FailedToProcessToFile | null]
    >[] = [
      { status: "fulfilled", value: [1, new FailedToProcessToFile()] },
      { status: "fulfilled", value: [2, new FailedToProcessToFile()] },
      { status: "fulfilled", value: [3, new FailedToProcessToFile()] },
      { status: "fulfilled", value: [4, new FailedToProcessToFile()] },
    ];

    const successAndErrorFiles = collectFailedAndSuccessfulFiles(
      MOCK_PROCESSED_FILES,
      MOCK_FILES
    );

    expect(successAndErrorFiles).toEqual({
      successUploadedFiles: [],
      failedUploadedFiles: [
        Number(MOCK_FILES[0].fieldname),
        Number(MOCK_FILES[1].fieldname),
        Number(MOCK_FILES[2].fieldname),
        Number(MOCK_FILES[3].fieldname),
      ],
    });
  });

  it("Some files fail and some are successful", () => {
    const MOCK_FILES: ProcessFile[] = [
      {
        fieldname: "1",
        filename: "file1",
        mimetype: "text/plain",
        buffer: Buffer.from(""),
      },
      {
        fieldname: "2",
        filename: "file2",
        mimetype: "text/plain",
        buffer: Buffer.from(""),
      },
      {
        fieldname: "3",
        filename: "file3",
        mimetype: "text/plain",
        buffer: Buffer.from(""),
      },
      {
        fieldname: "4",
        filename: "file4",
        mimetype: "text/plain",
        buffer: Buffer.from(""),
      },
    ];
    const MOCK_PROCESSED_FILES: PromiseSettledResult<
      [number, FailedToProcessToFile | null]
    >[] = [
      { status: "fulfilled", value: [1, null] },
      { status: "fulfilled", value: [2, null] },
      { status: "fulfilled", value: [3, new FailedToProcessToFile()] },
      { status: "fulfilled", value: [4, new FailedToProcessToFile()] },
    ];

    const successAndErrorFiles = collectFailedAndSuccessfulFiles(
      MOCK_PROCESSED_FILES,
      MOCK_FILES
    );

    expect(successAndErrorFiles).toEqual({
      successUploadedFiles: [
        Number(MOCK_FILES[0].fieldname),
        Number(MOCK_FILES[1].fieldname),
      ],
      failedUploadedFiles: [
        Number(MOCK_FILES[2].fieldname),
        Number(MOCK_FILES[3].fieldname),
      ],
    });
  });
});
