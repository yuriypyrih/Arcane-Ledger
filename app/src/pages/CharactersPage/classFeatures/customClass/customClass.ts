import { ELDRITCH_INVOCATION } from "../../../../codex/entries";
import type {
  Character,
  CharacterCustomClassFeatureState
} from "../../../../types";
import {
  ACTION_CATEGORY,
  ECONOMY_TYPE,
  getRoundTrackerResourceForEconomyType
} from "../../actionEconomy";
import {
  getCharacterClassRulesEldritchInvocationSelectionIds,
  getCharacterClassRulesExtraAttackCount,
  isCharacterClassRulesEldritchInvocationsEnabled
} from "../../customClass";
import { appendSourcedDescriptionAddition } from "../../actionModalDescriptions";
import {
  consumeRoundTrackerResource,
  isRoundTrackerResourceAvailable
} from "../../combat";
import { projectCompiledContributionsToClassFeatureDerivedState } from "../../featureContributions";
import type { WeaponAction } from "../../gameplay";
import type {
  ClassFeatureDerivedState,
  WeaponAttackConsumptionContext
} from "../types";
import { collectWarlockInvocationContributionState } from "../warlock/invocations/contributions";
import {
  activateWarlockGazeOfTwoMindsStatus,
  gazeOfTwoMindsActionKey
} from "../warlock/invocations/actions";
import { parseWarlockInvocationSelectionId } from "../warlock/invocations/selectionIds";
import { getWarlockWeaponAction } from "../warlock/warlock";
import { isWarlockInvocationSpellActionKey } from "../warlock/warlockInvocationSpellActions";

type CustomClassFeatureCharacter = Pick<Character, "className" | "level"> &
  Partial<
    Pick<
      Character,
      | "abilities"
      | "cantripIds"
      | "classRules"
      | "classFeatureState"
      | "customClass"
      | "feats"
      | "inventoryItems"
      | "spellSlotsExpended"
      | "statusEntries"
    >
  >;

function getSelectedCustomInvocationIds(character: CustomClassFeatureCharacter) {
  return new Set(
    getCharacterClassRulesEldritchInvocationSelectionIds(character)
      .map((selectionId) => parseWarlockInvocationSelectionId(selectionId).invocationId)
      .filter((invocationId): invocationId is ELDRITCH_INVOCATION => invocationId !== null)
  );
}

function appendCustomExtraAttackDescription(action: WeaponAction, extraAttackCount: number) {
  if (
    extraAttackCount <= 0 ||
    action.economyType !== ECONOMY_TYPE.ACTION ||
    action.actionCategory !== ACTION_CATEGORY.ATTACK
  ) {
    return action;
  }

  return appendSourcedDescriptionAddition(action, "Extra Attacks", [
    `When you take the Attack action on your turn, you can make ${extraAttackCount} additional ${extraAttackCount === 1 ? "attack" : "attacks"} with weapons or Unarmed Strikes. This neutral mechanic overrides extra attacks granted by class features.`
  ]);
}

export function normalizeCustomClassFeatureState(
  value: unknown,
  character: CustomClassFeatureCharacter
): CharacterCustomClassFeatureState {
  const extraAttackCount = getCharacterClassRulesExtraAttackCount(character);

  if (extraAttackCount <= 0) {
    return {};
  }

  const record =
    value && typeof value === "object" ? (value as Partial<CharacterCustomClassFeatureState>) : {};
  const rawExtraAttacksRemaining = Number(record.extraAttacksRemainingThisTurn);

  return {
    extraAttacksRemainingThisTurn: Number.isFinite(rawExtraAttacksRemaining)
      ? Math.max(0, Math.min(extraAttackCount, Math.floor(rawExtraAttacksRemaining)))
      : 0
  };
}

export function getCustomClassExtraAttacksRemainingThisTurn(
  character: CustomClassFeatureCharacter
): number {
  return normalizeCustomClassFeatureState(
    character.classFeatureState?.customClass,
    character
  ).extraAttacksRemainingThisTurn ?? 0;
}

export function getCustomClassWeaponAttackMultiCount(
  character: CustomClassFeatureCharacter
): number {
  return getCustomClassExtraAttacksRemainingThisTurn(character);
}

export function consumeCustomClassWeaponAttack(
  character: Character,
  action: WeaponAttackConsumptionContext
): Character {
  const roundTrackerResource = getRoundTrackerResourceForEconomyType(action.economyType);

  if (
    action.economyType !== ECONOMY_TYPE.ACTION ||
    action.actionCategory !== ACTION_CATEGORY.ATTACK
  ) {
    return roundTrackerResource &&
      isRoundTrackerResourceAvailable(character.roundTracker, roundTrackerResource)
      ? {
          ...character,
          roundTracker: consumeRoundTrackerResource(character.roundTracker, roundTrackerResource)
        }
      : character;
  }

  const extraAttackCount = getCharacterClassRulesExtraAttackCount(character);

  if (extraAttackCount <= 0) {
    return character;
  }

  const customClassState = normalizeCustomClassFeatureState(
    character.classFeatureState?.customClass,
    character
  );
  const extraAttacksRemaining = customClassState.extraAttacksRemainingThisTurn ?? 0;
  const actionAvailable =
    roundTrackerResource !== null &&
    isRoundTrackerResourceAvailable(character.roundTracker, roundTrackerResource);

  if (actionAvailable) {
    return {
      ...character,
      roundTracker: consumeRoundTrackerResource(character.roundTracker, roundTrackerResource),
      classFeatureState: {
        ...character.classFeatureState,
        customClass: {
          ...customClassState,
          extraAttacksRemainingThisTurn: extraAttackCount
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
      customClass: {
        ...customClassState,
        extraAttacksRemainingThisTurn: extraAttacksRemaining - 1
      }
    }
  };
}

export function advanceCustomClassFeaturesForNewRound(character: Character): Character {
  const customClassState = normalizeCustomClassFeatureState(
    character.classFeatureState?.customClass,
    character
  );

  if ((customClassState.extraAttacksRemainingThisTurn ?? 0) === 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      customClass: {
        ...customClassState,
        extraAttacksRemainingThisTurn: 0
      }
    }
  };
}

export function getClassNeutralMechanicsDerivedState(
  character: CustomClassFeatureCharacter
): ClassFeatureDerivedState {
  const extraAttackCount = getCharacterClassRulesExtraAttackCount(character);
  const hasEldritchInvocations = isCharacterClassRulesEldritchInvocationsEnabled(character);

  if (extraAttackCount <= 0 && !hasEldritchInvocations) {
    return {};
  }

  const invocationDerivedState = hasEldritchInvocations
    ? projectCompiledContributionsToClassFeatureDerivedState(
        collectWarlockInvocationContributionState(character),
        { character: character as Character }
      )
    : {};

  return {
    ...invocationDerivedState,
    transformWeaponAction: (action) =>
      appendCustomExtraAttackDescription(
        hasEldritchInvocations
          ? getWarlockWeaponAction(
              character as Character,
              invocationDerivedState.transformWeaponAction
                ? invocationDerivedState.transformWeaponAction(action)
                : action
            )
          : action,
        extraAttackCount
      )
  };
}

export function getCustomClassClassFeatureDerivedState(
  character: CustomClassFeatureCharacter
): ClassFeatureDerivedState {
  return getClassNeutralMechanicsDerivedState(character);
}

export function activateCustomClassFeatureAction(
  character: Character,
  actionKey: string
): Character | null {
  if (actionKey === gazeOfTwoMindsActionKey) {
    return getSelectedCustomInvocationIds(character).has(ELDRITCH_INVOCATION.GAZE_OF_TWO_MINDS)
      ? activateWarlockGazeOfTwoMindsStatus(character)
      : character;
  }

  if (isWarlockInvocationSpellActionKey(actionKey)) {
    return character;
  }

  return null;
}
