export const isObjectArray = (
  data: unknown
): data is Array<Record<string, unknown>> =>
  Array.isArray(data) && data.every((item) => typeof item === "object");
