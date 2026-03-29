import type { LanguageProficiency, WEAPON_PROFICIENCY } from "./proficiencies";
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

export type CharacterPaladinFeatureState = {
  layOnHandsExpended?: number;
  paladinsSmiteUsesExpended?: number;
  faithfulSteedUsesExpended?: number;
  channelDivinityUsesExpended?: number;
  extraAttacksRemainingThisTurn?: number;
  weaponMasteries?: WEAPON_PROFICIENCY[];
};

export type CharacterRangerFeatureState = {
  favoredEnemyUsesExpended?: number;
  tirelessUsesExpended?: number;
  naturesVeilUsesExpended?: number;
  deftExplorerExpertise?: SkillName;
  deftExplorerLanguages?: LanguageProficiency[];
  expertise?: SkillName[];
  extraAttacksRemainingThisTurn?: number;
  weaponMasteries?: WEAPON_PROFICIENCY[];
};

export type CharacterRogueExpertiseState = {
  level1?: SkillName[];
  level6?: SkillName[];
};

export type CharacterRogueFeatureState = {
  expertise?: CharacterRogueExpertiseState;
  sneakAttackUsedThisTurn?: boolean;
  steadyAimActive?: boolean;
  strokeOfLuckUsesExpended?: number;
  thievesCantLanguage?: LanguageProficiency;
  weaponMasteries?: WEAPON_PROFICIENCY[];
};

export type CharacterSorcererFeatureState = {
  sorceryPointsExpended?: number;
  innateSorceryUsesExpended?: number;
  sorcerousRestorationUsesExpended?: number;
  arcaneApotheosisFreeMetamagicUsedThisTurn?: boolean;
  metamagicSelections?: string[];
};

export type CharacterWizardFeatureState = {
  arcaneRecoveryUsesExpended?: number;
  scholar?: SkillName;
  spellMasterySpellIds?: Partial<Record<1 | 2, string>>;
  signatureSpellIds?: string[];
  expendedSignatureSpellIds?: string[];
};

export type CharacterWarlockFeatureState = {
  eldritchInvocationIds?: string[];
  magicalCunningUsesExpended?: number;
  contactPatronUsesExpended?: number;
  mysticArcanumSpellIds?: Partial<Record<6 | 7 | 8 | 9, string>>;
  mysticArcanumExpendedLevels?: Array<6 | 7 | 8 | 9>;
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
  wizard?: CharacterWizardFeatureState;
  paladin?: CharacterPaladinFeatureState;
  ranger?: CharacterRangerFeatureState;
  rogue?: CharacterRogueFeatureState;
  sorcerer?: CharacterSorcererFeatureState;
  warlock?: CharacterWarlockFeatureState;
  monk?: CharacterMonkFeatureState;
  fighter?: CharacterFighterFeatureState;
};
