import type { Character } from "../../../../../../types";
import {
  createEconomyMultiContextForFeatureAction,
  getSharedEconomyMultiCountForCharacterAction,
  type FeatureActionCard
} from "../../../../../../pages/CharactersPage/classFeatures";
import type { EconomyType } from "../../../../../../pages/CharactersPage/actionEconomy";
import { getEconomyShapeState } from "../../gameplayWidgetUtils";

type RoundTrackerAvailability = {
  isInCombat?: boolean;
  actionAvailable: boolean;
  bonusActionAvailable: boolean;
  reactionAvailable: boolean;
};

export type FeatureActionPathState = {
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

function getUniqueActionEconomyTypes(action: FeatureActionCard): EconomyType[] {
  const economyTypes = [action.economyType, ...(action.alternateEconomyTypes ?? [])];
  const seen = new Set<EconomyType>();

  return economyTypes.filter((economyType) => {
    if (seen.has(economyType)) {
      return false;
    }

    seen.add(economyType);
    return true;
  });
}

function createFeatureActionPathState(
  character: Character,
  action: FeatureActionCard,
  economyType: EconomyType,
  id: FeatureActionPathState["id"],
  roundTracker: RoundTrackerAvailability
): FeatureActionPathState {
  const economyAction =
    economyType === action.economyType
      ? action
      : {
          ...action,
          economyType
        };
  const additionalUseCount =
    (economyType === action.economyType ? (action.economyMultiCount ?? 0) : 0) +
    getSharedEconomyMultiCountForCharacterAction(
      character,
      createEconomyMultiContextForFeatureAction(economyAction)
    );
  const shapeState = getEconomyShapeState(economyType, roundTracker, additionalUseCount);
  const disabledReason =
    action.disabled === true ? (action.disabledReason ?? "This action is unavailable.") : null;

  return {
    id,
    economyType,
    shapeState:
      disabledReason === null
        ? shapeState
        : {
            isAvailable: false,
            multiCount: 0,
            isUsable: false,
            disabledReason
          },
    additionalUseCount: disabledReason === null ? additionalUseCount : 0,
    totalUseCount: disabledReason === null ? getTotalUseCount(shapeState, additionalUseCount) : 0,
    disabledReason: disabledReason ?? shapeState.disabledReason
  };
}

export function hasFeatureActionAlternateEconomyPath(action: FeatureActionCard): boolean {
  return getUniqueActionEconomyTypes(action).length > 1;
}

export function getFeatureActionPathStates(
  character: Character,
  action: FeatureActionCard,
  roundTracker: RoundTrackerAvailability
): FeatureActionPathState[] {
  return getUniqueActionEconomyTypes(action)
    .slice(0, 2)
    .map((economyType, index) =>
      createFeatureActionPathState(
        character,
        action,
        economyType,
        index === 0 ? "primary" : "secondary",
        roundTracker
      )
    );
}
