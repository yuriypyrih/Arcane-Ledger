import { ACTION_TYPE, type ReactionEntry, type SpellEntry } from "../../../../../codex/entries";
import {
  createStatusDurationFromPreset,
  formatConditionOptionLabel,
  getConditionOptions,
  getDamageTypeOptions,
  getImmunityOptions,
  normalizeStatusDurationRoundTick,
  isExhaustionStatusEntry,
  getSenseOptions
} from "../../../../../pages/CharactersPage/traits";
import type {
  CharacterStatusDuration,
  CharacterStatusEntry,
  CharacterStatusValue
} from "../../../../../types";
import {
  CONDITION_NAME,
  EFFECT_NAME,
  STATUS_DURATION_KIND,
  STATUS_DURATION_ROUND_TICK,
  STATUS_DURATION_PRESET,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE
} from "../../../../../types";

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

export function createDerivedReactionStatusDuration(): CharacterStatusDuration {
  return { kind: STATUS_DURATION_KIND.INFINITE };
}

export function getDerivedReactionStatusEntries(
  spells: SpellEntry[],
  reactions: ReactionEntry[]
): CharacterStatusEntry[] {
  return [...new Map(spells.map((spell) => [spell.id, spell])).values()]
    .filter((spell) => spell.castingTime.includes(ACTION_TYPE.REACTION))
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((spell) => ({
      id: `reaction-spell-${spell.id}`,
      group: STATUS_ENTRY_GROUP.REACTIONS,
      value: spell.name,
      source: "Spellcasting",
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: createDerivedReactionStatusDuration(),
      sourceId: `reaction-spell-${spell.id}`,
      rangeFeet: null
    }))
    .concat(
      reactions
        .slice()
        .sort((left, right) => left.name.localeCompare(right.name))
        .map((reaction) => ({
          id: `reaction-entry-${reaction.id}`,
          group: STATUS_ENTRY_GROUP.REACTIONS,
          value: reaction.name,
          source: reaction.sourceLabel,
          sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
          duration: createDerivedReactionStatusDuration(),
          sourceId: `reaction-entry-${reaction.id}`,
          rangeFeet: null
        }))
    );
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
  const isRageEffect =
    entry.sourceType === STATUS_ENTRY_SOURCE_TYPE.FEATURE &&
    entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
    entry.value === EFFECT_NAME.RAGE &&
    entry.sourceId === "feature-rage";

  if (isRageEffect) {
    return true;
  }

  return (
    entry.sourceType === STATUS_ENTRY_SOURCE_TYPE.MANUAL &&
    entry.duration.kind !== STATUS_DURATION_KIND.LINKED
  );
}

export function isStatusEntryDurationEditable(entry: CharacterStatusEntry): boolean {
  return isStatusEntryRemovable(entry) && !isExhaustionStatusEntry(entry);
}

export function getStatusDrawerBadgeLabel(group: STATUS_ENTRY_GROUP): string {
  switch (group) {
    case STATUS_ENTRY_GROUP.EFFECTS:
      return "Effect";
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

export function resolveStatusDurationPreset(
  preset: STATUS_DURATION_PRESET,
  group: STATUS_ENTRY_GROUP,
  value: CharacterStatusValue,
  roundTickOn: STATUS_DURATION_ROUND_TICK = STATUS_DURATION_ROUND_TICK.ROUND_START
) {
  if (
    preset === STATUS_DURATION_PRESET.CONCENTRATION &&
    group === STATUS_ENTRY_GROUP.EFFECTS &&
    value === EFFECT_NAME.CONCENTRATION
  ) {
    return createStatusDurationFromPreset(STATUS_DURATION_PRESET.INFINITE);
  }

  return createStatusDurationFromPreset(preset, normalizeStatusDurationRoundTick(roundTickOn));
}
