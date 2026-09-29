import type { Character } from "../../types";
import { tagClassOwnedEffects, pruneClassOwnedEffects } from "./multiclassOwnership";
import { getClassEditorCharacter, projectStartingClass, scopedKeys } from "./multiclassState";

export {
  getCharacterLevel,
  getDeclaredCharacterClasses,
  getCharacterClasses,
  getClassEntry,
  getClassLevel,
  hasCharacterClass,
  getClassSubclassId,
  getClassCantripIds,
  getClassSpellbookIds,
  getClassEditorCharacter,
  projectStartingClass,
  readMulticlass,
  getClassSummary,
  getSpellFeatureCharacter,
  isSpellFromClass
} from "./multiclassState";

export function applyClassEditorChange(
  character: Character,
  entryId: string,
  update: (view: Character) => Character
): Character {
  if (!character.multiclass) return update(character);
  const entry = character.multiclass.classes.find((candidate) => candidate.id === entryId);
  if (!entry) return character;
  const before = getClassEditorCharacter(tagClassOwnedEffects(character), entry);
  const after = update(before);
  if (after === before) return character;
  const updatedEntry = {
    ...entry,
    ...Object.fromEntries(scopedKeys.map((key) => [key, after[key]])),
    ...(entry.className === "Custom" ? { customFeatureState: after.classFeatureState } : {})
  };
  const next: Character = {
    ...after,
    feats: after.feats?.map((feat) =>
      (feat.source.type === "class-feature" || feat.source.type === "eldritch-invocation") &&
      !feat.source.classEntryId
        ? { ...feat, source: { ...feat.source, classEntryId: entry.id } }
        : feat
    ),
    statusEntries: (after.statusEntries ?? []).map((item) =>
      item.sourceClassEntryId ||
      (before.statusEntries ?? []).some((previous) => previous.id === item.id)
        ? item
        : { ...item, sourceClassEntryId: entry.id }
    ),
    companions: after.companions?.map((item) =>
      item.sourceClassEntryId || before.companions?.some((previous) => previous.id === item.id)
        ? item
        : { ...item, sourceClassEntryId: entry.id }
    ),
    classEntryId: undefined,
    classFeatureState:
      entry.className === "Custom" ? character.classFeatureState : after.classFeatureState,
    multiclass: {
      ...character.multiclass,
      ...after.multiclass,
      classes: character.multiclass.classes.map((item) =>
        item.id === entryId ? updatedEntry : item
      )
    }
  };
  return pruneClassOwnedEffects(tagClassOwnedEffects(projectStartingClass(next)));
}
