import { FEATS } from "../../../../codex/entries/enums";
import type { Character } from "../../../../types";
import { isRoundTrackerResourceAvailable, shouldTrackRoundScopedResources } from "../../combat";
import { proficiencyBonusFeatResource } from "./resources/counter";

export const mistWalkReactionId = "reaction-mist-walk";
export const mistWalkResource = proficiencyBonusFeatResource(
  FEATS.MIST_WALKER,
  "mistWalker",
  "mistWalkUsesExpended",
  "Mist Walk",
  (entry) => entry.mistWalker?.mistWalkUsesExpended
);

export function spendMistWalkForReaction(character: Character): Character {
  return shouldTrackRoundScopedResources(character.roundTracker) &&
    !isRoundTrackerResourceAvailable(character.roundTracker, "reaction")
    ? character
    : mistWalkResource.spendOne(character);
}

export const sharpEyeResource = proficiencyBonusFeatResource(
  FEATS.SHARP_EYE,
  "sharpEye",
  "usesExpended",
  "Sharp Eye",
  (entry) => entry.sharpEye?.usesExpended
);
