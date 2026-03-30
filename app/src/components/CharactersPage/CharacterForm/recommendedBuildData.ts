import { SKILL, type AbilityKey, type CharacterDraft, type SkillName } from "../../../types";

export type ClassBuildPlan = {
  primary: AbilityKey;
  secondary: AbilityKey;
  tertiary: AbilityKey;
  hitDie: number;
  preferredSkills: SkillName[];
  preferredEquipment: string[];
  background: string;
  alignment: CharacterDraft["alignment"];
};

const fallbackBuildPlan: ClassBuildPlan = {
  primary: "STR",
  secondary: "CON",
  tertiary: "DEX",
  hitDie: 10,
  preferredSkills: [SKILL.ATHLETICS, SKILL.PERCEPTION, SKILL.SURVIVAL, SKILL.INTIMIDATION],
  preferredEquipment: [
    "Longsword",
    "Shield",
    "Chain Mail",
    "Backpack",
    "Rations (1 day)",
    "Torch"
  ],
  background: "Soldier",
  alignment: "True Neutral"
};

const classBuildPlans: Record<string, ClassBuildPlan> = {
  Artificer: {
    primary: "INT",
    secondary: "CON",
    tertiary: "DEX",
    hitDie: 8,
    preferredSkills: [
      SKILL.ARCANA,
      SKILL.INVESTIGATION,
      SKILL.HISTORY,
      SKILL.PERCEPTION,
      SKILL.INSIGHT
    ],
    preferredEquipment: [
      "Spellbook",
      "Healer's Kit",
      "Leather Armor",
      "Dagger",
      "Backpack",
      "Explorer's Pack"
    ],
    background: "Guild Artisan / Merchant",
    alignment: "Lawful Neutral"
  },
  Barbarian: {
    primary: "STR",
    secondary: "CON",
    tertiary: "DEX",
    hitDie: 12,
    preferredSkills: [
      SKILL.ATHLETICS,
      SKILL.SURVIVAL,
      SKILL.INTIMIDATION,
      SKILL.PERCEPTION,
      SKILL.ANIMAL_HANDLING
    ],
    preferredEquipment: [
      "Longsword",
      "Shield",
      "Backpack",
      "Rations (1 day)",
      "Torch",
      "Rope (50 ft.)"
    ],
    background: "Outlander",
    alignment: "Chaotic Neutral"
  },
  Bard: {
    primary: "CHA",
    secondary: "DEX",
    tertiary: "CON",
    hitDie: 8,
    preferredSkills: [
      SKILL.PERFORMANCE,
      SKILL.PERSUASION,
      SKILL.DECEPTION,
      SKILL.INSIGHT,
      SKILL.HISTORY
    ],
    preferredEquipment: [
      "Shortsword",
      "Leather Armor",
      "Backpack",
      "Waterskin",
      "Torch",
      "Spellbook"
    ],
    background: "Entertainer",
    alignment: "Neutral Good"
  },
  Cleric: {
    primary: "WIS",
    secondary: "CON",
    tertiary: "STR",
    hitDie: 8,
    preferredSkills: [
      SKILL.RELIGION,
      SKILL.INSIGHT,
      SKILL.MEDICINE,
      SKILL.PERSUASION,
      SKILL.HISTORY
    ],
    preferredEquipment: [
      "Chain Mail",
      "Shield",
      "Longsword",
      "Healer's Kit",
      "Backpack",
      "Torch"
    ],
    background: "Acolyte",
    alignment: "Lawful Good"
  },
  Druid: {
    primary: "WIS",
    secondary: "CON",
    tertiary: "DEX",
    hitDie: 8,
    preferredSkills: [
      SKILL.NATURE,
      SKILL.ANIMAL_HANDLING,
      SKILL.MEDICINE,
      SKILL.SURVIVAL,
      SKILL.PERCEPTION
    ],
    preferredEquipment: [
      "Leather Armor",
      "Shield",
      "Dagger",
      "Healer's Kit",
      "Waterskin",
      "Rations (1 day)"
    ],
    background: "Hermit",
    alignment: "True Neutral"
  },
  Fighter: {
    primary: "STR",
    secondary: "CON",
    tertiary: "DEX",
    hitDie: 10,
    preferredSkills: [
      SKILL.ATHLETICS,
      SKILL.PERCEPTION,
      SKILL.SURVIVAL,
      SKILL.INTIMIDATION,
      SKILL.HISTORY
    ],
    preferredEquipment: [
      "Chain Mail",
      "Shield",
      "Longsword",
      "Shortsword",
      "Backpack",
      "Rope (50 ft.)"
    ],
    background: "Soldier",
    alignment: "Lawful Neutral"
  },
  Monk: {
    primary: "DEX",
    secondary: "WIS",
    tertiary: "CON",
    hitDie: 8,
    preferredSkills: [
      SKILL.ACROBATICS,
      SKILL.STEALTH,
      SKILL.INSIGHT,
      SKILL.ATHLETICS,
      SKILL.PERCEPTION
    ],
    preferredEquipment: [
      "Shortsword",
      "Dagger",
      "Backpack",
      "Rations (1 day)",
      "Waterskin",
      "Torch"
    ],
    background: "Hermit",
    alignment: "Lawful Good"
  },
  Paladin: {
    primary: "STR",
    secondary: "CHA",
    tertiary: "CON",
    hitDie: 10,
    preferredSkills: [
      SKILL.PERSUASION,
      SKILL.ATHLETICS,
      SKILL.INSIGHT,
      SKILL.INTIMIDATION,
      SKILL.RELIGION
    ],
    preferredEquipment: [
      "Chain Mail",
      "Shield",
      "Longsword",
      "Backpack",
      "Torch",
      "Rations (1 day)"
    ],
    background: "Noble",
    alignment: "Lawful Good"
  },
  Ranger: {
    primary: "DEX",
    secondary: "WIS",
    tertiary: "CON",
    hitDie: 10,
    preferredSkills: [
      SKILL.SURVIVAL,
      SKILL.PERCEPTION,
      SKILL.STEALTH,
      SKILL.NATURE,
      SKILL.ATHLETICS
    ],
    preferredEquipment: [
      "Leather Armor",
      "Longsword",
      "Shortsword",
      "Backpack",
      "Rope (50 ft.)",
      "Rations (1 day)"
    ],
    background: "Outlander",
    alignment: "Neutral Good"
  },
  Rogue: {
    primary: "DEX",
    secondary: "INT",
    tertiary: "CHA",
    hitDie: 8,
    preferredSkills: [
      SKILL.STEALTH,
      SKILL.SLEIGHT_OF_HAND,
      SKILL.DECEPTION,
      SKILL.ACROBATICS,
      SKILL.INVESTIGATION
    ],
    preferredEquipment: [
      "Leather Armor",
      "Dagger",
      "Shortsword",
      "Thieves' Tools",
      "Backpack",
      "Torch"
    ],
    background: "Criminal / Spy",
    alignment: "Chaotic Neutral"
  },
  Sorcerer: {
    primary: "CHA",
    secondary: "CON",
    tertiary: "DEX",
    hitDie: 6,
    preferredSkills: [
      SKILL.ARCANA,
      SKILL.DECEPTION,
      SKILL.PERSUASION,
      SKILL.INSIGHT,
      SKILL.INTIMIDATION
    ],
    preferredEquipment: [
      "Spellbook",
      "Dagger",
      "Backpack",
      "Waterskin",
      "Torch",
      "Rations (1 day)"
    ],
    background: "Charlatan",
    alignment: "Chaotic Good"
  },
  Warlock: {
    primary: "CHA",
    secondary: "CON",
    tertiary: "INT",
    hitDie: 8,
    preferredSkills: [
      SKILL.ARCANA,
      SKILL.DECEPTION,
      SKILL.INTIMIDATION,
      SKILL.INVESTIGATION,
      SKILL.RELIGION
    ],
    preferredEquipment: [
      "Spellbook",
      "Dagger",
      "Leather Armor",
      "Backpack",
      "Torch",
      "Rations (1 day)"
    ],
    background: "Charlatan",
    alignment: "Neutral Evil"
  },
  Wizard: {
    primary: "INT",
    secondary: "CON",
    tertiary: "DEX",
    hitDie: 6,
    preferredSkills: [
      SKILL.ARCANA,
      SKILL.HISTORY,
      SKILL.INVESTIGATION,
      SKILL.INSIGHT,
      SKILL.RELIGION
    ],
    preferredEquipment: [
      "Spellbook",
      "Dagger",
      "Backpack",
      "Waterskin",
      "Torch",
      "Rations (1 day)"
    ],
    background: "Sage",
    alignment: "Lawful Neutral"
  }
};

export const speciesAbilityBonuses: Partial<Record<string, Partial<Record<AbilityKey, number>>>> = {
  Dragonborn: { STR: 2, CHA: 1 },
  Dwarf: { CON: 2, WIS: 1 },
  Elf: { DEX: 2, INT: 1 },
  Gnome: { INT: 2, DEX: 1 },
  "Half-Elf": { CHA: 2, DEX: 1, CON: 1 },
  "Half-Orc": { STR: 2, CON: 1 },
  Halfling: { DEX: 2, CHA: 1 },
  Human: { STR: 1, DEX: 1, CON: 1, INT: 1, WIS: 1, CHA: 1 },
  Tiefling: { CHA: 2, INT: 1 }
};

export const speciesSkillAffinity: Partial<Record<string, SkillName[]>> = {
  Dragonborn: [SKILL.INTIMIDATION, SKILL.PERSUASION, SKILL.ATHLETICS],
  Dwarf: [SKILL.HISTORY, SKILL.INSIGHT, SKILL.SURVIVAL],
  Elf: [SKILL.PERCEPTION, SKILL.STEALTH, SKILL.ARCANA],
  Gnome: [SKILL.ARCANA, SKILL.INVESTIGATION, SKILL.HISTORY],
  "Half-Elf": [SKILL.PERSUASION, SKILL.INSIGHT, SKILL.DECEPTION],
  "Half-Orc": [SKILL.ATHLETICS, SKILL.INTIMIDATION, SKILL.SURVIVAL],
  Halfling: [SKILL.STEALTH, SKILL.PERCEPTION, SKILL.PERSUASION],
  Human: [SKILL.INSIGHT, SKILL.PERCEPTION, SKILL.PERSUASION],
  Tiefling: [SKILL.DECEPTION, SKILL.ARCANA, SKILL.INTIMIDATION]
};

export const speciesEquipmentAffinity: Partial<Record<string, string[]>> = {
  Dragonborn: ["Shield", "Longsword"],
  Dwarf: ["Chain Mail", "Shield"],
  Elf: ["Leather Armor", "Longsword"],
  Gnome: ["Healer's Kit", "Backpack"],
  "Half-Elf": ["Leather Armor", "Shortsword"],
  "Half-Orc": ["Shield", "Longsword"],
  Halfling: ["Dagger", "Backpack"],
  Human: ["Backpack", "Rope (50 ft.)"],
  Tiefling: ["Spellbook", "Dagger"]
};

export function getBuildPlan(className: string): ClassBuildPlan {
  return classBuildPlans[className] ?? fallbackBuildPlan;
}
