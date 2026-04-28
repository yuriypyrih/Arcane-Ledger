import type { Character } from "../../../../../../types";
import {
  createEconomyMultiContextForFeatureAction,
  getSharedEconomyMultiCountForCharacterAction,
  type FeatureActionCard
} from "../../../../../../pages/CharactersPage/classFeatures";
import {
  ECONOMY_TYPE,
  type EconomyType
} from "../../../../../../pages/CharactersPage/actionEconomy";
import { shouldTrackRoundScopedResources } from "../../../../../../pages/CharactersPage/combat";
import {
  getMonkCommonActionBonusPathAdditionalUseCount,
  hasMonkFocusCommonActionBonusPath
} from "../../../../../../pages/CharactersPage/classFeatures/monk/monk";
import { hasRogueCunningActionCommonActionBonusPath } from "../../../../../../pages/CharactersPage/classFeatures/rogue/rogue";
import { getEconomyShapeState } from "../../gameplayWidgetUtils";

type RoundTrackerAvailability = {
  isInCombat?: boolean;
  actionAvailable: boolean;
  bonusActionAvailable: boolean;
  reactionAvailable: boolean;
};

export type CommonActionPathState = {
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

function getCommonActionAdditionalUseCount(
  character: Character,
  action: Pick<FeatureActionCard, "economyType" | "actionCategory">
): number {
  return getSharedEconomyMultiCountForCharacterAction(
    character,
    createEconomyMultiContextForFeatureAction(action)
  );
}

function getPrimaryCommonActionPathState(
  character: Character,
  action: FeatureActionCard,
  roundTracker: RoundTrackerAvailability
): CommonActionPathState {
  const additionalUseCount = shouldTrackRoundScopedResources(roundTracker)
    ? (action.economyMultiCount ?? 0) + getCommonActionAdditionalUseCount(character, action)
    : 0;
  const shapeState = getEconomyShapeState(action.economyType, roundTracker, additionalUseCount);
  const disabledReason =
    action.disabled === true ? (action.disabledReason ?? "This action is unavailable.") : null;

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
    additionalUseCount: disabledReason === null ? additionalUseCount : 0,
    totalUseCount: disabledReason === null ? getTotalUseCount(shapeState, additionalUseCount) : 0,
    disabledReason: disabledReason ?? shapeState.disabledReason
  };
}

function getSecondaryCommonActionPathState(
  character: Character,
  action: FeatureActionCard,
  roundTracker: RoundTrackerAvailability
): CommonActionPathState | null {
  if (!shouldTrackRoundScopedResources(roundTracker)) {
    return null;
  }

  const hasMonkBonusPath = hasMonkFocusCommonActionBonusPath(character, action.key);
  const hasRogueBonusPath = hasRogueCunningActionCommonActionBonusPath(character, action.key);

  if (!hasMonkBonusPath && !hasRogueBonusPath) {
    return null;
  }

  const bonusAction = {
    ...action,
    economyType: ECONOMY_TYPE.BONUS_ACTION
  };
  const additionalUseCount =
    getCommonActionAdditionalUseCount(character, bonusAction) +
    (hasMonkBonusPath ? getMonkCommonActionBonusPathAdditionalUseCount(character, action.key) : 0);
  const shapeState = getEconomyShapeState(
    ECONOMY_TYPE.BONUS_ACTION,
    roundTracker,
    additionalUseCount
  );
  const disabledReason =
    action.disabled === true ? (action.disabledReason ?? "This action is unavailable.") : null;

  return {
    id: "secondary",
    economyType: ECONOMY_TYPE.BONUS_ACTION,
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

export function getCommonActionPathStates(
  character: Character,
  action: FeatureActionCard,
  roundTracker: RoundTrackerAvailability
): CommonActionPathState[] {
  const primaryPath = getPrimaryCommonActionPathState(character, action, roundTracker);
  const secondaryPath = getSecondaryCommonActionPathState(character, action, roundTracker);

  return secondaryPath ? [primaryPath, secondaryPath] : [primaryPath];
}
