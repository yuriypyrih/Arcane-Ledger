import { getClassEntryByName } from "../../codex/entries";
import type { Character } from "../../types";
import { STATUS_ENTRY_SOURCE_TYPE } from "../../types";
import { getCharacterClasses, getClassEditorCharacter } from "./multiclass";
import { getSelectedSubclassForCharacter } from "./subclasses";

type Owned = { sourceClassEntryId?: string; sourceClassLevel?: number; sourceSubclassId?: string };
const key = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Adopt recognizable feature effects without claiming manually entered traits. */
export function tagClassOwnedEffects(character: Character): Character {
  if (!character.multiclass) return character;
  const owners = getCharacterClasses(character)
    .flatMap((entry) => {
      const view = getClassEditorCharacter(character, entry);
      const rows = [
        ...(getClassEntryByName(entry.className)?.features ?? []).map((row) => ({
          row,
          subclassId: undefined as string | undefined
        })),
        ...(getSelectedSubclassForCharacter(view)?.features ?? []).map((row) => ({
          row,
          subclassId: entry.subclassId
        }))
      ];
      return rows
        .filter(({ row }) => row.level <= entry.level)
        .flatMap(({ row, subclassId }) =>
          row.classFeatures.map((feature) => ({
            key: key(feature),
            id: entry.id,
            level: row.level,
            classKey: key(entry.className),
            subclassId
          }))
        );
    })
    .sort((left, right) => right.key.length - left.key.length || left.level - right.level);
  function owner(source: string, sourceId: string, existing: Owned): Owned {
    if (existing.sourceClassLevel !== undefined) return {};
    const label = key(source);
    const id = key(sourceId);
    const found = owners.find(
      (item) =>
        (!existing.sourceClassEntryId || item.id === existing.sourceClassEntryId) &&
        (label === item.key ||
          label === `${item.classKey}-${item.key}` ||
          id === `feature-${item.key}` ||
          id === `feature-${item.classKey}-${item.key}` ||
          (id.startsWith(`feature-${item.classKey}-`) && id.endsWith(`-${item.key}`)))
    );
    return found
      ? {
          sourceClassEntryId: found.id,
          sourceClassLevel: found.level,
          sourceSubclassId: found.subclassId
        }
      : {};
  }
  return {
    ...character,
    statusEntries: (character.statusEntries ?? []).map((entry) =>
      entry.sourceType !== STATUS_ENTRY_SOURCE_TYPE.FEATURE
        ? entry
        : { ...entry, ...owner(entry.source, entry.sourceId ?? "", entry) }
    ),
    companions: character.companions?.map((entry) => ({
      ...entry,
      ...owner(entry.source, "", entry)
    }))
  };
}

export function pruneClassOwnedEffects(character: Character): Character {
  const owners = new Map(getCharacterClasses(character).map((entry) => [entry.id, entry]));
  const keep = (entry: Owned) => {
    if (!entry.sourceClassEntryId) return true;
    const source = owners.get(entry.sourceClassEntryId);
    return (
      source &&
      source.level >= (entry.sourceClassLevel ?? 1) &&
      (!entry.sourceSubclassId || entry.sourceSubclassId === source.subclassId)
    );
  };
  return {
    ...character,
    statusEntries: (character.statusEntries ?? []).filter(keep),
    companions: character.companions?.filter(keep)
  };
}
