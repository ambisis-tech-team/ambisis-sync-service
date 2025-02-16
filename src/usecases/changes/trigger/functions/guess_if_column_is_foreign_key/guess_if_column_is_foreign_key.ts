import { foreignKeysWithCentralDatabase } from "./constants/foreign_keys_with_central_database";

export function guessIfColumnIsForeignKey(
  table: string,
  column: string
): boolean {
  const hasCommonSuffix =
    column.endsWith("_id") ||
    column.endsWith("Id") ||
    column === "modificacaoUsuario";
  if (hasCommonSuffix) return true;
  const tableForeignKeysWithCentralDb =
    foreignKeysWithCentralDatabase.get(table);
  if (!tableForeignKeysWithCentralDb) return false;
  return tableForeignKeysWithCentralDb.includes(column);
}
