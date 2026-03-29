import {
  ENTRY_CATEGORIES,
  type CodexCategory,
  type CodexEntry,
  type SpellEntry
} from "../entries";
import {
  getCodexEntries,
  getCodexEntryById,
  getEntriesByCategory as getSyncEntriesByCategory,
  getSpellEntriesForClassName as getSyncSpellEntriesForClassName,
  getSpellEntriesForSpellListClass as getSyncSpellEntriesForSpellListClass,
  getSpellEntriesForSpellListClasses as getSyncSpellEntriesForSpellListClasses
} from "../selectors";
import type { CodexRepository } from "./types";

const sortEntriesByName = <T extends CodexEntry>(entries: T[]): T[] =>
  [...entries].sort((left, right) => left.name.localeCompare(right.name));

function createCodexRepository(): CodexRepository {
  const categoryCache = new Map<CodexCategory, Promise<CodexEntry[]>>();
  let allEntriesPromise: Promise<CodexEntry[]> | null = null;

  async function getEntriesByCategory(category: CodexCategory): Promise<CodexEntry[]> {
    const cachedEntries = categoryCache.get(category);

    if (cachedEntries) {
      return cachedEntries;
    }

    const nextEntriesPromise = Promise.resolve(getSyncEntriesByCategory(category)).then((entries) =>
      category === ENTRY_CATEGORIES.SPELLS ? entries : sortEntriesByName(entries)
    );
    categoryCache.set(category, nextEntriesPromise);
    return nextEntriesPromise;
  }

  async function getAllEntries(): Promise<CodexEntry[]> {
    if (!allEntriesPromise) {
      allEntriesPromise = Promise.resolve(getCodexEntries());
    }

    return allEntriesPromise;
  }

  async function getEntryById(entryId: string): Promise<CodexEntry | null> {
    return getCodexEntryById(entryId);
  }

  async function getSpellEntriesForSpellListClass(
    spellListClass: Parameters<typeof getSyncSpellEntriesForSpellListClass>[0]
  ): Promise<SpellEntry[]> {
    return getSyncSpellEntriesForSpellListClass(spellListClass);
  }

  async function getSpellEntriesForSpellListClasses(
    spellListClasses: Parameters<typeof getSyncSpellEntriesForSpellListClasses>[0]
  ): Promise<SpellEntry[]> {
    return getSyncSpellEntriesForSpellListClasses(spellListClasses);
  }

  async function getSpellEntriesForClassName(className: string): Promise<SpellEntry[]> {
    return getSyncSpellEntriesForClassName(className);
  }

  return {
    getAllEntries,
    getEntryById,
    getEntriesByCategory,
    getSpellEntriesForSpellListClass,
    getSpellEntriesForSpellListClasses,
    getSpellEntriesForClassName
  };
}

export const codexRepository = createCodexRepository();

export type { CodexRepository } from "./types";
