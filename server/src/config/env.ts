import dotenv from "dotenv";
import { AppError } from "../errors/AppError.js";

let envLoaded = false;

function loadEnv() {
  if (envLoaded) {
    return;
  }

  dotenv.config();
  envLoaded = true;
}

function parseInteger(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 0) {
    return fallback;
  }

  return parsedValue;
}

function parseCommaSeparatedList(value: string | undefined): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export type AppConfig = {
  nodeEnv: string;
  port: number;
  mongodbUri: string;
  mongoUsername: string;
  mongoPassword: string;
  dbName: string;
  corsAllowedOrigins: string[];
  sentryDsn: string;
  sentryEnvironment: string;
  sentryRelease: string;
};

export function getAppConfig(): AppConfig {
  loadEnv();

  const nodeEnv = process.env.NODE_ENV ?? "development";
  const port = parseInteger(process.env.PORT, 3001);

  return {
    nodeEnv,
    port,
    mongodbUri: process.env.MONGODB_URI ?? "",
    mongoUsername: process.env.MONGO_INITDB_ROOT_USERNAME ?? "",
    mongoPassword: process.env.MONGO_INITDB_ROOT_PASSWORD ?? "",
    dbName: process.env.DB_NAME ?? process.env.MONGO_DB_NAME ?? "arcane_ledger",
    corsAllowedOrigins: parseCommaSeparatedList(process.env.CORS_ALLOWED_ORIGINS),
    sentryDsn: process.env.SENTRY_DSN ?? "",
    sentryEnvironment: process.env.SENTRY_ENVIRONMENT ?? nodeEnv,
    sentryRelease: process.env.SENTRY_RELEASE ?? ""
  };
}

export function requireMongoConfig() {
  const config = getAppConfig();

  if (!config.mongodbUri) {
    throw new AppError("Missing MONGODB_URI environment variable.", 500, "MISSING_MONGODB_URI");
  }

  return {
    mongodbUri: config.mongodbUri,
    mongoUsername: config.mongoUsername,
    mongoPassword: config.mongoPassword,
    dbName: config.dbName
  };
}
