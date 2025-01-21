import type { Application } from "express";
import { commitRoute } from "./commit";
import { rollbackRoute } from "./rollback";
import { triggerRoute } from "./trigger";

export const changesRoute = (app: Application) => {
  commitRoute(app);
  rollbackRoute(app);
  triggerRoute(app);
};
