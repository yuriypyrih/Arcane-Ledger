import type {
  ArmorEntry,
  CLASS_FEATURE,
  DICE,
  ItemEntry,
  TRACKER,
  ReactionEntry,
  SpellDescriptionEntry,
  SpellEntry,
  WeaponEntry
} from "../../../codex/entries";
import { WEAPON_COMBAT_TYPE } from "../../../codex/entries";
import type { ActionCategory, EconomyType } from "../actionEconomy";
import type { ACTION_CARD_THEME } from "../actionCardTheme";
import type {
  AbilityKey,
  ArmorProficiencyEntry,
  Character,
  CharacterClassFeatureState,
  CharacterInventoryFeatureTag,
  CharacterStatusEntry,
  CoreStats,
  LanguageProficiencyEntry,
  PROF_LEVEL,
  SavingThrowProficiencyEntry,
  SkillName,
  SkillProficiencyEntry,
  ToolProficiencyEntry,
  WEAPON_PROFICIENCY,
  WeaponProficiencyEntry
} from "../../../types";
import type { WeaponAction } from "../gameplay";

export type FeatureActionTone = "default" | "accent" | "danger";
export type FeatureActionIcon =
  | "anima"
  | "brain"
  | "music"
  | "sparkles"
  | "flame"
  | "superiority"
  | "wind"
  | "paw"
  | "psi"
  | "pyromancy";

export type FeatureActionCardUsageCharges = {
  current: number;
  total: number;
};

export type FeatureActionCardUsageCost = {
  amountText?: string;
  resourceLabel: string;
  icon?: FeatureActionIcon;
};

export type FeatureActionCardUsage =
  | {
      mode: "free";
    }
  | {
      mode: "text";
      label: string;
    }
  | {
      mode: "named-resource";
      cost: FeatureActionCardUsageCost;
    }
  | {
      mode: "named-resource-or-resource";
      cost: FeatureActionCardUsageCost;
      fallbackCost: FeatureActionCardUsageCost;
    }
  | {
      mode: "charges";
      charges: FeatureActionCardUsageCharges;
    }
  | {
      mode: "charges-and-resource";
      charges: FeatureActionCardUsageCharges;
      cost: FeatureActionCardUsageCost;
    }
  | {
      mode: "charges-or-resource";
      charges: FeatureActionCardUsageCharges;
      cost: FeatureActionCardUsageCost;
    };

export type FeatureActionHeaderTagPool = {
  current: number;
  total: number;
  label?: string;
  icon?: FeatureActionIcon;
};

export type FeatureActionHeaderTag =
  | {
      kind: "charges";
      charges: FeatureActionCardUsageCharges;
      supplementaryText?: string;
    }
  | {
      kind: "usage";
      cost: FeatureActionCardUsageCost;
      pool: FeatureActionHeaderTagPool;
      isFallback?: boolean;
    }
  | {
      kind: "text";
      label: string;
      value: string;
      tone?: FeatureActionTone;
      icon?: FeatureActionIcon;
    };

export type FeatureActionFact = {
  label: string;
  value: string;
  breakdown?: string;
  fullWidth?: boolean;
  tone?: FeatureActionTone;
};

export type FeatureActionResource =
  | {
      kind: "tracker";
      label: string;
      current: number;
      total: number;
      value?: string;
      tone?: FeatureActionTone;
      supplementary?: string;
      icon?: FeatureActionIcon;
      cost?: number;
      connectorText?: string;
    }
  | {
      kind: "text";
      label: string;
      value: string;
      tone?: FeatureActionTone;
      icon?: FeatureActionIcon;
    };

export type FeatureActionDrawerKind = "confirm" | "options" | "custom-form" | "spell-list";

export type FeatureActionExecuteKind = "activate" | "option" | "custom-form" | "spell";

export type FeatureActionExecuteEffectKind =
  | "default"
  | "combat-superiority"
  | "know-your-enemy"
  | "bardic-inspiration-roll"
  | "second-wind"
  | "speedy-recovery"
  | "tactical-mind"
  | "tireless";

export type FeatureActionFormKind =
  | "aasimar-celestial-revelation"
  | "aasimar-healing-hands"
  | "artificer-charge-magic-item"
  | "artificer-drain-magic-item"
  | "artificer-experimental-elixir"
  | "artificer-transmute-magic-item"
  | "arcane-recovery"
  | "blessing-of-the-trickster"
  | "brutal-strike"
  | "dragonborn-breath-weapon"
  | "dragonborn-draconic-flight"
  | "dwarf-stonecunning"
  | "font-of-magic"
  | "goliath-clouds-jaunt"
  | "goliath-large-form"
  | "goliath-stones-endurance"
  | "goliath-storms-thunder"
  | "healing-light"
  | "indomitable"
  | "lay-on-hands"
  | "nature-magician"
  | "portent"
  | "recover-vitality"
  | "third-eye"
  | "starry-form"
  | "sneak-attack"
  | "spellfire-burst"
  | "tinkers-magic"
  | "replicate-magic-item"
  | "wild-companion"
  | "wild-resurgence"
  | "wild-shape"
  | "warrior-of-the-gods"
  | "wild-heart-rage";

export type FeatureActionOptionSelection = "single-immediate" | "single-confirm" | "multi-confirm";

export type FeatureActionSpellSource = "fixed" | "divine-intervention" | "mystic-arcanum";

export type FeatureActionSpellEffectKind =
  | "ascendant-step"
  | "armor-of-shadows"
  | "conjured-cauldron"
  | "contact-patron"
  | "divine-intervention"
  | "faithful-steed"
  | "favored-enemy"
  | "fiendish-vigor"
  | "gift-of-the-depths"
  | "mask-of-many-faces"
  | "mantle-of-majesty"
  | "master-of-myriad-forms"
  | "misty-visions"
  | "mystic-arcanum"
  | "one-with-shadows"
  | "otherworldly-leap"
  | "pact-of-the-chain"
  | "paladins-smite"
  | "restorative-reagents"
  | "shadow-arts-darkness"
  | "visions-of-distant-realms"
  | "whispers-of-the-grave";

export type FeatureActionDrawerConfig = {
  kind: FeatureActionDrawerKind;
  eyebrow?: string;
  description?: SpellDescriptionEntry[];
  descriptionAdditions?: SpellDescriptionEntry[][];
  helperText?: string;
  helperTextTone?: FeatureActionTone;
  blockedReason?: string;
  facts?: FeatureActionFact[];
  factsSectionTitle?: string | null;
  headerTags?: FeatureActionHeaderTag[];
  confirmLabel?: string;
  optionSelection?: FeatureActionOptionSelection;
  optionSelectionLimit?: number;
  formKind?: FeatureActionFormKind;
};

export type FeatureActionExecuteConfig =
  | {
      kind: "activate";
      label?: string;
      effectKind?: FeatureActionExecuteEffectKind;
    }
  | {
      kind: "option";
      label?: string;
    }
  | {
      kind: "custom-form";
      formKind: FeatureActionFormKind;
      label?: string;
    }
  | {
      kind: "spell";
      label?: string;
      spellSource: FeatureActionSpellSource;
      effectKind?: FeatureActionSpellEffectKind;
      spellId?: string;
      spellLevel?: number;
      actionLabel?: string;
      actionContextText?: string;
      actionAvailabilityText?: string;
      actionConsumesSpellSlot?: boolean;
      allowRitualCasting?: boolean;
      freeCastSlotLevel?: number | null;
    };

export type FeatureActionCard = {
  key: string;
  name: string;
  sourceFeature?: CLASS_FEATURE;
  cardTheme?: ACTION_CARD_THEME;
  summary: string;
  detail: string;
  valueLabel?: string;
  breakdown?: string;
  breakdownTone?: "default" | "danger";
  economyType: EconomyType;
  actionCategory: ActionCategory;
  economyMultiCount?: number;
  usesLabel?: string;
  usesIcon?: FeatureActionIcon;
  usesTone?: "default" | "danger";
  usesRemaining?: number;
  usesTotal?: number;
  hideUsesTrackerOnCard?: boolean;
  usesSupplementaryLabel?: string;
  usesInlineLabel?: string;
  usesInlineIcon?: FeatureActionIcon;
  usesInlineSuffix?: string;
  cardUsage?: FeatureActionCardUsage;
  isActive?: boolean;
  consumesEconomyOnActivate?: boolean;
  ignoreEconomyAvailability?: boolean;
  disabled?: boolean;
  disabledReason?: string;
  description?: SpellDescriptionEntry[];
  descriptionAdditions?: SpellDescriptionEntry[][];
  facts?: FeatureActionFact[];
  headerTags?: FeatureActionHeaderTag[];
  drawer?: FeatureActionDrawerConfig;
  execute?: FeatureActionExecuteConfig;
};

export type FeatureActionOptionCard = {
  key: string;
  name: string;
  presentation?: "default" | "plain";
  cardTheme?: ACTION_CARD_THEME;
  summary: string;
  detail: string;
  trackingState?: TRACKER;
  economyType: EconomyType;
  actionCategory: ActionCategory;
  economyMultiCount?: number;
  resultLabel?: string;
  rangeResultLabel?: string;
  breakdown?: string;
  usesLabel?: string;
  usesIcon?: FeatureActionIcon;
  rollFormula?: string;
  rollFormulaDisplay?: string;
  rollDescription?: string;
  disabled?: boolean;
  disabledReason?: string;
  description?: SpellDescriptionEntry[];
  facts?: FeatureActionFact[];
  resources?: FeatureActionResource[];
};

export type EconomyMultiAttackKind = "weapon" | "unarmed";

export type WeaponAttackConsumptionContext = Pick<
  WeaponAction,
  | "key"
  | "economyType"
  | "actionCategory"
  | "attackKind"
  | "baseWeapon"
  | "combatType"
  | "properties"
  | "mastery"
  | "hasActiveMastery"
  | "inventoryStackId"
  | "inventoryFeatureTags"
> & {
  lightFollowUpKind?: "bonus" | "nick";
};

export type EconomyMultiActionContext = {
  economyType: EconomyType;
  actionCategory: ActionCategory;
  attackKind?: EconomyMultiAttackKind;
  combatType?: WeaponAction["combatType"];
  weaponActionKey?: string;
  weaponInventoryStackId?: string;
  weaponInventoryFeatureTags?: CharacterInventoryFeatureTag[];
  spellLevel?: number;
};

export type FeatureEconomyMultiAccessRule = {
  economyTypes?: EconomyType[];
  actionCategories?: ActionCategory[];
  attackKinds?: EconomyMultiAttackKind[];
  weaponInventoryFeatureTags?: CharacterInventoryFeatureTag[];
  spellLevels?: number[];
  maxAccessible: number | "all";
};

export type FeatureEconomyMultiPool = {
  id: string;
  remaining: number;
  priority: number;
  accessRules: FeatureEconomyMultiAccessRule[];
};

export type FeatureDamageBonus = {
  label: string;
  value?: number;
  formula?: string;
  displayLabel?: string;
  abilityModifierSource?: AbilityKey;
  abilityModifierMultiplier?: 1 | -1;
  formulaSourceLabel?: string;
};

export type FeatureSkillBonus = {
  label: string;
  value?: number;
  abilityModifierSource?: AbilityKey;
  abilityModifierMultiplier?: 1 | -1;
  formulaSourceLabel?: string;
  minimumValue?: number;
  replacesBaseAbility?: boolean;
};

export type FeatureSavingThrowBonus = {
  label: string;
  value?: number;
  abilityModifierSource?: AbilityKey;
  abilityModifierMultiplier?: 1 | -1;
  formulaSourceLabel?: string;
  minimumValue?: number;
};

export type FeatureInitiativeBonus = {
  label: string;
  value?: number;
  abilityModifierSource?: AbilityKey;
  abilityModifierMultiplier?: 1 | -1;
  formulaSourceLabel?: string;
  minimumValue?: number;
};

export type WeaponFeatureContext = {
  name: string;
  ability: AbilityKey;
  attackKind: "weapon" | "unarmed";
  combatType?: WEAPON_COMBAT_TYPE | null;
};

export type SpellFeatureContext = {
  spell: Pick<SpellEntry, "id" | "spellLevel" | "damage">;
};

export type FeatureUnarmedStrikeConfig = {
  attackAbility?: AbilityKey | "finesse";
  damageAbility?: AbilityKey;
  damageFormula?: string;
  damageTypeLabel?: string;
  damageBreakdownLabel?: string;
};

export type MagicTemporaryHitPointsFeature = {
  id: string;
  label: string;
  modalTitle: string;
  description: string;
  maxHitPoints: number;
};

export type FeatureIndicator = {
  label: string;
  tone: "advantage" | "disadvantage";
  source: string | string[];
};

export type SpellSourceMap = Record<string, string[]>;

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
  unlockedAtLevel?: number;
  baseValue: number;
  abilityModifiers: AbilityKey[];
  abilityModifierCaps?: Partial<Record<AbilityKey, number | null>>;
  shieldAllowed: boolean;
  isApplicable: boolean;
  unavailableReason?: string;
  detail?: string;
};

export type FeatureArmorClassBonus = {
  label: string;
  value: number;
  abilityModifierSource?: AbilityKey;
  abilityModifierMultiplier?: 1 | -1;
  formulaSourceLabel?: string;
};

export type SpeedFeatureContext = {
  wornBodyArmorType: "light" | "medium" | "heavy" | null;
};

export type MovementSpeedType = "walk" | "climb" | "swim" | "fly" | "burrow";

export type FeatureSpeedBonus = {
  label: string;
  value: number;
  abilityModifierSource?: AbilityKey;
  abilityModifierMultiplier?: 1 | -1;
  formulaSourceLabel?: string;
  movementType?: MovementSpeedType;
  setTotal?: number | null;
  setBaseFromWalkMultiplier?: number | null;
  hover?: boolean;
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
export type FeatureToolProficiencyEntry = ToolProficiencyEntry;

export type FeatureArmorProficiencyEntry = ArmorProficiencyEntry;
export type FeatureLanguageProficiencyEntry = LanguageProficiencyEntry;
export type FeatureEquipmentEntry = {
  key: string;
  entry: WeaponEntry | ArmorEntry | ItemEntry;
  sourceLabel: string;
  summaryOverride?: string;
};

export type ActiveClassFeatureName =
  | "Artificer"
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
  equipmentEntries?: FeatureEquipmentEntry[];
  weaponActions?: WeaponAction[];
  getWeaponDamageBonuses?: (context: WeaponFeatureContext) => FeatureDamageBonus[];
  getSpellDamageBonuses?: (context: SpellFeatureContext) => FeatureDamageBonus[];
  getInitiativeBonuses?: () => FeatureInitiativeBonus[];
  getSavingThrowBonuses?: (ability: AbilityKey) => FeatureSavingThrowBonus[];
  savingThrowIndicators?: SavingThrowIndicatorMap;
  abilityCheckIndicators?: AbilityCheckIndicatorMap;
  coreStatIndicators?: CoreStatIndicatorMap;
  skillIndicators?: SkillIndicatorMap;
  getSkillBonuses?: (skill: SkillName, proficiencyLevel: PROF_LEVEL) => FeatureSkillBonus[];
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
  toolProficiencyEntries?: FeatureToolProficiencyEntry[];
  languageProficiencyEntries?: FeatureLanguageProficiencyEntry[];
  alwaysPreparedSpellIds?: string[];
  alwaysPreparedSpellSources?: SpellSourceMap;
  alwaysSpellbookSpellIds?: string[];
  magicTemporaryHitPointsFeature?: MagicTemporaryHitPointsFeature | null;
  ritualOnlySpellIds?: string[];
  weaponMastery?: {
    selectionCount: number;
    options: WEAPON_PROFICIENCY[];
    selections: WEAPON_PROFICIENCY[];
    setSelections: (character: Character, selections: WEAPON_PROFICIENCY[]) => Character;
  };
  derivedStatusEntries?: DerivedFeatureStatusEntry[];
  reactionEntries?: ReactionEntry[];
  transformSpellEntry?: (spell: SpellEntry) => SpellEntry;
  transformCommonAction?: (action: FeatureActionCard) => FeatureActionCard;
  transformFeatureAction?: (action: FeatureActionCard) => FeatureActionCard;
  transformWeaponAction?: (action: WeaponAction) => WeaponAction;
  getSpellDamageFormulaOverride?: (spell: Pick<SpellEntry, "id">) => string | null;
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

export type CollectedClassFeatureCharacter = Pick<Character, "className" | "level"> &
  Pick<
    Character,
    | "abilities"
    | "subclassId"
    | "classFeatureState"
    | "skillProficiencies"
    | "toolProficiencies"
    | "savingThrowProficiencies"
    | "spellSlotsExpended"
    | "statusEntries"
    | "roundTracker"
    | "equipment"
    | "inventoryItems"
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
      Partial<
        Pick<
          Character,
          "abilities" | "cantripIds" | "feats" | "inventoryItems" | "statusEntries" | "subclassId"
        >
      >
  ) => CharacterClassFeatureState[TStateKey];
  collectDerived: (character: CollectedClassFeatureCharacter) => ClassFeatureDerivedState;
  handleAction?: (character: Character, actionKey: string) => Character | null;
  handleActionOption?: (
    character: Character,
    actionKey: string,
    optionKey: string
  ) => Character | null;
  handleActionOptions?: (
    character: Character,
    actionKey: string,
    optionKeys: string[]
  ) => Character | null;
  applyShortRest?: (character: Character) => Character;
  applyLongRest?: (character: Character) => Character;
  advanceRound?: (character: Character) => Character;
};
