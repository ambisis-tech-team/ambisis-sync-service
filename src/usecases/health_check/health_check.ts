import type { Request, Response } from "express";

export const healthCheck = (req: Request, res: Response) => {
  res.sendStatus(204);
};
