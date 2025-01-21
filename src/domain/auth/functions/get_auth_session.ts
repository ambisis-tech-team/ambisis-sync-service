import { env } from "../../../infra/env/env";

export const getAuthSession = async (authToken: string) => {
  return await fetch(`${env.AUTH_SERVICE_URL}/auth_session`, {
    headers: {
      "auth-token": authToken,
      "public-key": env.AUTH_SERVICE_PUBLIC_KEY,
      "private-key": env.AUTH_SERVICE_PRIVATE_KEY,
    },
  });
};
