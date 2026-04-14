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

export const wizardStarterPack: ClassStarterPack = {
  primaryAbility: "INT",
  hitPointDieLabel: "D6 per Wizard level",
  savingThrowProficiencies: [
    SAVING_THROW_PROFICIENCY.INT,
    SAVING_THROW_PROFICIENCY.WIS
  ],
  grantedSkillProficiencies: [],
  skillProficiencies: [
    SKILL.ARCANA,
    SKILL.HISTORY,
    SKILL.INSIGHT,
    SKILL.INVESTIGATION,
    SKILL.MEDICINE,
    SKILL.NATURE,
    SKILL.RELIGION
  ],
  skillProficiencySelectionCount: 2,
  recommendedSkillProficiencies: [SKILL.ARCANA, SKILL.INVESTIGATION],
  grantedToolProficiencies: [],
  toolProficiencyChoices: [],
  toolProficiencyChoiceCount: 0,
  recommendedToolProficiencies: [],
  weaponProficiencies: [WEAPON_PROFICIENCY.SIMPLE],
  armorTrainingProficiencies: [],
  startingEquipment: [
    starterPackChoice(
      starterPackItem("srd-2024_dagger", "Dagger", 2),
      starterPackItem("srd-2024_quarterstaff", "Arcane Focus (Quarterstaff)"),
      starterPackItem("srd-2024_robe", "Robe"),
      starterPackItem("srd_spellbook", "Spellbook"),
      starterPackPack("srd-2024_scholars-pack", "Scholar's Pack"),
      starterPackCurrency(5, CURRENCY_TYPE.GP)
    ),
    starterPackChoice(starterPackCurrency(55, CURRENCY_TYPE.GP))
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
