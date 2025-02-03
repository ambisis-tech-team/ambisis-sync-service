import { log } from "ambisis_node_helper";
import { z } from "zod";

export const getInsertedIdsBodySchema = z.object({
  syncId: z.string(),
});

export type GetInsertedIdsBody = z.infer<typeof getInsertedIdsBodySchema>;

export const isGetInsertedIdsBody = (
  data: unknown
): data is GetInsertedIdsBody => {
  const { success, error } = getInsertedIdsBodySchema.safeParse(data);
  if (error) {
    log;
  }
  return success;
};
