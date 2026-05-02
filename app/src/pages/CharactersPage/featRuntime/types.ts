import type { FEATS, SpellEntry } from "../../../codex/entries";
import type { AbilityKey, Character, CharacterFeatEntry, CharacterStatusEntry } from "../../../types";
import type { FeatureAbilityScoreBonus, FeatureActionCard } from "../classFeatures/types";

export type FeatRuntimeCharacter = Pick<Character, "level"> & {
  feats?: unknown;
};

export type FeatDerivedState = {
  normalizedFeats: CharacterFeatEntry[];
  featsByFeat: Map<FEATS, CharacterFeatEntry[]>;
  featSet: Set<FEATS>;
  grantedCantripEntries: SpellEntry[];
  alwaysPreparedCantripEntries: SpellEntry[];
  alwaysPreparedSpellEntries: SpellEntry[];
  magicInitiateSpellcastingAbilityBySpellId: Map<string, AbilityKey>;
  magicInitiateFreeCastEntries: Array<{
    featEntryId: string;
    spellId: string;
    expended: boolean;
  }>;
  abilityScoreBonuses: FeatureAbilityScoreBonus[];
  hitPointMaximumBonus: number;
  derivedStatusEntries: CharacterStatusEntry[];
  actions: FeatureActionCard[];
  hasCrafterDiscount: boolean;
  hasDefenseFightingStyle: boolean;
  hasHealer: boolean;
  hasLucky: boolean;
  hasMagicInitiate: boolean;
  luckyPointsRemaining: number;
  luckyPointsTotal: number;
};
