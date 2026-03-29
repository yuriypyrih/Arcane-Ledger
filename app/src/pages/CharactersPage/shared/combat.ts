import { ACTION_TYPE, type SpellEntry } from "../../../codex/entries";
import type { RoundTrackerResource } from "../combat";

export function getRoundTrackerResourceForSpell(spell: SpellEntry): RoundTrackerResource | null {
  if (spell.castingTime.includes(ACTION_TYPE.REACTION)) {
    return "reaction";
  }

  if (spell.castingTime.includes(ACTION_TYPE.BONUS_ACTION)) {
    return "bonusAction";
  }

  if (spell.castingTime.includes(ACTION_TYPE.ACTION)) {
    return "action";
  }

  return null;
}
