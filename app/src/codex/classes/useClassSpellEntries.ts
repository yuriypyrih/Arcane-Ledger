import { useMemo } from "react";
import type { SpellEntry } from "../entries/types";
import {
  getSpellEntriesForAllSpellListClasses,
  getSpellEntriesForSpellListClasses
} from "./spellAccess";
import {
  getClassSpellListClassesForCharacter,
  getPreparedSpellListClassesForCharacter
} from "./subclassSpellcasting";

const emptySpellEntries: SpellEntry[] = [];

export function getClassSpellEntries(className: string, subclassId?: string): SpellEntry[] {
  if (className.trim() === "Custom") {
    return getSpellEntriesForAllSpellListClasses();
  }

  const spellListClasses = getClassSpellListClassesForCharacter(className, subclassId);
  return spellListClasses.length > 0
    ? getSpellEntriesForSpellListClasses(spellListClasses)
    : emptySpellEntries;
}

export function useClassSpellEntries(className: string, subclassId?: string): SpellEntry[] {
  return useMemo(() => getClassSpellEntries(className, subclassId), [className, subclassId]);
}

export function getPreparedSpellEntries(
  className: string,
  level: number,
  subclassId?: string
): SpellEntry[] {
  if (className.trim() === "Custom") {
    return getSpellEntriesForAllSpellListClasses();
  }

  const spellListClasses = getPreparedSpellListClassesForCharacter(className, level, subclassId);
  return spellListClasses.length > 0
    ? getSpellEntriesForSpellListClasses(spellListClasses)
    : emptySpellEntries;
}

export function usePreparedSpellEntries(
  className: string,
  level: number,
  subclassId?: string
): SpellEntry[] {
  return useMemo(
    () => getPreparedSpellEntries(className, level, subclassId),
    [className, level, subclassId]
  );
}
