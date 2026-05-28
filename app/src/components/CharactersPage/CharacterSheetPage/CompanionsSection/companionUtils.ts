import { MONSTER_TYPE_OPTIONS } from "../../../../constants/monsters";
import { getSpeciesEntries } from "../../../../codex/selectors";
import type { PrimalBeastKind } from "../../../../pages/CharactersPage/companionPrimalBeasts";
import { PRIMAL_BEAST_MONSTER_TYPE } from "../../../../pages/CharactersPage/companionPrimalBeasts";
import { speciesOptions } from "../../../../pages/CharactersPage/constants";
import type { CharacterCompanion, MonsterRecord } from "../../../../types";
import {
  defaultManualStatusDurationDraft,
  getManualStatusDurationDraft,
  type ManualStatusDurationType
} from "../GameplayForm/widgets/TraitsConditionsWidget/manualStatusDuration";

export type CompanionDraft = {
  id: string | null;
  name: string;
  description: string;
  type: string;
  primalBeastKind: PrimalBeastKind | null;
  maxHitPoints: string;
  durationType: ManualStatusDurationType;
  durationValue: number;
  inheritedCreatureEntry: MonsterRecord | null;
  inheritedCreatureEntryModified: boolean;
};

export const COMPANION_MONSTERS_PER_PAGE = 20;

export const companionMonsterTypeOptions = Array.from(
  new Set([...MONSTER_TYPE_OPTIONS, PRIMAL_BEAST_MONSTER_TYPE, "Undead"])
).sort((left, right) => left.localeCompare(right));

export const companionSpeciesTypeOptions = Array.from(
  new Set([
    ...speciesOptions,
    ...getSpeciesEntries()
      .map((entry) => entry.name.trim())
      .filter((entry) => entry.length > 0)
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
    primalBeastKind: null,
    maxHitPoints: "10",
    durationType: defaultManualStatusDurationDraft.type,
    durationValue: defaultManualStatusDurationDraft.value,
    inheritedCreatureEntry: null,
    inheritedCreatureEntryModified: false
  };
}

export function createDraftFromCompanion(companion: CharacterCompanion): CompanionDraft {
  const durationDraft = getManualStatusDurationDraft(companion.duration);

  return {
    id: companion.id,
    name: companion.name,
    description: companion.description,
    type: companion.type,
    primalBeastKind: companion.primalBeastKind ?? null,
    maxHitPoints: String(companion.maxHitPoints),
    durationType: durationDraft.type,
    durationValue: durationDraft.value,
    inheritedCreatureEntry: companion.inheritedCreatureEntry ?? null,
    inheritedCreatureEntryModified: Boolean(
      companion.inheritedCreatureEntry && companion.inheritedCreatureEntryModified === true
    )
  };
}

export function getCompanionSourceLabel(companion: CharacterCompanion) {
  if (companion.primalBeastKind) {
    return "Primal Beast";
  }

  return getInheritedEntryLabel(companion);
}

export function getInheritedEntryLabel(
  companion: Pick<CharacterCompanion, "inheritedCreatureEntry" | "inheritedCreatureEntryModified">
) {
  if (!companion.inheritedCreatureEntry) {
    return "Manual";
  }

  const sourceLabel = [
    companion.inheritedCreatureEntry.document__slug,
    companion.inheritedCreatureEntry.document__title
  ]
    .map((entry) => entry.trim())
    .filter(Boolean)
    .join(" - ");

  const baseLabel = sourceLabel.length > 0 ? sourceLabel : "Monster";

  return baseLabel;
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
