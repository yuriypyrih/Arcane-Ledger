import type { AbilityKey, CharacterDraft } from "../../../types";

export type ClassBuildPlan = {
  primary: AbilityKey;
  secondary: AbilityKey;
  tertiary: AbilityKey;
  hitDie: number;
  preferredSkills: string[];
  preferredEquipment: string[];
  background: string;
  alignment: CharacterDraft["alignment"];
};

const fallbackBuildPlan: ClassBuildPlan = {
  primary: "STR",
  secondary: "CON",
  tertiary: "DEX",
  hitDie: 10,
  preferredSkills: ["Athletics", "Perception", "Survival", "Intimidation"],
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
    preferredSkills: ["Arcana", "Investigation", "History", "Perception", "Insight"],
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
    preferredSkills: ["Athletics", "Survival", "Intimidation", "Perception", "Animal Handling"],
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
    preferredSkills: ["Performance", "Persuasion", "Deception", "Insight", "History"],
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
    preferredSkills: ["Religion", "Insight", "Medicine", "Persuasion", "History"],
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
    preferredSkills: ["Nature", "Animal Handling", "Medicine", "Survival", "Perception"],
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
    preferredSkills: ["Athletics", "Perception", "Survival", "Intimidation", "History"],
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
    preferredSkills: ["Acrobatics", "Stealth", "Insight", "Athletics", "Perception"],
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
    preferredSkills: ["Persuasion", "Athletics", "Insight", "Intimidation", "Religion"],
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
    preferredSkills: ["Survival", "Perception", "Stealth", "Nature", "Athletics"],
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
    preferredSkills: ["Stealth", "Sleight of Hand", "Deception", "Acrobatics", "Investigation"],
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
    preferredSkills: ["Arcana", "Deception", "Persuasion", "Insight", "Intimidation"],
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
    preferredSkills: ["Arcana", "Deception", "Intimidation", "Investigation", "Religion"],
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
    preferredSkills: ["Arcana", "History", "Investigation", "Insight", "Religion"],
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

export const speciesSkillAffinity: Partial<Record<string, string[]>> = {
  Dragonborn: ["Intimidation", "Persuasion", "Athletics"],
  Dwarf: ["History", "Insight", "Survival"],
  Elf: ["Perception", "Stealth", "Arcana"],
  Gnome: ["Arcana", "Investigation", "History"],
  "Half-Elf": ["Persuasion", "Insight", "Deception"],
  "Half-Orc": ["Athletics", "Intimidation", "Survival"],
  Halfling: ["Stealth", "Perception", "Persuasion"],
  Human: ["Insight", "Perception", "Persuasion"],
  Tiefling: ["Deception", "Arcana", "Intimidation"]
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
