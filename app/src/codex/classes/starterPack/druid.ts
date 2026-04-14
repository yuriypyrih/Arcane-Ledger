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
import type { ClassStarterPack } from "./type";

export const druidStarterPack: ClassStarterPack = {
  primaryAbility: "WIS",
  hitPointDieLabel: "D8 per Druid level",
  savingThrowProficiencies: [
    SAVING_THROW_PROFICIENCY.INT,
    SAVING_THROW_PROFICIENCY.WIS
  ],
  grantedSkillProficiencies: [],
  skillProficiencies: [
    SKILL.ARCANA,
    SKILL.ANIMAL_HANDLING,
    SKILL.INSIGHT,
    SKILL.MEDICINE,
    SKILL.NATURE,
    SKILL.PERCEPTION,
    SKILL.RELIGION,
    SKILL.SURVIVAL
  ],
  skillProficiencySelectionCount: 2,
  recommendedSkillProficiencies: [SKILL.NATURE, SKILL.PERCEPTION],
  grantedToolProficiencies: [TOOL_PROFICIENCY.HERBALISM_KIT],
  toolProficiencyChoices: [],
  toolProficiencyChoiceCount: 0,
  recommendedToolProficiencies: [],
  weaponProficiencies: [WEAPON_PROFICIENCY.SIMPLE],
  armorTrainingProficiencies: [ARMOR_PROFICIENCY.LIGHT, ARMOR_PROFICIENCY.SHIELD],
  startingEquipment: [
    starterPackChoice(
      starterPackItem("srd-2024_leather-armor", "Leather Armor"),
      starterPackItem("srd-2024_shield", "Shield"),
      starterPackItem("srd-2024_sickle", "Sickle"),
      starterPackItem("srd-2024_quarterstaff", "Druidic Focus (Quarterstaff)"),
      starterPackPack("srd-2024_explorers-pack", "Explorer's Pack"),
      starterPackItem("srd-2024_herbalism-kit", "Herbalism Kit"),
      starterPackCurrency(9, CURRENCY_TYPE.GP)
    ),
    starterPackChoice(starterPackCurrency(50, CURRENCY_TYPE.GP))
  ],
  recommendedStartingEquipmentIndex: 0,
  recommendedAbilityScores: {
    STR: 10,
    DEX: 13,
    CON: 14,
    INT: 12,
    WIS: 15,
    CHA: 8
  }
};
