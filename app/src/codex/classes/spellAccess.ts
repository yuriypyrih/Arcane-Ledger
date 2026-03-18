import { useMemo } from "react";
import { SPELL_LIST_CLASS } from "../entries/enums";
import type { SpellEntry } from "../entries/types";
import { spellEntries } from "../spells";

const sortedSpellEntries = [...spellEntries].sort((left, right) => {
  if (left.spellLevel !== right.spellLevel) {
    return left.spellLevel - right.spellLevel;
  }

  return left.name.localeCompare(right.name);
});

const spellEntriesByListClass = new Map<SPELL_LIST_CLASS, SpellEntry[]>(
  Object.values(SPELL_LIST_CLASS).map((spellListClass) => [
    spellListClass,
    sortedSpellEntries.filter((spell) => spell.spellLists.includes(spellListClass))
  ])
);

const spellListClassByClassName: Partial<Record<string, SPELL_LIST_CLASS>> = {
  Artificer: SPELL_LIST_CLASS.ARTIFICER,
  Bard: SPELL_LIST_CLASS.BARD,
  Cleric: SPELL_LIST_CLASS.CLERIC,
  Druid: SPELL_LIST_CLASS.DRUID,
  Paladin: SPELL_LIST_CLASS.PALADIN,
  Ranger: SPELL_LIST_CLASS.RANGER,
  Sorcerer: SPELL_LIST_CLASS.SORCERER,
  Warlock: SPELL_LIST_CLASS.WARLOCK,
  Wizard: SPELL_LIST_CLASS.WIZARD
};

export function getSpellEntriesForSpellListClass(spellListClass: SPELL_LIST_CLASS): SpellEntry[] {
  return spellEntriesByListClass.get(spellListClass) ?? [];
}

export function getSpellEntriesForClassName(className: string): SpellEntry[] {
  const spellListClass = spellListClassByClassName[className];
  return spellListClass ? getSpellEntriesForSpellListClass(spellListClass) : [];
}

export function createUseSpellEntriesForSpellListClass(spellListClass: SPELL_LIST_CLASS) {
  return function useSpellEntriesForSpellListClass(): SpellEntry[] {
    return useMemo(() => getSpellEntriesForSpellListClass(spellListClass), []);
  };
}
