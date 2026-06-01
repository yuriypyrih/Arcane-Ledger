import type { Character, CharacterArtificerFeatureState } from "../../../../../types";
import {
  consumeRoundTrackerResource,
  isRoundTrackerResourceAvailable
} from "../../../combat";
import { hasArtificerSubclassFeature } from "./artificerSubclassHelpers";

const battleSmithSubclassId = "artificer-battle-smith";

function getArtificerBattleSmithAdditionalAttackCount(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return hasArtificerBattleSmithExtraAttackFeature(character) ? 1 : 0;
}

export function hasArtificerBattleSmithExtraAttackFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return hasArtificerSubclassFeature(character, battleSmithSubclassId, 5);
}

export function normalizeArtificerBattleSmithState(
  value: unknown,
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): Pick<CharacterArtificerFeatureState, "extraAttacksRemainingThisTurn"> {
  if (!hasArtificerSubclassFeature(character, battleSmithSubclassId, 3)) {
    return {};
  }

  const record =
    value && typeof value === "object" ? (value as Partial<CharacterArtificerFeatureState>) : {};
  const additionalAttackCount = getArtificerBattleSmithAdditionalAttackCount(character);
  const extraAttacksRemainingThisTurn = Number(record.extraAttacksRemainingThisTurn);

  return {
    extraAttacksRemainingThisTurn:
      additionalAttackCount > 0
        ? Number.isFinite(extraAttacksRemainingThisTurn)
          ? Math.max(0, Math.min(additionalAttackCount, Math.floor(extraAttacksRemainingThisTurn)))
          : 0
        : undefined
  };
}

export function getArtificerBattleSmithWeaponAttackMultiCount(
  character: Pick<Character, "className" | "classFeatureState" | "level"> &
    Partial<Pick<Character, "subclassId">>
): number {
  return hasArtificerBattleSmithExtraAttackFeature(character)
    ? (character.classFeatureState?.artificer?.extraAttacksRemainingThisTurn ?? 0)
    : 0;
}

export function consumeArtificerBattleSmithWeaponAttack(character: Character): Character {
  if (!hasArtificerBattleSmithExtraAttackFeature(character)) {
    return isRoundTrackerResourceAvailable(character.roundTracker, "action")
      ? {
          ...character,
          roundTracker: consumeRoundTrackerResource(character.roundTracker, "action")
        }
      : character;
  }

  const artificerState = character.classFeatureState?.artificer ?? {};
  const extraAttacksRemaining = artificerState.extraAttacksRemainingThisTurn ?? 0;
  const actionAvailable = isRoundTrackerResourceAvailable(character.roundTracker, "action");

  if (actionAvailable) {
    return {
      ...character,
      roundTracker: consumeRoundTrackerResource(character.roundTracker, "action"),
      classFeatureState: {
        ...character.classFeatureState,
        artificer: {
          ...artificerState,
          extraAttacksRemainingThisTurn: getArtificerBattleSmithAdditionalAttackCount(character)
        }
      }
    };
  }

  if (extraAttacksRemaining <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      artificer: {
        ...artificerState,
        extraAttacksRemainingThisTurn: extraAttacksRemaining - 1
      }
    }
  };
}

export function advanceArtificerBattleSmithFeaturesForNewRound(character: Character): Character {
  if (!hasArtificerBattleSmithExtraAttackFeature(character)) {
    return character;
  }

  const artificerState = character.classFeatureState?.artificer ?? {};

  if ((artificerState.extraAttacksRemainingThisTurn ?? 0) === 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      artificer: {
        ...artificerState,
        extraAttacksRemainingThisTurn: 0
      }
    }
  };
}
