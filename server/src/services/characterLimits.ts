import type { UserRole } from "../types/auth.js";

export const GUEST_CHARACTER_LIMIT = 5;
export const USER_CHARACTER_LIMIT = 20;
export const ELEVATED_CHARACTER_LIMIT = 40;

export function getCharacterLimitForRole(role: UserRole | null | undefined) {
  if (role === "keeper" || role === "admin") {
    return ELEVATED_CHARACTER_LIMIT;
  }

  return role === "user" ? USER_CHARACTER_LIMIT : GUEST_CHARACTER_LIMIT;
}
