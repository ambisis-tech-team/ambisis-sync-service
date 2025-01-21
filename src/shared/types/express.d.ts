declare global {
  namespace Express {
    export interface Request {
      session: UserSession;
    }
  }
}

export {};
