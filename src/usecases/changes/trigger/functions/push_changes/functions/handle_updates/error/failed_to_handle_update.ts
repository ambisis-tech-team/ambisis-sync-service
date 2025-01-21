export class FailedToHandleUpdate extends Error {
	constructor(public readonly table: string, public readonly id: number, public readonly data: Record<string, unknown>) {
		super("Failed to handle update");
	}
}
