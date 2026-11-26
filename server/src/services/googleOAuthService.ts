import crypto from "node:crypto";
import type { CookieOptions, Response } from "express";
import { CodeChallengeMethod, OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { getAppConfig } from "../config/env.js";
import { AppError } from "../errors/AppError.js";
import { User, type UserDocument } from "../models/User.js";
import {
  DEFAULT_USER_NICKNAME,
  USER_NICKNAME_MAX_LENGTH,
  USER_NICKNAME_MIN_LENGTH
} from "./authNicknameService.js";
import { defaultUserPreferences } from "./userPreferencesService.js";

const GOOGLE_STATE_AUDIENCE = "arcane-ledger:google-oauth";
const GOOGLE_STATE_MAX_AGE_SECONDS = 10 * 60;
const GOOGLE_SCOPES = ["openid", "email", "profile"];
const DUPLICATE_KEY_ERROR_CODE = 11000;

type GoogleStatePayload = {
  state: string;
  nonce: string;
  codeVerifier: string;
};

export type GoogleProfile = {
  subject: string;
  email: string;
  emailVerified: boolean;
  name?: string;
};

export function isGoogleSignInConfigured(): boolean {
  const { googleClientId, googleClientSecret, googleRedirectUri } = getAppConfig();

  return Boolean(googleClientId && googleClientSecret && googleRedirectUri);
}

function createGoogleClient(): OAuth2Client {
  const { googleClientId, googleClientSecret, googleRedirectUri } = getAppConfig();

  return new OAuth2Client({
    clientId: googleClientId,
    clientSecret: googleClientSecret,
    redirectUri: googleRedirectUri
  });
}

function getStateCookieName(): string {
  const { authCookieSecure } = getAppConfig();

  return authCookieSecure ? "__Host-arcane_ledger_google_oauth" : "arcane_ledger_google_oauth";
}

function createStateCookieOptions(): CookieOptions {
  const { authCookieSecure } = getAppConfig();

  // Lax, not Strict: the browser must send this cookie when Google redirects back.
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: authCookieSecure,
    path: "/"
  };
}

export function readGoogleStateCookie(cookies: Record<string, unknown> | undefined): string | undefined {
  const value = cookies?.[getStateCookieName()];

  return typeof value === "string" ? value : undefined;
}

export function setGoogleStateCookie(response: Response, stateToken: string) {
  response.cookie(getStateCookieName(), stateToken, {
    ...createStateCookieOptions(),
    maxAge: GOOGLE_STATE_MAX_AGE_SECONDS * 1000
  });
}

export function clearGoogleStateCookie(response: Response) {
  response.clearCookie(getStateCookieName(), createStateCookieOptions());
}

function getRequiredJwtSecret(): string {
  const { jwtSecret } = getAppConfig();

  if (!jwtSecret) {
    throw new AppError("Missing JWT_SECRET environment variable.", 500, "MISSING_JWT_SECRET");
  }

  return jwtSecret;
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function invalidState(): AppError {
  return new AppError("Google sign-in could not be verified.", 400, "GOOGLE_STATE_INVALID");
}

export async function createGoogleAuthorization(): Promise<{ url: string; stateToken: string }> {
  const client = createGoogleClient();
  const state = crypto.randomBytes(32).toString("hex");
  const nonce = crypto.randomBytes(32).toString("hex");
  const { codeVerifier, codeChallenge } = await client.generateCodeVerifierAsync();
  const url = client.generateAuthUrl({
    scope: GOOGLE_SCOPES,
    state,
    nonce,
    code_challenge: codeChallenge,
    code_challenge_method: CodeChallengeMethod.S256,
    prompt: "select_account"
  });
  const stateToken = jwt.sign({ state, nonce, codeVerifier } satisfies GoogleStatePayload, getRequiredJwtSecret(), {
    audience: GOOGLE_STATE_AUDIENCE,
    expiresIn: GOOGLE_STATE_MAX_AGE_SECONDS
  });

  return { url, stateToken };
}

function readStatePayload(stateToken: string | undefined): GoogleStatePayload {
  if (!stateToken) {
    throw invalidState();
  }

  let decoded: string | jwt.JwtPayload;

  try {
    decoded = jwt.verify(stateToken, getRequiredJwtSecret(), {
      algorithms: ["HS256"],
      audience: GOOGLE_STATE_AUDIENCE
    });
  } catch {
    throw invalidState();
  }

  if (
    typeof decoded === "string" ||
    typeof decoded.state !== "string" ||
    typeof decoded.nonce !== "string" ||
    typeof decoded.codeVerifier !== "string"
  ) {
    throw invalidState();
  }

  return { state: decoded.state, nonce: decoded.nonce, codeVerifier: decoded.codeVerifier };
}

async function fetchGoogleProfile(code: string, payload: GoogleStatePayload): Promise<GoogleProfile> {
  const { googleClientId } = getAppConfig();
  const client = createGoogleClient();
  let idToken: string | null | undefined;

  try {
    const { tokens } = await client.getToken({ code, codeVerifier: payload.codeVerifier });
    idToken = tokens.id_token;
  } catch {
    throw new AppError("Google sign-in failed.", 401, "GOOGLE_EXCHANGE_FAILED");
  }

  if (!idToken) {
    throw new AppError("Google sign-in failed.", 401, "GOOGLE_TOKEN_INVALID");
  }

  let tokenPayload;

  try {
    const ticket = await client.verifyIdToken({ idToken, audience: googleClientId });
    tokenPayload = ticket.getPayload();
  } catch {
    throw new AppError("Google sign-in failed.", 401, "GOOGLE_TOKEN_INVALID");
  }

  if (
    !tokenPayload ||
    typeof tokenPayload.sub !== "string" ||
    typeof tokenPayload.email !== "string" ||
    typeof tokenPayload.nonce !== "string" ||
    !safeEqual(tokenPayload.nonce, payload.nonce)
  ) {
    throw new AppError("Google sign-in failed.", 401, "GOOGLE_TOKEN_INVALID");
  }

  return {
    subject: tokenPayload.sub,
    email: tokenPayload.email.trim().toLowerCase(),
    emailVerified: tokenPayload.email_verified === true,
    name: tokenPayload.name
  };
}

export function createNicknameFromGoogleName(name: unknown): string {
  if (typeof name !== "string") {
    return DEFAULT_USER_NICKNAME;
  }

  const cleaned = Array.from(name)
    .filter((character) => {
      const codePoint = character.codePointAt(0) ?? 0;
      return codePoint > 0x1f && codePoint !== 0x7f;
    })
    .join("")
    .trim();
  let nickname = "";

  for (const character of cleaned) {
    if (nickname.length + character.length > USER_NICKNAME_MAX_LENGTH) {
      break;
    }

    nickname += character;
  }

  nickname = nickname.trim();

  return nickname.length >= USER_NICKNAME_MIN_LENGTH ? nickname : DEFAULT_USER_NICKNAME;
}

function assertActive(user: UserDocument) {
  if (!user.active) {
    throw new AppError("This account is disabled.", 403, "GOOGLE_ACCOUNT_DISABLED");
  }
}

function requireVerifiedEmail(profile: GoogleProfile) {
  if (!profile.emailVerified) {
    throw new AppError("Your Google email address is not verified.", 403, "GOOGLE_EMAIL_NOT_VERIFIED");
  }
}

async function findOrCreateGoogleUser(profile: GoogleProfile): Promise<UserDocument> {
  const bySubject = await User.findOne({ googleSubject: profile.subject }).select("+active");

  if (bySubject) {
    assertActive(bySubject);
    return bySubject;
  }

  requireVerifiedEmail(profile);

  const byEmail = await User.findOne({ email: profile.email }).select(
    "+active +googleSubject +passwordHash +emailVerificationTokenHash +emailVerificationTokenExpiresAt"
  );

  if (byEmail) {
    assertActive(byEmail);

    if (byEmail.googleSubject && byEmail.googleSubject !== profile.subject) {
      throw new AppError("This account is linked to a different Google account.", 409, "GOOGLE_ACCOUNT_CONFLICT");
    }

    if (!byEmail.emailVerifiedAt) {
      // Whoever registered this address first never proved they own it. Google just did,
      // so drop any password they set and every pending verification link.
      byEmail.passwordHash = undefined;
      byEmail.passwordChangedAt = new Date();
      byEmail.emailVerificationTokenHash = undefined;
      byEmail.emailVerificationTokenExpiresAt = undefined;
      byEmail.emailVerifiedAt = new Date();
    }

    byEmail.googleSubject = profile.subject;
    await byEmail.save({ validateModifiedOnly: true });

    return byEmail;
  }

  const user = new User({
    email: profile.email,
    nickname: createNicknameFromGoogleName(profile.name),
    role: "user",
    googleSubject: profile.subject,
    emailVerifiedAt: new Date(),
    preferences: { ...defaultUserPreferences }
  });

  await user.save();

  return user;
}

export async function resolveGoogleUser(profile: GoogleProfile): Promise<UserDocument> {
  let user: UserDocument;

  try {
    user = await findOrCreateGoogleUser(profile);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === DUPLICATE_KEY_ERROR_CODE
    ) {
      // A concurrent request created the same user; resolve against what now exists.
      user = await findOrCreateGoogleUser(profile);
    } else {
      throw error;
    }
  }

  user.lastInteractedAt = new Date();
  await user.save({ validateModifiedOnly: true });

  return user;
}

export async function completeGoogleSignIn(input: {
  code: string | undefined;
  state: string | undefined;
  stateToken: string | undefined;
}): Promise<UserDocument> {
  const payload = readStatePayload(input.stateToken);

  if (!input.state || !safeEqual(input.state, payload.state)) {
    throw invalidState();
  }

  if (!input.code) {
    throw new AppError("Google sign-in failed.", 400, "GOOGLE_EXCHANGE_FAILED");
  }

  const profile = await fetchGoogleProfile(input.code, payload);

  return resolveGoogleUser(profile);
}
