import { FEATS, type SpellDescriptionEntry } from "../../../../codex/entries";
import {
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  type Character,
  type CharacterFeatEntry,
  type CharacterStatusEntry,
  type MonsterRecord
} from "../../../../types";
import { getMonsterHitPoints, normalizeMonsterRecord } from "../../../../utils/monsters";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../actionEconomy";
import {
  createChargesCardUsage,
  createChargesHeaderTag
} from "../../classFeatures/cardUsage";
import type { FeatureActionCard } from "../../classFeatures/types";
import {
  createCharacterStatusEntry,
  normalizeCharacterStatusEntries
} from "../../statusEntries";
import { getFeatDefinition } from "..";
import { normalizeCharacterFeats } from "../normalization";
import {
  boonOfFluidFormsShapechangerActionKey,
  boonOfFluidFormsShapechangerStatusSourceId
} from "./constants";
import { filterDescriptionEntries } from "./descriptionMatchers";
import { swapSystemTemporaryHitPointsAssignmentForCharacter } from "./bountifulHealth";
import type { FeatRuntimeCharacter } from "./types";

export const boonOfFluidFormsName = "Boon of Fluid Forms";
export const boonOfFluidFormsShapechangerName = "Shapechanger";
export const boonOfFluidFormsShapechangerTemporaryHitPointsBonus = 20;
export const boonOfFluidFormsShapechangerTemporaryHitPointsSource =
  "Boon of Fluid Forms: Shapechanger";

export function isBoonOfFluidFormsShapechangerDescriptionEntry(entry: string): boolean {
  return (
    entry.startsWith("<strong>Shapechanger.</strong>") ||
    entry.startsWith("Your game statistics are replaced") ||
    entry.startsWith("Once you use this benefit")
  );
}

export function isBoonOfFluidFormsHardyTransformationDescriptionEntry(entry: string): boolean {
  return entry.startsWith("<strong>Hardy Transformation.</strong>");
}

export function isBoonOfFluidFormsShapechangerDrawerDescriptionEntry(entry: string): boolean {
  return (
    isBoonOfFluidFormsShapechangerDescriptionEntry(entry) ||
    isBoonOfFluidFormsHardyTransformationDescriptionEntry(entry)
  );
}

export function getBoonOfFluidFormsShapechangerDescription(
  description: SpellDescriptionEntry[]
): SpellDescriptionEntry[] {
  return filterDescriptionEntries(description, isBoonOfFluidFormsShapechangerDrawerDescriptionEntry);
}

function getDefaultBoonOfFluidFormsShapechangerDescription(): SpellDescriptionEntry[] {
  return getBoonOfFluidFormsShapechangerDescription(
    getFeatDefinition(FEATS.BOON_OF_FLUID_FORMS)?.description ?? []
  );
}

function getBoonOfFluidFormsEntries(character: FeatRuntimeCharacter): CharacterFeatEntry[] {
  return normalizeCharacterFeats(character.feats, character.level ?? 1).filter(
    (entry) => entry.feat === FEATS.BOON_OF_FLUID_FORMS
  );
}

function hasBoonOfFluidFormsForCharacter(character: FeatRuntimeCharacter): boolean {
  return getBoonOfFluidFormsEntries(character).length > 0;
}

function isBoonOfFluidFormsShapechangerAvailable(entry: CharacterFeatEntry): boolean {
  return entry.boonOfFluidForms?.shapechangerExpended !== true;
}

export function getBoonOfFluidFormsShapechangerStateForCharacter(
  character: FeatRuntimeCharacter
): {
  available: boolean;
  expended: boolean;
  usesRemaining: number;
  usesTotal: number;
} | null {
  const entries = getBoonOfFluidFormsEntries(character);
  const total = entries.length > 0 ? 1 : 0;

  if (total <= 0) {
    return null;
  }

  const usesRemaining = entries.some(isBoonOfFluidFormsShapechangerAvailable) ? 1 : 0;

  return {
    available: usesRemaining > 0,
    expended: usesRemaining <= 0,
    usesRemaining,
    usesTotal: total
  };
}

function clearBoonOfFluidFormsShapechangerStatuses(
  statusEntries: Character["statusEntries"]
): CharacterStatusEntry[] {
  return normalizeCharacterStatusEntries(statusEntries).filter(
    (entry) => entry.sourceId !== boonOfFluidFormsShapechangerStatusSourceId
  );
}

function getBoonOfFluidFormsShapechangerTemporaryHitPoints(monster: MonsterRecord): number {
  return Math.max(
    0,
    (getMonsterHitPoints(monster) ?? 0) + boonOfFluidFormsShapechangerTemporaryHitPointsBonus
  );
}

function createBoonOfFluidFormsShapechangerStatusEntry(
  monster: MonsterRecord,
  description: SpellDescriptionEntry[] = getDefaultBoonOfFluidFormsShapechangerDescription()
): CharacterStatusEntry {
  return createCharacterStatusEntry({
    group: STATUS_ENTRY_GROUP.EFFECTS,
    value: monster.name,
    source: boonOfFluidFormsName,
    sourceType: STATUS_ENTRY_SOURCE_TYPE.FEAT,
    duration: {
      kind: STATUS_DURATION_KIND.HOURS,
      amount: 1
    },
    sourceId: boonOfFluidFormsShapechangerStatusSourceId,
    description: description
      .filter((entry): entry is string => typeof entry === "string")
      .join("\n"),
    monsterEntry: monster
  });
}

export function createBoonOfFluidFormsShapechangerAction(
  remaining: number,
  total: number,
  description: SpellDescriptionEntry[]
): FeatureActionCard {
  const chargesTag = createChargesHeaderTag(remaining, total, boonOfFluidFormsShapechangerName);
  const disabledReason =
    remaining > 0 ? undefined : "Shapechanger recharges when you finish a Long Rest.";

  return {
    key: boonOfFluidFormsShapechangerActionKey,
    name: boonOfFluidFormsShapechangerName,
    actionSource: {
      type: "feat",
      name: boonOfFluidFormsName
    },
    summary: `Charge ${remaining}/${total}`,
    detail: "Choose a stat block and shape-shift.",
    breakdown: "Choose a form",
    economyType: ECONOMY_TYPE.ACTION,
    actionCategory: ACTION_CATEGORY.MAGIC,
    usesRemaining: remaining,
    usesTotal: total,
    hideUsesTrackerOnCard: true,
    cardUsage: createChargesCardUsage(remaining, total),
    disabled: remaining <= 0,
    disabledReason,
    description,
    headerTags: [chargesTag],
    drawer: {
      kind: "custom-form",
      formKind: "boon-fluid-forms-shapechanger",
      description,
      blockedReason: disabledReason,
      headerTags: [chargesTag]
    },
    execute: {
      kind: "custom-form",
      formKind: "boon-fluid-forms-shapechanger",
      label: "Use Shapechanger"
    }
  };
}

export function spendBoonOfFluidFormsShapechangerForCharacter(character: Character): Character {
  const state = getBoonOfFluidFormsShapechangerStateForCharacter(character);
  let didSpendShapechanger = false;

  if (!state?.available) {
    return character;
  }

  const feats = normalizeCharacterFeats(character.feats, character.level).map((entry) => {
    if (
      didSpendShapechanger ||
      entry.feat !== FEATS.BOON_OF_FLUID_FORMS ||
      entry.boonOfFluidForms?.shapechangerExpended === true
    ) {
      return entry;
    }

    didSpendShapechanger = true;

    return {
      ...entry,
      boonOfFluidForms: {
        ...(entry.boonOfFluidForms ?? {}),
        shapechangerExpended: true
      }
    };
  });

  return didSpendShapechanger
    ? {
        ...character,
        feats
      }
    : character;
}

export function restoreBoonOfFluidFormsShapechangerForCharacter(character: Character): Character {
  if (!hasBoonOfFluidFormsForCharacter(character)) {
    return character;
  }

  let didRestoreShapechanger = false;
  const feats = normalizeCharacterFeats(character.feats, character.level).map((entry) => {
    if (
      entry.feat !== FEATS.BOON_OF_FLUID_FORMS ||
      entry.boonOfFluidForms?.shapechangerExpended !== true
    ) {
      return entry;
    }

    didRestoreShapechanger = true;

    return {
      ...entry,
      boonOfFluidForms: undefined
    };
  });

  return didRestoreShapechanger
    ? {
        ...character,
        feats
      }
    : character;
}

export function activateBoonOfFluidFormsShapechangerForCharacter(
  character: Character,
  monster: MonsterRecord
): Character {
  const normalizedMonster = normalizeMonsterRecord(monster);

  if (!normalizedMonster || !hasBoonOfFluidFormsForCharacter(character)) {
    return character;
  }

  const spentCharacter = spendBoonOfFluidFormsShapechangerForCharacter(character);

  if (spentCharacter === character) {
    return character;
  }

  const nextTemporaryHitPointsAssignment = swapSystemTemporaryHitPointsAssignmentForCharacter(
    spentCharacter,
    getBoonOfFluidFormsShapechangerTemporaryHitPoints(normalizedMonster),
    boonOfFluidFormsShapechangerTemporaryHitPointsSource
  );

  return {
    ...spentCharacter,
    ...nextTemporaryHitPointsAssignment,
    statusEntries: [
      ...clearBoonOfFluidFormsShapechangerStatuses(spentCharacter.statusEntries),
      createBoonOfFluidFormsShapechangerStatusEntry(normalizedMonster)
    ]
  };
}
