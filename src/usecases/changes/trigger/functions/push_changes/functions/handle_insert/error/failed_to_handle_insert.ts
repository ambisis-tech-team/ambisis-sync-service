export class FailedToHandleInsert extends Error {
	constructor() {
		super("Failed to handle insert rows");
	}
}
