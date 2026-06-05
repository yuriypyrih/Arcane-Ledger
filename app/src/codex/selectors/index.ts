import { hardcodedCodexEntries } from "../entries/data";
import { ENTRY_CATEGORIES, SPELL_LIST_CLASS } from "../entries/enums";
import type {
  ArmorEntry,
  BackgroundEntry,
  ClassEntry,
  CodexCategory,
  CodexEntry,
  ItemEntry,
  SpeciesEntry,
  SpellEntry,
  WeaponEntry
} from "../entries/types";

type EntryForCategory<TCategory extends CodexCategory> = Extract<
  CodexEntry,
  { category: TCategory }
>;

export type LoadoutCodexEntry = WeaponEntry | ArmorEntry | ItemEntry;

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

const allCodexEntries = [...hardcodedCodexEntries];
const codexEntriesById = new Map(allCodexEntries.map((entry) => [entry.id, entry]));
const codexEntriesByName = new Map(
  allCodexEntries.map((entry) => [entry.name.trim().toLowerCase(), entry])
);
const codexEntriesByCategory = new Map<CodexCategory, CodexEntry[]>(
  Object.values(ENTRY_CATEGORIES).map((category) => [
    category,
    allCodexEntries.filter((entry) => entry.category === category)
  ])
);

function sortSpellEntries(entries: SpellEntry[]): SpellEntry[] {
  return [...entries].sort((left, right) => {
    if (left.spellLevel !== right.spellLevel) {
      return left.spellLevel - right.spellLevel;
    }

    return left.name.localeCompare(right.name);
  });
}

export function getCodexEntries(): CodexEntry[] {
  return allCodexEntries;
}

export function getCodexEntryById(entryId: string): CodexEntry | null {
  return codexEntriesById.get(entryId) ?? null;
}

export function getCodexEntryByName(name: string): CodexEntry | null {
  return codexEntriesByName.get(name.trim().toLowerCase()) ?? null;
}

export function getEntriesByCategory<TCategory extends CodexCategory>(
  category: TCategory
): EntryForCategory<TCategory>[] {
  return (codexEntriesByCategory.get(category) ?? []) as EntryForCategory<TCategory>[];
}

export function getSpellEntries(): SpellEntry[] {
  return getEntriesByCategory(ENTRY_CATEGORIES.SPELLS);
}

export function getSpellEntryById(spellId: string): SpellEntry | null {
  const entry = getCodexEntryById(spellId);
  return entry?.category === ENTRY_CATEGORIES.SPELLS ? entry : null;
}

export function getSpellEntryByName(name: string): SpellEntry | null {
  const entry = getCodexEntryByName(name);
  return entry?.category === ENTRY_CATEGORIES.SPELLS ? entry : null;
}

export function getWeaponEntries(): WeaponEntry[] {
  return getEntriesByCategory(ENTRY_CATEGORIES.WEAPONS);
}

export function getArmorEntries(): ArmorEntry[] {
  return getEntriesByCategory(ENTRY_CATEGORIES.ARMOR);
}

export function getItemEntries(): ItemEntry[] {
  return getEntriesByCategory(ENTRY_CATEGORIES.ITEMS);
}

export function getLoadoutEntries(): LoadoutCodexEntry[] {
  return [...getWeaponEntries(), ...getArmorEntries(), ...getItemEntries()];
}

export function getBackgroundEntries(): BackgroundEntry[] {
  return [...getEntriesByCategory(ENTRY_CATEGORIES.BACKGROUNDS)].sort((left, right) =>
    left.name.localeCompare(right.name)
  );
}

export function getBackgroundEntryByName(name: string): BackgroundEntry | null {
  const entry = getCodexEntryByName(name);
  return entry?.category === ENTRY_CATEGORIES.BACKGROUNDS ? entry : null;
}

export function getSpeciesEntries(): SpeciesEntry[] {
  return getEntriesByCategory(ENTRY_CATEGORIES.SPECIES);
}

export function getSpeciesEntryByName(name: string): SpeciesEntry | null {
  const entry = getCodexEntryByName(name);
  return entry?.category === ENTRY_CATEGORIES.SPECIES ? entry : null;
}

export function getClassEntries(): ClassEntry[] {
  return getEntriesByCategory(ENTRY_CATEGORIES.CLASSES);
}

export function getClassEntryByName(name: string): ClassEntry | null {
  const entry = getCodexEntryByName(name);
  return entry?.category === ENTRY_CATEGORIES.CLASSES ? entry : null;
}

export function getSpellEntriesForSpellListClass(spellListClass: SPELL_LIST_CLASS): SpellEntry[] {
  return sortSpellEntries(
    getSpellEntries().filter((spell) => spell.spellLists.includes(spellListClass))
  );
}

export function getSpellEntriesForSpellListClasses(
  spellListClasses: SPELL_LIST_CLASS[]
): SpellEntry[] {
  const spellEntriesById = new Map<string, SpellEntry>();

  spellListClasses.forEach((spellListClass) => {
    getSpellEntriesForSpellListClass(spellListClass).forEach((spell) => {
      spellEntriesById.set(spell.id, spell);
    });
  });

  return sortSpellEntries([...spellEntriesById.values()]);
}

export function getSpellEntriesForClassName(className: string): SpellEntry[] {
  const spellListClass = spellListClassByClassName[className];
  return spellListClass ? getSpellEntriesForSpellListClass(spellListClass) : [];
}
