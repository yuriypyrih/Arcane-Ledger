import type { Server } from "node:http";
import { pathToFileURL } from "node:url";
import { createApp } from "./app.js";
import { connectToDatabase } from "./config/database.js";
import { getAppConfig } from "./config/env.js";
import { captureServerError, flushSentry, initServerSentry } from "./sentry.js";
import { recordBackendLifecycleMetric } from "./services/analyticsService.js";

export async function startServer() {
  const config = getAppConfig();
  initServerSentry(config);
  await connectToDatabase();
  recordBackendLifecycleMetric("database_connection_health");

  const app = createApp();

  return new Promise<Server>((resolve, reject) => {
    const server = app.listen(config.port, () => {
      console.log(`Arcane Ledger server listening on port ${config.port}.`);
      recordBackendLifecycleMetric("server_startup");
      resolve(server);
    });

    server.on("error", reject);
  });
}

const isDirectRun =
  typeof process.argv[1] === "string" && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  void startServer().catch(async (error: unknown) => {
    console.error("Failed to start the server.", error);
    captureServerError(error, {
      area: "server",
      action: "startup"
    });
    await flushSentry();
    process.exitCode = 1;
  });
}
