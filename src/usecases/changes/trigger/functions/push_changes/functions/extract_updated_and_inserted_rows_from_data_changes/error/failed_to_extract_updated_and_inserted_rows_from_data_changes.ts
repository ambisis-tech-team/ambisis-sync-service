export class FailedToExtractUpdatedAndInsertedRowsFromDataChanges extends Error {
	constructor() {
		super("Failed to extract updated and inserted rows from data changes");
	}
}
