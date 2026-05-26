export const USER_NICKNAME_MIN_LENGTH = 2;
export const USER_NICKNAME_MAX_LENGTH = 16;

export function normalizeNicknameInput(value: string) {
  return value.trim();
}

export function getNicknameValidationMessage(value: string): string | null {
  const nickname = normalizeNicknameInput(value);

  if (nickname.length < USER_NICKNAME_MIN_LENGTH) {
    return `Nickname must be at least ${USER_NICKNAME_MIN_LENGTH} characters long.`;
  }

  if (nickname.length > USER_NICKNAME_MAX_LENGTH) {
    return `Nickname must be at most ${USER_NICKNAME_MAX_LENGTH} characters long.`;
  }

  return null;
}
