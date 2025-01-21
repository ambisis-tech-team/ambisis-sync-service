export type MappedForeignKeys = {
	[table: string]: {
		parentColumn: string;
		referencedTable: string;
		referencedColumn: string;
	}[];
};
