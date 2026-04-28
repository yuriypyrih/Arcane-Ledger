import type { Character } from "../../../../../../types";
import {
  createEconomyMultiContextForFeatureAction,
  getMonkFocusPointsRemainingForCharacter,
  getSharedEconomyMultiCountForCharacterAction,
  type FeatureActionCard
} from "../../../../../../pages/CharactersPage/classFeatures";
import { ECONOMY_TYPE, type EconomyType } from "../../../../../../pages/CharactersPage/actionEconomy";
import {
  getMonkWarriorOfMercyHandOfHealingFlurryUsesRemaining
} from "../../../../../../pages/CharactersPage/classFeatures/monk/subclasses/monkWarriorOfMercy";
import { shouldTrackRoundScopedResources } from "../../../../../../pages/CharactersPage/combat";
import { getEconomyShapeState } from "../../gameplayWidgetUtils";

type RoundTrackerAvailability = {
  isInCombat?: boolean;
  actionAvailable: boolean;
  bonusActionAvailable: boolean;
  reactionAvailable: boolean;
};

export type MonkHandOfHealingActionPathState = {
  id: "primary" | "secondary";
  economyType: EconomyType;
  shapeState: ReturnType<typeof getEconomyShapeState>;
  additionalUseCount: number;
  totalUseCount: number;
  disabledReason: string | null;
};

function getTotalUseCount(
  shapeState: ReturnType<typeof getEconomyShapeState>,
  additionalUseCount: number
): number {
  return (shapeState.isAvailable ? 1 : 0) + additionalUseCount;
}

function getPrimaryHandOfHealingActionPathState(
  character: Character,
  action: FeatureActionCard,
  roundTracker: RoundTrackerAvailability
): MonkHandOfHealingActionPathState {
  const sharedEconomyMultiCount = getSharedEconomyMultiCountForCharacterAction(
    character,
    createEconomyMultiContextForFeatureAction(action)
  );
  const shapeState = getEconomyShapeState(
    action.economyType,
    roundTracker,
    (action.economyMultiCount ?? 0) + sharedEconomyMultiCount
  );
  const focusRemaining = getMonkFocusPointsRemainingForCharacter(character);
  const disabledReason =
    action.disabled === true
      ? (action.disabledReason ?? "Hand of Healing is unavailable.")
      : focusRemaining <= 0
        ? "No Focus Points remaining."
        : shapeState.disabledReason;

  return {
    id: "primary",
    economyType: action.economyType,
    shapeState:
      disabledReason === null
        ? shapeState
        : {
            isAvailable: false,
            multiCount: 0,
            isUsable: false,
            disabledReason
          },
    additionalUseCount: disabledReason === null ? shapeState.multiCount : 0,
    totalUseCount:
      disabledReason === null ? getTotalUseCount(shapeState, shapeState.multiCount) : 0,
    disabledReason
  };
}

function getSecondaryHandOfHealingActionPathState(
  character: Character,
  roundTracker: RoundTrackerAvailability
): MonkHandOfHealingActionPathState | null {
  if (!shouldTrackRoundScopedResources(roundTracker)) {
    return null;
  }

  const flurryUsesRemaining = getMonkWarriorOfMercyHandOfHealingFlurryUsesRemaining(character);

  if (flurryUsesRemaining <= 0) {
    return null;
  }

  return {
    id: "secondary",
    economyType: ECONOMY_TYPE.BONUS_ACTION,
    shapeState: {
      isAvailable: false,
      multiCount: flurryUsesRemaining,
      isUsable: true,
      disabledReason: null
    },
    additionalUseCount: flurryUsesRemaining,
    totalUseCount: flurryUsesRemaining,
    disabledReason: null
  };
}

export function getMonkHandOfHealingActionPathStates(
  character: Character,
  action: FeatureActionCard,
  roundTracker: RoundTrackerAvailability
): MonkHandOfHealingActionPathState[] {
  const primaryPath = getPrimaryHandOfHealingActionPathState(character, action, roundTracker);
  const secondaryPath = getSecondaryHandOfHealingActionPathState(character, roundTracker);

  return secondaryPath ? [primaryPath, secondaryPath] : [primaryPath];
}
