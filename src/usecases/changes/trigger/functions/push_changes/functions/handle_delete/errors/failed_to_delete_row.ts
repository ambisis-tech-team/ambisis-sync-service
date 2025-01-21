export class FailedToDeleteRow extends Error {
	constructor(public readonly error: unknown, public readonly table: string, public readonly ids: number[]) {
		super("Failed to delete row");
	}
}
