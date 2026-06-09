/* eslint-disable @typescript-eslint/no-unused-vars */
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
import {
  consumeRoundTrackerResource,
  isRoundTrackerResourceAvailable,
  shouldTrackRoundScopedResources
} from "../combat";
import {
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
import { getWarlockFiendPatronDarkOnesOwnLuckDescriptionAdditions } from "./warlock/subclasses/warlockFiendPatron";
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
import { getWizardAbjurerSpellResistanceSavingThrowDescriptionAdditions } from "./wizard/subclasses/wizardAbjurer";
import { getWizardBladesingerFocusSavingThrowDescriptionAdditions } from "./wizard/subclasses/wizardBladesinger";
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

export function mergeIndicatorMaps<T extends string>(
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

const roundScopedBooleanStateKeys = new Set([
  "brutalStrikePending",
  "battleMagicBonusAttackAvailable",
  "frenzyPending",
  "psiWarriorTelekineticMasterBonusAttackAvailable",
  "spellcastWeaponBonusActionAvailable",
  "steadyAimActive",
  "steadyAimAttackAdvantageAvailable",
  "warPriestBonusAttackAvailable",
  "warriorOfMercyFlurryOfHealingAndHarmActive",
  "warriorOfShadowShadowStepAdvantageActive"
]);

const roundScopedNumberStateKeys = new Set(["retaliationAttacksRemaining"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isRoundScopedBooleanStateKey(key: string): boolean {
  return key.endsWith("UsedThisTurn") || roundScopedBooleanStateKeys.has(key);
}

function isRoundScopedNumberStateKey(key: string): boolean {
  return (
    key.endsWith("RemainingThisTurn") ||
    key.endsWith("UsesThisTurn") ||
    roundScopedNumberStateKeys.has(key)
  );
}

function clearRoundScopedFeatureStateRecord(
  stateRecord: Record<string, unknown>
): Record<string, unknown> {
  let nextStateRecord: Record<string, unknown> | null = null;

  Object.entries(stateRecord).forEach(([key, value]) => {
    let nextValue = value;

    if (isRoundScopedBooleanStateKey(key) && value === true) {
      nextValue = false;
    } else if (isRoundScopedNumberStateKey(key) && typeof value === "number" && value !== 0) {
      nextValue = 0;
    }

    if (nextValue !== value) {
      nextStateRecord = nextStateRecord ?? { ...stateRecord };
      nextStateRecord[key] = nextValue;
    }
  });

  return nextStateRecord ?? stateRecord;
}

export function clearRoundScopedFeatureStateForCharacter(character: Character): Character {
  const featureState = character.classFeatureState;

  if (!featureState) {
    return character;
  }

  let nextFeatureState: Record<string, unknown> | null = null;

  Object.entries(featureState).forEach(([stateKey, stateValue]) => {
    if (!isRecord(stateValue)) {
      return;
    }

    const nextStateValue = clearRoundScopedFeatureStateRecord(stateValue);

    if (nextStateValue !== stateValue) {
      nextFeatureState = nextFeatureState ?? { ...featureState };
      nextFeatureState[stateKey] = nextStateValue;
    }
  });

  return nextFeatureState
    ? {
        ...character,
        classFeatureState: nextFeatureState as CharacterClassFeatureState
      }
    : character;
}

export function clearRoundScopedFeatureStateIfOutOfCombat(character: Character): Character {
  return shouldTrackRoundScopedResources(character.roundTracker)
    ? character
    : clearRoundScopedFeatureStateForCharacter(character);
}

export function normalizeCharacterClassFeatureState(
  value: unknown,
  character: Pick<Character, "className" | "level"> &
    Partial<
      Pick<
        Character,
        | "abilities"
        | "cantripIds"
        | "classRules"
        | "customClass"
        | "feats"
        | "inventoryItems"
        | "statusEntries"
        | "subclassId"
      >
    >
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
