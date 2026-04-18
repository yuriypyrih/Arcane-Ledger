import type { SpellDescriptionEntry } from "../../../codex/entries";

type FeatureActionDescriptionSource = {
  summary: string;
  detail: string;
};

export function createDefaultFeatureActionDescription(
  source: FeatureActionDescriptionSource
): SpellDescriptionEntry[] {
  const description: SpellDescriptionEntry[] = [];
  const normalizedDetail = source.detail.trim();
  const normalizedSummary = source.summary.trim();

  if (normalizedDetail) {
    description.push(normalizedDetail);
  }

  if (normalizedSummary && normalizedSummary !== normalizedDetail) {
    description.push(`<strong>${normalizedSummary}</strong>`);
  }

  return description;
}
