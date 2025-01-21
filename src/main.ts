import { server } from "./infra/http/server/server";
import express from "express";

const main = async () => {
  const app = express();

  server(app);

  app.listen(8000);
};

main();
