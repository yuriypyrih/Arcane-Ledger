import { getApiBaseUrl } from "../../api/baseUrl";

const GOOGLE_ERROR_MESSAGES: Record<string, string> = {
  google_not_configured: "Google sign-in is not available right now.",
  google_cancelled: "Google sign-in was cancelled.",
  google_state_invalid: "Google sign-in expired or could not be verified. Please try again.",
  google_exchange_failed: "Google sign-in failed. Please try again.",
  google_token_invalid: "Google sign-in failed. Please try again.",
  google_email_not_verified:
    "Your Google email address is not verified, so it cannot be used to sign in.",
  google_account_disabled: "This account is disabled.",
  google_account_conflict: "This email is already linked to a different Google account.",
  google_failed: "Google sign-in failed. Please try again."
};

export function getGoogleSignInUrl(): string | null {
  const baseUrl = getApiBaseUrl();

  return baseUrl ? new URL("auth/google", baseUrl).toString() : null;
}

export function getGoogleSignInErrorMessage(code: string): string {
  return GOOGLE_ERROR_MESSAGES[code] ?? GOOGLE_ERROR_MESSAGES.google_failed;
}
