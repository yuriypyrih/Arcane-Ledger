import { CLASS_FEATURE, REACTION, type ReactionEntry } from "../../../../../codex/entries";
import { getSubclassEntryById } from "../../../../../codex/subclasses";
import type { Character } from "../../../../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import type { SubclassRuntimeResolver } from "../../subclassRuntime";
import type { FeatureActionCard } from "../../types";

export const wildMagicSorcerySubclassId = "sorcerer-wild-magic-sorcery";
export const sorcererTidesOfChaosActionKey = "sorcerer-tides-of-chaos";
export const sorcererTamedSurgeActionKey = "sorcerer-tamed-surge";
export const sorcererBendLuckReactionId = "reaction-sorcerer-wild-magic-sorcery-bend-luck";

const tidesOfChaosName = "Tides of Chaos";
const bendLuckName = "Bend Luck";
const tamedSurgeName = "Tamed Surge";
const tidesOfChaosUsesTotal = 1;
const tamedSurgeUsesTotal = 1;
const wildMagicSorcerySubclassEntry = getSubclassEntryById(wildMagicSorcerySubclassId);

type WildMagicSorceryCharacter = Pick<Character, "className"> &
  Partial<Pick<Character, "classFeatureState" | "level" | "subclassId">>;

function getSorcererWildMagicFeatureDescription(feature: CLASS_FEATURE): string[] {
  return (
    wildMagicSorcerySubclassEntry?.features.find((row) => row.classFeatures.includes(feature))
      ?.featureOverrides?.[feature]?.description ?? []
  ).filter((entry): entry is string => typeof entry === "string");
}

const tidesOfChaosDescription = getSorcererWildMagicFeatureDescription(
  CLASS_FEATURE.TIDES_OF_CHAOS
);
const bendLuckDescription = getSorcererWildMagicFeatureDescription(CLASS_FEATURE.BEND_LUCK);
const tamedSurgeDescription = getSorcererWildMagicFeatureDescription(CLASS_FEATURE.TAMED_SURGE);
const bendLuckReactionEntry: ReactionEntry = {
  id: sorcererBendLuckReactionId,
  reaction: REACTION.BEND_LUCK,
  name: bendLuckName,
  sourceType: "feature",
  sourceFeature: CLASS_FEATURE.BEND_LUCK,
  sourceLabel: "Wild Magic Sorcery",
  description: bendLuckDescription
};

function hasSorcererTidesOfChaosFeature(character: WildMagicSorceryCharacter): boolean {
  return (
    character.className === "Sorcerer" &&
    character.subclassId === wildMagicSorcerySubclassId &&
    (character.level ?? 0) >= 3
  );
}

function hasSorcererBendLuckFeature(character: WildMagicSorceryCharacter): boolean {
  return (
    character.className === "Sorcerer" &&
    character.subclassId === wildMagicSorcerySubclassId &&
    (character.level ?? 0) >= 6
  );
}

function hasSorcererTamedSurgeFeature(character: WildMagicSorceryCharacter): boolean {
  return (
    character.className === "Sorcerer" &&
    character.subclassId === wildMagicSorcerySubclassId &&
    (character.level ?? 0) >= 18
  );
}

export function getSorcererWildMagicTidesOfChaosUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return hasSorcererTidesOfChaosFeature(character) ? tidesOfChaosUsesTotal : 0;
}

export function getSorcererWildMagicTamedSurgeUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return hasSorcererTamedSurgeFeature(character) ? tamedSurgeUsesTotal : 0;
}

function getSorcererWildMagicTidesOfChaosUsesRemaining(
  character: WildMagicSorceryCharacter
): number {
  const totalUses = getSorcererWildMagicTidesOfChaosUsesTotal(character);
  const expendedUses = Number(character.classFeatureState?.sorcerer?.tidesOfChaosUsesExpended);
  const normalizedExpendedUses = Number.isFinite(expendedUses)
    ? Math.max(0, Math.min(totalUses, Math.floor(expendedUses)))
    : 0;

  return Math.max(0, totalUses - normalizedExpendedUses);
}

function getSorcererWildMagicTamedSurgeUsesRemaining(character: WildMagicSorceryCharacter): number {
  const totalUses = getSorcererWildMagicTamedSurgeUsesTotal(character);
  const expendedUses = Number(character.classFeatureState?.sorcerer?.tamedSurgeUsesExpended);
  const normalizedExpendedUses = Number.isFinite(expendedUses)
    ? Math.max(0, Math.min(totalUses, Math.floor(expendedUses)))
    : 0;

  return Math.max(0, totalUses - normalizedExpendedUses);
}

function getSorcererWildMagicFeatureActions(
  character: WildMagicSorceryCharacter
): FeatureActionCard[] {
  const actions: FeatureActionCard[] = [];

  if (hasSorcererTidesOfChaosFeature(character)) {
    const usesRemaining = getSorcererWildMagicTidesOfChaosUsesRemaining(character);
    const disabledReason =
      usesRemaining <= 0
        ? "Cast a spell that expends a spell slot or finish a Long Rest to recharge this feature."
        : undefined;

    actions.push({
      key: sorcererTidesOfChaosActionKey,
      name: tidesOfChaosName,
      summary: "Gain Advantage on one D20 Test.",
      detail: "Give yourself Advantage on one D20 Test before you roll.",
      breakdown: "Advantage on one roll",
      economyType: ECONOMY_TYPE.FREE,
      actionCategory: ACTION_CATEGORY.MAGIC,
      usesRemaining,
      usesTotal: getSorcererWildMagicTidesOfChaosUsesTotal(character),
      description: tidesOfChaosDescription,
      drawer: {
        kind: "confirm",
        eyebrow: "Wild Magic Sorcery",
        description: tidesOfChaosDescription,
        helperText:
          usesRemaining > 0 ? "Use Tides of Chaos before you roll the D20 Test." : disabledReason
      },
      execute: {
        kind: "activate"
      },
      disabled: Boolean(disabledReason),
      disabledReason
    });
  }

  if (hasSorcererTamedSurgeFeature(character)) {
    const usesRemaining = getSorcererWildMagicTamedSurgeUsesRemaining(character);
    const disabledReason =
      usesRemaining <= 0 ? "Finish a Long Rest to recharge Tamed Surge." : undefined;

    actions.push({
      key: sorcererTamedSurgeActionKey,
      name: tamedSurgeName,
      summary: "Choose a Wild Magic Surge effect.",
      detail:
        "Choose an eligible Wild Magic Surge effect immediately after casting a spell slot spell.",
      breakdown: "Choose surge effect",
      economyType: ECONOMY_TYPE.FREE,
      actionCategory: ACTION_CATEGORY.MAGIC,
      usesRemaining,
      usesTotal: getSorcererWildMagicTamedSurgeUsesTotal(character),
      description: tamedSurgeDescription,
      drawer: {
        kind: "confirm",
        eyebrow: "Wild Magic Sorcery",
        description: tamedSurgeDescription,
        helperText:
          usesRemaining > 0
            ? "Use Tamed Surge after casting a Sorcerer spell with a spell slot."
            : disabledReason
      },
      execute: {
        kind: "activate"
      },
      disabled: Boolean(disabledReason),
      disabledReason
    });
  }

  return actions;
}

export function activateSorcererWildMagicTidesOfChaos(character: Character): Character {
  if (!hasSorcererTidesOfChaosFeature(character)) {
    return character;
  }

  if (getSorcererWildMagicTidesOfChaosUsesRemaining(character) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      sorcerer: {
        ...character.classFeatureState?.sorcerer,
        tidesOfChaosUsesExpended: tidesOfChaosUsesTotal
      }
    }
  };
}

export function activateSorcererWildMagicTamedSurge(character: Character): Character {
  if (!hasSorcererTamedSurgeFeature(character)) {
    return character;
  }

  if (getSorcererWildMagicTamedSurgeUsesRemaining(character) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      sorcerer: {
        ...character.classFeatureState?.sorcerer,
        tamedSurgeUsesExpended: tamedSurgeUsesTotal
      }
    }
  };
}

export function restoreSorcererWildMagicTidesOfChaosOnLongRest(character: Character): Character {
  if (!hasSorcererTidesOfChaosFeature(character)) {
    return character;
  }

  if ((character.classFeatureState?.sorcerer?.tidesOfChaosUsesExpended ?? 0) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      sorcerer: {
        ...character.classFeatureState?.sorcerer,
        tidesOfChaosUsesExpended: 0
      }
    }
  };
}

export function restoreSorcererWildMagicTamedSurgeOnLongRest(character: Character): Character {
  if (!hasSorcererTamedSurgeFeature(character)) {
    return character;
  }

  if ((character.classFeatureState?.sorcerer?.tamedSurgeUsesExpended ?? 0) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      sorcerer: {
        ...character.classFeatureState?.sorcerer,
        tamedSurgeUsesExpended: 0
      }
    }
  };
}

export function restoreSorcererWildMagicFeaturesOnLongRest(character: Character): Character {
  return restoreSorcererWildMagicTamedSurgeOnLongRest(
    restoreSorcererWildMagicTidesOfChaosOnLongRest(character)
  );
}

export function restoreSorcererWildMagicTidesOfChaosOnSpellSlotCast(
  character: Character
): Character {
  if (!hasSorcererTidesOfChaosFeature(character)) {
    return character;
  }

  if ((character.classFeatureState?.sorcerer?.tidesOfChaosUsesExpended ?? 0) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      sorcerer: {
        ...character.classFeatureState?.sorcerer,
        tidesOfChaosUsesExpended: 0
      }
    }
  };
}

export const getSorcererWildMagicSorceryDerivedFeatureState: SubclassRuntimeResolver = (
  character
) =>
  character.className === "Sorcerer" &&
  character.subclassId === wildMagicSorcerySubclassId &&
  (character.level ?? 0) >= 3
    ? {
        featureActions: getSorcererWildMagicFeatureActions(character),
        reactionEntries: hasSorcererBendLuckFeature(character) ? [bendLuckReactionEntry] : []
      }
    : {};
