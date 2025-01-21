export class FailedToDisabledForeignKeyChecks extends Error {
	constructor() {
		super("Failed to disable foreign key checks");
	}
}

export class FailedToEnableForeignKeyChecks extends Error {
	constructor() {
		super("Failed to enable foreign key checks");
	}
}
