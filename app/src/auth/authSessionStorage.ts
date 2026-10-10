import { USER_ROLES, type AuthUser } from "../types/auth";

const AUTH_USER_KEY = "arcane-ledger:auth-user";
const SIGNED_OUT = "null";

function readStoredSession(): string | null {
  try {
    return window.localStorage.getItem(AUTH_USER_KEY);
  } catch {
    return null;
  }
}

/** A local logout must survive reload even when the server could not clear its cookie. */
export function isLocallySignedOut() {
  return readStoredSession() === SIGNED_OUT;
}

export function readRememberedAuthUser(): AuthUser | null {
  try {
    const value: unknown = JSON.parse(readStoredSession() ?? "null");
    if (!value || typeof value !== "object") return null;
    const user = value as Partial<AuthUser>;
    if (
      typeof user.id !== "string" ||
      !user.id ||
      typeof user.email !== "string" ||
      typeof user.nickname !== "string" ||
      !user.role ||
      !USER_ROLES.includes(user.role) ||
      !(user.emailVerifiedAt === null || typeof user.emailVerifiedAt === "string") ||
      !(user.createdAt === null || typeof user.createdAt === "string") ||
      !(user.lastFeedback === null || typeof user.lastFeedback === "string")
    )
      return null;

    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      role: user.role,
      emailVerifiedAt: user.emailVerifiedAt,
      createdAt: user.createdAt,
      lastFeedback: user.lastFeedback
    };
  } catch {
    return null;
  }
}

/** Only account display/ownership data is cached; authentication remains cookie based. */
export function rememberAuthUser(user: AuthUser) {
  try {
    window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } catch {
    // The current in-memory session still works if browser storage is unavailable.
  }
}

export function forgetAuthUser() {
  try {
    window.localStorage.setItem(AUTH_USER_KEY, SIGNED_OUT);
  } catch {
    // Logout must still clear the in-memory session.
  }
}
