import { SKILL, type AbilityKey, type SkillName } from "../../types";

export type SkillGroupDefinition = {
  ability: AbilityKey;
  abilityLabel: string;
  skills: SkillName[];
};

export const skillGroupsByAbility: SkillGroupDefinition[] = [
  { ability: "STR", abilityLabel: "Strength", skills: [SKILL.ATHLETICS] },
  {
    ability: "DEX",
    abilityLabel: "Dexterity",
    skills: [SKILL.ACROBATICS, SKILL.SLEIGHT_OF_HAND, SKILL.STEALTH]
  },
  {
    ability: "INT",
    abilityLabel: "Intelligence",
    skills: [
      SKILL.ARCANA,
      SKILL.HISTORY,
      SKILL.INVESTIGATION,
      SKILL.NATURE,
      SKILL.RELIGION
    ]
  },
  {
    ability: "WIS",
    abilityLabel: "Wisdom",
    skills: [
      SKILL.ANIMAL_HANDLING,
      SKILL.INSIGHT,
      SKILL.MEDICINE,
      SKILL.PERCEPTION,
      SKILL.SURVIVAL
    ]
  },
  {
    ability: "CHA",
    abilityLabel: "Charisma",
    skills: [SKILL.DECEPTION, SKILL.INTIMIDATION, SKILL.PERFORMANCE, SKILL.PERSUASION]
  }
];
