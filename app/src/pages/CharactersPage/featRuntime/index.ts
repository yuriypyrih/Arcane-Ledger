import {
  FEATS,
  SPELL_LIST_CLASS,
  type SpellDescriptionEntry,
  type SpellEntry
} from "../../../codex/entries";
import { getSpellEntriesForSpellListClass } from "../../../codex/classes/spellAccess";
import {
  SENSE,
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE
} from "../../../types";
import type { Character, CharacterFeatEntry, ItemRecord } from "../../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../actionEconomy";
import { createSourcedDescriptionEntries } from "../actionModalDescriptions";
import type {
  ArmorClassFeatureContext,
  FeatureActionCard,
  FeatureArmorClassBonus
} from "../classFeatures/types";
import { getFeatDefinition, getFeatLabel, normalizeCharacterFeats } from "../feats";
import type { FeatDerivedState, FeatRuntimeCharacter } from "./types";

export type { FeatDerivedState, FeatRuntimeCharacter } from "./types";

const blessedWarriorCantripOptionsById = new Map(
  getSpellEntriesForSpellListClass(SPELL_LIST_CLASS.CLERIC)
    .filter((spell) => spell.spellLevel === 0)
    .map((spell) => [spell.id, spell] as const)
);
const druidicWarriorCantripOptionsById = new Map(
  getSpellEntriesForSpellListClass(SPELL_LIST_CLASS.DRUID)
    .filter((spell) => spell.spellLevel === 0)
    .map((spell) => [spell.id, spell] as const)
);
const featDerivedStateCache = new WeakMap<object, Map<number, FeatDerivedState>>();
const healerKitItemKeys = new Set(["srd_healers-kit", "srd-2024_healers-kit"]);
export const luckyFeatActionKey = "feat-lucky";

function normalizeFeatRuntimeLevel(value: unknown): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return 1;
  }

  return Math.max(1, Math.min(20, Math.floor(parsed)));
}

function getCachedFeatDerivedState(
  feats: unknown,
  level: number
): FeatDerivedState | undefined {
  if (!Array.isArray(feats)) {
    return undefined;
  }

  return featDerivedStateCache.get(feats)?.get(level);
}

function setCachedFeatDerivedState(feats: unknown, level: number, state: FeatDerivedState) {
  if (!Array.isArray(feats)) {
    return;
  }

  const cachedByLevel = featDerivedStateCache.get(feats) ?? new Map<number, FeatDerivedState>();

  cachedByLevel.set(level, state);
  featDerivedStateCache.set(feats, cachedByLevel);
}

function getFeatCantripEntry(entry: CharacterFeatEntry): SpellEntry[] {
  if (entry.feat === FEATS.BLESSED_WARRIOR && entry.blessedWarrior) {
    return entry.blessedWarrior.cantripIds.flatMap((cantripId) => {
      const cantrip = blessedWarriorCantripOptionsById.get(cantripId);

      return cantrip ? [cantrip] : [];
    });
  }

  if (entry.feat === FEATS.DRUIDIC_WARRIOR && entry.druidicWarrior) {
    return entry.druidicWarrior.cantripIds.flatMap((cantripId) => {
      const cantrip = druidicWarriorCantripOptionsById.get(cantripId);

      return cantrip ? [cantrip] : [];
    });
  }

  return [];
}

function getFeatProficiencyBonusForLevel(level: number): number {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));
  return Math.floor((normalizedLevel - 1) / 4) + 2;
}

function getLuckyPointsExpended(normalizedFeats: CharacterFeatEntry[], total: number): number {
  const luckyEntry = normalizedFeats.find((entry) => entry.feat === FEATS.LUCKY);
  const pointsExpended = luckyEntry?.lucky?.pointsExpended ?? 0;

  return Math.max(0, Math.min(total, Math.floor(pointsExpended)));
}

function createLuckyAction(
  remaining: number,
  total: number,
  description: SpellDescriptionEntry[]
): FeatureActionCard {
  const usageLabel = `Lucky Points ${remaining}/${total}`;

  return {
    key: luckyFeatActionKey,
    name: "Lucky",
    summary: usageLabel,
    detail: "Spend Luck Points on d20 rolls.",
    breakdown: "Origin Feat",
    economyType: ECONOMY_TYPE.FREE,
    actionCategory: ACTION_CATEGORY.FEATURE,
    usesRemaining: remaining,
    usesTotal: total,
    hideUsesTrackerOnCard: true,
    usesSupplementaryLabel: usageLabel,
    description,
    headerTags: [
      {
        kind: "text",
        label: "Lucky Points",
        value: `${remaining}/${total}`
      }
    ],
    drawer: {
      kind: "confirm",
      description,
      confirmLabel: "Use 1"
    },
    execute: {
      kind: "activate",
      label: "Use 1"
    }
  };
}

function createFeatDerivedState(feats: unknown, level: number): FeatDerivedState {
  const normalizedFeats = normalizeCharacterFeats(feats, level);
  const featsByFeat = new Map<FEATS, CharacterFeatEntry[]>();
  const featSet = new Set<FEATS>();
  const grantedCantripEntriesById = new Map<string, SpellEntry>();
  const abilityScoreBonuses: FeatDerivedState["abilityScoreBonuses"] = [];
  const derivedStatusEntries: FeatDerivedState["derivedStatusEntries"] = [];
  const featDefinitionCache = new Map<FEATS, SpellDescriptionEntry[]>();

  normalizedFeats.forEach((entry, index) => {
    featSet.add(entry.feat);
    featsByFeat.set(entry.feat, [...(featsByFeat.get(entry.feat) ?? []), entry]);

    getFeatCantripEntry(entry).forEach((cantrip) => {
      grantedCantripEntriesById.set(cantrip.id, cantrip);
    });

    const order = entry.takenAtLevel + index / 100;

    if (entry.feat === FEATS.ABILITY_SCORE_IMPROVEMENT && entry.abilityScoreImprovement) {
      if (entry.abilityScoreImprovement.mode === "single") {
        abilityScoreBonuses.push({
          ability: entry.abilityScoreImprovement.primaryAbility,
          label: "Ability Score Improvement",
          value: 2,
          maxScore: 20,
          order
        });
      } else {
        abilityScoreBonuses.push(
          {
            ability: entry.abilityScoreImprovement.primaryAbility,
            label: "Ability Score Improvement",
            value: 1,
            maxScore: 20,
            order
          },
          {
            ability: entry.abilityScoreImprovement.secondaryAbility,
            label: "Ability Score Improvement",
            value: 1,
            maxScore: 20,
            order
          }
        );
      }
    } else if (
      entry.feat === FEATS.BOON_OF_IRRESISTIBLE_OFFENSE &&
      entry.boonOfIrresistibleOffense
    ) {
      abilityScoreBonuses.push({
        ability: entry.boonOfIrresistibleOffense.ability,
        label: "Boon of Irresistible Offense",
        value: 1,
        maxScore: 30,
        order
      });
    } else if (entry.epicBoonAbilityChoice) {
      abilityScoreBonuses.push({
        ability: entry.epicBoonAbilityChoice.ability,
        label: getFeatLabel(entry.feat),
        value: 1,
        maxScore: 30,
        order
      });
    }

    if (entry.feat === FEATS.BOON_OF_TRUESIGHT) {
      derivedStatusEntries.push({
        id: `feat-boon-of-truesight-${index}`,
        group: STATUS_ENTRY_GROUP.SENSES,
        value: SENSE.TRUESIGHT,
        source: "Boon of Truesight",
        sourceType: STATUS_ENTRY_SOURCE_TYPE.FEAT,
        duration: {
          kind: STATUS_DURATION_KIND.INFINITE
        },
        rangeFeet: 60
      });
    }
  });

  const luckyPointsTotal = featSet.has(FEATS.LUCKY) ? getFeatProficiencyBonusForLevel(level) : 0;
  const luckyPointsExpended = getLuckyPointsExpended(normalizedFeats, luckyPointsTotal);
  const luckyPointsRemaining = Math.max(0, luckyPointsTotal - luckyPointsExpended);
  const getFeatDescription = (feat: FEATS) => {
    const cachedDescription = featDefinitionCache.get(feat);

    if (cachedDescription) {
      return cachedDescription;
    }

    const description = getFeatDefinition(feat)?.description ?? [];
    featDefinitionCache.set(feat, description);
    return description;
  };
  const actions: FeatureActionCard[] = featSet.has(FEATS.LUCKY)
    ? [createLuckyAction(luckyPointsRemaining, luckyPointsTotal, getFeatDescription(FEATS.LUCKY))]
    : [];

  return {
    normalizedFeats,
    featsByFeat,
    featSet,
    grantedCantripEntries: [...grantedCantripEntriesById.values()].sort((left, right) =>
      left.name.localeCompare(right.name)
    ),
    abilityScoreBonuses,
    derivedStatusEntries,
    actions,
    hasCrafterDiscount: featSet.has(FEATS.CRAFTER),
    hasDefenseFightingStyle: featSet.has(FEATS.DEFENSE),
    hasHealer: featSet.has(FEATS.HEALER),
    hasLucky: featSet.has(FEATS.LUCKY),
    luckyPointsRemaining,
    luckyPointsTotal
  };
}

export function collectFeatDerivedState(character: FeatRuntimeCharacter): FeatDerivedState {
  const level = normalizeFeatRuntimeLevel(character.level);
  const cachedState = getCachedFeatDerivedState(character.feats, level);

  if (cachedState) {
    return cachedState;
  }

  const state = createFeatDerivedState(character.feats, level);

  setCachedFeatDerivedState(character.feats, level, state);
  return state;
}

export function getNormalizedFeatsForCharacter(character: FeatRuntimeCharacter) {
  return collectFeatDerivedState(character).normalizedFeats;
}

export function hasFeatForCharacter(character: FeatRuntimeCharacter, feat: FEATS): boolean {
  return collectFeatDerivedState(character).featSet.has(feat);
}

export function getFeatGrantedCantripEntriesForCharacter(
  character: FeatRuntimeCharacter
): SpellEntry[] {
  return collectFeatDerivedState(character).grantedCantripEntries;
}

export function getFeatAbilityScoreBonusesForCharacter(
  character: FeatRuntimeCharacter
): FeatDerivedState["abilityScoreBonuses"] {
  return collectFeatDerivedState(character).abilityScoreBonuses;
}

export function getFeatArmorClassBonusesForCharacter(
  character: FeatRuntimeCharacter,
  context: ArmorClassFeatureContext
): FeatureArmorClassBonus[] {
  if (!context.hasWornBodyArmor || !collectFeatDerivedState(character).hasDefenseFightingStyle) {
    return [];
  }

  return [
    {
      label: "Defense",
      value: 1
    }
  ];
}

export function getFeatDerivedStatusEntriesForCharacter(
  character: FeatRuntimeCharacter
): FeatDerivedState["derivedStatusEntries"] {
  return collectFeatDerivedState(character).derivedStatusEntries;
}

export function characterHasCrafterDiscount(character: FeatRuntimeCharacter): boolean {
  return collectFeatDerivedState(character).hasCrafterDiscount;
}

export function getFeatActionsForCharacter(character: FeatRuntimeCharacter): FeatureActionCard[] {
  return collectFeatDerivedState(character).actions;
}

function getItemRuntimeKey(item: Pick<ItemRecord, "id" | "key">): string {
  return (typeof item.key === "string" && item.key.trim().length > 0 ? item.key : item.id)
    .trim()
    .toLowerCase();
}

export function getFeatItemAdditionalDescriptionForCharacter(
  character: FeatRuntimeCharacter,
  item: Pick<ItemRecord, "id" | "key"> | null | undefined
): SpellDescriptionEntry[] {
  if (!item || !collectFeatDerivedState(character).hasHealer) {
    return [];
  }

  if (!healerKitItemKeys.has(getItemRuntimeKey(item))) {
    return [];
  }

  const healerDescription = getFeatDefinition(FEATS.HEALER)?.description ?? [];

  return createSourcedDescriptionEntries(getFeatLabel(FEATS.HEALER), healerDescription);
}

function setLuckyPointsExpendedForCharacter(
  character: Character,
  getNextPointsExpended: (current: number, total: number) => number
): Character {
  const derivedState = collectFeatDerivedState(character);

  if (!derivedState.hasLucky || derivedState.luckyPointsTotal <= 0) {
    return character;
  }

  const currentPointsExpended = derivedState.luckyPointsTotal - derivedState.luckyPointsRemaining;
  const nextPointsExpended = Math.max(
    0,
    Math.min(
      derivedState.luckyPointsTotal,
      Math.floor(getNextPointsExpended(currentPointsExpended, derivedState.luckyPointsTotal))
    )
  );

  if (nextPointsExpended === currentPointsExpended) {
    return character;
  }

  return {
    ...character,
    feats: derivedState.normalizedFeats.map((entry) =>
      entry.feat === FEATS.LUCKY
        ? {
            ...entry,
            lucky:
              nextPointsExpended > 0
                ? {
                    pointsExpended: nextPointsExpended
                  }
                : undefined
          }
        : entry
    )
  };
}

export function spendLuckyPointForCharacter(character: Character): Character {
  return setLuckyPointsExpendedForCharacter(character, (currentPointsExpended, total) =>
    currentPointsExpended >= total ? currentPointsExpended : currentPointsExpended + 1
  );
}

export function resetLuckyPointForCharacter(character: Character): Character {
  return setLuckyPointsExpendedForCharacter(character, (currentPointsExpended) =>
    currentPointsExpended <= 0 ? currentPointsExpended : currentPointsExpended - 1
  );
}

export function restoreLuckyPointsForCharacter(character: Character): Character {
  return setLuckyPointsExpendedForCharacter(character, () => 0);
}
