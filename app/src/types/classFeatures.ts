import type {
  LanguageProficiency,
  LANGUAGE_PROFICIENCY,
  SAVING_THROW_PROFICIENCY,
  WEAPON_PROFICIENCY
} from "./proficiencies";
import type { DAMAGE_TYPE } from "../codex/entries";
import type { MonsterRecord } from "./monsters";
import type { SkillName } from "./skills";

export type BarbarianWildHeartAspect = "owl" | "panther" | "salmon";
export type RangerFeyWandererGift =
  | "illusory-butterflies"
  | "flowers-bloom"
  | "comforting-aroma"
  | "dancing-shadow"
  | "horns-or-antlers"
  | "shifting-colors";
export type RangerOtherworldlyGlamourSkill = "Deception" | "Performance" | "Persuasion";
export type WizardBladesingerTrainingInWarAndSongSkill =
  | "Acrobatics"
  | "Athletics"
  | "Performance"
  | "Persuasion";
export type RangerHunterPreyChoice = "colossus-slayer" | "horde-breaker";
export type RangerHunterDefensiveTacticsChoice = "escape-the-horde" | "multiattack-defense";
export type RogueScionOfTheThreeDreadAllegianceChoice = "bane" | "bhaal" | "myrkul";

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
  retaliationAttacksRemaining?: number;
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
  undyingSentinelUsesExpended?: number;
  holyNimbusUsesExpended?: number;
  gloriousDefenseUsesExpended?: number;
  livingLegendUsesExpended?: number;
  elderChampionUsesExpended?: number;
  elementalRebukeUsesExpended?: number;
  nobleScionUsesExpended?: number;
  avengingAngelUsesExpended?: number;
  channelDivinityUsesExpended?: number;
  nobleGeniesGeniesSplendorSkill?: SkillName;
  nobleGeniesAuraOfElementalShieldingDamageType?: DAMAGE_TYPE;
  extraAttacksRemainingThisTurn?: number;
  weaponMasteries?: WEAPON_PROFICIENCY[];
};

export type CharacterRangerFeatureState = {
  favoredEnemyUsesExpended?: number;
  tirelessUsesExpended?: number;
  naturesVeilUsesExpended?: number;
  fortifyingSoulUsesExpended?: number;
  chillingRetributionUsesExpended?: number;
  frozenHauntUsesExpended?: number;
  dreadfulStrikesUsedThisTurn?: boolean;
  winterWalkerPolarStrikesUsedThisTurn?: boolean;
  dreadAmbusherUsesExpended?: number;
  dreadAmbusherUsedThisTurn?: boolean;
  ironMindSavingThrow?: SAVING_THROW_PROFICIENCY;
  huntersPreyChoice?: RangerHunterPreyChoice;
  defensiveTacticsChoice?: RangerHunterDefensiveTacticsChoice;
  superiorHuntersDefenseDamageType?: DAMAGE_TYPE;
  feyReinforcementsUsesExpended?: number;
  mistyWandererUsesExpended?: number;
  feyWandererGift?: RangerFeyWandererGift;
  otherworldlyGlamourSkill?: RangerOtherworldlyGlamourSkill;
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
  bloodthirstUsesExpended?: number;
  dreadAllegianceChoice?: RogueScionOfTheThreeDreadAllegianceChoice;
  soulknifePsionicDiceExpended?: number;
  soulknifePsychicVeilUsesExpended?: number;
  soulknifeRendMindUsesExpended?: number;
  expertise?: CharacterRogueExpertiseState;
  sneakAttackUsedThisTurn?: boolean;
  steadyAimActive?: boolean;
  spellThiefUsesExpended?: number;
  strokeOfLuckUsesExpended?: number;
  thievesCantLanguage?: LanguageProficiency;
  weaponMasteries?: WEAPON_PROFICIENCY[];
};

export type CharacterSorcererFeatureState = {
  sorceryPointsExpended?: number;
  innateSorceryUsesExpended?: number;
  tidesOfChaosUsesExpended?: number;
  tamedSurgeUsesExpended?: number;
  crownOfSpellfireUsesExpended?: number;
  sorcerousRestorationUsesExpended?: number;
  dragonWingsUsesExpended?: number;
  restoreBalanceUsesExpended?: number;
  tranceOfOrderUsesExpended?: number;
  clockworkCavalcadeUsesExpended?: number;
  warpingImplosionUsesExpended?: number;
  arcaneApotheosisFreeMetamagicUsedThisTurn?: boolean;
  metamagicSelections?: string[];
  draconicElementalAffinityDamageType?: DAMAGE_TYPE;
};

export type CharacterWizardPortentRoll = {
  value?: number;
  used?: boolean;
};

export type CharacterWizardFeatureState = {
  arcaneRecoveryUsesExpended?: number;
  bladesongUsesExpended?: number;
  trainingInWarAndSongSkill?: WizardBladesingerTrainingInWarAndSongSkill;
  extraAttacksRemainingThisTurn?: number;
  bladesingerCantripReplacementUsedThisTurn?: boolean;
  spellcastWeaponBonusActionAvailable?: boolean;
  scholar?: SkillName;
  savantSpellIds?: string[];
  phantasmalCreaturesUsesExpended?: number;
  illusorySelfUsesExpended?: number;
  spellMasterySpellIds?: Partial<Record<1 | 2, string>>;
  signatureSpellIds?: string[];
  expendedSignatureSpellIds?: string[];
  portentRolls?: CharacterWizardPortentRoll[];
};

export type CharacterWarlockFeatureState = {
  eldritchInvocationIds?: string[];
  magicalCunningUsesExpended?: number;
  contactPatronUsesExpended?: number;
  darkOnesOwnLuckUsesExpended?: number;
  hurlThroughHellUsesExpended?: number;
  fiendishResilienceDamageType?: DAMAGE_TYPE;
  healingLightDiceExpended?: number;
  radiantSoulUsedThisTurn?: boolean;
  searingVengeanceUsesExpended?: number;
  stepsOfTheFeyUsesExpended?: number;
  beguilingDefenseUsesExpended?: number;
  clairvoyantCombatantUsesExpended?: number;
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
