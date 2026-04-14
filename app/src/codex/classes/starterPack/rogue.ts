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

export const rogueStarterPack: ClassStarterPack = {
  primaryAbility: "DEX",
  hitPointDieLabel: "D8 per Rogue level",
  savingThrowProficiencies: [
    SAVING_THROW_PROFICIENCY.DEX,
    SAVING_THROW_PROFICIENCY.INT
  ],
  grantedSkillProficiencies: [],
  skillProficiencies: [
    SKILL.ACROBATICS,
    SKILL.ATHLETICS,
    SKILL.DECEPTION,
    SKILL.INSIGHT,
    SKILL.INTIMIDATION,
    SKILL.INVESTIGATION,
    SKILL.PERCEPTION,
    SKILL.PERSUASION,
    SKILL.SLEIGHT_OF_HAND,
    SKILL.STEALTH
  ],
  skillProficiencySelectionCount: 4,
  recommendedSkillProficiencies: [
    SKILL.STEALTH,
    SKILL.SLEIGHT_OF_HAND,
    SKILL.DECEPTION,
    SKILL.INVESTIGATION
  ],
  grantedToolProficiencies: [TOOL_PROFICIENCY.THIEVES_TOOLKIT],
  toolProficiencyChoices: [],
  toolProficiencyChoiceCount: 0,
  recommendedToolProficiencies: [],
  weaponProficiencies: [
    WEAPON_PROFICIENCY.SIMPLE,
    WEAPON_PROFICIENCY.MARTIAL_MELEE_NO_HEAVY_OR_TWO_HANDED
  ],
  armorTrainingProficiencies: [ARMOR_PROFICIENCY.LIGHT],
  weaponMasteryCount: 2,
  startingEquipment: [
    starterPackChoice(
      starterPackItem("srd-2024_leather-armor", "Leather Armor"),
      starterPackItem("srd-2024_dagger", "Dagger", 2),
      starterPackItem("srd-2024_shortsword", "Shortsword"),
      starterPackItem("srd-2024_shortbow", "Shortbow"),
      starterPackItem("srd-2024_arrows-20", "Arrows"),
      starterPackItem("srd-2024_quiver", "Quiver"),
      starterPackItem("srd-2024_thieves-tools", "Thieves' Tools"),
      starterPackPack("srd-2024_burglars-pack", "Burglar's Pack"),
      starterPackCurrency(8, CURRENCY_TYPE.GP)
    ),
    starterPackChoice(starterPackCurrency(100, CURRENCY_TYPE.GP))
  ],
  recommendedStartingEquipmentIndex: 0,
  recommendedAbilityScores: {
    STR: 8,
    DEX: 15,
    CON: 10,
    INT: 14,
    WIS: 12,
    CHA: 13
  }
};
