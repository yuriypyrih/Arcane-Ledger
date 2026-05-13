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

export const rangerStarterPack: ClassStarterPack = {
  primaryAbility: "DEX",
  primaryAbilityLabel: "DEX, WIS",
  hitPointDieLabel: "D10 per Ranger level",
  savingThrowProficiencies: [
    SAVING_THROW_PROFICIENCY.STR,
    SAVING_THROW_PROFICIENCY.DEX
  ],
  grantedSkillProficiencies: [],
  skillProficiencies: [
    SKILL.ANIMAL_HANDLING,
    SKILL.ATHLETICS,
    SKILL.INSIGHT,
    SKILL.INVESTIGATION,
    SKILL.NATURE,
    SKILL.PERCEPTION,
    SKILL.STEALTH,
    SKILL.SURVIVAL
  ],
  skillProficiencySelectionCount: 3,
  recommendedSkillProficiencies: [SKILL.SURVIVAL, SKILL.PERCEPTION, SKILL.STEALTH],
  grantedToolProficiencies: [],
  toolProficiencyChoices: [],
  toolProficiencyChoiceCount: 0,
  recommendedToolProficiencies: [],
  weaponProficiencies: [WEAPON_PROFICIENCY.SIMPLE, WEAPON_PROFICIENCY.MARTIAL],
  armorTrainingProficiencies: [
    ARMOR_PROFICIENCY.LIGHT,
    ARMOR_PROFICIENCY.MEDIUM,
    ARMOR_PROFICIENCY.SHIELD
  ],
  weaponMasteryCount: 2,
  startingEquipment: [
    starterPackChoice(
      starterPackItem("srd-2024_studded-leather-armor", "Studded Leather Armor"),
      starterPackItem("srd-2024_scimitar", "Scimitar"),
      starterPackItem("srd-2024_shortsword", "Shortsword"),
      starterPackItem("srd-2024_longbow", "Longbow"),
      starterPackItem("srd-2024_arrows-20", "Arrows"),
      starterPackItem("srd-2024_quiver", "Quiver"),
      starterPackItem(
        "srd-2024_druidic-focus-sprig-of-mistletoe",
        "Druidic Focus (Sprig of Mistletoe)"
      ),
      starterPackPack("srd-2024_explorers-pack", "Explorer's Pack"),
      starterPackCurrency(7, CURRENCY_TYPE.GP)
    ),
    starterPackChoice(starterPackCurrency(150, CURRENCY_TYPE.GP))
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
