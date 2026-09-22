import type { Character, CharacterMulticlass } from "../../types";
import { getLevelForXp, MAX_CHARACTER_LEVEL } from "./experience";
import { applyClassProgression, createMulticlassDraft } from "./multiclassProgression";
import { restoreHeroicInspirationForCharacter } from "./heroicInspiration";
import { reconcileCharacterAfterLevelDecrease } from "./levelReconciliation";

/** A single class always receives the entire character-level budget. */
export function allocateSingleClass(
  draft: CharacterMulticlass,
  totalLevel: number
): CharacterMulticlass {
  if (draft.classes.length !== 1) return draft;
  return { ...draft, classes: [{ ...draft.classes[0], level: totalLevel }] };
}

/** Unallocated points exist only in the modal draft, never in a saved character. */
export function applyClassLevelAllocation(
  character: Character,
  draft: CharacterMulticlass,
  totalLevel: number,
  xp: number
): Character {
  const original = createMulticlassDraft(character);
  const starting = draft.classes.find((entry) => entry.id === original.startingClassId);
  const originalStarting = original.classes.find((entry) => entry.id === original.startingClassId)!;
  if (
    draft.startingClassId !== original.startingClassId ||
    !starting ||
    starting.className !== originalStarting.className
  ) {
    throw new Error("The starting class cannot be changed or removed.");
  }
  if (!Number.isInteger(totalLevel) || totalLevel < 1 || totalLevel > MAX_CHARACTER_LEVEL) {
    throw new Error(`Enter a whole level from 1 to ${MAX_CHARACTER_LEVEL}.`);
  }
  if (
    !draft.classes.length ||
    draft.classes.some(
      (entry) =>
        !Number.isInteger(entry.level) || entry.level < (entry.id === draft.startingClassId ? 1 : 0)
    )
  ) {
    throw new Error(
      "Keep at least one level in the starting class and nonnegative levels in other classes."
    );
  }
  const allocated = draft.classes.reduce((sum, entry) => sum + entry.level, 0);
  if (allocated !== totalLevel) {
    throw new Error(`Allocate exactly ${totalLevel} class levels before saving.`);
  }
  if (!Number.isFinite(xp) || xp < 0 || getLevelForXp(xp) !== totalLevel) {
    throw new Error("Confirm XP and total level before saving.");
  }
  // Opening the shared editor or saving ordinary progress does not opt a sheet into multiclass.
  if (!character.multiclass && draft.classes.length === 1) {
    const next = {
      ...character,
      customClass: starting.customClass,
      classRules: starting.classRules,
      level: totalLevel,
      xp
    };
    if (totalLevel > character.level) return restoreHeroicInspirationForCharacter(next);
    if (totalLevel < character.level) return reconcileCharacterAfterLevelDecrease(next);
    return next;
  }
  // Keep confirmed XP within the new level when reducing the total level through XP editing.
  return { ...applyClassProgression(character, draft, xp), xp };
}
