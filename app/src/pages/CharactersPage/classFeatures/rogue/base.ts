import { rogueFeatures } from "../../../../codex/classes/rogue";
import { CLASS_FEATURE } from "../../../../codex/entries/enums";
import { getProgressionRow, getUnlockedProgressionFeatures } from "../../../../codex/progression";
import type { Character } from "../../../../types";
import { getClassLevel, hasCharacterClass } from "../../multiclassState";

export function hasRogueFeature(
  character: Pick<Character, "className" | "level">,
  feature: CLASS_FEATURE
): boolean {
  if (!hasCharacterClass(character, "Rogue")) {
    return false;
  }

  const level = Math.max(1, Math.min(20, Math.floor(getClassLevel(character, "Rogue"))));
  return getUnlockedProgressionFeatures(rogueFeatures, level).has(feature);
}

export function getRogueSneakAttackDiceCount(
  character: Pick<Character, "className" | "level">
): number {
  if (!hasRogueFeature(character, CLASS_FEATURE.SNEAK_ATTACK)) {
    return 0;
  }

  const level = Math.max(1, Math.min(20, Math.floor(getClassLevel(character, "Rogue"))));
  return getProgressionRow(rogueFeatures, level)?.sneakAttack ?? 0;
}
