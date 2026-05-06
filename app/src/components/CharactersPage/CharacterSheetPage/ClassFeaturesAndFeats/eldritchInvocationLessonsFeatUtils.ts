import { ELDRITCH_INVOCATION, FEATS } from "../../../../codex/entries";
import { createCharacterFeatEntry } from "../../../../pages/CharactersPage/feats";
import { getWarlockInvocationFeatChoice } from "../../../../pages/CharactersPage/classFeatures/warlock/warlock";
import type { CharacterFeatEntry } from "../../../../types";
import { createPendingFeatStateForFeat } from "./featEditorUtils";

type CreateFeatEntryOptions = NonNullable<Parameters<typeof createCharacterFeatEntry>[2]>;

export function getLessonsOriginFeatForSelection(selectionId: string): FEATS | null {
  return getWarlockInvocationFeatChoice(selectionId);
}

export function doesLessonsOriginFeatNeedInput(feat: FEATS | null): boolean {
  return feat ? createPendingFeatStateForFeat(feat) !== null : false;
}

export function createLessonsOfTheFirstOnesFeatEntry(
  feat: FEATS,
  characterLevel: number,
  selectionId: string,
  options?: Omit<CreateFeatEntryOptions, "source">
): CharacterFeatEntry {
  return createCharacterFeatEntry(feat, characterLevel, {
    ...options,
    source: {
      type: "eldritch-invocation",
      invocation: ELDRITCH_INVOCATION.LESSONS_OF_THE_FIRST_ONES,
      selectionId
    }
  });
}
