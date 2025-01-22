import type { UserSession } from "src/domain/auth/types/session";

declare global {
  namespace Express {
    export interface Request {
      session: UserSession;
    }
  }
}

export {};
