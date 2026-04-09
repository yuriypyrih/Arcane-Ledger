import type {
  LanguageProficiency,
  LANGUAGE_PROFICIENCY,
  SAVING_THROW_PROFICIENCY,
  WEAPON_PROFICIENCY
} from "./proficiencies";
import type { MonsterRecord } from "./monsters";
import type { SkillName } from "./skills";

export type BarbarianWildHeartAspect = "owl" | "panther" | "salmon";

export type CharacterRageFeatureState = {
  usesExpended: number;
  active: boolean;
  wildHeartRageOption?: "bear" | "eagle" | "wolf";
  wildHeartPowerOption?: "falcon" | "lion" | "ram";
  wildHeartAspect?: BarbarianWildHeartAspect;
  weaponMasteries?: WEAPON_PROFICIENCY[];
  primalKnowledgeSkill?: SkillName;
  extraAttacksRemainingThisTurn?: number;
  divineFuryUsedThisTurn?: boolean;
  warriorOfTheGodsUsesExpended?: number;
  brutalStrikePending?: boolean;
  brutalStrikeUsedThisTurn?: boolean;
  recklessAttackRoundsRemaining?: number;
  recklessAttackUsedThisTurn?: boolean;
  frenzyPending?: boolean;
  intimidatingPresenceUsesExpended?: number;
  zealousPresenceUsesExpended?: number;
  rageOfTheGodsUsesExpended?: number;
  relentlessRageDcBonus?: number;
  persistentRageUsesExpended?: number;
};

export type CharacterBardExpertiseState = {
  level2?: SkillName[];
  level9?: SkillName[];
};

export type CharacterBardFeatureState = {
  bardicInspirationUsesExpended?: number;
  bardicInspirationTemporaryTotal?: number;
  beguilingMagicUsesExpended?: number;
  blessingOfMoonlightUsesExpended?: number;
  mantleOfMajestyUsesExpended?: number;
  unbreakableMajestyUsesExpended?: number;
  loreBonusProficiencies?: SkillName[];
  magicalDiscoveriesSpellIds?: string[];
  primalLoreCantripId?: string;
  primalLoreSkill?: SkillName;
  expertise?: CharacterBardExpertiseState;
  extraAttacksRemainingThisTurn?: number;
  valorCantripReplacementUsedThisTurn?: boolean;
  battleMagicBonusAttackAvailable?: boolean;
};

export type DruidPrimalOrderChoice = "magician" | "warden";
export type DruidCircleOfTheLandChoice = "arid" | "polar" | "temperate" | "tropical";
export type DruidElementalFuryChoice = "potent-spellcasting" | "primal-strike";

export type CharacterDruidFeatureState = {
  primalOrderChoice?: DruidPrimalOrderChoice;
  circleOfTheLandChoice?: DruidCircleOfTheLandChoice;
  elementalFuryChoice?: DruidElementalFuryChoice;
  wildShapeKnownForms?: MonsterRecord[];
  wildShapeUsesExpended?: number;
  starMapGuidingBoltUsesExpended?: number;
  moonlightStepUsesExpended?: number;
  naturalRecoveryUsesExpended?: number;
  primalStrikeUsedThisTurn?: boolean;
  wildResurgenceSpellSlotRecoveryUsesExpended?: number;
  wildResurgenceWildShapeRecoveryUsedThisTurn?: boolean;
  natureMagicianUsesExpended?: number;
  wildShapeActiveForm?: MonsterRecord;
};

export type CharacterPaladinFeatureState = {
  layOnHandsExpended?: number;
  paladinsSmiteUsesExpended?: number;
  faithfulSteedUsesExpended?: number;
  holyNimbusUsesExpended?: number;
  gloriousDefenseUsesExpended?: number;
  livingLegendUsesExpended?: number;
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
  warriorOfMercyHandOfHarmUsedThisTurn?: boolean;
  warriorOfMercyHandOfUltimateMercyUsesExpended?: number;
  warriorOfShadowImprovedShadowStepUnarmedStrikesRemainingThisTurn?: number;
  warriorOfTheOpenHandWholenessOfBodyUsesExpended?: number;
  superiorDefenseRoundsRemaining?: number;
  superiorDefenseUsedThisTurn?: boolean;
};

export type CharacterFighterFeatureState = {
  secondWindUsesExpended?: number;
  actionSurgeUsesExpended?: number;
  actionSurgeUsedThisTurn?: boolean;
  actionSurgeExtraActionsRemainingThisTurn?: number;
  indomitableUsesExpended?: number;
  battleMasterSuperiorityDiceExpended?: number;
  battleMasterManeuverIds?: string[];
  psiWarriorEnergyDiceExpended?: number;
  psiWarriorPsionicStrikeUsedThisTurn?: boolean;
  psiWarriorPsiPoweredLeapUsesExpended?: number;
  psiWarriorTelekineticMovementUsesExpended?: number;
  psiWarriorBulwarkOfForceUsesExpended?: number;
  psiWarriorTelekineticMasterUsesExpended?: number;
  psiWarriorTelekineticMasterBonusAttackAvailable?: boolean;
  weaponMasteries?: WEAPON_PROFICIENCY[];
  extraAttacksRemainingThisTurn?: number;
  eldritchKnightWarMagicUsesThisTurn?: number;
  banneretKnightlyEnvoyLanguage?: LANGUAGE_PROFICIENCY;
  banneretKnightlyEnvoySkill?: SkillName;
  banneretGroupRecoveryUsesExpended?: number;
};

export type ClericDivineOrderChoice = "protector" | "thaumaturge";
export type ClericBlessedStrikesChoice = "blessed-strike" | "potent-spellcasting";

export type CharacterClericFeatureState = {
  divineOrderChoice?: ClericDivineOrderChoice;
  blessedStrikesChoice?: ClericBlessedStrikesChoice;
  blessedStrikeUsedThisTurn?: boolean;
  channelDivinityUsesExpended?: number;
  divineInterventionUsed?: boolean;
  knowledgeBlessingsSkills?: SkillName[];
  unfetteredMindSavingThrow?: SAVING_THROW_PROFICIENCY;
  divineForeknowledgeUsesExpended?: number;
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
