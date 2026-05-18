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
  starterPackPack
} from "./helpers";
import { starterPackArtisanTools } from "./toolItems";
import type { ClassStarterPack } from "./type";

export const artificerStarterPack: ClassStarterPack = {
  primaryAbility: "INT",
  hitPointDieLabel: "D8 per Artificer level",
  savingThrowProficiencies: [
    SAVING_THROW_PROFICIENCY.CON,
    SAVING_THROW_PROFICIENCY.INT
  ],
  grantedSkillProficiencies: [],
  skillProficiencies: [
    SKILL.ARCANA,
    SKILL.HISTORY,
    SKILL.INVESTIGATION,
    SKILL.MEDICINE,
    SKILL.NATURE,
    SKILL.PERCEPTION,
    SKILL.SLEIGHT_OF_HAND
  ],
  skillProficiencySelectionCount: 2,
  recommendedSkillProficiencies: [SKILL.ARCANA, SKILL.INVESTIGATION],
  grantedToolProficiencies: [
    TOOL_PROFICIENCY.THIEVES_TOOLKIT,
    TOOL_PROFICIENCY.TINKERS_TOOLS
  ],
  toolProficiencyChoices: starterPackArtisanTools,
  toolProficiencyChoiceCount: 1,
  recommendedToolProficiencies: [TOOL_PROFICIENCY.SMITHS_TOOLKIT],
  weaponProficiencies: [WEAPON_PROFICIENCY.SIMPLE],
  armorTrainingProficiencies: [
    ARMOR_PROFICIENCY.LIGHT,
    ARMOR_PROFICIENCY.MEDIUM,
    ARMOR_PROFICIENCY.SHIELD
  ],
  startingEquipment: [
    starterPackChoice(
      starterPackItem("srd-2024_studded-leather-armor", "Studded Leather Armor"),
      starterPackItem("srd-2024_dagger", "Dagger"),
      starterPackItem("srd-2024_thieves-tools", "Thieves' Tools"),
      starterPackItem("srd-2024_tinkers-tools", "Tinker's Tools"),
      starterPackPack("srd-2024_dungeoneers-pack", "Dungeoneer's Pack"),
      starterPackCurrency(16, CURRENCY_TYPE.GP)
    ),
    starterPackChoice(starterPackCurrency(150, CURRENCY_TYPE.GP))
  ],
  recommendedStartingEquipmentIndex: 0,
  recommendedAbilityScores: {
    STR: 8,
    DEX: 13,
    CON: 14,
    INT: 15,
    WIS: 12,
    CHA: 10
  }
};
