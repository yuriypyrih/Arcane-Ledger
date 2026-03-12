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

export const currencyKeys: CurrencyKey[] = [
  "copper",
  "silver",
  "electrum",
  "gold",
  "platinum"
];

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

export type CharacterDeathSaves = {
  successes: number;
  failures: number;
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
  level: number;
  xp: number;
  hitPoints: number;
  currentHitPoints: number;
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
  conditions?: CharacterCondition[];
  deathSaves?: CharacterDeathSaves;
  equipment: string[];
  knownSpellIds?: string[];
  spellSlotsExpended?: number[];
  shortRestsUsedToday?: number;
  coreStats?: CoreStats;
};

export type CharacterDraft = Omit<Character, "id">;
