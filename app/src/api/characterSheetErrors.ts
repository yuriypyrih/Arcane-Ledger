import { ApiRequestFailedError } from "./client";

export type CharacterSheetUnavailableCode =
  | "CHARACTER_SHEET_NOT_FOUND"
  | "CHARACTER_SHEET_DELETED";

export function getCharacterSheetUnavailableCode(
  error: unknown
): CharacterSheetUnavailableCode | null {
  if (!(error instanceof ApiRequestFailedError)) {
    return null;
  }

  return error.code === "CHARACTER_SHEET_NOT_FOUND" ||
    error.code === "CHARACTER_SHEET_DELETED"
    ? error.code
    : null;
}

export function isCharacterSheetNotFoundError(error: unknown) {
  return getCharacterSheetUnavailableCode(error) === "CHARACTER_SHEET_NOT_FOUND";
}

export function isCharacterSheetDeletedError(error: unknown) {
  return getCharacterSheetUnavailableCode(error) === "CHARACTER_SHEET_DELETED";
}

export function isCharacterSheetUnavailableError(error: unknown) {
  return getCharacterSheetUnavailableCode(error) !== null;
}

export function getCharacterSheetUnavailableMessageForCode(
  code: CharacterSheetUnavailableCode
) {
  return code === "CHARACTER_SHEET_DELETED"
    ? "Character sheet was deleted."
    : "Character sheet not found.";
}

export function getCharacterSheetUnavailableMessage(error: unknown) {
  const code = getCharacterSheetUnavailableCode(error);

  return code ? getCharacterSheetUnavailableMessageForCode(code) : "Character sheet not found.";
}
