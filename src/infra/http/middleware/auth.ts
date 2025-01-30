import { ambisisResponse, log, LogLevel } from "ambisis_node_helper";
import { NextFunction, Request, Response, type Application } from "express";
import { isAuthSession } from "../../../domain/auth/types/session";
import { getAuthSession } from "../../../domain/auth/functions/get_auth_session";
import { authToUserSession } from "../../../domain/auth/functions/auth_to_user_session";

export const auth = (app: Application) => {
  app.use(async (req: Request, res: Response, next: NextFunction) => {
    const authToken = req.header("Auth");
    console.log("authToken", authToken);
    if (typeof authToken !== "string")
      return ambisisResponse(res, 401, "UNAUTHORIZED");
    try {
      const response = await getAuthSession(authToken);
      console.log("response", response);
      const responseBody = await response.clone().json();

      if (response.status === 200) {
        const session = await response.json();
        console.log("session", session);
        if (isAuthSession(session?.data)) {
          const userSession = await authToUserSession(session?.data);
          console.log("userSession", userSession);
          if (userSession !== null) {
            req.session = userSession;
            return next();
          }
        }
        throw new Error(`INVALID AUTH SESSION - ${session?.data}`);
      }
      if (typeof responseBody.error !== "string") {
        throw new Error("INVALID_AUTH_RESPONSE");
      }
      return ambisisResponse(res, response.status, responseBody.error);
    } catch (err) {
      log(`Failed to authenticate - ${err}`, LogLevel.ERROR);
      return ambisisResponse(res, 500, "CANNOT_AUTHENTICATE");
    }
  });
};
