import type {
  EquipmentCost,
  WeaponDamage,
  WeaponRange,
  WeaponType,
  WEAPON_MASTERY,
  WEAPON_PROPERTY
} from "../codex/entries";
import type {
  ArmorProficiencyEntry,
  LanguageProficiencyEntry,
  SavingThrowProficiencyEntry,
  SkillProficiencyEntry,
  ToolProficiencyEntry,
  WeaponProficiencyEntry
} from "./proficiencies";
import type { CharacterClassFeatureState } from "./classFeatures";
import type { SkillName } from "./skills";

export type AbilityKey = "STR" | "DEX" | "CON" | "INT" | "WIS" | "CHA";

export type AttributeMode = "custom" | "pointBuy";

export type AbilityScores = Record<AbilityKey, number>;

export type CoreStats = {
  armorClass: string;
  initiative: string;
  speed: string;
  passivePerception: string;
  proficiencyBonus: string;
  hitDice: string;
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

export type CharacterCondition = {
  name: string;
  roundsRemaining: number;
};

export type CharacterRoundTracker = {
  actionAvailable: boolean;
  bonusActionAvailable: boolean;
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
  type: WeaponType;
  damage: WeaponDamage;
  properties: WEAPON_PROPERTY[];
  mastery: WEAPON_MASTERY;
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
  level: number;
  xp: number;
  hitPoints: number;
  currentHitPoints: number;
  temporaryHitPoints: number;
  maxHitPointsMode?: "automatic" | "custom";
  attributeMode: AttributeMode;
  abilities: AbilityScores;
  alignment: Alignment;
  background: string;
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
  conditions?: CharacterCondition[];
  deathSaves?: CharacterDeathSaves;
  equipment: CharacterEquipmentItem[];
  customEquipment: CharacterCustomEquipment[];
  cantripIds?: string[];
  preparedSpellIds?: string[];
  spellSlotsExpended?: number[];
  shortRestsUsedToday?: number;
  coreStats?: CoreStats;
  classFeatureState?: CharacterClassFeatureState;
};

export type CharacterDraft = {
  name: string;
  species: string;
  className: string;
  level: number;
  xp: number;
  hitPoints: number;
  currentHitPoints: number;
  temporaryHitPoints: number;
  maxHitPointsMode?: "automatic" | "custom";
  attributeMode: AttributeMode;
  abilities: AbilityScores;
  alignment: Alignment;
  background: string;
  backgroundNotes: string;
  currencies: CharacterCurrencies;
  skills: SkillName[];
  skillExpertise?: SkillName[];
  toolProficiencies?: string[];
  savingThrowProficiencies?: AbilityKey[];
  hitDiceRemaining?: number;
  roundTracker?: CharacterRoundTracker;
  conditions?: CharacterCondition[];
  deathSaves?: CharacterDeathSaves;
  equipment: string[];
  customEquipment: CharacterCustomEquipment[];
  cantripIds?: string[];
  preparedSpellIds?: string[];
  spellSlotsExpended?: number[];
  shortRestsUsedToday?: number;
  coreStats?: CoreStats;
  classFeatureState?: CharacterClassFeatureState;
};
