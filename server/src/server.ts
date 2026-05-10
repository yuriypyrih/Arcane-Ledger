import type { Server } from "node:http";
import { pathToFileURL } from "node:url";
import { createApp } from "./app.js";
import { connectToDatabase } from "./config/database.js";
import { getAppConfig } from "./config/env.js";

export async function startServer() {
  const config = getAppConfig();
  await connectToDatabase();

  const app = createApp();

  return new Promise<Server>((resolve, reject) => {
    const server = app.listen(config.port, () => {
      console.log(`Arcane Ledger server listening on port ${config.port}.`);
      resolve(server);
    });

    server.on("error", reject);
  });
}

const isDirectRun =
  typeof process.argv[1] === "string" && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  void startServer().catch((error: unknown) => {
    console.error("Failed to start the server.", error);
    process.exitCode = 1;
  });
}
