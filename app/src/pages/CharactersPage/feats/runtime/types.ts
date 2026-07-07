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
import type {
  FeatureContributionActionFactory,
  FeatureCommonActionTransform,
  FeatureDescriptionContribution,
  FeatureContributionResource,
  FeatureContributionSpec,
  FeatureFreeCastEntry,
  FeatureItemDescriptionTransform,
  FeatureSpellActionPathContribution,
  FeatureSpellCastEffectContribution,
  FeatureSpellcastingAbilityEntry,
  FeatureSpellTransform,
  FeatureWeaponActionTransform
} from "../../featureContributions";

export type FeatRuntimeCharacter = Pick<Character, "level"> &
  Partial<
    Pick<
      Character,
      | "abilities"
      | "background"
      | "backgroundChoices"
      | "classFeatureState"
      | "className"
      | "classRules"
      | "customClass"
      | "heroicInspiration"
      | "hitDiceRemaining"
      | "languageProficiencies"
      | "statusEntries"
    >
  > & {
    feats?: unknown;
  };

export type FeatDerivedState = {
  contributions: FeatureContributionSpec<FeatDerivedState>[];
  resources: FeatureContributionResource[];
  normalizedFeats: CharacterFeatEntry[];
  featsByFeat: Map<FEATS, CharacterFeatEntry[]>;
  featSet: Set<FEATS>;
  grantedCantripEntries: SpellEntry[];
  alwaysPreparedCantripEntries: SpellEntry[];
  alwaysPreparedSpellEntries: SpellEntry[];
  alwaysPreparedSpellSourceMap: SpellSourceMap;
  spellcastingAbilityEntries: FeatureSpellcastingAbilityEntry[];
  spellcastingAbilityBySpellId: Map<string, AbilityKey>;
  freeCastEntries: FeatureFreeCastEntry[];
  descriptionAdditions: FeatureDescriptionContribution[];
  magicInitiateSpellcastingAbilityBySpellId: Map<string, AbilityKey>;
  spellfireSparkSpellcastingAbilityBySpellId: Map<string, AbilityKey>;
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
  boonOfRevelryIrresistibleDanceFreeCastEntries: Array<{
    featEntryId: string;
    spellId: string;
    expended: boolean;
  }>;
  abilityScoreBonuses: FeatureAbilityScoreBonus[];
  speedBonuses: FeatureSpeedBonus[];
  hitPointMaximumBonus: number;
  derivedStatusEntries: CharacterStatusEntry[];
  actions: FeatureActionCard[];
  actionFactories: FeatureContributionActionFactory<FeatDerivedState>[];
  reactionEntries: ReactionEntry[];
  spellTransforms: FeatureSpellTransform[];
  commonActionTransforms: FeatureCommonActionTransform[];
  weaponActionTransforms: FeatureWeaponActionTransform[];
  itemDescriptionTransforms: FeatureItemDescriptionTransform[];
  spellActionPaths: FeatureSpellActionPathContribution[];
  spellCastEffects: FeatureSpellCastEffectContribution[];
  hasCrafterDiscount: boolean;
  hasCultOfDragonInitiate: boolean;
  hasDefenseFightingStyle: boolean;
  hasFairyTrickster: boolean;
  hasHealer: boolean;
  hasFeyTouched: boolean;
  hasBoonOfFate: boolean;
  hasBoonOfFluidForms: boolean;
  hasBoonOfRecovery: boolean;
  hasBoonOfSoulDrinker: boolean;
  hasBoonOfSpellRecall: boolean;
  hasBoonOfTerror: boolean;
  hasLucky: boolean;
  hasMageSlayer: boolean;
  hasMagicInitiate: boolean;
  hasPurpleDragonRook: boolean;
  hasRitualCaster: boolean;
  hasShadowTouched: boolean;
  hasSpellfireSpark: boolean;
  hasTelepathic: boolean;
  luckyPointsRemaining: number;
  luckyPointsTotal: number;
  cultOfDragonInitiateInspiredByFearRemaining: number;
  cultOfDragonInitiateInspiredByFearTotal: number;
  purpleDragonRookRallyingCryRemaining: number;
  purpleDragonRookRallyingCryTotal: number;
  spellfireSparkSpellfireFlameRemaining: number;
  spellfireSparkSpellfireFlameTotal: number;
  fairyTricksterFlusteringStrikeRemaining: number;
  fairyTricksterFlusteringStrikeTotal: number;
  boonOfFateImproveFateRemaining: number;
  boonOfFateImproveFateTotal: number;
  boonOfFluidFormsShapechangerRemaining: number;
  boonOfFluidFormsShapechangerTotal: number;
  boonOfRecoveryDiceRemaining: number;
  boonOfRecoveryDiceTotal: number;
  boonOfRecoveryLastStandRemaining: number;
  boonOfRecoveryLastStandTotal: number;
  boonOfSoulDrinkerSiphonLifeRemaining: number;
  boonOfSoulDrinkerSiphonLifeTotal: number;
  boonOfTerrorFleeFoolsRemaining: number;
  boonOfTerrorFleeFoolsTotal: number;
  mageSlayerGuardedMindRemaining: number;
  mageSlayerGuardedMindTotal: number;
  ritualCasterQuickRitualRemaining: number;
  ritualCasterQuickRitualTotal: number;
  telepathicDetectThoughtsRemaining: number;
  telepathicDetectThoughtsTotal: number;
};
