export const extractTableFromColumn = (column: string) => {
  if (column.endsWith("_id")) return column.slice(0, -3);
  if (column.endsWith("Id")) return column.slice(0, -2);
  return null;
};
