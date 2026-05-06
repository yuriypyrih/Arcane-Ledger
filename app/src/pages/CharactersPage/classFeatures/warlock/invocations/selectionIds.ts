import { ELDRITCH_INVOCATION, getEldritchInvocationEntryById } from "../../../../../codex/entries";

export const invocationSelectionSeparator = "::";
export const placeholderSelectionSuffix = "placeholder";

export type WarlockInvocationSelectionParseResult = {
  invocationId: ELDRITCH_INVOCATION | null;
  choiceValue: string | null;
};

export function createWarlockInvocationSelectionId(
  invocationId: ELDRITCH_INVOCATION,
  choiceValue?: string
): string {
  return choiceValue
    ? `${invocationId}${invocationSelectionSeparator}${choiceValue}`
    : invocationId;
}

export function parseWarlockInvocationSelectionId(
  selectionId: string
): WarlockInvocationSelectionParseResult {
  const separatorIndex = selectionId.indexOf(invocationSelectionSeparator);
  const rawInvocationId = separatorIndex >= 0 ? selectionId.slice(0, separatorIndex) : selectionId;
  const choiceValue =
    separatorIndex >= 0
      ? selectionId.slice(separatorIndex + invocationSelectionSeparator.length)
      : null;

  if (!rawInvocationId || !getEldritchInvocationEntryById(rawInvocationId)) {
    return {
      invocationId: null,
      choiceValue: null
    };
  }

  return {
    invocationId: rawInvocationId as ELDRITCH_INVOCATION,
    choiceValue
  };
}

export function getSelectedInvocationIdSetFromSelectionIds(
  selectionIds: string[]
): Set<ELDRITCH_INVOCATION> {
  return new Set(
    selectionIds
      .map((selectionId) => parseWarlockInvocationSelectionId(selectionId).invocationId)
      .filter((invocationId): invocationId is ELDRITCH_INVOCATION => invocationId !== null)
  );
}

export function getSelectedInvocationBaseCounts(
  selectionIds: string[]
): Map<ELDRITCH_INVOCATION, number> {
  return selectionIds.reduce((counts, selectionId) => {
    const { invocationId } = parseWarlockInvocationSelectionId(selectionId);

    if (!invocationId) {
      return counts;
    }

    counts.set(invocationId, (counts.get(invocationId) ?? 0) + 1);
    return counts;
  }, new Map<ELDRITCH_INVOCATION, number>());
}
