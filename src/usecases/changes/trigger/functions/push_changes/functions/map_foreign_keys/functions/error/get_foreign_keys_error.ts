export class GetForeignKeysError extends Error {
	constructor() {
		super("Failed to get foreign keys");
	}
}
