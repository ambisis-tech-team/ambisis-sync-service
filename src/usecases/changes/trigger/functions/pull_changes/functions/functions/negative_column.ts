import { sqlExpression } from "mysql-all-in-one/QueryBuilder/sql_expression";
import { sqlCol } from "mysql-all-in-one/QueryBuilder/utils";

export const negativeColumn = (column: string) => sqlExpression`(CAST(${sqlCol(column)} AS SIGNED) * -1)`;
