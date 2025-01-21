export const isNumberArray = (data: unknown): data is Array<number> =>
  Array.isArray(data) && data.every((item) => typeof item === "number");
