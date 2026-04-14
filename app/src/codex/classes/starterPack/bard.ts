import {
  ARMOR_PROFICIENCY,
  SAVING_THROW_PROFICIENCY,
  TOOL_PROFICIENCY,
  WEAPON_PROFICIENCY
} from "../../../types/proficiencies";
import { SKILL } from "../../../types/skills";
import { CURRENCY_TYPE } from "../../entries/enums";
import {
  starterPackChoice,
  starterPackCurrency,
  starterPackItem,
  starterPackPack,
  starterPackSelectedTool,
  starterPackSelection
} from "./helpers";
import { starterPackMusicalInstrumentTools } from "./toolItems";
import type { ClassStarterPack } from "./type";

const recommendedBardTools = [
  TOOL_PROFICIENCY.MUSICAL_INSTRUMENT_LUTE,
  TOOL_PROFICIENCY.MUSICAL_INSTRUMENT_FLUTE,
  TOOL_PROFICIENCY.MUSICAL_INSTRUMENT_DRUM
];

export const bardStarterPack: ClassStarterPack = {
  primaryAbility: "CHA",
  hitPointDieLabel: "D8 per Bard level",
  savingThrowProficiencies: [
    SAVING_THROW_PROFICIENCY.DEX,
    SAVING_THROW_PROFICIENCY.CHA
  ],
  grantedSkillProficiencies: [],
  skillProficiencies: [
    SKILL.ACROBATICS,
    SKILL.ANIMAL_HANDLING,
    SKILL.ARCANA,
    SKILL.ATHLETICS,
    SKILL.DECEPTION,
    SKILL.HISTORY,
    SKILL.INSIGHT,
    SKILL.INTIMIDATION,
    SKILL.INVESTIGATION,
    SKILL.MEDICINE,
    SKILL.NATURE,
    SKILL.PERCEPTION,
    SKILL.PERFORMANCE,
    SKILL.PERSUASION,
    SKILL.RELIGION,
    SKILL.SLEIGHT_OF_HAND,
    SKILL.STEALTH,
    SKILL.SURVIVAL
  ],
  skillProficiencySelectionCount: 3,
  recommendedSkillProficiencies: [SKILL.PERFORMANCE, SKILL.PERSUASION, SKILL.INSIGHT],
  grantedToolProficiencies: [],
  toolProficiencyChoices: starterPackMusicalInstrumentTools,
  toolProficiencyChoiceCount: 3,
  recommendedToolProficiencies: recommendedBardTools,
  weaponProficiencies: [WEAPON_PROFICIENCY.SIMPLE],
  armorTrainingProficiencies: [ARMOR_PROFICIENCY.LIGHT],
  startingEquipmentSelections: [
    starterPackSelection("bard-starting-instrument", "Starting instrument item", {
      description: "Choose which of your selected instrument proficiencies also starts in your inventory.",
      filter: "musical-instrument",
      recommendedValue: TOOL_PROFICIENCY.MUSICAL_INSTRUMENT_LUTE
    })
  ],
  startingEquipment: [
    starterPackChoice(
      starterPackItem("srd-2024_leather-armor", "Leather Armor"),
      starterPackItem("srd-2024_dagger", "Dagger", 2),
      starterPackSelectedTool("Musical Instrument of your choice", {
        selectionId: "bard-starting-instrument"
      }),
      starterPackPack("srd-2024_entertainers-pack", "Entertainer's Pack"),
      starterPackCurrency(19, CURRENCY_TYPE.GP)
    ),
    starterPackChoice(starterPackCurrency(90, CURRENCY_TYPE.GP))
  ],
  recommendedStartingEquipmentIndex: 0,
  recommendedAbilityScores: {
    STR: 8,
    DEX: 14,
    CON: 13,
    INT: 10,
    WIS: 12,
    CHA: 15
  }
};
