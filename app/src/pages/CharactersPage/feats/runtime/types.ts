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
  SpellSourceMap,
  FeatureSpeedBonus
} from "../../classFeatures/types";

export type FeatRuntimeCharacter = Pick<Character, "level"> &
  Partial<
    Pick<
      Character,
      | "abilities"
      | "background"
      | "backgroundChoices"
      | "classFeatureState"
      | "className"
      | "hitDiceRemaining"
      | "statusEntries"
    >
  > & {
    feats?: unknown;
  };

export type FeatDerivedState = {
  normalizedFeats: CharacterFeatEntry[];
  featsByFeat: Map<FEATS, CharacterFeatEntry[]>;
  featSet: Set<FEATS>;
  grantedCantripEntries: SpellEntry[];
  alwaysPreparedCantripEntries: SpellEntry[];
  alwaysPreparedSpellEntries: SpellEntry[];
  alwaysPreparedSpellSourceMap: SpellSourceMap;
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
  shadowTouchedFreeCastEntries: Array<{
    featEntryId: string;
    spellId: string;
    expended: boolean;
  }>;
  telepathicDetectThoughtsFreeCastEntries: Array<{
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
  hasBoonOfFate: boolean;
  hasBoonOfRecovery: boolean;
  hasBoonOfSpellRecall: boolean;
  hasLucky: boolean;
  hasMageSlayer: boolean;
  hasMagicInitiate: boolean;
  hasRitualCaster: boolean;
  hasShadowTouched: boolean;
  hasTelepathic: boolean;
  luckyPointsRemaining: number;
  luckyPointsTotal: number;
  boonOfFateImproveFateRemaining: number;
  boonOfFateImproveFateTotal: number;
  boonOfRecoveryDiceRemaining: number;
  boonOfRecoveryDiceTotal: number;
  mageSlayerGuardedMindRemaining: number;
  mageSlayerGuardedMindTotal: number;
  ritualCasterQuickRitualRemaining: number;
  ritualCasterQuickRitualTotal: number;
  telepathicDetectThoughtsRemaining: number;
  telepathicDetectThoughtsTotal: number;
};
