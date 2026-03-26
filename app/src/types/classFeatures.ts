import type { WEAPON_PROFICIENCY } from "./proficiencies";
import type { SkillName } from "./skills";

export type CharacterRageFeatureState = {
  usesExpended: number;
  active: boolean;
  weaponMasteries?: WEAPON_PROFICIENCY[];
};

export type CharacterBardExpertiseState = {
  level2?: SkillName[];
  level9?: SkillName[];
};

export type CharacterBardFeatureState = {
  bardicInspirationUsesExpended?: number;
  bardicInspirationTemporaryTotal?: number;
  expertise?: CharacterBardExpertiseState;
};

export type DruidPrimalOrderChoice = "magician" | "warden";

export type CharacterDruidFeatureState = {
  primalOrderChoice?: DruidPrimalOrderChoice;
};

export type CharacterMonkFeatureState = {
  focusPointsExpended?: number;
  uncannyMetabolismUsesExpended?: number;
  flurryOfBlowsAttacksRemainingThisTurn?: number;
  extraAttacksRemainingThisTurn?: number;
  stunningStrikeUsedThisTurn?: boolean;
  superiorDefenseRoundsRemaining?: number;
  superiorDefenseUsedThisTurn?: boolean;
};

export type CharacterFighterFeatureState = {
  secondWindUsesExpended?: number;
  actionSurgeUsesExpended?: number;
  actionSurgeUsedThisTurn?: boolean;
  actionSurgeExtraActionsRemainingThisTurn?: number;
  indomitableUsesExpended?: number;
  weaponMasteries?: WEAPON_PROFICIENCY[];
  extraAttacksRemainingThisTurn?: number;
};

export type ClericDivineOrderChoice = "protector" | "thaumaturge";
export type ClericBlessedStrikesChoice = "blessed-strike" | "potent-spellcasting";

export type CharacterClericFeatureState = {
  divineOrderChoice?: ClericDivineOrderChoice;
  blessedStrikesChoice?: ClericBlessedStrikesChoice;
  blessedStrikeUsedThisTurn?: boolean;
  channelDivinityUsesExpended?: number;
  divineInterventionUsed?: boolean;
};

export type CharacterClassFeatureState = {
  rage?: CharacterRageFeatureState;
  bard?: CharacterBardFeatureState;
  cleric?: CharacterClericFeatureState;
  druid?: CharacterDruidFeatureState;
  monk?: CharacterMonkFeatureState;
  fighter?: CharacterFighterFeatureState;
};
