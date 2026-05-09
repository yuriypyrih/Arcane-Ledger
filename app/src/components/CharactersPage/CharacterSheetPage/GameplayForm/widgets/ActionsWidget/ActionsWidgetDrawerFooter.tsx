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
import {
  boonOfFateImproveFateActionKey,
  durableSpeedyRecoveryActionKey,
  luckyFeatActionKey,
  resetLuckyPointForCharacter,
  restoreLuckyPointsForCharacter,
  spendLuckyPointForCharacter
} from "../../../../../../pages/CharactersPage/feats/runtime";
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

export function renderActionDrawerFooter(context: Record<string, any>) {
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
    isEldritchSmiteSelected,
    isGoliathAncestryStrikeSelected,
    isLifedrinkerSelected,
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
    isRecklessAttackSelected,
    isSacredWeaponSelected,
    isStunningStrikeSelected,
    isVowOfEnmitySelected,
    natureMagicianOptions,
    onPersistCharacter,
    closeActionDrawer,
    openMysticArcanumSpell,
    openWeaponDetailReference,
    roundTracker,
    selectedAction,
    selectedActionEconomyShapeState,
    selectedActionOptionKeys,
    selectedAasimarCelestialRevelationOptionKey,
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
    selectedRecoverVitalityDiceCount,
    selectedRecoverVitalityMaxSelectableDice,
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
    selectedWeaponEffectiveAction,
    selectedWeaponEldritchSmiteState,
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
    selectedWeaponGoliathAncestryState,
    selectedWeaponGoliathAncestryToggleDisabled,
    selectedWeaponHuntersMarkTargetState,
    selectedWeaponHuntersMarkTargetToggleDisabled,
    selectedWeaponRecklessAttackState,
    selectedWeaponRecklessAttackToggleDisabled,
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
    setIsEldritchSmiteSelected,
    setIsGoliathAncestryStrikeSelected,
    setIsLifedrinkerSelected,
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
    setIsRecklessAttackSelected,
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
    submitAasimarCelestialRevelation,
    submitAasimarHealingHands,
    submitDragonbornBreathWeapon,
    submitDragonbornDraconicFlight,
    submitDwarfStonecunning,
    submitGoliathCloudsJaunt,
    submitGoliathLargeForm,
    submitGoliathStonesEndurance,
    submitGoliathStormsThunder,
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
    const showPsionicStrikeToggle =
      selectedAction.action.attackKind === "weapon" && selectedWeaponPsionicStrikeFormula !== null;
    const selectedWeaponLightDamagePenaltyActive = Boolean(
      selectedWeaponEffectiveAction?.damageAbilityModifierSuppressionLabel
    );

    return (
      <div className={styles.footerActionStack}>
        {selectedWeaponHuntersMarkTargetState ? (
          <FeatureOptInToggle
            label="Attacking a target with Hunter's Mark"
            checked={isHuntersMarkTargetSelected}
            disabled={selectedWeaponHuntersMarkTargetToggleDisabled}
            muted={selectedWeaponHuntersMarkTargetToggleDisabled}
            onCheckedChange={setIsHuntersMarkTargetSelected}
            usageKey="hunters-mark-target"
          />
        ) : null}
        {selectedWeaponRecklessAttackState ? (
          <FeatureOptInToggle
            label="Reckless Attack"
            checked={
              selectedWeaponRecklessAttackState.active ||
              (!selectedWeaponRecklessAttackToggleDisabled && isRecklessAttackSelected)
            }
            disabled={selectedWeaponRecklessAttackToggleDisabled}
            muted={selectedWeaponRecklessAttackToggleDisabled}
            onCheckedChange={setIsRecklessAttackSelected}
            title={selectedWeaponRecklessAttackState.disabledReason ?? undefined}
            application={{ targetLabel: "Attack" }}
            usageKey="reckless-attack"
          />
        ) : null}
        {selectedWeaponDreadAmbusherState ? (
          <FeatureOptInToggle
            label="Dreadful Strike"
            checked={isDreadfulStrikeSelected}
            disabled={selectedWeaponDreadfulStrikeToggleDisabled}
            muted={selectedWeaponDreadfulStrikeToggleDisabled}
            onCheckedChange={setIsDreadfulStrikeSelected}
            title={selectedWeaponDreadAmbusherState.disabledReason ?? undefined}
            usage={createChargesCardUsage(
              selectedWeaponDreadAmbusherState.usesRemaining,
              selectedWeaponDreadAmbusherState.usesTotal
            )}
            application={{ targetLabel: "Damage" }}
            usageKey="dreadful-strike"
          />
        ) : null}
        {selectedWeaponFeyDreadfulStrikesState ? (
          <FeatureOptInToggle
            label="Dreadful Strikes"
            checked={isDreadfulStrikeSelected}
            disabled={selectedWeaponFeyDreadfulStrikesToggleDisabled}
            muted={selectedWeaponFeyDreadfulStrikesToggleDisabled}
            onCheckedChange={setIsDreadfulStrikeSelected}
            title={selectedWeaponFeyDreadfulStrikesState.disabledReason ?? undefined}
            application={{
              qualifierText: "Once per turn",
              targetLabel: "Damage"
            }}
            usageKey="dreadful-strikes"
          />
        ) : null}
        <RangerHunterWeaponOptions
          colossusSlayerState={selectedWeaponColossusSlayerState}
          hordeBreakerState={selectedWeaponHordeBreakerState}
          isColossusSlayerSelected={isColossusSlayerSelected}
          isHordeBreakerSelected={isHordeBreakerSelected}
          colossusSlayerDisabled={selectedWeaponColossusSlayerToggleDisabled}
          hordeBreakerDisabled={selectedWeaponHordeBreakerToggleDisabled}
          onColossusSlayerChange={setIsColossusSlayerSelected}
          onHordeBreakerChange={(checked) =>
            onPersistCharacter((currentCharacter) =>
              setRangerHunterHordeBreakerActionKeyForCharacter(
                currentCharacter,
                checked && selectedAction.kind === "weapon" ? selectedAction.action.key : null
              )
            )
          }
        />
        {selectedWeaponPolarStrikesState ? (
          <FeatureOptInToggle
            label="Polar Strikes"
            checked={isPolarStrikesSelected}
            disabled={selectedWeaponPolarStrikesToggleDisabled}
            muted={selectedWeaponPolarStrikesToggleDisabled}
            onCheckedChange={setIsPolarStrikesSelected}
            title={selectedWeaponPolarStrikesState.disabledReason ?? undefined}
            application={{
              qualifierText: "Once per turn",
              targetLabel: "Damage"
            }}
            metaItems={
              selectedWeaponPolarStrikesState.damageBonus.displayLabel
                ? [
                    {
                      kind: "text" as const,
                      label: selectedWeaponPolarStrikesState.damageBonus.displayLabel
                    }
                  ]
                : []
            }
          />
        ) : null}
        {selectedWeaponGoliathAncestryState ? (
          <FeatureOptInToggle
            label={selectedWeaponGoliathAncestryState.featureName}
            checked={isGoliathAncestryStrikeSelected}
            disabled={selectedWeaponGoliathAncestryToggleDisabled}
            muted={selectedWeaponGoliathAncestryToggleDisabled}
            onCheckedChange={setIsGoliathAncestryStrikeSelected}
            title={selectedWeaponGoliathAncestryState.disabledReason ?? undefined}
            application={{ targetLabel: "Damage" }}
            usage={createChargesCardUsage(
              selectedWeaponGoliathAncestryState.usesRemaining,
              selectedWeaponGoliathAncestryState.usesTotal
            )}
            usageKey="goliath-giant-ancestry"
          />
        ) : null}
        {selectedWeaponSacredWeaponState ? (
          <FeatureOptInToggle
            label="Sacred Weapon"
            checked={isSacredWeaponSelected}
            disabled={selectedWeaponSacredWeaponToggleDisabled}
            muted={selectedWeaponSacredWeaponToggleDisabled}
            onCheckedChange={setIsSacredWeaponSelected}
            title={selectedWeaponSacredWeaponState.disabledReason ?? undefined}
            usage={createNamedResourceCardUsage(
              createFeatureActionCardCost({
                amountText: "1",
                icon: "pyromancy"
              })
            )}
            application={{ targetLabel: "Attack" }}
            usageKey="sacred-weapon"
          />
        ) : null}
        {selectedWeaponVowOfEnmityState ? (
          <FeatureOptInToggle
            label="Vow of Enmity"
            checked={Boolean(selectedWeaponVowOfEnmityState.active) || isVowOfEnmitySelected}
            disabled={selectedWeaponVowOfEnmityToggleDisabled}
            muted={selectedWeaponVowOfEnmityToggleDisabled}
            onCheckedChange={setIsVowOfEnmitySelected}
            title={selectedWeaponVowOfEnmityState.disabledReason ?? undefined}
            usage={createNamedResourceCardUsage(
              createFeatureActionCardCost({
                amountText: "1",
                icon: "pyromancy"
              })
            )}
            application={{ targetLabel: "Attack" }}
            usageKey="vow-of-enmity"
          />
        ) : null}
        {selectedWeaponStunningStrikeState ? (
          <FeatureOptInToggle
            label="Stunning Strike"
            checked={isStunningStrikeSelected}
            disabled={selectedWeaponStunningStrikeToggleDisabled}
            muted={selectedWeaponStunningStrikeToggleDisabled}
            onCheckedChange={setIsStunningStrikeSelected}
            title={selectedWeaponStunningStrikeDisabledReason ?? undefined}
            usage={createNamedResourceCardUsage(
              createFeatureActionCardCost({
                amountText: String(selectedWeaponStunningStrikeState.focusPointCost),
                icon: "brain"
              })
            )}
            application={{
              qualifierText: "Once per turn",
              targetLabel: "Damage"
            }}
            usageKey="stunning-strike"
          />
        ) : null}
        {selectedWeaponEmpoweredStrikesState ? (
          <FeatureOptInToggle
            label="Empowered Strikes"
            checked={isEmpoweredStrikesSelected}
            disabled={selectedWeaponEmpoweredStrikesToggleDisabled}
            muted={selectedWeaponEmpoweredStrikesToggleDisabled}
            onCheckedChange={setIsEmpoweredStrikesSelected}
            title={selectedWeaponEmpoweredStrikesState.disabledReason ?? undefined}
            application={{
              qualifierText: "Once per turn",
              targetLabel: "Damage"
            }}
            usageKey="empowered-strikes"
          />
        ) : null}
        {selectedWeaponHandOfHarmState ? (
          <FeatureOptInToggle
            label="Hand of Harm"
            checked={isHandOfHarmSelected}
            disabled={selectedWeaponHandOfHarmToggleDisabled}
            muted={selectedWeaponHandOfHarmToggleDisabled}
            onCheckedChange={setIsHandOfHarmSelected}
            title={selectedWeaponHandOfHarmDisabledReason ?? undefined}
            usage={selectedWeaponHandOfHarmUsage}
            application={{
              qualifierText: "Once per turn",
              targetLabel: "Damage"
            }}
            usageKey="hand-of-harm"
          />
        ) : null}
        {selectedWeaponQuiveringPalmState ? (
          <FeatureOptInToggle
            label="Quivering Palm"
            checked={isQuiveringPalmSelected}
            disabled={selectedWeaponQuiveringPalmToggleDisabled}
            muted={selectedWeaponQuiveringPalmToggleDisabled}
            onCheckedChange={setIsQuiveringPalmSelected}
            title={selectedWeaponQuiveringPalmDisabledReason ?? undefined}
            usage={createNamedResourceCardUsage(
              createFeatureActionCardCost({
                amountText: String(monkWarriorOfTheOpenHandQuiveringPalmFocusCost),
                icon: "brain"
              })
            )}
            application={{ targetLabel: "Damage" }}
            usageKey="quivering-palm"
          />
        ) : null}
        {showPsionicStrikeToggle ? (
          <FeatureOptInToggle
            label="Psionic Strike"
            checked={isPsionicStrikeSelected}
            disabled={!selectedWeaponPsionicStrikeAvailable}
            muted={!selectedWeaponPsionicStrikeAvailable}
            onCheckedChange={setIsPsionicStrikeSelected}
            usage={createNamedResourceCardUsage(
              createFeatureActionCardCost({
                amountText: "1",
                icon: "psi"
              })
            )}
            application={{
              qualifierText: "Once per turn",
              targetLabel: "Damage"
            }}
            usageKey="psionic-strike"
          />
        ) : null}
        {selectedWeaponEldritchSmiteState ? (
          <FeatureOptInToggle
            label="Eldritch Smite"
            checked={isEldritchSmiteSelected}
            disabled={selectedWeaponEldritchSmiteState.disabled}
            muted={selectedWeaponEldritchSmiteState.disabled}
            onCheckedChange={setIsEldritchSmiteSelected}
            title={selectedWeaponEldritchSmiteState.disabledReason ?? undefined}
            usage={createNamedResourceCardUsage(
              createFeatureActionCardCost({
                amountText: "1",
                resourceLabel: "Pact Magic Spell"
              })
            )}
            application={{ targetLabel: "Damage" }}
            usageKey="eldritch-smite"
          />
        ) : null}
        {selectedWeaponLifedrinkerState ? (
          <FeatureOptInToggle
            label="Lifedrinker"
            checked={isLifedrinkerSelected}
            disabled={selectedWeaponLifedrinkerState.disabled}
            muted={selectedWeaponLifedrinkerState.disabled}
            onCheckedChange={setIsLifedrinkerSelected}
            title={selectedWeaponLifedrinkerState.disabledReason ?? undefined}
            usage={createNamedResourceCardUsage(
              createFeatureActionCardCost({
                amountText: "1",
                resourceLabel: "Hit Point Dice"
              })
            )}
            application={{ targetLabel: "Damage" }}
            usageKey="lifedrinker"
          />
        ) : null}
        {selectedUnarmedStrikeFlurryOfHealingAndHarmHelperText ? (
          <p className={styles.footerHelperText}>
            {selectedUnarmedStrikeFlurryOfHealingAndHarmHelperText}
          </p>
        ) : null}
        {selectedWeaponLightDamagePenaltyActive ? (
          <p className={clsx(styles.footerHelperText, styles.footerHelperTextInfo)}>
            Light Property is active on the next Damage roll.
          </p>
        ) : null}
        <WeaponAttackFooterButtons
          actionName={selectedAction.name}
          attackPaths={[
            ...(selectedWeaponPrimaryAttackPathState
              ? [
                  {
                    pathState: selectedWeaponPrimaryAttackPathState,
                    disabledReason: selectedWeaponPrimaryDisabledReason
                  }
                ]
              : []),
            ...(selectedWeaponSecondaryAttackPathState
              ? [
                  {
                    pathState: selectedWeaponSecondaryAttackPathState,
                    disabledReason: selectedWeaponSecondaryDisabledReason
                  }
                ]
              : [])
          ]}
          isDiceRollerSettingsOpen={isDiceRollerSettingsOpen}
          onAttack={(pathState) => handleWeaponAttackRoll(selectedAction.action, pathState)}
          onDamage={() => handleWeaponDamageRoll(selectedAction.action)}
          onDiceRollerSettingsOpenChange={setIsDiceRollerSettingsOpen}
        />
      </div>
    );
  }

  const selectedFeaturePrimaryLabel =
    ("confirmLabel" in selectedAction.drawer ? selectedAction.drawer.confirmLabel : undefined) ??
    getFeatureActionDrawerPrimaryLabel(selectedAction.action);

  if (selectedAction.kind === "feature" && selectedAction.action.key === luckyFeatActionKey) {
    const luckyPointsRemaining = selectedAction.action.usesRemaining ?? 0;
    const luckyPointsTotal = selectedAction.action.usesTotal ?? 0;
    const luckyPointsAreFull = luckyPointsRemaining >= luckyPointsTotal;

    return (
      <div className={styles.luckyFooterActions}>
        <ActionButton
          className={styles.footerActionButton}
          onClick={() => {
            onPersistCharacter(spendLuckyPointForCharacter);
            closeActionDrawer();
          }}
          disabled={luckyPointsRemaining <= 0}
        >
          Use 1
        </ActionButton>
        <ActionButton
          className={styles.footerActionButton}
          onClick={() => {
            onPersistCharacter(resetLuckyPointForCharacter);
            closeActionDrawer();
          }}
          disabled={luckyPointsAreFull}
        >
          Reset 1
        </ActionButton>
        <ActionButton
          className={styles.footerActionButton}
          onClick={() => {
            onPersistCharacter(restoreLuckyPointsForCharacter);
            closeActionDrawer();
          }}
          disabled={luckyPointsAreFull}
        >
          Reset All
        </ActionButton>
      </div>
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "confirm" &&
    selectedAction.execute.kind === "activate" &&
    selectedAction.action.key === boonOfFateImproveFateActionKey
  ) {
    return (
      <ActionDiceConfirmFooter
        actionName={selectedAction.action.name}
        confirmLabel={selectedFeaturePrimaryLabel}
        actionShape={null}
        actionShapeAvailable
        actionShapeMultiCount={0}
        disabled={selectedFeatureActionPrimaryDisabledReason !== null}
        isDiceRollerSettingsOpen={isDiceRollerSettingsOpen}
        onConfirm={() => executeFeatureActivate(selectedAction.action)}
        onDiceRollerSettingsOpenChange={setIsDiceRollerSettingsOpen}
      />
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "custom-form" &&
    selectedAction.drawer.formKind === "portent"
  ) {
    return (
      <ActionButton className={styles.footerActionButton} type="submit" form={portentActionFormId}>
        Save Portent
      </ActionButton>
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "custom-form" &&
    selectedAction.drawer.formKind === "sneak-attack"
  ) {
    const hasRendMind = hasRogueSoulknifeRendMindFeature(character);
    const rendMindUsesRemaining = getRogueSoulknifeRendMindUsesRemaining(character);
    const rendMindUsesTotal = getRogueSoulknifeRendMindUsesTotal(character);
    const rendMindCanUse =
      rendMindUsesRemaining > 0 || getRogueSoulknifePsionicDiceRemaining(character) > 0;

    return (
      <div className={styles.footerActionStack}>
        {hasRendMind ? (
          <FeatureOptInToggle
            label="Rend Mind"
            checked={sneakAttackActionSelection.useRendMind}
            disabled={!rendMindCanUse}
            muted={!rendMindCanUse}
            title={
              rendMindCanUse ? undefined : "Rend Mind needs a charge or 1 Psionic Die remaining."
            }
            onCheckedChange={(checked) =>
              setSneakAttackActionSelection({
                ...sneakAttackActionSelection,
                useRendMind: checked
              })
            }
            metaItems={[
              {
                kind: "tracker",
                current: rendMindUsesRemaining,
                total: rendMindUsesTotal
              },
              {
                kind: "cost",
                label: "Use 1 Psionic Die instead",
                icon: "psi"
              }
            ]}
            usageKey="rend-mind"
          />
        ) : null}
        <ActionDiceConfirmFooter
          actionName={selectedAction.action.name}
          confirmLabel={selectedFeaturePrimaryLabel}
          actionShape={getActionShapeForEconomyType(selectedAction.economyType)}
          actionShapeAvailable={selectedActionEconomyShapeState?.isAvailable ?? true}
          actionShapeMultiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
          disabled={selectedFeatureActionPrimaryDisabledReason !== null}
          isDiceRollerSettingsOpen={isDiceRollerSettingsOpen}
          onConfirm={() => submitSneakAttack(sneakAttackActionSelection)}
          onDiceRollerSettingsOpenChange={setIsDiceRollerSettingsOpen}
        />
      </div>
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "custom-form" &&
    selectedAction.drawer.formKind === "aasimar-healing-hands"
  ) {
    return (
      <ActionDiceConfirmFooter
        actionName={selectedAction.action.name}
        confirmLabel={selectedFeaturePrimaryLabel}
        actionShape={getActionShapeForEconomyType(selectedAction.economyType)}
        actionShapeAvailable={selectedActionEconomyShapeState?.isAvailable ?? true}
        actionShapeMultiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
        disabled={selectedFeatureActionPrimaryDisabledReason !== null}
        isDiceRollerSettingsOpen={isDiceRollerSettingsOpen}
        onConfirm={submitAasimarHealingHands}
        onDiceRollerSettingsOpenChange={setIsDiceRollerSettingsOpen}
      />
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "custom-form" &&
    selectedAction.drawer.formKind === "dragonborn-breath-weapon"
  ) {
    return (
      <ActionDiceConfirmFooter
        actionName={selectedAction.action.name}
        confirmLabel={selectedFeaturePrimaryLabel}
        actionShape={getActionShapeForEconomyType(selectedAction.economyType)}
        actionShapeAvailable={selectedActionEconomyShapeState?.isAvailable ?? true}
        actionShapeMultiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
        disabled={selectedFeatureActionPrimaryDisabledReason !== null}
        isDiceRollerSettingsOpen={isDiceRollerSettingsOpen}
        onConfirm={submitDragonbornBreathWeapon}
        onDiceRollerSettingsOpenChange={setIsDiceRollerSettingsOpen}
      />
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "custom-form" &&
    selectedAction.drawer.formKind === "aasimar-celestial-revelation"
  ) {
    const actionShape = getActionShapeForEconomyType(selectedAction.economyType);

    return (
      <ActionButton
        className={styles.footerActionButton}
        onClick={submitAasimarCelestialRevelation}
        disabled={
          selectedFeatureActionPrimaryDisabledReason !== null ||
          selectedAasimarCelestialRevelationOptionKey === null
        }
        trailingBadge={
          actionShape ? (
            <ActionShape
              shape={actionShape}
              isSelected={selectedActionEconomyShapeState?.isAvailable ?? true}
              multiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
              className={styles.footerActionShape}
            />
          ) : null
        }
      >
        {selectedFeaturePrimaryLabel}
      </ActionButton>
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.execute.kind === "custom-form" &&
    selectedAction.execute.formKind === "dragonborn-draconic-flight"
  ) {
    const actionShape = getActionShapeForEconomyType(selectedAction.economyType);

    return (
      <ActionButton
        className={styles.footerActionButton}
        onClick={submitDragonbornDraconicFlight}
        disabled={selectedFeatureActionPrimaryDisabledReason !== null}
        trailingBadge={
          actionShape ? (
            <ActionShape
              shape={actionShape}
              isSelected={selectedActionEconomyShapeState?.isAvailable ?? true}
              multiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
              className={styles.footerActionShape}
            />
          ) : null
        }
      >
        {selectedFeaturePrimaryLabel}
      </ActionButton>
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.execute.kind === "custom-form" &&
    selectedAction.execute.formKind === "dwarf-stonecunning"
  ) {
    const actionShape = getActionShapeForEconomyType(selectedAction.economyType);

    return (
      <ActionButton
        className={styles.footerActionButton}
        onClick={submitDwarfStonecunning}
        disabled={selectedFeatureActionPrimaryDisabledReason !== null}
        trailingBadge={
          actionShape ? (
            <ActionShape
              shape={actionShape}
              isSelected={selectedActionEconomyShapeState?.isAvailable ?? true}
              multiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
              className={styles.footerActionShape}
            />
          ) : null
        }
      >
        {selectedFeaturePrimaryLabel}
      </ActionButton>
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.execute.kind === "custom-form" &&
    selectedAction.execute.formKind === "goliath-clouds-jaunt"
  ) {
    const actionShape = getActionShapeForEconomyType(selectedAction.economyType);

    return (
      <ActionButton
        className={styles.footerActionButton}
        onClick={submitGoliathCloudsJaunt}
        disabled={selectedFeatureActionPrimaryDisabledReason !== null}
        trailingBadge={
          actionShape ? (
            <ActionShape
              shape={actionShape}
              isSelected={selectedActionEconomyShapeState?.isAvailable ?? true}
              multiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
              className={styles.footerActionShape}
            />
          ) : null
        }
      >
        {selectedFeaturePrimaryLabel}
      </ActionButton>
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.execute.kind === "custom-form" &&
    selectedAction.execute.formKind === "goliath-large-form"
  ) {
    const actionShape = getActionShapeForEconomyType(selectedAction.economyType);

    return (
      <ActionButton
        className={styles.footerActionButton}
        onClick={submitGoliathLargeForm}
        disabled={selectedFeatureActionPrimaryDisabledReason !== null}
        trailingBadge={
          actionShape ? (
            <ActionShape
              shape={actionShape}
              isSelected={selectedActionEconomyShapeState?.isAvailable ?? true}
              multiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
              className={styles.footerActionShape}
            />
          ) : null
        }
      >
        {selectedFeaturePrimaryLabel}
      </ActionButton>
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.execute.kind === "custom-form" &&
    selectedAction.execute.formKind === "goliath-stones-endurance"
  ) {
    return (
      <ActionDiceConfirmFooter
        actionName={selectedAction.action.name}
        confirmLabel={selectedFeaturePrimaryLabel}
        actionShape={getActionShapeForEconomyType(selectedAction.economyType)}
        actionShapeAvailable={selectedActionEconomyShapeState?.isAvailable ?? true}
        actionShapeMultiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
        disabled={selectedFeatureActionPrimaryDisabledReason !== null}
        isDiceRollerSettingsOpen={isDiceRollerSettingsOpen}
        onConfirm={submitGoliathStonesEndurance}
        onDiceRollerSettingsOpenChange={setIsDiceRollerSettingsOpen}
      />
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.execute.kind === "custom-form" &&
    selectedAction.execute.formKind === "goliath-storms-thunder"
  ) {
    return (
      <ActionDiceConfirmFooter
        actionName={selectedAction.action.name}
        confirmLabel={selectedFeaturePrimaryLabel}
        actionShape={getActionShapeForEconomyType(selectedAction.economyType)}
        actionShapeAvailable={selectedActionEconomyShapeState?.isAvailable ?? true}
        actionShapeMultiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
        disabled={selectedFeatureActionPrimaryDisabledReason !== null}
        isDiceRollerSettingsOpen={isDiceRollerSettingsOpen}
        onConfirm={submitGoliathStormsThunder}
        onDiceRollerSettingsOpenChange={setIsDiceRollerSettingsOpen}
      />
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "custom-form" &&
    selectedAction.drawer.formKind === "healing-light"
  ) {
    const selectedDiceCanBeUsed =
      selectedHealingLightDiceCount > 0 &&
      selectedHealingLightDiceCount <= selectedHealingLightMaxSelectableDice;

    return (
      <ActionDiceConfirmFooter
        actionName={selectedAction.action.name}
        confirmLabel="Use Healing Light"
        actionShape={getActionShapeForEconomyType(selectedAction.economyType)}
        actionShapeAvailable={selectedActionEconomyShapeState?.isAvailable ?? true}
        actionShapeMultiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
        disabled={selectedFeatureActionPrimaryDisabledReason !== null || !selectedDiceCanBeUsed}
        isDiceRollerSettingsOpen={isDiceRollerSettingsOpen}
        onConfirm={() =>
          submitHealingLight(selectedHealingLightDiceCount, selectedHealingLightTarget)
        }
        onDiceRollerSettingsOpenChange={setIsDiceRollerSettingsOpen}
      />
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "custom-form" &&
    selectedAction.drawer.formKind === "recover-vitality"
  ) {
    const selectedDiceCanBeUsed =
      selectedRecoverVitalityDiceCount > 0 &&
      selectedRecoverVitalityDiceCount <= selectedRecoverVitalityMaxSelectableDice;

    return (
      <ActionDiceConfirmFooter
        actionName={selectedAction.action.name}
        confirmLabel="Use Recover Vitality"
        actionShape={getActionShapeForEconomyType(selectedAction.economyType)}
        actionShapeAvailable={selectedActionEconomyShapeState?.isAvailable ?? true}
        actionShapeMultiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
        disabled={selectedFeatureActionPrimaryDisabledReason !== null || !selectedDiceCanBeUsed}
        isDiceRollerSettingsOpen={isDiceRollerSettingsOpen}
        onConfirm={() => executeFeatureActivate(selectedAction.action)}
        onDiceRollerSettingsOpenChange={setIsDiceRollerSettingsOpen}
      />
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "confirm" &&
    selectedAction.execute.kind === "activate" &&
    selectedAction.action.key === sorcererWildMagicSurgeActionKey
  ) {
    return (
      <ActionDiceConfirmFooter
        actionName={selectedAction.action.name}
        confirmLabel={selectedFeaturePrimaryLabel}
        actionShape={null}
        actionShapeAvailable
        actionShapeMultiCount={0}
        disabled={selectedFeatureActionPrimaryDisabledReason !== null}
        isDiceRollerSettingsOpen={isDiceRollerSettingsOpen}
        onConfirm={submitSorcererWildMagicSurge}
        onDiceRollerSettingsOpenChange={setIsDiceRollerSettingsOpen}
      />
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "confirm" &&
    selectedAction.execute.kind === "activate" &&
    selectedAction.action.key === sorcererWarpingImplosionActionKey
  ) {
    return (
      <ActionDiceConfirmFooter
        actionName={selectedAction.action.name}
        confirmLabel={selectedFeaturePrimaryLabel}
        actionShape={getActionShapeForEconomyType(selectedAction.economyType)}
        actionShapeAvailable={selectedActionEconomyShapeState?.isAvailable ?? true}
        actionShapeMultiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
        disabled={selectedFeatureActionPrimaryDisabledReason !== null}
        isDiceRollerSettingsOpen={isDiceRollerSettingsOpen}
        onConfirm={submitSorcererWarpingImplosion}
        onDiceRollerSettingsOpenChange={setIsDiceRollerSettingsOpen}
      />
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "confirm" &&
    selectedAction.execute.kind === "activate" &&
    (selectedAction.action.key === rogueSoulknifePsychicWhispersActionKey ||
      selectedAction.action.key === rogueSoulknifePsychicTeleportationActionKey)
  ) {
    return (
      <ActionDiceConfirmFooter
        actionName={selectedAction.action.name}
        confirmLabel={selectedFeaturePrimaryLabel}
        actionShape={getActionShapeForEconomyType(selectedAction.economyType)}
        actionShapeAvailable={selectedActionEconomyShapeState?.isAvailable ?? true}
        actionShapeMultiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
        disabled={selectedFeatureActionPrimaryDisabledReason !== null}
        isDiceRollerSettingsOpen={isDiceRollerSettingsOpen}
        onConfirm={() => submitRogueSoulknifePsionicDieRollAction(selectedAction.action)}
        onDiceRollerSettingsOpenChange={setIsDiceRollerSettingsOpen}
      />
    );
  }

  if (selectedAction.kind === "feature" && isCommonActionKey(selectedAction.action.key)) {
    return (
      <CommonActionFooter
        confirmLabel={selectedFeaturePrimaryLabel}
        actionPaths={selectedCommonActionPathStates.map((path) => ({
          ...path,
          disabledReason:
            path.id === "primary"
              ? selectedCommonActionPrimaryDisabledReason
              : selectedCommonActionSecondaryDisabledReason
        }))}
        onConfirmPath={(economyType) => executeCommonAction(selectedAction.action, economyType)}
      />
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "confirm" &&
    selectedAction.execute.kind === "activate" &&
    selectedAction.action.key === monkFlurryOfBlowsActionKey
  ) {
    return (
      <MonkFlurryOfBlowsActionFooter
        confirmLabel={selectedFeaturePrimaryLabel}
        economyType={selectedAction.economyType}
        shapeState={selectedActionEconomyShapeState}
        confirmDisabledReason={selectedFlurryOfBlowsPrimaryDisabledReason}
        onConfirm={executeMonkFlurryOfBlowsAction}
        flurryOfHealingAndHarmOption={
          showSelectedFlurryOfHealingAndHarmToggle
            ? {
                checked: isFlurryOfHealingAndHarmSelected,
                disabled: selectedFlurryOfHealingAndHarmDisabledReason !== null,
                current: selectedFlurryOfHealingAndHarmUsesRemaining,
                total: selectedFlurryOfHealingAndHarmUsesTotal,
                title: selectedFlurryOfHealingAndHarmDisabledReason ?? undefined,
                onCheckedChange: setIsFlurryOfHealingAndHarmSelected
              }
            : undefined
        }
      />
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "confirm" &&
    selectedAction.execute.kind === "activate" &&
    selectedAction.action.key === monkHandOfHealingActionKey
  ) {
    return (
      <MonkHandOfHealingActionFooter
        actionName={selectedAction.action.name}
        confirmLabel={selectedFeaturePrimaryLabel}
        actionPaths={selectedHandOfHealingActionPathStates}
        helperText={selectedHandOfHealingFlurryOfHealingAndHarmHelperText ?? undefined}
        isDiceRollerSettingsOpen={isDiceRollerSettingsOpen}
        onConfirmPath={executeMonkHandOfHealingPath}
        onDiceRollerSettingsOpenChange={setIsDiceRollerSettingsOpen}
      />
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "confirm" &&
    selectedAction.execute.kind === "activate" &&
    selectedAction.action.key === tirelessActionKey
  ) {
    return (
      <ElementalBurstActionFooter
        actionName={selectedAction.action.name}
        confirmLabel={selectedFeaturePrimaryLabel}
        actionShape={getActionShapeForEconomyType(selectedAction.economyType)}
        actionShapeAvailable={selectedActionEconomyShapeState?.isAvailable ?? true}
        actionShapeMultiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
        disabled={selectedFeatureActionPrimaryDisabledReason !== null}
        isDiceRollerSettingsOpen={isDiceRollerSettingsOpen}
        onConfirm={() => executeFeatureActivate(selectedAction.action)}
        onDiceRollerSettingsOpenChange={setIsDiceRollerSettingsOpen}
      />
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "confirm" &&
    selectedAction.execute.kind === "activate" &&
    selectedAction.action.key === mantleOfInspirationActionKey
  ) {
    const actionShape = getActionShapeForEconomyType(selectedAction.economyType);

    return (
      <div className={styles.weaponFooterActions}>
        <ActionButton
          className={styles.weaponFooterButton}
          onClick={() => executeFeatureActivate(selectedAction.action)}
          disabled={selectedFeatureActionPrimaryDisabledReason !== null}
          icon={<img src={d20Icon} alt="" className={styles.weaponFooterIcon} />}
          trailingBadge={
            actionShape ? (
              <ActionShape
                shape={actionShape}
                isSelected={selectedActionEconomyShapeState?.isAvailable ?? true}
                multiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
                className={styles.footerActionShape}
              />
            ) : null
          }
        >
          {selectedFeaturePrimaryLabel}
        </ActionButton>
        <DiceRollerSettingsButton
          actionName={selectedAction.action.name}
          className={styles.weaponFooterIconButton}
          isOpen={isDiceRollerSettingsOpen}
          aria-label="Open dice roller settings"
          onOpenChange={setIsDiceRollerSettingsOpen}
        />
      </div>
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "confirm" &&
    selectedAction.execute.kind === "activate" &&
    selectedAction.action.key === monkWholenessOfBodyActionKey &&
    selectedMonkWholenessOfBodyHealingFormula
  ) {
    return (
      <ElementalBurstActionFooter
        actionName={selectedAction.action.name}
        confirmLabel={selectedFeaturePrimaryLabel}
        actionShape={getActionShapeForEconomyType(selectedAction.economyType)}
        actionShapeAvailable={selectedActionEconomyShapeState?.isAvailable ?? true}
        actionShapeMultiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
        disabled={selectedFeatureActionPrimaryDisabledReason !== null}
        isDiceRollerSettingsOpen={isDiceRollerSettingsOpen}
        onConfirm={() => submitMonkWholenessOfBody(selectedAction.action)}
        onDiceRollerSettingsOpenChange={setIsDiceRollerSettingsOpen}
      />
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "confirm" &&
    selectedAction.execute.kind === "activate" &&
    selectedAction.action.key === monkPatientDefenseActionKey &&
    selectedMonkPatientDefenseTemporaryHitPointsFormula
  ) {
    return (
      <ElementalBurstActionFooter
        actionName={selectedAction.action.name}
        confirmLabel={selectedFeaturePrimaryLabel}
        actionShape={getActionShapeForEconomyType(selectedAction.economyType)}
        actionShapeAvailable={selectedActionEconomyShapeState?.isAvailable ?? true}
        actionShapeMultiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
        disabled={selectedFeatureActionPrimaryDisabledReason !== null}
        isDiceRollerSettingsOpen={isDiceRollerSettingsOpen}
        onConfirm={submitMonkPatientDefense}
        onDiceRollerSettingsOpenChange={setIsDiceRollerSettingsOpen}
      />
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "confirm" &&
    selectedAction.execute.kind === "activate" &&
    selectedAction.action.key === durableSpeedyRecoveryActionKey
  ) {
    return (
      <FighterSecondWindActionFooter
        actionName={selectedAction.action.name}
        confirmLabel={selectedFeaturePrimaryLabel}
        actionShape={getActionShapeForEconomyType(selectedAction.economyType)}
        actionShapeAvailable={selectedActionEconomyShapeState?.isAvailable ?? true}
        actionShapeMultiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
        disabled={selectedFeatureActionPrimaryDisabledReason !== null}
        groupRecoveryUnlocked={false}
        groupRecoveryUsesRemaining={0}
        groupRecoveryUsesTotal={0}
        isGroupRecoverySelected={false}
        isDiceRollerSettingsOpen={isDiceRollerSettingsOpen}
        onConfirm={() => executeFeatureActivate(selectedAction.action)}
        onDiceRollerSettingsOpenChange={setIsDiceRollerSettingsOpen}
        onGroupRecoverySelectedChange={() => undefined}
      />
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "confirm" &&
    selectedAction.execute.kind === "activate" &&
    selectedAction.action.key === fighterSecondWindActionKey
  ) {
    return (
      <FighterSecondWindActionFooter
        actionName={selectedAction.action.name}
        confirmLabel={selectedFeaturePrimaryLabel}
        actionShape={getActionShapeForEconomyType(selectedAction.economyType)}
        actionShapeAvailable={selectedActionEconomyShapeState?.isAvailable ?? true}
        actionShapeMultiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
        disabled={
          selectedFeatureActionPrimaryDisabledReason !== null ||
          (isGroupRecoverySelected && selectedSecondWindGroupRecoveryUsesRemaining <= 0)
        }
        groupRecoveryUnlocked={selectedSecondWindGroupRecoveryUsesTotal > 0}
        groupRecoveryUsesRemaining={selectedSecondWindGroupRecoveryUsesRemaining}
        groupRecoveryUsesTotal={selectedSecondWindGroupRecoveryUsesTotal}
        isGroupRecoverySelected={isGroupRecoverySelected}
        isDiceRollerSettingsOpen={isDiceRollerSettingsOpen}
        onConfirm={() => executeFeatureActivate(selectedAction.action)}
        onDiceRollerSettingsOpenChange={setIsDiceRollerSettingsOpen}
        onGroupRecoverySelectedChange={setIsGroupRecoverySelected}
      />
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "confirm" &&
    selectedAction.execute.kind === "activate" &&
    selectedAction.action.key === monkElementalBurstActionKey
  ) {
    return (
      <ElementalBurstActionFooter
        actionName={selectedAction.action.name}
        confirmLabel={selectedFeaturePrimaryLabel}
        actionShape={getActionShapeForEconomyType(selectedAction.economyType)}
        actionShapeAvailable={selectedActionEconomyShapeState?.isAvailable ?? true}
        actionShapeMultiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
        disabled={selectedFeatureActionPrimaryDisabledReason !== null}
        isDiceRollerSettingsOpen={isDiceRollerSettingsOpen}
        onConfirm={submitMonkElementalBurst}
        onDiceRollerSettingsOpenChange={setIsDiceRollerSettingsOpen}
      />
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "confirm" &&
    selectedAction.execute.kind === "activate" &&
    selectedAction.action.key === innateSorceryActionKey
  ) {
    return (
      <SorcererInnateSorceryActionFooter
        confirmLabel={selectedFeaturePrimaryLabel}
        actionShape={getActionShapeForEconomyType(selectedAction.economyType)}
        actionShapeAvailable={selectedActionEconomyShapeState?.isAvailable ?? true}
        actionShapeMultiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
        disabled={selectedFeatureActionPrimaryDisabledReason !== null}
        crownOfSpellfireUnlocked={selectedCrownOfSpellfireUsesTotal > 0}
        crownOfSpellfireUsesRemaining={selectedCrownOfSpellfireUsesRemaining}
        crownOfSpellfireUsesTotal={selectedCrownOfSpellfireUsesTotal}
        crownOfSpellfireFallbackSorceryPointCost={selectedCrownOfSpellfireFallbackSorceryPointCost}
        crownOfSpellfireDisabledReason={selectedCrownOfSpellfireBlockedReason ?? undefined}
        isCrownOfSpellfireSelected={isCrownOfSpellfireSelected}
        onConfirm={() => executeFeatureActivate(selectedAction.action)}
        onCrownOfSpellfireSelectedChange={setIsCrownOfSpellfireSelected}
      />
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "confirm" &&
    selectedAction.execute.kind === "activate" &&
    selectedAction.action.key === awakenedMindActionKey &&
    selectedClairvoyantCombatantUsesTotal > 0
  ) {
    return (
      <WarlockAwakenedMindActionFooter
        confirmLabel={selectedFeaturePrimaryLabel}
        actionShape={getActionShapeForEconomyType(selectedAction.economyType)}
        actionShapeAvailable={selectedActionEconomyShapeState?.isAvailable ?? true}
        actionShapeMultiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
        disabled={selectedFeatureActionPrimaryDisabledReason !== null}
        clairvoyantCombatantUsesRemaining={selectedClairvoyantCombatantUsesRemaining}
        clairvoyantCombatantUsesTotal={selectedClairvoyantCombatantUsesTotal}
        toggleDisabled={selectedClairvoyantCombatantToggleDisabled}
        toggleDisabledReason={selectedClairvoyantCombatantToggleDisabledReason}
        isClairvoyantCombatantSelected={isClairvoyantCombatantSelected}
        onConfirm={() => executeFeatureActivate(selectedAction.action)}
        onClairvoyantCombatantSelectedChange={setIsClairvoyantCombatantSelected}
      />
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "confirm" &&
    selectedAction.execute.kind === "activate" &&
    selectedAction.action.key === bardicInspirationActionKey
  ) {
    return (
      <BardicInspirationActionFooter
        confirmLabel={selectedFeaturePrimaryLabel}
        actionShape={getActionShapeForEconomyType(selectedAction.economyType)}
        actionShapeAvailable={selectedActionEconomyShapeState?.isAvailable ?? true}
        actionShapeMultiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
        disabled={selectedBardicInspirationFallbackDisabledReason !== null}
        disabledReason={selectedBardicInspirationFallbackDisabledReason}
        showInspiredEclipseToggle={canUseInspiredEclipse}
        isInspiredEclipseSelected={isInspiredEclipseSelected}
        onInspiredEclipseSelectedChange={setIsInspiredEclipseSelected}
        showSpellSlotSelect={showBardicInspirationFallbackSlotSelect}
        spellSlotOptions={bardicInspirationFallbackSpellSlotOptions}
        selectedSpellSlotLevel={selectedBardicInspirationSpellSlotLevel}
        onSelectedSpellSlotLevelChange={setSelectedBardicInspirationSpellSlotLevel}
        helperText={
          showBardicInspirationFallbackSlotSelect &&
          selectedBardicInspirationFallbackDisabledReason !==
            selectedFeatureActionPrimaryDisabledReason
            ? selectedBardicInspirationFallbackDisabledReason
            : null
        }
        onConfirm={() => executeFeatureActivate(selectedAction.action)}
      />
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "confirm" &&
    selectedAction.execute.kind === "activate" &&
    selectedAction.action.key === wizardAbjurerArcaneWardActionKey
  ) {
    return (
      <ArcaneWardActionFooter
        confirmLabel={selectedFeaturePrimaryLabel}
        actionShape={getActionShapeForEconomyType(selectedAction.economyType)}
        actionShapeAvailable={selectedActionEconomyShapeState?.isAvailable ?? true}
        actionShapeMultiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
        disabled={selectedArcaneWardDisabledReason !== null}
        disabledReason={
          selectedArcaneWardDisabledReason !== selectedFeatureActionPrimaryDisabledReason
            ? selectedArcaneWardDisabledReason
            : null
        }
        spellSlotOptions={arcaneWardSpellSlotOptions}
        selectedSpellSlotLevel={selectedArcaneWardSpellSlotLevel}
        onSelectedSpellSlotLevelChange={setSelectedArcaneWardSpellSlotLevel}
        onConfirm={() => executeFeatureActivate(selectedAction.action)}
      />
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "confirm" &&
    selectedAction.execute.kind === "activate" &&
    selectedAction.action.key === rangerBeastMasterReviveActionKey
  ) {
    return (
      <BeastMasterReviveActionFooter
        confirmLabel={selectedFeaturePrimaryLabel}
        actionShape={getActionShapeForEconomyType(selectedAction.economyType)}
        actionShapeAvailable={selectedActionEconomyShapeState?.isAvailable ?? true}
        actionShapeMultiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
        disabled={selectedBeastMasterReviveDisabledReason !== null}
        disabledReason={
          selectedBeastMasterReviveDisabledReason !== selectedFeatureActionPrimaryDisabledReason
            ? selectedBeastMasterReviveDisabledReason
            : null
        }
        spellSlotOptions={beastMasterReviveSpellSlotOptions}
        selectedSpellSlotLevel={selectedBeastMasterReviveSpellSlotLevel}
        onSelectedSpellSlotLevelChange={setSelectedBeastMasterReviveSpellSlotLevel}
        onConfirm={() => executeFeatureActivate(selectedAction.action)}
      />
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.action.key === monkShadowStepActionKey &&
    selectedAction.drawer.kind === "confirm" &&
    selectedAction.execute.kind === "activate"
  ) {
    const actionShape = getActionShapeForEconomyType(selectedAction.economyType);

    return (
      <div className={styles.footerActionStack}>
        {selectedImprovedShadowStepState ? (
          <FeatureOptInToggle
            label="Improved Shadow Step"
            checked={isImprovedShadowStepSelected}
            disabled={selectedImprovedShadowStepState.disabled}
            muted={selectedImprovedShadowStepState.disabled}
            onCheckedChange={setIsImprovedShadowStepSelected}
            title={selectedImprovedShadowStepState.disabledReason ?? undefined}
            usage={createNamedResourceCardUsage(
              createFeatureActionCardCost({
                amountText: "1",
                icon: "brain"
              })
            )}
            usageKey="improved-shadow-step"
          />
        ) : null}
        <ActionButton
          className={styles.footerActionButton}
          onClick={() => executeFeatureActivate(selectedAction.action)}
          disabled={selectedFeatureActionPrimaryDisabledReason !== null}
          trailingBadge={
            actionShape ? (
              <ActionShape
                shape={actionShape}
                isSelected={selectedActionEconomyShapeState?.isAvailable ?? true}
                multiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
                className={styles.footerActionShape}
              />
            ) : null
          }
        >
          {selectedFeaturePrimaryLabel}
        </ActionButton>
      </div>
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "options" &&
    selectedChannelDivinityRows.length > 0
  ) {
    return null;
  }

  if (selectedAction.drawer.kind === "options") {
    const actionShape = getActionShapeForEconomyType(selectedAction.economyType);
    const selectedOption = selectedDrawerOption;
    const isMultiConfirm = selectedAction.drawer.selection === "multi-confirm";
    const selectedOptionShape = isMultiConfirm
      ? actionShape
      : selectedOption
        ? getActionShapeForEconomyType(selectedOption.economyType)
        : null;
    const selectedOptionShapeState = isMultiConfirm
      ? selectedActionEconomyShapeState
      : selectedOptionEconomyShapeState;

    return (
      <ActionButton
        className={styles.footerActionButton}
        onClick={confirmSelectedFeatureOptions}
        disabled={
          (isMultiConfirm
            ? selectedActionOptionKeys.length <= 0 ||
              selectedFeatureActionPrimaryDisabledReason !== null
            : !selectedOption ||
              selectedOption.disabled === true ||
              selectedOptionWarning !== null ||
              selectedFeatureActionPrimaryDisabledReason !== null) ||
          (selectedFeatureAction?.key === metamagicActionKey &&
            selectedMetamagicCost > getSorceryPointsRemainingForCharacter(character))
        }
        trailingBadge={
          selectedOptionShape && selectedOptionShapeState ? (
            <ActionShape
              shape={selectedOptionShape}
              isSelected={selectedOptionShapeState.isAvailable}
              multiCount={selectedOptionShapeState.multiCount}
              className={styles.footerActionShape}
            />
          ) : null
        }
      >
        {selectedFeaturePrimaryLabel}
      </ActionButton>
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "custom-form" &&
    selectedAction.drawer.formKind === "arcane-recovery"
  ) {
    const selectedArcaneRecoveryLevelTotal = getArcaneRecoverySelectionLevelTotal(
      selectedArcaneRecoverySelection
    );

    return (
      <ActionButton
        className={styles.footerActionButton}
        onClick={() => submitArcaneRecovery(selectedArcaneRecoverySelection)}
        disabled={
          selectedFeatureActionPrimaryDisabledReason !== null ||
          selectedArcaneRecoveryLevelTotal <= 0
        }
      >
        {selectedFeaturePrimaryLabel}
      </ActionButton>
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "custom-form" &&
    selectedAction.drawer.formKind === "spellfire-burst"
  ) {
    return (
      <SpellfireBurstActionFooter
        actionName={selectedAction.name}
        disabled={selectedFeatureActionPrimaryDisabledReason !== null}
        isDiceRollerSettingsOpen={isDiceRollerSettingsOpen}
        onUseEffect={submitSorcererSpellfireBurst}
        onDiceRollerSettingsOpenChange={setIsDiceRollerSettingsOpen}
      />
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "custom-form" &&
    selectedAction.drawer.formKind === "indomitable"
  ) {
    return (
      <IndomitableActionFooter
        actionName={selectedAction.name}
        confirmLabel={selectedFeaturePrimaryLabel}
        actionShape={getActionShapeForEconomyType(selectedAction.economyType)}
        actionShapeAvailable={selectedActionEconomyShapeState?.isAvailable ?? true}
        actionShapeMultiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
        disabled={
          selectedFeatureActionPrimaryDisabledReason !== null || selectedIndomitableOption === null
        }
        isDiceRollerSettingsOpen={isDiceRollerSettingsOpen}
        onConfirm={() => selectedIndomitableOption && submitIndomitable(selectedIndomitableOption)}
        onDiceRollerSettingsOpenChange={setIsDiceRollerSettingsOpen}
      />
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "custom-form" &&
    selectedAction.drawer.formKind === "blessing-of-the-trickster"
  ) {
    const actionShape = getActionShapeForEconomyType(selectedAction.economyType);

    return (
      <ActionButton
        className={styles.footerActionButton}
        onClick={submitBlessingOfTheTrickster}
        disabled={selectedFeatureActionPrimaryDisabledReason !== null}
        trailingBadge={
          actionShape ? (
            <ActionShape
              shape={actionShape}
              isSelected={selectedActionEconomyShapeState?.isAvailable ?? true}
              multiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
              className={styles.footerActionShape}
            />
          ) : null
        }
      >
        {selectedFeaturePrimaryLabel}
      </ActionButton>
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "custom-form" &&
    selectedAction.drawer.formKind === "lay-on-hands"
  ) {
    return (
      <LayOnHandsActionFooter
        confirmLabel={selectedFeaturePrimaryLabel}
        actionShape={getActionShapeForEconomyType(selectedAction.economyType)}
        actionShapeAvailable={selectedActionEconomyShapeState?.isAvailable ?? true}
        actionShapeMultiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
        disabled={selectedFeatureActionPrimaryDisabledReason !== null || !canSubmitLayOnHands}
        onConfirm={() =>
          submitLayOnHands({
            target: selectedLayOnHandsTarget,
            poolSpendAmount: selectedLayOnHandsPoolSpendAmount,
            conditions: selectedLayOnHandsConditions
          })
        }
      />
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "custom-form" &&
    selectedAction.drawer.formKind === "third-eye"
  ) {
    return (
      <ActionButton
        className={styles.footerActionButton}
        onClick={submitThirdEye}
        disabled={
          selectedThirdEyeOptionKey === null || selectedFeatureActionPrimaryDisabledReason !== null
        }
        trailingBadge={
          <ActionShape
            shape="bonusAction"
            isSelected={selectedActionEconomyShapeState?.isAvailable ?? true}
            multiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
            className={styles.footerActionShape}
          />
        }
      >
        {selectedFeaturePrimaryLabel}
      </ActionButton>
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "custom-form" &&
    selectedAction.drawer.formKind === "wild-shape"
  ) {
    return (
      <ActionButton
        className={styles.footerActionButton}
        onClick={submitWildShape}
        disabled={!selectedWildShapeMonster || selectedFeatureActionPrimaryDisabledReason !== null}
        trailingBadge={
          <ActionShape
            shape="bonusAction"
            isSelected={selectedActionEconomyShapeState?.isAvailable ?? true}
            className={styles.footerActionShape}
          />
        }
      >
        {selectedFeaturePrimaryLabel}
      </ActionButton>
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "custom-form" &&
    selectedAction.drawer.formKind === "starry-form"
  ) {
    return (
      <ActionButton
        className={styles.footerActionButton}
        onClick={submitStarryForm}
        disabled={
          selectedFeatureActionPrimaryDisabledReason !== null ||
          selectedStarryFormConstellation === null
        }
        trailingBadge={
          <ActionShape
            shape="bonusAction"
            isSelected={selectedActionEconomyShapeState?.isAvailable ?? true}
            className={styles.footerActionShape}
          />
        }
      >
        {selectedFeaturePrimaryLabel}
      </ActionButton>
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "custom-form" &&
    selectedAction.drawer.formKind === "wild-companion"
  ) {
    return (
      <ActionButton
        className={styles.footerActionButton}
        onClick={submitWildCompanion}
        disabled={
          selectedFeatureActionPrimaryDisabledReason !== null ||
          !canUseSelectedWildCompanionResource
        }
        trailingBadge={
          <ActionShape
            shape="action"
            isSelected={selectedActionEconomyShapeState?.isAvailable ?? true}
            multiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
            className={styles.footerActionShape}
          />
        }
      >
        {selectedFeaturePrimaryLabel}
      </ActionButton>
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "custom-form" &&
    selectedAction.drawer.formKind === "nature-magician"
  ) {
    return (
      <ActionButton
        className={styles.footerActionButton}
        onClick={submitNatureMagician}
        disabled={
          selectedFeatureActionPrimaryDisabledReason !== null || !selectedNatureMagicianOption
        }
      >
        {selectedFeaturePrimaryLabel}
      </ActionButton>
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "custom-form" &&
    selectedAction.drawer.formKind === "wild-resurgence"
  ) {
    return (
      <ActionButton
        className={styles.footerActionButton}
        onClick={submitWildResurgence}
        disabled={
          !canUseSelectedWildResurgenceMode || selectedFeatureActionPrimaryDisabledReason !== null
        }
      >
        {selectedFeaturePrimaryLabel}
      </ActionButton>
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "custom-form" &&
    selectedAction.drawer.formKind === "font-of-magic"
  ) {
    return (
      <ActionButton
        className={styles.footerActionButton}
        onClick={confirmFontOfMagicSelection}
        disabled={
          selectedFontOfMagicSelection === null ||
          selectedFeatureActionPrimaryDisabledReason !== null ||
          selectedFontOfMagicWarning !== null
        }
        trailingBadge={
          selectedFontOfMagicSelection?.kind === "points-to-slot" ? (
            <ActionShape
              shape="bonusAction"
              isSelected={selectedFontOfMagicWarning === null}
              className={styles.footerActionShape}
            />
          ) : null
        }
      >
        {selectedFeaturePrimaryLabel}
      </ActionButton>
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "custom-form" &&
    selectedAction.drawer.formKind === "warrior-of-the-gods"
  ) {
    return (
      <WarriorOfTheGodsActionFooter
        actionName={selectedAction.name}
        confirmLabel={selectedFeaturePrimaryLabel}
        actionShape={getActionShapeForEconomyType(selectedAction.economyType)}
        actionShapeAvailable={selectedActionEconomyShapeState?.isAvailable ?? true}
        actionShapeMultiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
        disabled={
          selectedFeatureActionPrimaryDisabledReason !== null ||
          !canSubmitSelectedWarriorOfTheGodsRoll
        }
        isDiceRollerSettingsOpen={isDiceRollerSettingsOpen}
        onConfirm={() => submitWarriorOfTheGods(selectedWarriorOfTheGodsChargeCount)}
        onDiceRollerSettingsOpenChange={setIsDiceRollerSettingsOpen}
      />
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "custom-form" &&
    selectedAction.drawer.formKind === "brutal-strike"
  ) {
    const actionShape = getActionShapeForEconomyType(selectedAction.economyType);

    return (
      <ActionButton
        className={styles.footerActionButton}
        onClick={submitBrutalStrike}
        disabled={selectedFeatureActionPrimaryDisabledReason !== null}
        trailingBadge={
          actionShape ? (
            <ActionShape
              shape={actionShape}
              isSelected={selectedActionEconomyShapeState?.isAvailable ?? true}
              multiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
              className={styles.footerActionShape}
            />
          ) : null
        }
      >
        {selectedFeaturePrimaryLabel}
      </ActionButton>
    );
  }

  if (selectedAction.kind === "feature" && selectedAction.action.key === barbarianRageActionKey) {
    return (
      <ActionButton
        className={styles.footerActionButton}
        onClick={submitRage}
        disabled={
          selectedRageSelectionWarning !== null ||
          selectedFeatureActionPrimaryDisabledReason !== null
        }
        trailingBadge={
          <ActionShape
            shape="bonusAction"
            isSelected={selectedActionEconomyShapeState?.isAvailable ?? true}
            className={styles.footerActionShape}
          />
        }
      >
        {selectedFeaturePrimaryLabel}
      </ActionButton>
    );
  }

  if (selectedAction.drawer.kind !== "confirm") {
    return null;
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.action.key === darkOnesOwnLuckActionKey &&
    selectedAction.execute.kind === "activate"
  ) {
    return (
      <ActionDiceConfirmFooter
        actionName={selectedAction.name}
        confirmLabel={selectedFeaturePrimaryLabel}
        actionShape={getActionShapeForEconomyType(selectedAction.economyType)}
        actionShapeAvailable={selectedActionEconomyShapeState?.isAvailable ?? true}
        actionShapeMultiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
        disabled={selectedFeatureActionPrimaryDisabledReason !== null}
        isDiceRollerSettingsOpen={isDiceRollerSettingsOpen}
        onConfirm={() => executeFeatureActivate(selectedAction.action)}
        onDiceRollerSettingsOpenChange={setIsDiceRollerSettingsOpen}
      />
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.action.key === hurlThroughHellActionKey &&
    selectedAction.execute.kind === "activate"
  ) {
    return (
      <ActionDiceConfirmFooter
        actionName={selectedAction.name}
        confirmLabel={selectedFeaturePrimaryLabel}
        actionShape={getActionShapeForEconomyType(selectedAction.economyType)}
        actionShapeAvailable={selectedActionEconomyShapeState?.isAvailable ?? true}
        actionShapeMultiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
        disabled={selectedFeatureActionPrimaryDisabledReason !== null}
        isDiceRollerSettingsOpen={isDiceRollerSettingsOpen}
        onConfirm={() => executeFeatureActivate(selectedAction.action)}
        onDiceRollerSettingsOpenChange={setIsDiceRollerSettingsOpen}
      />
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.action.key === fortifyingSoulActionKey &&
    selectedAction.execute.kind === "activate"
  ) {
    return (
      <ActionDiceConfirmFooter
        actionName={selectedAction.name}
        confirmLabel={selectedFeaturePrimaryLabel}
        actionShape={getActionShapeForEconomyType(selectedAction.economyType)}
        actionShapeAvailable={selectedActionEconomyShapeState?.isAvailable ?? true}
        actionShapeMultiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
        disabled={selectedFeatureActionPrimaryDisabledReason !== null}
        isDiceRollerSettingsOpen={isDiceRollerSettingsOpen}
        onConfirm={() => executeFeatureActivate(selectedAction.action)}
        onDiceRollerSettingsOpenChange={setIsDiceRollerSettingsOpen}
      />
    );
  }

  if (selectedAction.execute.kind === "activate") {
    const actionShape = getActionShapeForEconomyType(selectedAction.economyType);
    const confirmAction = isCommonActionKey(selectedAction.action.key)
      ? executeCommonAction
      : executeFeatureActivate;

    return (
      <ActionButton
        className={styles.footerActionButton}
        onClick={() => confirmAction(selectedAction.action)}
        disabled={selectedFeatureActionPrimaryDisabledReason !== null}
        trailingBadge={
          actionShape ? (
            <ActionShape
              shape={actionShape}
              isSelected={selectedActionEconomyShapeState?.isAvailable ?? true}
              multiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
              className={styles.footerActionShape}
            />
          ) : null
        }
      >
        {selectedFeaturePrimaryLabel}
      </ActionButton>
    );
  }

  if (selectedAction.execute.kind === "spell") {
    const actionShape = getActionShapeForEconomyType(selectedAction.economyType);

    return (
      <ActionButton
        className={styles.footerActionButton}
        onClick={() => setIsFixedSpellDrawerOpen(true)}
        disabled={selectedFeatureActionPrimaryDisabledReason !== null}
        trailingBadge={
          actionShape ? (
            <ActionShape
              shape={actionShape}
              isSelected={selectedActionEconomyShapeState?.isAvailable ?? true}
              multiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
              className={styles.footerActionShape}
            />
          ) : null
        }
      >
        {selectedFeaturePrimaryLabel}
      </ActionButton>
    );
  }

  return null;
}
