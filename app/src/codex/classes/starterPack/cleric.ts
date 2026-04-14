import {
  ARMOR_PROFICIENCY,
  SAVING_THROW_PROFICIENCY,
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

export const clericStarterPack: ClassStarterPack = {
  primaryAbility: "WIS",
  hitPointDieLabel: "D8 per Cleric level",
  savingThrowProficiencies: [
    SAVING_THROW_PROFICIENCY.WIS,
    SAVING_THROW_PROFICIENCY.CHA
  ],
  grantedSkillProficiencies: [],
  skillProficiencies: [
    SKILL.HISTORY,
    SKILL.INSIGHT,
    SKILL.MEDICINE,
    SKILL.PERSUASION,
    SKILL.RELIGION
  ],
  skillProficiencySelectionCount: 2,
  recommendedSkillProficiencies: [SKILL.INSIGHT, SKILL.RELIGION],
  grantedToolProficiencies: [],
  toolProficiencyChoices: [],
  toolProficiencyChoiceCount: 0,
  recommendedToolProficiencies: [],
  weaponProficiencies: [WEAPON_PROFICIENCY.SIMPLE],
  armorTrainingProficiencies: [
    ARMOR_PROFICIENCY.LIGHT,
    ARMOR_PROFICIENCY.MEDIUM,
    ARMOR_PROFICIENCY.SHIELD
  ],
  startingEquipment: [
    starterPackChoice(
      starterPackItem("srd-2024_chain-shirt", "Chain Shirt"),
      starterPackItem("srd-2024_shield", "Shield"),
      starterPackItem("srd-2024_mace", "Mace"),
      starterPackItem("srd-2024_holy-symbol-amulet", "Holy Symbol"),
      starterPackPack("srd-2024_priests-pack", "Priest's Pack"),
      starterPackCurrency(7, CURRENCY_TYPE.GP)
    ),
    starterPackChoice(starterPackCurrency(110, CURRENCY_TYPE.GP))
  ],
  recommendedStartingEquipmentIndex: 0,
  recommendedAbilityScores: {
    STR: 13,
    DEX: 8,
    CON: 14,
    INT: 10,
    WIS: 15,
    CHA: 12
  }
};
