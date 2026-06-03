import {
  formatConditionOptionLabel,
  getConditionOptions,
  getDamageTypeOptions,
  getImmunityOptions,
  isExhaustionStatusEntry,
  getSenseOptions
} from "../../../../../../pages/CharactersPage/traits";
import { isCustomFeatureTraitStatusEntry } from "../../../../../../pages/CharactersPage/customTraitEffects";
import type { CharacterStatusEntry } from "../../../../../../types";
import {
  CONDITION_NAME,
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE
} from "../../../../../../types";

export type TraitEditorTab =
  | "conditions"
  | "senses"
  | "resistances"
  | "vulnerabilities"
  | "immunities";

export const traitEditorTabs: Array<{ id: TraitEditorTab; label: string }> = [
  { id: "conditions", label: "Conditions" },
  { id: "senses", label: "Senses" },
  { id: "resistances", label: "Resistances" },
  { id: "vulnerabilities", label: "Vulnerabilities" },
  { id: "immunities", label: "Immunities" }
];

export const senseOptions = getSenseOptions();
export const conditionOptions = getConditionOptions();
export const damageTypeOptions = getDamageTypeOptions();
export const immunityOptions = getImmunityOptions();

export function createDefaultStatusDraftValues(): Record<TraitEditorTab, string> {
  return {
    conditions: conditionOptions[0] ?? CONDITION_NAME.POISONED,
    senses: senseOptions[0] ?? "Darkvision",
    resistances: damageTypeOptions[0] ?? "FIRE",
    vulnerabilities: damageTypeOptions[0] ?? "FIRE",
    immunities: immunityOptions[0] ?? "FIRE"
  };
}

export function getTraitEditorGroup(tab: TraitEditorTab): STATUS_ENTRY_GROUP {
  switch (tab) {
    case "senses":
      return STATUS_ENTRY_GROUP.SENSES;
    case "resistances":
      return STATUS_ENTRY_GROUP.RESISTANCES;
    case "vulnerabilities":
      return STATUS_ENTRY_GROUP.VULNERABILITIES;
    case "immunities":
      return STATUS_ENTRY_GROUP.IMMUNITIES;
    case "conditions":
    default:
      return STATUS_ENTRY_GROUP.CONDITIONS;
  }
}

export function getTraitEditorOptions(tab: TraitEditorTab): string[] {
  if (tab === "conditions") {
    return conditionOptions;
  }

  if (tab === "senses") {
    return senseOptions;
  }

  if (tab === "immunities") {
    return immunityOptions;
  }

  return damageTypeOptions;
}

export function formatTraitEditorOptionLabel(tab: TraitEditorTab, value: string): string {
  if (tab === "conditions") {
    return formatConditionOptionLabel(value);
  }

  if (tab === "resistances" || tab === "vulnerabilities") {
    return `${value.charAt(0)}${value.slice(1).toLowerCase()} damage`;
  }

  if (tab === "immunities") {
    return Object.values(CONDITION_NAME).includes(value as CONDITION_NAME)
      ? `${value} condition`
      : `${value.charAt(0)}${value.slice(1).toLowerCase()} damage`;
  }

  return value;
}

export function isStatusEntryRemovable(entry: CharacterStatusEntry): boolean {
  if (
    entry.duration.kind === STATUS_DURATION_KIND.LINKED ||
    entry.duration.kind === STATUS_DURATION_KIND.CONCENTRATION
  ) {
    return false;
  }

  if (entry.sourceType === STATUS_ENTRY_SOURCE_TYPE.MANUAL) {
    return true;
  }

  return entry.duration.kind !== STATUS_DURATION_KIND.INFINITE;
}

export function isStatusEntryDurationEditable(entry: CharacterStatusEntry): boolean {
  return isStatusEntryRemovable(entry) && !isExhaustionStatusEntry(entry);
}

export function getStatusDrawerBadgeLabel(entry: CharacterStatusEntry): string {
  if (isCustomFeatureTraitStatusEntry(entry)) {
    return "Custom Feature Trait";
  }

  switch (entry.group) {
    case STATUS_ENTRY_GROUP.EFFECTS:
      return "Effect";
    case STATUS_ENTRY_GROUP.COMPANIONS:
      return "Companion";
    case STATUS_ENTRY_GROUP.REACTIONS:
      return "Reaction";
    case STATUS_ENTRY_GROUP.SENSES:
      return "Sense";
    case STATUS_ENTRY_GROUP.AURAS:
      return "Aura";
    case STATUS_ENTRY_GROUP.RESISTANCES:
      return "Resistance";
    case STATUS_ENTRY_GROUP.VULNERABILITIES:
      return "Vulnerability";
    case STATUS_ENTRY_GROUP.IMMUNITIES:
      return "Immunity";
    case STATUS_ENTRY_GROUP.CONDITIONS:
    default:
      return "Condition";
  }
}
