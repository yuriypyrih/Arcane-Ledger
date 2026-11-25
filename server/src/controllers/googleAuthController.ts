import type { Request, Response } from "express";
import { getAppConfig } from "../config/env.js";
import { AppError } from "../errors/AppError.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { setAuthCookie } from "../services/authCookieService.js";
import { signAuthToken } from "../services/authTokenService.js";
import {
  clearGoogleStateCookie,
  completeGoogleSignIn,
  createGoogleAuthorization,
  isGoogleSignInConfigured,
  readGoogleStateCookie,
  setGoogleStateCookie
} from "../services/googleOAuthService.js";

const GOOGLE_CANCELLED_ERROR = "google_cancelled";
const GOOGLE_FAILED_ERROR = "google_failed";
const REPORTABLE_ERROR_CODES = new Set([
  "GOOGLE_STATE_INVALID",
  "GOOGLE_EXCHANGE_FAILED",
  "GOOGLE_TOKEN_INVALID",
  "GOOGLE_EMAIL_NOT_VERIFIED",
  "GOOGLE_ACCOUNT_DISABLED",
  "GOOGLE_ACCOUNT_CONFLICT"
]);

function createFrontendUrl(pathname: string): URL {
  const { frontendUrl } = getAppConfig();

  return new URL(pathname, frontendUrl);
}

function redirectToLogin(response: Response, error: string) {
  const loginUrl = createFrontendUrl("/login");

  loginUrl.searchParams.set("error", error);
  response.redirect(loginUrl.toString());
}

function readQueryString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

export const startGoogleSignIn = asyncHandler(async (_request: Request, response: Response) => {
  if (!isGoogleSignInConfigured()) {
    redirectToLogin(response, "google_not_configured");
    return;
  }

  const { url, stateToken } = await createGoogleAuthorization();

  setGoogleStateCookie(response, stateToken);
  response.redirect(url);
});

export const finishGoogleSignIn = asyncHandler(async (request: Request, response: Response) => {
  const stateToken = readGoogleStateCookie(request.cookies);

  clearGoogleStateCookie(response);

  if (!isGoogleSignInConfigured()) {
    redirectToLogin(response, "google_not_configured");
    return;
  }

  if (readQueryString(request.query.error)) {
    redirectToLogin(response, GOOGLE_CANCELLED_ERROR);
    return;
  }

  try {
    const user = await completeGoogleSignIn({
      code: readQueryString(request.query.code),
      state: readQueryString(request.query.state),
      stateToken
    });

    setAuthCookie(response, signAuthToken(user.id));
    response.redirect(createFrontendUrl("/auth/google/complete").toString());
  } catch (error) {
    if (error instanceof AppError && REPORTABLE_ERROR_CODES.has(error.code)) {
      redirectToLogin(response, error.code.toLowerCase());
      return;
    }

    console.error("Google sign-in failed unexpectedly.");
    redirectToLogin(response, GOOGLE_FAILED_ERROR);
  }
});
