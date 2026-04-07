import { getReactionEntryById } from "../../../../../codex/entries";
import type { SubclassRuntimeResolver } from "../../subclassRuntime";

export const collegeOfLoreSubclassId = "bard-college-of-lore";

export const getBardCollegeOfLoreDerivedFeatureState: SubclassRuntimeResolver = (character) => {
  if (
    character.className !== "Bard" ||
    character.subclassId !== collegeOfLoreSubclassId ||
    (character.level ?? 0) < 3
  ) {
    return {};
  }

  const cuttingWords = getReactionEntryById("reaction-cutting-words");

  return cuttingWords ? { reactionEntries: [cuttingWords] } : {};
};
