import type { Application } from "express";
import { triggerRoute } from "./trigger";
import { getInsertedIdsRoute } from "./get_inserted_ids";

export const changesRouter = (app: Application) => {
  triggerRoute(app);
  getInsertedIdsRoute(app);
};
