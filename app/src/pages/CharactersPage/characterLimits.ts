import type { AuthStatus, UserRole } from "../../types/auth";
import {
  ADMIN_MAX_CHARACTERS,
  GUEST_MAX_CHARACTERS,
  KEEPER_MAX_CHARACTERS,
  USER_MAX_CHARACTERS
} from "../../constants/QUOTAS";

export const GUEST_CHARACTER_LIMIT = GUEST_MAX_CHARACTERS;
export const USER_CHARACTER_LIMIT = USER_MAX_CHARACTERS;
export const ELEVATED_CHARACTER_LIMIT = KEEPER_MAX_CHARACTERS;
export const CHARACTER_COMPANION_LIMIT = 10;

export function getCharacterLimitForRole(role: UserRole | null | undefined): number {
  if (role === "keeper") {
    return KEEPER_MAX_CHARACTERS;
  }

  if (role === "admin") {
    return ADMIN_MAX_CHARACTERS;
  }

  return role === "user" ? USER_MAX_CHARACTERS : GUEST_MAX_CHARACTERS;
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
