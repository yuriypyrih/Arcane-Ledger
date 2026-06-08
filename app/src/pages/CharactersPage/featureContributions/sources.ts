import type {
  FeatureContributionSource,
  FeatureContributionSourceType,
  FeatureContributionSpec
} from "./types";

const defaultSourceOrder: Record<FeatureContributionSourceType, number> = {
  class: 1000,
  subclass: 2000,
  species: 3000,
  feat: 4000,
  invocation: 4500,
  item: 5000,
  spell: 6000
};

type FeatureContributionSourceInput = {
  id: string;
  label: string;
  entryId?: string;
  order?: number;
};

function normalizeSourceId(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getFeatureContributionSourceOrder(
  source: FeatureContributionSource
): number {
  return source.order ?? defaultSourceOrder[source.type];
}

export function sortFeatureContributionsBySourceOrder<TDerivedState>(
  contributions: FeatureContributionSpec<TDerivedState>[]
): FeatureContributionSpec<TDerivedState>[] {
  return contributions
    .map((contribution, index) => ({ contribution, index }))
    .sort((left, right) => {
      const orderDifference =
        getFeatureContributionSourceOrder(left.contribution.source) -
        getFeatureContributionSourceOrder(right.contribution.source);

      return orderDifference === 0 ? left.index - right.index : orderDifference;
    })
    .map(({ contribution }) => contribution);
}

export function createClassContributionSource({
  id,
  label,
  entryId,
  order
}: FeatureContributionSourceInput): FeatureContributionSource {
  return {
    type: "class",
    id: `class-${normalizeSourceId(id)}`,
    label,
    entryId,
    order: order ?? defaultSourceOrder.class
  };
}

export function createSubclassContributionSource({
  id,
  label,
  entryId,
  order
}: FeatureContributionSourceInput): FeatureContributionSource {
  return {
    type: "subclass",
    id: `subclass-${normalizeSourceId(id)}`,
    label,
    entryId,
    order: order ?? defaultSourceOrder.subclass
  };
}
