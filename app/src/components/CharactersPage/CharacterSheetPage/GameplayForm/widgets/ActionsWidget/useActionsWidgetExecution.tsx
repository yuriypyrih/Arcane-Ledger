/* eslint-disable @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps */
import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import CellContainer from "../../../../../CellContainer/CellContainer";
import { useDiceRollerPopup } from "../../../../../DicePage/DiceRollerPopup";
import KeywordReferenceDrawer from "../../../../../KeywordReferenceDrawer/KeywordReferenceDrawer";
import ActionShape, { getActionShapeForCastingTime } from "../../../../../ActionShape";
import RollStatePill from "../../../../../RollStatePill/RollStatePill";
import FeatureOptInToggle from "../../../FeatureOptInToggle/FeatureOptInToggle";
import type { Character, CharacterWizardPortentRoll, MonsterRecord } from "../../../../../../types";
import { getMonsterKey } from "../../../../../../utils/monsters";
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
  applyRangerWinterWalkerFortifyingSoulSelfStatusForCharacter,
  applyLayOnHandsForCharacter,
  consumeBeguilingMagicOrBardicInspirationForCharacter,
  consumeMantleOfMajestyUseForCharacter,
  consumeContactPatronUseForCharacter,
  consumeWarlockEldritchSmitePactMagicSlotForCharacter,
  consumeWarlockLifedrinkerHitDieForCharacter,
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
import {
  boonOfFateImproveFateActionKey,
  boonOfRecoveryRecoverVitalityActionKey,
  consumeBoonOfFateImproveFateForCharacter,
  cultOfDragonInitiateInspiredByFearActionKey,
  durableSpeedyRecoveryActionKey,
  getBoonOfRecoveryRecoverVitalityFormula,
  getDurableSpeedyRecoveryHealingFormulaForCharacter,
  spendBoonOfRecoveryDiceForCharacter,
  spendCultOfDragonInitiateInspiredByFearForCharacter,
  spendDurableSpeedyRecoveryHitDieForCharacter
} from "../../../../../../pages/CharactersPage/feats/runtime";
import { restoreHeroicInspirationForCharacter } from "../../../../../../pages/CharactersPage/heroicInspiration";
import { getHitDiceRemainingForCharacter } from "../../../../../../pages/CharactersPage/hitDice";
import { bardicInspirationActionKey } from "../../../../../../pages/CharactersPage/classFeatures/bard/bard";
import { activateBarbarianRecklessAttack } from "../../../../../../pages/CharactersPage/classFeatures/barbarian/barbarian";
import { applyBarbarianRecklessAttackIndicatorToWeaponAction } from "../../../../../../pages/CharactersPage/classFeatures/barbarian/barbarianRecklessAttack";
import {
  createChargesCardUsage,
  createFeatureActionCardCost,
  createNamedUsageHeaderTags,
  createNamedResourceCardUsage
} from "../../../../../../pages/CharactersPage/classFeatures/cardUsage";
import {
  applyOrcAdrenalineRushForCharacter,
  consumeGoliathGiantAncestryUseForCharacter,
  getOrcAdrenalineRushUsesRemaining,
  hasOrcAdrenalineRushCommonActionBonusPath
} from "../../../../../../pages/CharactersPage/species";
import { hasExpeditiousRetreatDashBonusActionPath } from "../../../../../../pages/CharactersPage/characterRuntime/spellImplementations";
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
import { getCharacterRuntime } from "../../../../../../pages/CharactersPage/characterRuntime/characterRuntime";
import { isCommonActionKey } from "../../../../../../pages/CharactersPage/commonActions";
import {
  activateCustomActionForCharacter,
  isCustomActionKey
} from "../../../../../../pages/CharactersPage/customActions";
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
  clearLightWeaponDamagePenalty,
  isRoundTrackerResourceAvailable,
  shouldTrackRoundScopedResources
} from "../../../../../../pages/CharactersPage/combat";
import { removeInvisibleConditionFromCharacter } from "../../../../../../pages/CharactersPage/statusEntries";
import {
  applyRolledHealingToCharacter,
  applyRolledTemporaryHitPointsToCharacter,
  consumeRoundTrackerResourceForCharacter,
  prepareCharacterForRoundTrackerResourceConsumption
} from "../../gameplayStateUtils";
import { getSpellDamageDetailForCharacter } from "../../../../../../pages/CharactersPage/spellOutcome";
import { consumeTrueStrikePendingAttackForCharacter } from "../../../../../../pages/CharactersPage/characterRuntime/spellImplementations";
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
import { applyWeaponDamageBonusPreview } from "./fighterPsiWarriorWeapon";
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
import { getWeaponAttackPathStates, type WeaponAttackPathState } from "./weaponActionEconomy";
import {
  formatD20RollFormula,
  getFeatureActionDrawerPrimaryLabel,
  getFixedSpellEntryForExecute,
  grantMonkFleetStepFollowUpIfEligible,
  resolveFeatureSavingThrowBonusTotal,
  shouldConsumeMonkFleetStepFollowUp
} from "./actionHelpers";
import type { ActionsWidgetExecutionContext, ActionsWidgetProps } from "./types";
import { useActionsWidgetUiState } from "./useActionsWidgetUiState";
import { useActionsWidgetSubmissions } from "./useActionsWidgetSubmissions";
import { useActionsWidgetActions } from "./useActionsWidgetActions";
import { useActionResourceOptionModel } from "./useActionResourceOptionModel";
import { useSelectedActionModel } from "./useSelectedActionModel";
import { useSelectedWeaponActionModel } from "./useSelectedWeaponActionModel";
import ActionsGrid from "./ActionsGrid";
import FeatureSpellDrawers from "./FeatureSpellDrawers";
import WildShapePreviewDrawer from "./WildShapePreviewDrawer";

export function useActionsWidgetExecution(context: ActionsWidgetExecutionContext) {
  const {
    character,
    onPersistCharacter,
    dispatch,
    openDiceRoller,
    setSelectedActionKey,
    setSelectedActionOptionKeys,
    resetActionDrawerState,
    resetActionSelectionState,
    setSelectedWeaponDetailReference,
    arcaneWardSpellSlotOptions,
    bardicInspirationFallbackSpellSlotOptions,
    beastMasterReviveSpellSlotOptions,
    canRecoverLevelOneSpellSlotWithWildResurgence,
    canRecoverWildShapeWithWildResurgence,
    channelDivinityUsesRemaining,
    firstAvailableArcaneWardSpellSlotLevel,
    firstAvailableBardicInspirationSpellSlotLevel,
    firstAvailableBeastMasterReviveSpellSlotLevel,
    firstAvailableWildCompanionSpellSlotLevel,
    firstAvailableWildResurgenceSpellSlotLevel,
    fixedSpellActionPaths,
    fixedSpellConsumesSpellSlot,
    fixedSpellEntry,
    fixedSpellExecute,
    fixedSpellFreeCastSlotLevel,
    fixedSpellHuntersRimeTemporaryHitPointsFormula,
    fixedSpellHuntersRimeTemporaryHitPointsFormulaDisplay,
    fixedSpellMinimumActionSlotLevel,
    fixedSpellSlotsRemaining,
    frozenHauntFallbackSpellSlotMinimumLevel,
    hasOverlayOpen,
    initialSneakAttackActionSelection,
    isClairvoyantCombatantSelected,
    isColossusSlayerSelected,
    isCommonActionsOpen,
    isCustomActionsOpen,
    isCrownOfSpellfireSelected,
    isDiceRollerSettingsOpen,
    isDreadfulStrikeSelected,
    isEmpoweredStrikesSelected,
    isEldritchSmiteSelected,
    isFortifyingSoulIncludingSelfSelected,
    isGoliathAncestryStrikeSelected,
    isLifedrinkerSelected,
    isFixedSpellDrawerOpen,
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
    nextRollCriticalHitOverride,
    selectedAction,
    selectedActionKey,
    selectedActionOptionKeys,
    selectedActionSpellElementalSmiteDisabled,
    selectedActionSpellEntry,
    selectedActionSpellFrozenHauntFallbackSlotLevelIsValid,
    selectedActionSpellFrozenHauntOptionState,
    selectedActionSpellSupportsElementalSmite,
    selectedAasimarCelestialRevelationOptionKey,
    selectedAasimarHealingHandsTarget,
    selectedArcaneWardSpellSlotLevel,
    selectedBardicInspirationFallbackSlotIsValid,
    selectedBardicInspirationSpellSlotLevel,
    selectedBeastMasterReviveSpellSlotLevel,
    selectedBlessingOfTheTricksterTarget,
    selectedChannelDivinityOptionKey,
    selectedChannelDivinityRow,
    selectedClairvoyantCombatantToggleDisabled,
    selectedDivineInterventionSpell,
    selectedDrawerOptions,
    selectedFeatureAction,
    selectedFixedSpellSlotLevel,
    selectedFlurryOfHealingAndHarmUsesRemaining,
    selectedFontOfMagicSelection,
    selectedHandOfHealingTarget,
    selectedImprovedShadowStepState,
    selectedMonkPatientDefenseTemporaryHitPointsFormula,
    selectedMysticArcanumSpell,
    selectedMysticArcanumSpellLevel,
    selectedNatureMagicianOption,
    selectedRageOptionKey,
    selectedRageOptions,
    selectedRagePowerOptionKey,
    selectedRagePowerOptions,
    selectedRecoverVitalityDiceCount,
    selectedSpellfireBurstTarget,
    selectedStarryFormConstellation,
    selectedThirdEyeOptionKey,
    selectedWeaponColossusSlayerState,
    selectedWeaponColossusSlayerToggleDisabled,
    selectedWeaponDreadAmbusherState,
    selectedWeaponDreadfulStrikeToggleDisabled,
    selectedWeaponEldritchSmiteState,
    selectedWeaponLifedrinkerState,
    selectedWeaponEffectiveAction,
    selectedWeaponEmpoweredStrikesState,
    selectedWeaponEmpoweredStrikesToggleDisabled,
    selectedWeaponFeyDreadfulStrikesState,
    selectedWeaponFeyDreadfulStrikesToggleDisabled,
    selectedWeaponHandOfHarmState,
    selectedWeaponHandOfHarmToggleDisabled,
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
    selectedWeaponPsionicStrikeAvailable,
    selectedWeaponPsionicStrikeFormula,
    selectedWeaponQuiveringPalmState,
    selectedWeaponQuiveringPalmToggleDisabled,
    selectedWeaponSacredWeaponState,
    selectedWeaponSacredWeaponToggleDisabled,
    selectedWeaponStunningStrikeState,
    selectedWeaponStunningStrikeToggleDisabled,
    selectedWeaponVowOfEnmityState,
    selectedWeaponVowOfEnmityToggleDisabled,
    selectedWildCompanionResource,
    selectedWildCompanionSpellSlotLevel,
    selectedWildCompanionSpellSlotRemaining,
    selectedWildResurgenceMode,
    selectedWildResurgenceSpellSlotLevel,
    selectedWildShapeMonsterSlug,
    setIsClairvoyantCombatantSelected,
    setIsColossusSlayerSelected,
    setIsCommonActionsOpen,
    setIsCustomActionsOpen,
    setIsDiceRollerSettingsOpen,
    setIsDreadfulStrikeSelected,
    setIsEmpoweredStrikesSelected,
    setIsEldritchSmiteSelected,
    setIsLifedrinkerSelected,
    setIsFixedSpellDrawerOpen,
    setIsFlurryOfHealingAndHarmSelected,
    setIsGoliathAncestryStrikeSelected,
    setIsHandOfHarmSelected,
    setIsHuntersMarkTargetSelected,
    setIsImprovedShadowStepSelected,
    setIsPolarStrikesSelected,
    setIsPsionicStrikeSelected,
    setIsQuiveringPalmSelected,
    setIsRecklessAttackSelected,
    setIsSacredWeaponSelected,
    setIsStunningStrikeSelected,
    setIsVowOfEnmitySelected,
    setSelectedArcaneRecoverySelection,
    setSelectedArcaneWardSpellSlotLevel,
    setSelectedBardicInspirationSpellSlotLevel,
    setSelectedBeastMasterReviveSpellSlotLevel,
    setSelectedChannelDivinityOptionKey,
    setSelectedDivineInterventionSpell,
    setSelectedElementalSmiteOptionOnActionSpell,
    setSelectedFixedSpellSlotLevel,
    setSelectedFrozenHauntFallbackSlotLevel,
    setSelectedMysticArcanumSpell,
    setSelectedMysticArcanumSpellLevel,
    setSelectedNatureMagicianSpellSlotLevel,
    setSelectedSpellfireBurstTarget,
    setSelectedWildCompanionResource,
    setSelectedWildCompanionSpellSlotLevel,
    setSelectedWildResurgenceMode,
    setSelectedWildResurgenceSpellSlotLevel,
    setSelectedWildShapeMonsterSlug,
    setSneakAttackActionSelection,
    setUseBeguilingMagicOnActionSpell,
    setUseElementalSmiteOnActionSpell,
    setUseFrozenHauntOnActionSpell,
    showBardicInspirationFallbackSlotSelect,
    showSelectedFlurryOfHealingAndHarmToggle,
    wildResurgenceAvailableSpellSlotLevels,
    wildShapeKnownForms,
    wildShapeUsesRemaining
  } = context;

  function closeActionDrawer() {
    setSelectedWeaponDetailReference(null);
    resetActionDrawerState();
  }

  function openWeaponDetailReference(title: string, keywords: string[] | undefined) {
    const referenceEntries = keywords ? getKeywordReferences(keywords) : [];

    if (referenceEntries.length === 0) {
      return;
    }

    setSelectedWeaponDetailReference({
      title,
      entries: referenceEntries
    });
  }

  function prepareCharacterForResourceConsumption(
    currentCharacter: Character,
    resource: ReturnType<typeof getRoundTrackerResourceForEconomyType> | null
  ): Character {
    return resource
      ? prepareCharacterForRoundTrackerResourceConsumption(currentCharacter, resource)
      : currentCharacter;
  }

  useBodyScrollLock(hasOverlayOpen);

  useEffect(() => {
    if (selectedActionKey === null) {
      return;
    }

    if (!selectedAction) {
      closeActionDrawer();
    }
  }, [selectedAction, selectedActionKey]);

  useEffect(() => {
    resetActionSelectionState();
    setSneakAttackActionSelection(initialSneakAttackActionSelection);
    setSelectedSpellfireBurstTarget("self");
    setSelectedArcaneRecoverySelection({});
  }, [selectedActionKey, resetActionSelectionState]);

  useEffect(() => {
    if (!selectedChannelDivinityOptionKey) {
      return;
    }

    if (selectedChannelDivinityRow) {
      return;
    }

    setSelectedChannelDivinityOptionKey(null);
  }, [selectedChannelDivinityOptionKey, selectedChannelDivinityRow]);

  useEffect(() => {
    if (!selectedWeaponSacredWeaponState || selectedWeaponSacredWeaponToggleDisabled) {
      setIsSacredWeaponSelected(false);
    }
  }, [selectedWeaponSacredWeaponState, selectedWeaponSacredWeaponToggleDisabled]);

  useEffect(() => {
    if (!selectedWeaponVowOfEnmityState || selectedWeaponVowOfEnmityToggleDisabled) {
      setIsVowOfEnmitySelected(false);
    }
  }, [selectedWeaponVowOfEnmityState, selectedWeaponVowOfEnmityToggleDisabled]);

  useEffect(() => {
    if (!selectedWeaponGoliathAncestryState || selectedWeaponGoliathAncestryToggleDisabled) {
      setIsGoliathAncestryStrikeSelected(false);
    }
  }, [selectedWeaponGoliathAncestryState, selectedWeaponGoliathAncestryToggleDisabled]);

  useEffect(() => {
    if (selectedWeaponHuntersMarkTargetToggleDisabled) {
      setIsHuntersMarkTargetSelected(false);
    }
  }, [selectedWeaponHuntersMarkTargetToggleDisabled]);

  useEffect(() => {
    if (!selectedWeaponStunningStrikeState || selectedWeaponStunningStrikeToggleDisabled) {
      setIsStunningStrikeSelected(false);
    }
  }, [selectedWeaponStunningStrikeState, selectedWeaponStunningStrikeToggleDisabled]);

  useEffect(() => {
    if (!selectedWeaponEmpoweredStrikesState || selectedWeaponEmpoweredStrikesToggleDisabled) {
      setIsEmpoweredStrikesSelected(false);
    }
  }, [selectedWeaponEmpoweredStrikesState, selectedWeaponEmpoweredStrikesToggleDisabled]);

  useEffect(() => {
    if (selectedClairvoyantCombatantToggleDisabled) {
      setIsClairvoyantCombatantSelected(false);
    }
  }, [selectedClairvoyantCombatantToggleDisabled]);

  useEffect(() => {
    if (!selectedWeaponHandOfHarmState || selectedWeaponHandOfHarmToggleDisabled) {
      setIsHandOfHarmSelected(false);
    }
  }, [selectedWeaponHandOfHarmState, selectedWeaponHandOfHarmToggleDisabled]);

  useEffect(() => {
    if (!selectedWeaponQuiveringPalmState || selectedWeaponQuiveringPalmToggleDisabled) {
      setIsQuiveringPalmSelected(false);
    }
  }, [selectedWeaponQuiveringPalmState, selectedWeaponQuiveringPalmToggleDisabled]);

  useEffect(() => {
    if (!selectedImprovedShadowStepState || selectedImprovedShadowStepState.disabled) {
      setIsImprovedShadowStepSelected(false);
    }
  }, [selectedImprovedShadowStepState]);

  useEffect(() => {
    if (selectedFeatureAction?.key !== druidWildShapeActionKey) {
      return;
    }

    setSelectedWildShapeMonsterSlug((currentValue) => {
      if (
        currentValue &&
        wildShapeKnownForms.some((monster) => getMonsterKey(monster) === currentValue)
      ) {
        return currentValue;
      }

      return null;
    });
  }, [selectedFeatureAction?.key, wildShapeKnownForms]);

  useEffect(() => {
    if (selectedFeatureAction?.key !== druidWildCompanionActionKey) {
      return;
    }

    setSelectedWildCompanionResource((currentValue) => {
      if (currentValue === "wild-shape" && wildShapeUsesRemaining > 0) {
        return currentValue;
      }

      if (currentValue === "spell-slot" && firstAvailableWildCompanionSpellSlotLevel !== null) {
        return currentValue;
      }

      return wildShapeUsesRemaining > 0 ? "wild-shape" : "spell-slot";
    });
  }, [
    firstAvailableWildCompanionSpellSlotLevel,
    selectedFeatureAction?.key,
    wildShapeUsesRemaining
  ]);

  useEffect(() => {
    if (
      selectedFeatureAction?.key !== bardicInspirationActionKey ||
      !showBardicInspirationFallbackSlotSelect
    ) {
      return;
    }

    setSelectedBardicInspirationSpellSlotLevel((currentValue) =>
      currentValue !== null &&
      bardicInspirationFallbackSpellSlotOptions.some((slot) => slot.level === currentValue)
        ? currentValue
        : firstAvailableBardicInspirationSpellSlotLevel
    );
  }, [
    bardicInspirationFallbackSpellSlotOptions,
    firstAvailableBardicInspirationSpellSlotLevel,
    selectedFeatureAction?.key,
    showBardicInspirationFallbackSlotSelect
  ]);

  useEffect(() => {
    if (selectedFeatureAction?.key !== wizardAbjurerArcaneWardActionKey) {
      return;
    }

    setSelectedArcaneWardSpellSlotLevel((currentValue) =>
      currentValue !== null &&
      arcaneWardSpellSlotOptions.some((slot) => slot.level === currentValue)
        ? currentValue
        : firstAvailableArcaneWardSpellSlotLevel
    );
  }, [
    arcaneWardSpellSlotOptions,
    firstAvailableArcaneWardSpellSlotLevel,
    selectedFeatureAction?.key,
    setSelectedArcaneWardSpellSlotLevel
  ]);

  useEffect(() => {
    if (selectedFeatureAction?.key !== rangerBeastMasterReviveActionKey) {
      return;
    }

    setSelectedBeastMasterReviveSpellSlotLevel((currentValue) =>
      currentValue !== null &&
      beastMasterReviveSpellSlotOptions.some((slot) => slot.level === currentValue)
        ? currentValue
        : firstAvailableBeastMasterReviveSpellSlotLevel
    );
  }, [
    beastMasterReviveSpellSlotOptions,
    firstAvailableBeastMasterReviveSpellSlotLevel,
    selectedFeatureAction?.key
  ]);

  useEffect(() => {
    if (
      selectedFeatureAction?.key !== druidWildCompanionActionKey ||
      firstAvailableWildCompanionSpellSlotLevel === null
    ) {
      return;
    }

    setSelectedWildCompanionSpellSlotLevel((currentValue) =>
      (fixedSpellSlotsRemaining[currentValue - 1] ?? 0) > 0
        ? currentValue
        : firstAvailableWildCompanionSpellSlotLevel
    );
  }, [
    firstAvailableWildCompanionSpellSlotLevel,
    fixedSpellSlotsRemaining,
    selectedFeatureAction?.key
  ]);

  useEffect(() => {
    if (selectedFeatureAction?.key !== druidNatureMagicianActionKey) {
      return;
    }

    setSelectedNatureMagicianSpellSlotLevel((currentValue) =>
      currentValue !== null &&
      natureMagicianOptions.some((option) => option.spellSlotLevel === currentValue)
        ? currentValue
        : (natureMagicianOptions[0]?.spellSlotLevel ?? null)
    );
  }, [natureMagicianOptions, selectedFeatureAction?.key]);

  useEffect(() => {
    if (selectedFeatureAction?.key !== druidWildResurgenceActionKey) {
      return;
    }

    setSelectedWildResurgenceMode((currentValue) => {
      if (currentValue === "spell-slot-to-wild-shape" && canRecoverWildShapeWithWildResurgence) {
        return currentValue;
      }

      if (currentValue === "wild-shape-to-slot" && canRecoverLevelOneSpellSlotWithWildResurgence) {
        return currentValue;
      }

      if (canRecoverWildShapeWithWildResurgence) {
        return "spell-slot-to-wild-shape";
      }

      if (canRecoverLevelOneSpellSlotWithWildResurgence) {
        return "wild-shape-to-slot";
      }

      return null;
    });
  }, [
    canRecoverLevelOneSpellSlotWithWildResurgence,
    canRecoverWildShapeWithWildResurgence,
    selectedFeatureAction?.key
  ]);

  useEffect(() => {
    if (
      selectedFeatureAction?.key !== druidWildResurgenceActionKey ||
      firstAvailableWildResurgenceSpellSlotLevel === null
    ) {
      return;
    }

    setSelectedWildResurgenceSpellSlotLevel((currentValue) =>
      wildResurgenceAvailableSpellSlotLevels.includes(currentValue)
        ? currentValue
        : firstAvailableWildResurgenceSpellSlotLevel
    );
  }, [
    firstAvailableWildResurgenceSpellSlotLevel,
    selectedFeatureAction?.key,
    wildResurgenceAvailableSpellSlotLevels
  ]);

  useEffect(() => {
    setUseBeguilingMagicOnActionSpell(false);
    setUseElementalSmiteOnActionSpell(false);
    setSelectedElementalSmiteOptionOnActionSpell(null);
    setUseFrozenHauntOnActionSpell(false);
    setSelectedFrozenHauntFallbackSlotLevel(frozenHauntFallbackSpellSlotMinimumLevel);
  }, [selectedActionSpellEntry?.id]);

  useEffect(() => {
    if (!selectedActionSpellSupportsElementalSmite || !selectedActionSpellElementalSmiteDisabled) {
      return;
    }

    setUseElementalSmiteOnActionSpell(false);
    setSelectedElementalSmiteOptionOnActionSpell(null);
  }, [selectedActionSpellElementalSmiteDisabled, selectedActionSpellSupportsElementalSmite]);

  useEffect(() => {
    if (!selectedActionSpellFrozenHauntOptionState) {
      setUseFrozenHauntOnActionSpell(false);
      return;
    }

    if (!selectedActionSpellFrozenHauntFallbackSlotLevelIsValid) {
      setSelectedFrozenHauntFallbackSlotLevel(
        selectedActionSpellFrozenHauntOptionState.fallbackSpellSlotLevels[0] ??
          frozenHauntFallbackSpellSlotMinimumLevel
      );
    }

    if (selectedActionSpellFrozenHauntOptionState.disabled) {
      setUseFrozenHauntOnActionSpell(false);
    }
  }, [
    selectedActionSpellFrozenHauntFallbackSlotLevelIsValid,
    selectedActionSpellFrozenHauntOptionState
  ]);

  useEffect(() => {
    if (selectedWeaponPsionicStrikeAvailable) {
      return;
    }

    setIsPsionicStrikeSelected(false);
  }, [selectedWeaponPsionicStrikeAvailable]);

  useEffect(() => {
    if (selectedWeaponEldritchSmiteState && !selectedWeaponEldritchSmiteState.disabled) {
      return;
    }

    setIsEldritchSmiteSelected(false);
  }, [selectedWeaponEldritchSmiteState]);

  useEffect(() => {
    if (selectedWeaponLifedrinkerState && !selectedWeaponLifedrinkerState.disabled) {
      return;
    }

    setIsLifedrinkerSelected(false);
  }, [selectedWeaponLifedrinkerState]);

  useEffect(() => {
    if (
      showSelectedFlurryOfHealingAndHarmToggle &&
      selectedFlurryOfHealingAndHarmUsesRemaining > 0
    ) {
      return;
    }

    setIsFlurryOfHealingAndHarmSelected(false);
  }, [showSelectedFlurryOfHealingAndHarmToggle, selectedFlurryOfHealingAndHarmUsesRemaining]);

  useEffect(() => {
    if (!fixedSpellEntry || !fixedSpellExecute) {
      return;
    }

    setSelectedFixedSpellSlotLevel(
      fixedSpellFreeCastSlotLevel ??
        fixedSpellMinimumActionSlotLevel ??
        fixedSpellExecute.spellLevel ??
        getSpellLevel(fixedSpellEntry)
    );
  }, [
    fixedSpellEntry,
    fixedSpellExecute,
    fixedSpellFreeCastSlotLevel,
    fixedSpellMinimumActionSlotLevel
  ]);

  useEffect(() => {
    if (!hasOverlayOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      if (selectedMysticArcanumSpell) {
        setSelectedMysticArcanumSpell(null);
        setSelectedMysticArcanumSpellLevel(null);
        return;
      }

      if (selectedDivineInterventionSpell) {
        setSelectedDivineInterventionSpell(null);
        return;
      }

      if (isFixedSpellDrawerOpen) {
        setIsFixedSpellDrawerOpen(false);
        return;
      }

      if (isDiceRollerSettingsOpen) {
        setIsDiceRollerSettingsOpen(false);
        return;
      }

      if (selectedActionKey !== null) {
        setSelectedActionKey(null);
        return;
      }

      if (isCommonActionsOpen) {
        setIsCommonActionsOpen(false);
        return;
      }

      if (isCustomActionsOpen) {
        setIsCustomActionsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    hasOverlayOpen,
    isCommonActionsOpen,
    isCustomActionsOpen,
    isDiceRollerSettingsOpen,
    isFixedSpellDrawerOpen,
    selectedActionKey,
    selectedDivineInterventionSpell,
    selectedMysticArcanumSpell
  ]);

  function activateFeatureAction(
    action: FeatureActionCard,
    economyTypeOverride: EconomyType | null = null
  ) {
    const nextAction =
      economyTypeOverride === null || economyTypeOverride === action.economyType
        ? action
        : {
            ...action,
            economyType: economyTypeOverride
          };
    const applyActionForCharacter = isCustomActionKey(action.key)
      ? activateCustomActionForCharacter
      : activateFeatureActionForCharacter;

    onPersistCharacter((currentCharacter) => {
      const nextCharacter = applyActionForCharacter(currentCharacter, action.key);
      const roundTrackerResource = getRoundTrackerResourceForEconomyType(nextAction.economyType);
      const preparedCharacter = prepareCharacterForResourceConsumption(
        currentCharacter,
        roundTrackerResource
      );
      const preparedNextCharacter =
        preparedCharacter === currentCharacter
          ? nextCharacter
          : applyActionForCharacter(preparedCharacter, action.key);

      if (isCustomActionKey(action.key) && preparedNextCharacter === preparedCharacter) {
        return currentCharacter;
      }

      const characterToUpdate =
        preparedNextCharacter === preparedCharacter && nextAction.consumesEconomyOnActivate
          ? preparedCharacter
          : preparedNextCharacter;

      if (characterToUpdate === preparedCharacter && !nextAction.consumesEconomyOnActivate) {
        return currentCharacter;
      }

      const nextCharacterWithFleetStep = grantMonkFleetStepFollowUpIfEligible(
        characterToUpdate,
        action.key,
        nextAction.economyType
      );

      if (nextAction.economyType === "action" && nextAction.actionCategory !== "magic") {
        return consumeNonMagicActionForCharacter(nextCharacterWithFleetStep, nextAction);
      }

      return roundTrackerResource
        ? consumeRoundTrackerResourceForCharacter(nextCharacterWithFleetStep, roundTrackerResource)
        : nextCharacterWithFleetStep;
    });
  }

  function activateFortifyingSoulAction(action: FeatureActionCard) {
    const shouldApplySelfTrait = isFortifyingSoulIncludingSelfSelected === true;

    onPersistCharacter((currentCharacter) => {
      const roundTrackerResource = getRoundTrackerResourceForEconomyType(action.economyType);
      const preparedCharacter = prepareCharacterForResourceConsumption(
        currentCharacter,
        roundTrackerResource
      );
      const nextCharacter = activateFeatureActionForCharacter(preparedCharacter, action.key);

      if (nextCharacter === preparedCharacter) {
        return currentCharacter;
      }

      const nextCharacterWithSelfTrait = shouldApplySelfTrait
        ? applyRangerWinterWalkerFortifyingSoulSelfStatusForCharacter(nextCharacter)
        : nextCharacter;

      return roundTrackerResource
        ? consumeRoundTrackerResourceForCharacter(nextCharacterWithSelfTrait, roundTrackerResource)
        : nextCharacterWithSelfTrait;
    });
  }

  function executeCommonAction(
    action: FeatureActionCard,
    economyType: EconomyType = action.economyType
  ) {
    const isBonusActionDash =
      action.key === "common-action-dash" && economyType === ECONOMY_TYPE.BONUS_ACTION;

    if (
      isBonusActionDash &&
      !hasExpeditiousRetreatDashBonusActionPath(character, action.key) &&
      hasOrcAdrenalineRushCommonActionBonusPath(character, action.key) &&
      getOrcAdrenalineRushUsesRemaining(character) > 0
    ) {
      onPersistCharacter((currentCharacter) => {
        if (
          !hasOrcAdrenalineRushCommonActionBonusPath(currentCharacter, action.key) ||
          getOrcAdrenalineRushUsesRemaining(currentCharacter) <= 0
        ) {
          return currentCharacter;
        }

        const shouldConsumeFleetStep = shouldConsumeMonkFleetStepFollowUp(currentCharacter);
        const roundTrackerResource = shouldConsumeFleetStep
          ? null
          : getRoundTrackerResourceForEconomyType(ECONOMY_TYPE.BONUS_ACTION);
        const preparedCharacter = prepareCharacterForResourceConsumption(
          currentCharacter,
          roundTrackerResource
        );
        const rushedCharacter = applyOrcAdrenalineRushForCharacter(preparedCharacter);
        const characterWithFleetStep =
          shouldConsumeFleetStep && shouldConsumeMonkFleetStepFollowUp(rushedCharacter)
            ? consumeMonkWarriorOfTheOpenHandFleetStepFollowUpUse(rushedCharacter)
            : rushedCharacter;

        return roundTrackerResource
          ? consumeRoundTrackerResourceForCharacter(characterWithFleetStep, roundTrackerResource)
          : characterWithFleetStep;
      });
      closeActionDrawer();
      setIsCommonActionsOpen(false);
      return;
    }

    if (isBonusActionDash && shouldConsumeMonkFleetStepFollowUp(character)) {
      onPersistCharacter((currentCharacter) =>
        shouldConsumeMonkFleetStepFollowUp(currentCharacter)
          ? consumeMonkWarriorOfTheOpenHandFleetStepFollowUpUse(currentCharacter)
          : currentCharacter
      );
      closeActionDrawer();
      setIsCommonActionsOpen(false);
      return;
    }

    activateFeatureAction(action, economyType);
    closeActionDrawer();
    setIsCommonActionsOpen(false);
  }

  function executeMonkHandOfHealingPath(economyType: EconomyType) {
    if (!selectedFeatureAction) {
      return;
    }

    const healingFormula = getMonkWarriorOfMercyHandOfHealingFormula(character);

    if (!healingFormula) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      const isFlurryBonusPath = economyType === ECONOMY_TYPE.BONUS_ACTION;
      const roundTrackerResource = isFlurryBonusPath ? null : "action";
      const preparedCharacter = roundTrackerResource
        ? prepareCharacterForRoundTrackerResourceConsumption(currentCharacter, roundTrackerResource)
        : currentCharacter;
      const nextCharacter = activateMonkWarriorOfMercyHandOfHealing(
        preparedCharacter,
        isFlurryBonusPath ? "flurry_bonus_action" : "action"
      );

      if (nextCharacter === preparedCharacter) {
        return currentCharacter;
      }

      return roundTrackerResource
        ? consumeRoundTrackerResourceForCharacter(nextCharacter, roundTrackerResource)
        : nextCharacter;
    });

    openDiceRoller({
      title: selectedFeatureAction.name,
      formula: healingFormula,
      formulaDisplay: healingFormula,
      description: selectedFeatureAction.detail,
      onResolvedResult:
        selectedHandOfHealingTarget === "self"
          ? ({ result }) => {
              onPersistCharacter((currentCharacter) =>
                applyRolledHealingToCharacter(currentCharacter, result.total)
              );
            }
          : undefined
    });

    closeActionDrawer();
  }

  function executeMonkFlurryOfBlowsAction() {
    if (!selectedFeatureAction) {
      return;
    }

    const useFlurryOfHealingAndHarm =
      isFlurryOfHealingAndHarmSelected && selectedFlurryOfHealingAndHarmUsesRemaining > 0;

    onPersistCharacter((currentCharacter) => {
      const roundTrackerResource = getRoundTrackerResourceForEconomyType(
        selectedFeatureAction.economyType
      );
      const preparedCharacter = prepareCharacterForResourceConsumption(
        currentCharacter,
        roundTrackerResource
      );
      const nextCharacter = activateMonkFlurryOfBlows(preparedCharacter, {
        useFlurryOfHealingAndHarm
      });

      if (nextCharacter === preparedCharacter) {
        return currentCharacter;
      }

      const nextCharacterWithFleetStep = grantMonkFleetStepFollowUpIfEligible(
        nextCharacter,
        selectedFeatureAction.key,
        selectedFeatureAction.economyType
      );

      return roundTrackerResource
        ? consumeRoundTrackerResourceForCharacter(nextCharacterWithFleetStep, roundTrackerResource)
        : nextCharacterWithFleetStep;
    });

    closeActionDrawer();
  }

  function submitMonkWholenessOfBody(action: FeatureActionCard) {
    const healingFormula = getMonkWarriorOfTheOpenHandWholenessOfBodyHealingFormula(character);

    if (!healingFormula) {
      closeActionDrawer();
      return;
    }

    activateFeatureAction(action);

    openDiceRoller({
      title: action.name,
      formula: healingFormula,
      formulaDisplay: healingFormula,
      description: `${action.detail} Minimum 1 Hit Point regained.`,
      onResolvedResult: ({ result }) => {
        onPersistCharacter((currentCharacter) =>
          applyRolledHealingToCharacter(currentCharacter, result.total)
        );
      }
    });

    closeActionDrawer();
  }

  function submitMonkPatientDefense() {
    if (!selectedFeatureAction || !selectedMonkPatientDefenseTemporaryHitPointsFormula) {
      return;
    }

    activateFeatureAction(selectedFeatureAction);

    openDiceRoller({
      title: selectedFeatureAction.name,
      formula: selectedMonkPatientDefenseTemporaryHitPointsFormula,
      formulaDisplay: selectedMonkPatientDefenseTemporaryHitPointsFormula,
      description: selectedFeatureAction.detail,
      onResolvedResult: ({ result }) => {
        onPersistCharacter((currentCharacter) =>
          applyRolledTemporaryHitPointsToCharacter(
            currentCharacter,
            result.total,
            "Patient Defense"
          )
        );
      }
    });

    closeActionDrawer();
  }

  function executeFeatureActivate(action: FeatureActionCard) {
    const effectKind =
      action.execute?.kind === "activate" ? (action.execute.effectKind ?? "default") : "default";

    if (action.key === wizardAbjurerArcaneWardActionKey) {
      onPersistCharacter((currentCharacter) =>
        applyArcaneWardActionUse(currentCharacter, action, selectedArcaneWardSpellSlotLevel)
      );
      closeActionDrawer();
      return;
    }

    if (action.key === rangerBeastMasterReviveActionKey) {
      const spellSlotLevel = selectedBeastMasterReviveSpellSlotLevel;

      if (spellSlotLevel === null) {
        return;
      }

      onPersistCharacter((currentCharacter) => {
        const spellSlotTotals = getSpellSlotTotalsForCharacter(
          currentCharacter.className,
          currentCharacter.level,
          currentCharacter.subclassId,
          currentCharacter.customClass,
          currentCharacter.classRules
        );
        const spellSlotsExpended = normalizeSpellSlotsExpended(
          currentCharacter.spellSlotsExpended,
          spellSlotTotals
        );
        const slotIndex = spellSlotLevel - 1;
        const selectedSlotRemaining = Math.max(
          0,
          (spellSlotTotals[slotIndex] ?? 0) - (spellSlotsExpended[slotIndex] ?? 0)
        );

        if (selectedSlotRemaining <= 0) {
          return currentCharacter;
        }

        const roundTrackerResource = getRoundTrackerResourceForEconomyType(action.economyType);
        const preparedCharacter = prepareCharacterForResourceConsumption(
          currentCharacter,
          roundTrackerResource
        );
        const nextCharacter = activateFeatureActionForCharacter(preparedCharacter, action.key);

        if (nextCharacter === preparedCharacter) {
          return currentCharacter;
        }

        const nextSpellSlotsExpended = normalizeSpellSlotsExpended(
          nextCharacter.spellSlotsExpended,
          spellSlotTotals
        );
        nextSpellSlotsExpended[slotIndex] = (nextSpellSlotsExpended[slotIndex] ?? 0) + 1;

        const nextCharacterWithSpellSlot = {
          ...nextCharacter,
          spellSlotsExpended: nextSpellSlotsExpended
        };

        return roundTrackerResource
          ? consumeRoundTrackerResourceForCharacter(
              nextCharacterWithSpellSlot,
              roundTrackerResource
            )
          : nextCharacterWithSpellSlot;
      });
      closeActionDrawer();
      return;
    }

    if (
      action.key === monkStepOfTheWindActionKey &&
      shouldConsumeMonkFleetStepFollowUp(character)
    ) {
      onPersistCharacter((currentCharacter) => {
        if (!shouldConsumeMonkFleetStepFollowUp(currentCharacter)) {
          return currentCharacter;
        }

        const nextCharacter = activateFeatureActionForCharacter(currentCharacter, action.key);

        if (nextCharacter === currentCharacter) {
          return currentCharacter;
        }

        return consumeMonkWarriorOfTheOpenHandFleetStepFollowUpUse(nextCharacter);
      });
      closeActionDrawer();
      return;
    }

    if (action.key === innateSorceryActionKey) {
      onPersistCharacter((currentCharacter) => {
        const roundTrackerResource = getRoundTrackerResourceForEconomyType(action.economyType);
        const preparedCharacter = prepareCharacterForResourceConsumption(
          currentCharacter,
          roundTrackerResource
        );
        const nextCharacter = activateInnateSorceryForCharacter(preparedCharacter, {
          useCrownOfSpellfire: isCrownOfSpellfireSelected
        });

        if (nextCharacter === preparedCharacter) {
          return currentCharacter;
        }

        return roundTrackerResource
          ? consumeRoundTrackerResourceForCharacter(nextCharacter, roundTrackerResource)
          : nextCharacter;
      });
      closeActionDrawer();
      return;
    }

    if (action.key === awakenedMindActionKey) {
      const useClairvoyantCombatant =
        isClairvoyantCombatantSelected && !selectedClairvoyantCombatantToggleDisabled;

      onPersistCharacter((currentCharacter) => {
        const roundTrackerResource = getRoundTrackerResourceForEconomyType(action.economyType);
        const preparedCharacter = prepareCharacterForResourceConsumption(
          currentCharacter,
          roundTrackerResource
        );
        const nextCharacter = activateWarlockAwakenedMind(preparedCharacter, {
          useClairvoyantCombatant
        });

        if (nextCharacter === preparedCharacter) {
          return currentCharacter;
        }

        return roundTrackerResource
          ? consumeRoundTrackerResourceForCharacter(nextCharacter, roundTrackerResource)
          : nextCharacter;
      });
      closeActionDrawer();
      return;
    }

    if (action.key === monkWholenessOfBodyActionKey) {
      submitMonkWholenessOfBody(action);
      return;
    }

    if (action.key === bardicInspirationActionKey) {
      onPersistCharacter((currentCharacter) => {
        const roundTrackerResource = getRoundTrackerResourceForEconomyType(action.economyType);
        const preparedCharacter = prepareCharacterForResourceConsumption(
          currentCharacter,
          roundTrackerResource
        );
        const bardicUsesRemaining =
          getBardicInspirationUsesRemainingForCharacter(preparedCharacter);

        if (bardicUsesRemaining <= 0 && !selectedBardicInspirationFallbackSlotIsValid) {
          return currentCharacter;
        }

        const fallbackSpellSlotLevel =
          bardicUsesRemaining > 0
            ? undefined
            : selectedBardicInspirationFallbackSlotIsValid
              ? (selectedBardicInspirationSpellSlotLevel ?? undefined)
              : undefined;
        const nextCharacter = activateBardicInspirationForCharacter(
          preparedCharacter,
          fallbackSpellSlotLevel
        );

        if (nextCharacter === preparedCharacter) {
          return currentCharacter;
        }

        const nextCharacterWithInspiredEclipse =
          action.key === bardicInspirationActionKey && isInspiredEclipseSelected
            ? applyInspiredEclipseStatusForCharacter(nextCharacter)
            : nextCharacter;

        if (action.economyType === "action" && action.actionCategory !== "magic") {
          return consumeNonMagicActionForCharacter(nextCharacterWithInspiredEclipse, action);
        }

        return roundTrackerResource
          ? consumeRoundTrackerResourceForCharacter(
              nextCharacterWithInspiredEclipse,
              roundTrackerResource
            )
          : nextCharacterWithInspiredEclipse;
      });
      closeActionDrawer();
      return;
    }

    if (action.key === boonOfFateImproveFateActionKey) {
      if ((action.usesRemaining ?? 0) <= 0) {
        return;
      }

      onPersistCharacter((currentCharacter) =>
        consumeBoonOfFateImproveFateForCharacter(currentCharacter)
      );

      openDiceRoller({
        title: "Improve Fate",
        formula: "2d4",
        formulaDisplay: "2d4",
        description: "Roll 2d4 and apply the total as a bonus or penalty to the D20 Test.",
        getFullManualToastText: ({ result }) => `Rolled ${result.total} Improve Fate.`
      });

      closeActionDrawer();
      return;
    }

    if (action.key === boonOfRecoveryRecoverVitalityActionKey) {
      const diceCount = Math.max(
        1,
        Math.min(10, Math.floor(Number(selectedRecoverVitalityDiceCount) || 1))
      );

      if (diceCount > (action.usesRemaining ?? 0)) {
        return;
      }

      const healingFormula = getBoonOfRecoveryRecoverVitalityFormula(diceCount);

      onPersistCharacter((currentCharacter) => {
        const roundTrackerResource = getRoundTrackerResourceForEconomyType(action.economyType);
        const preparedCharacter = prepareCharacterForResourceConsumption(
          currentCharacter,
          roundTrackerResource
        );
        const nextCharacter = spendBoonOfRecoveryDiceForCharacter(preparedCharacter, diceCount);

        if (nextCharacter === preparedCharacter) {
          return currentCharacter;
        }

        return roundTrackerResource
          ? consumeRoundTrackerResourceForCharacter(nextCharacter, roundTrackerResource)
          : nextCharacter;
      });

      openDiceRoller({
        title: "Recover Vitality",
        formula: healingFormula,
        formulaDisplay: healingFormula,
        description: `Expend ${diceCount} Recover Vitality d10${
          diceCount === 1 ? "" : "s"
        } and regain Hit Points equal to the roll.`,
        getFullManualToastText: ({ result }) => `Rolled ${result.total} Recover Vitality healing.`,
        onResolvedResult: ({ result }) => {
          onPersistCharacter((currentCharacter) =>
            applyRolledHealingToCharacter(currentCharacter, result.total)
          );
        }
      });

      closeActionDrawer();
      return;
    }

    if (
      effectKind === "cult-inspired-by-fear" ||
      action.key === cultOfDragonInitiateInspiredByFearActionKey
    ) {
      if ((action.usesRemaining ?? 0) <= 0) {
        return;
      }

      onPersistCharacter((currentCharacter) => {
        const nextCharacter =
          spendCultOfDragonInitiateInspiredByFearForCharacter(currentCharacter);

        if (nextCharacter === currentCharacter) {
          return currentCharacter;
        }

        return restoreHeroicInspirationForCharacter(nextCharacter);
      });

      closeActionDrawer();
      return;
    }

    if (effectKind === "speedy-recovery" || action.key === durableSpeedyRecoveryActionKey) {
      if (getHitDiceRemainingForCharacter(character) <= 0) {
        return;
      }

      const healingFormula = getDurableSpeedyRecoveryHealingFormulaForCharacter(character);

      onPersistCharacter((currentCharacter) => {
        const roundTrackerResource = getRoundTrackerResourceForEconomyType(action.economyType);
        const preparedCharacter = prepareCharacterForResourceConsumption(
          currentCharacter,
          roundTrackerResource
        );
        const nextCharacter = spendDurableSpeedyRecoveryHitDieForCharacter(preparedCharacter);

        if (nextCharacter === preparedCharacter) {
          return currentCharacter;
        }

        return roundTrackerResource
          ? consumeRoundTrackerResourceForCharacter(nextCharacter, roundTrackerResource)
          : nextCharacter;
      });

      openDiceRoller({
        title: "Speedy Recovery",
        formula: healingFormula,
        formulaDisplay: healingFormula,
        description: "Expend one Hit Point Die and regain Hit Points equal to the roll.",
        getFullManualToastText: ({ result }) => `Rolled ${result.total} Speedy Recovery healing.`,
        onResolvedResult: ({ result }) => {
          onPersistCharacter((currentCharacter) =>
            applyRolledHealingToCharacter(currentCharacter, result.total)
          );
        }
      });

      closeActionDrawer();
      return;
    }

    if (effectKind === "second-wind") {
      const healingFormula = getFighterSecondWindHealingFormula(character);
      const groupRecoveryFormula = getFighterGroupRecoveryHealingFormula(character);
      const usesGroupRecovery =
        isGroupRecoverySelected && getFighterGroupRecoveryUsesRemaining(character) > 0;

      onPersistCharacter((currentCharacter) => {
        const roundTrackerResource = getRoundTrackerResourceForEconomyType(action.economyType);
        const preparedCharacter = prepareCharacterForResourceConsumption(
          currentCharacter,
          roundTrackerResource
        );
        const nextCharacter = activateFeatureActionForCharacter(preparedCharacter, action.key);

        if (nextCharacter === preparedCharacter) {
          return currentCharacter;
        }

        const nextCharacterWithGroupRecovery = usesGroupRecovery
          ? consumeFighterGroupRecoveryUse(nextCharacter)
          : nextCharacter;
        const nextCharacterWithBanneretEffects = usesGroupRecovery
          ? applyFighterTeamTacticsStatus(nextCharacterWithGroupRecovery)
          : nextCharacterWithGroupRecovery;
        const nextCharacterWithConsumedEconomy = roundTrackerResource
          ? consumeRoundTrackerResourceForCharacter(
              nextCharacterWithBanneretEffects,
              roundTrackerResource
            )
          : nextCharacterWithBanneretEffects;

        return nextCharacterWithConsumedEconomy;
      });

      openDiceRoller({
        title: "Second Wind",
        formula: healingFormula,
        formulaDisplay: healingFormula,
        description: usesGroupRecovery
          ? `${action.detail} Group Recovery: each chosen ally regains Hit Points equal to ${groupRecoveryFormula}.`
          : action.detail,
        onResolvedResult: ({ result }) => {
          onPersistCharacter((currentCharacter) =>
            applyRolledHealingToCharacter(currentCharacter, result.total)
          );
        }
      });

      closeActionDrawer();
      return;
    }

    if (effectKind === "know-your-enemy") {
      onPersistCharacter((currentCharacter) => {
        const roundTrackerResource = getRoundTrackerResourceForEconomyType(action.economyType);
        const preparedCharacter = prepareCharacterForResourceConsumption(
          currentCharacter,
          roundTrackerResource
        );
        const nextCharacter =
          consumeFighterBattleMasterKnowYourEnemyForCharacter(preparedCharacter);

        if (nextCharacter === preparedCharacter) {
          return currentCharacter;
        }

        return roundTrackerResource
          ? consumeRoundTrackerResourceForCharacter(nextCharacter, roundTrackerResource)
          : nextCharacter;
      });
      closeActionDrawer();
      return;
    }

    if (effectKind === "combat-superiority") {
      onPersistCharacter((currentCharacter) => {
        const roundTrackerResource = getRoundTrackerResourceForEconomyType(action.economyType);
        const preparedCharacter = prepareCharacterForResourceConsumption(
          currentCharacter,
          roundTrackerResource
        );
        const shouldUseTurnGate = shouldTrackRoundScopedResources(preparedCharacter.roundTracker);
        const alreadyUsedThisTurn =
          getFighterBattleMasterCombatSuperiorityUsedThisTurnForCharacter(preparedCharacter);
        const superiorityDiceRemaining =
          getFighterBattleMasterSuperiorityDiceRemainingForCharacter(preparedCharacter);

        if ((shouldUseTurnGate && alreadyUsedThisTurn) || superiorityDiceRemaining <= 0) {
          return currentCharacter;
        }

        let nextCharacter = expendFighterBattleMasterSuperiorityDieForCharacter(preparedCharacter);
        nextCharacter = shouldUseTurnGate
          ? markFighterBattleMasterCombatSuperiorityUsedForCharacter(nextCharacter)
          : nextCharacter;

        if (nextCharacter === preparedCharacter) {
          return currentCharacter;
        }

        return roundTrackerResource
          ? consumeRoundTrackerResourceForCharacter(nextCharacter, roundTrackerResource)
          : nextCharacter;
      });
      closeActionDrawer();
      return;
    }

    if (effectKind === "tactical-mind") {
      onPersistCharacter((currentCharacter) =>
        activateFeatureActionForCharacter(currentCharacter, action.key)
      );
      openDiceRoller({
        title: "Tactical Mind",
        formula: "1d10",
        formulaDisplay: "1d10",
        description: action.detail
      });
      closeActionDrawer();
      return;
    }

    if (action.key === darkOnesOwnLuckActionKey) {
      activateFeatureAction(action);
      openDiceRoller({
        title: action.name,
        formula: "1d10",
        formulaDisplay: "1d10",
        description: action.detail
      });
      closeActionDrawer();
      return;
    }

    if (action.key === hurlThroughHellActionKey) {
      activateFeatureAction(action);
      openDiceRoller({
        title: action.name,
        formula: "8d10",
        formulaDisplay: "8d10",
        description: action.detail
      });
      closeActionDrawer();
      return;
    }

    if (action.key === fortifyingSoulActionKey) {
      const shouldApplySelfResult = isFortifyingSoulIncludingSelfSelected === true;

      activateFortifyingSoulAction(action);
      rollFortifyingSoulHealing(action, { applySelfResult: shouldApplySelfResult });
      closeActionDrawer();
      return;
    }

    if (effectKind === "tireless") {
      const temporaryHitPointsFormula = getRangerTirelessTemporaryHitPointsFormula(character);
      const temporaryHitPointsFormulaDisplay =
        getRangerTirelessTemporaryHitPointsFormulaDisplay(character);

      onPersistCharacter((currentCharacter) => {
        const roundTrackerResource = getRoundTrackerResourceForEconomyType(action.economyType);
        const preparedCharacter = prepareCharacterForResourceConsumption(
          currentCharacter,
          roundTrackerResource
        );
        const nextCharacter = consumeRangerTirelessUseForCharacter(preparedCharacter);

        if (nextCharacter === preparedCharacter) {
          return currentCharacter;
        }

        return roundTrackerResource
          ? consumeRoundTrackerResourceForCharacter(nextCharacter, roundTrackerResource)
          : nextCharacter;
      });

      openDiceRoller({
        title: "Tireless",
        formula: temporaryHitPointsFormula,
        formulaDisplay: temporaryHitPointsFormulaDisplay,
        description: `${action.detail} Minimum 1 Temporary Hit Points.`,
        onResolvedResult: ({ result }) => {
          onPersistCharacter((currentCharacter) =>
            applyRolledTemporaryHitPointsToCharacter(currentCharacter, result.total, "Tireless")
          );
        }
      });

      closeActionDrawer();
      return;
    }

    if (action.key === monkShadowStepActionKey) {
      const useImprovedShadowStep =
        isImprovedShadowStepSelected &&
        selectedImprovedShadowStepState !== null &&
        !selectedImprovedShadowStepState.disabled;

      onPersistCharacter((currentCharacter) => {
        const roundTrackerResource = getRoundTrackerResourceForEconomyType(action.economyType);
        const preparedCharacter = prepareCharacterForResourceConsumption(
          currentCharacter,
          roundTrackerResource
        );
        const nextCharacter = activateFeatureActionForCharacter(preparedCharacter, action.key);
        const nextCharacterWithImprovedShadowStep = useImprovedShadowStep
          ? activateMonkWarriorOfShadowImprovedShadowStep(nextCharacter)
          : nextCharacter;
        const characterToUpdate =
          nextCharacterWithImprovedShadowStep === preparedCharacter &&
          action.consumesEconomyOnActivate
            ? preparedCharacter
            : nextCharacterWithImprovedShadowStep;

        if (characterToUpdate === preparedCharacter && !action.consumesEconomyOnActivate) {
          return currentCharacter;
        }

        if (useImprovedShadowStep && nextCharacterWithImprovedShadowStep === nextCharacter) {
          return currentCharacter;
        }

        return roundTrackerResource
          ? consumeRoundTrackerResourceForCharacter(characterToUpdate, roundTrackerResource)
          : characterToUpdate;
      });
      closeActionDrawer();
      return;
    }

    activateFeatureAction(action);
    if (action.key === sorcererTidesOfChaosActionKey) {
      dispatch(setNextRollModeOverride("advantage"));
    }
    closeActionDrawer();
  }

  function resolvePreparedWeaponAction(
    currentCharacter: Character,
    action: WeaponAction,
    economyTypeOverride?: EconomyType
  ) {
    const currentAction =
      getCharacterRuntime(currentCharacter).getWeaponCombatActionByKey(action.key)?.action ??
      action;
    const resolvedEconomyType = economyTypeOverride ?? currentAction.economyType;
    const roundTrackerResource = getRoundTrackerResourceForEconomyType(resolvedEconomyType);
    const preparedCharacter = prepareCharacterForResourceConsumption(
      currentCharacter,
      roundTrackerResource
    );
    const preparedActionBase =
      getCharacterRuntime(preparedCharacter).getWeaponCombatActionByKey(action.key)?.action ??
      currentAction;
    const preparedAction =
      preparedActionBase.economyType === resolvedEconomyType
        ? preparedActionBase
        : {
            ...preparedActionBase,
            economyType: resolvedEconomyType
          };

    return {
      preparedCharacter,
      preparedAction,
      roundTrackerResource
    };
  }

  function handleWeaponAttackRoll(action: WeaponAction, pathState?: WeaponAttackPathState) {
    const economyTypeOverride = pathState?.economyType;
    const sacredWeaponIsActive = selectedWeaponSacredWeaponState?.active === true;
    const vowOfEnmityIsActive = selectedWeaponVowOfEnmityState?.active === true;
    const useSacredWeapon =
      selectedWeaponSacredWeaponState !== null &&
      (sacredWeaponIsActive || (isSacredWeaponSelected && !selectedWeaponSacredWeaponToggleDisabled));
    const useVowOfEnmity =
      selectedWeaponVowOfEnmityState !== null &&
      (vowOfEnmityIsActive || (isVowOfEnmitySelected && !selectedWeaponVowOfEnmityToggleDisabled));
    const shouldActivateSacredWeapon =
      !sacredWeaponIsActive &&
      isSacredWeaponSelected &&
      selectedWeaponSacredWeaponState !== null &&
      !selectedWeaponSacredWeaponToggleDisabled;
    const shouldActivateVowOfEnmity =
      !vowOfEnmityIsActive &&
      isVowOfEnmitySelected &&
      selectedWeaponVowOfEnmityState !== null &&
      !selectedWeaponVowOfEnmityToggleDisabled;
    const useHuntersMarkTarget =
      isHuntersMarkTargetSelected &&
      selectedWeaponHuntersMarkTargetState !== null &&
      !selectedWeaponHuntersMarkTargetToggleDisabled;
    const useRecklessAttack =
      isRecklessAttackSelected &&
      selectedWeaponRecklessAttackState !== null &&
      !selectedWeaponRecklessAttackToggleDisabled;
    const useHordeBreaker =
      isHordeBreakerSelected &&
      selectedWeaponHordeBreakerState !== null &&
      !selectedWeaponHordeBreakerToggleDisabled;
    const shouldSpendHordeBreakerOnThisAttack =
      useHordeBreaker &&
      shouldTrackRoundScopedResources(character.roundTracker) &&
      economyTypeOverride !== ECONOMY_TYPE.BONUS_ACTION &&
      !isRoundTrackerResourceAvailable(character.roundTracker, "action") &&
      (character.classFeatureState?.ranger?.extraAttacksRemainingThisTurn ?? 0) <= 0;

    onPersistCharacter((currentCharacter) => {
      const { preparedCharacter, preparedAction, roundTrackerResource } =
        resolvePreparedWeaponAction(currentCharacter, action, economyTypeOverride);
      let effectivePreparedAction = preparedAction;

      if (useSacredWeapon) {
        effectivePreparedAction = applyPaladinOathOfDevotionSacredWeaponAction(
          currentCharacter,
          effectivePreparedAction
        );
      }

      if (useVowOfEnmity) {
        effectivePreparedAction =
          applyPaladinOathOfVengeanceVowOfEnmityAction(effectivePreparedAction);
      }

      if (useHuntersMarkTarget) {
        const huntersMarkState = getRangerHuntersMarkTargetWeaponOptionState(
          currentCharacter,
          effectivePreparedAction
        );

        if (huntersMarkState) {
          effectivePreparedAction = applyRangerHuntersMarkTargetWeaponAction(
            effectivePreparedAction,
            huntersMarkState
          );
        }
      }

      if (useRecklessAttack) {
        effectivePreparedAction =
          applyBarbarianRecklessAttackIndicatorToWeaponAction(effectivePreparedAction);
      }

      const attackFormula = getWeaponAttackFormulaPresentation(effectivePreparedAction).value;
      const attackRollMode = getRollModeFromIndicators(effectivePreparedAction.indicators);

      openDiceRoller({
        title: `${effectivePreparedAction.name} attack`,
        formula: attackFormula,
        formulaDisplay: attackFormula,
        description: `${effectivePreparedAction.name} attack roll`,
        mode: attackRollMode,
        enableNextCriticalHitOnNatural20: true
      });

      let nextCharacter = preparedCharacter;

      if (shouldActivateSacredWeapon) {
        nextCharacter = activatePaladinOathOfDevotionSacredWeapon(nextCharacter);
      }

      if (shouldActivateVowOfEnmity) {
        nextCharacter = activatePaladinOathOfVengeanceVowOfEnmity(nextCharacter);
      }

      if (useRecklessAttack) {
        nextCharacter = activateBarbarianRecklessAttack(nextCharacter);
      }

      const shouldSpendHordeBreaker =
        shouldSpendHordeBreakerOnThisAttack &&
        shouldTrackRoundScopedResources(currentCharacter.roundTracker) &&
        roundTrackerResource === "action" &&
        !isRoundTrackerResourceAvailable(currentCharacter.roundTracker, "action") &&
        (currentCharacter.classFeatureState?.ranger?.extraAttacksRemainingThisTurn ?? 0) <= 0;

      if (shouldSpendHordeBreaker) {
        nextCharacter = markRangerHunterHordeBreakerUsedForCharacter(nextCharacter);
      }

      return roundTrackerResource
        ? consumeWeaponAttackActionForCharacter(nextCharacter, {
            ...preparedAction,
            lightFollowUpKind: pathState?.usesLightFollowUp
              ? pathState.lightFollowUpKind
              : undefined
          })
        : nextCharacter;
    });

    setIsSacredWeaponSelected(false);
    setIsVowOfEnmitySelected(false);
    setIsRecklessAttackSelected(false);
  }

  function getWeaponDamageRollFormula(action: WeaponAction): string {
    const damageAbilityModifier = action.damageAbilityModifier ?? action.abilityModifier;
    const numericDamageBonusTotal = action.damageBonusEntries.reduce(
      (total, entry) => total + (entry.value ?? 0),
      0
    );

    return appendRollModifier(
      action.damageFormula,
      damageAbilityModifier + numericDamageBonusTotal
    );
  }

  function handleWeaponDamageRoll(action: WeaponAction) {
    const useDreadfulStrike =
      action.attackKind === "weapon" &&
      isDreadfulStrikeSelected &&
      selectedWeaponDreadAmbusherState !== null &&
      !selectedWeaponDreadfulStrikeToggleDisabled;
    const useFeyDreadfulStrikes =
      isDreadfulStrikeSelected &&
      selectedWeaponFeyDreadfulStrikesState !== null &&
      !selectedWeaponFeyDreadfulStrikesToggleDisabled;
    const useColossusSlayer =
      isColossusSlayerSelected &&
      selectedWeaponColossusSlayerState !== null &&
      !selectedWeaponColossusSlayerToggleDisabled;
    const usePolarStrikes =
      action.attackKind === "weapon" &&
      isPolarStrikesSelected &&
      selectedWeaponPolarStrikesState !== null &&
      !selectedWeaponPolarStrikesToggleDisabled;
    const useGoliathAncestryStrike =
      isGoliathAncestryStrikeSelected &&
      selectedWeaponGoliathAncestryState !== null &&
      !selectedWeaponGoliathAncestryToggleDisabled;
    const useHuntersMarkTarget =
      isHuntersMarkTargetSelected &&
      selectedWeaponHuntersMarkTargetState !== null &&
      !selectedWeaponHuntersMarkTargetToggleDisabled;
    const useEmpoweredStrikes =
      action.attackKind === "unarmed" &&
      isEmpoweredStrikesSelected &&
      selectedWeaponEmpoweredStrikesState !== null &&
      !selectedWeaponEmpoweredStrikesToggleDisabled;
    const useHandOfHarm =
      action.attackKind === "unarmed" &&
      isHandOfHarmSelected &&
      selectedWeaponHandOfHarmState !== null &&
      !selectedWeaponHandOfHarmToggleDisabled;
    const useQuiveringPalm =
      action.attackKind === "unarmed" &&
      isQuiveringPalmSelected &&
      selectedWeaponQuiveringPalmState !== null &&
      !selectedWeaponQuiveringPalmToggleDisabled;
    const useStunningStrike =
      isStunningStrikeSelected &&
      selectedWeaponStunningStrikeState !== null &&
      !selectedWeaponStunningStrikeToggleDisabled;
    const usePsionicStrike =
      action.attackKind === "weapon" &&
      isPsionicStrikeSelected &&
      selectedWeaponPsionicStrikeAvailable &&
      selectedWeaponPsionicStrikeFormula !== null;
    const useEldritchSmite =
      action.attackKind === "weapon" &&
      isEldritchSmiteSelected &&
      selectedWeaponEldritchSmiteState !== null &&
      !selectedWeaponEldritchSmiteState.disabled;
    const useLifedrinker =
      action.attackKind === "weapon" &&
      isLifedrinkerSelected &&
      selectedWeaponLifedrinkerState !== null &&
      !selectedWeaponLifedrinkerState.disabled;
    const useSacredWeapon =
      isSacredWeaponSelected &&
      selectedWeaponSacredWeaponState !== null &&
      !selectedWeaponSacredWeaponToggleDisabled;
    const useRecklessAttackDamage =
      selectedWeaponRecklessAttackState?.active === true &&
      !selectedWeaponRecklessAttackToggleDisabled;
    let effectiveAction = selectedWeaponEffectiveAction ?? action;

    if (
      useGoliathAncestryStrike &&
      selectedWeaponGoliathAncestryState?.damageBonus &&
      !effectiveAction.damageBonusEntries.some(
        (entry) => entry.label === selectedWeaponGoliathAncestryState.damageBonus?.label
      )
    ) {
      effectiveAction = applyWeaponDamageBonusPreview(
        effectiveAction,
        selectedWeaponGoliathAncestryState.damageBonus
      );
    }

    const damageAction = nextRollCriticalHitOverride
      ? applyCriticalHitToWeaponAction(effectiveAction)
      : effectiveAction;
    const damageFormula = getWeaponDamageRollFormula(damageAction);
    const damageFormulaDisplay = getWeaponDamageFormulaPresentation(damageAction).value;
    const shouldClearLightDamagePenalty = Boolean(
      damageAction.damageAbilityModifierSuppressionLabel
    );

    openDiceRoller({
      title: `${damageAction.name} damage`,
      formula: useLifedrinker ? undefined : damageFormula,
      formulaDisplay: useLifedrinker ? undefined : damageFormulaDisplay,
      entries: useLifedrinker
        ? [
            {
              label: "Damage",
              formula: damageFormula,
              formulaDisplay: damageFormulaDisplay
            },
            {
              label: "Lifedrinker Heal",
              formula: selectedWeaponLifedrinkerState.healFormula,
              formulaDisplay: selectedWeaponLifedrinkerState.healFormulaDisplay,
              minimumTotal: 1,
              minimumLabel: "Lifedrinker minimum"
            }
          ]
        : undefined,
      description: useLifedrinker
        ? `${damageAction.name} damage roll and Lifedrinker healing.`
        : `${damageAction.name} damage roll`,
      onResolvedResult:
        useLifedrinker || shouldClearLightDamagePenalty
          ? ({ results }) => {
              onPersistCharacter((currentCharacter) => {
                let nextCharacter = currentCharacter;

                if (useLifedrinker) {
                  const healingResult = results.find((entry) => entry.label === "Lifedrinker Heal");

                  if (healingResult) {
                    nextCharacter = applyRolledHealingToCharacter(
                      nextCharacter,
                      healingResult.result.total
                    );
                  }
                }

                if (shouldClearLightDamagePenalty) {
                  nextCharacter = {
                    ...nextCharacter,
                    roundTracker: clearLightWeaponDamagePenalty(
                      nextCharacter.roundTracker,
                      damageAction.key
                    )
                  };
                }

                return nextCharacter;
              });
            }
          : undefined
    });

    const hasDamageRollSideEffects =
      effectiveAction.damageBonusEntries.length > 0 ||
      useDreadfulStrike ||
      useFeyDreadfulStrikes ||
      useColossusSlayer ||
      usePolarStrikes ||
      useGoliathAncestryStrike ||
      useStunningStrike ||
      useEmpoweredStrikes ||
      usePsionicStrike ||
      useEldritchSmite ||
      useLifedrinker ||
      useHandOfHarm ||
      useQuiveringPalm;

    setIsDreadfulStrikeSelected(false);
    setIsColossusSlayerSelected(false);
    setIsPolarStrikesSelected(false);
    setIsGoliathAncestryStrikeSelected(false);
    setIsStunningStrikeSelected(false);
    setIsEmpoweredStrikesSelected(false);
    setIsHandOfHarmSelected(false);
    setIsQuiveringPalmSelected(false);
    setIsPsionicStrikeSelected(false);
    setIsEldritchSmiteSelected(false);
    setIsLifedrinkerSelected(false);

    onPersistCharacter((currentCharacter) => {
      let nextCharacter = currentCharacter;

      if (hasDamageRollSideEffects) {
        nextCharacter = effectiveAction.damageBonusEntries.reduce(
          (updatedCharacter, entry) =>
            entry.label === huntersMarkWeaponDamageBonusLabel
              ? updatedCharacter
              : markFeatureWeaponBonusUseForCharacter(updatedCharacter, entry.label),
          nextCharacter
        );

        if (usePsionicStrike) {
          nextCharacter = consumeFighterPsiWarriorPsionicStrikeForCharacter(nextCharacter);
        }

        if (useEldritchSmite) {
          nextCharacter = consumeWarlockEldritchSmitePactMagicSlotForCharacter(nextCharacter);
        }

        if (useLifedrinker) {
          nextCharacter = consumeWarlockLifedrinkerHitDieForCharacter(nextCharacter);
        }

        if (useDreadfulStrike) {
          nextCharacter = consumeRangerGloomStalkerDreadAmbusherUseForCharacter(nextCharacter);
        }

        if (usePolarStrikes) {
          nextCharacter = consumeRangerWinterWalkerPolarStrikesUseForCharacter(nextCharacter);
        }

        if (useGoliathAncestryStrike) {
          nextCharacter = consumeGoliathGiantAncestryUseForCharacter(nextCharacter);
        }

        if (useQuiveringPalm) {
          nextCharacter = activateMonkWarriorOfTheOpenHandQuiveringPalmMark(nextCharacter);
        }

        if (useStunningStrike) {
          nextCharacter = consumeMonkStunningStrike(nextCharacter);
        }
      }

      nextCharacter = consumeTrueStrikePendingAttackForCharacter(nextCharacter, damageAction);

      const nextCharacterWithInvisibleConditionsRemoved =
        removeInvisibleConditionFromCharacter(nextCharacter);

      return shouldTrackRoundScopedResources(
        nextCharacterWithInvisibleConditionsRemoved.roundTracker
      )
        ? nextCharacterWithInvisibleConditionsRemoved
        : clearRoundScopedFeatureStateForCharacter(nextCharacterWithInvisibleConditionsRemoved);
    });
  }

  const submissions = useActionsWidgetSubmissions({
    ...context,
    closeActionDrawer,
    prepareCharacterForResourceConsumption,
    activateFeatureAction
  });
  const { rollFortifyingSoulHealing } = submissions;

  return {
    closeActionDrawer,
    openWeaponDetailReference,
    prepareCharacterForResourceConsumption,
    activateFeatureAction,
    executeCommonAction,
    executeMonkHandOfHealingPath,
    executeMonkFlurryOfBlowsAction,
    submitMonkWholenessOfBody,
    submitMonkPatientDefense,
    executeFeatureActivate,
    resolvePreparedWeaponAction,
    handleWeaponAttackRoll,
    handleWeaponDamageRoll,
    ...submissions
  };
}
