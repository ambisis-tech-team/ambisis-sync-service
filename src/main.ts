import { log } from "ambisis_node_helper";
import { server } from "./infra/http/server/server";
import express from "express";

const main = async () => {
  const app = express();

  server(app);

  app.listen(3037, () => log("🚀 Server is running on port 3037"));
};

main();
