import mongoose from "mongoose";
import { requireMongoConfig } from "./env.js";
import { AppError } from "../errors/AppError.js";

function createCredentialedMongoUri(mongodbUri: string, username: string, password: string): string {
  const hasUsername = Boolean(username);
  const hasPassword = Boolean(password);

  if (hasUsername !== hasPassword) {
    throw new AppError(
      "MongoDB username and password must both be set.",
      500,
      "INCOMPLETE_MONGODB_CREDENTIALS"
    );
  }

  if (!hasUsername || !hasPassword) {
    return mongodbUri;
  }

  const url = new URL(mongodbUri);
  url.username = username;
  url.password = password;

  return url.toString();
}

function getMongoConnectionSummary(mongodbUri: string, dbName: string) {
  const url = new URL(mongodbUri);
  const port = url.port || (url.protocol === "mongodb:" ? "27017" : "default");
  const authSource = url.searchParams.get("authSource") ?? "default";

  return {
    database: dbName,
    host: url.hostname,
    port,
    authSource
  };
}

export async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const { mongodbUri, mongoUsername, mongoPassword, dbName } = requireMongoConfig();
  const credentialedMongoUri = createCredentialedMongoUri(mongodbUri, mongoUsername, mongoPassword);
  const connectionSummary = getMongoConnectionSummary(mongodbUri, dbName);

  console.log("Connecting to Database..");

  await mongoose.connect(credentialedMongoUri, {
    dbName
  });

  console.log(
    `Connected successfully to database ${connectionSummary.database} on ${connectionSummary.host}:${connectionSummary.port} (authSource: ${connectionSummary.authSource}).`
  );

  return mongoose.connection;
}

export async function disconnectFromDatabase() {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  await mongoose.disconnect();
}
