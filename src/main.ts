import { server } from "./infra/http/server/server";
import express from "express";

const main = async () => {
  const app = express();

  server(app);

  app.listen(3037);
};

main();
