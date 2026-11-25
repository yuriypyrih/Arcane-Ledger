import { FEATS } from "../../../../codex/entries/enums";
import type { Character } from "../../../../types";
import { isRoundTrackerResourceAvailable, shouldTrackRoundScopedResources } from "../../combat";
import { getProficiencyBonus } from "../../proficiencyBonus";
import { featResource } from "./resources/counter";
import { collectFeatDerivedState } from "./state";

export const helpfulPremonitionReactionId = "reaction-helpful-premonition";

export const helpfulPremonitionResource = featResource(
  FEATS.ARCANE_OMENS,
  "arcaneOmens",
  "helpfulPremonitionUsesExpended",
  "Helpful Premonition",
  (character) => {
    const feat = collectFeatDerivedState(character).featsByFeat.get(FEATS.ARCANE_OMENS)?.[0];
    if (!feat) return null;

    const usesTotal = Math.max(0, Math.floor(getProficiencyBonus(character)));
    return {
      usesTotal,
      usesRemaining: Math.max(
        0,
        usesTotal - (feat.arcaneOmens?.helpfulPremonitionUsesExpended ?? 0)
      )
    };
  },
  "number"
);

export function spendHelpfulPremonitionForReaction(character: Character): Character {
  const { roundTracker } = character;
  if (
    shouldTrackRoundScopedResources(roundTracker) &&
    !isRoundTrackerResourceAvailable(roundTracker, "reaction")
  ) {
    return character;
  }

  return helpfulPremonitionResource.spendOne(character);
}
