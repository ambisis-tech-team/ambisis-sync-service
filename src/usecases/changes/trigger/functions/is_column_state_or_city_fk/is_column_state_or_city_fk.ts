export const isColumnStateOrCityFk = (column: string): boolean => {
  return column === "estadoId" || column === "cidadeId" || column === "ufId";
};
