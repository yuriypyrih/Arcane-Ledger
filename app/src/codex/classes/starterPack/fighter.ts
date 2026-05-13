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

export const fighterStarterPack: ClassStarterPack = {
  primaryAbility: "STR",
  primaryAbilityLabel: "STR, DEX",
  hitPointDieLabel: "D10 per Fighter level",
  savingThrowProficiencies: [
    SAVING_THROW_PROFICIENCY.STR,
    SAVING_THROW_PROFICIENCY.CON
  ],
  grantedSkillProficiencies: [],
  skillProficiencies: [
    SKILL.ACROBATICS,
    SKILL.ANIMAL_HANDLING,
    SKILL.ATHLETICS,
    SKILL.HISTORY,
    SKILL.INSIGHT,
    SKILL.INTIMIDATION,
    SKILL.PERSUASION,
    SKILL.PERCEPTION,
    SKILL.SURVIVAL
  ],
  skillProficiencySelectionCount: 2,
  recommendedSkillProficiencies: [SKILL.ATHLETICS, SKILL.PERCEPTION],
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
  weaponMasteryCount: 3,
  startingEquipment: [
    starterPackChoice(
      starterPackItem("srd-2024_chain-mail", "Chain Mail"),
      starterPackItem("srd-2024_greatsword", "Greatsword"),
      starterPackItem("srd-2024_flail", "Flail"),
      starterPackItem("srd-2024_javelin", "Javelin", 8),
      starterPackPack("srd-2024_dungeoneers-pack", "Dungeoneer's Pack"),
      starterPackCurrency(4, CURRENCY_TYPE.GP)
    ),
    starterPackChoice(
      starterPackItem("srd-2024_studded-leather-armor", "Studded Leather Armor"),
      starterPackItem("srd-2024_scimitar", "Scimitar"),
      starterPackItem("srd-2024_shortsword", "Shortsword"),
      starterPackItem("srd-2024_longbow", "Longbow"),
      starterPackItem("srd-2024_arrows-20", "Arrows", 1),
      starterPackItem("srd-2024_quiver", "Quiver"),
      starterPackPack("srd-2024_dungeoneers-pack", "Dungeoneer's Pack"),
      starterPackCurrency(11, CURRENCY_TYPE.GP)
    ),
    starterPackChoice(starterPackCurrency(155, CURRENCY_TYPE.GP))
  ],
  recommendedStartingEquipmentIndex: 0,
  recommendedAbilityScores: {
    STR: 15,
    DEX: 13,
    CON: 14,
    INT: 10,
    WIS: 12,
    CHA: 8
  }
};
