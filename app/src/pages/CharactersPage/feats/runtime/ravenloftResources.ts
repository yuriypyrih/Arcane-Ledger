import { FEATS } from "../../../../codex/entries/enums";
import { SKILL, type Character, type SkillName } from "../../../../types";
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

const sharpEyeSkills = {
  "common-action-search": [SKILL.INSIGHT, SKILL.MEDICINE, SKILL.PERCEPTION, SKILL.SURVIVAL],
  "common-action-study": [
    SKILL.ARCANA,
    SKILL.HISTORY,
    SKILL.INVESTIGATION,
    SKILL.NATURE,
    SKILL.RELIGION
  ]
} as const;

export function getSharpEyeSkillOptions(actionKey: string): readonly SkillName[] {
  return sharpEyeSkills[actionKey as keyof typeof sharpEyeSkills] ?? [];
}

export type SharpEyeCheck =
  | { kind: "roll"; skill: SkillName; dc: number }
  | { kind: "manual"; succeeded: boolean };
