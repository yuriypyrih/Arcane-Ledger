import type { CodexEntry } from "../../types";

export function getCodexCategories(entries: CodexEntry[]): string[] {
  return ["All", ...new Set(entries.map((entry) => entry.category))];
}

export function filterCodexEntries(
  entries: CodexEntry[],
  query: string,
  category: string
): CodexEntry[] {
  const normalizedQuery = query.trim().toLowerCase();

  return entries.filter((entry) => {
    const matchesCategory = category === "All" || entry.category === category;
    const matchesQuery =
      normalizedQuery.length === 0 ||
      entry.name.toLowerCase().includes(normalizedQuery) ||
      entry.tag.toLowerCase().includes(normalizedQuery) ||
      entry.summary.toLowerCase().includes(normalizedQuery);

    return matchesCategory && matchesQuery;
  });
}
