export type AbilityKey = "STR" | "DEX" | "CON" | "INT" | "WIS" | "CHA";

export type AttributeMode = "custom" | "pointBuy";

export type AbilityScores = Record<AbilityKey, number>;

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
  role: string;
  level: number;
  hitPoints: number;
  currentHitPoints: number;
  attributeMode: AttributeMode;
  abilities: AbilityScores;
  alignment: Alignment;
  background: string;
  skills: string[];
  equipment: string[];
};

export type CharacterDraft = Omit<Character, "id">;
