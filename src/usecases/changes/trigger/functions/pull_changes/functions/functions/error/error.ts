export class FailedToPullTables extends Error {
	constructor() {
		super("Failed to pull tables");
	}
}

export class FailedToPullUnsycedTable extends Error {
	constructor() {
		super("Failed to pull unsynced tables");
	}
}

export class FailedToPullDeletedRows extends Error {
	constructor() {
		super("Failed to pull deleted rows");
	}
}

export class FailedToGetTableColumns extends Error {
	constructor() {
		super("Failed to get table columns");
	}
}
