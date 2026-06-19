import {
  SENSE,
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  type Character,
  type CharacterStatusEntry,
  type CharacterStatusSpellTarget
} from "../../../../types";
import { normalizeCharacterStatusEntries } from "../../statusEntries";
import type {
  SpellImplementationCastOption,
  SpellImplementationStatusOptionsContext
} from "./types";

export const darkvisionSpellId = "spell-darkvision";
export const darkvisionStatusValue = "Darkvision";
export const darkvisionTargetOptionId = "darkvisionTarget";
export const darkvisionSenseStatusSourceId = "spell-darkvision-self-sense";

const darkvisionRangeFeet = 150;
const selfOrOtherTargetChoices = [
  { value: "self", label: "Myself" },
  { value: "other", label: "Another" }
];

export function getDarkvisionCastOptions(): SpellImplementationCastOption[] {
  return [
    {
      id: darkvisionTargetOptionId,
      label: "Target",
      defaultValue: "self",
      choices: selfOrOtherTargetChoices
    }
  ];
}

export function getDarkvisionTargetFromOptions(
  context: SpellImplementationStatusOptionsContext
): CharacterStatusSpellTarget {
  return context.options[darkvisionTargetOptionId] === "other" ? "other" : "self";
}

function isSelfDarkvisionStatusEntry(entry: CharacterStatusEntry): boolean {
  return (
    entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
    entry.sourceSpellId === darkvisionSpellId &&
    entry.value === darkvisionStatusValue &&
    entry.sourceSpellTarget === "self" &&
    entry.disabled !== true
  );
}

function hasSelfDarkvisionStatus(statusEntries: Character["statusEntries"]): boolean {
  return normalizeCharacterStatusEntries(statusEntries).some(isSelfDarkvisionStatusEntry);
}

export function getDarkvisionSpellDerivedStatusEntriesForCharacter(
  character: Pick<Character, "statusEntries">
): CharacterStatusEntry[] {
  if (!hasSelfDarkvisionStatus(character.statusEntries)) {
    return [];
  }

  return [
    {
      id: darkvisionSenseStatusSourceId,
      group: STATUS_ENTRY_GROUP.SENSES,
      value: SENSE.DARKVISION,
      source: darkvisionStatusValue,
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.INFINITE
      },
      sourceId: darkvisionSenseStatusSourceId,
      rangeFeet: darkvisionRangeFeet,
      description: "For the duration, you have Darkvision with a range of 150 feet."
    }
  ];
}
