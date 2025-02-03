import type { Application } from "express";
import { commitRoute } from "./commit";
import { rollbackRoute } from "./rollback";
import { triggerRoute } from "./trigger";
import { getInsertedIdsRoute } from "./get_inserted_ids";

export const changesRouter = (app: Application) => {
  commitRoute(app);
  rollbackRoute(app);
  triggerRoute(app);
  getInsertedIdsRoute(app);
};
