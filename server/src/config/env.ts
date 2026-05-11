import { isAbsolute, resolve } from "node:path";
import dotenv from "dotenv";
import { AppError } from "../errors/AppError.js";
import { SERVER_ROOT_DIR } from "../utils/path.js";

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

function trimTrailingSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function resolveRootPath(pathValue: string): string {
  if (isAbsolute(pathValue)) {
    return pathValue;
  }

  return resolve(SERVER_ROOT_DIR, pathValue);
}

export type AppConfig = {
  nodeEnv: string;
  port: number;
  mongodbUri: string;
  mongoUsername: string;
  mongoPassword: string;
  dbName: string;
  corsAllowedOrigins: string[];
  open5eBaseUrl: string;
  open5eMonstersUrl: string;
  open5eItemsUrl: string;
  open5eSpellsUrl: string;
  open5eRequestDelayMs: number;
  open5eMonstersRootDir: string;
  open5eItemsRootDir: string;
  open5eSpellsRootDir: string;
};

export function getAppConfig(): AppConfig {
  loadEnv();

  const nodeEnv = process.env.NODE_ENV ?? "development";
  const port = parseInteger(process.env.PORT, 3001);
  const open5eBaseUrl = trimTrailingSlash(process.env.OPEN5E_BASE_URL ?? "https://api.open5e.com");
  const open5eMonstersUrl = process.env.OPEN5E_MONSTERS_URL ?? `${open5eBaseUrl}/monsters/`;
  const open5eItemsUrl = process.env.OPEN5E_ITEMS_URL ?? `${open5eBaseUrl}/v2/items/?limit=100`;
  const open5eSpellsUrl = process.env.OPEN5E_SPELLS_URL ?? `${open5eBaseUrl}/v2/spells/?limit=100`;
  const open5eRequestDelayMs = parseInteger(process.env.OPEN5E_REQUEST_DELAY_MS, 200);
  const open5eMonstersRootDir = resolveRootPath(
    process.env.OPEN5E_MONSTERS_ROOT_DIR ?? "data/open5e/monsters"
  );
  const open5eItemsRootDir = resolveRootPath(
    process.env.OPEN5E_ITEMS_ROOT_DIR ?? "data/open5e/items"
  );
  const open5eSpellsRootDir = resolveRootPath(
    process.env.OPEN5E_SPELLS_ROOT_DIR ?? "data/open5e/spells"
  );

  return {
    nodeEnv,
    port,
    mongodbUri: process.env.MONGODB_URI ?? "",
    mongoUsername: process.env.MONGO_INITDB_ROOT_USERNAME ?? "",
    mongoPassword: process.env.MONGO_INITDB_ROOT_PASSWORD ?? "",
    dbName: process.env.DB_NAME ?? process.env.MONGO_DB_NAME ?? "arcane_ledger",
    corsAllowedOrigins: parseCommaSeparatedList(process.env.CORS_ALLOWED_ORIGINS),
    open5eBaseUrl,
    open5eMonstersUrl,
    open5eItemsUrl,
    open5eSpellsUrl,
    open5eRequestDelayMs,
    open5eMonstersRootDir,
    open5eItemsRootDir,
    open5eSpellsRootDir
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
