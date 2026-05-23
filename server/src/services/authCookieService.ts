import type { CookieOptions, Response } from "express";
import { getAppConfig } from "../config/env.js";

function createBaseCookieOptions(): CookieOptions {
  const { authCookieSecure } = getAppConfig();

  return {
    httpOnly: true,
    sameSite: "strict",
    secure: authCookieSecure,
    path: "/"
  };
}

export function setAuthCookie(response: Response, token: string) {
  const { authCookieName, jwtExpiresInSeconds } = getAppConfig();

  response.cookie(authCookieName, token, {
    ...createBaseCookieOptions(),
    maxAge: jwtExpiresInSeconds * 1000
  });
}

export function clearAuthCookie(response: Response) {
  const { authCookieName } = getAppConfig();

  response.clearCookie(authCookieName, createBaseCookieOptions());
}
