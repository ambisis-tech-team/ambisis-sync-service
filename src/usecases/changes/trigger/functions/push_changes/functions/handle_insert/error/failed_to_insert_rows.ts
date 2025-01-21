export class FailedToInsertRows extends Error {
	constructor(public readonly table: string, public readonly rows: Record<string, unknown>[]) {
		super("Failed to insert rows");
	}
}
