import http from "k6/http";
import { sleep } from 'k6';

export const options = {
  stages: [
    { target: 100, duration: "10m" },
    { target: 250, duration: "10m" },
    { target: 500, duration: "10m" },
  ],
};

export default function () {
  const userId = new Date().getTime();

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
    "https://api.ambisis.com.br/test/changes/trigger",
    JSON.stringify(payloadTrigger),
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
    "https://api.ambisis.com.br/test/changes/commit",
    JSON.stringify(payloadCommit),
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
