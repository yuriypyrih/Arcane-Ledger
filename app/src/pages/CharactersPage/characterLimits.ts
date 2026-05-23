import type { AuthStatus, UserRole } from "../../types/auth";

export const GUEST_CHARACTER_LIMIT = 5;
export const USER_CHARACTER_LIMIT = 20;
export const ELEVATED_CHARACTER_LIMIT = 40;
export const CHARACTER_COMPANION_LIMIT = 10;

export function getCharacterLimitForRole(role: UserRole | null | undefined): number {
  if (role === "keeper" || role === "admin") {
    return ELEVATED_CHARACTER_LIMIT;
  }

  return role === "user" ? USER_CHARACTER_LIMIT : GUEST_CHARACTER_LIMIT;
}

export function getCharacterLimitForAuth(
  status: AuthStatus,
  role: UserRole | null | undefined
): number {
  return status === "authenticated" ? getCharacterLimitForRole(role) : GUEST_CHARACTER_LIMIT;
}

export function hasReachedCharacterLimit(characterCount: number, characterLimit: number): boolean {
  return characterCount >= characterLimit;
}
