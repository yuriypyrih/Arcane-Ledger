import type { CharacterClassEntry } from "../../../types";
import { getClassEditorCharacter, getSpellFeatureCharacter } from "../multiclassState";

const classViews = new WeakMap<
  object,
  WeakMap<CharacterClassEntry, ReturnType<typeof getClassEditorCharacter>>
>();
const spellViews = new WeakMap<object, object>();

/** Read-only views shared by derivations of the same immutable character snapshot.
 * Editors still use getClassEditorCharacter to obtain a fresh working projection. */
export function getClassRuntimeCharacter<T extends object>(
  character: T,
  entry: CharacterClassEntry
) {
  let views = classViews.get(character);
  if (!views) {
    views = new WeakMap();
    classViews.set(character, views);
  }
  const cached = views.get(entry);
  if (cached) return cached as T & typeof cached;
  const view = getClassEditorCharacter(character, entry);
  views.set(entry, view);
  return view;
}

export function getSpellRuntimeCharacter<T extends object>(character: T): T {
  const cached = spellViews.get(character);
  if (cached) return cached as T;
  const view = getSpellFeatureCharacter(character);
  spellViews.set(character, view);
  return view;
}
