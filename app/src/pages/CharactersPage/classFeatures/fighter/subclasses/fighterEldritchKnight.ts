import { ACTION_TYPE, type SpellEntry } from "../../../../../codex/entries";
import type { Character, CharacterFighterFeatureState } from "../../../../../types";
import { consumeRoundTrackerResource, isRoundTrackerResourceAvailable } from "../../../combat";
import type { SubclassRuntimeResolver } from "../../subclassRuntime";

export const eldritchKnightSubclassId = "fighter-eldritch-knight";

type FighterEldritchKnightCharacter = Pick<Character, "className"> &
  Partial<Pick<Character, "level" | "subclassId" | "classFeatureState" | "roundTracker">>;

function getFighterEldritchKnightWarMagicUseLimit(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  if (!hasFighterEldritchKnightWarMagicFeature(character)) {
    return 0;
  }

  return (character.level ?? 0) >= 18 ? 2 : 1;
}

export function getFighterEldritchKnightWarMagicSpellLevels(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number[] {
  if (!hasFighterEldritchKnightWarMagicFeature(character)) {
    return [];
  }

  return (character.level ?? 0) >= 18 ? [0, 1, 2] : [0];
}

function getFighterEldritchKnightWarMagicUsesThisTurn(
  character: FighterEldritchKnightCharacter
): number {
  const fighterState =
    character.classFeatureState?.fighter as
      | (Partial<CharacterFighterFeatureState> & {
          eldritchKnightWarMagicUsedThisTurn?: unknown;
        })
      | undefined;
  const currentValue = fighterState?.eldritchKnightWarMagicUsesThisTurn;

  if (Number.isFinite(Number(currentValue))) {
    return Math.max(0, Math.floor(Number(currentValue)));
  }

  return fighterState?.eldritchKnightWarMagicUsedThisTurn === true ? 1 : 0;
}

export function normalizeFighterEldritchKnightFeatureState(
  value: Partial<CharacterFighterFeatureState>,
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): Partial<CharacterFighterFeatureState> {
  const legacyValue = value as Partial<CharacterFighterFeatureState> & {
    eldritchKnightWarMagicUsedThisTurn?: unknown;
  };
  const warMagicUseLimit = getFighterEldritchKnightWarMagicUseLimit(character);
  const warMagicUsesThisTurn = Number.isFinite(Number(value.eldritchKnightWarMagicUsesThisTurn))
    ? Math.floor(Number(value.eldritchKnightWarMagicUsesThisTurn))
    : legacyValue.eldritchKnightWarMagicUsedThisTurn === true
      ? 1
      : 0;

  return {
    eldritchKnightWarMagicUsesThisTurn: hasFighterEldritchKnightWarMagicFeature(character)
      ? Math.max(0, Math.min(warMagicUseLimit, warMagicUsesThisTurn))
      : undefined
  };
}

export function advanceFighterEldritchKnightFeaturesForNewRound(character: Character): Character {
  if (!hasFighterEldritchKnightWarMagicFeature(character)) {
    return character;
  }

  const fighterState = character.classFeatureState?.fighter ?? ({} as CharacterFighterFeatureState);

  if ((fighterState.eldritchKnightWarMagicUsesThisTurn ?? 0) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      fighter: {
        ...fighterState,
        eldritchKnightWarMagicUsesThisTurn: 0
      }
    }
  };
}

function hasFighterEldritchKnightWarMagicFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Fighter" &&
    character.subclassId === eldritchKnightSubclassId &&
    (character.level ?? 0) >= 7
  );
}

function getFighterAdditionalAttackCount(
  character: Partial<Pick<Character, "className" | "level">>
): number {
  if (character.className !== "Fighter") {
    return 0;
  }

  if ((character.level ?? 0) >= 20) {
    return 3;
  }

  if ((character.level ?? 0) >= 11) {
    return 2;
  }

  if ((character.level ?? 0) >= 5) {
    return 1;
  }

  return 0;
}

function getFighterExtraAttacksRemaining(
  character: Pick<Character, "classFeatureState"> & Partial<Pick<Character, "className" | "level">>
): number {
  if (getFighterAdditionalAttackCount(character) <= 0) {
    return 0;
  }

  return character.classFeatureState?.fighter?.extraAttacksRemainingThisTurn ?? 0;
}

function isWarMagicSpell(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>,
  spell: Pick<SpellEntry, "castingTime" | "spellLevel">
): boolean {
  return (
    spell.castingTime.includes(ACTION_TYPE.ACTION) &&
    getFighterEldritchKnightWarMagicSpellLevels(character).includes(spell.spellLevel)
  );
}

function getFighterEldritchKnightWarMagicRemainingUses(
  character: FighterEldritchKnightCharacter
): number {
  return Math.max(
    0,
    getFighterEldritchKnightWarMagicUseLimit(character) -
      getFighterEldritchKnightWarMagicUsesThisTurn(character)
  );
}

export function getFighterEldritchKnightWarMagicMultiCount(
  character: FighterEldritchKnightCharacter
): number {
  if (!hasFighterEldritchKnightWarMagicFeature(character)) {
    return 0;
  }

  return Math.min(
    getFighterEldritchKnightWarMagicRemainingUses(character),
    getFighterExtraAttacksRemaining(character)
  );
}

export function canUseFighterEldritchKnightActionCantripReplacement(
  character: FighterEldritchKnightCharacter,
  spell: Pick<SpellEntry, "castingTime" | "spellLevel">
): boolean {
  if (!hasFighterEldritchKnightWarMagicFeature(character) || !isWarMagicSpell(character, spell)) {
    return false;
  }

  return (
    isRoundTrackerResourceAvailable(character.roundTracker, "action") ||
    getFighterEldritchKnightWarMagicMultiCount(character) > 0
  );
}

export function consumeFighterEldritchKnightActionCantrip(character: Character): Character {
  if (!hasFighterEldritchKnightWarMagicFeature(character)) {
    return character;
  }

  const fighterState = character.classFeatureState?.fighter ?? ({} as CharacterFighterFeatureState);
  const extraAttacksRemaining = fighterState.extraAttacksRemainingThisTurn ?? 0;
  const actionAvailable = isRoundTrackerResourceAvailable(character.roundTracker, "action");
  const warMagicUsesThisTurn = getFighterEldritchKnightWarMagicUsesThisTurn(character);

  if (warMagicUsesThisTurn >= getFighterEldritchKnightWarMagicUseLimit(character)) {
    return character;
  }

  if (actionAvailable) {
    return {
      ...character,
      roundTracker: consumeRoundTrackerResource(character.roundTracker, "action"),
      classFeatureState: {
        ...character.classFeatureState,
        fighter: {
          ...fighterState,
          extraAttacksRemainingThisTurn: getFighterAdditionalAttackCount(character),
          eldritchKnightWarMagicUsesThisTurn: warMagicUsesThisTurn + 1
        }
      }
    };
  }

  if (extraAttacksRemaining > 0) {
    return {
      ...character,
      classFeatureState: {
        ...character.classFeatureState,
        fighter: {
          ...fighterState,
          extraAttacksRemainingThisTurn: extraAttacksRemaining - 1,
          eldritchKnightWarMagicUsesThisTurn: warMagicUsesThisTurn + 1
        }
      }
    };
  }

  return character;
}

export const getFighterEldritchKnightDerivedFeatureState: SubclassRuntimeResolver = () => ({});
