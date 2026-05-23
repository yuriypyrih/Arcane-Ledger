import { apiGet, apiPatch, apiPost, type ApiRequestOptions } from "./client";
import type { AuthMessageEnvelope, AuthUserEnvelope } from "../types/auth";

export type AuthCredentials = {
  email: string;
  password: string;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  password: string;
};

export function registerAccount(credentials: AuthCredentials, options?: ApiRequestOptions) {
  return apiPost<AuthMessageEnvelope>("/auth/register", credentials, options);
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
