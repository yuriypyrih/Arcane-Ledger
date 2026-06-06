import type { ReactionEntry, SpellDescriptionEntry, SpellEntry } from "../../../codex/entries";
import type { AbilityKey, Character, CharacterStatusEntry } from "../../../types";
import type { EconomyType } from "../actionEconomy";
import type { RoundTrackerResource } from "../combat";
import type {
  FeatureAbilityScoreBonus,
  FeatureActionCard,
  FeatureActionCardUsage,
  FeatureArmorProficiencyEntry,
  FeatureSpeedBonus,
  FeatureLanguageProficiencyEntry,
  FeatureSavingThrowProficiencyEntry,
  FeatureSkillProficiencyEntry,
  FeatureToolProficiencyEntry,
  FeatureWeaponProficiencyEntry,
  SpellSourceMap
} from "../classFeatures/types";

export type FeatureContributionSourceType =
  | "class"
  | "subclass"
  | "feat"
  | "species"
  | "item"
  | "invocation";

export type FeatureContributionSource = {
  type: FeatureContributionSourceType;
  id: string;
  label: string;
  entryId?: string;
  order?: number;
};

export type FeatureContributionResourceRecovery = "shortRest" | "longRest" | "round" | "manual";

export type FeatureContributionResource = {
  id: string;
  label: string;
  remaining: number;
  total: number;
  recovery?: FeatureContributionResourceRecovery;
};

export type FeatureDescriptionContributionTarget =
  | "commonAction"
  | "weaponAction"
  | "spell"
  | "initiative"
  | "trait"
  | "skill"
  | "stat"
  | "item"
  | "rest"
  | "custom";

export type FeatureDescriptionContribution = {
  id: string;
  target: FeatureDescriptionContributionTarget;
  targetKey?: string;
  targetPredicateId?: string;
  sourceLabel?: string;
  descriptionEntries?: SpellDescriptionEntry[];
  getDescriptionAdditions?: (
    context: FeatureDescriptionContributionContext
  ) => SpellDescriptionEntry[][];
};

export type FeatureDescriptionContributionContext<TTarget = unknown> = {
  character?: Character;
  target?: TTarget;
  targetKey?: string;
};

export type FeatureSpellGrantKind =
  | "granted-cantrip"
  | "always-prepared-cantrip"
  | "always-prepared-spell";

export type FeatureSpellcastingAbilityEntry = {
  sourceId: string;
  entryId?: string;
  spellId: string;
  ability: AbilityKey;
};

export type FeatureFreeCastEntry = {
  id: string;
  sourceId?: string;
  entryId?: string;
  spellId: string;
  expended?: boolean;
  usesRemaining?: number;
  usesTotal?: number;
  recovery?: FeatureContributionResourceRecovery;
};

export type FeatureSpellGrant = {
  kind: FeatureSpellGrantKind;
  spell: SpellEntry;
  sourceLabel?: string;
  spellcastingAbility?: AbilityKey;
  spellcastingAbilitySourceId?: string;
  freeCast?: Omit<FeatureFreeCastEntry, "spellId"> & {
    spellId?: string;
  };
};

export type FeatureCommonActionTransform = {
  id: string;
  transform: <TAction extends Pick<FeatureActionCard, "key" | "descriptionAdditions">>(
    character: Character,
    action: TAction
  ) => TAction;
};

export type FeatureWeaponActionTransform<TAction = unknown> = {
  id: string;
  transform: (character: Character, action: TAction) => TAction;
};

export type FeatureItemDescriptionTransform<TItem = unknown> = {
  id: string;
  getDescriptionAdditions: (
    character: Character,
    item: TItem
  ) => SpellDescriptionEntry[][];
};

export type FeatureSpellTransform = {
  id: string;
  transform: (spell: SpellEntry) => SpellEntry;
};

export type FeatureSpellActionPathContext = {
  character: Character;
  spell: Pick<SpellEntry, "id" | "castingTime" | "spellLevel">;
};

export type FeatureSpellActionPathContribution = {
  id: string;
  spellId: string;
  economyType: EconomyType;
  actionLabel?: string;
  roundTrackerResource?: RoundTrackerResource | null;
  getDisabledReason?: (context: FeatureSpellActionPathContext) => string | null;
  getUsage?: (context: FeatureSpellActionPathContext) => FeatureActionCardUsage | undefined;
  spellCastEffectIds?: string[];
};

export type FeatureSpellCastEffectContext = {
  spell: Pick<SpellEntry, "id" | "spellLevel">;
};

export type FeatureSpellCastEffectContribution = {
  id: string;
  apply?: (character: Character, context: FeatureSpellCastEffectContext) => Character;
};

export type FeatureContributionActionFactory<TDerivedState = unknown> = (
  character: Character,
  derivedState: TDerivedState
) => FeatureActionCard[];

export type FeatureContributionSpec<TDerivedState = unknown> = {
  source: FeatureContributionSource;
  resources?: FeatureContributionResource[];
  actions?: FeatureActionCard[];
  actionFactories?: FeatureContributionActionFactory<TDerivedState>[];
  reactions?: ReactionEntry[];
  statuses?: CharacterStatusEntry[];
  descriptionAdditions?: FeatureDescriptionContribution[];
  abilityScoreBonuses?: FeatureAbilityScoreBonus[];
  speedBonuses?: FeatureSpeedBonus[];
  weaponProficiencyEntries?: FeatureWeaponProficiencyEntry[];
  skillProficiencyEntries?: FeatureSkillProficiencyEntry[];
  savingThrowProficiencyEntries?: FeatureSavingThrowProficiencyEntry[];
  armorProficiencyEntries?: FeatureArmorProficiencyEntry[];
  toolProficiencyEntries?: FeatureToolProficiencyEntry[];
  languageProficiencyEntries?: FeatureLanguageProficiencyEntry[];
  hitPointMaximumBonus?: number;
  spellGrants?: FeatureSpellGrant[];
  spellTransforms?: FeatureSpellTransform[];
  commonActionTransforms?: FeatureCommonActionTransform[];
  weaponActionTransforms?: FeatureWeaponActionTransform[];
  itemDescriptionTransforms?: FeatureItemDescriptionTransform[];
  spellActionPaths?: FeatureSpellActionPathContribution[];
  spellCastEffects?: FeatureSpellCastEffectContribution[];
};

export type CompiledFeatureContributionState<TDerivedState = unknown> = {
  contributions: FeatureContributionSpec<TDerivedState>[];
  resources: FeatureContributionResource[];
  actions: FeatureActionCard[];
  actionFactories: FeatureContributionActionFactory<TDerivedState>[];
  reactions: ReactionEntry[];
  statuses: CharacterStatusEntry[];
  descriptionAdditions: FeatureDescriptionContribution[];
  abilityScoreBonuses: FeatureAbilityScoreBonus[];
  speedBonuses: FeatureSpeedBonus[];
  weaponProficiencyEntries: FeatureWeaponProficiencyEntry[];
  skillProficiencyEntries: FeatureSkillProficiencyEntry[];
  savingThrowProficiencyEntries: FeatureSavingThrowProficiencyEntry[];
  armorProficiencyEntries: FeatureArmorProficiencyEntry[];
  toolProficiencyEntries: FeatureToolProficiencyEntry[];
  languageProficiencyEntries: FeatureLanguageProficiencyEntry[];
  hitPointMaximumBonus: number;
  grantedCantripEntries: SpellEntry[];
  alwaysPreparedCantripEntries: SpellEntry[];
  alwaysPreparedSpellEntries: SpellEntry[];
  alwaysPreparedSpellSourceMap: SpellSourceMap;
  spellcastingAbilityEntries: FeatureSpellcastingAbilityEntry[];
  spellcastingAbilityBySpellId: Map<string, AbilityKey>;
  freeCastEntries: FeatureFreeCastEntry[];
  spellTransforms: FeatureSpellTransform[];
  commonActionTransforms: FeatureCommonActionTransform[];
  weaponActionTransforms: FeatureWeaponActionTransform[];
  itemDescriptionTransforms: FeatureItemDescriptionTransform[];
  spellActionPaths: FeatureSpellActionPathContribution[];
  spellCastEffects: FeatureSpellCastEffectContribution[];
};
