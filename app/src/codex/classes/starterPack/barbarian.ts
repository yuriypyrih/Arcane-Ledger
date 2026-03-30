import {
  ARMOR_PROFICIENCY,
  SAVING_THROW_PROFICIENCY,
  WEAPON_PROFICIENCY
} from "../../../types/proficiencies";
import { SKILL } from "../../../types/skills";
import { CURRENCY_TYPE } from "../../entries/enums";
import type { ClassStarterPack } from "./type";

export const barbarianStarterPack: ClassStarterPack = {
  primaryAbility: "STR",
  savingThrowProficiencies: [
    SAVING_THROW_PROFICIENCY.STR,
    SAVING_THROW_PROFICIENCY.CON
  ],
  grantedSkillProficiencies: [],
  skillProficiencies: [
    SKILL.ANIMAL_HANDLING,
    SKILL.ATHLETICS,
    SKILL.INTIMIDATION,
    SKILL.NATURE,
    SKILL.PERCEPTION,
    SKILL.SURVIVAL
  ],
  skillProficiencySelectionCount: 2,
  recommendedSkillProficiencies: [SKILL.ATHLETICS, SKILL.INTIMIDATION],
  grantedToolProficiencies: [],
  toolProficiencyChoices: [],
  toolProficiencyChoiceCount: 0,
  weaponProficiencies: [WEAPON_PROFICIENCY.SIMPLE, WEAPON_PROFICIENCY.MARTIAL],
  armorTrainingProficiencies: [
    ARMOR_PROFICIENCY.LIGHT,
    ARMOR_PROFICIENCY.MEDIUM,
    ARMOR_PROFICIENCY.SHIELD
  ],
  startingEquipment: [
    [
      {
        type: "entry",
        entryId: "weapon-greataxe"
      },
      {
        type: "entry",
        entryId: "weapon-handaxe",
        quantity: 4
      },
      {
        type: "entry",
        entryId: "item-explorers-pack"
      },
      {
        type: "currency",
        amount: 15,
        currency: CURRENCY_TYPE.GP
      }
    ],
    [
      {
        type: "currency",
        amount: 75,
        currency: CURRENCY_TYPE.GP
      }
    ]
  ],
  recommendedStartingEquipmentIndex: 0,
  recommendedAbilityScores: {
    STR: 15,
    DEX: 14,
    CON: 15,
    INT: 8,
    WIS: 10,
    CHA: 8
  }
};
