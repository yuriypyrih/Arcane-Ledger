import type { AbilityKey, Character, CharacterClassFeatureState } from "../../../types";
import { ALL_SKILLS } from "../../../types";
import type {
  RangerHunterDefensiveTacticsChoice,
  RangerHunterPreyChoice,
  SkillName,
  WEAPON_PROFICIENCY
} from "../../../types";
import type { WeaponAction } from "../gameplay";
import { getRoundTrackerResourceForEconomyType } from "../actionEconomy";
import { abilityKeys } from "../constants";
import { consumeRoundTrackerResource, isRoundTrackerResourceAvailable } from "../combat";
import {
  hasExhaustionAbilityCheckDisadvantage,
  hasExhaustionAttackRollDisadvantage,
  hasExhaustionSavingThrowDisadvantage,
  removeCharacterStatusEntry
} from "../statusEntries";
import {
  getCustomTraitAbilityScoreBonuses,
  getCustomTraitArmorClassBonuses,
  getCustomTraitInitiativeBonuses,
  getCustomTraitSavingThrowBonuses,
  getCustomTraitWeaponDamageBonuses
} from "../customTraitEffects";
import {
  activateBardicInspiration,
  activateBardCollegeOfDanceInspiringMovement,
  applyMantleOfMajestyStatus,
  applyInspiredEclipseStatus,
  applySuperiorInspirationOnInitiative,
  applyBardBattleMagicAfterSpellCast,
  consumeBlessingOfMoonlightUse,
  consumeBardWeaponAttack,
  consumeBeguilingMagicOrBardicInspiration,
  consumeMantleOfMajestyUse,
  expendBardicInspirationUse,
  getBlessingOfMoonlightUsesRemaining,
  getBlessingOfMoonlightUsesTotal,
  getBardExpertiseSelections,
  getBardLoreBonusProficiencySelections,
  getBardMagicalDiscoveriesSpellIds,
  getBardMagicalDiscoveriesSpellOptions,
  getBardCollegeOfDanceUnarmedStrikeMultiCount,
  getBardPrimalLoreCantripId,
  getBardPrimalLoreCantripOptions,
  getBardPrimalLoreSkillOptions,
  getBardPrimalLoreSkillSelection,
  hasBardBattleMagicBonusAttackAvailable,
  getBeguilingMagicUsesRemaining,
  getBeguilingMagicUsesTotal,
  getBardicInspirationUsesRemaining,
  getBardicInspirationUsesTotal,
  getMantleOfMajestyFallbackSlotLevel,
  getMantleOfMajestyUsesRemaining,
  getMantleOfMajestyUsesTotal,
  hasActiveMantleOfMajesty,
  restoreAllBardicInspirationUses,
  restoreBardicInspirationUse,
  setBardLoreBonusProficiencySelections,
  setBardMagicalDiscoveriesSpellIds,
  setBardPrimalLoreCantripId,
  setBardPrimalLoreSkillSelection,
  setBardExpertiseSelections
} from "./bard/bard";
import { normalizeFeatureActionCardUsage } from "./cardUsage";
import {
  activateBarbarianBerserkerRetaliation,
  applyPersistentRageOnInitiative,
  consumeBarbarianWarriorOfTheGodsCharges,
  expendBarbarianRageUse,
  consumeBarbarianDivineFuryBonus,
  consumeBarbarianBrutalStrikeBonus,
  consumeBarbarianFrenzyBonus,
  consumeBarbarianWeaponAttack,
  deactivateBarbarianRecklessAttack,
  deactivateBarbarianRage,
  getBarbarianAdditionalWeaponMasteries,
  hasBarbarianBatteringRootsBonus,
  getBarbarianPersistentRageUsesRemaining,
  getBarbarianPersistentRageUsesTotal,
  getBarbarianRageUsesRemaining,
  getBarbarianRageUsesTotal,
  getBarbarianPrimalKnowledgeSkillOptions,
  getBarbarianPrimalKnowledgeSkillSelection,
  getBarbarianRageDamageBonus,
  getBarbarianWarriorOfTheGodsUsesRemaining,
  getBarbarianWarriorOfTheGodsUsesTotal,
  restoreAllBarbarianRageUses,
  restoreBarbarianRageUse,
  getBarbarianWildHeartAspectChoice,
  setBarbarianWildHeartAspectChoice,
  setBarbarianPrimalKnowledgeSkillSelection
} from "./barbarian/barbarian";
import {
  activateClericBlessingOfTheTrickster,
  consumeClericWeaponAttack,
  consumeClericGuidedStrikeReaction,
  consumeClericWardingFlareUse,
  expendClericChannelDivinityUse,
  getClericBlessedStrikesChoice,
  getClericChannelDivinityUsesRemaining,
  getClericChannelDivinityUsesTotal,
  getClericDivineOrderChoice,
  guidedStrikeReactionEntryId,
  hasClericWarPriestBonusAttackAvailable,
  getClericWardingFlareUsesRemaining,
  getClericWardingFlareUsesTotal,
  getKnowledgeDomainBlessingsSkillSelections,
  getKnowledgeDomainBlessingsToolSelection,
  getKnowledgeDomainUnfetteredMindSavingThrowOptions,
  getKnowledgeDomainUnfetteredMindSavingThrowSelection,
  isKnowledgeDomainUnfetteredMindLockedToInt,
  markClericBlessedStrikeUsed,
  restoreClericChannelDivinityOnLongRest,
  restoreClericChannelDivinityOnShortRest,
  setClericBlessedStrikesChoice,
  setClericDivineOrderChoice,
  setKnowledgeDomainBlessingsSkillSelections,
  setKnowledgeDomainBlessingsToolSelection,
  setKnowledgeDomainUnfetteredMindSavingThrowSelection,
  wardingFlareReactionEntryId
} from "./cleric/cleric";
import {
  activateDruidNatureMagician,
  applyArchdruidOnInitiative,
  activateDruidStarryForm,
  consumeDruidCosmicOmenUse,
  consumeDruidNaturalRecoveryUse,
  consumeDruidStarMapGuidingBoltUse,
  activateDruidWildResurgenceLevelOneSpellSlotRecovery,
  activateDruidWildResurgenceWildShapeRecovery,
  activateDruidWildCompanion,
  getDruidActiveStarryFormConstellation,
  getDruidCircleOfTheLandChoice,
  getDruidCosmicOmenSelection,
  getDruidCosmicOmenUsesRemaining,
  getDruidCosmicOmenUsesTotal,
  getDruidNaturalRecoveryUsesRemaining,
  getDruidNaturalRecoveryUsesTotal,
  getDruidElementalFuryChoice,
  hasDruidTwinklingConstellationsFeature,
  activateDruidWildShape,
  deactivateDruidWildShape,
  expendOneDruidWildShapeUse,
  getDruidNatureMagicianOptions,
  getDruidNatureMagicianUsesRemaining,
  getDruidNatureMagicianUsesTotal,
  getDruidStarMapGuidingBoltUsesRemaining,
  getDruidStarMapGuidingBoltUsesTotal,
  getDruidWildResurgenceAvailableSpellSlotLevels,
  getDruidWildResurgenceSpellSlotRecoveryUsesRemaining,
  getDruidWildResurgenceSpellSlotRecoveryUsesTotal,
  getDruidWildShapeActiveForm,
  getDruidWildShapeIneligibilityReason,
  getDruidWildShapeKnownForms,
  getDruidWildShapeRules,
  getDruidWildShapeUsesRemaining,
  getDruidWildShapeUsesTotal,
  getDruidPrimalOrderChoice,
  isDruidWildShapeStatusSourceId,
  markDruidPrimalStrikeUsed,
  restoreAllDruidWildShapeUses,
  restoreDruidCosmicOmenOnLongRest,
  restoreOneDruidWildShapeUse,
  setDruidActiveStarryFormConstellation,
  setDruidCircleOfTheLandChoice,
  setDruidCosmicOmenSelection,
  setDruidElementalFuryChoice,
  setDruidPrimalOrderChoice,
  setDruidWildShapeKnownForms
} from "./druid/druid";
import {
  applyRangerWinterWalkerFrozenHauntStatusEntries,
  consumeRangerFavoredEnemyUse,
  consumeRangerGloomStalkerDreadAmbusherUse,
  consumeRangerWinterWalkerChillingRetributionUse,
  consumeRangerWinterWalkerFrozenHauntUse,
  consumeRangerFeyReinforcementsUse,
  consumeRangerMistyWandererUse,
  consumeRangerWinterWalkerPolarStrikesUse,
  chillingRetributionReactionId,
  markRangerDreadfulStrikesUsed,
  markRangerHunterColossusSlayerUsed,
  consumeRangerNaturesVeilUse,
  consumeRangerTirelessUse,
  consumeRangerWeaponAttack,
  markRangerHunterHordeBreakerUsed,
  getRangerDeftExplorerExpertiseSelection,
  getRangerDeftExplorerLanguageSelections,
  getRangerFeyReinforcementsUsesRemaining,
  getRangerFeyReinforcementsUsesTotal,
  getRangerFeyWandererGiftSelection,
  getRangerHunterDefensiveTacticsChoice,
  getRangerHunterPreyChoice,
  getRangerHunterSuperiorHuntersDefenseDamageTypeSelection,
  getRangerGloomStalkerIronMindSavingThrowOptions,
  getRangerGloomStalkerIronMindSavingThrowSelection,
  getRangerGloomStalkerDreadAmbusherUsesRemaining,
  getRangerGloomStalkerDreadAmbusherUsesTotal,
  getRangerMistyWandererUsesRemaining,
  getRangerMistyWandererUsesTotal,
  getRangerWinterWalkerFrozenHauntSpellOptionState,
  getRangerWinterWalkerFortifyingSoulHealingFacts,
  getRangerWinterWalkerFortifyingSoulHealingFormula,
  getRangerWinterWalkerFortifyingSoulHealingFormulaDisplay,
  getRangerWinterWalkerHuntersRimeTemporaryHitPointsFacts,
  getRangerWinterWalkerHuntersRimeTemporaryHitPointsFormula,
  getRangerWinterWalkerHuntersRimeTemporaryHitPointsFormulaDisplay,
  getRangerWinterWalkerChillingRetributionUsesRemaining,
  getRangerWinterWalkerChillingRetributionUsesTotal,
  getRangerWinterWalkerFrozenHauntUsesRemaining,
  getRangerWinterWalkerFrozenHauntUsesTotal,
  getRangerOtherworldlyGlamourSkillSelection,
  getRangerFavoredEnemyUsesRemaining,
  getRangerFavoredEnemyUsesTotal,
  getRangerLevel9ExpertiseSelections,
  getRangerNaturesVeilUsesRemaining,
  getRangerNaturesVeilUsesTotal,
  rangerHunterSuperiorHuntersDefenseDamageTypeOptions,
  rangerOtherworldlyGlamourSkillOptions,
  getRangerTirelessUsesRemaining,
  getRangerTirelessUsesTotal,
  rangerFeyWandererGiftOptions,
  isRangerGloomStalkerIronMindLockedToWis,
  activateRangerHunterSuperiorHuntersDefense,
  restoreRangerFeyReinforcementsOnLongRest,
  restoreRangerGloomStalkerDreadAmbusherOnLongRest,
  restoreRangerMistyWandererOnLongRest,
  restoreRangerNaturesVeilOnLongRest,
  restoreRangerTirelessOnLongRest,
  setRangerDeftExplorerExpertiseSelection,
  setRangerDeftExplorerLanguageSelections,
  setRangerFeyWandererGiftSelection,
  setRangerHunterDefensiveTacticsChoice,
  setRangerHunterHordeBreakerActionKey,
  setRangerHunterPreyChoice,
  setRangerHunterSuperiorHuntersDefenseDamageTypeSelection,
  setRangerGloomStalkerIronMindSavingThrowSelection,
  setRangerOtherworldlyGlamourSkillSelection,
  setRangerLevel9ExpertiseSelections
} from "./ranger/ranger";
import {
  getRogueExpertiseSelections,
  getRogueSkillReferenceDescriptionAdditions,
  getRogueSkillRollD20Minimum,
  getRogueSpellThiefUsesRemaining,
  getRogueSpellThiefUsesTotal,
  getRogueStrokeOfLuckUsesRemaining,
  getRogueStrokeOfLuckUsesTotal,
  consumeRogueSpellThiefUse,
  consumeRogueWeaponAttack,
  restoreRogueStrokeOfLuckOnLongRest,
  restoreRogueSpellThiefOnLongRest,
  restoreRogueStrokeOfLuckOnShortRest,
  setRogueExpertiseSelections,
  setRogueThievesCantLanguageSelection,
  getRogueThievesCantLanguageSelection
} from "./rogue/rogue";
import {
  consumeRogueScionOfTheThreeBloodthirstUse,
  getRogueScionOfTheThreeAuraOfMalevolenceFormulaFact,
  getRogueScionOfTheThreeDreadAllegianceChoice,
  getRogueScionOfTheThreeBloodthirstUsesRemaining,
  getRogueScionOfTheThreeBloodthirstUsesTotal,
  rogueScionOfTheThreeBloodthirstReactionId,
  setRogueScionOfTheThreeDreadAllegianceChoice
} from "./rogue/subclasses/rogueScionOfTheThree";
import {
  getRogueThiefSkillReferenceDescriptionAdditions,
  hasRogueThiefThiefsReflexesFeature
} from "./rogue/subclasses/rogueThief";
import {
  expendRogueSoulknifePsionicDie,
  getRogueSoulknifePsionicDiceRemaining,
  getRogueSoulknifePsionicDiceTotal,
  getRogueSoulknifePsionicDie,
  restoreAllRogueSoulknifePsionicDice,
  restoreRogueSoulknifePsionicDie
} from "./rogue/subclasses/rogueSoulknife";
import {
  activateInnateSorcery,
  createSpellSlotFromSorceryPoints,
  convertSpellSlotToSorceryPoints,
  expendOneSorceryPoint,
  getInnateSorceryUsesRemaining,
  getInnateSorceryUsesTotal,
  getInnateSorceryActivationSorceryPointCost,
  getSorcererMetamagicActionCost,
  getSorcererMetamagicDefinitions,
  getSorcererMetamagicSelectionCount,
  getSorcererMetamagicSelectionLimitForAction,
  getSorcererMetamagicSelections,
  getSorceryPointsRemaining,
  getSorceryPointsTotal,
  hasActiveInnateSorcery,
  hasArcaneApotheosisFreeMetamagicAvailable,
  restoreAllSorceryPoints,
  restoreInnateSorceryOnLongRest,
  restoreOneSorceryPoint,
  setSorcererMetamagicSelections,
  spendMetamagicOptions
} from "./sorcerer/sorcerer";
import {
  consumeSorcererSubclassRestoreBalanceUse,
  getSorcererSubclassCrownOfSpellfireFallbackSorceryPointCost,
  getSorcererSubclassCrownOfSpellfireUsesRemaining,
  getSorcererSubclassCrownOfSpellfireUsesTotal,
  sorcererBendLuckReactionEntryId,
  getSorcererDraconicElementalAffinityDamageTypeSelection,
  getSorcererSubclassRestoreBalanceUsesRemaining,
  getSorcererSubclassRestoreBalanceUsesTotal,
  restoreSorcererSubclassFeaturesOnSpellCast,
  restoreSorcererSubclassFeaturesOnSpellSlotCast,
  setSorcererDraconicElementalAffinityDamageTypeSelection,
  sorcererDraconicElementalAffinityDamageTypeOptions,
  sorcererRestoreBalanceReactionId
} from "./sorcerer/subclasses";
import {
  consumeContactPatronUse,
  expendWarlockHealingLightDie,
  consumeWarlockBeguilingDefenseUse,
  consumeMysticArcanumUse,
  getContactPatronUsesRemaining,
  getContactPatronUsesTotal,
  getWarlockBeguilingDefenseUsesRemaining,
  getWarlockBeguilingDefenseUsesTotal,
  getWarlockEldritchInvocationLimit,
  getWarlockFiendishResilienceDamageTypeSelection,
  getWarlockHealingLightDiceRemaining,
  getWarlockHealingLightDiceTotal,
  getWarlockHealingLightMaxSpend,
  getWarlockMagicalCunningUsesRemaining,
  getWarlockMagicalCunningUsesTotal,
  getWarlockInvocationBlockingSelectionNames,
  getWarlockInvocationOptions,
  getWarlockInvocationSelectionIds,
  getWarlockLearnedInvocationOptions,
  normalizeWarlockInvocationSelectionIds,
  getWarlockMysticArcanumSelections,
  getWarlockMysticArcanumSpellId,
  getWarlockMysticArcanumSpellOptions,
  getWarlockFeatureReactionSpellDefinition,
  applyWarlockFeaturesAfterSpellCast,
  getWarlockPactMagicSlotTotal,
  getWarlockPactMagicSlotsRemaining,
  getWarlockStepsOfTheFeyUsesRemaining,
  getWarlockStepsOfTheFeyUsesTotal,
  restoreAllWarlockHealingLightDice,
  restoreContactPatronOnLongRest,
  restoreWarlockHealingLightDie,
  restoreWarlockHealingLightOnLongRest,
  restoreWarlockBeguilingDefenseOnLongRest,
  restoreWarlockMagicalCunningOnLongRest,
  consumeWarlockStepsOfTheFeyUse,
  spendWarlockHealingLightDice,
  setWarlockFiendishResilienceDamageTypeSelection,
  setWarlockMysticArcanumSpellId,
  setWarlockInvocationSelectionIds,
  warlockFiendPatronFiendishResilienceDamageTypeOptions,
  warlockBeguilingDefenseReactionId
} from "./warlock/warlock";
import {
  activateArcaneRecovery,
  applyWizardFeaturesAfterSpellCast,
  consumeWizardWeaponAttack,
  consumeWizardSignatureSpellFreeCast,
  getArcaneRecoveryUsesRemaining,
  getArcaneRecoveryUsesTotal,
  getWizardExpendedSignatureSpellIds,
  getWizardScholarSelection,
  getWizardSavantSpellIds,
  getWizardSignatureSpellIds,
  getWizardSpellbookSpellEntry,
  hasWizardSignatureSpellFreeCastAvailable,
  hasWizardSpellcastWeaponBonusActionAvailable,
  getWizardSpellMasterySelection,
  getWizardSpellMasterySpellIds,
  setWizardScholarSelection,
  setWizardSavantSpellIds,
  setWizardSignatureSpellIds,
  setWizardSpellMasterySelection,
  syncWizardSignatureSpellsToSpellbook,
  syncWizardSpellMasterySelectionsToSpellbook
} from "./wizard/wizard";
import {
  consumeWizardIllusionistIllusorySelfUse,
  consumeWizardIllusionistPhantasmalCreaturesUse,
  getWizardIllusionistIllusorySelfFallbackSlotSummary,
  getWizardIllusionistIllusorySelfUsesRemaining,
  getWizardIllusionistIllusorySelfUsesTotal,
  getWizardIllusionistPhantasmalCreaturesSpellOptionState,
  wizardIllusionistIllusorySelfReactionId
} from "./wizard/subclasses/wizardIllusionist";
import {
  hasActivePaladinOathOfVengeanceVowOfEnmity,
  soulOfVengeanceReactionId
} from "./paladin/subclasses/paladinOathOfVengeance";
import { getSubclassDerivedFeatureState } from "./subclasses";
import {
  applyLayOnHands,
  consumeElementalRebukeUse,
  consumeGloriousDefenseUse,
  expendPaladinChannelDivinityUse,
  consumeFaithfulSteedUse,
  consumePaladinWeaponAttack,
  consumePaladinsSmiteUse,
  elementalRebukeReactionId,
  getElementalRebukeUsesRemaining,
  getElementalRebukeUsesTotal,
  getGloriousDefenseUsesRemaining,
  getGloriousDefenseUsesTotal,
  getLayOnHandsCurableConditions,
  getPaladinChannelDivinityUsesRemaining,
  getPaladinChannelDivinityUsesTotal,
  getPaladinHealingPoolRemaining,
  getPaladinHealingPoolTotal,
  getPaladinOathOfTheNobleGeniesAuraOfElementalShieldingDamageTypeSelectionForCharacter as getPaladinOathOfTheNobleGeniesAuraOfElementalShieldingDamageTypeSelection,
  getPaladinOathOfTheNobleGeniesGeniesSplendorSkillSelectionForCharacter as getPaladinOathOfTheNobleGeniesGeniesSplendorSkillSelection,
  getPaladinsSmiteUsesRemaining,
  gloriousDefenseReactionId,
  hasActivePaladinAuraOfProtection,
  paladinOathOfTheNobleGeniesAuraOfElementalShieldingDamageTypeOptions,
  paladinOathOfTheNobleGeniesGeniesSplendorSkillOptions,
  restorePaladinChannelDivinityOnLongRest,
  restorePaladinChannelDivinityOnShortRest,
  restorePaladinLayOnHandsOnLongRest,
  setPaladinOathOfTheNobleGeniesAuraOfElementalShieldingDamageTypeSelectionForCharacter as setPaladinOathOfTheNobleGeniesAuraOfElementalShieldingDamageTypeSelection,
  setPaladinOathOfTheNobleGeniesGeniesSplendorSkillSelectionForCharacter as setPaladinOathOfTheNobleGeniesGeniesSplendorSkillSelection
} from "./paladin/paladin";
import {
  applyMonkUncannyMetabolismOnInitiative,
  applyPerfectFocusOnInitiative,
  consumeMonkWeaponAttack,
  expendMonkFocusPoint,
  getMonkFocusPointsRemaining,
  getMonkFocusPointsTotal,
  getMonkFlurryOfBlowsAttackMultiCount,
  getMonkUncannyMetabolismUsesRemaining,
  getMonkUncannyMetabolismUsesTotal,
  hasMonkPerfectFocus,
  getMonkUnarmedStrikeMultiCount,
  restoreAllMonkFocusPoints,
  restoreMonkUncannyMetabolismOnLongRest,
  restoreOneMonkFocusPoint
} from "./monk/monk";
import {
  consumeMonkWarriorOfMercyHandOfHarm,
  monkWarriorOfMercyHandOfHarmBonusLabel
} from "./monk/subclasses/monkWarriorOfMercy";
import { consumeMonkWarriorOfTheElementsEmpoweredStrikes } from "./monk/subclasses/monkWarriorOfTheElements";
import {
  activateFighterPsiWarriorTelekineticMasterSpellCastForCharacter as activateFighterPsiWarriorTelekineticMasterSpellCast,
  activateFighterPsiWarriorTelekineticMovementForCharacter as activateFighterPsiWarriorTelekineticMovement,
  consumeFighterSecondWindUse,
  consumeFighterPsiWarriorPsionicStrikeForCharacter as consumeFighterPsiWarriorPsionicStrike,
  consumeFighterIndomitableUse,
  expendFighterBattleMasterSuperiorityDieForCharacter as expendFighterBattleMasterSuperiorityDie,
  expendFighterPsiWarriorEnergyDieForCharacter as expendFighterPsiWarriorEnergyDie,
  consumeFighterWeaponAttack,
  fighterBanneretKnightlyEnvoySkillOptions,
  getFighterBattleMasterManeuverSelectionCountForCharacter as getFighterBattleMasterManeuverSelectionCount,
  getFighterBattleMasterManeuverSelectionsForCharacter as getFighterBattleMasterManeuverSelections,
  getFighterBattleMasterSuperiorityDiceRemainingForCharacter as getFighterBattleMasterSuperiorityDiceRemaining,
  getFighterBattleMasterSuperiorityDiceTotalForCharacter as getFighterBattleMasterSuperiorityDiceTotal,
  getFighterBattleMasterSuperiorityDieForCharacter as getFighterBattleMasterSuperiorityDie,
  getFighterBanneretKnightlyEnvoyLanguageSelectionForCharacter as getFighterBanneretKnightlyEnvoyLanguageSelection,
  getFighterBanneretKnightlyEnvoySkillSelectionForCharacter as getFighterBanneretKnightlyEnvoySkillSelection,
  getFighterIndomitableUsesRemaining,
  getFighterIndomitableUsesTotal,
  getFighterSecondWindUsesRemaining,
  getFighterSecondWindUsesTotal,
  getFighterPsiWarriorEnergyDiceRemainingForCharacter as getFighterPsiWarriorEnergyDiceRemaining,
  getFighterPsiWarriorEnergyDiceTotalForCharacter as getFighterPsiWarriorEnergyDiceTotal,
  getFighterPsiWarriorEnergyDieForCharacter as getFighterPsiWarriorEnergyDie,
  getFighterPsiWarriorProtectiveFieldFormulaForCharacter as getFighterPsiWarriorProtectiveFieldFormula,
  getFighterPsiWarriorPsionicStrikeFormulaForCharacter as getFighterPsiWarriorPsionicStrikeFormula,
  getFighterPsiWarriorTelekineticMasterUsesRemainingForCharacter as getFighterPsiWarriorTelekineticMasterUsesRemaining,
  getFighterPsiWarriorTelekineticMasterUsesTotalForCharacter as getFighterPsiWarriorTelekineticMasterUsesTotal,
  getFighterPsiWarriorTelekineticMovementUsesRemainingForCharacter as getFighterPsiWarriorTelekineticMovementUsesRemaining,
  getFighterPsiWarriorTelekineticMovementUsesTotalForCharacter as getFighterPsiWarriorTelekineticMovementUsesTotal,
  hasFighterPsiWarriorTelekineticMasterBonusAttackAvailableForCharacter as hasFighterPsiWarriorTelekineticMasterBonusAttackAvailable,
  hasFighterPsiWarriorPsionicStrikeAvailableForCharacter as hasFighterPsiWarriorPsionicStrikeAvailable,
  restoreAllFighterBattleMasterSuperiorityDiceForCharacter as restoreAllFighterBattleMasterSuperiorityDice,
  restoreAllFighterPsiWarriorEnergyDiceForCharacter as restoreAllFighterPsiWarriorEnergyDice,
  restoreFighterBattleMasterSuperiorityDieForCharacter as restoreFighterBattleMasterSuperiorityDie,
  restoreFighterSecondWindOnLongRest,
  restoreFighterSecondWindOnShortRest,
  restoreFighterPsiWarriorEnergyDieForCharacter as restoreFighterPsiWarriorEnergyDie,
  restoreFighterPsiWarriorTelekineticMasterOnLongRest,
  setFighterBattleMasterManeuverSelectionsForCharacter as setFighterBattleMasterManeuverSelections,
  setFighterBanneretKnightlyEnvoyLanguageSelectionForCharacter as setFighterBanneretKnightlyEnvoyLanguageSelection,
  setFighterBanneretKnightlyEnvoySkillSelectionForCharacter as setFighterBanneretKnightlyEnvoySkillSelection
} from "./fighter/fighter";
import {
  consumeSharedEconomyMultiForCharacterAction,
  createEconomyMultiContextForFeatureAction,
  createEconomyMultiContextForFeatureActionOption,
  createEconomyMultiContextForSpell,
  createEconomyMultiContextForWeaponAction,
  getSharedEconomyMultiCountForCharacterAction
} from "./economyMulti";
import {
  collectActiveClassFeatureState,
  getActiveClassFeatureModule,
  getClassFeatureModules
} from "./modules";
export { getMagicTemporaryHitPointsFeatureForCharacter } from "./magicTemporaryHitPoints";
import type {
  AbilityCheckIndicatorMap,
  ArmorClassFeatureContext,
  CoreStatIndicatorMap,
  DerivedFeatureStatusEntry,
  FeatureActionCard,
  FeatureActionHeaderTag,
  FeatureActionHeaderTagPool,
  FeatureActionCardUsage,
  FeatureActionCardUsageCharges,
  FeatureActionCardUsageCost,
  FeatureActionDrawerConfig,
  FeatureActionExecuteConfig,
  FeatureActionFact,
  FeatureActionIcon,
  FeatureActionOptionCard,
  FeatureActionOptionSelection,
  FeatureActionResource,
  FeatureActionTone,
  FeatureAbilityScoreBonus,
  FeatureArmorProficiencyEntry,
  FeatureIndicator,
  FeatureArmorClassBonus,
  FeatureArmorClassMode,
  EconomyMultiActionContext,
  FeatureEquipmentEntry,
  FeatureLanguageProficiencyEntry,
  FeatureDamageBonus,
  FeatureInitiativeBonus,
  FeatureEconomyMultiAccessRule,
  FeatureEconomyMultiPool,
  FeatureSavingThrowBonus,
  FeatureUnarmedStrikeConfig,
  FeatureSavingThrowProficiencyEntry,
  FeatureSkillBonus,
  FeatureSkillProficiencyEntry,
  FeatureSpeedBonus,
  FeatureSpellcastingState,
  FeatureToolProficiencyEntry,
  FeatureWeaponProficiencyEntry,
  SavingThrowIndicatorMap,
  SpeedFeatureContext,
  SkillIndicatorMap,
  WeaponAttackConsumptionContext,
  WeaponFeatureContext
} from "./types";
import type { CharacterStatusEntry } from "../../../types";
import {
  getSpellEntryById,
  SPELL_LIST_CLASS,
  type ReactionEntry,
  type SpellDescriptionEntry,
  type SpellEntry,
  type WEAPON_COMBAT_TYPE,
  type WEAPON_MASTERY,
  type WEAPON_PROPERTY
} from "../../../codex/entries";
import { PROF_LEVEL } from "../../../types";

const exhaustionDisadvantageIndicator: FeatureIndicator = {
  label: "Disadvantage",
  tone: "disadvantage",
  source: "Exhaustion"
};

function mergeIndicatorMaps<T extends string>(
  ...maps: Array<Partial<Record<T, FeatureIndicator[]>>>
): Partial<Record<T, FeatureIndicator[]>> {
  return maps.reduce<Partial<Record<T, FeatureIndicator[]>>>((result, currentMap) => {
    (Object.keys(currentMap) as T[]).forEach((key) => {
      const indicators = currentMap[key];

      if (!indicators || indicators.length === 0) {
        return;
      }

      result[key] = [...(result[key] ?? []), ...indicators];
    });

    return result;
  }, {});
}

export type {
  AbilityCheckIndicatorMap,
  ArmorClassFeatureContext,
  CoreStatIndicatorMap,
  EconomyMultiActionContext,
  FeatureActionCard,
  FeatureActionHeaderTag,
  FeatureActionHeaderTagPool,
  FeatureActionCardUsage,
  FeatureActionCardUsageCharges,
  FeatureActionCardUsageCost,
  FeatureActionDrawerConfig,
  FeatureActionExecuteConfig,
  FeatureActionFact,
  FeatureActionIcon,
  FeatureActionOptionCard,
  FeatureActionOptionSelection,
  FeatureActionResource,
  FeatureActionTone,
  FeatureAbilityScoreBonus,
  FeatureArmorProficiencyEntry,
  FeatureIndicator,
  FeatureArmorClassBonus,
  FeatureArmorClassMode,
  FeatureLanguageProficiencyEntry,
  FeatureDamageBonus,
  FeatureEconomyMultiAccessRule,
  FeatureEconomyMultiPool,
  FeatureSavingThrowBonus,
  FeatureUnarmedStrikeConfig,
  FeatureSavingThrowProficiencyEntry,
  FeatureSkillBonus,
  FeatureSkillProficiencyEntry,
  FeatureSpeedBonus,
  FeatureWeaponProficiencyEntry,
  SavingThrowIndicatorMap,
  SpeedFeatureContext,
  SkillIndicatorMap,
  WeaponFeatureContext
};

export {
  consumeSharedEconomyMultiForCharacterAction,
  createEconomyMultiContextForFeatureAction,
  createEconomyMultiContextForFeatureActionOption,
  createEconomyMultiContextForSpell,
  createEconomyMultiContextForWeaponAction,
  getSharedEconomyMultiCountForCharacterAction
};

export function normalizeCharacterClassFeatureState(
  value: unknown,
  character: Pick<Character, "className" | "level"> &
    Partial<Pick<Character, "abilities" | "cantripIds" | "feats" | "subclassId">>
): CharacterClassFeatureState {
  const record =
    value && typeof value === "object" ? (value as Partial<CharacterClassFeatureState>) : {};
  const rawRecord = record as Record<string, unknown>;
  const normalizedState = {} as CharacterClassFeatureState;

  getClassFeatureModules().forEach((module) => {
    (normalizedState as Record<string, unknown>)[module.stateKey] = module.normalizeState(
      rawRecord[module.stateKey],
      character
    );
  });

  return normalizedState;
}

export function getFeatureActionsForCharacter(character: Character): FeatureActionCard[] {
  const baseFeatureState = collectActiveClassFeatureState(character);
  const subclassDerivedState = getSubclassDerivedFeatureState(character);
  const actions = [
    ...(baseFeatureState.actions ?? []),
    ...(subclassDerivedState.featureActions ?? [])
  ];
  const transformedActions = subclassDerivedState.transformFeatureAction
    ? actions.map(subclassDerivedState.transformFeatureAction)
    : actions;

  return transformedActions.map(normalizeFeatureActionCardUsage);
}

export function getFeatureEquipmentEntriesForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId" | "equipment" | "customEquipment">>
): FeatureEquipmentEntry[] {
  const baseFeatureState = collectActiveClassFeatureState(character);
  const subclassDerivedState = getSubclassDerivedFeatureState(character);

  return [
    ...(baseFeatureState.equipmentEntries ?? []),
    ...(subclassDerivedState.equipmentEntries ?? [])
  ];
}

export function getFeatureWeaponActionsForCharacter(character: Character) {
  const baseFeatureState = collectActiveClassFeatureState(character);
  const subclassDerivedState = getSubclassDerivedFeatureState(character);

  return [...(baseFeatureState.weaponActions ?? []), ...(subclassDerivedState.weaponActions ?? [])];
}

export function transformCommonActionForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<
      Pick<
        Character,
        "subclassId" | "abilities" | "equipment" | "inventoryItems" | "customEquipment"
      >
    >,
  action: FeatureActionCard
): FeatureActionCard {
  const baseFeatureState = collectActiveClassFeatureState(character);
  const subclassDerivedState = getSubclassDerivedFeatureState(character);
  const baseAction = baseFeatureState.transformCommonAction
    ? baseFeatureState.transformCommonAction(action)
    : action;

  return subclassDerivedState.transformCommonAction
    ? subclassDerivedState.transformCommonAction(baseAction)
    : baseAction;
}

export function transformWeaponActionForCharacter(
  character: Pick<
    Character,
    | "className"
    | "level"
    | "subclassId"
    | "abilities"
    | "classFeatureState"
    | "equipment"
    | "customEquipment"
    | "statusEntries"
  >,
  action: WeaponAction
): WeaponAction {
  const baseFeatureState = collectActiveClassFeatureState(character);
  const subclassDerivedState = getSubclassDerivedFeatureState(character);
  const baseAction = baseFeatureState.transformWeaponAction
    ? baseFeatureState.transformWeaponAction(action)
    : action;

  return subclassDerivedState.transformWeaponAction
    ? subclassDerivedState.transformWeaponAction(baseAction)
    : baseAction;
}

export function getFeatureActionOptionsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "abilities" | "feats">,
  actionKey: string
): FeatureActionOptionCard[] {
  const baseFeatureState = collectActiveClassFeatureState(character);
  const subclassDerivedState = getSubclassDerivedFeatureState(character);
  return [
    ...(baseFeatureState.actionOptions?.[actionKey] ?? []),
    ...(subclassDerivedState.featureActionOptions?.[actionKey] ?? [])
  ];
}

export function getFeatureDamageBonusesForWeaponAction(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<
      Pick<
        Character,
        "subclassId" | "roundTracker" | "equipment" | "customEquipment" | "statusEntries"
      >
    >,
  context: WeaponFeatureContext
): FeatureDamageBonus[] {
  const baseFeatureState = collectActiveClassFeatureState(character);
  const subclassDerivedState = getSubclassDerivedFeatureState(character);

  return [
    ...(baseFeatureState.getWeaponDamageBonuses?.(context) ?? []),
    ...(subclassDerivedState.getWeaponDamageBonuses?.(context) ?? []),
    ...getCustomTraitWeaponDamageBonuses(character.statusEntries, {
      attackKind: context.attackKind,
      combatType: context.combatType
    }).map((bonus) => ({
      label: bonus.label,
      value: bonus.value
    }))
  ];
}

export function hasBatteringRootsBonusForCharacter(
  character: Pick<Character, "className" | "level" | "roundTracker"> &
    Partial<Pick<Character, "subclassId">>,
  context: {
    attackKind: "weapon" | "unarmed";
    combatType?: WEAPON_COMBAT_TYPE | null;
    properties?: WEAPON_PROPERTY[];
  }
): boolean {
  return character.className === "Barbarian"
    ? hasBarbarianBatteringRootsBonus(character, context)
    : false;
}

export function getAdditionalWeaponMasteriesForCharacter(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>,
  context: {
    attackKind: "weapon" | "unarmed";
    combatType?: WEAPON_COMBAT_TYPE | null;
    properties?: WEAPON_PROPERTY[];
  }
): Array<{
  mastery: WEAPON_MASTERY;
  source: string;
}> {
  return character.className === "Barbarian"
    ? getBarbarianAdditionalWeaponMasteries(character, context)
    : [];
}

export function getSavingThrowIndicatorsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "statusEntries">
): SavingThrowIndicatorMap {
  const baseFeatureState = collectActiveClassFeatureState(character);
  const subclassDerivedState = getSubclassDerivedFeatureState(character);
  const exhaustionIndicators = hasExhaustionSavingThrowDisadvantage(character.statusEntries)
    ? (Object.fromEntries(
        abilityKeys.map((ability) => [ability, [exhaustionDisadvantageIndicator]])
      ) as SavingThrowIndicatorMap)
    : {};

  return mergeIndicatorMaps(
    baseFeatureState.savingThrowIndicators ?? {},
    subclassDerivedState.savingThrowIndicators ?? {},
    exhaustionIndicators
  );
}

export function getAbilityCheckIndicatorsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "statusEntries">
): AbilityCheckIndicatorMap {
  const baseFeatureState = collectActiveClassFeatureState(character);
  const subclassDerivedState = getSubclassDerivedFeatureState(character);
  const exhaustionIndicators = hasExhaustionAbilityCheckDisadvantage(character.statusEntries)
    ? (Object.fromEntries(
        abilityKeys.map((ability) => [ability, [exhaustionDisadvantageIndicator]])
      ) as AbilityCheckIndicatorMap)
    : {};

  return mergeIndicatorMaps(
    baseFeatureState.abilityCheckIndicators ?? {},
    subclassDerivedState.abilityCheckIndicators ?? {},
    exhaustionIndicators
  );
}

export function getCoreStatIndicatorsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): CoreStatIndicatorMap {
  const baseFeatureState = collectActiveClassFeatureState(character);
  return mergeIndicatorMaps(
    baseFeatureState.coreStatIndicators ?? {},
    getSubclassDerivedFeatureState(character).coreStatIndicators ?? {}
  );
}

export function getInitiativeBonusesForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "abilities"> &
    Partial<Pick<Character, "statusEntries" | "subclassId">>
): FeatureInitiativeBonus[] {
  const baseFeatureState = collectActiveClassFeatureState(character);
  const subclassDerivedState = getSubclassDerivedFeatureState(character);

  return [
    ...(baseFeatureState.getInitiativeBonuses?.() ?? []),
    ...(subclassDerivedState.getInitiativeBonuses?.() ?? []),
    ...getCustomTraitInitiativeBonuses(character.statusEntries).map((bonus) => ({
      label: bonus.label,
      value: bonus.value
    }))
  ];
}

export function getSkillIndicatorsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "statusEntries"> &
    Partial<Pick<Character, "subclassId">>
): SkillIndicatorMap {
  const baseFeatureState = collectActiveClassFeatureState(character);
  const subclassDerivedState = getSubclassDerivedFeatureState(character);
  const exhaustionIndicators = hasExhaustionAbilityCheckDisadvantage(character.statusEntries)
    ? (Object.fromEntries(
        ALL_SKILLS.map((skill) => [skill, [exhaustionDisadvantageIndicator]])
      ) as SkillIndicatorMap)
    : {};

  return mergeIndicatorMaps(
    baseFeatureState.skillIndicators ?? {},
    subclassDerivedState.skillIndicators ?? {},
    exhaustionIndicators
  );
}

export function getSkillReferenceDescriptionAdditionsForCharacter(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>,
  skill: SkillName
): SpellDescriptionEntry[][] {
  const descriptionAdditions: SpellDescriptionEntry[][] = [];

  if (character.className === "Rogue") {
    descriptionAdditions.push(...getRogueSkillReferenceDescriptionAdditions(character));
    descriptionAdditions.push(...getRogueThiefSkillReferenceDescriptionAdditions(character, skill));
  }

  return descriptionAdditions;
}

export function hasRogueThiefThiefsReflexesForCharacter(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): boolean {
  return hasRogueThiefThiefsReflexesFeature(character);
}

export function getSkillRollD20MinimumForCharacter(
  character: Pick<Character, "className" | "level">,
  _skill: SkillName
): number | null {
  if (character.className === "Rogue") {
    return getRogueSkillRollD20Minimum(character);
  }

  return null;
}

export function getWeaponAttackIndicatorsForCharacter(
  character: Pick<Character, "className" | "statusEntries"> & Partial<Pick<Character, "subclassId">>
): FeatureIndicator[] {
  const subclassDerivedState = getSubclassDerivedFeatureState(character);
  const baseIndicators = hasExhaustionAttackRollDisadvantage(character.statusEntries)
    ? [exhaustionDisadvantageIndicator]
    : [];

  return [...(subclassDerivedState.weaponAttackIndicators ?? []), ...baseIndicators];
}

export function getSkillBonusesForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "abilities">,
  skill: SkillName,
  proficiencyLevel: PROF_LEVEL
): FeatureSkillBonus[] {
  return collectActiveClassFeatureState(character).getSkillBonuses?.(skill, proficiencyLevel) ?? [];
}

export function getSavingThrowBonusesForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "statusEntries" | "subclassId">>,
  ability: AbilityKey
): FeatureSavingThrowBonus[] {
  const baseFeatureState = collectActiveClassFeatureState(character);
  const subclassDerivedState = getSubclassDerivedFeatureState(character);

  return [
    ...(baseFeatureState.getSavingThrowBonuses?.(ability) ?? []),
    ...(subclassDerivedState.getSavingThrowBonuses?.(ability) ?? []),
    ...getCustomTraitSavingThrowBonuses(character.statusEntries, ability).map((bonus) => ({
      label: bonus.label,
      value: bonus.value
    }))
  ];
}

export function getSpellcastingStateForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureSpellcastingState {
  return (
    collectActiveClassFeatureState(character).spellcastingState ?? {
      blocked: false,
      reason: null
    }
  );
}

export function getArmorClassModesForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId" | "equipment" | "customEquipment">>,
  context: ArmorClassFeatureContext
): FeatureArmorClassMode[] {
  const baseFeatureState = collectActiveClassFeatureState(character);
  const subclassDerivedState = getSubclassDerivedFeatureState(character);

  return [
    ...(baseFeatureState.getArmorClassModes?.(context) ?? []),
    ...(subclassDerivedState.getArmorClassModes?.(context) ?? [])
  ];
}

export function getArmorClassBonusesForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<
      Pick<
        Character,
        "abilities" | "customEquipment" | "equipment" | "statusEntries" | "subclassId"
      >
    >,
  context: ArmorClassFeatureContext
): FeatureArmorClassBonus[] {
  const baseFeatureState = collectActiveClassFeatureState(character);
  const subclassDerivedState = getSubclassDerivedFeatureState(character);

  return [
    ...(baseFeatureState.getArmorClassBonuses?.(context) ?? []),
    ...(subclassDerivedState.getArmorClassBonuses?.(context) ?? []),
    ...getCustomTraitArmorClassBonuses(character.statusEntries).map((bonus) => ({
      label: bonus.label,
      value: bonus.value
    }))
  ];
}

export function getSpeedBonusesForCharacter(
  character: Pick<
    Character,
    | "className"
    | "level"
    | "classFeatureState"
    | "equipment"
    | "customEquipment"
    | "statusEntries"
    | "subclassId"
  >,
  context: SpeedFeatureContext
): FeatureSpeedBonus[] {
  const baseFeatureState = collectActiveClassFeatureState(character);
  const subclassDerivedState = getSubclassDerivedFeatureState(character);
  return [
    ...(baseFeatureState.getSpeedBonuses?.(context) ?? []),
    ...(subclassDerivedState.speedBonuses ?? [])
  ];
}

export function getAbilityScoreBonusesForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "statusEntries">>
): FeatureAbilityScoreBonus[] {
  const baseFeatureState = collectActiveClassFeatureState(character);
  return [
    ...(baseFeatureState.abilityScoreBonuses ?? []),
    ...(getSubclassDerivedFeatureState(character).abilityScoreBonuses ?? []),
    ...abilityKeys.flatMap((ability) =>
      getCustomTraitAbilityScoreBonuses(character.statusEntries, ability).map((bonus) => ({
        ability,
        label: bonus.label,
        value: bonus.value
      }))
    )
  ];
}

export function getCantripLimitBonusForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): number {
  const subclassDerivedState = getSubclassDerivedFeatureState(character);
  return (
    (collectActiveClassFeatureState(character).cantripLimitBonus ?? 0) +
    (subclassDerivedState.cantripLimitBonus ?? 0)
  );
}

export function getMonkMartialArtsDieForCharacter(
  character: Pick<Character, "className" | "level">
) {
  return collectActiveClassFeatureState(character).monkMartialArtsDie ?? null;
}

export function getBardicInspirationDieForCharacter(
  character: Pick<Character, "className" | "level">
) {
  return collectActiveClassFeatureState(character).bardicInspirationDie ?? null;
}

export function getBardicInspirationUsesTotalForCharacter(
  character: Pick<Character, "className" | "level" | "abilities" | "classFeatureState" | "feats">
) {
  return getBardicInspirationUsesTotal(character);
}

export function getBardicInspirationUsesRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "abilities" | "classFeatureState" | "feats">
) {
  return getBardicInspirationUsesRemaining(character);
}

export function getBeguilingMagicUsesTotalForCharacter(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
) {
  return getBeguilingMagicUsesTotal(character);
}

export function getBeguilingMagicUsesRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
) {
  return getBeguilingMagicUsesRemaining(character);
}

export function getBlessingOfMoonlightUsesTotalForCharacter(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
) {
  return getBlessingOfMoonlightUsesTotal(character);
}

export function getBlessingOfMoonlightUsesRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
) {
  return getBlessingOfMoonlightUsesRemaining(character);
}

export function getMantleOfMajestyUsesTotalForCharacter(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
) {
  return getMantleOfMajestyUsesTotal(character);
}

export function getMantleOfMajestyUsesRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
) {
  return getMantleOfMajestyUsesRemaining(character);
}

export function getMantleOfMajestyFallbackSlotLevelForCharacter(
  character: Pick<Character, "className" | "level" | "spellSlotsExpended">
) {
  return getMantleOfMajestyFallbackSlotLevel(character);
}

export function hasActiveMantleOfMajestyForCharacter(
  character: Pick<Character, "className"> & Partial<Pick<Character, "subclassId" | "statusEntries">>
) {
  return hasActiveMantleOfMajesty(character);
}

export function getRogueSneakAttackDiceCountForCharacter(
  character: Pick<Character, "className" | "level">
) {
  return collectActiveClassFeatureState(character).rogueSneakAttackDiceCount ?? 0;
}

export function getRogueSneakAttackFormulaForCharacter(
  character: Pick<Character, "className" | "level">
) {
  return collectActiveClassFeatureState(character).rogueSneakAttackFormula ?? "0";
}

export function getMonkUnarmedDamageTypeLabelForCharacter(
  character: Pick<Character, "className" | "level">
) {
  return collectActiveClassFeatureState(character).monkUnarmedDamageTypeLabel ?? "Bludgeoning";
}

export function getUnarmedStrikeConfigForCharacter(
  character: Pick<Character, "className" | "level"> &
    Partial<
      Pick<
        Character,
        "subclassId" | "equipment" | "customEquipment" | "abilities" | "classFeatureState"
      >
    >
): FeatureUnarmedStrikeConfig | null {
  const baseFeatureState = collectActiveClassFeatureState(character);
  const subclassDerivedState = getSubclassDerivedFeatureState(character);
  const baseConfig = baseFeatureState.getUnarmedStrikeConfig?.() ?? null;
  const subclassConfig = subclassDerivedState.getUnarmedStrikeConfig?.() ?? null;

  if (!baseConfig && !subclassConfig) {
    return null;
  }

  return {
    ...(baseConfig ?? {}),
    ...(subclassConfig ?? {})
  };
}

export function getBarbarianRageDamageBonusForCharacter(
  character: Pick<Character, "className" | "level">
) {
  return getBarbarianRageDamageBonus(character);
}

export function canUseMonkMartialArtsForCharacter(
  character: Pick<Character, "className" | "level">,
  context: {
    hasWornBodyArmor: boolean;
    hasShieldEquipped: boolean;
    wieldsOnlyMonkWeaponsOrUnarmed: boolean;
  }
): boolean {
  return collectActiveClassFeatureState(character).canUseMonkMartialArts?.(context) ?? false;
}

export function getCantripDamageBonusForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "abilities" | "feats">
): number {
  return (
    (collectActiveClassFeatureState(character).cantripDamageBonus ?? 0) +
    (getSubclassDerivedFeatureState(character).cantripDamageBonus ?? 0)
  );
}

export function getFeatureWeaponProficiencyEntriesForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): FeatureWeaponProficiencyEntry[] {
  const baseFeatureState = collectActiveClassFeatureState(character);
  const subclassDerivedState = getSubclassDerivedFeatureState(character);
  return [
    ...(baseFeatureState.weaponProficiencyEntries ?? []),
    ...(subclassDerivedState.weaponProficiencyEntries ?? [])
  ];
}

export function getFeatureSkillProficiencyEntriesForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId" | "skillProficiencies">>
): FeatureSkillProficiencyEntry[] {
  const baseFeatureState = collectActiveClassFeatureState(character);
  const subclassDerivedState = getSubclassDerivedFeatureState(character);
  return [
    ...(baseFeatureState.skillProficiencyEntries ?? []),
    ...(subclassDerivedState.skillProficiencyEntries ?? [])
  ];
}

export function getFeatureSavingThrowProficiencyEntriesForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId" | "savingThrowProficiencies">>
): FeatureSavingThrowProficiencyEntry[] {
  const baseFeatureState = collectActiveClassFeatureState(character);
  const subclassDerivedState = getSubclassDerivedFeatureState(character);
  return [
    ...(baseFeatureState.savingThrowProficiencyEntries ?? []),
    ...(subclassDerivedState.savingThrowProficiencyEntries ?? [])
  ];
}

export function getFeatureArmorProficiencyEntriesForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): FeatureArmorProficiencyEntry[] {
  const baseFeatureState = collectActiveClassFeatureState(character);
  const subclassDerivedState = getSubclassDerivedFeatureState(character);
  return [
    ...(baseFeatureState.armorProficiencyEntries ?? []),
    ...(subclassDerivedState.armorProficiencyEntries ?? [])
  ];
}

export function getFeatureToolProficiencyEntriesForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): FeatureToolProficiencyEntry[] {
  const baseFeatureState = collectActiveClassFeatureState(character);
  const subclassDerivedState = getSubclassDerivedFeatureState(character);
  return [
    ...(baseFeatureState.toolProficiencyEntries ?? []),
    ...(subclassDerivedState.toolProficiencyEntries ?? [])
  ];
}

export function getFeatureLanguageProficiencyEntriesForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): FeatureLanguageProficiencyEntry[] {
  const baseFeatureState = collectActiveClassFeatureState(character);
  const subclassDerivedState = getSubclassDerivedFeatureState(character);
  return [
    ...(baseFeatureState.languageProficiencyEntries ?? []),
    ...(subclassDerivedState.languageProficiencyEntries ?? [])
  ];
}

export function applyBardBattleMagicAfterSpellCastForCharacter(
  character: Character,
  spell: Pick<SpellEntry, "castingTime">
): Character {
  return applyBardBattleMagicAfterSpellCast(character, spell);
}

export function activateBardicInspirationForCharacter(
  character: Character,
  fallbackSpellSlotLevel?: number
): Character {
  return activateBardicInspiration(character, fallbackSpellSlotLevel);
}

export function applySpellCastFeatureEffectsForCharacter(
  character: Character,
  spell: Pick<SpellEntry, "id" | "castingTime" | "magicSchool" | "spellLevel" | "spellLists">,
  options?: {
    includeBardBattleMagic?: boolean;
    spellSlotLevel?: number | null;
  }
): Character {
  const nextCharacter =
    options?.includeBardBattleMagic === false
      ? character
      : applyBardBattleMagicAfterSpellCast(character, spell);
  const nextCharacterWithSorcererEffects =
    spell.spellLevel > 0 && spell.spellLists.includes(SPELL_LIST_CLASS.SORCERER)
      ? restoreSorcererSubclassFeaturesOnSpellCast(nextCharacter)
      : nextCharacter;

  return applyWarlockFeaturesAfterSpellCast(
    applyWizardFeaturesAfterSpellCast(
      nextCharacterWithSorcererEffects,
      spell,
      options?.spellSlotLevel
    ),
    spell
  );
}

export function restoreSorcererSubclassFeaturesOnSpellSlotCastForCharacter(
  character: Character
): Character {
  return restoreSorcererSubclassFeaturesOnSpellSlotCast(character);
}

export function hasBattleMagicBonusWeaponAttackForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<
      Pick<
        Character,
        "subclassId" | "statusEntries" | "equipment" | "inventoryItems" | "customEquipment"
      >
    >,
  attackKind: "weapon" | "unarmed"
): boolean {
  return (
    hasClericWarPriestBonusAttackAvailable(character) ||
    (attackKind === "weapon" &&
      (hasBardBattleMagicBonusAttackAvailable(character) ||
        hasWizardSpellcastWeaponBonusActionAvailable(character) ||
        hasFighterPsiWarriorTelekineticMasterBonusAttackAvailable(character))) ||
    (attackKind === "unarmed" && getBardCollegeOfDanceUnarmedStrikeMultiCount(character) > 0)
  );
}

export function getBonusActionWeaponAttackMultiCountForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<
      Pick<
        Character,
        "subclassId" | "statusEntries" | "equipment" | "inventoryItems" | "customEquipment"
      >
    >,
  attackKind: "weapon" | "unarmed"
): number {
  return attackKind === "unarmed" ? getBardCollegeOfDanceUnarmedStrikeMultiCount(character) : 0;
}

export function getClericDivineOrderChoiceForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
) {
  return getClericDivineOrderChoice(character);
}

export function setClericDivineOrderChoiceForCharacter(
  character: Character,
  divineOrderChoice: "protector" | "thaumaturge"
): Character {
  return setClericDivineOrderChoice(character, divineOrderChoice);
}

export function getClericBlessedStrikesChoiceForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
) {
  return getClericBlessedStrikesChoice(character);
}

export function setClericBlessedStrikesChoiceForCharacter(
  character: Character,
  blessedStrikesChoice: "blessed-strike" | "potent-spellcasting"
): Character {
  return setClericBlessedStrikesChoice(character, blessedStrikesChoice);
}

export function getKnowledgeDomainBlessingsSkillSelectionsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
) {
  return getKnowledgeDomainBlessingsSkillSelections(character);
}

export function getKnowledgeDomainBlessingsToolSelectionForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
) {
  return getKnowledgeDomainBlessingsToolSelection(character);
}

export function setKnowledgeDomainBlessingsSkillSelectionsForCharacter(
  character: Character,
  selections: Parameters<typeof setKnowledgeDomainBlessingsSkillSelections>[1]
): Character {
  return setKnowledgeDomainBlessingsSkillSelections(character, selections);
}

export function setKnowledgeDomainBlessingsToolSelectionForCharacter(
  character: Character,
  selection: Parameters<typeof setKnowledgeDomainBlessingsToolSelection>[1]
): Character {
  return setKnowledgeDomainBlessingsToolSelection(character, selection);
}

export function getKnowledgeDomainUnfetteredMindSavingThrowSelectionForCharacter(
  character: Pick<
    Character,
    "className" | "level" | "classFeatureState" | "savingThrowProficiencies"
  > &
    Partial<Pick<Character, "subclassId">>
) {
  return getKnowledgeDomainUnfetteredMindSavingThrowSelection(character);
}

export function getKnowledgeDomainUnfetteredMindSavingThrowOptionsForCharacter(
  character: Pick<Character, "className" | "level" | "savingThrowProficiencies"> &
    Partial<Pick<Character, "subclassId" | "classFeatureState">>
) {
  return getKnowledgeDomainUnfetteredMindSavingThrowOptions(character);
}

export function isKnowledgeDomainUnfetteredMindLockedToIntForCharacter(
  character: Pick<Character, "className" | "level" | "savingThrowProficiencies"> &
    Partial<Pick<Character, "subclassId" | "classFeatureState">>
) {
  return isKnowledgeDomainUnfetteredMindLockedToInt(character);
}

export function setKnowledgeDomainUnfetteredMindSavingThrowSelectionForCharacter(
  character: Character,
  proficiency: Parameters<typeof setKnowledgeDomainUnfetteredMindSavingThrowSelection>[1]
): Character {
  return setKnowledgeDomainUnfetteredMindSavingThrowSelection(character, proficiency);
}

export function getBardExpertiseSelectionsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">,
  tier: "level2" | "level9"
) {
  return getBardExpertiseSelections(character, tier);
}

export function getBardLoreBonusProficiencySelectionsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
) {
  return getBardLoreBonusProficiencySelections(character);
}

export function getBardMagicalDiscoveriesSpellIdsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
) {
  return getBardMagicalDiscoveriesSpellIds(character);
}

export function getBardMagicalDiscoveriesSpellOptionsForCharacter(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
) {
  return getBardMagicalDiscoveriesSpellOptions(character);
}

export function getBardPrimalLoreCantripIdForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
) {
  return getBardPrimalLoreCantripId(character);
}

export function getBardPrimalLoreCantripOptionsForCharacter(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
) {
  return getBardPrimalLoreCantripOptions(character);
}

export function getBardPrimalLoreSkillOptionsForCharacter() {
  return getBardPrimalLoreSkillOptions();
}

export function getBardPrimalLoreSkillSelectionForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
) {
  return getBardPrimalLoreSkillSelection(character);
}

export function getRangerDeftExplorerExpertiseSelectionForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
) {
  return getRangerDeftExplorerExpertiseSelection(character);
}

export function getRangerFeyWandererGiftSelectionForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "classFeatureState" | "level" | "subclassId">>
) {
  return getRangerFeyWandererGiftSelection(character);
}

export function getRangerHunterPreyChoiceForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "classFeatureState" | "level" | "subclassId">>
) {
  return getRangerHunterPreyChoice(character);
}

export function getRangerHunterDefensiveTacticsChoiceForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "classFeatureState" | "level" | "subclassId">>
) {
  return getRangerHunterDefensiveTacticsChoice(character);
}

export function getRangerHunterSuperiorHuntersDefenseDamageTypeSelectionForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "classFeatureState" | "level" | "subclassId">>
) {
  return getRangerHunterSuperiorHuntersDefenseDamageTypeSelection(character);
}

export function getRangerOtherworldlyGlamourSkillSelectionForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "classFeatureState" | "level" | "subclassId">>
) {
  return getRangerOtherworldlyGlamourSkillSelection(character);
}

export function getRangerGloomStalkerIronMindSavingThrowSelectionForCharacter(
  character: Pick<
    Character,
    "className" | "classFeatureState" | "level" | "savingThrowProficiencies"
  > &
    Partial<Pick<Character, "subclassId">>
) {
  return getRangerGloomStalkerIronMindSavingThrowSelection(character);
}

export function getRangerGloomStalkerIronMindSavingThrowOptionsForCharacter(
  character: Pick<Character, "className" | "level" | "savingThrowProficiencies"> &
    Partial<Pick<Character, "classFeatureState" | "subclassId">>
) {
  return getRangerGloomStalkerIronMindSavingThrowOptions(character);
}

export function isRangerGloomStalkerIronMindLockedToWisForCharacter(
  character: Pick<Character, "className" | "level" | "savingThrowProficiencies"> &
    Partial<Pick<Character, "classFeatureState" | "subclassId">>
) {
  return isRangerGloomStalkerIronMindLockedToWis(character);
}

export function setRangerDeftExplorerExpertiseSelectionForCharacter(
  character: Character,
  selection: Parameters<typeof setRangerDeftExplorerExpertiseSelection>[1]
): Character {
  return setRangerDeftExplorerExpertiseSelection(character, selection);
}

export function setRangerFeyWandererGiftSelectionForCharacter(
  character: Character,
  selection: Parameters<typeof setRangerFeyWandererGiftSelection>[1]
): Character {
  return setRangerFeyWandererGiftSelection(character, selection);
}

export function setRangerHunterPreyChoiceForCharacter(
  character: Character,
  choice: RangerHunterPreyChoice | null
): Character {
  return setRangerHunterPreyChoice(character, choice);
}

export function setRangerHunterDefensiveTacticsChoiceForCharacter(
  character: Character,
  choice: RangerHunterDefensiveTacticsChoice | null
): Character {
  return setRangerHunterDefensiveTacticsChoice(character, choice);
}

export function setRangerHunterSuperiorHuntersDefenseDamageTypeSelectionForCharacter(
  character: Character,
  selection: Parameters<typeof setRangerHunterSuperiorHuntersDefenseDamageTypeSelection>[1]
): Character {
  return setRangerHunterSuperiorHuntersDefenseDamageTypeSelection(character, selection);
}

export function setRangerOtherworldlyGlamourSkillSelectionForCharacter(
  character: Character,
  selection: Parameters<typeof setRangerOtherworldlyGlamourSkillSelection>[1]
): Character {
  return setRangerOtherworldlyGlamourSkillSelection(character, selection);
}

export function setRangerGloomStalkerIronMindSavingThrowSelectionForCharacter(
  character: Character,
  proficiency: Parameters<typeof setRangerGloomStalkerIronMindSavingThrowSelection>[1]
): Character {
  return setRangerGloomStalkerIronMindSavingThrowSelection(character, proficiency);
}

export function setBardLoreBonusProficiencySelectionsForCharacter(
  character: Character,
  selections: Parameters<typeof setBardLoreBonusProficiencySelections>[1]
): Character {
  return setBardLoreBonusProficiencySelections(character, selections);
}

export function setBardMagicalDiscoveriesSpellIdsForCharacter(
  character: Character,
  spellIds: Parameters<typeof setBardMagicalDiscoveriesSpellIds>[1]
): Character {
  return setBardMagicalDiscoveriesSpellIds(character, spellIds);
}

export function setBardPrimalLoreCantripIdForCharacter(
  character: Character,
  spellId: Parameters<typeof setBardPrimalLoreCantripId>[1]
): Character {
  return setBardPrimalLoreCantripId(character, spellId);
}

export function setBardPrimalLoreSkillSelectionForCharacter(
  character: Character,
  skill: Parameters<typeof setBardPrimalLoreSkillSelection>[1]
): Character {
  return setBardPrimalLoreSkillSelection(character, skill);
}

export function getRangerDeftExplorerLanguageSelectionsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
) {
  return getRangerDeftExplorerLanguageSelections(character);
}

export function setRangerDeftExplorerLanguageSelectionsForCharacter(
  character: Character,
  selections: Parameters<typeof setRangerDeftExplorerLanguageSelections>[1]
): Character {
  return setRangerDeftExplorerLanguageSelections(character, selections);
}

export function getRangerLevel9ExpertiseSelectionsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
) {
  return getRangerLevel9ExpertiseSelections(character);
}

export function getRogueExpertiseSelectionsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">,
  tier: "level1" | "level6"
) {
  return getRogueExpertiseSelections(character, tier);
}

export function setRogueExpertiseSelectionsForCharacter(
  character: Character,
  tier: "level1" | "level6",
  selections: Parameters<typeof setRogueExpertiseSelections>[2]
): Character {
  return setRogueExpertiseSelections(character, tier, selections);
}

export function getRogueThievesCantLanguageSelectionForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
) {
  return getRogueThievesCantLanguageSelection(character);
}

export function setRogueThievesCantLanguageSelectionForCharacter(
  character: Character,
  selection: Parameters<typeof setRogueThievesCantLanguageSelection>[1]
): Character {
  return setRogueThievesCantLanguageSelection(character, selection);
}

export function getRogueScionOfTheThreeDreadAllegianceChoiceForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "classFeatureState" | "level" | "subclassId">>
) {
  return getRogueScionOfTheThreeDreadAllegianceChoice(character);
}

export function setRogueScionOfTheThreeDreadAllegianceChoiceForCharacter(
  character: Character,
  choice: Parameters<typeof setRogueScionOfTheThreeDreadAllegianceChoice>[1]
): Character {
  return setRogueScionOfTheThreeDreadAllegianceChoice(character, choice);
}

export function setRangerLevel9ExpertiseSelectionsForCharacter(
  character: Character,
  selections: Parameters<typeof setRangerLevel9ExpertiseSelections>[1]
): Character {
  return setRangerLevel9ExpertiseSelections(character, selections);
}

export function getBarbarianPrimalKnowledgeSkillOptionsForCharacter(
  character: Pick<Character, "className" | "level">
): SkillName[] {
  if (character.className !== "Barbarian" || character.level < 3) {
    return [];
  }

  return getBarbarianPrimalKnowledgeSkillOptions();
}

export function getBarbarianPrimalKnowledgeSkillSelectionForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): SkillName | null {
  return getBarbarianPrimalKnowledgeSkillSelection(character);
}

export { paladinOathOfTheNobleGeniesAuraOfElementalShieldingDamageTypeOptions };
export { rangerHunterSuperiorHuntersDefenseDamageTypeOptions };
export {
  paladinOathOfTheNobleGeniesGeniesSplendorSkillOptions,
  rangerFeyWandererGiftOptions,
  rangerOtherworldlyGlamourSkillOptions
};
export { fighterBanneretKnightlyEnvoySkillOptions };

export function getFighterBanneretKnightlyEnvoyLanguageSelectionForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "subclassId" | "classFeatureState">>
) {
  return getFighterBanneretKnightlyEnvoyLanguageSelection(character);
}

export function setFighterBanneretKnightlyEnvoyLanguageSelectionForCharacter(
  character: Character,
  selection: Parameters<typeof setFighterBanneretKnightlyEnvoyLanguageSelection>[1]
): Character {
  return setFighterBanneretKnightlyEnvoyLanguageSelection(character, selection);
}

export function getFighterBanneretKnightlyEnvoySkillSelectionForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "subclassId" | "classFeatureState">>
) {
  return getFighterBanneretKnightlyEnvoySkillSelection(character);
}

export function getPaladinOathOfTheNobleGeniesGeniesSplendorSkillSelectionForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "subclassId" | "classFeatureState">>
) {
  return getPaladinOathOfTheNobleGeniesGeniesSplendorSkillSelection(character);
}

export function getPaladinOathOfTheNobleGeniesAuraOfElementalShieldingDamageTypeSelectionForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "subclassId" | "classFeatureState" | "statusEntries">>
) {
  return getPaladinOathOfTheNobleGeniesAuraOfElementalShieldingDamageTypeSelection(character);
}

export function getFighterIndomitableUsesTotalForCharacter(
  character: Pick<Character, "className" | "level">
): number {
  return getFighterIndomitableUsesTotal(character);
}

export function getFighterSecondWindUsesTotalForCharacter(
  character: Pick<Character, "className" | "level">
): number {
  return getFighterSecondWindUsesTotal(character);
}

export function getFighterSecondWindUsesRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  return getFighterSecondWindUsesRemaining(character);
}

export function getFighterBattleMasterSuperiorityDiceTotalForCharacter(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return getFighterBattleMasterSuperiorityDiceTotal(character);
}

export function getFighterBattleMasterManeuverSelectionCountForCharacter(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return getFighterBattleMasterManeuverSelectionCount(character);
}

export function getFighterBattleMasterManeuverSelectionsForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "subclassId" | "classFeatureState">>
): string[] {
  return getFighterBattleMasterManeuverSelections(character);
}

export function getFighterBattleMasterSuperiorityDiceRemainingForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "subclassId" | "classFeatureState">>
): number {
  return getFighterBattleMasterSuperiorityDiceRemaining(character);
}

export function getFighterBattleMasterSuperiorityDieForCharacter(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): "d8" | "d10" | "d12" | null {
  return getFighterBattleMasterSuperiorityDie(character);
}

export function getFighterPsiWarriorEnergyDiceTotalForCharacter(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return getFighterPsiWarriorEnergyDiceTotal(character);
}

export function getFighterPsiWarriorEnergyDiceRemainingForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "subclassId" | "classFeatureState">>
): number {
  return getFighterPsiWarriorEnergyDiceRemaining(character);
}

export function getFighterPsiWarriorEnergyDieForCharacter(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): "d6" | "d8" | "d10" | "d12" | null {
  return getFighterPsiWarriorEnergyDie(character);
}

export function getFighterPsiWarriorProtectiveFieldFormulaForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "subclassId">>
): string | null {
  return getFighterPsiWarriorProtectiveFieldFormula(character);
}

export function getFighterPsiWarriorPsionicStrikeFormulaForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "subclassId">>
): string | null {
  return getFighterPsiWarriorPsionicStrikeFormula(character);
}

export function hasFighterPsiWarriorPsionicStrikeAvailableForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "subclassId" | "classFeatureState">>
): boolean {
  return hasFighterPsiWarriorPsionicStrikeAvailable(character);
}

export function getFighterPsiWarriorTelekineticMovementUsesTotalForCharacter(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return getFighterPsiWarriorTelekineticMovementUsesTotal(character);
}

export function getFighterPsiWarriorTelekineticMovementUsesRemainingForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "subclassId" | "classFeatureState">>
): number {
  return getFighterPsiWarriorTelekineticMovementUsesRemaining(character);
}

export function getFighterPsiWarriorTelekineticMasterUsesTotalForCharacter(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return getFighterPsiWarriorTelekineticMasterUsesTotal(character);
}

export function getFighterPsiWarriorTelekineticMasterUsesRemainingForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "subclassId" | "classFeatureState">>
): number {
  return getFighterPsiWarriorTelekineticMasterUsesRemaining(character);
}

export function getFighterIndomitableUsesRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  return getFighterIndomitableUsesRemaining(character);
}

export function consumeFighterIndomitableUseForCharacter(character: Character): Character {
  return consumeFighterIndomitableUse(character);
}

export function consumeFighterSecondWindUseForCharacter(character: Character): Character {
  return consumeFighterSecondWindUse(character);
}

export function expendFighterBattleMasterSuperiorityDieForCharacter(
  character: Character
): Character {
  return expendFighterBattleMasterSuperiorityDie(character);
}

export function restoreFighterBattleMasterSuperiorityDieForCharacter(
  character: Character
): Character {
  return restoreFighterBattleMasterSuperiorityDie(character);
}

export function restoreAllFighterBattleMasterSuperiorityDiceForCharacter(
  character: Character
): Character {
  return restoreAllFighterBattleMasterSuperiorityDice(character);
}

export function expendFighterPsiWarriorEnergyDieForCharacter(character: Character): Character {
  return expendFighterPsiWarriorEnergyDie(character);
}

export function consumeFighterPsiWarriorPsionicStrikeForCharacter(character: Character): Character {
  return consumeFighterPsiWarriorPsionicStrike(character);
}

export function restoreFighterPsiWarriorEnergyDieForCharacter(character: Character): Character {
  return restoreFighterPsiWarriorEnergyDie(character);
}

export function restoreAllFighterPsiWarriorEnergyDiceForCharacter(character: Character): Character {
  return restoreAllFighterPsiWarriorEnergyDice(character);
}

export function restoreFighterSecondWindOnShortRestForCharacter(character: Character): Character {
  return restoreFighterSecondWindOnShortRest(character);
}

export function restoreFighterSecondWindOnLongRestForCharacter(character: Character): Character {
  return restoreFighterSecondWindOnLongRest(character);
}

export function activateFighterPsiWarriorTelekineticMovementForCharacter(
  character: Character
): Character {
  return activateFighterPsiWarriorTelekineticMovement(character);
}

export function activateFighterPsiWarriorTelekineticMasterSpellCastForCharacter(
  character: Character
): Character {
  return activateFighterPsiWarriorTelekineticMasterSpellCast(character);
}

export function restoreFighterPsiWarriorTelekineticMasterOnLongRestForCharacter(
  character: Character
): Character {
  return restoreFighterPsiWarriorTelekineticMasterOnLongRest(character);
}

export function setFighterBattleMasterManeuverSelectionsForCharacter(
  character: Character,
  selections: string[]
): Character {
  return setFighterBattleMasterManeuverSelections(character, selections);
}

export function setFighterBanneretKnightlyEnvoySkillSelectionForCharacter(
  character: Character,
  selection: Parameters<typeof setFighterBanneretKnightlyEnvoySkillSelection>[1]
): Character {
  return setFighterBanneretKnightlyEnvoySkillSelection(character, selection);
}

export function setPaladinOathOfTheNobleGeniesGeniesSplendorSkillSelectionForCharacter(
  character: Character,
  selection: Parameters<typeof setPaladinOathOfTheNobleGeniesGeniesSplendorSkillSelection>[1]
): Character {
  return setPaladinOathOfTheNobleGeniesGeniesSplendorSkillSelection(character, selection);
}

export function setPaladinOathOfTheNobleGeniesAuraOfElementalShieldingDamageTypeSelectionForCharacter(
  character: Character,
  selection: Parameters<
    typeof setPaladinOathOfTheNobleGeniesAuraOfElementalShieldingDamageTypeSelection
  >[1]
): Character {
  return setPaladinOathOfTheNobleGeniesAuraOfElementalShieldingDamageTypeSelection(
    character,
    selection
  );
}

export function setBarbarianPrimalKnowledgeSkillSelectionForCharacter(
  character: Character,
  selection: Parameters<typeof setBarbarianPrimalKnowledgeSkillSelection>[1]
): Character {
  return setBarbarianPrimalKnowledgeSkillSelection(character, selection);
}

export function getBarbarianWildHeartAspectChoiceForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
) {
  return getBarbarianWildHeartAspectChoice(character);
}

export function setBarbarianWildHeartAspectChoiceForCharacter(
  character: Character,
  selection: Parameters<typeof setBarbarianWildHeartAspectChoice>[1]
): Character {
  return setBarbarianWildHeartAspectChoice(character, selection);
}

export function getWizardScholarSelectionForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): SkillName | null {
  return getWizardScholarSelection(character);
}

export function getWizardSavantSpellIdsForCharacter(
  character: Pick<Character, "className" | "level"> &
    Partial<Pick<Character, "classFeatureState" | "subclassId">>
): string[] {
  return getWizardSavantSpellIds(character);
}

export function setWizardScholarSelectionForCharacter(
  character: Character,
  selection: Parameters<typeof setWizardScholarSelection>[1]
): Character {
  return setWizardScholarSelection(character, selection);
}

export function setWizardSavantSpellIdsForCharacter(
  character: Character,
  spellIds: Parameters<typeof setWizardSavantSpellIds>[1]
): Character {
  return setWizardSavantSpellIds(character, spellIds);
}

export function getWizardSpellMasterySelectionForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "spellbookSpellIds">,
  spellLevel: Parameters<typeof getWizardSpellMasterySelection>[1]
): string | null {
  return getWizardSpellMasterySelection(character, spellLevel);
}

export function getWizardSpellMasterySpellIdsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "spellbookSpellIds">
): string[] {
  return getWizardSpellMasterySpellIds(character);
}

export function setWizardSpellMasterySelectionForCharacter(
  character: Character,
  spellLevel: Parameters<typeof setWizardSpellMasterySelection>[1],
  spellId: Parameters<typeof setWizardSpellMasterySelection>[2]
): Character {
  return setWizardSpellMasterySelection(character, spellLevel, spellId);
}

export function syncWizardSpellMasterySelectionsToSpellbookForCharacter(
  character: Character
): Character {
  return syncWizardSpellMasterySelectionsToSpellbook(character);
}

export function getWizardSignatureSpellIdsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "spellbookSpellIds">
): string[] {
  return getWizardSignatureSpellIds(character);
}

export function getWizardExpendedSignatureSpellIdsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "spellbookSpellIds">
): string[] {
  return getWizardExpendedSignatureSpellIds(character);
}

export function hasWizardSignatureSpellFreeCastAvailableForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "spellbookSpellIds">,
  spellId: string
): boolean {
  return hasWizardSignatureSpellFreeCastAvailable(character, spellId);
}

export function setWizardSignatureSpellIdsForCharacter(
  character: Character,
  spellIds: Parameters<typeof setWizardSignatureSpellIds>[1]
): Character {
  return setWizardSignatureSpellIds(character, spellIds);
}

export function syncWizardSignatureSpellsToSpellbookForCharacter(character: Character): Character {
  return syncWizardSignatureSpellsToSpellbook(character);
}

export function consumeWizardSignatureSpellFreeCastForCharacter(
  character: Character,
  spellId: string
): Character {
  return consumeWizardSignatureSpellFreeCast(character, spellId);
}

export function getWizardIllusionistPhantasmalCreaturesSpellOptionStateForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>,
  spell: Pick<SpellEntry, "id"> | null
) {
  return getWizardIllusionistPhantasmalCreaturesSpellOptionState(character, spell);
}

export function consumeWizardIllusionistPhantasmalCreaturesUseForCharacter(
  character: Character
): Character {
  return consumeWizardIllusionistPhantasmalCreaturesUse(character);
}

export function getWizardIllusionistIllusorySelfUsesTotalForCharacter(
  character: Pick<Character, "className" | "level" | "subclassId">
): number {
  return getWizardIllusionistIllusorySelfUsesTotal(character);
}

export function getWizardIllusionistIllusorySelfUsesRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): number {
  return getWizardIllusionistIllusorySelfUsesRemaining(character);
}

export function getWizardIllusionistIllusorySelfFallbackSlotSummaryForCharacter(
  character: Pick<Character, "className" | "level" | "spellSlotsExpended"> &
    Partial<Pick<Character, "subclassId">>
) {
  return getWizardIllusionistIllusorySelfFallbackSlotSummary(character);
}

export function consumeWizardIllusionistIllusorySelfUseForCharacter(
  character: Character
): Character {
  return consumeWizardIllusionistIllusorySelfUse(character);
}

export function getSorcererMetamagicDefinitionsForCharacter() {
  return getSorcererMetamagicDefinitions();
}

export function getSorcererMetamagicSelectionCountForCharacter(
  character: Pick<Character, "className" | "level">
) {
  return getSorcererMetamagicSelectionCount(character);
}

export function getSorcererMetamagicSelectionsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
) {
  return getSorcererMetamagicSelections(character);
}

export { sorcererDraconicElementalAffinityDamageTypeOptions };

export function getSorcererDraconicElementalAffinityDamageTypeSelectionForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "classFeatureState" | "level" | "subclassId">>
) {
  return getSorcererDraconicElementalAffinityDamageTypeSelection(character);
}

export function setSorcererDraconicElementalAffinityDamageTypeSelectionForCharacter(
  character: Character,
  damageType: Parameters<typeof setSorcererDraconicElementalAffinityDamageTypeSelection>[1]
): Character {
  return setSorcererDraconicElementalAffinityDamageTypeSelection(character, damageType);
}

export function setSorcererMetamagicSelectionsForCharacter(
  character: Character,
  selections: Parameters<typeof setSorcererMetamagicSelections>[1]
): Character {
  return setSorcererMetamagicSelections(character, selections);
}

export function getSorceryPointsTotalForCharacter(
  character: Pick<Character, "className" | "level">
) {
  return getSorceryPointsTotal(character);
}

export function getSorceryPointsRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
) {
  return getSorceryPointsRemaining(character);
}

export function restoreSorceryPointForCharacter(character: Character): Character {
  return restoreOneSorceryPoint(character);
}

export function expendSorceryPointForCharacter(character: Character): Character {
  return expendOneSorceryPoint(character);
}

export function restoreAllSorceryPointsForCharacter(character: Character): Character {
  return restoreAllSorceryPoints(character);
}

export function convertSpellSlotToSorceryPointsForCharacter(
  character: Character,
  spellSlotLevel: number
): Character {
  return convertSpellSlotToSorceryPoints(character, spellSlotLevel);
}

export function createSpellSlotFromSorceryPointsForCharacter(
  character: Character,
  spellSlotLevel: number
): Character {
  return createSpellSlotFromSorceryPoints(character, spellSlotLevel);
}

export function getInnateSorceryUsesTotalForCharacter(
  character: Pick<Character, "className" | "level">
) {
  return getInnateSorceryUsesTotal(character);
}

export function getInnateSorceryUsesRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
) {
  return getInnateSorceryUsesRemaining(character);
}

export function activateInnateSorceryForCharacter(
  character: Character,
  options?: Parameters<typeof activateInnateSorcery>[1]
) {
  return activateInnateSorcery(character, options);
}

export function getSorcererSpellfireCrownOfSpellfireUsesTotalForCharacter(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
) {
  return getSorcererSubclassCrownOfSpellfireUsesTotal(character);
}

export function getSorcererSpellfireCrownOfSpellfireUsesRemainingForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "classFeatureState" | "level" | "subclassId">>
) {
  return getSorcererSubclassCrownOfSpellfireUsesRemaining(character);
}

export function getSorcererSpellfireCrownOfSpellfireFallbackSorceryPointCostForCharacter(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
) {
  return getSorcererSubclassCrownOfSpellfireFallbackSorceryPointCost(character);
}

export const sorcererRestoreBalanceReactionEntryId = sorcererRestoreBalanceReactionId;
export { sorcererBendLuckReactionEntryId };

export function getSorcererRestoreBalanceUsesTotalForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "subclassId">>
): number {
  return getSorcererSubclassRestoreBalanceUsesTotal(character);
}

export function getSorcererRestoreBalanceUsesRemainingForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "classFeatureState" | "level" | "subclassId">>
): number {
  return getSorcererSubclassRestoreBalanceUsesRemaining(character);
}

export function consumeSorcererRestoreBalanceUseForCharacter(character: Character): Character {
  return consumeSorcererSubclassRestoreBalanceUse(character);
}

export function getAlwaysPreparedSpellIdsForCharacter(
  character: Pick<
    Character,
    "className" | "level" | "classFeatureState" | "spellbookSpellIds" | "subclassId"
  > &
    Partial<Pick<Character, "statusEntries">>
): string[] {
  const baseFeatureState = collectActiveClassFeatureState(character);
  const subclassDerivedState = getSubclassDerivedFeatureState(character);
  return [
    ...new Set([
      ...(baseFeatureState.alwaysPreparedSpellIds ?? []),
      ...(subclassDerivedState.alwaysPreparedSpellIds ?? [])
    ])
  ];
}

export function getAlwaysSpellbookSpellIdsForCharacter(
  character: Pick<
    Character,
    "className" | "level" | "classFeatureState" | "spellbookSpellIds" | "subclassId"
  >
): string[] {
  const baseFeatureState = collectActiveClassFeatureState(character);
  const subclassDerivedState = getSubclassDerivedFeatureState(character);
  return [
    ...new Set([
      ...(baseFeatureState.alwaysSpellbookSpellIds ?? []),
      ...(subclassDerivedState.alwaysSpellbookSpellIds ?? [])
    ])
  ];
}

export function getRitualOnlySpellIdsForCharacter(
  character: Pick<
    Character,
    "className" | "level" | "classFeatureState" | "spellbookSpellIds" | "subclassId"
  >
): string[] {
  const baseFeatureState = collectActiveClassFeatureState(character);
  const subclassDerivedState = getSubclassDerivedFeatureState(character);
  return [
    ...new Set([
      ...(baseFeatureState.ritualOnlySpellIds ?? []),
      ...(subclassDerivedState.ritualOnlySpellIds ?? [])
    ])
  ];
}

export function getWarlockEldritchInvocationLimitForCharacter(
  character: Pick<Character, "className" | "level">
) {
  return getWarlockEldritchInvocationLimit(character);
}

export function getWarlockMagicalCunningUsesTotalForCharacter(
  character: Pick<Character, "className" | "level">
) {
  return getWarlockMagicalCunningUsesTotal(character);
}

export function getWarlockMagicalCunningUsesRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
) {
  return getWarlockMagicalCunningUsesRemaining(character);
}

export function getContactPatronUsesTotalForCharacter(
  character: Pick<Character, "className" | "level">
) {
  return getContactPatronUsesTotal(character);
}

export function getContactPatronUsesRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
) {
  return getContactPatronUsesRemaining(character);
}

export function getWarlockStepsOfTheFeyUsesTotalForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "subclassId">>
) {
  return getWarlockStepsOfTheFeyUsesTotal(character);
}

export function getWarlockStepsOfTheFeyUsesRemainingForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "classFeatureState" | "level" | "subclassId">>
) {
  return getWarlockStepsOfTheFeyUsesRemaining(character);
}

export function getWarlockHealingLightDiceTotalForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "subclassId">>
) {
  return getWarlockHealingLightDiceTotal(character);
}

export function getWarlockHealingLightDiceRemainingForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "classFeatureState" | "level" | "subclassId">>
) {
  return getWarlockHealingLightDiceRemaining(character);
}

export function getWarlockHealingLightMaxSpendForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "subclassId">>
) {
  return getWarlockHealingLightMaxSpend(character);
}

export function getWarlockBeguilingDefenseUsesTotalForCharacter(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
) {
  return getWarlockBeguilingDefenseUsesTotal(character);
}

export function getWarlockBeguilingDefenseUsesRemainingForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "classFeatureState" | "level" | "subclassId">>
) {
  return getWarlockBeguilingDefenseUsesRemaining(character);
}

export { warlockFiendPatronFiendishResilienceDamageTypeOptions };

export function getWarlockFiendishResilienceDamageTypeSelectionForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "classFeatureState" | "level" | "subclassId">>
) {
  return getWarlockFiendishResilienceDamageTypeSelection(character);
}

export function getWarlockPactMagicSlotTotalForCharacter(
  character: Pick<Character, "className" | "level">
) {
  return getWarlockPactMagicSlotTotal(character);
}

export function getWarlockPactMagicSlotsRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "spellSlotsExpended">
) {
  return getWarlockPactMagicSlotsRemaining(character);
}

export const warlockBeguilingDefenseReactionEntryId = warlockBeguilingDefenseReactionId;

export function getWarlockMysticArcanumSelectionsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "cantripIds" | "feats">
) {
  return getWarlockMysticArcanumSelections(character);
}

export function getWarlockMysticArcanumSpellIdForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "cantripIds" | "feats">,
  spellLevel: Parameters<typeof getWarlockMysticArcanumSpellId>[1]
) {
  return getWarlockMysticArcanumSpellId(character, spellLevel);
}

export function getWarlockMysticArcanumSpellOptionsForCharacter(
  character: Pick<Character, "className" | "level">,
  spellLevel: Parameters<typeof getWarlockMysticArcanumSpellOptions>[1]
) {
  return getWarlockMysticArcanumSpellOptions(character, spellLevel);
}

export function setWarlockMysticArcanumSpellIdForCharacter(
  character: Character,
  spellLevel: Parameters<typeof setWarlockMysticArcanumSpellId>[1],
  spellId: Parameters<typeof setWarlockMysticArcanumSpellId>[2]
): Character {
  return setWarlockMysticArcanumSpellId(character, spellLevel, spellId);
}

export function setWarlockFiendishResilienceDamageTypeSelectionForCharacter(
  character: Character,
  damageType: Parameters<typeof setWarlockFiendishResilienceDamageTypeSelection>[1]
): Character {
  return setWarlockFiendishResilienceDamageTypeSelection(character, damageType);
}

export function getWarlockInvocationSelectionIdsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "cantripIds" | "feats">
) {
  return getWarlockInvocationSelectionIds(character);
}

export function normalizeWarlockInvocationSelectionIdsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "cantripIds" | "feats"> &
    Partial<Pick<Character, "abilities" | "subclassId">>,
  selectionIds: string[]
) {
  return normalizeWarlockInvocationSelectionIds(character, selectionIds);
}

export function getWarlockInvocationOptionsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "cantripIds" | "feats">,
  selectedIds?: string[]
) {
  return getWarlockInvocationOptions(character, selectedIds);
}

export function getWarlockLearnedInvocationOptionsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "cantripIds" | "feats">
) {
  return getWarlockLearnedInvocationOptions(character);
}

export function getWarlockInvocationBlockingSelectionNamesForCharacter(
  selectionId: string,
  selectedIds: string[]
) {
  return getWarlockInvocationBlockingSelectionNames(selectionId, selectedIds);
}

export function setWarlockInvocationSelectionIdsForCharacter(
  character: Character,
  selectionIds: string[]
): Character {
  return setWarlockInvocationSelectionIds(character, selectionIds);
}

export function setBardExpertiseSelectionsForCharacter(
  character: Character,
  tier: "level2" | "level9",
  selections: Parameters<typeof setBardExpertiseSelections>[2]
): Character {
  return setBardExpertiseSelections(character, tier, selections);
}

export function getDruidPrimalOrderChoiceForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
) {
  return getDruidPrimalOrderChoice(character);
}

export function getDruidCircleOfTheLandChoiceForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "subclassId">
) {
  return getDruidCircleOfTheLandChoice(character);
}

export function getDruidElementalFuryChoiceForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
) {
  return getDruidElementalFuryChoice(character);
}

export function setDruidPrimalOrderChoiceForCharacter(
  character: Character,
  primalOrderChoice: "magician" | "warden"
): Character {
  return setDruidPrimalOrderChoice(character, primalOrderChoice);
}

export function setDruidCircleOfTheLandChoiceForCharacter(
  character: Character,
  circleOfTheLandChoice: "arid" | "polar" | "temperate" | "tropical"
): Character {
  return setDruidCircleOfTheLandChoice(character, circleOfTheLandChoice);
}

export function setDruidElementalFuryChoiceForCharacter(
  character: Character,
  elementalFuryChoice: "potent-spellcasting" | "primal-strike"
): Character {
  return setDruidElementalFuryChoice(character, elementalFuryChoice);
}

export function getDruidWildShapeRulesForCharacter(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
) {
  return getDruidWildShapeRules(character);
}

export function getDruidWildShapeKnownFormsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
) {
  return getDruidWildShapeKnownForms(character);
}

export function getDruidWildShapeActiveFormForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
) {
  return getDruidWildShapeActiveForm(character);
}

export function getDruidWildShapeUsesTotalForCharacter(
  character: Pick<Character, "className" | "level">
) {
  return getDruidWildShapeUsesTotal(character);
}

export function getDruidWildShapeUsesRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
) {
  return getDruidWildShapeUsesRemaining(character);
}

export function getDruidStarMapGuidingBoltUsesTotalForCharacter(
  character: Pick<Character, "className" | "level"> &
    Partial<Pick<Character, "subclassId" | "abilities">>
) {
  return getDruidStarMapGuidingBoltUsesTotal(character);
}

export function getDruidStarMapGuidingBoltUsesRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId" | "abilities">>
) {
  return getDruidStarMapGuidingBoltUsesRemaining(character);
}

export function getDruidCosmicOmenUsesTotalForCharacter(
  character: Pick<Character, "className" | "level"> &
    Partial<Pick<Character, "subclassId" | "abilities">>
) {
  return getDruidCosmicOmenUsesTotal(character);
}

export function getDruidCosmicOmenUsesRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId" | "abilities">>
) {
  return getDruidCosmicOmenUsesRemaining(character);
}

export function getDruidCosmicOmenSelectionForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId" | "abilities">>
) {
  return getDruidCosmicOmenSelection(character);
}

export function getDruidActiveStarryFormConstellationForCharacter(
  character: Pick<Character, "statusEntries">
) {
  return getDruidActiveStarryFormConstellation(character);
}

export function hasDruidTwinklingConstellationsFeatureForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "subclassId" | "abilities">>
) {
  return hasDruidTwinklingConstellationsFeature(character);
}

export function getDruidNaturalRecoveryUsesTotalForCharacter(
  character: Pick<Character, "className" | "level" | "subclassId">
) {
  return getDruidNaturalRecoveryUsesTotal(character);
}

export function getDruidNaturalRecoveryUsesRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "subclassId">
) {
  return getDruidNaturalRecoveryUsesRemaining(character);
}

export function getDruidNatureMagicianUsesTotalForCharacter(
  character: Pick<Character, "className" | "level">
) {
  return getDruidNatureMagicianUsesTotal(character);
}

export function getDruidNatureMagicianUsesRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
) {
  return getDruidNatureMagicianUsesRemaining(character);
}

export function getDruidNatureMagicianOptionsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "spellSlotsExpended">
) {
  return getDruidNatureMagicianOptions(character);
}

export function getDruidWildResurgenceSpellSlotRecoveryUsesTotalForCharacter(
  character: Pick<Character, "className" | "level">
) {
  return getDruidWildResurgenceSpellSlotRecoveryUsesTotal(character);
}

export function getDruidWildResurgenceSpellSlotRecoveryUsesRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
) {
  return getDruidWildResurgenceSpellSlotRecoveryUsesRemaining(character);
}

export function getDruidWildResurgenceAvailableSpellSlotLevelsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "spellSlotsExpended">
) {
  return getDruidWildResurgenceAvailableSpellSlotLevels(character);
}

export function setDruidWildShapeKnownFormsForCharacter(
  character: Character,
  monsters: Parameters<typeof setDruidWildShapeKnownForms>[1]
): Character {
  return setDruidWildShapeKnownForms(character, monsters);
}

export function activateDruidWildShapeForCharacter(
  character: Character,
  monsterSlug: string
): Character {
  return activateDruidWildShape(character, monsterSlug);
}

export function activateDruidWildCompanionForCharacter(
  character: Character,
  activation: Parameters<typeof activateDruidWildCompanion>[1]
): Character {
  return activateDruidWildCompanion(character, activation);
}

export function activateDruidNatureMagicianForCharacter(
  character: Character,
  spellSlotLevel: number
): Character {
  return activateDruidNatureMagician(character, spellSlotLevel);
}

export function activateDruidStarryFormForCharacter(
  character: Character,
  constellation: Parameters<typeof activateDruidStarryForm>[1]
): Character {
  return activateDruidStarryForm(character, constellation);
}

export function setDruidCosmicOmenSelectionForCharacter(
  character: Character,
  selection: Parameters<typeof setDruidCosmicOmenSelection>[1]
): Character {
  return setDruidCosmicOmenSelection(character, selection);
}

export function setDruidActiveStarryFormConstellationForCharacter(
  character: Character,
  constellation: Parameters<typeof setDruidActiveStarryFormConstellation>[1]
): Character {
  return setDruidActiveStarryFormConstellation(character, constellation);
}

export function consumeDruidCosmicOmenUseForCharacter(character: Character): Character {
  return consumeDruidCosmicOmenUse(character);
}

export function consumeDruidStarMapGuidingBoltUseForCharacter(character: Character): Character {
  return consumeDruidStarMapGuidingBoltUse(character);
}

export function consumeDruidNaturalRecoveryUseForCharacter(character: Character): Character {
  return consumeDruidNaturalRecoveryUse(character);
}

export function activateDruidWildResurgenceWildShapeRecoveryForCharacter(
  character: Character,
  spellSlotLevel: number
): Character {
  return activateDruidWildResurgenceWildShapeRecovery(character, spellSlotLevel);
}

export function activateDruidWildResurgenceLevelOneSpellSlotRecoveryForCharacter(
  character: Character
): Character {
  return activateDruidWildResurgenceLevelOneSpellSlotRecovery(character);
}

export function restoreDruidWildShapeUseForCharacter(character: Character): Character {
  return restoreOneDruidWildShapeUse(character);
}

export function restoreAllDruidWildShapeUsesForCharacter(character: Character): Character {
  return restoreAllDruidWildShapeUses(character);
}

export function restoreDruidCosmicOmenOnLongRestForCharacter(character: Character): Character {
  return restoreDruidCosmicOmenOnLongRest(character);
}

export function expendDruidWildShapeUseForCharacter(character: Character): Character {
  return expendOneDruidWildShapeUse(character);
}

export function applyArchdruidOnInitiativeForCharacter(character: Character): Character {
  return applyArchdruidOnInitiative(character);
}

export function getDruidWildShapeIneligibilityReasonForCharacter(
  monster: Parameters<typeof getDruidWildShapeIneligibilityReason>[0],
  character: Pick<Character, "className" | "level">
) {
  return getDruidWildShapeIneligibilityReason(monster, character);
}

export function getWeaponMasterySelectionCountForCharacter(
  character: Pick<Character, "className" | "level">
): number {
  return collectActiveClassFeatureState(character).weaponMastery?.selectionCount ?? 0;
}

export function getWeaponMasteryOptionsForCharacter(
  character: Pick<Character, "className" | "level">
): WEAPON_PROFICIENCY[] {
  return collectActiveClassFeatureState(character).weaponMastery?.options ?? [];
}

export function getWeaponMasterySelectionsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): WEAPON_PROFICIENCY[] {
  return collectActiveClassFeatureState(character).weaponMastery?.selections ?? [];
}

export function setWeaponMasterySelectionsForCharacter(
  character: Character,
  selections: WEAPON_PROFICIENCY[]
): Character {
  return (
    collectActiveClassFeatureState(character).weaponMastery?.setSelections(character, selections) ??
    character
  );
}

export function applySuperiorInspirationOnInitiativeForCharacter(character: Character): Character {
  return applySuperiorInspirationOnInitiative(character);
}

export function expendBardicInspirationUseForCharacter(character: Character): Character {
  return expendBardicInspirationUse(character);
}

export function activateBardCollegeOfDanceInspiringMovementForCharacter(
  character: Character
): Character {
  return activateBardCollegeOfDanceInspiringMovement(character);
}

export function restoreBardicInspirationUseForCharacter(character: Character): Character {
  return restoreBardicInspirationUse(character);
}

export function restoreAllBardicInspirationUsesForCharacter(character: Character): Character {
  return restoreAllBardicInspirationUses(character);
}

export function consumeBeguilingMagicOrBardicInspirationForCharacter(
  character: Character
): Character {
  return consumeBeguilingMagicOrBardicInspiration(character);
}

export function consumeBlessingOfMoonlightUseForCharacter(character: Character): Character {
  return consumeBlessingOfMoonlightUse(character);
}

export function consumeMantleOfMajestyUseForCharacter(character: Character): Character {
  return consumeMantleOfMajestyUse(character);
}

export function applyMantleOfMajestyStatusForCharacter(character: Character): Character {
  return applyMantleOfMajestyStatus(character);
}

export function applyInspiredEclipseStatusForCharacter(character: Character): Character {
  return applyInspiredEclipseStatus(character);
}

export function applyPerfectFocusOnInitiativeForCharacter(character: Character): Character {
  return applyPerfectFocusOnInitiative(character);
}

export function applyMonkUncannyMetabolismOnInitiativeForCharacter(
  character: Character
): Character {
  return applyMonkUncannyMetabolismOnInitiative(character);
}

export function applyPersistentRageOnInitiativeForCharacter(character: Character): Character {
  return applyPersistentRageOnInitiative(character);
}

export function getBarbarianPersistentRageUsesTotalForCharacter(
  character: Pick<Character, "className" | "level">
): number {
  return getBarbarianPersistentRageUsesTotal(character);
}

export function getBarbarianPersistentRageUsesRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  return getBarbarianPersistentRageUsesRemaining(character);
}

export function getBarbarianRageUsesTotalForCharacter(
  character: Pick<Character, "className" | "level">
): number {
  return getBarbarianRageUsesTotal(character);
}

export function getBarbarianRageUsesRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  return getBarbarianRageUsesRemaining(character);
}

export function expendBarbarianRageUseForCharacter(character: Character): Character {
  return expendBarbarianRageUse(character);
}

export function restoreBarbarianRageUseForCharacter(character: Character): Character {
  return restoreBarbarianRageUse(character);
}

export function restoreAllBarbarianRageUsesForCharacter(character: Character): Character {
  return restoreAllBarbarianRageUses(character);
}

export function activateBarbarianBerserkerRetaliationForCharacter(character: Character): Character {
  return activateBarbarianBerserkerRetaliation(character);
}

export function getBarbarianWarriorOfTheGodsUsesTotalForCharacter(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): number {
  return getBarbarianWarriorOfTheGodsUsesTotal(character);
}

export function getBarbarianWarriorOfTheGodsUsesRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): number {
  return getBarbarianWarriorOfTheGodsUsesRemaining(character);
}

export function hasPerfectFocusForCharacter(
  character: Pick<Character, "className" | "level">
): boolean {
  return hasMonkPerfectFocus(character);
}

export function getDerivedFeatureStatusEntriesForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "statusEntries">
): DerivedFeatureStatusEntry[] {
  const baseFeatureState = collectActiveClassFeatureState(character);
  const subclassDerivedState = getSubclassDerivedFeatureState(character);
  return [
    ...(baseFeatureState.derivedStatusEntries ?? []),
    ...(subclassDerivedState.derivedStatusEntries ?? [])
  ];
}

export function getSpellEntryForCharacter(
  character: Pick<Character, "className" | "level"> &
    Partial<Pick<Character, "subclassId" | "statusEntries" | "classFeatureState" | "feats">>,
  spell: SpellEntry
): SpellEntry {
  const baseFeatureState = collectActiveClassFeatureState(character);
  const subclassDerivedState = getSubclassDerivedFeatureState(character);
  const baseSpellEntry = baseFeatureState.transformSpellEntry
    ? baseFeatureState.transformSpellEntry(spell)
    : spell;

  return subclassDerivedState.transformSpellEntry
    ? subclassDerivedState.transformSpellEntry(baseSpellEntry)
    : baseSpellEntry;
}

export function getSpellbookSpellEntryForCharacter(
  character: Pick<Character, "className" | "level"> &
    Partial<Pick<Character, "subclassId" | "statusEntries" | "classFeatureState" | "feats">>,
  spell: SpellEntry
): SpellEntry {
  return character.className === "Wizard" ? getWizardSpellbookSpellEntry(character, spell) : spell;
}

export function getFeatureReactionSpellForCharacter(
  character: Pick<Character, "className" | "level"> &
    Partial<Pick<Character, "subclassId" | "statusEntries" | "classFeatureState" | "feats">>,
  reactionEntryId: string
): SpellEntry | null {
  const warlockReactionSpellDefinition = getWarlockFeatureReactionSpellDefinition(reactionEntryId);

  if (warlockReactionSpellDefinition) {
    const spell = getSpellEntryById(warlockReactionSpellDefinition.spellId);

    return spell
      ? warlockReactionSpellDefinition.transformSpellEntry(
          getSpellEntryForCharacter(character, spell)
        )
      : null;
  }

  return null;
}

export function getSpellDamageFormulaOverrideForCharacter(
  character: Pick<Character, "className" | "level">,
  spell: Pick<SpellEntry, "id">
): string | null {
  const baseFeatureState = collectActiveClassFeatureState(character);
  const subclassDerivedState = getSubclassDerivedFeatureState(character);
  return (
    subclassDerivedState.spellDamageFormulaOverrides?.[spell.id] ??
    subclassDerivedState.getSpellDamageFormulaOverride?.(spell) ??
    baseFeatureState.getSpellDamageFormulaOverride?.(spell) ??
    null
  );
}

export function getFeatureReactionEntriesForCharacter(
  character: Pick<Character, "className" | "level">
): ReactionEntry[] {
  const baseFeatureState = collectActiveClassFeatureState(character);
  const subclassDerivedState = getSubclassDerivedFeatureState(character);
  return [
    ...(baseFeatureState.reactionEntries ?? []),
    ...(subclassDerivedState.reactionEntries ?? [])
  ];
}

export function activateFeatureActionForCharacter(
  character: Character,
  actionKey: string
): Character {
  return (
    getActiveClassFeatureModule(character.className)?.handleAction?.(character, actionKey) ??
    character
  );
}

export function activateClericBlessingOfTheTricksterForCharacter(
  character: Character,
  target: "self" | "other"
): Character {
  return activateClericBlessingOfTheTrickster(character, target);
}

export const clericWardingFlareReactionEntryId = wardingFlareReactionEntryId;
export const clericGuidedStrikeReactionEntryId = guidedStrikeReactionEntryId;

export function getClericWardingFlareUsesTotalForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "subclassId">>
): number {
  return getClericWardingFlareUsesTotal(character);
}

export function getClericWardingFlareUsesRemainingForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "subclassId" | "classFeatureState">>
): number {
  return getClericWardingFlareUsesRemaining(character);
}

export function consumeClericWardingFlareUseForCharacter(character: Character): Character {
  return consumeClericWardingFlareUse(character);
}

export function consumeClericGuidedStrikeReactionForCharacter(character: Character): Character {
  return consumeClericGuidedStrikeReaction(character);
}

export function getMonkFocusPointsTotalForCharacter(
  character: Pick<Character, "className" | "level">
): number {
  return getMonkFocusPointsTotal(character);
}

export function getMonkUncannyMetabolismUsesTotalForCharacter(
  character: Pick<Character, "className" | "level">
): number {
  return getMonkUncannyMetabolismUsesTotal(character);
}

export function getMonkUncannyMetabolismUsesRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  return getMonkUncannyMetabolismUsesRemaining(character);
}

export function getPaladinHealingPoolTotalForCharacter(
  character: Pick<Character, "className" | "level">
): number {
  return getPaladinHealingPoolTotal(character);
}

export function getPaladinHealingPoolRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  return getPaladinHealingPoolRemaining(character);
}

export function getRangerFavoredEnemyUsesTotalForCharacter(
  character: Pick<Character, "className" | "level">
): number {
  return getRangerFavoredEnemyUsesTotal(character);
}

export function getRangerFavoredEnemyUsesRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "abilities">>
): number {
  return getRangerFavoredEnemyUsesRemaining(character);
}

export function consumeRangerFavoredEnemyUseForCharacter(character: Character): Character {
  return consumeRangerFavoredEnemyUse(character);
}

export function getRangerTirelessUsesTotalForCharacter(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "abilities">>
): number {
  return getRangerTirelessUsesTotal(character);
}

export function getRangerNaturesVeilUsesTotalForCharacter(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "abilities">>
): number {
  return getRangerNaturesVeilUsesTotal(character);
}

export function getRangerFeyReinforcementsUsesTotalForCharacter(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): number {
  return getRangerFeyReinforcementsUsesTotal(character);
}

export function getRangerMistyWandererUsesTotalForCharacter(
  character: Pick<Character, "className" | "level"> &
    Partial<Pick<Character, "abilities" | "subclassId">>
): number {
  return getRangerMistyWandererUsesTotal(character);
}

export function getRangerGloomStalkerDreadAmbusherUsesTotalForCharacter(
  character: Pick<Character, "className" | "level"> &
    Partial<Pick<Character, "abilities" | "subclassId">>
): number {
  return getRangerGloomStalkerDreadAmbusherUsesTotal(character);
}

export function getRangerWinterWalkerChillingRetributionUsesTotalForCharacter(
  character: Pick<Character, "className" | "level"> &
    Partial<Pick<Character, "abilities" | "subclassId">>
): number {
  return getRangerWinterWalkerChillingRetributionUsesTotal(character);
}

export function getRangerWinterWalkerFrozenHauntUsesTotalForCharacter(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): number {
  return getRangerWinterWalkerFrozenHauntUsesTotal(character);
}

export function getRangerTirelessUsesRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "abilities">>
): number {
  return getRangerTirelessUsesRemaining(character);
}

export function getRogueStrokeOfLuckUsesTotalForCharacter(
  character: Pick<Character, "className" | "level">
): number {
  return getRogueStrokeOfLuckUsesTotal(character);
}

export function getRogueSpellThiefUsesTotalForCharacter(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): number {
  return getRogueSpellThiefUsesTotal(character);
}

export function getRogueSpellThiefUsesRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): number {
  return getRogueSpellThiefUsesRemaining(character);
}

export function getRogueSoulknifePsionicDiceTotalForCharacter(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): number {
  return getRogueSoulknifePsionicDiceTotal(character);
}

export function getRogueSoulknifePsionicDiceRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): number {
  return getRogueSoulknifePsionicDiceRemaining(character);
}

export function getRogueSoulknifePsionicDieForCharacter(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): "d6" | "d8" | "d10" | "d12" | null {
  return getRogueSoulknifePsionicDie(character);
}

export const rogueScionOfTheThreeBloodthirstReactionEntryId =
  rogueScionOfTheThreeBloodthirstReactionId;

export function getRogueStrokeOfLuckUsesRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  return getRogueStrokeOfLuckUsesRemaining(character);
}

export function getRogueScionOfTheThreeBloodthirstUsesTotalForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "subclassId">>
): number {
  return getRogueScionOfTheThreeBloodthirstUsesTotal(character);
}

export function getRogueScionOfTheThreeBloodthirstUsesRemainingForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "classFeatureState" | "level" | "subclassId">>
): number {
  return getRogueScionOfTheThreeBloodthirstUsesRemaining(character);
}

export function consumeRogueSpellThiefUseForCharacter(character: Character): Character {
  return consumeRogueSpellThiefUse(character);
}

export function consumeRogueScionOfTheThreeBloodthirstUseForCharacter(
  character: Character
): Character {
  return consumeRogueScionOfTheThreeBloodthirstUse(character);
}

export function getRogueScionOfTheThreeAuraOfMalevolenceFactsForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "classFeatureState" | "level" | "subclassId">>
): FeatureActionFact[] {
  const formulaFact = getRogueScionOfTheThreeAuraOfMalevolenceFormulaFact(character);

  return formulaFact ? [formulaFact] : [];
}

export function expendRogueSoulknifePsionicDieForCharacter(character: Character): Character {
  return expendRogueSoulknifePsionicDie(character);
}

export function getRangerNaturesVeilUsesRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "abilities">>
): number {
  return getRangerNaturesVeilUsesRemaining(character);
}

export function getRangerFeyReinforcementsUsesRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): number {
  return getRangerFeyReinforcementsUsesRemaining(character);
}

export function getRangerMistyWandererUsesRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "abilities" | "subclassId">>
): number {
  return getRangerMistyWandererUsesRemaining(character);
}

export function getRangerGloomStalkerDreadAmbusherUsesRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "abilities" | "subclassId">>
): number {
  return getRangerGloomStalkerDreadAmbusherUsesRemaining(character);
}

export function getRangerWinterWalkerChillingRetributionUsesRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "abilities" | "subclassId">>
): number {
  return getRangerWinterWalkerChillingRetributionUsesRemaining(character);
}

export function getRangerWinterWalkerFrozenHauntUsesRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): number {
  return getRangerWinterWalkerFrozenHauntUsesRemaining(character);
}

export function getRangerWinterWalkerHuntersRimeTemporaryHitPointsFormulaForCharacter(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): string | null {
  return getRangerWinterWalkerHuntersRimeTemporaryHitPointsFormula(character);
}

export function getRangerWinterWalkerHuntersRimeTemporaryHitPointsFormulaDisplayForCharacter(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): string | null {
  return getRangerWinterWalkerHuntersRimeTemporaryHitPointsFormulaDisplay(character);
}

export function getRangerWinterWalkerHuntersRimeTemporaryHitPointsFactsForCharacter(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): FeatureActionFact[] {
  return getRangerWinterWalkerHuntersRimeTemporaryHitPointsFacts(character);
}

export function getRangerWinterWalkerFortifyingSoulHealingFormulaForCharacter(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): string | null {
  return getRangerWinterWalkerFortifyingSoulHealingFormula(character);
}

export function getRangerWinterWalkerFortifyingSoulHealingFormulaDisplayForCharacter(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): string | null {
  return getRangerWinterWalkerFortifyingSoulHealingFormulaDisplay(character);
}

export function getRangerWinterWalkerFortifyingSoulHealingFactsForCharacter(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): FeatureActionFact[] {
  return getRangerWinterWalkerFortifyingSoulHealingFacts(character);
}

export function getRangerWinterWalkerFrozenHauntSpellOptionStateForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "abilities" | "subclassId">>,
  spell: Pick<SpellEntry, "id"> | null,
  spellSlotTotals: readonly number[],
  spellSlotsExpended: readonly number[]
) {
  return getRangerWinterWalkerFrozenHauntSpellOptionState(
    character,
    spell,
    spellSlotTotals,
    spellSlotsExpended
  );
}

export function consumeRangerTirelessUseForCharacter(character: Character): Character {
  return consumeRangerTirelessUse(character);
}

export function consumeRangerNaturesVeilUseForCharacter(character: Character): Character {
  return consumeRangerNaturesVeilUse(character);
}

export function consumeRangerFeyReinforcementsUseForCharacter(character: Character): Character {
  return consumeRangerFeyReinforcementsUse(character);
}

export function consumeRangerMistyWandererUseForCharacter(character: Character): Character {
  return consumeRangerMistyWandererUse(character);
}

export function consumeRangerGloomStalkerDreadAmbusherUseForCharacter(
  character: Character
): Character {
  return consumeRangerGloomStalkerDreadAmbusherUse(character);
}

export function consumeRangerWinterWalkerPolarStrikesUseForCharacter(
  character: Character
): Character {
  return consumeRangerWinterWalkerPolarStrikesUse(character);
}

export function consumeRangerWinterWalkerChillingRetributionUseForCharacter(
  character: Character
): Character {
  return consumeRangerWinterWalkerChillingRetributionUse(character);
}

export function consumeRangerWinterWalkerFrozenHauntUseForCharacter(
  character: Character
): Character {
  return consumeRangerWinterWalkerFrozenHauntUse(character);
}

export function applyRangerWinterWalkerFrozenHauntStatusEntriesForCharacter(value: unknown) {
  return applyRangerWinterWalkerFrozenHauntStatusEntries(value);
}

export function consumeBarbarianWarriorOfTheGodsChargesForCharacter(
  character: Character,
  chargeCount: number
): Character {
  return consumeBarbarianWarriorOfTheGodsCharges(character, chargeCount);
}

export function restoreRangerTirelessOnLongRestForCharacter(character: Character): Character {
  return restoreRangerTirelessOnLongRest(character);
}

export function restoreRangerNaturesVeilOnLongRestForCharacter(character: Character): Character {
  return restoreRangerNaturesVeilOnLongRest(character);
}

export function restoreRangerFeyReinforcementsOnLongRestForCharacter(
  character: Character
): Character {
  return restoreRangerFeyReinforcementsOnLongRest(character);
}

export function restoreRangerMistyWandererOnLongRestForCharacter(character: Character): Character {
  return restoreRangerMistyWandererOnLongRest(character);
}

export function restoreRangerGloomStalkerDreadAmbusherOnLongRestForCharacter(
  character: Character
): Character {
  return restoreRangerGloomStalkerDreadAmbusherOnLongRest(character);
}

export function restoreRogueStrokeOfLuckOnShortRestForCharacter(character: Character): Character {
  return restoreRogueStrokeOfLuckOnShortRest(character);
}

export function restoreRogueStrokeOfLuckOnLongRestForCharacter(character: Character): Character {
  return restoreRogueStrokeOfLuckOnLongRest(character);
}

export function restoreRogueSpellThiefOnLongRestForCharacter(character: Character): Character {
  return restoreRogueSpellThiefOnLongRest(character);
}

export function restoreRogueSoulknifePsionicDieForCharacter(character: Character): Character {
  return restoreRogueSoulknifePsionicDie(character);
}

export function restoreAllRogueSoulknifePsionicDiceForCharacter(character: Character): Character {
  return restoreAllRogueSoulknifePsionicDice(character);
}

export function getChannelDivinityUsesTotalForCharacter(
  character: Pick<Character, "className" | "level">
): number {
  if (character.className === "Cleric") {
    return getClericChannelDivinityUsesTotal(character);
  }

  if (character.className === "Paladin") {
    return getPaladinChannelDivinityUsesTotal(character);
  }

  return 0;
}

export function getChannelDivinityUsesRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  if (character.className === "Cleric") {
    return getClericChannelDivinityUsesRemaining(character);
  }

  if (character.className === "Paladin") {
    return getPaladinChannelDivinityUsesRemaining(character);
  }

  return 0;
}

export function expendChannelDivinityUseForCharacter(character: Character): Character {
  if (character.className === "Cleric") {
    return expendClericChannelDivinityUse(character);
  }

  if (character.className === "Paladin") {
    return expendPaladinChannelDivinityUse(character);
  }

  return character;
}

export function restoreChannelDivinityUseForCharacter(character: Character): Character {
  if (character.className === "Cleric") {
    return restoreClericChannelDivinityOnShortRest(character);
  }

  if (character.className === "Paladin") {
    return restorePaladinChannelDivinityOnShortRest(character);
  }

  return character;
}

export function restoreAllChannelDivinityUsesForCharacter(character: Character): Character {
  if (character.className === "Cleric") {
    return restoreClericChannelDivinityOnLongRest(character);
  }

  if (character.className === "Paladin") {
    return restorePaladinChannelDivinityOnLongRest(character);
  }

  return character;
}

export function applyLayOnHandsForCharacter(
  character: Character,
  options: Parameters<typeof applyLayOnHands>[1]
): Character {
  return applyLayOnHands(character, options);
}

export function getLayOnHandsCurableConditionsForCharacter(
  character: Pick<Character, "className" | "level">
) {
  return getLayOnHandsCurableConditions(character);
}

export function getPaladinsSmiteUsesRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  return getPaladinsSmiteUsesRemaining(character);
}

export function consumePaladinsSmiteUseForCharacter(character: Character): Character {
  return consumePaladinsSmiteUse(character);
}

export function consumeFaithfulSteedUseForCharacter(character: Character): Character {
  return consumeFaithfulSteedUse(character);
}

export const paladinGloriousDefenseReactionEntryId = gloriousDefenseReactionId;
export const paladinElementalRebukeReactionEntryId = elementalRebukeReactionId;
export const paladinSoulOfVengeanceReactionEntryId = soulOfVengeanceReactionId;
export const rangerWinterWalkerChillingRetributionReactionEntryId = chillingRetributionReactionId;
export const wizardIllusionistIllusorySelfReactionEntryId = wizardIllusionistIllusorySelfReactionId;

export function hasActivePaladinOathOfVengeanceVowOfEnmityForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "statusEntries" | "subclassId">>
): boolean {
  return hasActivePaladinOathOfVengeanceVowOfEnmity(character);
}

export function getGloriousDefenseUsesTotalForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "subclassId">>
): number {
  return getGloriousDefenseUsesTotal(character);
}

export function getGloriousDefenseUsesRemainingForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "subclassId" | "classFeatureState">>
): number {
  return getGloriousDefenseUsesRemaining(character);
}

export function consumeGloriousDefenseUseForCharacter(character: Character): Character {
  return consumeGloriousDefenseUse(character);
}

export function getElementalRebukeUsesTotalForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "subclassId">>
): number {
  return getElementalRebukeUsesTotal(character);
}

export function getElementalRebukeUsesRemainingForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "subclassId" | "classFeatureState">>
): number {
  return getElementalRebukeUsesRemaining(character);
}

export function consumeElementalRebukeUseForCharacter(character: Character): Character {
  return consumeElementalRebukeUse(character);
}

export function activateRangerHunterSuperiorHuntersDefenseForCharacter(
  character: Character
): Character {
  return activateRangerHunterSuperiorHuntersDefense(character);
}

export function hasActivePaladinAuraOfProtectionForCharacter(
  character: Pick<Character, "className" | "level" | "statusEntries">
): boolean {
  return hasActivePaladinAuraOfProtection(character);
}

export function getMonkFocusPointsRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  return getMonkFocusPointsRemaining(character);
}

export function expendMonkFocusPointForCharacter(character: Character): Character {
  return expendMonkFocusPoint(character);
}

export function restoreMonkFocusPointForCharacter(character: Character): Character {
  return restoreOneMonkFocusPoint(character);
}

export function restoreAllMonkFocusPointsForCharacter(character: Character): Character {
  return restoreAllMonkFocusPoints(character);
}

export function restoreInnateSorceryOnLongRestForCharacter(character: Character): Character {
  return restoreInnateSorceryOnLongRest(character);
}

export function restoreWarlockMagicalCunningOnLongRestForCharacter(
  character: Character
): Character {
  return restoreWarlockMagicalCunningOnLongRest(character);
}

export function restoreContactPatronOnLongRestForCharacter(character: Character): Character {
  return restoreContactPatronOnLongRest(character);
}

export function restoreWarlockBeguilingDefenseOnLongRestForCharacter(
  character: Character
): Character {
  return restoreWarlockBeguilingDefenseOnLongRest(character);
}

export function restoreWarlockHealingLightOnLongRestForCharacter(character: Character): Character {
  return restoreWarlockHealingLightOnLongRest(character);
}

export function consumeContactPatronUseForCharacter(character: Character): Character {
  return consumeContactPatronUse(character);
}

export function consumeWarlockStepsOfTheFeyUseForCharacter(character: Character): Character {
  return consumeWarlockStepsOfTheFeyUse(character);
}

export function consumeWarlockBeguilingDefenseUseForCharacter(character: Character): Character {
  return consumeWarlockBeguilingDefenseUse(character);
}

export function spendWarlockHealingLightDiceForCharacter(
  character: Character,
  diceCount: number
): Character {
  return spendWarlockHealingLightDice(character, diceCount);
}

export function expendWarlockHealingLightDieForCharacter(character: Character): Character {
  return expendWarlockHealingLightDie(character);
}

export function restoreWarlockHealingLightDieForCharacter(character: Character): Character {
  return restoreWarlockHealingLightDie(character);
}

export function restoreAllWarlockHealingLightDiceForCharacter(character: Character): Character {
  return restoreAllWarlockHealingLightDice(character);
}

export function consumeMysticArcanumUseForCharacter(
  character: Character,
  spellLevel: Parameters<typeof consumeMysticArcanumUse>[1]
): Character {
  return consumeMysticArcanumUse(character, spellLevel);
}

export function hasActiveInnateSorceryForCharacter(
  character: Pick<Character, "statusEntries">
): boolean {
  return hasActiveInnateSorcery(character);
}

export function getInnateSorceryActivationSorceryPointCostForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "statusEntries">
): number {
  return getInnateSorceryActivationSorceryPointCost(character);
}

export function getSorcererMetamagicSelectionLimitForActionForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "statusEntries">
): number {
  return getSorcererMetamagicSelectionLimitForAction(character);
}

export function hasSorcererArcaneApotheosisFreeMetamagicAvailableForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "statusEntries">
): boolean {
  return hasArcaneApotheosisFreeMetamagicAvailable(character);
}

export function getSorcererMetamagicActionCostForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "statusEntries">,
  optionKeys: string[]
): number {
  return getSorcererMetamagicActionCost(character, optionKeys);
}

export function spendSorcererMetamagicOptionsForCharacter(
  character: Character,
  optionKeys: string[]
): Character {
  return spendMetamagicOptions(character, optionKeys);
}

export function restorePaladinLayOnHandsOnLongRestForCharacter(character: Character): Character {
  return restorePaladinLayOnHandsOnLongRest(character);
}

export function restoreMonkUncannyMetabolismOnLongRestForCharacter(
  character: Character
): Character {
  return restoreMonkUncannyMetabolismOnLongRest(character);
}

export function markFeatureWeaponBonusUseForCharacter(
  character: Character,
  label: string
): Character {
  if (label === "Divine Fury") {
    return consumeBarbarianDivineFuryBonus(character);
  }

  if (label === "Brutal Strike") {
    return consumeBarbarianBrutalStrikeBonus(character);
  }

  if (label === "Frenzy") {
    return consumeBarbarianFrenzyBonus(character);
  }

  if (label === "Divine Strike" || label === "Blessed Strikes") {
    return markClericBlessedStrikeUsed(character);
  }

  if (label === "Primal Strike") {
    return markDruidPrimalStrikeUsed(character);
  }

  if (label === "Dreadful Strikes") {
    return markRangerDreadfulStrikesUsed(character);
  }

  if (label === "Colossus Slayer") {
    return markRangerHunterColossusSlayerUsed(character);
  }

  if (label === monkWarriorOfMercyHandOfHarmBonusLabel) {
    return consumeMonkWarriorOfMercyHandOfHarm(character);
  }

  if (label === "Empowered Strikes") {
    return consumeMonkWarriorOfTheElementsEmpoweredStrikes(character);
  }

  return character;
}

export function markRangerHunterHordeBreakerUsedForCharacter(character: Character): Character {
  return markRangerHunterHordeBreakerUsed(character);
}

export function setRangerHunterHordeBreakerActionKeyForCharacter(
  character: Character,
  actionKey: string | null
): Character {
  return setRangerHunterHordeBreakerActionKey(character, actionKey);
}

export function getMonkFlurryOfBlowsAttackMultiCountForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  return getMonkFlurryOfBlowsAttackMultiCount(character);
}

export function getMonkUnarmedStrikeMultiCountForCharacter(
  character: Pick<Character, "className" | "level" | "subclassId" | "classFeatureState">
): number {
  return getMonkUnarmedStrikeMultiCount(character);
}

export function consumeWeaponAttackActionForCharacter(
  character: Character,
  action: WeaponAttackConsumptionContext
): Character {
  if (character.className === "Barbarian") {
    return consumeBarbarianWeaponAttack(character);
  }

  if (character.className === "Bard") {
    return consumeBardWeaponAttack(character, action);
  }

  if (character.className === "Cleric") {
    const nextCharacter = consumeClericWeaponAttack(character, action);

    if (nextCharacter !== character) {
      return nextCharacter;
    }
  }

  if (character.className === "Monk") {
    return consumeMonkWeaponAttack(character, action);
  }

  if (character.className === "Ranger") {
    return consumeRangerWeaponAttack(character);
  }

  if (character.className === "Paladin") {
    return consumePaladinWeaponAttack(character);
  }

  if (character.className === "Rogue") {
    return consumeRogueWeaponAttack(character, action);
  }

  if (character.className === "Fighter") {
    return consumeFighterWeaponAttack(character, action);
  }

  if (character.className === "Wizard") {
    const nextCharacter = consumeWizardWeaponAttack(character, action);

    if (nextCharacter !== character) {
      return nextCharacter;
    }
  }

  const roundTrackerResource = getRoundTrackerResourceForEconomyType(action.economyType);

  return roundTrackerResource &&
    isRoundTrackerResourceAvailable(character.roundTracker, roundTrackerResource)
    ? {
        ...character,
        roundTracker: consumeRoundTrackerResource(character.roundTracker, roundTrackerResource)
      }
    : character;
}

export function consumeNonMagicActionForCharacter(
  character: Character,
  action: Pick<FeatureActionCard, "economyType" | "actionCategory">
): Character {
  const nextCharacter = consumeSharedEconomyMultiForCharacterAction(
    character,
    createEconomyMultiContextForFeatureAction(action)
  );

  if (nextCharacter !== character) {
    return nextCharacter;
  }

  const roundTrackerResource = getRoundTrackerResourceForEconomyType(action.economyType);

  return roundTrackerResource
    ? {
        ...character,
        roundTracker: consumeRoundTrackerResource(character.roundTracker, roundTrackerResource)
      }
    : character;
}

export function activateFeatureActionOptionForCharacter(
  character: Character,
  actionKey: string,
  optionKey: string
): Character {
  return (
    getActiveClassFeatureModule(character.className)?.handleActionOption?.(
      character,
      actionKey,
      optionKey
    ) ?? character
  );
}

export function activateFeatureActionOptionsForCharacter(
  character: Character,
  actionKey: string,
  optionKeys: string[]
): Character {
  return (
    getActiveClassFeatureModule(character.className)?.handleActionOptions?.(
      character,
      actionKey,
      optionKeys
    ) ?? character
  );
}

export function removeFeatureStatusEntryForCharacter(
  character: Character,
  statusEntry: Pick<CharacterStatusEntry, "id" | "value" | "sourceId">
): Character {
  const normalizedValue = String(statusEntry.value).trim();

  if (
    statusEntry.sourceId === "feature-rage" ||
    statusEntry.sourceId === "feature-barbarian-rage-of-the-wilds-bear" ||
    normalizedValue === "Rage" ||
    normalizedValue === "BLUDGEONING" ||
    normalizedValue === "PIERCING" ||
    normalizedValue === "SLASHING"
  ) {
    return deactivateBarbarianRage(character);
  }

  if (
    statusEntry.sourceId === "feature-barbarian-reckless-attack" ||
    normalizedValue === "Reckless Attack"
  ) {
    return deactivateBarbarianRecklessAttack(character);
  }

  if (isDruidWildShapeStatusSourceId(statusEntry.sourceId)) {
    return deactivateDruidWildShape(character);
  }

  return {
    ...character,
    statusEntries: removeCharacterStatusEntry(character.statusEntries, statusEntry.id)
  };
}

export function applyShortRestToFeatureState(character: Character): Character {
  return getClassFeatureModules().reduce((nextCharacter, module) => {
    return module.applyShortRest ? module.applyShortRest(nextCharacter) : nextCharacter;
  }, character);
}

export function applyLongRestToFeatureState(character: Character): Character {
  return getClassFeatureModules().reduce((nextCharacter, module) => {
    return module.applyLongRest ? module.applyLongRest(nextCharacter) : nextCharacter;
  }, character);
}

export function getArcaneRecoveryUsesTotalForCharacter(
  character: Pick<Character, "className" | "level">
): number {
  return getArcaneRecoveryUsesTotal(character);
}

export function getArcaneRecoveryUsesRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  return getArcaneRecoveryUsesRemaining(character);
}

export function activateArcaneRecoveryForCharacter(
  character: Character,
  selection: Parameters<typeof activateArcaneRecovery>[1]
): Character {
  return activateArcaneRecovery(character, selection);
}

export function advanceFeatureStateForNewRound(character: Character): Character {
  return getClassFeatureModules().reduce((nextCharacter, module) => {
    return module.advanceRound ? module.advanceRound(nextCharacter) : nextCharacter;
  }, character);
}
