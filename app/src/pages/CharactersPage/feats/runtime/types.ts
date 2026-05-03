import type { FEATS, ReactionEntry, SpellEntry } from "../../../../codex/entries";
import type {
  AbilityKey,
  Character,
  CharacterFeatEntry,
  CharacterStatusEntry
} from "../../../../types";
import type {
  FeatureAbilityScoreBonus,
  FeatureActionCard,
  FeatureSpeedBonus
} from "../../classFeatures/types";

export type FeatRuntimeCharacter = Pick<Character, "level"> &
  Partial<Pick<Character, "className" | "hitDiceRemaining">> & {
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
  feyTouchedFreeCastEntries: Array<{
    featEntryId: string;
    spellId: string;
    expended: boolean;
  }>;
  abilityScoreBonuses: FeatureAbilityScoreBonus[];
  speedBonuses: FeatureSpeedBonus[];
  hitPointMaximumBonus: number;
  derivedStatusEntries: CharacterStatusEntry[];
  actions: FeatureActionCard[];
  reactionEntries: ReactionEntry[];
  hasCrafterDiscount: boolean;
  hasDefenseFightingStyle: boolean;
  hasHealer: boolean;
  hasFeyTouched: boolean;
  hasLucky: boolean;
  hasMageSlayer: boolean;
  hasMagicInitiate: boolean;
  luckyPointsRemaining: number;
  luckyPointsTotal: number;
  mageSlayerGuardedMindRemaining: number;
  mageSlayerGuardedMindTotal: number;
};
