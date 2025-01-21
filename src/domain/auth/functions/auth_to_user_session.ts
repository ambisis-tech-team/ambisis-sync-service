import { db } from "../../../infra/db/db";
import { isUserSession, type AuthSession } from "../types/session";

export const authToUserSession = async (authSession: AuthSession) => {
  const database = await db.select(
    {
      from: "cliente",
      columns: "database",
      where: { id: authSession.client_id },
    },
    { returnMode: "firstValue", database: "ambisis" }
  );
  const userSession = {
    ...authSession,
    database,
  };
  if (!isUserSession(userSession)) return null;
  return userSession;
};
