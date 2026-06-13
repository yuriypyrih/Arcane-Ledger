import type {
  BODY_SIZE,
  EquipmentCost,
  FEATS,
  WeaponDamage,
  WeaponRange,
  WeaponType,
  WEAPON_BASE,
  WEAPON_COMBAT_TYPE,
  WEAPON_MASTERY,
  WEAPON_PROPERTY,
  WEAPON_TRAINING
} from "../codex/entries";
import type {
  ArmorProficiencyEntry,
  LANGUAGE_PROFICIENCY,
  LanguageProficiencyEntry,
  SavingThrowProficiencyEntry,
  SkillProficiencyEntry,
  ToolProficiencyEntry,
  TOOL_PROFICIENCY,
  WeaponProficiencyEntry
} from "./proficiencies";
import type { CharacterClassFeatureState } from "./classFeatures";
import type { CharacterFeatEntry } from "./feats";
import type { ItemRecord } from "./items";
import type { MonsterRecord } from "./monsters";
import type { SkillName } from "./skills";
import type {
  CharacterCustomTraitEffect,
  CharacterStatusDuration,
  CharacterStatusEntry
} from "./traits";

export type AbilityKey = "STR" | "DEX" | "CON" | "INT" | "WIS" | "CHA";

export type AttributeMode = "custom" | "pointBuy";

export type AbilityScores = Record<AbilityKey, number>;

export type CharacterCustomHitDie = "d6" | "d8" | "d10" | "d12";

export type CharacterCustomSubclassConfig = {
  id: string;
  name: string;
  className: string;
};

export type CharacterCustomSpeciesSize = BODY_SIZE.SMALL | BODY_SIZE.MEDIUM | BODY_SIZE.LARGE;

export type CharacterCustomSpeciesConfig = {
  id: string;
  name: string;
  speed: number;
  size: CharacterCustomSpeciesSize;
};

export type CharacterCustomBackgroundConfig = {
  id: string;
  name: string;
};

export type CharacterClassMechanics = {
  extraAttacks: {
    enabled: boolean;
    count: number;
  };
  eldritchInvocations: {
    enabled: boolean;
    selectionIds: string[];
  };
  spellcasting: {
    enabled: boolean;
  };
};

export type CharacterCustomClassMechanics = CharacterClassMechanics;

export type CharacterClassRulesConfig = {
  classRulesEnforced: boolean;
  spellcastingRulesEnforced: boolean;
  hitDie: CharacterCustomHitDie;
  spellcastingAbility: AbilityKey;
  spellSlotMaximums: number[];
  mechanics: CharacterClassMechanics;
};

export type CharacterCustomClassConfig = {
  id?: string;
  name?: string;
  hitDie: CharacterCustomHitDie;
  mechanics: CharacterCustomClassMechanics;
  spellcastingAbility: AbilityKey;
  spellSlotMaximums: number[];
};

export type CharacterBackgroundAbilityScoreIncrease =
  | {
      mode: "two-one";
      primaryAbility: AbilityKey;
      secondaryAbility: AbilityKey;
    }
  | {
      mode: "one-one-one";
      abilities: [AbilityKey, AbilityKey, AbilityKey];
    };

export type CharacterBackgroundEquipmentMode = "equipment" | "gold";

export type CharacterBackgroundChoices = {
  abilityScoreIncrease?: CharacterBackgroundAbilityScoreIncrease;
  languageProficiencies?: LANGUAGE_PROFICIENCY[];
  skillProficiencies?: SkillName[];
  toolProficiencies?: TOOL_PROFICIENCY[];
  toolProficiency?: TOOL_PROFICIENCY;
  equipmentMode?: CharacterBackgroundEquipmentMode;
};

export type CharacterSpeciesChoices = {
  bodySize?: BODY_SIZE;
  draconicAncestry?: CharacterDragonbornDraconicAncestry;
  elvenLineage?: CharacterElfLineage;
  elvenSkillProficiency?: CharacterElfSkillProficiency;
  elvenSpellcastingAbility?: CharacterElfSpellcastingAbility;
  gnomeLineage?: CharacterGnomeLineage;
  gnomeSpellcastingAbility?: CharacterGnomeSpellcastingAbility;
  giantAncestry?: CharacterGoliathGiantAncestry;
  humanSkillProficiency?: SkillName;
  humanOriginFeat?: FEATS;
  tieflingLegacy?: CharacterTieflingFiendishLegacy;
  tieflingSpellcastingAbility?: CharacterTieflingSpellcastingAbility;
};

export type CharacterDragonbornDraconicAncestry =
  | "black"
  | "blue"
  | "brass"
  | "bronze"
  | "copper"
  | "gold"
  | "green"
  | "red"
  | "silver"
  | "white";

export type CharacterElfLineage = "drow" | "high-elf" | "wood-elf";

export type CharacterElfSkillProficiency = "Insight" | "Perception" | "Survival";

export type CharacterElfSpellcastingAbility = Extract<AbilityKey, "INT" | "WIS" | "CHA">;

export type CharacterGnomeLineage = "forest-gnome" | "rock-gnome";

export type CharacterGnomeSpellcastingAbility = Extract<AbilityKey, "INT" | "WIS" | "CHA">;

export type CharacterGoliathGiantAncestry = "cloud" | "fire" | "frost" | "hill" | "stone" | "storm";

export type CharacterTieflingFiendishLegacy = "abyssal" | "chthonic" | "infernal";

export type CharacterTieflingSpellcastingAbility = Extract<AbilityKey, "INT" | "WIS" | "CHA">;

export type CharacterAasimarFeatureState = {
  healingHandsExpended?: boolean;
  celestialRevelationExpended?: boolean;
};

export type CharacterDragonbornFeatureState = {
  breathWeaponUsesExpended?: number;
  draconicFlightExpended?: boolean;
};

export type CharacterDwarfFeatureState = {
  stonecunningUsesExpended?: number;
};

export type CharacterGnomeFeatureState = {
  speakWithAnimalsUsesExpended?: number;
};

export type CharacterGoliathFeatureState = {
  giantAncestryUsesExpended?: number;
  largeFormExpended?: boolean;
};

export type CharacterOrcFeatureState = {
  adrenalineRushUsesExpended?: number;
};

export type CharacterTieflingFeatureState = {
  fiendishLegacyFreeCastExpendedSpellIds?: string[];
};

export type CharacterSpeciesFeatureState = {
  aasimar?: CharacterAasimarFeatureState;
  dragonborn?: CharacterDragonbornFeatureState;
  dwarf?: CharacterDwarfFeatureState;
  gnome?: CharacterGnomeFeatureState;
  goliath?: CharacterGoliathFeatureState;
  orc?: CharacterOrcFeatureState;
  tiefling?: CharacterTieflingFeatureState;
};

export type CoreStats = {
  armorClass: string;
  initiative: string;
  speed: string;
  passivePerception: string;
  proficiencyBonus: string;
  hitDice: string;
};

export type CharacterSheetSyncStatus =
  | "local-only"
  | "dirty"
  | "syncing"
  | "synced"
  | "deleting"
  | "conflict"
  | "error";

export type CharacterSyncMetadata = {
  clientId: string;
  ownerId?: string;
  remoteId?: string;
  localRevision: number;
  remoteRevision?: number;
  syncStatus: CharacterSheetSyncStatus;
  lastLocalChangeAt?: string;
  lastSyncedAt?: string;
  lastSyncError?: string;
};

export type CharacterAvatarMetadata = {
  objectKey: string;
  imageUrl: string;
  mimeType: string;
  sizeBytes: number;
  updatedAt: string;
};

export type CharacterBackgroundTextureMetadata =
  | {
      source: "none";
    }
  | {
      source: "predefined";
      textureId: string;
    }
  | {
      source: "uploaded";
      objectKey: string;
      imageUrl: string;
      mimeType: string;
      sizeBytes: number;
      updatedAt: string;
    };

export type CharacterStorageMetadata = {
  sheetSizeBytes?: number;
  sync?: CharacterSyncMetadata;
  avatar?: CharacterAvatarMetadata;
  backgroundTexture?: CharacterBackgroundTextureMetadata;
};

export type ArmorClassFormulaSelectionMode = "auto" | "manual";

export type CharacterArmorClassFormulaSelection = {
  key: string | null;
  mode: ArmorClassFormulaSelectionMode;
};

export type CurrencyKey = "copper" | "silver" | "gold" | "electrum" | "platinum";

export const currencyKeys: CurrencyKey[] = ["copper", "silver", "electrum", "gold", "platinum"];

export type CharacterCurrencies = {
  copper: number;
  silver: number;
  gold: number;
  electrum: number;
  platinum: number;
} & Record<string, number>;

export type CharacterRoundTracker = {
  turnStarted: boolean;
  isInCombat: boolean;
  combatRound: number;
  combatRoundAdvancePending: boolean;
  actionAvailable: boolean;
  bonusActionAvailable: boolean;
  reactionAvailable: boolean;
  lightWeaponAttack?: {
    triggerWeaponKey: string;
    triggerHasNickMastery: boolean;
    followUpUsed: boolean;
    followUpWeaponKey?: string;
    followUpDamagePenaltyPending?: boolean;
  };
};

export type CharacterDeathSaves = {
  successes: number;
  failures: number;
  resolution?: "instant-death";
};

export type CharacterEquipmentItem = {
  name: string;
  onHand: boolean;
  worn: boolean;
};

export type CharacterInventoryFeatureTag =
  | "pact-of-the-blade"
  | "conjured"
  | "spellcasting-focus";
export type CharacterInventorySpellcastingFocusSource = "manual" | "arcane-firearm";
export type CharacterInventoryConjuredSource =
  | "manual"
  | "adventurers-atlas"
  | "experimental-elixir"
  | "tinkers-magic"
  | "replicate-magic-item"
  | "pact-of-the-blade";
export type CharacterInventoryConjuredDuration = "death" | "short-rest" | "long-rest";
export type CharacterReplicateMagicItemSlot = "base" | "armor-replication";
export type CharacterInventoryStoredSpellMode =
  | "default"
  | "consume-charges"
  | "consume-charges-destructible";

export type CharacterInventoryStoredSpell = {
  spellId: string;
  mode: CharacterInventoryStoredSpellMode;
  chargeCost: number;
};

export type CharacterInventoryChargesRecharge = {
  shortRest: number;
  longRest: number;
};

export type CharacterItemModCategory = "weapon" | "armor" | "general";

export type CharacterItemWeaponMods = {
  baseWeapon?: WEAPON_BASE;
  training?: WEAPON_TRAINING;
  combat?: WEAPON_COMBAT_TYPE;
  damage?: WeaponDamage;
  properties?: WEAPON_PROPERTY[];
  mastery?: WEAPON_MASTERY;
  range?: WeaponRange;
  versatileDamage?: WeaponDamage;
};

export type CharacterItemArmorMods = {
  armorType?: CustomArmorType;
  armorClass?: number;
};

export type CharacterModEffect = CharacterCustomTraitEffect;

export type CharacterItemMods = {
  baseCategory: CharacterItemModCategory;
  isCustom?: boolean;
  isMagicItem?: boolean;
  requiresAttunement?: boolean;
  name?: string;
  description?: string;
  cost?: EquipmentCost;
  weight?: number | null;
  weapon?: CharacterItemWeaponMods;
  armor?: CharacterItemArmorMods;
  effects?: CharacterModEffect[];
};

export type CharacterInventoryItemBase = {
  id: string;
  item: ItemRecord;
  quantity: number;
  onHandQuantity: number;
  worn: boolean;
  attuned?: boolean;
  usesRemaining?: number;
  chargesTotal?: number | null;
  chargesRecharge?: CharacterInventoryChargesRecharge;
  storedSpell?: CharacterInventoryStoredSpell;
  featureTags?: CharacterInventoryFeatureTag[];
  customTag?: string;
  spellcastingFocusSources?: CharacterInventorySpellcastingFocusSource[];
  conjuredSource?: CharacterInventoryConjuredSource;
  conjuredDuration?: CharacterInventoryConjuredDuration;
  replicateMagicItemPlanKey?: string;
  replicateMagicItemSlot?: CharacterReplicateMagicItemSlot;
  mods?: CharacterItemMods;
};

export type CharacterContainerContentItem = Omit<
  CharacterInventoryItemBase,
  "id" | "onHandQuantity" | "worn" | "attuned"
> & {
  attuned?: boolean;
};

export type CharacterInventoryItem = CharacterInventoryItemBase & {
  containerContents?: CharacterContainerContentItem[];
};

export type CustomArmorType = "light" | "medium" | "heavy" | "shield";

export type CharacterCustomEquipmentBase = {
  id: string;
  name: string;
  description: string;
  cost: EquipmentCost;
  weight: number | null;
};

export type CharacterCustomWeapon = CharacterCustomEquipmentBase & {
  kind: "weapon";
  onHand: boolean;
  baseWeapon: WEAPON_BASE;
  type: WeaponType;
  damage: WeaponDamage;
  properties: WEAPON_PROPERTY[];
  mastery?: WEAPON_MASTERY;
  range?: WeaponRange;
  versatileDamage?: WeaponDamage;
  propertyNotes?: Partial<Record<WEAPON_PROPERTY, string>>;
};

export type CharacterCustomArmor = CharacterCustomEquipmentBase & {
  kind: "armor";
  worn: boolean;
  armorType: CustomArmorType;
  armorBase: number;
  maxDexModifier: number | null;
  shieldBonus: number;
};

export type CharacterCustomItem = CharacterCustomEquipmentBase & {
  kind: "item";
};

export type CharacterCustomEquipment =
  | CharacterCustomWeapon
  | CharacterCustomArmor
  | CharacterCustomItem;

export type CharacterCompanion = {
  id: string;
  name: string;
  description: string;
  type: string;
  role?: "beast-master";
  primalBeastKind?: "land" | "sea" | "sky";
  maxHitPoints: number;
  currentHitPoints: number;
  temporaryHitPoints: number;
  temporaryHitPointsSource?: string;
  deathSaves?: CharacterDeathSaves;
  duration: CharacterStatusDuration;
  inheritedCreatureEntry?: MonsterRecord;
  inheritedCreatureEntryModified?: boolean;
};

export type CharacterCustomActionEconomy =
  | "action"
  | "bonus_action"
  | "reaction"
  | "long_action"
  | "non_action";

export type CharacterCustomActionChargeMaxMode = "fixed" | "proficiency_bonus";

export type CharacterCustomActionCharges = {
  current: number;
  max: number;
  maxMode?: CharacterCustomActionChargeMaxMode;
  shortRestRecovery: number;
  longRestRecovery: number;
};

export type CharacterCustomAction = {
  id: string;
  name: string;
  description: string;
  economy: CharacterCustomActionEconomy;
  duration?: CharacterStatusDuration;
  customEffects?: CharacterCustomTraitEffect[];
  charges?: CharacterCustomActionCharges;
};

export type Alignment =
  | "Lawful Good"
  | "Neutral Good"
  | "Chaotic Good"
  | "Lawful Neutral"
  | "True Neutral"
  | "Chaotic Neutral"
  | "Lawful Evil"
  | "Neutral Evil"
  | "Chaotic Evil";

export type Character = {
  id: number;
  name: string;
  species: string;
  speciesChoices?: CharacterSpeciesChoices;
  customSpecies?: CharacterCustomSpeciesConfig;
  speciesFeatureState?: CharacterSpeciesFeatureState;
  className: string;
  subclassId?: string;
  customSubclass?: CharacterCustomSubclassConfig;
  classRules?: CharacterClassRulesConfig;
  customClass?: CharacterCustomClassConfig;
  level: number;
  xp: number;
  hitPoints: number;
  currentHitPoints: number;
  magicTemporaryHitPoints: number;
  magicTemporaryHitPointsSource?: string;
  temporaryHitPoints: number;
  temporaryHitPointsSource?: string;
  hover?: boolean;
  maxHitPointsMode?: "automatic" | "custom";
  attributeMode: AttributeMode;
  abilities: AbilityScores;
  alignment: Alignment;
  background: string;
  customBackground?: CharacterCustomBackgroundConfig;
  backgroundChoices?: CharacterBackgroundChoices;
  backgroundNotes: string;
  currencies: CharacterCurrencies;
  skillProficiencies: SkillProficiencyEntry[];
  savingThrowProficiencies: SavingThrowProficiencyEntry[];
  weaponProficiencies: WeaponProficiencyEntry[];
  armorProficiencies: ArmorProficiencyEntry[];
  toolProficiencies: ToolProficiencyEntry[];
  languageProficiencies: LanguageProficiencyEntry[];
  hitDiceRemaining?: number;
  roundTracker?: CharacterRoundTracker;
  statusEntries?: CharacterStatusEntry[];
  deathSaves?: CharacterDeathSaves;
  equipment: CharacterEquipmentItem[];
  inventoryItems: CharacterInventoryItem[];
  customEquipment: CharacterCustomEquipment[];
  companions: CharacterCompanion[];
  customActions: CharacterCustomAction[];
  cantripIds?: string[];
  spellbookSpellIds?: string[];
  preparedSpellIds?: string[];
  spellSlotsExpended?: number[];
  shortRestsUsedToday?: number;
  heroicInspiration: boolean;
  coreStats?: CoreStats;
  armorClassFormulaSelection?: CharacterArmorClassFormulaSelection;
  classFeatureState?: CharacterClassFeatureState;
  feats?: CharacterFeatEntry[];
  storageMetadata?: CharacterStorageMetadata;
};

export type HydratedCharacter = Character;
export type ActiveCharacter = HydratedCharacter;

export type CharacterDraft = {
  name: string;
  species: string;
  speciesChoices?: CharacterSpeciesChoices;
  customSpecies?: CharacterCustomSpeciesConfig;
  speciesFeatureState?: CharacterSpeciesFeatureState;
  className: string;
  subclassId?: string;
  customSubclass?: CharacterCustomSubclassConfig;
  classRules?: CharacterClassRulesConfig;
  customClass?: CharacterCustomClassConfig;
  level: number;
  xp: number;
  hitPoints: number;
  currentHitPoints: number;
  magicTemporaryHitPoints: number;
  magicTemporaryHitPointsSource?: string;
  temporaryHitPoints: number;
  temporaryHitPointsSource?: string;
  hover?: boolean;
  maxHitPointsMode?: "automatic" | "custom";
  attributeMode: AttributeMode;
  abilities: AbilityScores;
  alignment: Alignment;
  background: string;
  customBackground?: CharacterCustomBackgroundConfig;
  backgroundChoices?: CharacterBackgroundChoices;
  backgroundNotes: string;
  currencies: CharacterCurrencies;
  skills: SkillName[];
  skillExpertise?: SkillName[];
  toolProficiencies?: string[];
  languageProficiencies?: LanguageProficiencyEntry[];
  savingThrowProficiencies?: AbilityKey[];
  hitDiceRemaining?: number;
  roundTracker?: CharacterRoundTracker;
  statusEntries?: CharacterStatusEntry[];
  deathSaves?: CharacterDeathSaves;
  equipment: string[];
  inventoryItems: CharacterInventoryItem[];
  customEquipment: CharacterCustomEquipment[];
  companions: CharacterCompanion[];
  customActions: CharacterCustomAction[];
  cantripIds?: string[];
  spellbookSpellIds?: string[];
  preparedSpellIds?: string[];
  spellSlotsExpended?: number[];
  shortRestsUsedToday?: number;
  heroicInspiration: boolean;
  coreStats?: CoreStats;
  armorClassFormulaSelection?: CharacterArmorClassFormulaSelection;
  classFeatureState?: CharacterClassFeatureState;
  feats?: CharacterFeatEntry[];
  storageMetadata?: CharacterStorageMetadata;
};
