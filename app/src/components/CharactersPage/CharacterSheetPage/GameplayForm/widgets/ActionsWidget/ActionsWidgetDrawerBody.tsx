/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
// @ts-nocheck
import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import CellContainer from "../../../../../CellContainer/CellContainer";
import { useDiceRollerPopup } from "../../../../../DicePage/DiceRollerPopup";
import KeywordReferenceDrawer from "../../../../../KeywordReferenceDrawer/KeywordReferenceDrawer";
import ActionShape, { getActionShapeForCastingTime } from "../../../../../ActionShape";
import RollStatePill from "../../../../../RollStatePill/RollStatePill";
import FeatureOptInToggle from "../../../FeatureOptInToggle/FeatureOptInToggle";
import type { Character, CharacterWizardPortentRoll, MonsterRecord } from "../../../../../../types";
import { abilityKeys } from "../../../../../../pages/CharactersPage/constants";
import { getKeywordReferences } from "../../../../../../pages/CharactersPage/keywordDescriptions";
import {
  activateBardicInspirationForCharacter,
  activateInnateSorceryForCharacter,
  activateClericBlessingOfTheTricksterForCharacter,
  activateDruidNatureMagicianForCharacter,
  activateDruidStarryFormForCharacter,
  activateDruidWildResurgenceLevelOneSpellSlotRecoveryForCharacter,
  activateDruidWildResurgenceWildShapeRecoveryForCharacter,
  activateDruidWildShapeForCharacter,
  activateDruidWildCompanionForCharacter,
  activateFeatureActionForCharacter,
  activateFeatureActionOptionsForCharacter,
  activateFeatureActionOptionForCharacter,
  activateArcaneRecoveryForCharacter,
  applySpellCastFeatureEffectsForCharacter,
  applyInspiredEclipseStatusForCharacter,
  applyMantleOfMajestyStatusForCharacter,
  applyRangerWinterWalkerFrozenHauntStatusEntriesForCharacter,
  applyLayOnHandsForCharacter,
  consumeBeguilingMagicOrBardicInspirationForCharacter,
  consumeMantleOfMajestyUseForCharacter,
  consumeContactPatronUseForCharacter,
  expendChannelDivinityUseForCharacter,
  consumeFighterPsiWarriorPsionicStrikeForCharacter,
  consumeMysticArcanumUseForCharacter,
  consumeRangerGloomStalkerDreadAmbusherUseForCharacter,
  consumeRangerWinterWalkerFrozenHauntUseForCharacter,
  consumeRangerWinterWalkerPolarStrikesUseForCharacter,
  createSpellSlotFromSorceryPointsForCharacter,
  consumeFaithfulSteedUseForCharacter,
  consumePaladinsSmiteUseForCharacter,
  hasDruidTwinklingConstellationsFeatureForCharacter,
  getDruidWildResurgenceSpellSlotRecoveryUsesRemainingForCharacter,
  getDruidWildShapeKnownFormsForCharacter,
  getDruidWildShapeUsesRemainingForCharacter,
  getDruidWildShapeUsesTotalForCharacter,
  consumeRangerFavoredEnemyUseForCharacter,
  consumeRangerTirelessUseForCharacter,
  consumeBarbarianWarriorOfTheGodsChargesForCharacter,
  clearRoundScopedFeatureStateForCharacter,
  convertSpellSlotToSorceryPointsForCharacter,
  consumeNonMagicActionForCharacter,
  consumeSharedEconomyMultiForCharacterAction,
  consumeWeaponAttackActionForCharacter,
  createEconomyMultiContextForFeatureAction,
  createEconomyMultiContextForFeatureActionOption,
  expendMonkFocusPointForCharacter,
  getBardicInspirationUsesRemainingForCharacter,
  getChannelDivinityUsesRemainingForCharacter,
  getChannelDivinityUsesTotalForCharacter,
  getInnateSorceryActivationSorceryPointCostForCharacter,
  getMantleOfMajestyFallbackSlotLevelForCharacter,
  getMantleOfMajestyUsesRemainingForCharacter,
  getSorcererMetamagicActionCostForCharacter,
  getSorcererSpellfireCrownOfSpellfireFallbackSorceryPointCostForCharacter,
  getSorcererSpellfireCrownOfSpellfireUsesRemainingForCharacter,
  getSorcererSpellfireCrownOfSpellfireUsesTotalForCharacter,
  getSorceryPointsRemainingForCharacter,
  getSorceryPointsTotalForCharacter,
  getLayOnHandsCurableConditionsForCharacter,
  getSharedEconomyMultiCountForCharacterAction,
  getRangerWinterWalkerFrozenHauntSpellOptionStateForCharacter,
  getRangerWinterWalkerHuntersRimeTemporaryHitPointsFactsForCharacter,
  getRangerWinterWalkerHuntersRimeTemporaryHitPointsFormulaDisplayForCharacter,
  getRangerWinterWalkerHuntersRimeTemporaryHitPointsFormulaForCharacter,
  getWarlockHealingLightDiceRemainingForCharacter,
  getWarlockHealingLightMaxSpendForCharacter,
  getWarlockMysticArcanumSelectionsForCharacter,
  getWarlockPactMagicSlotsRemainingForCharacter,
  hasActivePaladinAuraOfProtectionForCharacter,
  restoreSorcererSubclassFeaturesOnSpellSlotCastForCharacter,
  markFeatureWeaponBonusUseForCharacter,
  markRangerHunterHordeBreakerUsedForCharacter,
  setRangerHunterHordeBreakerActionKeyForCharacter,
  spendWarlockHealingLightDiceForCharacter,
  type FeatureActionCard,
  type FeatureActionHeaderTag,
  type FeatureActionOptionCard
} from "../../../../../../pages/CharactersPage/classFeatures";
import { bardicInspirationActionKey } from "../../../../../../pages/CharactersPage/classFeatures/bard/bard";
import {
  createChargesCardUsage,
  createFeatureActionCardCost,
  createNamedUsageHeaderTags,
  createNamedResourceCardUsage
} from "../../../../../../pages/CharactersPage/classFeatures/cardUsage";
import { mantleOfInspirationActionKey } from "../../../../../../pages/CharactersPage/classFeatures/bard/subclasses/bardCollegeOfGlamour";
import {
  channelDivinityActionKey,
  preserveLifeActionKey
} from "../../../../../../pages/CharactersPage/classFeatures/cleric/cleric";
import {
  druidNatureMagicianActionKey,
  druidWildResurgenceActionKey,
  druidWildCompanionActionKey,
  druidWildShapeActionKey
} from "../../../../../../pages/CharactersPage/classFeatures/druid/druid";
import {
  activateBarbarianRage,
  activateBarbarianWildHeartRage,
  barbarianRageActionKey,
  barbarianWarriorOfTheGodsActionKey,
  getBarbarianBrutalStrikeDamageFormula,
  getBarbarianBrutalStrikeSelectionLimit,
  getBarbarianRageOfTheWildsOptions,
  getBarbarianRageOfTheGodsUsesRemaining,
  getBarbarianRageOfTheGodsUsesTotal,
  getBarbarianPowerOfTheWildsOptions
} from "../../../../../../pages/CharactersPage/classFeatures/barbarian/barbarian";
import {
  consumeFighterBattleMasterKnowYourEnemyForCharacter,
  expendFighterBattleMasterSuperiorityDieForCharacter,
  getFighterBattleMasterCombatSuperiorityUsedThisTurnForCharacter,
  getFighterBattleMasterSuperiorityDiceRemainingForCharacter,
  applyFighterTeamTacticsStatus,
  consumeFighterGroupRecoveryUse,
  getFighterGroupRecoveryHealingFormula,
  getFighterGroupRecoveryUsesRemaining,
  getFighterGroupRecoveryUsesTotal,
  fighterSecondWindActionKey,
  getFighterSecondWindHealingFormula,
  markFighterBattleMasterCombatSuperiorityUsedForCharacter
} from "../../../../../../pages/CharactersPage/classFeatures/fighter/fighter";
import {
  paladinChannelDivinityActionKey,
  type LayOnHandsCondition
} from "../../../../../../pages/CharactersPage/classFeatures/paladin/paladin";
import {
  activatePaladinOathOfDevotionSacredWeapon,
  applyPaladinOathOfDevotionSacredWeaponAction
} from "../../../../../../pages/CharactersPage/classFeatures/paladin/subclasses/paladinOathOfDevotion";
import {
  activatePaladinOathOfVengeanceVowOfEnmity,
  applyPaladinOathOfVengeanceVowOfEnmityAction
} from "../../../../../../pages/CharactersPage/classFeatures/paladin/subclasses/paladinOathOfVengeance";
import {
  applyPaladinOathOfTheNobleGeniesElementalSmiteEffect,
  getPaladinOathOfTheNobleGeniesElementalSmiteDamageDetail,
  hasPaladinOathOfTheNobleGeniesElementalSmite,
  type PaladinOathOfTheNobleGeniesElementalSmiteOptionKey
} from "../../../../../../pages/CharactersPage/classFeatures/paladin/subclasses/paladinOathOfTheNobleGenies";
import {
  fortifyingSoulActionKey,
  getRangerWinterWalkerFortifyingSoulHealingFormula,
  getRangerWinterWalkerFortifyingSoulHealingFormulaDisplay,
  huntersMarkSpellId,
  getRangerTirelessTemporaryHitPointsFormulaDisplay,
  getRangerTirelessTemporaryHitPointsFormula,
  tirelessActionKey
} from "../../../../../../pages/CharactersPage/classFeatures/ranger/ranger";
import { rangerBeastMasterReviveActionKey } from "../../../../../../pages/CharactersPage/classFeatures/ranger/subclasses/rangerBeastMaster";
import {
  innateSorceryActionKey,
  metamagicActionKey
} from "../../../../../../pages/CharactersPage/classFeatures/sorcerer/sorcerer";
import {
  sorcererWarpingImplosionActionKey,
  sorcererWarpingImplosionDamageFormula,
  sorcererWarpingImplosionDamageFormulaDisplay
} from "../../../../../../pages/CharactersPage/classFeatures/sorcerer/subclasses/sorcererAberrantSorcery";
import {
  getSorcererSpellfireBurstBolsteringFlamesRollFormula,
  getSorcererSpellfireBurstRadiantFireRollFormula,
  sorcererSpellfireBurstActionKey
} from "../../../../../../pages/CharactersPage/classFeatures/sorcerer/subclasses/sorcererSpellfireSorcery";
import {
  hasSorcererControlledChaosFeatureForCharacter,
  sorcererTidesOfChaosActionKey,
  sorcererWildMagicSurgeActionKey
} from "../../../../../../pages/CharactersPage/classFeatures/sorcerer/subclasses/sorcererWildMagicSorcery";
import {
  activateWarlockAwakenedMind,
  darkOnesOwnLuckActionKey,
  giftOfTheProtectorsActionKey,
  getWarlockClairvoyantCombatantUsesRemaining,
  getWarlockClairvoyantCombatantUsesTotal,
  hurlThroughHellActionKey
} from "../../../../../../pages/CharactersPage/classFeatures/warlock/warlock";
import { awakenedMindActionKey } from "../../../../../../pages/CharactersPage/classFeatures/warlock/subclasses/warlockGreatOldOnePatron";
import {
  getArcaneRecoverySelectionLevelTotal,
  type ArcaneRecoverySelection
} from "../../../../../../pages/CharactersPage/classFeatures/wizard/wizard";
import { wizardAbjurerArcaneWardActionKey } from "../../../../../../pages/CharactersPage/classFeatures/wizard/subclasses";
import { setWizardDivinerPortentRolls } from "../../../../../../pages/CharactersPage/classFeatures/wizard/subclasses/wizardDivinerPortent";
import { activateWizardDivinerThirdEye } from "../../../../../../pages/CharactersPage/classFeatures/wizard/subclasses/wizardDivinerThirdEye";
import {
  getRogueSneakAttackEffectDefinitions,
  getRogueSneakAttackFormula,
  getRogueSneakAttackFormulaDisplay
} from "../../../../../../pages/CharactersPage/classFeatures/rogue/rogue";
import {
  consumeRogueSoulknifeRendMindUse,
  getRogueSoulknifePsionicDiceRemaining,
  getRogueSoulknifePsychicTeleportationRollFormula,
  getRogueSoulknifePsychicTeleportationRollFormulaDisplay,
  getRogueSoulknifePsychicWhispersRollFormula,
  getRogueSoulknifePsychicWhispersRollFormulaDisplay,
  getRogueSoulknifeRendMindSavingThrowDc,
  getRogueSoulknifeRendMindUsesRemaining,
  getRogueSoulknifeRendMindUsesTotal,
  hasRogueSoulknifeRendMindFeature,
  rogueSoulknifePsychicTeleportationActionKey,
  rogueSoulknifePsychicWhispersActionKey
} from "../../../../../../pages/CharactersPage/classFeatures/rogue/subclasses/rogueSoulknife";
import {
  getCombatActionsForCharacter,
  type GameplayActionDefinition
} from "../../../../../../pages/CharactersPage/combatActions";
import { isCommonActionKey } from "../../../../../../pages/CharactersPage/commonActions";
import {
  ACTION_CATEGORY,
  ECONOMY_TYPE,
  getRoundTrackerResourceForEconomyType,
  type EconomyType
} from "../../../../../../pages/CharactersPage/actionEconomy";
import {
  getAbilityModifierBreakdownForCharacter,
  getAbilityScoresForCharacter
} from "../../../../../../pages/CharactersPage/abilities";
import {
  getProficiencyBonus,
  type WeaponAction
} from "../../../../../../pages/CharactersPage/gameplay";
import {
  isRoundTrackerResourceAvailable,
  shouldTrackRoundScopedResources
} from "../../../../../../pages/CharactersPage/combat";
import {
  applySpellConcentrationToStatusEntries,
  removeInvisibleConditionFromCharacter
} from "../../../../../../pages/CharactersPage/statusEntries";
import {
  applyRolledHealingToCharacter,
  applyRolledTemporaryHitPointsToCharacter,
  consumeRoundTrackerResourceForCharacter,
  prepareCharacterForRoundTrackerResourceConsumption
} from "../../gameplayStateUtils";
import { getSpellDamageDetailForCharacter } from "../../../../../../pages/CharactersPage/spellOutcome";
import {
  getSavingThrowLevelFromEntries,
  getSavingThrowProficiencyForAbilityKey
} from "../../../../../../pages/CharactersPage/proficiency";
import { getFeatureDescriptionForCharacter } from "../../../../../../pages/CharactersPage/classFeatures/featureDescriptions";
import {
  CLASS_FEATURE,
  ACTION_TYPE,
  DAMAGE_TYPE,
  MAGIC_SCHOOL,
  type SpellEntry
} from "../../../../../../codex/entries";
import {
  formatSignedLabel,
  getProficiencyMultiplier,
  getRoundTrackerResourceForSpell
} from "../../../../../../pages/CharactersPage/shared";
import {
  getSpellLevel,
  getSpellSlotTotalsForCharacter,
  normalizeSpellSlotsExpended
} from "../../../../../../pages/CharactersPage/spellcasting";
import sheetStyles from "../../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import {
  getActionShapeForEconomyType,
  getEconomyShapeState,
  getRoundTrackerActionWarning
} from "../../gameplayWidgetUtils";
import {
  formatResolvedRollStateDetailText,
  getRollModeFromIndicators
} from "../../../../../RollStatePill/rollState";
import { useBodyScrollLock } from "../../../../../../lib/useBodyScrollLock";
import d20Icon from "../../../../../../assets/svg/d20.svg";
import { setNextRollModeOverride, useAppDispatch, useAppSelector } from "../../../../../../store";
import ActionButton from "../../../../../ActionButton";
import styles from "./ActionsWidget.module.css";
import { getSpellActionPathStates, getSpellActionPathWarning } from "../../../spellActionPaths";
import SneakAttackActionBody, { type SneakAttackActionSelection } from "./SneakAttackModal";
import GameplayActionDrawer from "./GameplayActionDrawer";
import ActionDiceConfirmFooter from "./ActionDiceConfirmFooter";
import { ArcaneWardActionFooter } from "./ArcaneWardActionFooter";
import { BardicInspirationActionFooter } from "./BardicInspirationActionFooter";
import { BeastMasterReviveActionFooter } from "./BeastMasterReviveActionFooter";
import BookOfShadowsActionBody from "./BookOfShadowsActionBody";
import CodexDivinityDrawer from "../../../../../CodexPage/CodexDivinityDrawer/CodexDivinityDrawer";
import BlessingOfTheTricksterActionBody from "./BlessingOfTheTricksterActionBody";
import { ClericPreserveLifeActionBody } from "./ClericPreserveLifeAction";
import DiceRollerSettingsButton from "../DiceRollerSettingsButton";
import WeaponAttackFooterButtons from "./WeaponAttackFooterButtons";
import ClericChannelDivinityAction from "./ClericChannelDivinityAction";
import DruidStarryFormActionBody from "../TraitsConditionsWidget/DruidStarryFormActionBody";
import {
  FighterSecondWindActionBody,
  FighterSecondWindActionFooter
} from "./FighterSecondWindAction";
import HealingLightActionBody, { type HealingLightTarget } from "./HealingLightActionBody";
import RecoverVitalityActionBody from "./RecoverVitalityActionBody";
import {
  IndomitableActionBody,
  IndomitableActionFooter,
  type IndomitableOption
} from "./IndomitableAction";
import PortentActionBody, { portentActionFormId } from "./PortentActionBody";
import { LayOnHandsActionBody, LayOnHandsActionFooter } from "./LayOnHandsAction";
import { SorcererInnateSorceryActionFooter } from "./SorcererInnateSorceryAction";
import ThirdEyeActionBody from "./ThirdEyeActionBody";
import { WarlockAwakenedMindActionFooter } from "./WarlockAwakenedMindAction";
import { WarriorOfTheGodsActionBody, WarriorOfTheGodsActionFooter } from "./WarriorOfTheGodsAction";
import {
  appendRollModifier,
  getWeaponAttackFormulaPresentation,
  getWeaponDamageFormulaPresentation
} from "./actionsWidgetPresentation";
import {
  applyArcaneWardActionUse,
  getArcaneWardDisabledReason,
  getArcaneWardSpellSlotOptions
} from "./arcaneWardAction";
import {
  applyRangerHuntersMarkTargetWeaponAction,
  getRangerHuntersMarkTargetWeaponOptionState,
  huntersMarkWeaponDamageBonusLabel
} from "./rangerHuntersMarkWeapon";
import RangerHunterWeaponOptions from "./RangerHunterWeaponOptions";
import { applyCriticalHitToWeaponAction } from "./weaponCriticalHit";
import { consumeMonkStunningStrike } from "../../../../../../pages/CharactersPage/classFeatures/monk/monkStunningStrike";
import {
  activateMonkFlurryOfBlows,
  getMonkPatientDefenseTemporaryHitPointsFormula,
  monkFlurryOfBlowsActionKey,
  monkPatientDefenseActionKey,
  monkStepOfTheWindActionKey
} from "../../../../../../pages/CharactersPage/classFeatures/monk/monk";
import {
  activateMonkWarriorOfMercyHandOfHealing,
  getMonkWarriorOfMercyFlurryOfHealingAndHarmUsesRemaining,
  getMonkWarriorOfMercyFlurryOfHealingAndHarmUsesTotal,
  getMonkWarriorOfMercyHandOfHealingFormula,
  isMonkWarriorOfMercyFlurryOfHealingAndHarmActive,
  monkHandOfHealingActionKey
} from "../../../../../../pages/CharactersPage/classFeatures/monk/subclasses/monkWarriorOfMercy";
import {
  consumeMonkWarriorOfTheOpenHandFleetStepFollowUpUse,
  activateMonkWarriorOfTheOpenHandQuiveringPalmMark,
  monkWarriorOfTheOpenHandQuiveringPalmFocusCost,
  getMonkWarriorOfTheOpenHandWholenessOfBodyHealingFormula,
  monkWholenessOfBodyActionKey
} from "../../../../../../pages/CharactersPage/classFeatures/monk/subclasses/monkWarriorOfTheOpenHand";
import {
  activateMonkWarriorOfShadowImprovedShadowStep,
  monkShadowStepActionKey
} from "../../../../../../pages/CharactersPage/classFeatures/monk/subclasses/monkWarriorOfShadow";
import {
  getMonkWarriorOfTheElementsElementalBurstDamageFormula,
  hasMonkWarriorOfTheElementsElementalEpitome,
  monkElementalAttunementActionKey,
  monkElementalBurstActionKey,
  setMonkWarriorOfTheElementsElementalResistanceDamageTypeSelection
} from "../../../../../../pages/CharactersPage/classFeatures/monk/subclasses/monkWarriorOfTheElements";
import { CommonActionFooter } from "./CommonAction";
import ElementalAttunementResistanceSelector from "../TraitsConditionsWidget/ElementalAttunementResistanceSelector";
import { ElementalBurstActionFooter } from "./ElementalBurstAction";
import { MonkHandOfHealingActionFooter } from "./MonkHandOfHealingAction";
import { MonkFlurryOfBlowsActionFooter } from "./MonkFlurryOfBlowsActionFooter";
import {
  SpellfireBurstActionBody,
  SpellfireBurstActionFooter,
  type SpellfireBurstEffect,
  type SpellfireBurstTarget
} from "./SpellfireBurstAction";
import CommonActionsModal from "./CommonActionsModal";
import { getCommonActionPathStates } from "./commonActionEconomy";
import { getMonkHandOfHealingActionPathStates } from "./monkHandOfHealingActionUtils";
import ArcaneRecoveryActionBody from "./forms/ArcaneRecoveryActionBody";
import BrutalStrikeActionBody from "./forms/BrutalStrikeActionBody";
import DivineInterventionActionBody from "./forms/DivineInterventionActionBody";
import FeatureOptionsActionBody from "./forms/FeatureOptionsActionBody";
import FontOfMagicActionBody from "./forms/FontOfMagicActionBody";
import MetamagicOptionsActionBody from "./forms/MetamagicOptionsActionBody";
import MysticArcanumActionBody from "./forms/MysticArcanumActionBody";
import NatureMagicianActionBody from "./forms/NatureMagicianActionBody";
import RageActionBody from "./forms/RageActionBody";
import WildCompanionActionBody from "./forms/WildCompanionActionBody";
import WildResurgenceActionBody from "./forms/WildResurgenceActionBody";
import WildShapeActionBody from "./forms/WildShapeActionBody";
import {
  createChannelDivinityOptionRows,
  type ChannelDivinityOptionRow
} from "../../../channelDivinityUtils";
import { getWeaponAttackPathStates } from "./weaponActionEconomy";
import {
  formatD20RollFormula,
  getFeatureActionDrawerPrimaryLabel,
  getFixedSpellEntryForExecute,
  grantMonkFleetStepFollowUpIfEligible,
  resolveFeatureSavingThrowBonusTotal,
  shouldConsumeMonkFleetStepFollowUp
} from "./actionHelpers";
import type { ActionsWidgetProps } from "./types";
import { useActionsWidgetUiState } from "./useActionsWidgetUiState";
import { useActionsWidgetExecution } from "./useActionsWidgetExecution";
import { useActionsWidgetActions } from "./useActionsWidgetActions";
import { useActionResourceOptionModel } from "./useActionResourceOptionModel";
import { useSelectedActionModel } from "./useSelectedActionModel";
import { useSelectedWeaponActionModel } from "./useSelectedWeaponActionModel";
import ActionsGrid from "./ActionsGrid";
import FeatureSpellDrawers from "./FeatureSpellDrawers";
import WildShapePreviewDrawer from "./WildShapePreviewDrawer";



export function renderActionDrawerBody(context: Record<string, any>) {
  const {
    arcaneWardSpellSlotOptions,
    bardicInspirationFallbackSpellSlotOptions,
    beastMasterReviveSpellSlotOptions,
    canSubmitLayOnHands,
    canSubmitSelectedWarriorOfTheGodsRoll,
    canUseInspiredEclipse,
    canUseSelectedWildCompanionResource,
    canUseSelectedWildResurgenceMode,
    character,
    confirmFontOfMagicSelection,
    confirmSelectedFeatureOptions,
    executeCommonAction,
    executeFeatureActivate,
    executeMonkFlurryOfBlowsAction,
    executeMonkHandOfHealingPath,
    fixedSpellSlotTotals,
    fixedSpellSlotsRemaining,
    handleWeaponAttackRoll,
    handleWeaponDamageRoll,
    indomitableSavingThrowOptions,
    isClairvoyantCombatantSelected,
    isColossusSlayerSelected,
    isCrownOfSpellfireSelected,
    isDiceRollerSettingsOpen,
    isDreadfulStrikeSelected,
    isEmpoweredStrikesSelected,
    isFlurryOfHealingAndHarmSelected,
    isGroupRecoverySelected,
    isHandOfHarmSelected,
    isHordeBreakerSelected,
    isHuntersMarkTargetSelected,
    isImprovedShadowStepSelected,
    isInspiredEclipseSelected,
    isPolarStrikesSelected,
    isPsionicStrikeSelected,
    isQuiveringPalmSelected,
    isRageOfTheGodsSelected,
    isSacredWeaponSelected,
    isStunningStrikeSelected,
    isVowOfEnmitySelected,
    natureMagicianOptions,
    onPersistCharacter,
    openMysticArcanumSpell,
    openWeaponDetailReference,
    roundTracker,
    selectedAction,
    selectedActionEconomyShapeState,
    selectedActionOptionKeys,
    selectedArcaneRecoverySelection,
    selectedArcaneWardDisabledReason,
    selectedArcaneWardSpellSlotLevel,
    selectedBardicInspirationFallbackDisabledReason,
    selectedBardicInspirationSpellSlotLevel,
    selectedBeastMasterReviveDisabledReason,
    selectedBeastMasterReviveSpellSlotLevel,
    selectedBlessingOfTheTricksterTarget,
    selectedChannelDivinityRows,
    selectedClairvoyantCombatantToggleDisabled,
    selectedClairvoyantCombatantToggleDisabledReason,
    selectedClairvoyantCombatantUsesRemaining,
    selectedClairvoyantCombatantUsesTotal,
    selectedCommonActionPathStates,
    selectedCommonActionPrimaryDisabledReason,
    selectedCommonActionSecondaryDisabledReason,
    selectedCrownOfSpellfireBlockedReason,
    selectedCrownOfSpellfireFallbackSorceryPointCost,
    selectedCrownOfSpellfireUsesRemaining,
    selectedCrownOfSpellfireUsesTotal,
    selectedDrawerOption,
    selectedFeatureAction,
    selectedFeatureActionPrimaryDisabledReason,
    selectedFlurryOfBlowsPrimaryDisabledReason,
    selectedFlurryOfHealingAndHarmDisabledReason,
    selectedFlurryOfHealingAndHarmUsesRemaining,
    selectedFlurryOfHealingAndHarmUsesTotal,
    selectedFontOfMagicSelection,
    selectedFontOfMagicWarning,
    selectedHandOfHealingActionPathStates,
    selectedHandOfHealingFlurryOfHealingAndHarmHelperText,
    selectedHealingLightDiceCount,
    selectedHealingLightDiceRemaining,
    selectedHealingLightMaxDicePerUse,
    selectedHealingLightMaxSelectableDice,
    selectedHealingLightTarget,
    selectedImprovedShadowStepState,
    selectedIndomitableAbility,
    selectedIndomitableOption,
    selectedLayOnHandsConditions,
    selectedLayOnHandsPoolSpendAmount,
    selectedLayOnHandsPoolSpendInput,
    selectedLayOnHandsTarget,
    selectedMetamagicCost,
    selectedMonkElementalAttunementResistanceDamageType,
    selectedMonkPatientDefenseTemporaryHitPointsFormula,
    selectedMonkWholenessOfBodyHealingFormula,
    selectedNatureMagicianOption,
    selectedNatureMagicianSpellSlotLevel,
    selectedOptionEconomyShapeState,
    selectedOptionWarning,
    selectedRageOfTheGodsDescription,
    selectedRageOfTheGodsUsesRemaining,
    selectedRageOfTheGodsUsesTotal,
    selectedRageOptionKey,
    selectedRageOptions,
    selectedRagePowerOptionKey,
    selectedRagePowerOptions,
    selectedRageSelectionWarning,
    selectedRecoverVitalityDiceCount,
    selectedRecoverVitalityDiceRemaining,
    selectedSecondWindGroupRecoveryFormula,
    selectedSecondWindGroupRecoveryUsesRemaining,
    selectedSecondWindGroupRecoveryUsesTotal,
    selectedSecondWindHealingFormula,
    selectedSpellfireBurstTarget,
    selectedStarryFormConstellation,
    selectedThirdEyeOptionKey,
    selectedUnarmedStrikeFlurryOfHealingAndHarmHelperText,
    selectedWarriorOfTheGodsChargeCount,
    selectedWarriorOfTheGodsUsesRemaining,
    selectedWeaponAttackFormula,
    selectedWeaponColossusSlayerState,
    selectedWeaponColossusSlayerToggleDisabled,
    selectedWeaponDamageFormula,
    selectedWeaponDetails,
    selectedWeaponDreadAmbusherState,
    selectedWeaponDreadfulStrikeToggleDisabled,
    selectedWeaponLifedrinkerState,
    selectedWeaponEmpoweredStrikesState,
    selectedWeaponEmpoweredStrikesToggleDisabled,
    selectedWeaponFeyDreadfulStrikesState,
    selectedWeaponFeyDreadfulStrikesToggleDisabled,
    selectedWeaponHandOfHarmDisabledReason,
    selectedWeaponHandOfHarmState,
    selectedWeaponHandOfHarmToggleDisabled,
    selectedWeaponHandOfHarmUsage,
    selectedWeaponHordeBreakerState,
    selectedWeaponHordeBreakerToggleDisabled,
    selectedWeaponHuntersMarkTargetState,
    selectedWeaponHuntersMarkTargetToggleDisabled,
    selectedWeaponPolarStrikesState,
    selectedWeaponPolarStrikesToggleDisabled,
    selectedWeaponPrimaryAttackPathState,
    selectedWeaponPrimaryDisabledReason,
    selectedWeaponPsionicStrikeAvailable,
    selectedWeaponPsionicStrikeFormula,
    selectedWeaponQuiveringPalmDisabledReason,
    selectedWeaponQuiveringPalmState,
    selectedWeaponQuiveringPalmToggleDisabled,
    selectedWeaponRollState,
    selectedWeaponSacredWeaponState,
    selectedWeaponSacredWeaponToggleDisabled,
    selectedWeaponSecondaryAttackPathState,
    selectedWeaponSecondaryDisabledReason,
    selectedWeaponStunningStrikeDisabledReason,
    selectedWeaponStunningStrikeState,
    selectedWeaponStunningStrikeToggleDisabled,
    selectedWeaponVowOfEnmityState,
    selectedWeaponVowOfEnmityToggleDisabled,
    selectedWildCompanionResource,
    selectedWildCompanionSpellSlotLevel,
    selectedWildResurgenceMode,
    selectedWildResurgenceSpellSlotLevel,
    selectedWildShapeMonster,
    selectedWildShapeMonsterSlug,
    setIsClairvoyantCombatantSelected,
    setIsColossusSlayerSelected,
    setIsCrownOfSpellfireSelected,
    setIsDiceRollerSettingsOpen,
    setIsDreadfulStrikeSelected,
    setIsEmpoweredStrikesSelected,
    setIsFixedSpellDrawerOpen,
    setIsFlurryOfHealingAndHarmSelected,
    setIsGroupRecoverySelected,
    setIsHandOfHarmSelected,
    setIsHuntersMarkTargetSelected,
    setIsImprovedShadowStepSelected,
    setIsInspiredEclipseSelected,
    setIsPolarStrikesSelected,
    setIsPsionicStrikeSelected,
    setIsQuiveringPalmSelected,
    setIsRageOfTheGodsSelected,
    setIsSacredWeaponSelected,
    setIsStunningStrikeSelected,
    setIsVowOfEnmitySelected,
    setSelectedActionOptionKeys,
    setSelectedArcaneRecoverySelection,
    setSelectedArcaneWardSpellSlotLevel,
    setSelectedBardicInspirationSpellSlotLevel,
    setSelectedBeastMasterReviveSpellSlotLevel,
    setSelectedBlessingOfTheTricksterTarget,
    setSelectedChannelDivinityOptionKey,
    setSelectedDivineInterventionSpell,
    setSelectedFontOfMagicSelection,
    setSelectedHealingLightDiceCount,
    setSelectedHealingLightTarget,
    setSelectedIndomitableAbility,
    setSelectedLayOnHandsConditions,
    setSelectedLayOnHandsPoolSpendInput,
    setSelectedLayOnHandsTarget,
    setSelectedNatureMagicianSpellSlotLevel,
    setSelectedRageOptionKey,
    setSelectedRagePowerOptionKey,
    setSelectedRecoverVitalityDiceCount,
    setSelectedSpellfireBurstTarget,
    setSelectedStarryFormConstellation,
    setSelectedThirdEyeOptionKey,
    setSelectedWarriorOfTheGodsChargeCount,
    setSelectedWildCompanionResource,
    setSelectedWildCompanionSpellSlotLevel,
    setSelectedWildResurgenceMode,
    setSelectedWildResurgenceSpellSlotLevel,
    setSelectedWildShapeMonsterSlug,
    setSelectedWildShapePreviewSlug,
    setSneakAttackActionSelection,
    showBardicInspirationFallbackSlotSelect,
    showSelectedFlurryOfHealingAndHarmToggle,
    sneakAttackActionSelection,
    submitArcaneRecovery,
    submitBlessingOfTheTrickster,
    submitBrutalStrike,
    submitHealingLight,
    submitIndomitable,
    submitLayOnHands,
    submitMonkElementalBurst,
    submitMonkPatientDefense,
    submitMonkWholenessOfBody,
    submitNatureMagician,
    submitPortent,
    submitRage,
    submitRogueSoulknifePsionicDieRollAction,
    submitSneakAttack,
    submitSorcererSpellfireBurst,
    submitSorcererWarpingImplosion,
    submitSorcererWildMagicSurge,
    submitStarryForm,
    submitThirdEye,
    submitWarriorOfTheGods,
    submitWildCompanion,
    submitWildResurgence,
    submitWildShape,
    toggleFeatureOptionSelection,
    updateMonkElementalAttunementResistanceDamageType,
    wildCompanionSpellSlotOptions,
    wildResurgenceSpellSlotOptions,
    wildResurgenceSpellSlotRecoveryUsesRemaining,
    wildShapeKnownForms,
    wildShapeUsesRemaining,
    wildShapeUsesTotal
  } = context;
    if (!selectedAction) {
      return null;
    }

    if (selectedAction.kind === "weapon") {
      return (
        <div className={styles.weaponDrawerBody}>
          <div className={sheetStyles.spellDrawerDetails}>
            {selectedWeaponDetails.map((detail) => {
              const detailKey = `${selectedAction.key}-${detail.key}`;

              if (detail.referenceKeywords?.length) {
                return (
                  <CellContainer
                    key={detailKey}
                    as="button"
                    type="button"
                    className={styles.weaponDetailButton}
                    label={detail.label}
                    content={detail.value}
                    onClick={() =>
                      openWeaponDetailReference(
                        detail.referenceTitle ?? String(detail.label),
                        detail.referenceKeywords
                      )
                    }
                  />
                );
              }

              return <CellContainer key={detailKey} label={detail.label} content={detail.value} />;
            })}
          </div>

          <div className={clsx(sheetStyles.spellDrawerDetails, styles.weaponFormulaList)}>
            {selectedWeaponAttackFormula ? (
              <CellContainer
                label={selectedWeaponAttackFormula.label}
                content={selectedWeaponAttackFormula.value}
                breakdown={selectedWeaponAttackFormula.breakdown}
                contentClassName={styles.weaponFormulaValue}
                breakdownClassName={styles.weaponFormulaBreakdown}
              />
            ) : null}

            {selectedWeaponDamageFormula ? (
              <CellContainer
                label={selectedWeaponDamageFormula.label}
                content={selectedWeaponDamageFormula.value}
                breakdown={selectedWeaponDamageFormula.breakdown}
                contentClassName={styles.weaponFormulaValue}
                breakdownClassName={styles.weaponFormulaBreakdown}
              />
            ) : null}

            {selectedWeaponLifedrinkerState ? (
              <CellContainer
                label={selectedWeaponLifedrinkerState.healFormulaPresentation.label}
                content={selectedWeaponLifedrinkerState.healFormulaPresentation.value}
                breakdown={selectedWeaponLifedrinkerState.healFormulaPresentation.breakdown}
                contentClassName={styles.weaponFormulaValue}
                breakdownClassName={styles.weaponFormulaBreakdown}
              />
            ) : null}
          </div>
        </div>
      );
    }

    if (selectedAction.action.key === barbarianRageActionKey) {
      return (
        <RageActionBody
          action={selectedAction.action}
          rageOptions={selectedRageOptions}
          powerOptions={selectedRagePowerOptions}
          rageOfTheGodsDescription={selectedRageOfTheGodsDescription}
          selectedRageOptionKey={selectedRageOptionKey}
          selectedPowerOptionKey={selectedRagePowerOptionKey}
          onSelectRageOption={setSelectedRageOptionKey}
          onSelectPowerOption={setSelectedRagePowerOptionKey}
          rageOfTheGodsUsesRemaining={selectedRageOfTheGodsUsesRemaining}
          rageOfTheGodsUsesTotal={selectedRageOfTheGodsUsesTotal}
          isRageOfTheGodsSelected={isRageOfTheGodsSelected}
          onToggleRageOfTheGods={setIsRageOfTheGodsSelected}
        />
      );
    }

    if (
      selectedAction.kind === "feature" &&
      selectedAction.action.key === fighterSecondWindActionKey
    ) {
      return (
        <FighterSecondWindActionBody
          healingFormula={
            selectedSecondWindHealingFormula ?? getFighterSecondWindHealingFormula(character)
          }
          groupRecoveryFormula={selectedSecondWindGroupRecoveryFormula}
        />
      );
    }

    if (selectedAction.kind === "feature" && selectedAction.action.key === preserveLifeActionKey) {
      return <ClericPreserveLifeActionBody clericLevel={character.level} />;
    }

    if (
      selectedAction.kind === "feature" &&
      selectedAction.action.key === giftOfTheProtectorsActionKey
    ) {
      return (
        <BookOfShadowsActionBody character={character} onPersistCharacter={onPersistCharacter} />
      );
    }

    if (
      selectedAction.kind === "feature" &&
      selectedAction.action.key === monkElementalAttunementActionKey &&
      hasMonkWarriorOfTheElementsElementalEpitome(character)
    ) {
      return (
        <ElementalAttunementResistanceSelector
          selectedDamageType={selectedMonkElementalAttunementResistanceDamageType}
          onSelectDamageType={updateMonkElementalAttunementResistanceDamageType}
          name="monk-elemental-attunement-resistance"
        />
      );
    }

    if (
      selectedAction.kind === "feature" &&
      selectedAction.drawer.kind === "options" &&
      selectedChannelDivinityRows.length > 0
    ) {
      return (
        <ClericChannelDivinityAction
          rows={selectedChannelDivinityRows}
          character={character}
          roundTracker={roundTracker}
          onOpenDivinity={(row) => setSelectedChannelDivinityOptionKey(row.option.key)}
        />
      );
    }

    if (selectedAction.drawer.kind === "options") {
      if (selectedAction.action.key === metamagicActionKey) {
        return (
          <MetamagicOptionsActionBody
            options={selectedAction.drawer.options}
            selectedOptionKeys={selectedActionOptionKeys}
            selectionLimit={
              selectedAction.drawer.selectionLimit ?? selectedAction.drawer.options.length
            }
            onToggleOption={toggleFeatureOptionSelection}
          />
        );
      }

      return (
        <FeatureOptionsActionBody
          action={selectedAction}
          character={character}
          roundTracker={roundTracker}
          selectedOptionKeys={selectedActionOptionKeys}
          onToggleOption={toggleFeatureOptionSelection}
        />
      );
    }

    if (selectedAction.drawer.kind === "custom-form") {
      if (selectedAction.drawer.formKind === "portent") {
        return <PortentActionBody character={character} onSubmit={submitPortent} />;
      }

      if (selectedAction.drawer.formKind === "third-eye") {
        return (
          <ThirdEyeActionBody
            selectedOptionKey={selectedThirdEyeOptionKey}
            onSelectOption={setSelectedThirdEyeOptionKey}
          />
        );
      }

      if (selectedAction.drawer.formKind === "blessing-of-the-trickster") {
        return (
          <BlessingOfTheTricksterActionBody
            selectedTarget={selectedBlessingOfTheTricksterTarget}
            onSelectTarget={setSelectedBlessingOfTheTricksterTarget}
          />
        );
      }

      if (selectedAction.drawer.formKind === "arcane-recovery") {
        return (
          <ArcaneRecoveryActionBody
            character={character}
            selection={selectedArcaneRecoverySelection}
            onSelectionChange={setSelectedArcaneRecoverySelection}
          />
        );
      }

      if (selectedAction.drawer.formKind === "indomitable") {
        return (
          <IndomitableActionBody
            options={indomitableSavingThrowOptions}
            selectedAbility={selectedIndomitableAbility}
            onSelectAbility={setSelectedIndomitableAbility}
          />
        );
      }

      if (selectedAction.drawer.formKind === "lay-on-hands") {
        return (
          <LayOnHandsActionBody
            conditionOptions={getLayOnHandsCurableConditionsForCharacter(character)}
            target={selectedLayOnHandsTarget}
            poolSpendInput={selectedLayOnHandsPoolSpendInput}
            selectedConditions={selectedLayOnHandsConditions}
            onTargetChange={setSelectedLayOnHandsTarget}
            onPoolSpendInputChange={setSelectedLayOnHandsPoolSpendInput}
            onSelectedConditionsChange={setSelectedLayOnHandsConditions}
          />
        );
      }

      if (selectedAction.drawer.formKind === "healing-light") {
        return (
          <HealingLightActionBody
            remainingDice={selectedHealingLightDiceRemaining}
            maxDicePerUse={selectedHealingLightMaxDicePerUse}
            selectedDiceCount={selectedHealingLightDiceCount}
            selectedTarget={selectedHealingLightTarget}
            onSelectedDiceCountChange={setSelectedHealingLightDiceCount}
            onSelectedTargetChange={setSelectedHealingLightTarget}
          />
        );
      }

      if (selectedAction.drawer.formKind === "recover-vitality") {
        return (
          <RecoverVitalityActionBody
            remainingDice={selectedRecoverVitalityDiceRemaining}
            selectedDiceCount={selectedRecoverVitalityDiceCount}
            onSelectedDiceCountChange={setSelectedRecoverVitalityDiceCount}
          />
        );
      }

      if (selectedAction.drawer.formKind === "warrior-of-the-gods") {
        return (
          <WarriorOfTheGodsActionBody
            remainingCharges={selectedWarriorOfTheGodsUsesRemaining}
            selectedChargeCount={selectedWarriorOfTheGodsChargeCount}
            onSelectedChargeCountChange={setSelectedWarriorOfTheGodsChargeCount}
          />
        );
      }

      if (selectedAction.drawer.formKind === "sneak-attack") {
        return (
          <SneakAttackActionBody
            action={selectedAction.action}
            character={character}
            selection={sneakAttackActionSelection}
            onSelectionChange={setSneakAttackActionSelection}
          />
        );
      }

      if (selectedAction.drawer.formKind === "spellfire-burst") {
        return (
          <SpellfireBurstActionBody
            selectedTarget={selectedSpellfireBurstTarget}
            onSelectTarget={setSelectedSpellfireBurstTarget}
          />
        );
      }

      if (selectedAction.drawer.formKind === "wild-shape") {
        return (
          <WildShapeActionBody
            monsters={wildShapeKnownForms}
            selectedMonsterSlug={selectedWildShapeMonsterSlug}
            onSelectMonster={setSelectedWildShapeMonsterSlug}
            onPreviewMonster={setSelectedWildShapePreviewSlug}
          />
        );
      }

      if (selectedAction.drawer.formKind === "starry-form") {
        return (
          <DruidStarryFormActionBody
            selectedConstellation={selectedStarryFormConstellation}
            hasTwinklingConstellations={hasDruidTwinklingConstellationsFeatureForCharacter(
              character
            )}
            onSelectConstellation={setSelectedStarryFormConstellation}
          />
        );
      }

      if (selectedAction.drawer.formKind === "wild-companion") {
        return (
          <WildCompanionActionBody
            wildShapeUsesRemaining={wildShapeUsesRemaining}
            wildShapeUsesTotal={wildShapeUsesTotal}
            spellSlotOptions={wildCompanionSpellSlotOptions}
            selectedResource={selectedWildCompanionResource}
            selectedSpellSlotLevel={selectedWildCompanionSpellSlotLevel}
            onSelectResource={setSelectedWildCompanionResource}
            onSelectSpellSlotLevel={setSelectedWildCompanionSpellSlotLevel}
          />
        );
      }

      if (selectedAction.drawer.formKind === "nature-magician") {
        return (
          <NatureMagicianActionBody
            options={natureMagicianOptions}
            selectedSpellSlotLevel={selectedNatureMagicianSpellSlotLevel}
            onSelectSpellSlotLevel={setSelectedNatureMagicianSpellSlotLevel}
          />
        );
      }

      if (selectedAction.drawer.formKind === "wild-resurgence") {
        return (
          <WildResurgenceActionBody
            spellSlotOptions={wildResurgenceSpellSlotOptions}
            selectedMode={selectedWildResurgenceMode}
            selectedSpellSlotLevel={selectedWildResurgenceSpellSlotLevel}
            wildShapeUsesRemaining={wildShapeUsesRemaining}
            wildShapeUsesTotal={wildShapeUsesTotal}
            levelOneSpellSlotRemaining={fixedSpellSlotsRemaining[0] ?? 0}
            levelOneSpellSlotTotal={fixedSpellSlotTotals[0] ?? 0}
            spellSlotRecoveryUsesRemaining={wildResurgenceSpellSlotRecoveryUsesRemaining}
            onSelectMode={setSelectedWildResurgenceMode}
            onSelectSpellSlotLevel={setSelectedWildResurgenceSpellSlotLevel}
          />
        );
      }

      if (selectedAction.drawer.formKind === "font-of-magic") {
        return (
          <FontOfMagicActionBody
            actionWarning={selectedFontOfMagicWarning}
            character={character}
            selectedSelection={selectedFontOfMagicSelection}
            onSelectSelection={setSelectedFontOfMagicSelection}
          />
        );
      }

      if (selectedAction.drawer.formKind === "wild-heart-rage") {
        return (
          <RageActionBody
            action={selectedAction.action}
            rageOptions={selectedRageOptions}
            powerOptions={selectedRagePowerOptions}
            rageOfTheGodsDescription={selectedRageOfTheGodsDescription}
            selectedRageOptionKey={selectedRageOptionKey}
            selectedPowerOptionKey={selectedRagePowerOptionKey}
            onSelectRageOption={setSelectedRageOptionKey}
            onSelectPowerOption={setSelectedRagePowerOptionKey}
            rageOfTheGodsUsesRemaining={selectedRageOfTheGodsUsesRemaining}
            rageOfTheGodsUsesTotal={selectedRageOfTheGodsUsesTotal}
            isRageOfTheGodsSelected={isRageOfTheGodsSelected}
            onToggleRageOfTheGods={setIsRageOfTheGodsSelected}
          />
        );
      }

      if (selectedAction.drawer.formKind === "brutal-strike") {
        return (
          <BrutalStrikeActionBody
            options={selectedAction.drawer.options ?? []}
            selectionLimit={getBarbarianBrutalStrikeSelectionLimit(character)}
            damageFormula={getBarbarianBrutalStrikeDamageFormula(character)}
            selectedOptionKeys={selectedActionOptionKeys}
            onToggleOption={(optionKey) =>
              setSelectedActionOptionKeys((currentKeys) =>
                currentKeys.includes(optionKey)
                  ? currentKeys.filter((entry) => entry !== optionKey)
                  : [...currentKeys, optionKey]
              )
            }
          />
        );
      }
    }

    if (selectedAction.drawer.kind === "spell-list") {
      if (
        selectedAction.execute.kind === "spell" &&
        selectedAction.execute.spellSource === "divine-intervention"
      ) {
        return (
          <DivineInterventionActionBody
            character={character}
            onSpellSelect={setSelectedDivineInterventionSpell}
          />
        );
      }

      return (
        <MysticArcanumActionBody character={character} onSpellSelect={openMysticArcanumSpell} />
      );
    }

    return null;
  }

export function renderActionHeaderAside(context: Record<string, any>) {
  const {
    arcaneWardSpellSlotOptions,
    bardicInspirationFallbackSpellSlotOptions,
    beastMasterReviveSpellSlotOptions,
    canSubmitLayOnHands,
    canSubmitSelectedWarriorOfTheGodsRoll,
    canUseInspiredEclipse,
    canUseSelectedWildCompanionResource,
    canUseSelectedWildResurgenceMode,
    character,
    confirmFontOfMagicSelection,
    confirmSelectedFeatureOptions,
    executeCommonAction,
    executeFeatureActivate,
    executeMonkFlurryOfBlowsAction,
    executeMonkHandOfHealingPath,
    fixedSpellSlotTotals,
    fixedSpellSlotsRemaining,
    handleWeaponAttackRoll,
    handleWeaponDamageRoll,
    indomitableSavingThrowOptions,
    isClairvoyantCombatantSelected,
    isColossusSlayerSelected,
    isCrownOfSpellfireSelected,
    isDiceRollerSettingsOpen,
    isDreadfulStrikeSelected,
    isEmpoweredStrikesSelected,
    isFlurryOfHealingAndHarmSelected,
    isGroupRecoverySelected,
    isHandOfHarmSelected,
    isHordeBreakerSelected,
    isHuntersMarkTargetSelected,
    isImprovedShadowStepSelected,
    isInspiredEclipseSelected,
    isPolarStrikesSelected,
    isPsionicStrikeSelected,
    isQuiveringPalmSelected,
    isRageOfTheGodsSelected,
    isSacredWeaponSelected,
    isStunningStrikeSelected,
    isVowOfEnmitySelected,
    natureMagicianOptions,
    onPersistCharacter,
    openMysticArcanumSpell,
    openWeaponDetailReference,
    roundTracker,
    selectedAction,
    selectedActionEconomyShapeState,
    selectedActionOptionKeys,
    selectedArcaneRecoverySelection,
    selectedArcaneWardDisabledReason,
    selectedArcaneWardSpellSlotLevel,
    selectedBardicInspirationFallbackDisabledReason,
    selectedBardicInspirationSpellSlotLevel,
    selectedBeastMasterReviveDisabledReason,
    selectedBeastMasterReviveSpellSlotLevel,
    selectedBlessingOfTheTricksterTarget,
    selectedChannelDivinityRows,
    selectedClairvoyantCombatantToggleDisabled,
    selectedClairvoyantCombatantToggleDisabledReason,
    selectedClairvoyantCombatantUsesRemaining,
    selectedClairvoyantCombatantUsesTotal,
    selectedCommonActionPathStates,
    selectedCommonActionPrimaryDisabledReason,
    selectedCommonActionSecondaryDisabledReason,
    selectedCrownOfSpellfireBlockedReason,
    selectedCrownOfSpellfireFallbackSorceryPointCost,
    selectedCrownOfSpellfireUsesRemaining,
    selectedCrownOfSpellfireUsesTotal,
    selectedDrawerOption,
    selectedFeatureAction,
    selectedFeatureActionPrimaryDisabledReason,
    selectedFlurryOfBlowsPrimaryDisabledReason,
    selectedFlurryOfHealingAndHarmDisabledReason,
    selectedFlurryOfHealingAndHarmUsesRemaining,
    selectedFlurryOfHealingAndHarmUsesTotal,
    selectedFontOfMagicSelection,
    selectedFontOfMagicWarning,
    selectedHandOfHealingActionPathStates,
    selectedHandOfHealingFlurryOfHealingAndHarmHelperText,
    selectedHealingLightDiceCount,
    selectedHealingLightDiceRemaining,
    selectedHealingLightMaxDicePerUse,
    selectedHealingLightMaxSelectableDice,
    selectedHealingLightTarget,
    selectedImprovedShadowStepState,
    selectedIndomitableAbility,
    selectedIndomitableOption,
    selectedLayOnHandsConditions,
    selectedLayOnHandsPoolSpendAmount,
    selectedLayOnHandsPoolSpendInput,
    selectedLayOnHandsTarget,
    selectedMetamagicCost,
    selectedMonkElementalAttunementResistanceDamageType,
    selectedMonkPatientDefenseTemporaryHitPointsFormula,
    selectedMonkWholenessOfBodyHealingFormula,
    selectedNatureMagicianOption,
    selectedNatureMagicianSpellSlotLevel,
    selectedOptionEconomyShapeState,
    selectedOptionWarning,
    selectedRageOfTheGodsDescription,
    selectedRageOfTheGodsUsesRemaining,
    selectedRageOfTheGodsUsesTotal,
    selectedRageOptionKey,
    selectedRageOptions,
    selectedRagePowerOptionKey,
    selectedRagePowerOptions,
    selectedRageSelectionWarning,
    selectedSecondWindGroupRecoveryFormula,
    selectedSecondWindGroupRecoveryUsesRemaining,
    selectedSecondWindGroupRecoveryUsesTotal,
    selectedSecondWindHealingFormula,
    selectedSpellfireBurstTarget,
    selectedStarryFormConstellation,
    selectedThirdEyeOptionKey,
    selectedUnarmedStrikeFlurryOfHealingAndHarmHelperText,
    selectedWarriorOfTheGodsChargeCount,
    selectedWarriorOfTheGodsUsesRemaining,
    selectedWeaponAttackFormula,
    selectedWeaponColossusSlayerState,
    selectedWeaponColossusSlayerToggleDisabled,
    selectedWeaponDamageFormula,
    selectedWeaponDetails,
    selectedWeaponDreadAmbusherState,
    selectedWeaponDreadfulStrikeToggleDisabled,
    selectedWeaponEmpoweredStrikesState,
    selectedWeaponEmpoweredStrikesToggleDisabled,
    selectedWeaponFeyDreadfulStrikesState,
    selectedWeaponFeyDreadfulStrikesToggleDisabled,
    selectedWeaponHandOfHarmDisabledReason,
    selectedWeaponHandOfHarmState,
    selectedWeaponHandOfHarmToggleDisabled,
    selectedWeaponHandOfHarmUsage,
    selectedWeaponHordeBreakerState,
    selectedWeaponHordeBreakerToggleDisabled,
    selectedWeaponHuntersMarkTargetState,
    selectedWeaponHuntersMarkTargetToggleDisabled,
    selectedWeaponPolarStrikesState,
    selectedWeaponPolarStrikesToggleDisabled,
    selectedWeaponPrimaryAttackPathState,
    selectedWeaponPrimaryDisabledReason,
    selectedWeaponPsionicStrikeAvailable,
    selectedWeaponPsionicStrikeFormula,
    selectedWeaponQuiveringPalmDisabledReason,
    selectedWeaponQuiveringPalmState,
    selectedWeaponQuiveringPalmToggleDisabled,
    selectedWeaponRollState,
    selectedWeaponSacredWeaponState,
    selectedWeaponSacredWeaponToggleDisabled,
    selectedWeaponSecondaryAttackPathState,
    selectedWeaponSecondaryDisabledReason,
    selectedWeaponStunningStrikeDisabledReason,
    selectedWeaponStunningStrikeState,
    selectedWeaponStunningStrikeToggleDisabled,
    selectedWeaponVowOfEnmityState,
    selectedWeaponVowOfEnmityToggleDisabled,
    selectedWildCompanionResource,
    selectedWildCompanionSpellSlotLevel,
    selectedWildResurgenceMode,
    selectedWildResurgenceSpellSlotLevel,
    selectedWildShapeMonster,
    selectedWildShapeMonsterSlug,
    setIsClairvoyantCombatantSelected,
    setIsColossusSlayerSelected,
    setIsCrownOfSpellfireSelected,
    setIsDiceRollerSettingsOpen,
    setIsDreadfulStrikeSelected,
    setIsEmpoweredStrikesSelected,
    setIsFixedSpellDrawerOpen,
    setIsFlurryOfHealingAndHarmSelected,
    setIsGroupRecoverySelected,
    setIsHandOfHarmSelected,
    setIsHuntersMarkTargetSelected,
    setIsImprovedShadowStepSelected,
    setIsInspiredEclipseSelected,
    setIsPolarStrikesSelected,
    setIsPsionicStrikeSelected,
    setIsQuiveringPalmSelected,
    setIsRageOfTheGodsSelected,
    setIsSacredWeaponSelected,
    setIsStunningStrikeSelected,
    setIsVowOfEnmitySelected,
    setSelectedActionOptionKeys,
    setSelectedArcaneRecoverySelection,
    setSelectedArcaneWardSpellSlotLevel,
    setSelectedBardicInspirationSpellSlotLevel,
    setSelectedBeastMasterReviveSpellSlotLevel,
    setSelectedBlessingOfTheTricksterTarget,
    setSelectedChannelDivinityOptionKey,
    setSelectedDivineInterventionSpell,
    setSelectedFontOfMagicSelection,
    setSelectedHealingLightDiceCount,
    setSelectedHealingLightTarget,
    setSelectedIndomitableAbility,
    setSelectedLayOnHandsConditions,
    setSelectedLayOnHandsPoolSpendInput,
    setSelectedLayOnHandsTarget,
    setSelectedNatureMagicianSpellSlotLevel,
    setSelectedRageOptionKey,
    setSelectedRagePowerOptionKey,
    setSelectedSpellfireBurstTarget,
    setSelectedStarryFormConstellation,
    setSelectedThirdEyeOptionKey,
    setSelectedWarriorOfTheGodsChargeCount,
    setSelectedWildCompanionResource,
    setSelectedWildCompanionSpellSlotLevel,
    setSelectedWildResurgenceMode,
    setSelectedWildResurgenceSpellSlotLevel,
    setSelectedWildShapeMonsterSlug,
    setSelectedWildShapePreviewSlug,
    setSneakAttackActionSelection,
    showBardicInspirationFallbackSlotSelect,
    showSelectedFlurryOfHealingAndHarmToggle,
    sneakAttackActionSelection,
    submitArcaneRecovery,
    submitBlessingOfTheTrickster,
    submitBrutalStrike,
    submitHealingLight,
    submitIndomitable,
    submitLayOnHands,
    submitMonkElementalBurst,
    submitMonkPatientDefense,
    submitMonkWholenessOfBody,
    submitNatureMagician,
    submitPortent,
    submitRage,
    submitRogueSoulknifePsionicDieRollAction,
    submitSneakAttack,
    submitSorcererSpellfireBurst,
    submitSorcererWarpingImplosion,
    submitSorcererWildMagicSurge,
    submitStarryForm,
    submitThirdEye,
    submitWarriorOfTheGods,
    submitWildCompanion,
    submitWildResurgence,
    submitWildShape,
    toggleFeatureOptionSelection,
    updateMonkElementalAttunementResistanceDamageType,
    wildCompanionSpellSlotOptions,
    wildResurgenceSpellSlotOptions,
    wildResurgenceSpellSlotRecoveryUsesRemaining,
    wildShapeKnownForms,
    wildShapeUsesRemaining,
    wildShapeUsesTotal
  } = context;
    if (!selectedAction || !selectedWeaponRollState) {
      return null;
    }

    return (
      <RollStatePill
        tone={selectedWeaponRollState.tone}
        label={selectedWeaponRollState.label}
        detailText={formatResolvedRollStateDetailText(selectedWeaponRollState)}
      />
    );
  }
