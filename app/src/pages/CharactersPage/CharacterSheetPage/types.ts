import type { AbilityScores, AttributeMode, Character } from "../../../types";

export type SkillLevel = "none" | "proficient" | "expert";
export type SpellManagementMode = "menu" | "edit";
export type PersistCharacterUpdater = (updater: (current: Character) => Character) => void;

export type IdentityDraft = {
  name: string;
  species: string;
  className: string;
  level: number;
  alignment: Character["alignment"];
  background: string;
};

export type HpDraft = {
  hitPoints: number;
  currentHitPoints: number;
};

export type XpDraft = {
  level: number;
  xp: number;
};

export type AbilitiesDraft = {
  attributeMode: AttributeMode;
  abilities: AbilityScores;
};
