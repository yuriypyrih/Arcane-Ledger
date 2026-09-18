import "./environment";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

export async function startTestDatabase() {
  // Always spawn our own process. Never accept a connection string from the environment.
  const database = await MongoMemoryServer.create({
    binary: {
      version: "7.0.14",
      downloadDir: fileURLToPath(new URL("../../../.cache/mongodb", import.meta.url))
    },
    instance: { ip: "127.0.0.1", dbName: "arcane_ledger_tests" }
  });
  try {
    await mongoose.connect(database.getUri(), { dbName: "arcane_ledger_tests" });
  } catch (error) {
    await database.stop();
    throw error;
  }
  return async () => {
    await mongoose.disconnect();
    await database.stop();
  };
}
