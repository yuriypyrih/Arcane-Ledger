import type { AbilityKey, AbilityScores } from "../../../types/characters";
import {
  ARMOR_PROFICIENCY,
  SAVING_THROW_PROFICIENCY,
  TOOL_PROFICIENCY,
  WEAPON_PROFICIENCY
} from "../../../types/proficiencies";
import type { SkillName } from "../../../types/skills";
import { CURRENCY_TYPE } from "../../entries/enums";

export type StarterPackEntryReference = {
  type: "entry";
  entryId: string;
  quantity?: number;
};

export type StarterPackCurrencyReference = {
  type: "currency";
  amount: number;
  currency: CURRENCY_TYPE;
};

export type StarterPackEquipmentReference =
  | StarterPackEntryReference
  | StarterPackCurrencyReference;

export type StarterPackEquipmentChoice = StarterPackEquipmentReference[];

export type ClassStarterPack = {
  primaryAbility: AbilityKey;
  savingThrowProficiencies: SAVING_THROW_PROFICIENCY[];
  grantedSkillProficiencies?: SkillName[];
  skillProficiencies: SkillName[];
  skillProficiencySelectionCount: number;
  recommendedSkillProficiencies: SkillName[];
  grantedToolProficiencies?: TOOL_PROFICIENCY[];
  toolProficiencyChoices?: TOOL_PROFICIENCY[];
  toolProficiencyChoiceCount?: number;
  weaponProficiencies: WEAPON_PROFICIENCY[];
  armorTrainingProficiencies: ARMOR_PROFICIENCY[];
  startingEquipment: StarterPackEquipmentChoice[];
  recommendedStartingEquipmentIndex: number | null;
  recommendedAbilityScores: AbilityScores;
};
