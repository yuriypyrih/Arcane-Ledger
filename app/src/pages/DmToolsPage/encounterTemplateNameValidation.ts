export const ENCOUNTER_TEMPLATE_NAME_MIN_LENGTH = 2;
export const ENCOUNTER_TEMPLATE_NAME_MAX_LENGTH = 40;

export function getEncounterTemplateNameValidationMessage(value: string) {
  const name = value.trim();

  if (name.length < ENCOUNTER_TEMPLATE_NAME_MIN_LENGTH) {
    return `Encounter name must be at least ${ENCOUNTER_TEMPLATE_NAME_MIN_LENGTH} characters.`;
  }

  if (name.length > ENCOUNTER_TEMPLATE_NAME_MAX_LENGTH) {
    return `Encounter name must be at most ${ENCOUNTER_TEMPLATE_NAME_MAX_LENGTH} characters.`;
  }

  return null;
}
