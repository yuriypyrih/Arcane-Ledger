import type { Character } from "../../../../../types";
import {
  SENSE,
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP
} from "../../../../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import {
  createCharacterStatusEntry,
  normalizeCharacterStatusEntries
} from "../../../statusEntries";
import type { FeatureActionCard } from "../../types";
import type { SubclassRuntimeCharacter } from "../../subclassRuntime";
import { hasWizardDivinerFeature } from "./wizardDivinerShared";
import {
  getWizardDivinerThirdEyeOptionDefinition,
  type WizardDivinerThirdEyeOptionKey,
  wizardDivinerThirdEyeActionKey,
  wizardDivinerThirdEyeDescription,
  wizardDivinerThirdEyeOptionDefinitions
} from "./wizardDivinerThirdEyeConfig";

const thirdEyeName = "The Third Eye";

function hasWizardDivinerThirdEyeFeature(character: SubclassRuntimeCharacter): boolean {
  return hasWizardDivinerFeature(character, 10);
}

function clearWizardDivinerThirdEyeStatuses(value: unknown) {
  const thirdEyeSourceIds = new Set(
    wizardDivinerThirdEyeOptionDefinitions.map((option) => option.sourceId)
  );

  return normalizeCharacterStatusEntries(value).filter(
    (entry) => !thirdEyeSourceIds.has(entry.sourceId ?? "")
  );
}

export function getActiveWizardDivinerThirdEyeOptionKey(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "statusEntries" | "subclassId">>
): WizardDivinerThirdEyeOptionKey | null {
  if (!hasWizardDivinerThirdEyeFeature(character)) {
    return null;
  }

  const activeEntry = normalizeCharacterStatusEntries(character.statusEntries).find((entry) =>
    wizardDivinerThirdEyeOptionDefinitions.some((option) => option.sourceId === entry.sourceId)
  );
  const activeOption =
    wizardDivinerThirdEyeOptionDefinitions.find(
      (option) => option.sourceId === activeEntry?.sourceId
    ) ?? null;

  return activeOption?.key ?? null;
}

export function hasActiveWizardDivinerThirdEye(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "statusEntries" | "subclassId">>
): boolean {
  return getActiveWizardDivinerThirdEyeOptionKey(character) !== null;
}

export function getWizardDivinerThirdEyeFeatureAction(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "statusEntries" | "subclassId">>
): FeatureActionCard | null {
  if (!hasWizardDivinerThirdEyeFeature(character)) {
    return null;
  }

  const activeOptionKey = getActiveWizardDivinerThirdEyeOptionKey(character);
  const activeOption = activeOptionKey
    ? getWizardDivinerThirdEyeOptionDefinition(activeOptionKey)
    : null;

  return {
    key: wizardDivinerThirdEyeActionKey,
    name: thirdEyeName,
    summary: "Choose a supernatural boon of perception.",
    detail: "Darkvision, greater comprehension, or See Invisibility until you rest.",
    breakdown: "Choose sight boon",
    economyType: ECONOMY_TYPE.BONUS_ACTION,
    actionCategory: ACTION_CATEGORY.FEATURE,
    description:
      wizardDivinerThirdEyeDescription.length > 0
        ? wizardDivinerThirdEyeDescription
        : undefined,
    drawer: {
      kind: "custom-form",
      formKind: "third-eye",
      eyebrow: "Diviner",
      helperText:
        "Choose one benefit. It lasts until you start or finish a Short Rest or Long Rest."
    },
    isActive: activeOption !== null,
    disabled: activeOption !== null,
    disabledReason: activeOption
      ? `${activeOption.name} is already active. The Third Eye refreshes after a Short or Long Rest.`
      : undefined
  };
}

export function activateWizardDivinerThirdEye(
  character: Character,
  optionKey: WizardDivinerThirdEyeOptionKey
): Character {
  if (!hasWizardDivinerThirdEyeFeature(character) || hasActiveWizardDivinerThirdEye(character)) {
    return character;
  }

  const option = getWizardDivinerThirdEyeOptionDefinition(optionKey);

  if (!option) {
    return character;
  }

  return {
    ...character,
    statusEntries: [
      ...clearWizardDivinerThirdEyeStatuses(character.statusEntries),
      createCharacterStatusEntry(
        option.key === "darkvision"
          ? {
              group: STATUS_ENTRY_GROUP.SENSES,
              value: SENSE.DARKVISION,
              source: thirdEyeName,
              duration: {
                kind: STATUS_DURATION_KIND.SHORT_REST
              },
              sourceId: option.sourceId,
              rangeFeet: 120
            }
          : {
              group: STATUS_ENTRY_GROUP.EFFECTS,
              value: option.name,
              source: thirdEyeName,
              duration: {
                kind: STATUS_DURATION_KIND.SHORT_REST
              },
              sourceId: option.sourceId
            }
      )
    ]
  };
}
