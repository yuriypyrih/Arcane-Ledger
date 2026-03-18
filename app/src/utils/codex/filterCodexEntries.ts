import {
  ENTRY_CATEGORIES,
  ENTRY_CATEGORY_VALUES,
  SPELL_LIST_CLASS,
  type CodexCategory,
  type CodexEntry
} from "../../codex/entries";

export type CodexFilterCategory = CodexCategory;

export function getCodexCategories(): CodexFilterCategory[] {
  return ENTRY_CATEGORY_VALUES;
}

function enumToSearchText(value: string): string {
  return value.toLowerCase().replace(/_/g, " ");
}

export function filterCodexEntries(
  entries: CodexEntry[],
  query: string,
  category: CodexFilterCategory,
  spellLevelFilter: number | null = null,
  spellClassFilter: SPELL_LIST_CLASS | null = null
): CodexEntry[] {
  const normalizedQuery = query.trim().toLowerCase();

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
    const rarityValues = "rarity" in entry ? [entry.rarity] : [];
    const weaponSearchValues =
      entry.category === ENTRY_CATEGORIES.WEAPONS
        ? [
            entry.type.training,
            entry.type.combat,
            entry.mastery,
            ...entry.properties,
            ...entry.damage.map(([, damageType]) => damageType),
            ...(entry.range?.ammunition ? [entry.range.ammunition] : [])
          ]
        : [];
    const spellSearchValues =
      entry.category === ENTRY_CATEGORIES.SPELLS
        ? [entry.magicSchool, ...entry.components, ...entry.spellLists, ...entry.description]
        : [];
    const tagValues = "tags" in entry ? entry.tags : [];
    const matchesQuery =
      normalizedQuery.length === 0 ||
      entry.name.toLowerCase().includes(normalizedQuery) ||
      tagValues.some((entryType) => enumToSearchText(entryType).includes(normalizedQuery)) ||
      weaponSearchValues.some((value) => enumToSearchText(value).includes(normalizedQuery)) ||
      spellSearchValues.some((value) => enumToSearchText(value).includes(normalizedQuery)) ||
      rarityValues.some((rarity) => enumToSearchText(rarity).includes(normalizedQuery));

    return matchesCategory && matchesSpellLevel && matchesSpellClass && matchesQuery;
  });
}
