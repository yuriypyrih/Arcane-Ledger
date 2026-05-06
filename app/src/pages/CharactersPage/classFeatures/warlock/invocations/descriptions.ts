import {
  ELDRITCH_INVOCATION,
  getEldritchInvocationEntryById,
  type SpellDescriptionEntry
} from "../../../../../codex/entries";
import { createSourcedDescriptionEntries } from "../../../actionModalDescriptions";

type DescriptionAdditionCarrier = {
  descriptionAdditions?: SpellDescriptionEntry[][];
};

function hasDescriptionSource(
  descriptionAdditions: SpellDescriptionEntry[][] | undefined,
  sourceName: string
): boolean {
  return (descriptionAdditions ?? []).some((section) =>
    section.some((entry) => typeof entry === "string" && entry.includes(sourceName))
  );
}

export function getInvocationDescriptionText(
  description: readonly SpellDescriptionEntry[]
): string {
  return description
    .map((entry) => (typeof entry === "string" ? entry : entry.items.join("\n")))
    .join("\n");
}

export function getInvocationDescriptionEntries(
  invocationId: ELDRITCH_INVOCATION,
  fallbackDescription: SpellDescriptionEntry[]
): SpellDescriptionEntry[] {
  return getEldritchInvocationEntryById(invocationId)?.description ?? fallbackDescription;
}

export function getInvocationSourceName(
  invocationId: ELDRITCH_INVOCATION,
  fallbackSourceName: string
): string {
  return getEldritchInvocationEntryById(invocationId)?.name ?? fallbackSourceName;
}

export function createInvocationSourcedDescriptionEntries(
  invocationId: ELDRITCH_INVOCATION,
  fallbackSourceName: string,
  fallbackDescription: SpellDescriptionEntry[]
): SpellDescriptionEntry[] {
  const description = getInvocationDescriptionEntries(invocationId, fallbackDescription);

  return description.length > 0
    ? createSourcedDescriptionEntries(
        getInvocationSourceName(invocationId, fallbackSourceName),
        description
      )
    : [];
}

export function appendInvocationSourcedDescriptionAddition<T extends DescriptionAdditionCarrier>(
  value: T,
  invocationId: ELDRITCH_INVOCATION,
  fallbackSourceName: string,
  fallbackDescription: SpellDescriptionEntry[]
): T {
  const sourceName = getInvocationSourceName(invocationId, fallbackSourceName);

  if (hasDescriptionSource(value.descriptionAdditions, sourceName)) {
    return value;
  }

  const descriptionEntries = createSourcedDescriptionEntries(
    sourceName,
    getInvocationDescriptionEntries(invocationId, fallbackDescription)
  );

  if (descriptionEntries.length === 0) {
    return value;
  }

  return {
    ...value,
    descriptionAdditions: [...(value.descriptionAdditions ?? []), descriptionEntries]
  };
}
