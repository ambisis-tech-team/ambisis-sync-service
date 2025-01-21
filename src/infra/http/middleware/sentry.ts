import { expressIntegration, init } from "@sentry/node";

export const sentry = () =>
  init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.1,
    integrations: [expressIntegration()],
  });
