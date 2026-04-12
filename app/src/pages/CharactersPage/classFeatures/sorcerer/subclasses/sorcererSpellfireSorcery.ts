import { sorcererFeatures } from "../../../../../codex/classes";
import { CLASS_FEATURE, type SpellEntry } from "../../../../../codex/entries";
import { getSubclassEntryById } from "../../../../../codex/subclasses";
import type { Character } from "../../../../../types";
import {
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE
} from "../../../../../types";
import { appendUniqueDescriptionAddition } from "../../../actionModalDescriptions";
import { createCharacterStatusEntry, normalizeCharacterStatusEntries } from "../../../traits";
import type { SubclassRuntimeResolver } from "../../subclassRuntime";
import {
  createDefaultFeatureActionDescription,
  getPreparedSpellIdsByLevel,
  resolveSpellIdsByName
} from "../../subclassRuntime";
import type { FeatureActionCard, FeatureSpeedBonus } from "../../types";

export const spellfireSorcerySubclassId = "sorcerer-spellfire-sorcery";
export const spellfireCrownOfSpellfireName = "Crown of Spellfire";
export const spellfireCrownOfSpellfireStatusSourceId =
  "feature-sorcerer-spellfire-sorcery-crown-of-spellfire";

const spellfireSorcerySubclassEntry = getSubclassEntryById(spellfireSorcerySubclassId);
const sorcererInnateSorceryActionKey = "sorcerer-innate-sorcery";
const sorcererInnateSorceryEffectName = "Innate Sorcery";
const spellfireSorcerySpellIdsByLevel = {
  3: resolveSpellIdsByName(["Cure Wounds", "Guiding Bolt", "Lesser Restoration", "Scorching Ray"]),
  5: resolveSpellIdsByName(["Aura of Vitality", "Dispel Magic"]),
  7: resolveSpellIdsByName(["Fire Shield", "Wall of Fire"]),
  9: resolveSpellIdsByName(["Greater Restoration", "Flame Strike"])
} as const;
const counterspellSpellIds = resolveSpellIdsByName(["Counterspell"]);
const counterspellSpellId = counterspellSpellIds[0] ?? null;
const crownOfSpellfireUsesTotal = 1;
const crownOfSpellfireFallbackSorceryPointCost = 5;
const spellfireSorceryBonusSpellIdsByLevel = {
  6: counterspellSpellIds
} as const;

type SpellfireSorceryCharacter = Pick<Character, "className"> &
  Partial<Pick<Character, "classFeatureState" | "level" | "statusEntries" | "subclassId">>;

function getSorcererFeatureRow(level: number | undefined) {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level ?? 0)));
  const matchingRows = sorcererFeatures
    .filter((row) => row.level <= normalizedLevel)
    .sort((left, right) => left.level - right.level);

  return matchingRows.length > 0 ? (matchingRows[matchingRows.length - 1] ?? null) : null;
}

function getSorcererSpellfireSorceryPointsTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level">>
): number {
  return character.className === "Sorcerer"
    ? Math.max(0, getSorcererFeatureRow(character.level)?.sorceryPoints ?? 0)
    : 0;
}

function getSorcererSpellfireSorceryPointsRemaining(
  character: Pick<Character, "className"> & Partial<Pick<Character, "classFeatureState" | "level">>
): number {
  const totalPoints = getSorcererSpellfireSorceryPointsTotal(character);
  const expendedPoints = Number(character.classFeatureState?.sorcerer?.sorceryPointsExpended);

  return Math.max(
    0,
    totalPoints -
      (Number.isFinite(expendedPoints)
        ? Math.max(0, Math.min(totalPoints, Math.floor(expendedPoints)))
        : 0)
  );
}

function spendSorcererSpellfireSorceryPoints(character: Character, cost: number): Character {
  const normalizedCost = Math.max(0, Math.floor(cost));

  if (normalizedCost <= 0) {
    return character;
  }

  const totalPoints = getSorcererSpellfireSorceryPointsTotal(character);
  const remainingPoints = getSorcererSpellfireSorceryPointsRemaining(character);

  if (totalPoints <= 0 || remainingPoints < normalizedCost) {
    return character;
  }

  const currentExpended = Number(character.classFeatureState?.sorcerer?.sorceryPointsExpended);
  const nextExpended = Math.max(
    0,
    Math.min(
      totalPoints,
      (Number.isFinite(currentExpended) ? Math.floor(currentExpended) : 0) + normalizedCost
    )
  );

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      sorcerer: {
        ...character.classFeatureState?.sorcerer,
        sorceryPointsExpended: nextExpended
      }
    }
  };
}

function getSpellfireFeatureDescriptionEntries(feature: CLASS_FEATURE): string[] {
  return (
    spellfireSorcerySubclassEntry?.features.find((row) => row.classFeatures.includes(feature))
      ?.featureOverrides?.[feature]?.description ?? []
  ).filter((entry): entry is string => typeof entry === "string");
}

const absorbSpellsCounterspellDescription = getSpellfireFeatureDescriptionEntries(
  CLASS_FEATURE.ABSORB_SPELLS
).slice(1);
export const spellfireCrownOfSpellfireDescription = getSpellfireFeatureDescriptionEntries(
  CLASS_FEATURE.CROWN_OF_SPELLFIRE
);

function hasSorcererSpellfireAbsorbSpellsFeature(
  character: SpellfireSorceryCharacter
): boolean {
  return (
    character.className === "Sorcerer" &&
    character.subclassId === spellfireSorcerySubclassId &&
    (character.level ?? 0) >= 6
  );
}

function hasSorcererSpellfireCrownOfSpellfireFeature(
  character: SpellfireSorceryCharacter
): boolean {
  return (
    character.className === "Sorcerer" &&
    character.subclassId === spellfireSorcerySubclassId &&
    (character.level ?? 0) >= 18
  );
}

function appendAbsorbSpellsCounterspellDescription(spell: SpellEntry): SpellEntry {
  if (!counterspellSpellId || spell.id !== counterspellSpellId) {
    return spell;
  }

  const missingDescriptionEntries = absorbSpellsCounterspellDescription.filter(
    (entry) => !spell.description.some((existingEntry) => existingEntry === entry)
  );

  if (missingDescriptionEntries.length <= 0) {
    return spell;
  }

  return {
    ...spell,
    description: [...spell.description, ...missingDescriptionEntries]
  };
}

function appendCrownOfSpellfireDescription(action: FeatureActionCard): FeatureActionCard {
  if (
    action.key !== sorcererInnateSorceryActionKey ||
    spellfireCrownOfSpellfireDescription.length <= 0
  ) {
    return action;
  }

  return appendUniqueDescriptionAddition(
    {
      ...action,
      description: action.description?.length
        ? [...action.description]
        : createDefaultFeatureActionDescription(action)
    },
    spellfireCrownOfSpellfireDescription
  );
}

function hasActiveSorcererSpellfireCrownOfSpellfire(character: SpellfireSorceryCharacter): boolean {
  return normalizeCharacterStatusEntries(character.statusEntries).some(
    (entry) => entry.sourceId === spellfireCrownOfSpellfireStatusSourceId
  );
}

function getSorcererSpellfireCrownOfSpellfireSpeedBonuses(
  character: SpellfireSorceryCharacter
): FeatureSpeedBonus[] {
  return hasActiveSorcererSpellfireCrownOfSpellfire(character)
    ? [
        {
          label: spellfireCrownOfSpellfireName,
          value: 0,
          movementType: "fly",
          setTotal: 60,
          hover: true
        }
      ]
    : [];
}

export function getSorcererSpellfireCrownOfSpellfireUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return hasSorcererSpellfireCrownOfSpellfireFeature(character) ? crownOfSpellfireUsesTotal : 0;
}

export function getSorcererSpellfireCrownOfSpellfireUsesRemaining(
  character: SpellfireSorceryCharacter
): number {
  const totalUses = getSorcererSpellfireCrownOfSpellfireUsesTotal(character);
  const expendedUses = Number(character.classFeatureState?.sorcerer?.crownOfSpellfireUsesExpended);
  const normalizedExpendedUses = Number.isFinite(expendedUses)
    ? Math.max(0, Math.min(totalUses, Math.floor(expendedUses)))
    : 0;

  return Math.max(0, totalUses - normalizedExpendedUses);
}

export function getSorcererSpellfireCrownOfSpellfireFallbackSorceryPointCost(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return hasSorcererSpellfireCrownOfSpellfireFeature(character)
    ? crownOfSpellfireFallbackSorceryPointCost
    : 0;
}

export function activateSorcererSpellfireCrownOfSpellfire(character: Character): Character {
  if (!hasSorcererSpellfireCrownOfSpellfireFeature(character)) {
    return character;
  }

  const usesRemaining = getSorcererSpellfireCrownOfSpellfireUsesRemaining(character);
  let nextCharacter = character;

  if (usesRemaining > 0) {
    const currentExpended = Number(character.classFeatureState?.sorcerer?.crownOfSpellfireUsesExpended);
    const nextExpended = Math.max(
      0,
      Math.min(
        crownOfSpellfireUsesTotal,
        (Number.isFinite(currentExpended) ? Math.floor(currentExpended) : 0) + 1
      )
    );

    nextCharacter = {
      ...character,
      classFeatureState: {
        ...character.classFeatureState,
        sorcerer: {
          ...character.classFeatureState?.sorcerer,
          crownOfSpellfireUsesExpended: nextExpended
        }
      }
    };
  } else {
    nextCharacter = spendSorcererSpellfireSorceryPoints(
      character,
      crownOfSpellfireFallbackSorceryPointCost
    );

    if (nextCharacter === character) {
      return character;
    }
  }

  return {
    ...nextCharacter,
    statusEntries: [
      ...normalizeCharacterStatusEntries(nextCharacter.statusEntries).filter(
        (entry) => entry.sourceId !== spellfireCrownOfSpellfireStatusSourceId
      ),
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: spellfireCrownOfSpellfireName,
        source: spellfireCrownOfSpellfireName,
        sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
        duration: {
          kind: STATUS_DURATION_KIND.LINKED,
          linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
          linkedValue: sorcererInnateSorceryEffectName
        },
        sourceId: spellfireCrownOfSpellfireStatusSourceId
      })
    ]
  };
}

export function restoreSorcererSpellfireCrownOfSpellfireOnLongRest(character: Character): Character {
  if (!hasSorcererSpellfireCrownOfSpellfireFeature(character)) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      sorcerer: {
        ...character.classFeatureState?.sorcerer,
        crownOfSpellfireUsesExpended: 0
      }
    }
  };
}

export const getSorcererSpellfireSorceryDerivedFeatureState: SubclassRuntimeResolver = (
  character
) =>
  character.className === "Sorcerer" &&
  character.subclassId === spellfireSorcerySubclassId &&
  (character.level ?? 0) >= 3
    ? {
        alwaysPreparedSpellIds: [
          ...getPreparedSpellIdsByLevel(character.level ?? 0, spellfireSorcerySpellIdsByLevel),
          ...((character.level ?? 0) >= 6 ? spellfireSorceryBonusSpellIdsByLevel[6] : [])
        ],
        transformFeatureAction: hasSorcererSpellfireCrownOfSpellfireFeature(character)
          ? appendCrownOfSpellfireDescription
          : undefined,
        transformSpellEntry: hasSorcererSpellfireAbsorbSpellsFeature(character)
          ? appendAbsorbSpellsCounterspellDescription
          : undefined,
        speedBonuses: getSorcererSpellfireCrownOfSpellfireSpeedBonuses(character)
      }
    : {};
