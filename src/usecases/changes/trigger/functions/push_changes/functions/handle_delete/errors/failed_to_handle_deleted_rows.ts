import type { FailedToDeleteRow } from "./failed_to_delete_row";

export class FailedToHandleDeletedRows extends Error {
	constructor(public readonly failedToHandleDeletedRows: FailedToDeleteRow[]) {
		super("Failed to handle deleted rows");
	}
}
