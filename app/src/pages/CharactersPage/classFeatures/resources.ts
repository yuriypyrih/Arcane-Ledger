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
  artificerFlashOfGeniusReactionEntryId,
  consumeArtificerFlashOfGeniusUse,
  getArtificerFlashOfGeniusUsesRemaining,
  getArtificerFlashOfGeniusUsesTotal
} from "./artificer/artificer";
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
  consumeWarlockEldritchSmitePactMagicSlot,
  consumeWarlockLifedrinkerHitDie,
  expendWarlockHealingLightDie,
  consumeWarlockBeguilingDefenseUse,
  consumeMysticArcanumUse,
  getContactPatronUsesRemaining,
  getContactPatronUsesTotal,
  getWarlockBeguilingDefenseUsesRemaining,
  getWarlockBeguilingDefenseUsesTotal,
  getWarlockEldritchSmiteWeaponOptionState,
  getWarlockEldritchInvocationInputStatus,
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
  getWarlockLifedrinkerWeaponOptionState,
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
  clearWarlockPactOfTheBladeInvocationSelection,
  replaceWarlockPactOfTheBladeOwnedStackSelection,
  spendWarlockHealingLightDice,
  setWarlockFiendishResilienceDamageTypeSelection,
  setWarlockMysticArcanumSpellId,
  setWarlockInvocationSelectionIds,
  getWarlockPactOfTheBladeConjuredItemKeyFromSelectionIds,
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
import { getSelectedSubclassForCharacter } from "../subclasses";
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
  SpellSourceMap,
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
import { addSpellSourcesForIds, mergeSpellSourceMaps } from "./spellSources";
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
import { clearRoundScopedFeatureStateIfOutOfCombat } from "./state";

export { paladinOathOfTheNobleGeniesAuraOfElementalShieldingDamageTypeOptions };
export { rangerHunterSuperiorHuntersDefenseDamageTypeOptions };
export {
  paladinOathOfTheNobleGeniesGeniesSplendorSkillOptions,
  rangerFeyWandererGiftOptions,
  rangerOtherworldlyGlamourSkillOptions
};
export { fighterBanneretKnightlyEnvoySkillOptions };

export { artificerFlashOfGeniusReactionEntryId };

export function getArtificerFlashOfGeniusUsesTotalForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "statusEntries">>
): number {
  return getArtificerFlashOfGeniusUsesTotal(character);
}

export function getArtificerFlashOfGeniusUsesRemainingForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "classFeatureState" | "level" | "statusEntries">>
): number {
  return getArtificerFlashOfGeniusUsesRemaining(character);
}

export function consumeArtificerFlashOfGeniusUseForCharacter(character: Character): Character {
  return consumeArtificerFlashOfGeniusUse(character);
}

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
  return clearRoundScopedFeatureStateIfOutOfCombat(
    consumeFighterPsiWarriorPsionicStrike(character)
  );
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
  return clearRoundScopedFeatureStateIfOutOfCombat(activateInnateSorcery(character, options));
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

function addFallbackSpellSources(
  sourceMap: SpellSourceMap,
  spellIds: readonly string[] | null | undefined,
  source: string,
  explicitSourceMap: SpellSourceMap | null | undefined
) {
  spellIds?.forEach((spellId) => {
    if ((explicitSourceMap?.[spellId]?.length ?? 0) > 0) {
      return;
    }

    addSpellSourcesForIds(sourceMap, [spellId], source);
  });
}

export function getAlwaysPreparedSpellSourceMapForCharacter(
  character: Pick<
    Character,
    "className" | "level" | "classFeatureState" | "spellbookSpellIds" | "subclassId"
  > &
    Partial<Pick<Character, "statusEntries">>
): SpellSourceMap {
  const baseFeatureState = collectActiveClassFeatureState(character);
  const subclassDerivedState = getSubclassDerivedFeatureState(character);
  const subclass = getSelectedSubclassForCharacter(character);
  const subclassSourceLabel = subclass?.name ?? "Subclass";
  const baseSourceMap = baseFeatureState.alwaysPreparedSpellSources;
  const subclassSourceMap = subclassDerivedState.alwaysPreparedSpellSources;
  let sourceMap = mergeSpellSourceMaps(baseSourceMap);

  addFallbackSpellSources(
    sourceMap,
    baseFeatureState.alwaysPreparedSpellIds,
    character.className,
    baseSourceMap
  );

  sourceMap = mergeSpellSourceMaps(sourceMap, subclassSourceMap);
  addFallbackSpellSources(
    sourceMap,
    subclassDerivedState.alwaysPreparedSpellIds,
    subclassSourceLabel,
    subclassSourceMap
  );

  return sourceMap;
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

export function getWarlockEldritchInvocationInputStatusForCharacter(
  character: Pick<
    Character,
    "className" | "level" | "classFeatureState" | "cantripIds" | "feats" | "inventoryItems"
  >
) {
  return getWarlockEldritchInvocationInputStatus(character);
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

export function getWarlockEldritchSmiteWeaponOptionStateForCharacter(
  character: Parameters<typeof getWarlockEldritchSmiteWeaponOptionState>[0],
  action: Parameters<typeof getWarlockEldritchSmiteWeaponOptionState>[1]
) {
  return getWarlockEldritchSmiteWeaponOptionState(character, action);
}

export function consumeWarlockEldritchSmitePactMagicSlotForCharacter(
  character: Character
): Character {
  return consumeWarlockEldritchSmitePactMagicSlot(character);
}

export function getWarlockLifedrinkerWeaponOptionStateForCharacter(
  character: Parameters<typeof getWarlockLifedrinkerWeaponOptionState>[0],
  action: Parameters<typeof getWarlockLifedrinkerWeaponOptionState>[1]
) {
  return getWarlockLifedrinkerWeaponOptionState(character, action);
}

export function consumeWarlockLifedrinkerHitDieForCharacter(character: Character): Character {
  return consumeWarlockLifedrinkerHitDie(character);
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
  character: Pick<
    Character,
    "className" | "level" | "classFeatureState" | "cantripIds" | "feats" | "inventoryItems"
  >
) {
  return getWarlockInvocationSelectionIds(character);
}

export function normalizeWarlockInvocationSelectionIdsForCharacter(
  character: Pick<
    Character,
    "className" | "level" | "classFeatureState" | "cantripIds" | "feats" | "inventoryItems"
  > &
    Partial<Pick<Character, "abilities" | "statusEntries" | "subclassId">>,
  selectionIds: string[]
) {
  return normalizeWarlockInvocationSelectionIds(character, selectionIds);
}

export function getWarlockInvocationOptionsForCharacter(
  character: Pick<
    Character,
    "className" | "level" | "classFeatureState" | "cantripIds" | "feats" | "inventoryItems"
  >,
  selectedIds?: string[]
) {
  return getWarlockInvocationOptions(character, selectedIds);
}

export function getWarlockLearnedInvocationOptionsForCharacter(
  character: Pick<
    Character,
    "className" | "level" | "classFeatureState" | "cantripIds" | "feats" | "inventoryItems"
  >
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
  selectionIds: string[],
  options?: Parameters<typeof setWarlockInvocationSelectionIds>[2]
): Character {
  return setWarlockInvocationSelectionIds(character, selectionIds, options);
}

export function clearWarlockPactOfTheBladeInvocationSelectionForCharacter(
  character: Character
): Character {
  return clearWarlockPactOfTheBladeInvocationSelection(character);
}

export function replaceWarlockPactOfTheBladeOwnedStackSelectionForCharacter(
  character: Character,
  previousStackId: string,
  nextStackId: string
): Character {
  return replaceWarlockPactOfTheBladeOwnedStackSelection(character, previousStackId, nextStackId);
}

export function getWarlockPactOfTheBladeConjuredItemKeyFromSelectionIdsForCharacter(
  selectionIds: string[]
): string | null {
  return getWarlockPactOfTheBladeConjuredItemKeyFromSelectionIds(selectionIds);
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
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
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
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
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
  character: Pick<Character, "className" | "level" | "classFeatureState" | "spellSlotsExpended"> &
    Partial<Pick<Character, "subclassId">>
) {
  return getDruidNatureMagicianOptions(character);
}

export function getDruidWildResurgenceSpellSlotRecoveryUsesTotalForCharacter(
  character: Pick<Character, "className" | "level">
) {
  return getDruidWildResurgenceSpellSlotRecoveryUsesTotal(character);
}

export function getDruidWildResurgenceSpellSlotRecoveryUsesRemainingForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
) {
  return getDruidWildResurgenceSpellSlotRecoveryUsesRemaining(character);
}

export function getDruidWildResurgenceAvailableSpellSlotLevelsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "spellSlotsExpended"> &
    Partial<Pick<Character, "subclassId">>
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
  return clearRoundScopedFeatureStateIfOutOfCombat(
    activateDruidWildResurgenceWildShapeRecovery(character, spellSlotLevel)
  );
}

export function activateDruidWildResurgenceLevelOneSpellSlotRecoveryForCharacter(
  character: Character
): Character {
  return clearRoundScopedFeatureStateIfOutOfCombat(
    activateDruidWildResurgenceLevelOneSpellSlotRecovery(character)
  );
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
