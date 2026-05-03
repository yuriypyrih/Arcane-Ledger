import type {
  EquipmentCost,
  WeaponDamage,
  WeaponRange,
  WeaponType,
  WEAPON_BASE,
  WEAPON_MASTERY,
  WEAPON_PROPERTY
} from "../codex/entries";
import type {
  ArmorProficiencyEntry,
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
import type { CharacterStatusDuration, CharacterStatusEntry } from "./traits";

export type AbilityKey = "STR" | "DEX" | "CON" | "INT" | "WIS" | "CHA";

export type AttributeMode = "custom" | "pointBuy";

export type AbilityScores = Record<AbilityKey, number>;

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
  skillProficiencies?: SkillName[];
  toolProficiencies?: TOOL_PROFICIENCY[];
  toolProficiency?: TOOL_PROFICIENCY;
  equipmentMode?: CharacterBackgroundEquipmentMode;
};

export type CoreStats = {
  armorClass: string;
  initiative: string;
  speed: string;
  passivePerception: string;
  proficiencyBonus: string;
  hitDice: string;
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
};

export type CharacterDeathSaves = {
  successes: number;
  failures: number;
};

export type CharacterEquipmentItem = {
  name: string;
  onHand: boolean;
  worn: boolean;
};

export type CharacterInventoryItem = {
  id: string;
  item: ItemRecord;
  quantity: number;
  onHandQuantity: number;
  worn: boolean;
  attuned?: boolean;
  usesRemaining?: number;
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
  duration: CharacterStatusDuration;
  inheritedCreatureEntry?: MonsterRecord;
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
  className: string;
  subclassId?: string;
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
};

export type CharacterDraft = {
  name: string;
  species: string;
  className: string;
  subclassId?: string;
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
  backgroundChoices?: CharacterBackgroundChoices;
  backgroundNotes: string;
  currencies: CharacterCurrencies;
  skills: SkillName[];
  skillExpertise?: SkillName[];
  toolProficiencies?: string[];
  savingThrowProficiencies?: AbilityKey[];
  hitDiceRemaining?: number;
  roundTracker?: CharacterRoundTracker;
  statusEntries?: CharacterStatusEntry[];
  deathSaves?: CharacterDeathSaves;
  equipment: string[];
  inventoryItems: CharacterInventoryItem[];
  customEquipment: CharacterCustomEquipment[];
  companions: CharacterCompanion[];
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
};
