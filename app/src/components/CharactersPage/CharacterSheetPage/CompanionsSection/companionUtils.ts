import { MONSTER_TYPE_OPTIONS } from "../../../../constants/monsters";
import { getSpeciesEntries } from "../../../../codex/selectors";
import {
  beastMasterCompanionRole,
  getCompanionStatBlock,
  getDefaultCompanionMaxHitPoints,
  isBeastMasterCompanion
} from "../../../../pages/CharactersPage/beastMasterCompanions";
import type { PrimalBeastKind } from "../../../../pages/CharactersPage/companionPrimalBeasts";
import { speciesOptions } from "../../../../pages/CharactersPage/constants";
import type { CharacterCompanion, MonsterOrdering, MonsterRecord } from "../../../../types";

export type CompanionDraft = {
  id: string | null;
  name: string;
  description: string;
  type: string;
  role: CharacterCompanion["role"] | null;
  primalBeastKind: PrimalBeastKind | null;
  appearance: string;
  maxHitPoints: string;
  currentHitPoints: string;
  isDead: boolean;
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
    role: null,
    primalBeastKind: null,
    appearance: "",
    maxHitPoints: "",
    currentHitPoints: "",
    isDead: false,
    inheritedCreatureEntry: null
  };
}

export function createDraftFromCompanion(companion: CharacterCompanion): CompanionDraft {
  const defaultMaxHitPoints = getDefaultCompanionMaxHitPoints(companion);

  return {
    id: companion.id,
    name: companion.name,
    description: companion.description,
    type: companion.type,
    role: companion.role ?? null,
    primalBeastKind: companion.primalBeastKind ?? null,
    appearance: companion.appearance ?? "",
    maxHitPoints:
      companion.maxHitPoints !== undefined
        ? String(companion.maxHitPoints)
        : defaultMaxHitPoints !== null
          ? String(defaultMaxHitPoints)
          : "",
    currentHitPoints:
      companion.currentHitPoints !== undefined
        ? String(companion.currentHitPoints)
        : companion.maxHitPoints !== undefined
          ? String(companion.maxHitPoints)
          : defaultMaxHitPoints !== null
            ? String(defaultMaxHitPoints)
            : "",
    isDead: companion.isDead === true,
    inheritedCreatureEntry: companion.inheritedCreatureEntry ?? null
  };
}

export function createBeastMasterCompanionDraft(kind: PrimalBeastKind): CompanionDraft {
  const draft = createEmptyCompanionDraft();
  const companion: CharacterCompanion = {
    id: "",
    name: "Primal Companion",
    description: "",
    type: "Beast",
    role: beastMasterCompanionRole,
    primalBeastKind: kind
  };
  const template = getCompanionStatBlock(companion);
  const hitPoints = template?.hit_points ?? 1;

  return {
    ...draft,
    name: template?.name ?? companion.name,
    type: companion.type,
    role: beastMasterCompanionRole,
    primalBeastKind: kind,
    maxHitPoints: String(hitPoints),
    currentHitPoints: String(hitPoints)
  };
}

export function getCompanionSourceLabel(companion: CharacterCompanion) {
  if (isBeastMasterCompanion(companion) && companion.primalBeastKind) {
    return "Primal Beast";
  }

  return getInheritedEntryLabel(companion);
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
