import { guessIfColumnIsForeignKey } from "../../../guess_if_column_is_foreign_key/guess_if_column_is_foreign_key";
import type { MappedForeignKeys } from "../../../push_changes/functions/map_foreign_keys/types/mapped_foreign_keys";
import { negativeColumn } from "./negative_column";
import { sqlExpression } from "mysql-all-in-one/QueryBuilder/sql_expression";

export const getColumnsSelectFromColumnNamesAndForeignKeyMappings = (table: string, foreignKeyMap: MappedForeignKeys, columnNames: string[]) => {
	const fks = foreignKeyMap[table];
	if (!fks)
		return {
			...columnNames.reduce((acc, column) => {
				if (column === "id" || guessIfColumnIsForeignKey(column)) return { ...acc, [column]: sqlExpression`${negativeColumn(column)}` };
				return { ...acc, [column]: column };
			}, {}),
		};
	const columns = columnNames.reduce((acc, column) => {
		if (column === "id" || guessIfColumnIsForeignKey(column)) return { ...acc, [column]: sqlExpression`${negativeColumn(column)}` };
		const fk = fks.find((fk) => fk.parentColumn === column);
		if (!fk) return { ...acc, [column]: column };
		return { ...acc, [column]: sqlExpression`${negativeColumn(column)}` };
	}, {});
	return columns;
};
