import type { AbilityScores, AttributeMode, Character } from "../../../types";

export type SkillLevel = "none" | "proficient" | "expert";
export type SpellManagementMode = "menu" | "cantrips" | "prepared-spells" | "eldritch-invocations";
export type PersistCharacterUpdater = (updater: (current: Character) => Character) => void;
export type QueueCharacterSave = (nextCharacter: Character) => void;

export type IdentityDraft = {
  name: string;
  species: string;
  className: string;
  level: number;
  alignment: Character["alignment"];
  background: string;
  backgroundNotes: string;
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
