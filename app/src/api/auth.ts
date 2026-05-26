import { apiGet, apiPatch, apiPost, type ApiRequestOptions } from "./client";
import type { AuthMessageEnvelope, AuthUserEnvelope } from "../types/auth";
import type { Preferences, PreferencesEnvelope } from "../types/preferences";

export type AuthCredentials = {
  email: string;
  password: string;
};

export type RegisterAccountRequest = AuthCredentials & {
  nickname: string;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  password: string;
};

export type ChangeNicknameRequest = {
  nickname: string;
};

export function registerAccount(request: RegisterAccountRequest, options?: ApiRequestOptions) {
  return apiPost<AuthMessageEnvelope>("/auth/register", request, options);
}

export function login(credentials: AuthCredentials, options?: ApiRequestOptions) {
  return apiPost<AuthUserEnvelope>("/auth/login", credentials, options);
}

export function logout(options?: ApiRequestOptions) {
  return apiPost<AuthMessageEnvelope>("/auth/logout", {}, options);
}

export function getCurrentUser(options?: ApiRequestOptions) {
  return apiGet<AuthUserEnvelope>("/auth/me", options);
}

export function getUserPreferences(options?: ApiRequestOptions) {
  return apiGet<PreferencesEnvelope>("/auth/preferences", options);
}

export function saveUserPreferences(
  preferences: Partial<Preferences>,
  options?: ApiRequestOptions
) {
  return apiPatch<PreferencesEnvelope>("/auth/preferences", preferences, options);
}

export function verifyEmail(token: string, options?: ApiRequestOptions) {
  return apiPost<AuthMessageEnvelope>("/auth/email-verification/verify", { token }, options);
}

export function resendEmailVerification(email: string, options?: ApiRequestOptions) {
  return apiPost<AuthMessageEnvelope>("/auth/email-verification/resend", { email }, options);
}

export function forgotPassword(email: string, options?: ApiRequestOptions) {
  return apiPost<AuthMessageEnvelope>("/auth/password/forgot", { email }, options);
}

export function resetPassword(token: string, password: string, options?: ApiRequestOptions) {
  return apiPatch<AuthMessageEnvelope>("/auth/password/reset", { token, password }, options);
}

export function changePassword(request: ChangePasswordRequest, options?: ApiRequestOptions) {
  return apiPatch<AuthMessageEnvelope>("/auth/password/change", request, options);
}

export function changeNickname(request: ChangeNicknameRequest, options?: ApiRequestOptions) {
  return apiPatch<AuthUserEnvelope>("/auth/nickname", request, options);
}
