import { Application } from "express";
import corsPackage from "cors";
import { env } from "../../env/env";

export const cors = (app: Application) => {
  const origin = [
    "https://homolog.app.ambisis.com.br",
    "https://app.ambisis.com.br",
    "https://next.app.ambisis.com.br",
    "https://homolog-next.app.ambisis.com.br",
  ];

  if (env.NODE_ENV !== "production") {
    origin.push("http://app.ambisis.localhost", "http://localhost:3000");
  }

  app.use(
    corsPackage({
      origin: origin,
      allowedHeaders: [
        "Origin",
        "X-Requested-With",
        "Content-Type",
        "Accept",
        "Authorization",
        "Auth",
        "private-key",
        "public-key",
        "baggage",
        "sentry-trace",
      ],
      methods: ["GET", "POST", "OPTIONS"],
    })
  );
};
