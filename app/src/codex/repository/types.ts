import type { SPELL_LIST_CLASS } from "../entries";
import type { CodexCategory, CodexEntry, SpellEntry } from "../entries";

export type CodexRepository = {
  getAllEntries: () => Promise<CodexEntry[]>;
  getEntryById: (entryId: string) => Promise<CodexEntry | null>;
  getEntriesByCategory: (category: CodexCategory) => Promise<CodexEntry[]>;
  getSpellEntriesForSpellListClass: (spellListClass: SPELL_LIST_CLASS) => Promise<SpellEntry[]>;
  getSpellEntriesForSpellListClasses: (
    spellListClasses: SPELL_LIST_CLASS[]
  ) => Promise<SpellEntry[]>;
  getSpellEntriesForClassName: (className: string) => Promise<SpellEntry[]>;
};
