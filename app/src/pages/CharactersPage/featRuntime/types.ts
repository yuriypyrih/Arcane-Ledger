import type { FEATS, SpellEntry } from "../../../codex/entries";
import type { Character, CharacterFeatEntry, CharacterStatusEntry } from "../../../types";
import type { FeatureAbilityScoreBonus, FeatureActionCard } from "../classFeatures/types";

export type FeatRuntimeCharacter = Pick<Character, "level"> & {
  feats?: unknown;
};

export type FeatDerivedState = {
  normalizedFeats: CharacterFeatEntry[];
  featsByFeat: Map<FEATS, CharacterFeatEntry[]>;
  featSet: Set<FEATS>;
  grantedCantripEntries: SpellEntry[];
  abilityScoreBonuses: FeatureAbilityScoreBonus[];
  derivedStatusEntries: CharacterStatusEntry[];
  actions: FeatureActionCard[];
  hasCrafterDiscount: boolean;
  hasDefenseFightingStyle: boolean;
  hasHealer: boolean;
  hasLucky: boolean;
  luckyPointsRemaining: number;
  luckyPointsTotal: number;
};
