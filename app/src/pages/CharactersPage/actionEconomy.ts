import {
  isRoundTrackerResourceAvailable,
  type RoundTrackerResource
} from "./combat";

export const ECONOMY_TYPE = {
  ACTION: "action",
  BONUS_ACTION: "bonus_action",
  REACTION: "reaction",
  NON_COMBAT: "non_combat",
  FREE: "free"
} as const;

export type EconomyType = (typeof ECONOMY_TYPE)[keyof typeof ECONOMY_TYPE];

export const ACTION_CATEGORY = {
  ATTACK: "attack",
  MAGIC: "magic",
  FEATURE: "feature",
  UTILITY: "utility",
  INTERACTION: "interaction"
} as const;

export type ActionCategory = (typeof ACTION_CATEGORY)[keyof typeof ACTION_CATEGORY];

export function getRoundTrackerResourceForEconomyType(
  economyType: EconomyType
): RoundTrackerResource | null {
  switch (economyType) {
    case ECONOMY_TYPE.ACTION:
      return "action";
    case ECONOMY_TYPE.BONUS_ACTION:
      return "bonusAction";
    case ECONOMY_TYPE.REACTION:
      return "reaction";
    case ECONOMY_TYPE.NON_COMBAT:
    case ECONOMY_TYPE.FREE:
    default:
      return null;
  }
}

export function isEconomyTypeAvailable(value: unknown, economyType: EconomyType): boolean {
  const resource = getRoundTrackerResourceForEconomyType(economyType);

  return resource ? isRoundTrackerResourceAvailable(value, resource) : true;
}
