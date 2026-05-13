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

export const paladinStarterPack: ClassStarterPack = {
  primaryAbility: "STR",
  primaryAbilityLabel: "STR, CHA",
  hitPointDieLabel: "D10 per Paladin level",
  savingThrowProficiencies: [
    SAVING_THROW_PROFICIENCY.WIS,
    SAVING_THROW_PROFICIENCY.CHA
  ],
  grantedSkillProficiencies: [],
  skillProficiencies: [
    SKILL.ATHLETICS,
    SKILL.INSIGHT,
    SKILL.INTIMIDATION,
    SKILL.MEDICINE,
    SKILL.PERSUASION,
    SKILL.RELIGION
  ],
  skillProficiencySelectionCount: 2,
  recommendedSkillProficiencies: [SKILL.ATHLETICS, SKILL.PERSUASION],
  grantedToolProficiencies: [],
  toolProficiencyChoices: [],
  toolProficiencyChoiceCount: 0,
  recommendedToolProficiencies: [],
  weaponProficiencies: [WEAPON_PROFICIENCY.SIMPLE, WEAPON_PROFICIENCY.MARTIAL],
  armorTrainingProficiencies: [
    ARMOR_PROFICIENCY.LIGHT,
    ARMOR_PROFICIENCY.MEDIUM,
    ARMOR_PROFICIENCY.HEAVY,
    ARMOR_PROFICIENCY.SHIELD
  ],
  weaponMasteryCount: 2,
  startingEquipment: [
    starterPackChoice(
      starterPackItem("srd-2024_chain-mail", "Chain Mail"),
      starterPackItem("srd-2024_shield", "Shield"),
      starterPackItem("srd-2024_longsword", "Longsword"),
      starterPackItem("srd-2024_javelin", "Javelin", 6),
      starterPackItem("srd-2024_holy-symbol-amulet", "Holy Symbol"),
      starterPackPack("srd-2024_priests-pack", "Priest's Pack"),
      starterPackCurrency(9, CURRENCY_TYPE.GP)
    ),
    starterPackChoice(starterPackCurrency(150, CURRENCY_TYPE.GP))
  ],
  recommendedStartingEquipmentIndex: 0,
  recommendedAbilityScores: {
    STR: 15,
    DEX: 10,
    CON: 13,
    INT: 8,
    WIS: 12,
    CHA: 14
  }
};
