import type { CLASS_FEATURE, SpellDescriptionEntry } from "../../codex/entries";
import {
  getFeatureDescriptionMetadataForCharacter,
  type FeatureDescriptionMetadata
} from "./classFeatures/featureDescriptions";

type DescriptionAdditionCarrier = {
  description?: SpellDescriptionEntry[];
  descriptionAdditions?: SpellDescriptionEntry[][];
};

type FeatureDescriptionCharacter = Parameters<typeof getFeatureDescriptionMetadataForCharacter>[0];
type OrderedDescriptionSection = {
  index: number;
  level: number | null;
  section: SpellDescriptionEntry[];
};

const sourcedFeatureLevelPattern = /<strong>Level\s+(\d+):/i;

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

function getDescriptionSectionSourceLevel(
  section: readonly SpellDescriptionEntry[]
): number | null {
  for (const entry of section) {
    const sourceText = typeof entry === "string" ? entry : entry.items.join(" ");
    const match = sourceText.match(sourcedFeatureLevelPattern);

    if (!match) {
      continue;
    }

    const level = Number(match[1]);

    return Number.isFinite(level) ? level : null;
  }

  return null;
}

export function orderDescriptionAdditionSections(
  sections: readonly (readonly SpellDescriptionEntry[])[]
): SpellDescriptionEntry[][] {
  const normalizedSections: OrderedDescriptionSection[] = sections
    .filter((section) => section.length > 0)
    .map((section, index) => ({
      index,
      level: getDescriptionSectionSourceLevel(section),
      section: section.map(cloneDescriptionEntry)
    }));
  const leveledSections = normalizedSections
    .filter((entry) => entry.level !== null)
    .sort((left, right) => (left.level ?? 0) - (right.level ?? 0) || left.index - right.index);
  const unlevelledSections = normalizedSections.filter((entry) => entry.level === null);

  return [...leveledSections, ...unlevelledSections].map((entry) => entry.section);
}

export function createSourcedDescriptionEntries(
  sourceName: string,
  descriptionEntries: readonly SpellDescriptionEntry[]
): SpellDescriptionEntry[] {
  const clonedEntries = descriptionEntries.map(cloneDescriptionEntry);
  const [firstEntry, ...remainingEntries] = clonedEntries;
  const marker = `<strong>${sourceName}.</strong>`;

  if (!firstEntry) {
    return [];
  }

  if (typeof firstEntry === "string") {
    return firstEntry.includes(marker)
      ? clonedEntries
      : [`${marker} ${firstEntry}`, ...remainingEntries];
  }

  return [marker, firstEntry, ...remainingEntries];
}

export function createFeatureSourceName(
  metadata: FeatureDescriptionMetadata | null,
  fallbackName?: string
): string {
  return metadata ? `Level ${metadata.level}: ${metadata.name}` : (fallbackName ?? "");
}

export function getFeatureSourceNameForCharacter(
  character: FeatureDescriptionCharacter,
  feature: CLASS_FEATURE,
  fallbackName?: string
): string {
  return createFeatureSourceName(
    getFeatureDescriptionMetadataForCharacter(character, feature),
    fallbackName
  );
}

export function createFeatureSourcedDescriptionEntries(
  character: FeatureDescriptionCharacter,
  feature: CLASS_FEATURE,
  descriptionEntries: readonly SpellDescriptionEntry[],
  fallbackName?: string
): SpellDescriptionEntry[] {
  const sourceName = getFeatureSourceNameForCharacter(character, feature, fallbackName);

  return sourceName ? createSourcedDescriptionEntries(sourceName, descriptionEntries) : [];
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
  descriptionEntries: readonly SpellDescriptionEntry[]
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

export function appendFeatureSourcedDescriptionAddition<T extends DescriptionAdditionCarrier>(
  value: T,
  character: FeatureDescriptionCharacter,
  feature: CLASS_FEATURE,
  descriptionEntries: readonly SpellDescriptionEntry[],
  fallbackName?: string
): T {
  const sourceName = createFeatureSourceName(
    getFeatureDescriptionMetadataForCharacter(character, feature),
    fallbackName
  );
  const marker = sourceName ? `<strong>${sourceName}.</strong>` : "";

  if (!sourceName || descriptionValueSomeText(value, (entry) => entry.includes(marker))) {
    return value;
  }

  return appendDescriptionAddition(
    value,
    createSourcedDescriptionEntries(sourceName, descriptionEntries)
  );
}
