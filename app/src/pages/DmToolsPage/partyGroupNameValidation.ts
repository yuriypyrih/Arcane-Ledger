import { DEFAULT_TEXT_INPUT_MAX_LENGTH } from "../../constants/inputLimits";

export const PARTY_GROUP_NAME_MIN_LENGTH = 2;
export const PARTY_GROUP_NAME_MAX_LENGTH = DEFAULT_TEXT_INPUT_MAX_LENGTH;

export function getPartyGroupNameValidationMessage(value: string) {
  const name = value.trim();

  if (name.length < PARTY_GROUP_NAME_MIN_LENGTH) {
    return `Party name must be at least ${PARTY_GROUP_NAME_MIN_LENGTH} characters.`;
  }

  if (name.length > PARTY_GROUP_NAME_MAX_LENGTH) {
    return `Party name must be at most ${PARTY_GROUP_NAME_MAX_LENGTH} characters.`;
  }

  return null;
}
