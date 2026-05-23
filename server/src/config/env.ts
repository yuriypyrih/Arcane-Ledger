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

function parsePositiveInteger(value: string | undefined, fallback: number): number {
  const parsedValue = parseInteger(value, fallback);

  return parsedValue > 0 ? parsedValue : fallback;
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (!value) {
    return fallback;
  }

  const normalizedValue = value.trim().toLowerCase();

  if (["1", "true", "yes", "on"].includes(normalizedValue)) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(normalizedValue)) {
    return false;
  }

  return fallback;
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
  trustProxyHops: number;
  mongodbUri: string;
  mongoUsername: string;
  mongoPassword: string;
  dbName: string;
  corsAllowedOrigins: string[];
  frontendUrl: string;
  jwtSecret: string;
  jwtExpiresInSeconds: number;
  authCookieName: string;
  authCookieSecure: boolean;
  emailVerificationTokenExpiresMinutes: number;
  passwordResetTokenExpiresMinutes: number;
  resendApiKey: string;
  resendFromEmail: string;
  resendReplyTo: string;
  characterAvatarS3Bucket: string;
  characterAvatarS3Region: string;
  characterAvatarS3PublicBaseUrl: string;
  characterAvatarUploadMaxBytes: number;
  sentryDsn: string;
  sentryEnvironment: string;
  sentryRelease: string;
};

export function getAppConfig(): AppConfig {
  loadEnv();

  const nodeEnv = process.env.NODE_ENV ?? "development";
  const port = parseInteger(process.env.PORT, 3001);
  const authCookieSecure = parseBoolean(process.env.AUTH_COOKIE_SECURE, nodeEnv === "production");
  const configuredAuthCookieName = process.env.AUTH_COOKIE_NAME?.trim();
  const authCookieName =
    configuredAuthCookieName ||
    (authCookieSecure ? "__Host-arcane_ledger_session" : "arcane_ledger_session");

  return {
    nodeEnv,
    port,
    trustProxyHops: parseInteger(process.env.TRUST_PROXY_HOPS, 0),
    mongodbUri: process.env.MONGODB_URI ?? "",
    mongoUsername: process.env.MONGO_INITDB_ROOT_USERNAME ?? "",
    mongoPassword: process.env.MONGO_INITDB_ROOT_PASSWORD ?? "",
    dbName: process.env.DB_NAME ?? process.env.MONGO_DB_NAME ?? "arcane_ledger",
    corsAllowedOrigins: parseCommaSeparatedList(process.env.CORS_ALLOWED_ORIGINS),
    frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:5174",
    jwtSecret: process.env.JWT_SECRET ?? "",
    jwtExpiresInSeconds: parsePositiveInteger(process.env.JWT_EXPIRES_IN_SECONDS, 7 * 24 * 60 * 60),
    authCookieName,
    authCookieSecure,
    emailVerificationTokenExpiresMinutes: parsePositiveInteger(
      process.env.EMAIL_VERIFICATION_TOKEN_EXPIRES_MINUTES,
      24 * 60
    ),
    passwordResetTokenExpiresMinutes: parsePositiveInteger(
      process.env.PASSWORD_RESET_TOKEN_EXPIRES_MINUTES,
      10
    ),
    resendApiKey: process.env.RESEND_API_KEY ?? "",
    resendFromEmail: process.env.RESEND_FROM_EMAIL ?? "",
    resendReplyTo: process.env.RESEND_REPLY_TO ?? "",
    characterAvatarS3Bucket: process.env.CHARACTER_AVATAR_S3_BUCKET ?? "",
    characterAvatarS3Region:
      process.env.CHARACTER_AVATAR_S3_REGION ?? process.env.AWS_REGION ?? "",
    characterAvatarS3PublicBaseUrl: process.env.CHARACTER_AVATAR_S3_PUBLIC_BASE_URL ?? "",
    characterAvatarUploadMaxBytes: parsePositiveInteger(
      process.env.CHARACTER_AVATAR_UPLOAD_MAX_BYTES,
      512 * 1024
    ),
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
