import type { UserRole } from "../types/auth.js";
import {
  ADMIN_MAX_CHARACTERS,
  GUEST_MAX_CHARACTERS,
  KEEPER_MAX_CHARACTERS,
  USER_MAX_CHARACTERS
} from "../constants/QUOTAS.js";

export const GUEST_CHARACTER_LIMIT = GUEST_MAX_CHARACTERS;
export const USER_CHARACTER_LIMIT = USER_MAX_CHARACTERS;
export const ELEVATED_CHARACTER_LIMIT = KEEPER_MAX_CHARACTERS;

export function getCharacterLimitForRole(role: UserRole | null | undefined) {
  if (role === "admin") {
    return ADMIN_MAX_CHARACTERS;
  }

  if (role === "keeper") {
    return KEEPER_MAX_CHARACTERS;
  }

  return role === "user" ? USER_CHARACTER_LIMIT : GUEST_CHARACTER_LIMIT;
}
