import type { SubclassEntry } from "../entries/types";

export const subclassEntries: SubclassEntry[] = [];

const subclassEntriesById = new Map(subclassEntries.map((entry) => [entry.id, entry] as const));

export function getSubclassEntryById(subclassId: string): SubclassEntry | undefined {
  return subclassEntriesById.get(subclassId);
}

export function getSubclassEntriesForClass(className: string): SubclassEntry[] {
  return subclassEntries
    .filter((entry) => entry.className === className)
    .sort((left, right) => left.name.localeCompare(right.name));
}
