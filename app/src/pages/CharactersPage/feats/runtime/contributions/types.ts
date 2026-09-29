import type { SpellDescriptionEntry, SpellEntry } from "../../../../../codex/entries";
import type { FEATS } from "../../../../../codex/entries/enums";
import type { CharacterFeatEntry } from "../../../../../types";
import type { FeatureContributionSpec } from "../../../featureContributions/types";
import type { FeatDerivedState } from "../types";

export type FeatContributionContext = {
  entry: CharacterFeatEntry;
  index: number;
  level: number;
  contribution: FeatureContributionSpec<FeatDerivedState>;
  featCantripEntries: SpellEntry[];
  getFeatDescription: (feat: FEATS) => SpellDescriptionEntry[];
};
export type FeatContributionBuilder = (context: FeatContributionContext) => boolean;
export type FeatContributionBuilders = Partial<Record<FEATS, FeatContributionBuilder>>;
