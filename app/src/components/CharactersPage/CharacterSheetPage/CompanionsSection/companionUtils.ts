import { MONSTER_TYPE_OPTIONS } from "../../../../constants/monsters";
import { getSpeciesEntries } from "../../../../codex/selectors";
import { speciesOptions } from "../../../../pages/CharactersPage/constants";
import type {
  CharacterCompanion,
  MonsterOrdering,
  MonsterRecord
} from "../../../../types";

export type CompanionDraft = {
  id: string | null;
  name: string;
  description: string;
  type: string;
  inheritedCreatureEntry: MonsterRecord | null;
};

export const COMPANION_MONSTERS_PER_PAGE = 8;
export const companionOrderingOptions: Array<{ value: MonsterOrdering; label: string }> = [
  { value: "name", label: "Name (A-Z)" },
  { value: "-name", label: "Name (Z-A)" },
  { value: "cr", label: "CR (Low-High)" },
  { value: "-cr", label: "CR (High-Low)" }
];

export const companionMonsterTypeOptions = Array.from(
  new Set([...MONSTER_TYPE_OPTIONS, "Undead"])
).sort((left, right) => left.localeCompare(right));

export const companionSpeciesTypeOptions = Array.from(
  new Set([
    ...speciesOptions,
    ...getSpeciesEntries().map((entry) => entry.name.trim()).filter((entry) => entry.length > 0)
  ])
).sort((left, right) => left.localeCompare(right));

const reservedTypeOptions = new Set([
  ...companionMonsterTypeOptions,
  ...companionSpeciesTypeOptions
]);

export function createEmptyCompanionDraft(): CompanionDraft {
  return {
    id: null,
    name: "",
    description: "",
    type: "",
    inheritedCreatureEntry: null
  };
}

export function createDraftFromCompanion(companion: CharacterCompanion): CompanionDraft {
  return {
    id: companion.id,
    name: companion.name,
    description: companion.description,
    type: companion.type,
    inheritedCreatureEntry: companion.inheritedCreatureEntry ?? null
  };
}

export function getInheritedEntryLabel(
  companion: Pick<CharacterCompanion, "inheritedCreatureEntry">
) {
  if (!companion.inheritedCreatureEntry) {
    return "Custom";
  }

  const sourceLabel = [
    companion.inheritedCreatureEntry.document__slug,
    companion.inheritedCreatureEntry.document__title
  ]
    .map((entry) => entry.trim())
    .filter(Boolean)
    .join(" - ");

  return sourceLabel.length > 0 ? sourceLabel : "Monster";
}

export function getMonsterSourceLabel(monster: MonsterRecord) {
  const slugLabel = monster.document__slug.trim();
  const titleLabel = monster.document__title.trim();

  if (slugLabel && titleLabel) {
    return `${slugLabel} - ${titleLabel}`;
  }

  return slugLabel || titleLabel || "Monster entry";
}

export function getExtraTypeOptions(values: string[]) {
  return Array.from(
    new Set(
      values
        .map((value) => value.trim())
        .filter((value) => value.length > 0 && !reservedTypeOptions.has(value))
    )
  ).sort((left, right) => left.localeCompare(right));
}
