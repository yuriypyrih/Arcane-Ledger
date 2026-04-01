import type { SubclassEntry } from "../entries/types";
import { bardSubclassEntries } from "./bard";
import { barbarianSubclassEntries } from "./barbarian";

export const subclassEntries: SubclassEntry[] = [...barbarianSubclassEntries, ...bardSubclassEntries];

const subclassEntriesById = new Map(subclassEntries.map((entry) => [entry.id, entry] as const));

export function getSubclassEntryById(subclassId: string): SubclassEntry | undefined {
  return subclassEntriesById.get(subclassId);
}

export function getSubclassEntriesForClass(className: string): SubclassEntry[] {
  return subclassEntries
    .filter((entry) => entry.className === className)
    .sort((left, right) => left.name.localeCompare(right.name));
}
