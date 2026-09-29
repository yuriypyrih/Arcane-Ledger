import type { Character, CharacterFeatEntry } from "../../../../../types";
/** Immutable adapter over the existing saved feat records. Unchanged transitions retain identity. */
export function updateFeatEntries(
  character: Character,
  normalizedFeats: CharacterFeatEntry[],
  update: (entry: CharacterFeatEntry) => CharacterFeatEntry,
  firstMatch = false
): Character {
  let changed = false;
  const feats = normalizedFeats.map((entry) => {
    if (firstMatch && changed) return entry;
    const next = update(entry);
    changed ||= next !== entry;
    return next;
  });
  return changed ? { ...character, feats } : character;
}
