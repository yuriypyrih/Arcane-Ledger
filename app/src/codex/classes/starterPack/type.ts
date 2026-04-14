import type { AbilityKey, AbilityScores } from "../../../types/characters";
import {
  ARMOR_PROFICIENCY,
  SAVING_THROW_PROFICIENCY,
  TOOL_PROFICIENCY,
  WEAPON_PROFICIENCY
} from "../../../types/proficiencies";
import type { SkillName } from "../../../types/skills";
import { CURRENCY_TYPE } from "../../entries/enums";

export type StarterPackItemReference = {
  type: "item";
  itemKey: string;
  label: string;
  quantity?: number;
};

export type StarterPackPackReference = {
  type: "pack";
  itemKey: string;
  label: string;
};

export type StarterPackSelectedToolReference = {
  type: "selected-tool";
  label: string;
  selectionId?: string;
  quantity?: number;
};

export type StarterPackCurrencyReference = {
  type: "currency";
  amount: number;
  currency: CURRENCY_TYPE;
};

export type StarterPackEquipmentReference =
  | StarterPackItemReference
  | StarterPackPackReference
  | StarterPackSelectedToolReference
  | StarterPackCurrencyReference;

export type StarterPackEquipmentChoice = StarterPackEquipmentReference[];

export type StarterPackSelection = {
  id: string;
  label: string;
  description?: string;
  source: "selectedToolProficiencies";
  filter?: "any" | "musical-instrument";
  recommendedValue?: TOOL_PROFICIENCY;
};

export type ClassStarterPack = {
  primaryAbility: AbilityKey;
  primaryAbilityLabel?: string;
  hitPointDieLabel: string;
  savingThrowProficiencies: SAVING_THROW_PROFICIENCY[];
  grantedSkillProficiencies?: SkillName[];
  skillProficiencies: SkillName[];
  skillProficiencySelectionCount: number;
  recommendedSkillProficiencies: SkillName[];
  grantedToolProficiencies?: TOOL_PROFICIENCY[];
  toolProficiencyChoices?: TOOL_PROFICIENCY[];
  toolProficiencyChoiceCount?: number;
  recommendedToolProficiencies?: TOOL_PROFICIENCY[];
  weaponProficiencies: WEAPON_PROFICIENCY[];
  armorTrainingProficiencies: ARMOR_PROFICIENCY[];
  weaponMasteryCount?: number;
  startingEquipment: StarterPackEquipmentChoice[];
  startingEquipmentSelections?: StarterPackSelection[];
  recommendedStartingEquipmentIndex: number | null;
  recommendedAbilityScores: AbilityScores;
};
