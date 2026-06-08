import type { DICE, ReactionEntry, SpellDescriptionEntry, SpellEntry } from "../../../codex/entries";
import type {
  AbilityKey,
  Character,
  CharacterStatusEntry,
  PROF_LEVEL,
  SkillName,
  WEAPON_PROFICIENCY
} from "../../../types";
import type { EconomyType } from "../actionEconomy";
import type { RoundTrackerResource } from "../combat";
import type { WeaponAction } from "../gameplay";
import type {
  FeatureAbilityScoreBonus,
  FeatureActionCard,
  FeatureActionOptionCard,
  FeatureActionCardUsage,
  FeatureArmorClassBonus,
  FeatureArmorClassMode,
  FeatureArmorProficiencyEntry,
  FeatureEquipmentEntry,
  FeatureDamageBonus,
  FeatureIndicator,
  FeatureInitiativeBonus,
  FeatureSpeedBonus,
  FeatureSavingThrowBonus,
  FeatureSkillBonus,
  FeatureSpellcastingState,
  FeatureUnarmedStrikeConfig,
  ArmorClassFeatureContext,
  SpeedFeatureContext,
  WeaponFeatureContext,
  SavingThrowIndicatorMap,
  AbilityCheckIndicatorMap,
  CoreStatIndicatorMap,
  SkillIndicatorMap,
  MagicTemporaryHitPointsFeature,
  FeatureLanguageProficiencyEntry,
  FeatureSavingThrowProficiencyEntry,
  FeatureSkillProficiencyEntry,
  FeatureToolProficiencyEntry,
  FeatureWeaponProficiencyEntry,
  SpellFeatureContext,
  SpellSourceMap
} from "../classFeatures/types";
import type {
  SpellImplementationCastSource,
  SpellImplementationOptionValues
} from "../characterRuntime/spellImplementations/types";

export type FeatureContributionSourceType =
  | "class"
  | "subclass"
  | "feat"
  | "species"
  | "item"
  | "invocation"
  | "spell";

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

export type FeatureSpellDamageBonusContext = SpellFeatureContext & {
  character: Character;
};

export type FeatureSpellDamageBonusContribution = {
  id: string;
  getBonuses: (context: FeatureSpellDamageBonusContext) => FeatureDamageBonus[];
};

export type FeatureWeaponDamageBonusContribution = {
  id: string;
  getBonuses: (context: WeaponFeatureContext) => FeatureDamageBonus[];
};

export type FeatureInitiativeBonusContribution = {
  id: string;
  getBonuses: () => FeatureInitiativeBonus[];
};

export type FeatureSavingThrowBonusContribution = {
  id: string;
  getBonuses: (ability: AbilityKey) => FeatureSavingThrowBonus[];
};

export type FeatureSkillBonusContribution = {
  id: string;
  getBonuses: (skill: SkillName, proficiencyLevel: PROF_LEVEL) => FeatureSkillBonus[];
};

export type FeatureArmorClassModeContribution = {
  id: string;
  getModes: (context: ArmorClassFeatureContext) => FeatureArmorClassMode[];
};

export type FeatureArmorClassBonusContribution = {
  id: string;
  getBonuses: (context: ArmorClassFeatureContext) => FeatureArmorClassBonus[];
};

export type FeatureSpeedBonusContribution = {
  id: string;
  getBonuses: (context: SpeedFeatureContext) => FeatureSpeedBonus[];
};

export type FeatureSpellDamageFormulaOverrideContribution = {
  id: string;
  getOverride: (spell: Pick<SpellEntry, "id">) => string | null;
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
  spellImplementationCastSource?: SpellImplementationCastSource;
  forcedSpellImplementationOptions?: SpellImplementationOptionValues;
  spellCastEffectIds?: string[];
};

export type FeatureSpellCastEffectContext = {
  spell: Pick<SpellEntry, "id" | "spellLevel">;
  spellSlotLevel?: number | null;
  castSource?: SpellImplementationCastSource;
  options?: SpellImplementationOptionValues;
  spellActionPathId?: string | null;
  spellCastEffectIds?: readonly string[];
};

export type FeatureSpellCastEffectContribution = {
  id: string;
  apply?: (character: Character, context: FeatureSpellCastEffectContext) => Character;
};

export type FeatureActionTransform = {
  id: string;
  transform: (action: FeatureActionCard) => FeatureActionCard;
};

export type FeatureContributionActionFactory<TDerivedState = unknown> = (
  character: Character,
  derivedState: TDerivedState
) => FeatureActionCard[];

export type FeatureWeaponMasteryContribution = {
  selectionCount: number;
  options: WEAPON_PROFICIENCY[];
  selections: WEAPON_PROFICIENCY[];
  setSelections: (character: Character, selections: WEAPON_PROFICIENCY[]) => Character;
};

export type FeatureClassMechanicsContribution = {
  weaponMastery?: FeatureWeaponMasteryContribution;
  magicTemporaryHitPointsFeature?: MagicTemporaryHitPointsFeature | null;
  bardicInspirationDie?: DICE | null;
  monkMartialArtsDie?: DICE | null;
  rogueSneakAttackDiceCount?: number;
  rogueSneakAttackFormula?: string;
  monkUnarmedDamageTypeLabel?: string;
  getUnarmedStrikeConfig?: () => FeatureUnarmedStrikeConfig | null;
  canUseMonkMartialArts?: (context: {
    hasWornBodyArmor: boolean;
    hasShieldEquipped: boolean;
    wieldsOnlyMonkWeaponsOrUnarmed: boolean;
  }) => boolean;
};

export type FeatureContributionSpec<TDerivedState = unknown> = {
  source: FeatureContributionSource;
  resources?: FeatureContributionResource[];
  actions?: FeatureActionCard[];
  actionOptions?: Partial<Record<string, FeatureActionOptionCard[]>>;
  actionFactories?: FeatureContributionActionFactory<TDerivedState>[];
  reactions?: ReactionEntry[];
  statuses?: CharacterStatusEntry[];
  equipmentEntries?: FeatureEquipmentEntry[];
  weaponActions?: WeaponAction[];
  descriptionAdditions?: FeatureDescriptionContribution[];
  abilityScoreBonuses?: FeatureAbilityScoreBonus[];
  speedBonuses?: FeatureSpeedBonus[];
  speedBonusProviders?: FeatureSpeedBonusContribution[];
  weaponProficiencyEntries?: FeatureWeaponProficiencyEntry[];
  skillProficiencyEntries?: FeatureSkillProficiencyEntry[];
  savingThrowProficiencyEntries?: FeatureSavingThrowProficiencyEntry[];
  armorProficiencyEntries?: FeatureArmorProficiencyEntry[];
  toolProficiencyEntries?: FeatureToolProficiencyEntry[];
  languageProficiencyEntries?: FeatureLanguageProficiencyEntry[];
  hitPointMaximumBonus?: number;
  cantripLimitBonus?: number;
  cantripDamageBonus?: number;
  spellGrants?: FeatureSpellGrant[];
  spellcastingState?: FeatureSpellcastingState | null;
  alwaysPreparedSpellIds?: string[];
  alwaysPreparedSpellSources?: SpellSourceMap;
  alwaysSpellbookSpellIds?: string[];
  ritualOnlySpellIds?: string[];
  spellTransforms?: FeatureSpellTransform[];
  spellDamageBonuses?: FeatureSpellDamageBonusContribution[];
  spellDamageFormulaOverrides?: Record<string, string>;
  spellDamageFormulaOverrideProviders?: FeatureSpellDamageFormulaOverrideContribution[];
  weaponDamageBonuses?: FeatureWeaponDamageBonusContribution[];
  initiativeBonuses?: FeatureInitiativeBonusContribution[];
  savingThrowBonuses?: FeatureSavingThrowBonusContribution[];
  skillBonuses?: FeatureSkillBonusContribution[];
  armorClassModes?: FeatureArmorClassModeContribution[];
  armorClassBonuses?: FeatureArmorClassBonusContribution[];
  savingThrowIndicators?: SavingThrowIndicatorMap;
  abilityCheckIndicators?: AbilityCheckIndicatorMap;
  coreStatIndicators?: CoreStatIndicatorMap;
  skillIndicators?: SkillIndicatorMap;
  weaponAttackIndicators?: FeatureIndicator[];
  commonActionTransforms?: FeatureCommonActionTransform[];
  featureActionTransforms?: FeatureActionTransform[];
  weaponActionTransforms?: FeatureWeaponActionTransform[];
  itemDescriptionTransforms?: FeatureItemDescriptionTransform[];
  spellActionPaths?: FeatureSpellActionPathContribution[];
  spellCastEffects?: FeatureSpellCastEffectContribution[];
  classMechanics?: FeatureClassMechanicsContribution;
};

export type CompiledFeatureContributionState<TDerivedState = unknown> = {
  contributions: FeatureContributionSpec<TDerivedState>[];
  resources: FeatureContributionResource[];
  actions: FeatureActionCard[];
  actionOptions: Partial<Record<string, FeatureActionOptionCard[]>>;
  actionFactories: FeatureContributionActionFactory<TDerivedState>[];
  reactions: ReactionEntry[];
  statuses: CharacterStatusEntry[];
  equipmentEntries: FeatureEquipmentEntry[];
  weaponActions: WeaponAction[];
  descriptionAdditions: FeatureDescriptionContribution[];
  abilityScoreBonuses: FeatureAbilityScoreBonus[];
  speedBonuses: FeatureSpeedBonus[];
  speedBonusProviders: FeatureSpeedBonusContribution[];
  weaponProficiencyEntries: FeatureWeaponProficiencyEntry[];
  skillProficiencyEntries: FeatureSkillProficiencyEntry[];
  savingThrowProficiencyEntries: FeatureSavingThrowProficiencyEntry[];
  armorProficiencyEntries: FeatureArmorProficiencyEntry[];
  toolProficiencyEntries: FeatureToolProficiencyEntry[];
  languageProficiencyEntries: FeatureLanguageProficiencyEntry[];
  hitPointMaximumBonus: number;
  cantripLimitBonus: number;
  cantripDamageBonus: number;
  grantedCantripEntries: SpellEntry[];
  alwaysPreparedCantripEntries: SpellEntry[];
  alwaysPreparedSpellEntries: SpellEntry[];
  alwaysPreparedSpellSourceMap: SpellSourceMap;
  spellcastingAbilityEntries: FeatureSpellcastingAbilityEntry[];
  spellcastingAbilityBySpellId: Map<string, AbilityKey>;
  freeCastEntries: FeatureFreeCastEntry[];
  spellcastingStates: FeatureSpellcastingState[];
  alwaysPreparedSpellIds: string[];
  alwaysSpellbookSpellIds: string[];
  ritualOnlySpellIds: string[];
  spellTransforms: FeatureSpellTransform[];
  spellDamageBonuses: FeatureSpellDamageBonusContribution[];
  spellDamageFormulaOverrides: Record<string, string>;
  spellDamageFormulaOverrideProviders: FeatureSpellDamageFormulaOverrideContribution[];
  weaponDamageBonuses: FeatureWeaponDamageBonusContribution[];
  initiativeBonuses: FeatureInitiativeBonusContribution[];
  savingThrowBonuses: FeatureSavingThrowBonusContribution[];
  skillBonuses: FeatureSkillBonusContribution[];
  armorClassModes: FeatureArmorClassModeContribution[];
  armorClassBonuses: FeatureArmorClassBonusContribution[];
  savingThrowIndicators: SavingThrowIndicatorMap;
  abilityCheckIndicators: AbilityCheckIndicatorMap;
  coreStatIndicators: CoreStatIndicatorMap;
  skillIndicators: SkillIndicatorMap;
  weaponAttackIndicators: FeatureIndicator[];
  commonActionTransforms: FeatureCommonActionTransform[];
  featureActionTransforms: FeatureActionTransform[];
  weaponActionTransforms: FeatureWeaponActionTransform[];
  itemDescriptionTransforms: FeatureItemDescriptionTransform[];
  spellActionPaths: FeatureSpellActionPathContribution[];
  spellCastEffects: FeatureSpellCastEffectContribution[];
  classMechanics: FeatureClassMechanicsContribution[];
};
