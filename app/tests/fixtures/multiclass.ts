import type { Character, CharacterClassEntry } from "../../src/types";
import { characterFixture } from "./character";
import {
  createMulticlassDraft,
  applyClassProgression
} from "../../src/pages/CharactersPage/multiclassProgression";

export function multiclassFixture(
  classes: (Partial<CharacterClassEntry> & Pick<CharacterClassEntry, "className" | "level">)[],
  overrides: Partial<Character> = {}
): Character {
  const legacy = characterFixture({
    className: classes[0].className,
    level: classes[0].level,
    xp: 0,
    ...overrides
  });
  const draft = createMulticlassDraft(legacy);
  draft.classes = classes.map((entry, i) => ({
    ...entry,
    id: i === 0 ? draft.startingClassId : `class-${i}`
  }));
  draft.prerequisiteOverride = true;
  draft.hitPointsAdjustment = 0;
  return applyClassProgression(legacy, draft);
}
