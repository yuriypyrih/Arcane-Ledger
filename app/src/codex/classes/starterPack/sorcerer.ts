import {
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

export const sorcererStarterPack: ClassStarterPack = {
  primaryAbility: "CHA",
  hitPointDieLabel: "D6 per Sorcerer level",
  savingThrowProficiencies: [
    SAVING_THROW_PROFICIENCY.CON,
    SAVING_THROW_PROFICIENCY.CHA
  ],
  grantedSkillProficiencies: [],
  skillProficiencies: [
    SKILL.ARCANA,
    SKILL.DECEPTION,
    SKILL.INSIGHT,
    SKILL.INTIMIDATION,
    SKILL.PERSUASION,
    SKILL.RELIGION
  ],
  skillProficiencySelectionCount: 2,
  recommendedSkillProficiencies: [SKILL.ARCANA, SKILL.PERSUASION],
  grantedToolProficiencies: [],
  toolProficiencyChoices: [],
  toolProficiencyChoiceCount: 0,
  recommendedToolProficiencies: [],
  weaponProficiencies: [WEAPON_PROFICIENCY.SIMPLE],
  armorTrainingProficiencies: [],
  startingEquipment: [
    starterPackChoice(
      starterPackItem("srd-2024_spear", "Spear"),
      starterPackItem("srd-2024_dagger", "Dagger", 2),
      starterPackItem("srd_crystal", "Arcane Focus (Crystal)"),
      starterPackPack("srd-2024_dungeoneers-pack", "Dungeoneer's Pack"),
      starterPackCurrency(28, CURRENCY_TYPE.GP)
    ),
    starterPackChoice(starterPackCurrency(50, CURRENCY_TYPE.GP))
  ],
  recommendedStartingEquipmentIndex: 0,
  recommendedAbilityScores: {
    STR: 8,
    DEX: 13,
    CON: 14,
    INT: 10,
    WIS: 12,
    CHA: 15
  }
};
