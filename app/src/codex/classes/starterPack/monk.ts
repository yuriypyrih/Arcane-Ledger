import {
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
  starterPackSelectedTool
} from "./helpers";
import {
  starterPackArtisanTools,
  starterPackMusicalInstrumentTools
} from "./toolItems";
import type { ClassStarterPack } from "./type";

export const monkStarterPack: ClassStarterPack = {
  primaryAbility: "DEX",
  primaryAbilityLabel: "Dexterity and Wisdom",
  hitPointDieLabel: "D8 per Monk level",
  savingThrowProficiencies: [
    SAVING_THROW_PROFICIENCY.STR,
    SAVING_THROW_PROFICIENCY.DEX
  ],
  grantedSkillProficiencies: [],
  skillProficiencies: [
    SKILL.ACROBATICS,
    SKILL.ATHLETICS,
    SKILL.HISTORY,
    SKILL.INSIGHT,
    SKILL.RELIGION,
    SKILL.STEALTH
  ],
  skillProficiencySelectionCount: 2,
  recommendedSkillProficiencies: [SKILL.ACROBATICS, SKILL.INSIGHT],
  grantedToolProficiencies: [],
  toolProficiencyChoices: [
    ...starterPackArtisanTools,
    ...starterPackMusicalInstrumentTools
  ],
  toolProficiencyChoiceCount: 1,
  recommendedToolProficiencies: [TOOL_PROFICIENCY.CARPENTERS_TOOLS],
  weaponProficiencies: [
    WEAPON_PROFICIENCY.SIMPLE,
    WEAPON_PROFICIENCY.MARTIAL_MELEE_LIGHT
  ],
  armorTrainingProficiencies: [],
  startingEquipment: [
    starterPackChoice(
      starterPackItem("srd-2024_spear", "Spear"),
      starterPackItem("srd-2024_dagger", "Dagger", 5),
      starterPackSelectedTool("Chosen artisan's tools or musical instrument"),
      starterPackPack("srd-2024_explorers-pack", "Explorer's Pack"),
      starterPackCurrency(11, CURRENCY_TYPE.GP)
    ),
    starterPackChoice(starterPackCurrency(50, CURRENCY_TYPE.GP))
  ],
  recommendedStartingEquipmentIndex: 0,
  recommendedAbilityScores: {
    STR: 12,
    DEX: 15,
    CON: 13,
    INT: 10,
    WIS: 14,
    CHA: 8
  }
};
