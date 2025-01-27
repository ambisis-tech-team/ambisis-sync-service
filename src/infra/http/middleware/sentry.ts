import { expressIntegration, init } from "@sentry/node";
import { env } from "../../env/env";

export const sentry = () =>
  init({
    dsn: env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    integrations: [expressIntegration()],
  });
