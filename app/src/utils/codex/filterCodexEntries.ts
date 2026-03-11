import { ENTRY_CATEGORY_VALUES, type CodexCategory, type CodexEntry } from "../../codex/entries";

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
  category: CodexFilterCategory
): CodexEntry[] {
  const normalizedQuery = query.trim().toLowerCase();

  return entries.filter((entry) => {
    const matchesCategory = entry.category === category;
    const rarityValues = "rarity" in entry ? [entry.rarity] : [];
    const matchesQuery =
      normalizedQuery.length === 0 ||
      entry.name.toLowerCase().includes(normalizedQuery) ||
      entry.tags.some((entryType) => enumToSearchText(entryType).includes(normalizedQuery)) ||
      rarityValues.some((rarity) => enumToSearchText(rarity).includes(normalizedQuery));

    return matchesCategory && matchesQuery;
  });
}
