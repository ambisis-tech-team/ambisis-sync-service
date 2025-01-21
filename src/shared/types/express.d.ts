import type { UserSession } from "@/domain/auth/types/session";

declare global {
  namespace Express {
    export interface Request {
      session: UserSession;
    }
  }
}

export {};
