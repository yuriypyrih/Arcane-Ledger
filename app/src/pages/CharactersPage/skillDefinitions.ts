import type { AbilityKey, SkillName } from "../../types";

export type SkillGroupDefinition = {
  ability: AbilityKey;
  abilityLabel: string;
  skills: SkillName[];
};

export const skillGroupsByAbility: SkillGroupDefinition[] = [
  { ability: "STR", abilityLabel: "Strength", skills: ["Athletics"] },
  {
    ability: "DEX",
    abilityLabel: "Dexterity",
    skills: ["Acrobatics", "Sleight of Hand", "Stealth"]
  },
  {
    ability: "INT",
    abilityLabel: "Intelligence",
    skills: ["Arcana", "History", "Investigation", "Nature", "Religion"]
  },
  {
    ability: "WIS",
    abilityLabel: "Wisdom",
    skills: ["Animal Handling", "Insight", "Medicine", "Perception", "Survival"]
  },
  {
    ability: "CHA",
    abilityLabel: "Charisma",
    skills: ["Deception", "Intimidation", "Performance", "Persuasion"]
  }
];
