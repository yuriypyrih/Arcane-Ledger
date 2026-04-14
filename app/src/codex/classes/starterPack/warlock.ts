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

export const warlockStarterPack: ClassStarterPack = {
  primaryAbility: "CHA",
  hitPointDieLabel: "D8 per Warlock level",
  savingThrowProficiencies: [
    SAVING_THROW_PROFICIENCY.WIS,
    SAVING_THROW_PROFICIENCY.CHA
  ],
  grantedSkillProficiencies: [],
  skillProficiencies: [
    SKILL.ARCANA,
    SKILL.DECEPTION,
    SKILL.HISTORY,
    SKILL.INTIMIDATION,
    SKILL.INVESTIGATION,
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
  armorTrainingProficiencies: [ARMOR_PROFICIENCY.LIGHT],
  startingEquipment: [
    starterPackChoice(
      starterPackItem("srd-2024_leather-armor", "Leather Armor"),
      starterPackItem("srd-2024_sickle", "Sickle"),
      starterPackItem("srd-2024_dagger", "Dagger", 2),
      starterPackItem("srd_orb", "Arcane Focus (Orb)"),
      starterPackItem("srd-2024_book", "Book (occult lore)"),
      starterPackPack("srd-2024_scholars-pack", "Scholar's Pack"),
      starterPackCurrency(15, CURRENCY_TYPE.GP)
    ),
    starterPackChoice(starterPackCurrency(100, CURRENCY_TYPE.GP))
  ],
  recommendedStartingEquipmentIndex: 0,
  recommendedAbilityScores: {
    STR: 8,
    DEX: 12,
    CON: 14,
    INT: 13,
    WIS: 10,
    CHA: 15
  }
};
