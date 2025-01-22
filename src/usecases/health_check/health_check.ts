import type { Request, Response } from "express";

export const healthCheck = (req: Request, res: Response) => {
  return res.sendStatus(204);
};
