import { AppError } from "../errors/AppError.js";

export const USER_NICKNAME_MIN_LENGTH = 2;
export const USER_NICKNAME_MAX_LENGTH = 16;
export const DEFAULT_USER_NICKNAME = "Adventurer";

export function normalizeUserNickname(value: unknown, fieldName = "nickname"): string {
  if (typeof value !== "string") {
    throw new AppError(`Request body must include "${fieldName}".`, 400, "INVALID_NICKNAME", {
      field: fieldName
    });
  }

  const nickname = value.trim();

  if (nickname.length < USER_NICKNAME_MIN_LENGTH) {
    throw new AppError(
      `Nickname must be at least ${USER_NICKNAME_MIN_LENGTH} characters long.`,
      400,
      "INVALID_NICKNAME",
      {
        field: fieldName
      }
    );
  }

  if (nickname.length > USER_NICKNAME_MAX_LENGTH) {
    throw new AppError(
      `Nickname must be at most ${USER_NICKNAME_MAX_LENGTH} characters long.`,
      400,
      "INVALID_NICKNAME",
      {
        field: fieldName
      }
    );
  }

  return nickname;
}
