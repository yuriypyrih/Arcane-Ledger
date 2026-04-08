import type { SpellDescriptionEntry } from "../../codex/entries";

type DescriptionAdditionCarrier = {
  description?: SpellDescriptionEntry[];
  descriptionAdditions?: SpellDescriptionEntry[][];
};

function cloneDescriptionEntry(entry: SpellDescriptionEntry): SpellDescriptionEntry {
  return typeof entry === "string"
    ? entry
    : {
        ...entry,
        items: [...entry.items]
      };
}

function descriptionEntryEquals(
  left: SpellDescriptionEntry,
  right: SpellDescriptionEntry
): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function someDescriptionText(
  description: readonly SpellDescriptionEntry[],
  predicate: (entry: string) => boolean
): boolean {
  return description.some((entry) =>
    typeof entry === "string" ? predicate(entry) : entry.items.some((item) => predicate(item))
  );
}

function descriptionHasEntry(
  description: readonly SpellDescriptionEntry[],
  target: SpellDescriptionEntry
): boolean {
  return description.some((entry) => descriptionEntryEquals(entry, target));
}

export function createSourcedDescriptionEntries(
  sourceName: string,
  descriptionEntries: readonly string[]
): SpellDescriptionEntry[] {
  const [firstEntry, ...remainingEntries] = descriptionEntries;

  if (!firstEntry) {
    return [];
  }

  return [`<strong>${sourceName}.</strong> ${firstEntry}`, ...remainingEntries];
}

export function descriptionValueSomeText(
  value: Pick<DescriptionAdditionCarrier, "description" | "descriptionAdditions">,
  predicate: (entry: string) => boolean
): boolean {
  return (
    someDescriptionText(value.description ?? [], predicate) ||
    (value.descriptionAdditions ?? []).some((section) => someDescriptionText(section, predicate))
  );
}

export function appendDescriptionAddition<T extends DescriptionAdditionCarrier>(
  value: T,
  entries: readonly SpellDescriptionEntry[]
): T {
  const nextSection = entries.map(cloneDescriptionEntry);

  if (nextSection.length === 0) {
    return value;
  }

  const existingSections = value.descriptionAdditions ?? [];
  const hasMatchingSection = existingSections.some(
    (section) =>
      section.length === nextSection.length &&
      section.every((entry, index) => descriptionEntryEquals(entry, nextSection[index]!))
  );

  if (hasMatchingSection) {
    return value;
  }

  return {
    ...value,
    descriptionAdditions: [...existingSections, nextSection]
  };
}

export function appendUniqueDescriptionAddition<T extends DescriptionAdditionCarrier>(
  value: T,
  entries: readonly SpellDescriptionEntry[]
): T {
  const missingEntries = entries.filter(
    (entry) =>
      !descriptionHasEntry(value.description ?? [], entry) &&
      !(value.descriptionAdditions ?? []).some((section) => descriptionHasEntry(section, entry))
  );

  return appendDescriptionAddition(value, missingEntries);
}

export function appendSourcedDescriptionAddition<T extends DescriptionAdditionCarrier>(
  value: T,
  sourceName: string,
  descriptionEntries: readonly string[]
): T {
  const marker = `<strong>${sourceName}.</strong>`;

  if (descriptionValueSomeText(value, (entry) => entry.includes(marker))) {
    return value;
  }

  return appendDescriptionAddition(
    value,
    createSourcedDescriptionEntries(sourceName, descriptionEntries)
  );
}
