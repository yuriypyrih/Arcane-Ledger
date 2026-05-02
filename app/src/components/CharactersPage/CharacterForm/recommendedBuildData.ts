import { SKILL, type AbilityKey, type CharacterDraft, type SkillName } from "../../../types";

export type ClassBuildPlan = {
  primary: AbilityKey;
  secondary: AbilityKey;
  tertiary: AbilityKey;
  preferredSkills: SkillName[];
  background: string;
  alignment: CharacterDraft["alignment"];
};

const fallbackBuildPlan: ClassBuildPlan = {
  primary: "STR",
  secondary: "CON",
  tertiary: "DEX",
  preferredSkills: [SKILL.ATHLETICS, SKILL.PERCEPTION, SKILL.SURVIVAL, SKILL.INTIMIDATION],
  background: "Soldier",
  alignment: "True Neutral"
};

const classBuildPlans: Record<string, ClassBuildPlan> = {
  Artificer: {
    primary: "INT",
    secondary: "CON",
    tertiary: "DEX",
    preferredSkills: [
      SKILL.ARCANA,
      SKILL.INVESTIGATION,
      SKILL.HISTORY,
      SKILL.PERCEPTION,
      SKILL.INSIGHT
    ],
    background: "Artisan",
    alignment: "Lawful Neutral"
  },
  Barbarian: {
    primary: "STR",
    secondary: "CON",
    tertiary: "DEX",
    preferredSkills: [
      SKILL.ATHLETICS,
      SKILL.SURVIVAL,
      SKILL.INTIMIDATION,
      SKILL.PERCEPTION,
      SKILL.ANIMAL_HANDLING
    ],
    background: "Farmer",
    alignment: "Chaotic Neutral"
  },
  Bard: {
    primary: "CHA",
    secondary: "DEX",
    tertiary: "CON",
    preferredSkills: [
      SKILL.PERFORMANCE,
      SKILL.PERSUASION,
      SKILL.DECEPTION,
      SKILL.INSIGHT,
      SKILL.HISTORY
    ],
    background: "Entertainer",
    alignment: "Neutral Good"
  },
  Cleric: {
    primary: "WIS",
    secondary: "CON",
    tertiary: "STR",
    preferredSkills: [
      SKILL.RELIGION,
      SKILL.INSIGHT,
      SKILL.MEDICINE,
      SKILL.PERSUASION,
      SKILL.HISTORY
    ],
    background: "Acolyte",
    alignment: "Lawful Good"
  },
  Druid: {
    primary: "WIS",
    secondary: "CON",
    tertiary: "DEX",
    preferredSkills: [
      SKILL.NATURE,
      SKILL.ANIMAL_HANDLING,
      SKILL.MEDICINE,
      SKILL.SURVIVAL,
      SKILL.PERCEPTION
    ],
    background: "Hermit",
    alignment: "True Neutral"
  },
  Fighter: {
    primary: "STR",
    secondary: "CON",
    tertiary: "DEX",
    preferredSkills: [
      SKILL.ATHLETICS,
      SKILL.PERCEPTION,
      SKILL.SURVIVAL,
      SKILL.INTIMIDATION,
      SKILL.HISTORY
    ],
    background: "Soldier",
    alignment: "Lawful Neutral"
  },
  Monk: {
    primary: "DEX",
    secondary: "WIS",
    tertiary: "CON",
    preferredSkills: [
      SKILL.ACROBATICS,
      SKILL.STEALTH,
      SKILL.INSIGHT,
      SKILL.ATHLETICS,
      SKILL.PERCEPTION
    ],
    background: "Hermit",
    alignment: "Lawful Good"
  },
  Paladin: {
    primary: "STR",
    secondary: "CHA",
    tertiary: "CON",
    preferredSkills: [
      SKILL.PERSUASION,
      SKILL.ATHLETICS,
      SKILL.INSIGHT,
      SKILL.INTIMIDATION,
      SKILL.RELIGION
    ],
    background: "Noble",
    alignment: "Lawful Good"
  },
  Ranger: {
    primary: "DEX",
    secondary: "WIS",
    tertiary: "CON",
    preferredSkills: [
      SKILL.SURVIVAL,
      SKILL.PERCEPTION,
      SKILL.STEALTH,
      SKILL.NATURE,
      SKILL.ATHLETICS
    ],
    background: "Guide",
    alignment: "Neutral Good"
  },
  Rogue: {
    primary: "DEX",
    secondary: "INT",
    tertiary: "CHA",
    preferredSkills: [
      SKILL.STEALTH,
      SKILL.SLEIGHT_OF_HAND,
      SKILL.DECEPTION,
      SKILL.ACROBATICS,
      SKILL.INVESTIGATION
    ],
    background: "Criminal",
    alignment: "Chaotic Neutral"
  },
  Sorcerer: {
    primary: "CHA",
    secondary: "CON",
    tertiary: "DEX",
    preferredSkills: [
      SKILL.ARCANA,
      SKILL.DECEPTION,
      SKILL.PERSUASION,
      SKILL.INSIGHT,
      SKILL.INTIMIDATION
    ],
    background: "Charlatan",
    alignment: "Chaotic Good"
  },
  Warlock: {
    primary: "CHA",
    secondary: "CON",
    tertiary: "INT",
    preferredSkills: [
      SKILL.ARCANA,
      SKILL.DECEPTION,
      SKILL.INTIMIDATION,
      SKILL.INVESTIGATION,
      SKILL.RELIGION
    ],
    background: "Charlatan",
    alignment: "Neutral Evil"
  },
  Wizard: {
    primary: "INT",
    secondary: "CON",
    tertiary: "DEX",
    preferredSkills: [
      SKILL.ARCANA,
      SKILL.HISTORY,
      SKILL.INVESTIGATION,
      SKILL.INSIGHT,
      SKILL.RELIGION
    ],
    background: "Sage",
    alignment: "Lawful Neutral"
  }
};

export const speciesAbilityBonuses: Partial<Record<string, Partial<Record<AbilityKey, number>>>> =
  {};

export const speciesSkillAffinity: Partial<Record<string, SkillName[]>> = {};

export function getBuildPlan(className: string): ClassBuildPlan {
  return classBuildPlans[className] ?? fallbackBuildPlan;
}
