import type {
  DICE,
  FeatureTrackingState,
  ReactionEntry,
  SpellEntry
} from "../../../codex/entries";
import { WEAPON_COMBAT_TYPE } from "../../../codex/entries";
import type { ActionCategory, EconomyType } from "../actionEconomy";
import type {
  AbilityKey,
  ArmorProficiencyEntry,
  Character,
  CharacterClassFeatureState,
  CharacterStatusEntry,
  CoreStats,
  LanguageProficiencyEntry,
  PROF_LEVEL,
  SavingThrowProficiencyEntry,
  SkillName,
  SkillProficiencyEntry,
  WEAPON_PROFICIENCY,
  WeaponProficiencyEntry
} from "../../../types";

export type FeatureActionCard = {
  key: string;
  name: string;
  summary: string;
  detail: string;
  valueLabel?: string;
  breakdown?: string;
  breakdownTone?: "default" | "danger";
  economyType: EconomyType;
  actionCategory: ActionCategory;
  economyMultiCount?: number;
  interaction?: "activate" | "select";
  usesLabel?: string;
  usesIcon?: "brain" | "sparkles" | "flame";
  usesTone?: "default" | "danger";
  usesRemaining?: number;
  usesTotal?: number;
  usesSupplementaryLabel?: string;
  usesInlineLabel?: string;
  usesInlineIcon?: "brain" | "sparkles" | "flame";
  usesInlineSuffix?: string;
  isActive?: boolean;
  consumesEconomyOnActivate?: boolean;
  ignoreEconomyAvailability?: boolean;
  disabled?: boolean;
  disabledReason?: string;
};

export type FeatureActionOptionCard = {
  key: string;
  name: string;
  summary: string;
  detail: string;
  trackingState?: FeatureTrackingState;
  economyType: EconomyType;
  actionCategory: ActionCategory;
  economyMultiCount?: number;
  resultLabel?: string;
  rangeResultLabel?: string;
  breakdown?: string;
  usesLabel?: string;
  usesIcon?: "brain" | "sparkles" | "flame";
  rollFormula?: string;
  rollFormulaDisplay?: string;
  rollDescription?: string;
  disabled?: boolean;
  disabledReason?: string;
};

export type FeatureDamageBonus = {
  label: string;
  value?: number;
  formula?: string;
  displayLabel?: string;
};

export type FeatureSkillBonus = {
  label: string;
  value?: number;
  abilityModifierSource?: AbilityKey;
  minimumValue?: number;
  replacesBaseAbility?: boolean;
};

export type WeaponFeatureContext = {
  name: string;
  ability: AbilityKey;
  attackKind: "weapon" | "unarmed";
  combatType?: WEAPON_COMBAT_TYPE | null;
};

export type FeatureIndicator = {
  label: string;
  tone: "advantage" | "disadvantage";
  source: string | string[];
};

export type CoreStatIndicatorMap = Partial<Record<keyof CoreStats, FeatureIndicator[]>>;

export type AbilityCheckIndicatorMap = Partial<Record<AbilityKey, FeatureIndicator[]>>;

export type SavingThrowIndicatorMap = Partial<Record<AbilityKey, FeatureIndicator[]>>;

export type SkillIndicatorMap = Partial<Record<SkillName, FeatureIndicator[]>>;

export type FeatureSpellcastingState = {
  blocked: boolean;
  reason: string | null;
};

export type DerivedFeatureStatusEntry = CharacterStatusEntry;

export type ArmorClassFeatureContext = {
  hasWornBodyArmor: boolean;
  hasShieldEquipped: boolean;
};

export type FeatureArmorClassMode = {
  key: string;
  label: string;
  baseValue: number;
  abilityModifiers: AbilityKey[];
  abilityModifierCaps?: Partial<Record<AbilityKey, number | null>>;
  shieldAllowed: boolean;
  detail?: string;
};

export type FeatureArmorClassBonus = {
  label: string;
  value: number;
};

export type SpeedFeatureContext = {
  wornBodyArmorType: "light" | "medium" | "heavy" | null;
};

export type MovementSpeedType = "walk" | "climb" | "swim" | "fly";

export type FeatureSpeedBonus = {
  label: string;
  value: number;
  movementType?: MovementSpeedType;
  setTotal?: number | null;
  setBaseFromWalkMultiplier?: number | null;
};

export type FeatureAbilityScoreBonus = {
  ability: AbilityKey;
  label: string;
  value: number;
  maxScore?: number | null;
  order?: number;
};

export type FeatureSkillProficiencyEntry = SkillProficiencyEntry;
export type FeatureSavingThrowProficiencyEntry = SavingThrowProficiencyEntry;
export type FeatureWeaponProficiencyEntry = WeaponProficiencyEntry;

export type FeatureArmorProficiencyEntry = ArmorProficiencyEntry;
export type FeatureLanguageProficiencyEntry = LanguageProficiencyEntry;

export type ActiveClassFeatureName =
  | "Barbarian"
  | "Bard"
  | "Cleric"
  | "Druid"
  | "Fighter"
  | "Monk"
  | "Paladin"
  | "Ranger"
  | "Rogue"
  | "Sorcerer"
  | "Warlock"
  | "Wizard";

export type ClassFeatureDerivedState = {
  actions?: FeatureActionCard[];
  actionOptions?: Partial<Record<string, FeatureActionOptionCard[]>>;
  getWeaponDamageBonuses?: (context: WeaponFeatureContext) => FeatureDamageBonus[];
  savingThrowIndicators?: SavingThrowIndicatorMap;
  abilityCheckIndicators?: AbilityCheckIndicatorMap;
  coreStatIndicators?: CoreStatIndicatorMap;
  skillIndicators?: SkillIndicatorMap;
  getSkillBonuses?: (
    skill: SkillName,
    proficiencyLevel: PROF_LEVEL
  ) => FeatureSkillBonus[];
  spellcastingState?: FeatureSpellcastingState;
  getArmorClassModes?: (context: ArmorClassFeatureContext) => FeatureArmorClassMode[];
  getArmorClassBonuses?: (context: ArmorClassFeatureContext) => FeatureArmorClassBonus[];
  getSpeedBonuses?: (context: SpeedFeatureContext) => FeatureSpeedBonus[];
  abilityScoreBonuses?: FeatureAbilityScoreBonus[];
  cantripLimitBonus?: number;
  cantripDamageBonus?: number;
  weaponProficiencyEntries?: FeatureWeaponProficiencyEntry[];
  skillProficiencyEntries?: FeatureSkillProficiencyEntry[];
  savingThrowProficiencyEntries?: FeatureSavingThrowProficiencyEntry[];
  armorProficiencyEntries?: FeatureArmorProficiencyEntry[];
  languageProficiencyEntries?: FeatureLanguageProficiencyEntry[];
  alwaysPreparedSpellIds?: string[];
  weaponMastery?: {
    selectionCount: number;
    options: WEAPON_PROFICIENCY[];
    selections: WEAPON_PROFICIENCY[];
    setSelections: (character: Character, selections: WEAPON_PROFICIENCY[]) => Character;
  };
  derivedStatusEntries?: DerivedFeatureStatusEntry[];
  reactionEntries?: ReactionEntry[];
  transformSpellEntry?: (spell: SpellEntry) => SpellEntry;
  getSpellDamageFormulaOverride?: (spell: Pick<SpellEntry, "id">) => string | null;
  bardicInspirationDie?: DICE | null;
  monkMartialArtsDie?: DICE | null;
  rogueSneakAttackDiceCount?: number;
  rogueSneakAttackFormula?: string;
  monkUnarmedDamageTypeLabel?: string;
  canUseMonkMartialArts?: (context: {
    hasWornBodyArmor: boolean;
    hasShieldEquipped: boolean;
    wieldsOnlyMonkWeaponsOrUnarmed: boolean;
  }) => boolean;
};

export type CollectedClassFeatureCharacter = Pick<Character, "className" | "level"> &
  Pick<
    Character,
    | "abilities"
    | "subclassId"
    | "classFeatureState"
    | "statusEntries"
    | "roundTracker"
    | "equipment"
    | "customEquipment"
    | "spellbookSpellIds"
    | "cantripIds"
    | "feats"
  >;

export type ClassFeatureModule<TStateKey extends keyof CharacterClassFeatureState> = {
  className: ActiveClassFeatureName;
  stateKey: TStateKey;
  normalizeState: (
    value: unknown,
    character: Pick<Character, "className" | "level"> &
      Partial<Pick<Character, "abilities" | "subclassId">>
  ) => CharacterClassFeatureState[TStateKey];
  collectDerived: (
    character: CollectedClassFeatureCharacter
  ) => ClassFeatureDerivedState;
  handleAction?: (character: Character, actionKey: string) => Character | null;
  handleActionOption?: (character: Character, actionKey: string, optionKey: string) => Character | null;
  applyShortRest?: (character: Character) => Character;
  applyLongRest?: (character: Character) => Character;
  advanceRound?: (character: Character) => Character;
};
