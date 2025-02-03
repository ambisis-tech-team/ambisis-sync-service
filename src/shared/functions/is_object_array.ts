import { isObject } from "./is_object";

export const isObjectArray = (
  data: unknown
): data is Record<string, unknown>[] =>
  Array.isArray(data) && data.every((item) => isObject(item));
