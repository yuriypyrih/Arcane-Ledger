import { useMemo } from "react";
import type { SpellEntry } from "../entries/types";
import { getSpellEntriesForSpellListClasses } from "./spellAccess";
import {
  getClassSpellListClassesForCharacter,
  getPreparedSpellListClassesForCharacter
} from "./subclassSpellcasting";

const emptySpellEntries: SpellEntry[] = [];

export function useClassSpellEntries(className: string, subclassId?: string): SpellEntry[] {
  return useMemo(() => {
    const spellListClasses = getClassSpellListClassesForCharacter(className, subclassId);
    return spellListClasses.length > 0
      ? getSpellEntriesForSpellListClasses(spellListClasses)
      : emptySpellEntries;
  }, [className, subclassId]);
}

export function usePreparedSpellEntries(
  className: string,
  level: number,
  subclassId?: string
): SpellEntry[] {
  return useMemo(() => {
    const spellListClasses = getPreparedSpellListClassesForCharacter(className, level, subclassId);
    return spellListClasses.length > 0
      ? getSpellEntriesForSpellListClasses(spellListClasses)
      : emptySpellEntries;
  }, [className, level, subclassId]);
}
