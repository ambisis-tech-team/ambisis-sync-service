import http from "k6/http";
import { sleep } from "k6";

export const options = {
  stages: [
    { target: 100, duration: "10m" },
    { target: 250, duration: "10m" },
    { target: 500, duration: "10m" },
  ],
};

export default function () {
  const userId = Math.floor(Math.random() * 1000000);

  const payloadTrigger = {
    dataChangesCentralDb: [],
    dataChangesClientDb: [],
    deletedCentralDb: [],
    deletedClientDb: [],
    lastSyncDate: new Date().getTime(),
    syncedCentralDbTables: [],
    syncedClientDbTables: [],
    syncLogId: "125125412512",
    user_id: userId,
    database: "ambisistest",
  };

  http.post(
    "https://api.ambisis.com.br/test/trigger",
    payloadTrigger,
    {
      headers: {
        "Content-Type": "application/json",
        "public-key":
          "ljCoOfcOnGKkeccFLQo9evuhkAtVYxQUDOBHuzKN63N5ugQBMQ5wXoaKoCG2bWsP",
      },
    }
  );

  const payloadCommit = {
    user_id: userId,
    database: "ambisistest",
  };

  http.post(
    "https://api.ambisis.com.br/test/commit",
    payloadCommit,
    {
      headers: {
        "Content-Type": "application/json",
        "public-key":
          "ljCoOfcOnGKkeccFLQo9evuhkAtVYxQUDOBHuzKN63N5ugQBMQ5wXoaKoCG2bWsP",
      },
    }
  );

  sleep(60);
}
