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
import { getExhaustionD20TestPenalty, removeCharacterStatusEntry } from "../statusEntries";
import {
  getCustomTraitAbilityScoreBonuses,
  getCustomTraitAbilityCheckRollIndicators,
  getCustomTraitArmorClassBonuses,
  getCustomTraitInitiativeBonuses,
  getCustomTraitInitiativeRollIndicators,
  getCustomTraitPassivePerceptionRollIndicators,
  getCustomTraitSavingThrowBonuses,
  getCustomTraitSavingThrowRollIndicators,
  getCustomTraitSkillBonuses,
  getCustomTraitSkillRollIndicators,
  getCustomTraitSpeedBonuses,
  getCustomTraitWeaponAttackRollIndicators,
  getCustomTraitWeaponDamageBonuses,
  type CustomTraitBonusInput
} from "../customTraitEffects";
import { getCharacterCustomTraitEffectInput } from "../characterRuntime/customEffectRuntime";
import {
  getFeatActionsForCharacter,
  transformFeatCommonActionForCharacter,
  transformFeatWeaponActionForCharacter
} from "../feats/runtime";
import { getSpeciesActionsForCharacter } from "../species";
import { getGnomeSavingThrowIndicatorsForCharacter } from "../speciesGnome";
import {
  getGoliathAbilityCheckIndicatorsForCharacter,
  getGoliathSavingThrowIndicatorsForCharacter,
  getGoliathSkillIndicatorsForCharacter
} from "../speciesGoliath";
import { measureCharacterRuntime } from "../characterRuntime/performance";
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
  getWarlockEldritchMindSavingThrowDescriptionAdditions,
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
  SpellFeatureContext,
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
import { clearRoundScopedFeatureStateIfOutOfCombat, mergeIndicatorMaps } from "./state";

const featureActionsByCharacter = new WeakMap<Character, FeatureActionCard[]>();

type CustomTraitDerivationOptions = {
  customTraitEffectInput?: CustomTraitBonusInput;
};

export function getFeatureActionsForCharacter(character: Character): FeatureActionCard[] {
  const cachedActions = featureActionsByCharacter.get(character);

  if (cachedActions) {
    return cachedActions;
  }

  const featureActions = measureCharacterRuntime("character-sheet:feature-actions", () => {
    const baseFeatureState = collectActiveClassFeatureState(character);
    const subclassDerivedState = getSubclassDerivedFeatureState(character);
    const actions = [
      ...(baseFeatureState.actions ?? []),
      ...(subclassDerivedState.featureActions ?? [])
    ];
    const transformedActions = subclassDerivedState.transformFeatureAction
      ? actions.map(subclassDerivedState.transformFeatureAction)
      : actions;

    return [
      ...getSpeciesActionsForCharacter(character),
      ...getFeatActionsForCharacter(character),
      ...transformedActions
    ].map(normalizeFeatureActionCardUsage);
  });

  featureActionsByCharacter.set(character, featureActions);
  return featureActions;
}

export function getFeatureActionByKeyForCharacter(
  character: Character,
  actionKey: string
): FeatureActionCard | null {
  return (
    getFeatureActionsForCharacter(character).find((action) => action.key === actionKey) ?? null
  );
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
        "subclassId" | "abilities" | "equipment" | "inventoryItems" | "customEquipment" | "feats"
      >
    >,
  action: FeatureActionCard
): FeatureActionCard {
  const baseFeatureState = collectActiveClassFeatureState(character);
  const subclassDerivedState = getSubclassDerivedFeatureState(character);
  const baseAction = baseFeatureState.transformCommonAction
    ? baseFeatureState.transformCommonAction(action)
    : action;

  const classFeatureAction = subclassDerivedState.transformCommonAction
    ? subclassDerivedState.transformCommonAction(baseAction)
    : baseAction;

  return transformFeatCommonActionForCharacter(character, classFeatureAction);
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
    | "inventoryItems"
    | "customEquipment"
    | "feats"
    | "statusEntries"
  >,
  action: WeaponAction
): WeaponAction {
  const baseFeatureState = collectActiveClassFeatureState(character);
  const subclassDerivedState = getSubclassDerivedFeatureState(character);
  const baseAction = baseFeatureState.transformWeaponAction
    ? baseFeatureState.transformWeaponAction(action)
    : action;

  const classFeatureAction = subclassDerivedState.transformWeaponAction
    ? subclassDerivedState.transformWeaponAction(baseAction)
    : baseAction;

  return transformFeatWeaponActionForCharacter(character, classFeatureAction);
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
        | "subclassId"
        | "roundTracker"
        | "equipment"
        | "customEquipment"
        | "statusEntries"
        | "inventoryItems"
      >
    >,
  context: WeaponFeatureContext
): FeatureDamageBonus[] {
  const baseFeatureState = collectActiveClassFeatureState(character);
  const subclassDerivedState = getSubclassDerivedFeatureState(character);

  return [
    ...(baseFeatureState.getWeaponDamageBonuses?.(context) ?? []),
    ...(subclassDerivedState.getWeaponDamageBonuses?.(context) ?? []),
    ...getCustomTraitWeaponDamageBonuses(
      getCharacterCustomTraitEffectInput(character),
      {
        attackKind: context.attackKind,
        combatType: context.combatType
      }
    ).map((bonus) => {
      return {
        label: bonus.label,
        value: bonus.value,
        abilityModifierSource: bonus.abilityModifierSource,
        abilityModifierMultiplier: bonus.abilityModifierMultiplier,
        formulaSourceLabel: bonus.formulaSourceLabel
      };
    })
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
  character: Pick<Character, "className" | "level" | "classFeatureState" | "statusEntries"> &
    Partial<Pick<Character, "inventoryItems" | "species" | "speciesChoices">>
): SavingThrowIndicatorMap {
  const baseFeatureState = collectActiveClassFeatureState(character);
  const subclassDerivedState = getSubclassDerivedFeatureState(character);
  const customEffectInput = getCharacterCustomTraitEffectInput(character);
  const gnomeSavingThrowIndicators = character.species
    ? getGnomeSavingThrowIndicatorsForCharacter({
        species: character.species,
        speciesChoices: character.speciesChoices
      })
    : {};
  const goliathSavingThrowIndicators = character.species
    ? getGoliathSavingThrowIndicatorsForCharacter({
        species: character.species,
        speciesChoices: character.speciesChoices,
        statusEntries: character.statusEntries
      })
    : {};

  return mergeIndicatorMaps(
    baseFeatureState.savingThrowIndicators ?? {},
    subclassDerivedState.savingThrowIndicators ?? {},
    gnomeSavingThrowIndicators,
    goliathSavingThrowIndicators,
    abilityKeys.reduce<SavingThrowIndicatorMap>((indicators, ability) => {
      const abilityIndicators = getCustomTraitSavingThrowRollIndicators(
        customEffectInput,
        ability
      );

      if (abilityIndicators.length > 0) {
        indicators[ability] = abilityIndicators;
      }

      return indicators;
    }, {})
  );
}

export function getAbilityCheckIndicatorsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "statusEntries"> &
    Partial<Pick<Character, "inventoryItems" | "species" | "speciesChoices">>
): AbilityCheckIndicatorMap {
  const baseFeatureState = collectActiveClassFeatureState(character);
  const subclassDerivedState = getSubclassDerivedFeatureState(character);
  const customEffectInput = getCharacterCustomTraitEffectInput(character);
  const goliathAbilityCheckIndicators = character.species
    ? getGoliathAbilityCheckIndicatorsForCharacter({
        species: character.species,
        speciesChoices: character.speciesChoices,
        statusEntries: character.statusEntries
      })
    : {};

  return mergeIndicatorMaps(
    baseFeatureState.abilityCheckIndicators ?? {},
    subclassDerivedState.abilityCheckIndicators ?? {},
    goliathAbilityCheckIndicators,
    abilityKeys.reduce<AbilityCheckIndicatorMap>((indicators, ability) => {
      const abilityIndicators = getCustomTraitAbilityCheckRollIndicators(
        customEffectInput,
        ability
      );

      if (abilityIndicators.length > 0) {
        indicators[ability] = abilityIndicators;
      }

      return indicators;
    }, {})
  );
}

export function getCoreStatIndicatorsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "inventoryItems" | "statusEntries">>
): CoreStatIndicatorMap {
  const baseFeatureState = collectActiveClassFeatureState(character);
  const customEffectInput = getCharacterCustomTraitEffectInput(character);
  const customCoreStatIndicators: CoreStatIndicatorMap = {
    initiative: getCustomTraitInitiativeRollIndicators(customEffectInput),
    passivePerception: getCustomTraitPassivePerceptionRollIndicators(customEffectInput)
  };

  return mergeIndicatorMaps(
    baseFeatureState.coreStatIndicators ?? {},
    getSubclassDerivedFeatureState(character).coreStatIndicators ?? {},
    customCoreStatIndicators
  );
}

export function getInitiativeBonusesForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "abilities"> &
    Partial<Pick<Character, "statusEntries" | "subclassId" | "inventoryItems">>,
  options?: CustomTraitDerivationOptions
): FeatureInitiativeBonus[] {
  const baseFeatureState = collectActiveClassFeatureState(character);
  const subclassDerivedState = getSubclassDerivedFeatureState(character);
  const customTraitEffectInput =
    options?.customTraitEffectInput ?? getCharacterCustomTraitEffectInput(character);

  return [
    ...(baseFeatureState.getInitiativeBonuses?.() ?? []),
    ...(subclassDerivedState.getInitiativeBonuses?.() ?? []),
    ...getCustomTraitInitiativeBonuses(customTraitEffectInput)
  ];
}

export function getSkillIndicatorsForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "statusEntries"> &
    Partial<Pick<Character, "inventoryItems" | "subclassId" | "species" | "speciesChoices">>
): SkillIndicatorMap {
  const baseFeatureState = collectActiveClassFeatureState(character);
  const subclassDerivedState = getSubclassDerivedFeatureState(character);
  const customEffectInput = getCharacterCustomTraitEffectInput(character);
  const goliathSkillIndicators = character.species
    ? getGoliathSkillIndicatorsForCharacter({
        species: character.species,
        speciesChoices: character.speciesChoices,
        statusEntries: character.statusEntries
      })
    : {};

  return mergeIndicatorMaps(
    baseFeatureState.skillIndicators ?? {},
    subclassDerivedState.skillIndicators ?? {},
    goliathSkillIndicators,
    ALL_SKILLS.reduce<SkillIndicatorMap>((indicators, skill) => {
      const skillIndicators = getCustomTraitSkillRollIndicators(customEffectInput, skill);

      if (skillIndicators.length > 0) {
        indicators[skill] = skillIndicators;
      }

      return indicators;
    }, {})
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

  descriptionAdditions.push(...getWarlockFiendPatronDarkOnesOwnLuckDescriptionAdditions(character));

  return descriptionAdditions;
}

export function getSavingThrowReferenceDescriptionAdditionsForCharacter(
  character: Pick<Character, "className" | "level"> &
    Partial<Pick<Character, "classFeatureState" | "statusEntries" | "subclassId">>,
  ability: AbilityKey
): SpellDescriptionEntry[][] {
  const descriptionAdditions: SpellDescriptionEntry[][] = [];

  descriptionAdditions.push(...getWarlockFiendPatronDarkOnesOwnLuckDescriptionAdditions(character));
  descriptionAdditions.push(
    ...getWarlockEldritchMindSavingThrowDescriptionAdditions(character, ability)
  );
  descriptionAdditions.push(
    ...getWizardAbjurerSpellResistanceSavingThrowDescriptionAdditions(character)
  );
  descriptionAdditions.push(
    ...getWizardBladesingerFocusSavingThrowDescriptionAdditions(character, ability)
  );

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
  character: Pick<Character, "className" | "statusEntries"> &
    Partial<Pick<Character, "inventoryItems" | "subclassId">>,
  context?: {
    attackKind: "weapon" | "unarmed";
    combatType?: WEAPON_COMBAT_TYPE | null;
  }
): FeatureIndicator[] {
  const subclassDerivedState = getSubclassDerivedFeatureState(character);
  const customTraitEffectInput = getCharacterCustomTraitEffectInput(character);

  return [
    ...(subclassDerivedState.weaponAttackIndicators ?? []),
    ...(context
      ? getCustomTraitWeaponAttackRollIndicators(customTraitEffectInput, context)
      : [])
  ];
}

export function getSkillBonusesForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "abilities"> &
    Partial<Pick<Character, "inventoryItems" | "statusEntries">>,
  skill: SkillName,
  proficiencyLevel: PROF_LEVEL,
  options?: CustomTraitDerivationOptions
): FeatureSkillBonus[] {
  const customTraitEffectInput =
    options?.customTraitEffectInput ?? getCharacterCustomTraitEffectInput(character);

  return [
    ...(collectActiveClassFeatureState(character).getSkillBonuses?.(skill, proficiencyLevel) ?? []),
    ...getCustomTraitSkillBonuses(customTraitEffectInput, skill)
  ];
}

export function getSavingThrowBonusesForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "statusEntries" | "subclassId" | "inventoryItems">>,
  ability: AbilityKey,
  options?: CustomTraitDerivationOptions
): FeatureSavingThrowBonus[] {
  const baseFeatureState = collectActiveClassFeatureState(character);
  const subclassDerivedState = getSubclassDerivedFeatureState(character);
  const exhaustionPenalty = getExhaustionD20TestPenalty(character.statusEntries);
  const customTraitEffectInput =
    options?.customTraitEffectInput ?? getCharacterCustomTraitEffectInput(character);

  return [
    ...(baseFeatureState.getSavingThrowBonuses?.(ability) ?? []),
    ...(subclassDerivedState.getSavingThrowBonuses?.(ability) ?? []),
    ...getCustomTraitSavingThrowBonuses(customTraitEffectInput, ability),
    ...(exhaustionPenalty !== 0
      ? [
          {
            label: "Exhaustion",
            value: exhaustionPenalty
          }
        ]
      : [])
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
        | "abilities"
        | "customEquipment"
        | "equipment"
        | "statusEntries"
        | "subclassId"
        | "inventoryItems"
      >
    >,
  context: ArmorClassFeatureContext
): FeatureArmorClassBonus[] {
  const baseFeatureState = collectActiveClassFeatureState(character);
  const subclassDerivedState = getSubclassDerivedFeatureState(character);

  return [
    ...(baseFeatureState.getArmorClassBonuses?.(context) ?? []),
    ...(subclassDerivedState.getArmorClassBonuses?.(context) ?? []),
    ...getCustomTraitArmorClassBonuses(getCharacterCustomTraitEffectInput(character))
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
    | "inventoryItems"
    | "subclassId"
  >,
  context: SpeedFeatureContext
): FeatureSpeedBonus[] {
  const baseFeatureState = collectActiveClassFeatureState(character);
  const subclassDerivedState = getSubclassDerivedFeatureState(character);
  return [
    ...(baseFeatureState.getSpeedBonuses?.(context) ?? []),
    ...(subclassDerivedState.speedBonuses ?? []),
    ...getCustomTraitSpeedBonuses(getCharacterCustomTraitEffectInput(character)).map((bonus) => ({
      ...bonus,
      movementType: "walk" as const
    }))
  ];
}

export function getAbilityScoreBonusesForCharacter(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "statusEntries" | "inventoryItems">>,
  options?: CustomTraitDerivationOptions
): FeatureAbilityScoreBonus[] {
  const baseFeatureState = collectActiveClassFeatureState(character);
  const customTraitEffectInput =
    options?.customTraitEffectInput ?? getCharacterCustomTraitEffectInput(character);
  return [
    ...(baseFeatureState.abilityScoreBonuses ?? []),
    ...abilityKeys.flatMap((ability) =>
      getCustomTraitAbilityScoreBonuses(
        customTraitEffectInput,
        ability
      ).map((bonus) => ({
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

function createPotentSpellcastingDamageBonusEntry(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "abilities" | "feats">,
  spell: SpellFeatureContext["spell"]
): FeatureDamageBonus | null {
  if (spell.spellLevel !== 0 || spell.damage.length === 0) {
    return null;
  }

  const cantripDamageBonus = getCantripDamageBonusForCharacter(character);

  return cantripDamageBonus === 0
    ? null
    : {
        label: "Potent Spellcasting",
        value: cantripDamageBonus,
        abilityModifierSource: "WIS"
      };
}

export function getSpellDamageBonusesForCharacter(
  character: Pick<
    Character,
    "className" | "level" | "classFeatureState" | "abilities" | "feats" | "cantripIds"
  >,
  spell: SpellFeatureContext["spell"]
): FeatureDamageBonus[] {
  const baseFeatureState = collectActiveClassFeatureState(character);
  const subclassDerivedState = getSubclassDerivedFeatureState(character);

  return [
    createPotentSpellcastingDamageBonusEntry(character, spell),
    ...(baseFeatureState.getSpellDamageBonuses?.({ spell }) ?? []),
    ...(subclassDerivedState.getSpellDamageBonuses?.({ spell }) ?? [])
  ].filter((entry): entry is FeatureDamageBonus => entry !== null);
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
    Partial<Pick<Character, "subclassId" | "toolProficiencies">>
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
  return clearRoundScopedFeatureStateIfOutOfCombat(
    applyBardBattleMagicAfterSpellCast(character, spell)
  );
}

export function activateBardicInspirationForCharacter(
  character: Character,
  fallbackSpellSlotLevel?: number
): Character {
  return clearRoundScopedFeatureStateIfOutOfCombat(
    activateBardicInspiration(character, fallbackSpellSlotLevel)
  );
}

export function applySpellCastFeatureEffectsForCharacter(
  character: Character,
  spell: Pick<SpellEntry, "id" | "castingTime" | "magicSchool" | "spellLevel" | "spellLists">,
  options?: {
    includeBardBattleMagic?: boolean;
    spellSlotLevel?: number | null;
    useRadiantSoul?: boolean;
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

  return clearRoundScopedFeatureStateIfOutOfCombat(
    applyWarlockFeaturesAfterSpellCast(
      applyWizardFeaturesAfterSpellCast(
        nextCharacterWithSorcererEffects,
        spell,
        options?.spellSlotLevel
      ),
      spell,
      { useRadiantSoul: options?.useRadiantSoul }
    )
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
