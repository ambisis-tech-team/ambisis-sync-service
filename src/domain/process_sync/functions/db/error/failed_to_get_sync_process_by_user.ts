export class FailedToGetSyncProcessByUserId extends Error {
	constructor() {
		super("Failed to get sync process by user id");
	}
}
