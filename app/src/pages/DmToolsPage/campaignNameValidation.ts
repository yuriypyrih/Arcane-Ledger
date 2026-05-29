import { DEFAULT_TEXT_INPUT_MAX_LENGTH } from "../../constants/inputLimits";

export const CAMPAIGN_NAME_MIN_LENGTH = 2;
export const CAMPAIGN_NAME_MAX_LENGTH = DEFAULT_TEXT_INPUT_MAX_LENGTH;

export function getCampaignNameValidationMessage(value: string) {
  const name = value.trim();

  if (name.length < CAMPAIGN_NAME_MIN_LENGTH) {
    return `Campaign name must be at least ${CAMPAIGN_NAME_MIN_LENGTH} characters.`;
  }

  if (name.length > CAMPAIGN_NAME_MAX_LENGTH) {
    return `Campaign name must be at most ${CAMPAIGN_NAME_MAX_LENGTH} characters.`;
  }

  return null;
}
