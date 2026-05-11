import mongoose from "mongoose";
import { requireMongoConfig } from "./env.js";
import { AppError } from "../errors/AppError.js";

const USERNAME_PLACEHOLDER = "${USERNAME}";
const PASSWORD_PLACEHOLDER = "${PASSWORD}";
const USERNAME_PLACEHOLDER_PATTERN = /\$\{USERNAME\}/g;
const PASSWORD_PLACEHOLDER_PATTERN = /\$\{PASSWORD\}/g;

function resolveMongoUriCredentials(mongodbUri: string, username: string, password: string): string {
  const hasUsername = Boolean(username);
  const hasPassword = Boolean(password);
  const hasUsernamePlaceholder = mongodbUri.includes(USERNAME_PLACEHOLDER);
  const hasPasswordPlaceholder = mongodbUri.includes(PASSWORD_PLACEHOLDER);

  if (hasUsername !== hasPassword) {
    throw new AppError(
      "MongoDB username and password must both be set.",
      500,
      "INCOMPLETE_MONGODB_CREDENTIALS"
    );
  }

  if (hasUsernamePlaceholder !== hasPasswordPlaceholder) {
    throw new AppError(
      "MONGODB_URI must include both ${USERNAME} and ${PASSWORD} placeholders.",
      500,
      "INCOMPLETE_MONGODB_URI_CREDENTIAL_PLACEHOLDERS"
    );
  }

  if (hasUsernamePlaceholder && hasPasswordPlaceholder) {
    if (!hasUsername || !hasPassword) {
      throw new AppError(
        "MongoDB username and password are required when MONGODB_URI uses credential placeholders.",
        500,
        "MISSING_MONGODB_CREDENTIALS"
      );
    }

    return mongodbUri
      .replace(USERNAME_PLACEHOLDER_PATTERN, encodeURIComponent(username))
      .replace(PASSWORD_PLACEHOLDER_PATTERN, encodeURIComponent(password));
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
  const credentialedMongoUri = resolveMongoUriCredentials(mongodbUri, mongoUsername, mongoPassword);
  const connectionSummary = getMongoConnectionSummary(credentialedMongoUri, dbName);

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
