import type { RollMode } from "../../types";
import type { FeatureIndicator } from "./classFeatures/types";

export type RollStateTone = "advantage" | "disadvantage" | "neutralized";

export type ResolvedRollState = {
  tone: RollStateTone;
  label: string;
  sources: string[];
  advantageSources: string[];
  disadvantageSources: string[];
};

const defaultLabels: Record<RollStateTone, string> = {
  advantage: "Advantage",
  disadvantage: "Disadvantage",
  neutralized: "Neutralized"
};

function normalizeSourceLabel(source: string): string | null {
  const normalizedSource = source.trim();
  return normalizedSource.length > 0 ? normalizedSource : null;
}

function dedupeSources(sources: string[]): string[] {
  return [...new Set(sources)];
}

export function getRollStateDefaultLabel(tone: RollStateTone): string {
  return defaultLabels[tone];
}

export function getFeatureIndicatorSources(indicator: FeatureIndicator): string[] {
  const sources = Array.isArray(indicator.source) ? indicator.source : [indicator.source];

  return dedupeSources(
    sources
      .map((source) => (typeof source === "string" ? normalizeSourceLabel(source) : null))
      .filter((source): source is string => source !== null)
  );
}

export function resolveFeatureIndicators(
  indicators: FeatureIndicator[] | null | undefined
): ResolvedRollState | null {
  if (!indicators || indicators.length === 0) {
    return null;
  }

  const advantageSources = dedupeSources(
    indicators.flatMap((indicator) =>
      indicator.tone === "advantage" ? getFeatureIndicatorSources(indicator) : []
    )
  );
  const disadvantageSources = dedupeSources(
    indicators.flatMap((indicator) =>
      indicator.tone === "disadvantage" ? getFeatureIndicatorSources(indicator) : []
    )
  );
  const hasAdvantage = advantageSources.length > 0;
  const hasDisadvantage = disadvantageSources.length > 0;

  if (!hasAdvantage && !hasDisadvantage) {
    return null;
  }

  const tone: RollStateTone =
    hasAdvantage && hasDisadvantage ? "neutralized" : hasAdvantage ? "advantage" : "disadvantage";
  const sources =
    tone === "neutralized"
      ? dedupeSources([...advantageSources, ...disadvantageSources])
      : tone === "advantage"
        ? advantageSources
        : disadvantageSources;

  return {
    tone,
    label: defaultLabels[tone],
    sources,
    advantageSources,
    disadvantageSources
  };
}

export function areResolvedRollStatesEquivalent(
  left: ResolvedRollState | null,
  right: ResolvedRollState | null
): boolean {
  if (left === null || right === null) {
    return left === right;
  }

  return left.tone === right.tone;
}

export function getRollModeFromResolvedRollState(
  rollState: ResolvedRollState | null | undefined
): RollMode {
  if (!rollState || rollState.tone === "neutralized") {
    return "normal";
  }

  return rollState.tone;
}

export function getRollModeFromIndicators(
  indicators: FeatureIndicator[] | null | undefined
): RollMode {
  return getRollModeFromResolvedRollState(resolveFeatureIndicators(indicators));
}

export function formatResolvedRollStateDetailText(
  rollState: ResolvedRollState
): string | undefined {
  if (rollState.tone === "neutralized") {
    const segments: string[] = [];

    if (rollState.advantageSources.length > 0) {
      segments.push(`Adv. from ${rollState.advantageSources.join(", ")}`);
    }

    if (rollState.disadvantageSources.length > 0) {
      segments.push(`Disadv. from ${rollState.disadvantageSources.join(", ")}`);
    }

    return segments.length > 0 ? segments.join(" | ") : undefined;
  }

  return rollState.sources.length > 0 ? `From ${rollState.sources.join(", ")}` : undefined;
}

export function formatResolvedRollStateSummary(rollState: ResolvedRollState): string {
  const detailText = formatResolvedRollStateDetailText(rollState);

  return detailText ? `${rollState.label} (${detailText})` : rollState.label;
}
