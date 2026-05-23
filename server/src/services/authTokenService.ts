import crypto from "node:crypto";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { getAppConfig } from "../config/env.js";
import { AppError } from "../errors/AppError.js";

const TOKEN_BYTE_LENGTH = 32;
const SECONDS_PER_MINUTE = 60;
const MILLISECONDS_PER_MINUTE = 60_000;

export type ExpiringToken = {
  token: string;
  tokenHash: string;
  expiresAt: Date;
};

export type VerifiedAuthToken = {
  userId: string;
  issuedAt: number;
};

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function createExpiringToken(expiresInMinutes: number): ExpiringToken {
  const token = crypto.randomBytes(TOKEN_BYTE_LENGTH).toString("hex");

  return {
    token,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + expiresInMinutes * MILLISECONDS_PER_MINUTE)
  };
}

function getRequiredJwtSecret(): string {
  const { jwtSecret } = getAppConfig();

  if (!jwtSecret) {
    throw new AppError("Missing JWT_SECRET environment variable.", 500, "MISSING_JWT_SECRET");
  }

  return jwtSecret;
}

export function signAuthToken(userId: string): string {
  const { jwtExpiresInSeconds } = getAppConfig();

  return jwt.sign({}, getRequiredJwtSecret(), {
    subject: userId,
    expiresIn: jwtExpiresInSeconds
  });
}

export function verifyAuthToken(token: string): VerifiedAuthToken {
  let decoded: string | JwtPayload;

  try {
    decoded = jwt.verify(token, getRequiredJwtSecret());
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError("Authentication session has expired.", 401, "AUTH_SESSION_EXPIRED");
    }

    throw new AppError("Authentication session is invalid.", 401, "AUTH_SESSION_INVALID");
  }

  if (typeof decoded === "string" || typeof decoded.sub !== "string") {
    throw new AppError("Authentication session is invalid.", 401, "AUTH_SESSION_INVALID");
  }

  return {
    userId: decoded.sub,
    issuedAt: typeof decoded.iat === "number" ? decoded.iat : 0
  };
}

export function getTokenAgeSeconds(expiresInMinutes: number): number {
  return expiresInMinutes * SECONDS_PER_MINUTE;
}
