import { log, LogLevel } from "ambisis_node_helper";
import { z } from "zod";

export const authSessionSchema = z.object({
  user_id: z.number(),
  client_id: z.number(),
});

export type AuthSession = z.infer<typeof authSessionSchema>;

const userSession = z.object({
  user_id: z.number(),
  client_id: z.number(),
  database: z.string(),
  uuid: z.string(),
});

export type UserSession = z.infer<typeof userSession>;

export const isAuthSession = (session: unknown): session is AuthSession => {
  const { success, error } = authSessionSchema.safeParse(session);
  if (error)
    log(
      `Object doesn't match the expected shape - ${error} - session.ts`,
      LogLevel.ERROR
    );
  return success;
};

export const isUserSession = (session: unknown): session is UserSession => {
  const { error, success } = userSession.safeParse(session);
  if (error)
    log(
      `Object doesn't match the expected shape - ${error} - session.ts`,
      LogLevel.ERROR
    );
  return success;
};
