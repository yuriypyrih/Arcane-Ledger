import {
  artificerFeatures,
  bardFeatures,
  barbarianFeatures,
  clericFeatures,
  druidFeatures,
  fighterFeatures,
  monkFeatures,
  paladinFeatures,
  rangerFeatures,
  rogueFeatures,
  sorcererFeatures,
  warlockFeatures,
  wizardFeatures
} from "../classes";
import { barbarianStarterPack } from "../classes/starterPack";
import {
  CLASS_TYPES,
  DICE_TYPES,
  ENTRY_CATEGORIES,
  GENERAL_PROFICIENCIES
} from "./enums";
import type { ClassEntry } from "./types";

export const classEntries: ClassEntry[] = [
  {
    id: "class-artificer",
    name: "Artificer",
    category: ENTRY_CATEGORIES.CLASSES,
    tags: [CLASS_TYPES.ARCANE, CLASS_TYPES.SUPPORT],
    hitPointDie: DICE_TYPES.DICE_TYPE_D8,
    innateProficiencies: [
      GENERAL_PROFICIENCIES.SIMPLE_WEAPONS,
      GENERAL_PROFICIENCIES.LIGHT_ARMOR,
      GENERAL_PROFICIENCIES.MEDIUM_ARMOR,
      GENERAL_PROFICIENCIES.SHIELDS
    ],
    features: artificerFeatures,
    summary:
      "A magical inventor who fuses engineering and spellwork into adaptable battlefield tools."
  },
  {
    id: "class-barbarian",
    name: "Barbarian",
    category: ENTRY_CATEGORIES.CLASSES,
    tags: [CLASS_TYPES.MARTIAL],
    hitPointDie: DICE_TYPES.DICE_TYPE_D12,
    innateProficiencies: [
      GENERAL_PROFICIENCIES.SIMPLE_WEAPONS,
      GENERAL_PROFICIENCIES.MARTIAL_WEAPONS,
      GENERAL_PROFICIENCIES.LIGHT_ARMOR,
      GENERAL_PROFICIENCIES.MEDIUM_ARMOR,
      GENERAL_PROFICIENCIES.SHIELDS
    ],
    features: barbarianFeatures,
    starterPack: barbarianStarterPack,
    summary: "A relentless frontline warrior who channels primal rage into unstoppable offense."
  },
  {
    id: "class-bard",
    name: "Bard",
    category: ENTRY_CATEGORIES.CLASSES,
    tags: [CLASS_TYPES.ARCANE, CLASS_TYPES.SUPPORT, CLASS_TYPES.SKILL_EXPERT],
    hitPointDie: DICE_TYPES.DICE_TYPE_D8,
    innateProficiencies: [
      GENERAL_PROFICIENCIES.SIMPLE_WEAPONS,
      GENERAL_PROFICIENCIES.MARTIAL_WEAPONS,
      GENERAL_PROFICIENCIES.LIGHT_ARMOR
    ],
    features: bardFeatures,
    summary: "A versatile performer whose magic and skill mastery strengthen every party role."
  },
  {
    id: "class-cleric",
    name: "Cleric",
    category: ENTRY_CATEGORIES.CLASSES,
    tags: [CLASS_TYPES.DIVINE, CLASS_TYPES.SUPPORT],
    hitPointDie: DICE_TYPES.DICE_TYPE_D8,
    innateProficiencies: [
      GENERAL_PROFICIENCIES.SIMPLE_WEAPONS,
      GENERAL_PROFICIENCIES.LIGHT_ARMOR,
      GENERAL_PROFICIENCIES.MEDIUM_ARMOR,
      GENERAL_PROFICIENCIES.SHIELDS
    ],
    features: clericFeatures,
    summary: "A divine champion who balances healing, protection, and holy offense."
  },
  {
    id: "class-druid",
    name: "Druid",
    category: ENTRY_CATEGORIES.CLASSES,
    tags: [CLASS_TYPES.PRIMAL, CLASS_TYPES.SUPPORT],
    hitPointDie: DICE_TYPES.DICE_TYPE_D8,
    innateProficiencies: [
      GENERAL_PROFICIENCIES.SIMPLE_WEAPONS,
      GENERAL_PROFICIENCIES.LIGHT_ARMOR,
      GENERAL_PROFICIENCIES.MEDIUM_ARMOR,
      GENERAL_PROFICIENCIES.SHIELDS
    ],
    features: druidFeatures,
    summary: "A primal spellcaster who commands nature, shapeshifts, and controls the battlefield."
  },
  {
    id: "class-fighter",
    name: "Fighter",
    category: ENTRY_CATEGORIES.CLASSES,
    tags: [CLASS_TYPES.MARTIAL],
    hitPointDie: DICE_TYPES.DICE_TYPE_D10,
    innateProficiencies: [
      GENERAL_PROFICIENCIES.SIMPLE_WEAPONS,
      GENERAL_PROFICIENCIES.MARTIAL_WEAPONS,
      GENERAL_PROFICIENCIES.LIGHT_ARMOR,
      GENERAL_PROFICIENCIES.MEDIUM_ARMOR,
      GENERAL_PROFICIENCIES.HEAVY_ARMOR,
      GENERAL_PROFICIENCIES.SHIELDS
    ],
    features: fighterFeatures,
    summary: "A tactical combat specialist with unmatched weapon and armor discipline."
  },
  {
    id: "class-monk",
    name: "Monk",
    category: ENTRY_CATEGORIES.CLASSES,
    tags: [CLASS_TYPES.MARTIAL],
    hitPointDie: DICE_TYPES.DICE_TYPE_D8,
    innateProficiencies: [GENERAL_PROFICIENCIES.SIMPLE_WEAPONS],
    features: monkFeatures,
    summary: "A disciplined martial artist who blends mobility, precision, and ki techniques."
  },
  {
    id: "class-paladin",
    name: "Paladin",
    category: ENTRY_CATEGORIES.CLASSES,
    tags: [CLASS_TYPES.MARTIAL, CLASS_TYPES.DIVINE, CLASS_TYPES.SUPPORT],
    hitPointDie: DICE_TYPES.DICE_TYPE_D10,
    innateProficiencies: [
      GENERAL_PROFICIENCIES.SIMPLE_WEAPONS,
      GENERAL_PROFICIENCIES.MARTIAL_WEAPONS,
      GENERAL_PROFICIENCIES.LIGHT_ARMOR,
      GENERAL_PROFICIENCIES.MEDIUM_ARMOR,
      GENERAL_PROFICIENCIES.HEAVY_ARMOR,
      GENERAL_PROFICIENCIES.SHIELDS
    ],
    features: paladinFeatures,
    summary: "A holy knight who combines durable frontline defense with radiant burst damage."
  },
  {
    id: "class-ranger",
    name: "Ranger",
    category: ENTRY_CATEGORIES.CLASSES,
    tags: [CLASS_TYPES.MARTIAL, CLASS_TYPES.PRIMAL],
    hitPointDie: DICE_TYPES.DICE_TYPE_D10,
    innateProficiencies: [
      GENERAL_PROFICIENCIES.SIMPLE_WEAPONS,
      GENERAL_PROFICIENCIES.MARTIAL_WEAPONS,
      GENERAL_PROFICIENCIES.LIGHT_ARMOR,
      GENERAL_PROFICIENCIES.MEDIUM_ARMOR,
      GENERAL_PROFICIENCIES.SHIELDS
    ],
    features: rangerFeatures,
    summary: "A wilderness hunter who excels at tracking foes and controlling range."
  },
  {
    id: "class-rogue",
    name: "Rogue",
    category: ENTRY_CATEGORIES.CLASSES,
    tags: [CLASS_TYPES.SKILL_EXPERT, CLASS_TYPES.MARTIAL],
    hitPointDie: DICE_TYPES.DICE_TYPE_D8,
    innateProficiencies: [
      GENERAL_PROFICIENCIES.SIMPLE_WEAPONS,
      GENERAL_PROFICIENCIES.MARTIAL_WEAPONS,
      GENERAL_PROFICIENCIES.LIGHT_ARMOR
    ],
    features: rogueFeatures,
    summary: "A precision striker and expert operative built around stealth, timing, and utility."
  },
  {
    id: "class-sorcerer",
    name: "Sorcerer",
    category: ENTRY_CATEGORIES.CLASSES,
    tags: [CLASS_TYPES.ARCANE],
    hitPointDie: DICE_TYPES.DICE_TYPE_D6,
    innateProficiencies: [GENERAL_PROFICIENCIES.SIMPLE_WEAPONS],
    features: sorcererFeatures,
    summary: "An innate arcane caster whose bloodline power fuels explosive spell output."
  },
  {
    id: "class-warlock",
    name: "Warlock",
    category: ENTRY_CATEGORIES.CLASSES,
    tags: [CLASS_TYPES.ARCANE],
    hitPointDie: DICE_TYPES.DICE_TYPE_D8,
    innateProficiencies: [GENERAL_PROFICIENCIES.SIMPLE_WEAPONS, GENERAL_PROFICIENCIES.LIGHT_ARMOR],
    features: warlockFeatures,
    summary: "A pact-bound caster with focused spell slots and potent invocations."
  },
  {
    id: "class-wizard",
    name: "Wizard",
    category: ENTRY_CATEGORIES.CLASSES,
    tags: [CLASS_TYPES.ARCANE],
    hitPointDie: DICE_TYPES.DICE_TYPE_D6,
    innateProficiencies: [GENERAL_PROFICIENCIES.SIMPLE_WEAPONS],
    features: wizardFeatures,
    summary:
      "A scholar of spellcraft who prepares flexible arcane solutions for almost any challenge."
  }
];
