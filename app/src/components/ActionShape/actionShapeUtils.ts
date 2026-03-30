import { ACTION_TYPE, type SpellCastingTimePart } from "../../codex/entries";

export type ActionShapeType = "action" | "bonusAction" | "reaction" | "nonCombat";

export function getActionShapeForCastingTime(
  castingTime: SpellCastingTimePart[]
): ActionShapeType | null {
  if (castingTime.includes(ACTION_TYPE.REACTION)) {
    return "reaction";
  }

  if (castingTime.includes(ACTION_TYPE.BONUS_ACTION)) {
    return "bonusAction";
  }

  if (castingTime.includes(ACTION_TYPE.ACTION)) {
    return "action";
  }

  return castingTime.length > 0 ? "nonCombat" : null;
}
