import { CLASS_FEATURE } from "../../../../../codex/entries";
import { getWizardDivinerFeatureDescriptionEntries } from "./wizardDivinerShared";

export type WizardDivinerThirdEyeOptionKey =
  | "darkvision"
  | "greater-comprehension"
  | "see-invisibility";

export type WizardDivinerThirdEyeOptionDefinition = {
  key: WizardDivinerThirdEyeOptionKey;
  name: string;
  textDescription: string;
  rawDescription: string;
  sourceId: string;
};

export const wizardDivinerThirdEyeActionKey = "wizard-diviner-third-eye";
export const wizardDivinerThirdEyeDarkvisionStatusSourceId =
  "feature-wizard-diviner-third-eye-darkvision";
export const wizardDivinerThirdEyeGreaterComprehensionStatusSourceId =
  "feature-wizard-diviner-third-eye-greater-comprehension";
export const wizardDivinerThirdEyeSeeInvisibilityStatusSourceId =
  "feature-wizard-diviner-third-eye-see-invisibility";

const thirdEyeFeatureDescription = getWizardDivinerFeatureDescriptionEntries(
  CLASS_FEATURE.THE_THIRD_EYE
);

function stripCodexMarkup(value: string): string {
  return value.replace(/<[^>]+>/g, "").trim();
}

function extractThirdEyeOptionDescription(name: string, fallback: string): string {
  const matchingEntry = thirdEyeFeatureDescription.find((entry) =>
    entry.startsWith(`<strong>${name}.</strong>`)
  );

  return matchingEntry
    ? matchingEntry.replace(/^<strong>[^<]+<\/strong>\s*/, "").trim()
    : fallback;
}

const darkvisionRawDescription = extractThirdEyeOptionDescription(
  "Darkvision",
  "You gain Darkvision with a range of 120 feet."
);
const greaterComprehensionRawDescription = extractThirdEyeOptionDescription(
  "Greater Comprehension",
  "You can read any language."
);
const seeInvisibilityRawDescription = extractThirdEyeOptionDescription(
  "See Invisibility",
  "You can cast See Invisibility without expending a spell slot."
);

export const wizardDivinerThirdEyeDescription = thirdEyeFeatureDescription.filter(
  (entry) => !entry.startsWith("<strong>")
);

export const wizardDivinerThirdEyeOptionDefinitions: WizardDivinerThirdEyeOptionDefinition[] = [
  {
    key: "darkvision",
    name: "Darkvision",
    textDescription: stripCodexMarkup(darkvisionRawDescription),
    rawDescription: darkvisionRawDescription,
    sourceId: wizardDivinerThirdEyeDarkvisionStatusSourceId
  },
  {
    key: "greater-comprehension",
    name: "Greater Comprehension",
    textDescription: stripCodexMarkup(greaterComprehensionRawDescription),
    rawDescription: greaterComprehensionRawDescription,
    sourceId: wizardDivinerThirdEyeGreaterComprehensionStatusSourceId
  },
  {
    key: "see-invisibility",
    name: "See Invisibility",
    textDescription: stripCodexMarkup(seeInvisibilityRawDescription),
    rawDescription: seeInvisibilityRawDescription,
    sourceId: wizardDivinerThirdEyeSeeInvisibilityStatusSourceId
  }
];

export const wizardDivinerThirdEyeDarkvisionDescription = [darkvisionRawDescription];
export const wizardDivinerThirdEyeGreaterComprehensionDescription = [
  greaterComprehensionRawDescription
];
export const wizardDivinerThirdEyeSeeInvisibilityDescription = [seeInvisibilityRawDescription];

export function getWizardDivinerThirdEyeOptionDefinition(
  optionKey: WizardDivinerThirdEyeOptionKey
): WizardDivinerThirdEyeOptionDefinition | null {
  return (
    wizardDivinerThirdEyeOptionDefinitions.find((option) => option.key === optionKey) ?? null
  );
}
