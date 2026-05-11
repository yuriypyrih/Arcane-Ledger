import {
  ACTION_TYPE,
  DURATION,
  ENTRY_CATEGORIES,
  type CodexCategory,
  type CodexEntry,
  type MAGIC_SCHOOL,
  type SPELL_LIST_CLASS
} from "../../codex/entries";

export const CODEX_FEATS_CATEGORY = "FEATS" as const;

export type CodexFilterCategory = CodexCategory | typeof CODEX_FEATS_CATEGORY;
export const CODEX_SPELL_SPECIAL_FILTERS = [
  "ritual",
  "action",
  "bonus-action",
  "reaction",
  "concentration",
  "healing",
  "damage"
] as const;
export type CodexSpellSpecialFilter = (typeof CODEX_SPELL_SPECIAL_FILTERS)[number];

const LIBRARY_FILTER_CATEGORIES: CodexFilterCategory[] = [
  ENTRY_CATEGORIES.CLASSES,
  ENTRY_CATEGORIES.SPECIES,
  ENTRY_CATEGORIES.BACKGROUNDS,
  CODEX_FEATS_CATEGORY,
  ENTRY_CATEGORIES.ITEMS,
  ENTRY_CATEGORIES.MONSTERS,
  ENTRY_CATEGORIES.SPELLS
];

export function getCodexCategories(): CodexFilterCategory[] {
  return [...LIBRARY_FILTER_CATEGORIES];
}

export function getCodexSpellSpecialFilterLabel(filter: CodexSpellSpecialFilter): string {
  switch (filter) {
    case "ritual":
      return "Ritual";
    case "action":
      return "Action";
    case "bonus-action":
      return "Bonus action";
    case "reaction":
      return "Reaction";
    case "concentration":
      return "Concentration";
    case "healing":
      return "Healing";
    case "damage":
      return "Damage";
  }
}

function matchesCodexSpellSpecialFilter(
  entry: CodexEntry,
  filter: CodexSpellSpecialFilter | null
): boolean {
  if (entry.category !== ENTRY_CATEGORIES.SPELLS || filter === null) {
    return true;
  }

  switch (filter) {
    case "ritual":
      return entry.ritual === true;
    case "action":
      return entry.castingTime.includes(ACTION_TYPE.ACTION);
    case "bonus-action":
      return entry.castingTime.includes(ACTION_TYPE.BONUS_ACTION);
    case "reaction":
      return entry.castingTime.includes(ACTION_TYPE.REACTION);
    case "concentration":
      return entry.duration.includes(DURATION.CONCENTRATION);
    case "healing":
      return entry.isHealingSpell === true;
    case "damage":
      return entry.isDamagingSpell === true;
  }
}

export function filterCodexEntries(
  entries: CodexEntry[],
  query: string,
  category: CodexFilterCategory,
  spellLevelFilter: number | null = null,
  spellClassFilter: SPELL_LIST_CLASS | null = null,
  spellSchoolFilter: MAGIC_SCHOOL | null = null,
  spellSpecialFilter: CodexSpellSpecialFilter | null = null
): CodexEntry[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (category === CODEX_FEATS_CATEGORY) {
    return [];
  }

  return entries.filter((entry) => {
    const matchesCategory = entry.category === category;
    const matchesSpellLevel =
      entry.category !== ENTRY_CATEGORIES.SPELLS ||
      spellLevelFilter === null ||
      entry.spellLevel === spellLevelFilter;
    const matchesSpellClass =
      entry.category !== ENTRY_CATEGORIES.SPELLS ||
      spellClassFilter === null ||
      entry.spellLists.includes(spellClassFilter);
    const matchesSpellSchool =
      entry.category !== ENTRY_CATEGORIES.SPELLS ||
      spellSchoolFilter === null ||
      entry.magicSchool === spellSchoolFilter;
    const matchesSpellSpecial = matchesCodexSpellSpecialFilter(entry, spellSpecialFilter);
    const matchesQuery =
      normalizedQuery.length === 0 || entry.name.toLowerCase().includes(normalizedQuery);

    return (
      matchesCategory &&
      matchesSpellLevel &&
      matchesSpellClass &&
      matchesSpellSchool &&
      matchesSpellSpecial &&
      matchesQuery
    );
  });
}
