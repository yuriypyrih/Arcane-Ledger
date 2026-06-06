/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
// @ts-nocheck
import clsx from "clsx";
import CellContainer from "../../../../../CellContainer/CellContainer";
import { useDiceRollerPopup } from "../../../../../DicePage/DiceRollerPopup";
import { captureAppError } from "../../../../../../lib/sentry";
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
  consumeWarlockGiftOfTheDepthsUseForCharacter,
  expendChannelDivinityUseForCharacter,
  consumeFighterPsiWarriorPsionicStrikeForCharacter,
  consumeMysticArcanumUseForCharacter,
  consumeRangerGloomStalkerDreadAmbusherUseForCharacter,
  consumeRangerWinterWalkerFrozenHauntUseForCharacter,
  consumeRangerWinterWalkerPolarStrikesUseForCharacter,
  createSpellSlotFromSorceryPointsForCharacter,
  consumeFaithfulSteedUseForCharacter,
  consumePaladinsSmiteUseForCharacter,
  consumeArtificerConjuredCauldronUseForCharacter,
  consumeArtificerIlluminatedCartographyUseForCharacter,
  consumeArtificerRestorativeReagentsUseForCharacter,
  consumeArtificerUnerringPathUseForCharacter,
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
import { applyFeatSpellCastEffectsForCharacter } from "../../../../../../pages/CharactersPage/feats/runtime";
import { bardicInspirationActionKey } from "../../../../../../pages/CharactersPage/classFeatures/bard/bard";
import {
  createChargesCardUsage,
  createFeatureActionCardCost,
  createNamedUsageHeaderTags,
  createNamedResourceCardUsage
} from "../../../../../../pages/CharactersPage/classFeatures/cardUsage";
import {
  activateAasimarCelestialRevelationForCharacter,
  activateDragonbornDraconicFlightForCharacter,
  activateDwarfStonecunningForCharacter,
  activateGoliathLargeFormForCharacter,
  consumeGoliathGiantAncestryUseForCharacter,
  getAasimarHealingHandsFormula,
  getDragonbornBreathWeaponDamageFormula,
  getDragonbornBreathWeaponDamageTypeLabelForCharacter,
  getGoliathStoneEnduranceDamageReductionFormula,
  getGoliathStoneEnduranceDamageReductionFormulaDisplay,
  getGoliathStormThunderDamageFormula,
  spendAasimarHealingHandsForCharacter,
  spendDragonbornBreathWeaponForCharacter
} from "../../../../../../pages/CharactersPage/species";
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
import { isWarlockInvocationSpellEffectKind } from "../../../../../../pages/CharactersPage/classFeatures/warlock/warlockInvocationSpellActions";
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
  applyFalseLifeTemporaryHitPointsToCharacter,
  applySpellImplementationForCharacter,
  falseLifeSpellId,
  fiendishVigorTemporaryHitPointsSource,
  getFalseLifeTemporaryHitPointsFormula,
  getFalseLifeTemporaryHitPointsFormulaDisplay,
  getFalseLifeTemporaryHitPointsFromRoll,
  mageArmorCastOnSelfOptionId,
  type SpellImplementationOptionValues
} from "../../../../../../pages/CharactersPage/characterRuntime/spellImplementations";
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
import { useActionsWidgetActions } from "./useActionsWidgetActions";
import { useActionResourceOptionModel } from "./useActionResourceOptionModel";
import { useSelectedActionModel } from "./useSelectedActionModel";
import { useSelectedWeaponActionModel } from "./useSelectedWeaponActionModel";
import ActionsGrid from "./ActionsGrid";
import FeatureSpellDrawers from "./FeatureSpellDrawers";
import WildShapePreviewDrawer from "./WildShapePreviewDrawer";
import { useArtificerActionSubmissions } from "./useArtificerActionSubmissions";

type ActionsWidgetSubmissionContext = Record<string, any>;

export function useActionsWidgetSubmissions(context: ActionsWidgetSubmissionContext) {
  const { ...values } = context;
  Object.assign(globalThis as Record<string, unknown>, {});
  const {
    character,
    onPersistCharacter,
    dispatch,
    openDiceRoller,
    closeActionDrawer,
    prepareCharacterForResourceConsumption,
    activateFeatureAction,
    setSelectedActionOptionKeys,
    setSelectedChannelDivinityOptionKey,
    setSelectedDivineInterventionSpell,
    setSelectedMysticArcanumSpell,
    setSelectedMysticArcanumSpellLevel,
    setSelectedFrozenHauntFallbackSlotLevel,
    setSelectedFixedSpellSlotLevel,
    setUseBeguilingMagicOnActionSpell,
    setUseElementalSmiteOnActionSpell,
    setSelectedElementalSmiteOptionOnActionSpell,
    setUseFrozenHauntOnActionSpell,
    setIsFixedSpellDrawerOpen,
    setIsDiceRollerSettingsOpen,
    selectedAction,
    selectedFeatureAction,
    selectedDrawerOptions,
    selectedActionOptionKeys,
    selectedChannelDivinityRow,
    selectedAasimarCelestialRevelationOptionKey,
    selectedAasimarHealingHandsTarget,
    selectedLayOnHandsTarget,
    selectedLayOnHandsTotalCost,
    selectedHealingLightTarget,
    selectedSpellfireBurstTarget,
    selectedThirdEyeOptionKey,
    selectedBlessingOfTheTricksterTarget,
    selectedWildShapeMonsterSlug,
    selectedStarryFormConstellation,
    selectedWildCompanionResource,
    selectedWildCompanionSpellSlotRemaining,
    selectedWildCompanionSpellSlotLevel,
    selectedNatureMagicianOption,
    selectedWildResurgenceMode,
    selectedWildResurgenceSpellSlotLevel,
    selectedRageOptions,
    selectedRagePowerOptions,
    selectedRageOptionKey,
    selectedRagePowerOptionKey,
    selectedFontOfMagicSelection,
    selectedDivineInterventionSpell,
    selectedMysticArcanumSpell,
    selectedMysticArcanumSpellLevel,
    fixedSpellHuntersRimeTemporaryHitPointsFormula,
    fixedSpellHuntersRimeTemporaryHitPointsFormulaDisplay,
    fixedSpellExecute,
    fixedSpellEntry,
    fixedSpellMinimumActionSlotLevel,
    fixedSpellFreeCastSlotLevel,
    fixedSpellActionPaths,
    fixedSpellConsumesSpellSlot,
    fixedSpellSlotsRemaining,
    selectedActionSpellSupportsElementalSmite,
    selectedActionSpellElementalSmiteDisabled,
    selectedActionSpellFrozenHauntOptionState,
    selectedActionSpellGoliathAncestryState,
    selectedActionSpellFrozenHauntFallbackSlotLevelIsValid,
    selectedFixedSpellSlotLevel,
    channelDivinityUsesRemaining,
    wildShapeUsesRemaining,
    isRageOfTheGodsSelected,
    isGroupRecoverySelected,
    isInspiredEclipseSelected,
    isCrownOfSpellfireSelected,
    useBeguilingMagicOnActionSpell,
    useElementalSmiteOnActionSpell,
    selectedElementalSmiteOptionOnActionSpell,
    useFrozenHauntOnActionSpell,
    selectedFrozenHauntFallbackSlotLevel,
    frozenHauntFallbackSpellSlotMinimumLevel
  } = context;

  const {
    isArcaneFirearmSubmitting,
    isArtificerMagicItemTinkerSubmitting,
    isEldritchCannonSubmitting,
    isExperimentalElixirSubmitting,
    isReplicateMagicItemSubmitting,
    isSteelDefenderSubmitting,
    isTinkersMagicSubmitting,
    submitArtificerArcaneFirearm,
    submitArtificerChargeMagicItem,
    submitArtificerDrainMagicItem,
    submitArtificerEldritchCannon,
    submitArtificerExperimentalElixir,
    submitArtificerReplicateMagicItem,
    submitArtificerSteelDefender,
    submitArtificerTinkersMagic,
    submitArtificerTransmuteMagicItem
  } = useArtificerActionSubmissions({
    selectedAction,
    selectedFeatureAction,
    onPersistCharacter,
    closeActionDrawer,
    prepareCharacterForResourceConsumption
  });

  function toggleFeatureOptionSelection(option: FeatureActionOptionCard) {
    if (
      !selectedAction ||
      selectedAction.kind !== "feature" ||
      selectedAction.drawer.kind !== "options"
    ) {
      return;
    }

    if (option.disabled) {
      return;
    }

    const selection = selectedAction.drawer.selection;
    const selectionLimit =
      selection === "multi-confirm"
        ? (selectedAction.drawer.selectionLimit ?? selectedAction.drawer.options.length)
        : 1;

    setSelectedActionOptionKeys((currentKeys) => {
      if (selection === "multi-confirm") {
        if (currentKeys.includes(option.key)) {
          return currentKeys.filter((entry) => entry !== option.key);
        }

        if (currentKeys.length >= selectionLimit) {
          return currentKeys;
        }

        return [...currentKeys, option.key];
      }

      return currentKeys.length === 1 && currentKeys[0] === option.key ? [] : [option.key];
    });
  }

  function handleFeatureOptionExecute(action: FeatureActionCard, option: FeatureActionOptionCard) {
    onPersistCharacter((currentCharacter) => {
      const roundTrackerResource = getRoundTrackerResourceForEconomyType(option.economyType);
      const preparedCharacter = prepareCharacterForResourceConsumption(
        currentCharacter,
        roundTrackerResource
      );
      const nextCharacter = activateFeatureActionOptionForCharacter(
        preparedCharacter,
        action.key,
        option.key
      );

      if (nextCharacter === preparedCharacter) {
        return currentCharacter;
      }

      if (option.economyType === "action" && option.actionCategory !== "magic") {
        return consumeNonMagicActionForCharacter(nextCharacter, option);
      }

      return roundTrackerResource
        ? consumeRoundTrackerResourceForCharacter(nextCharacter, roundTrackerResource)
        : nextCharacter;
    });

    if (option.rollFormula) {
      openDiceRoller({
        title: option.name,
        formula: option.rollFormula,
        formulaDisplay: option.rollFormulaDisplay,
        description: option.rollDescription ?? option.detail
      });
    }

    closeActionDrawer();
  }

  function activateSelectedChannelDivinity(row: ChannelDivinityOptionRow) {
    onPersistCharacter((currentCharacter) => {
      const roundTrackerResource = getRoundTrackerResourceForEconomyType(row.option.economyType);
      const preparedCharacter = prepareCharacterForResourceConsumption(
        currentCharacter,
        roundTrackerResource
      );
      const nextCharacter = activateFeatureActionOptionForCharacter(
        preparedCharacter,
        row.action.key,
        row.option.key
      );

      if (nextCharacter === preparedCharacter) {
        return currentCharacter;
      }

      return roundTrackerResource
        ? consumeRoundTrackerResourceForCharacter(nextCharacter, roundTrackerResource)
        : nextCharacter;
    });

    closeActionDrawer();
  }

  function confirmSelectedFeatureOptions() {
    if (
      !selectedFeatureAction ||
      !selectedAction ||
      selectedAction.kind !== "feature" ||
      selectedAction.drawer.kind !== "options" ||
      selectedActionOptionKeys.length <= 0
    ) {
      return;
    }

    if (selectedAction.drawer.selection === "multi-confirm") {
      onPersistCharacter((currentCharacter) => {
        const roundTrackerResource = getRoundTrackerResourceForEconomyType(
          selectedFeatureAction.economyType
        );
        const preparedCharacter = prepareCharacterForResourceConsumption(
          currentCharacter,
          roundTrackerResource
        );
        const nextCharacter = activateFeatureActionOptionsForCharacter(
          preparedCharacter,
          selectedFeatureAction.key,
          selectedActionOptionKeys
        );

        if (nextCharacter === preparedCharacter) {
          return currentCharacter;
        }

        if (
          selectedFeatureAction.economyType === "action" &&
          selectedFeatureAction.actionCategory !== "magic"
        ) {
          return consumeNonMagicActionForCharacter(nextCharacter, selectedFeatureAction);
        }

        return roundTrackerResource
          ? consumeRoundTrackerResourceForCharacter(nextCharacter, roundTrackerResource)
          : nextCharacter;
      });

      closeActionDrawer();
      return;
    }

    const selectedOption = selectedDrawerOptions.find(
      (option) => option.key === selectedActionOptionKeys[0]
    );

    if (!selectedOption) {
      return;
    }

    handleFeatureOptionExecute(selectedFeatureAction, selectedOption);
  }

  function submitLayOnHands(options: {
    target: "self" | "other";
    poolSpendAmount: number;
    conditions: LayOnHandsCondition[];
  }) {
    if (!selectedFeatureAction) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      const roundTrackerResource = getRoundTrackerResourceForEconomyType(
        selectedFeatureAction.economyType
      );
      const preparedCharacter = prepareCharacterForResourceConsumption(
        currentCharacter,
        roundTrackerResource
      );
      const nextCharacter = applyLayOnHandsForCharacter(currentCharacter, options);
      const nextPreparedCharacter =
        preparedCharacter === currentCharacter
          ? nextCharacter
          : applyLayOnHandsForCharacter(preparedCharacter, options);

      if (nextPreparedCharacter === preparedCharacter) {
        return currentCharacter;
      }

      return roundTrackerResource
        ? consumeRoundTrackerResourceForCharacter(nextPreparedCharacter, roundTrackerResource)
        : nextPreparedCharacter;
    });

    closeActionDrawer();
  }

  function submitWarriorOfTheGods(chargeCount: number) {
    if (!selectedFeatureAction || chargeCount <= 0) {
      return;
    }

    const healingFormula = `${chargeCount}d12`;
    const chargeLabel = chargeCount === 1 ? "charge" : "charges";

    onPersistCharacter((currentCharacter) => {
      const roundTrackerResource = getRoundTrackerResourceForEconomyType(
        selectedFeatureAction.economyType
      );
      const preparedCharacter = prepareCharacterForResourceConsumption(
        currentCharacter,
        roundTrackerResource
      );
      const nextCharacter = consumeBarbarianWarriorOfTheGodsChargesForCharacter(
        preparedCharacter,
        chargeCount
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
      description: `${selectedFeatureAction.detail} ${chargeCount} ${chargeLabel} expended.`,
      onResolvedResult: ({ result }) => {
        onPersistCharacter((currentCharacter) =>
          applyRolledHealingToCharacter(currentCharacter, result.total)
        );
      }
    });

    closeActionDrawer();
  }

  function submitIndomitable(option: IndomitableOption) {
    if (!selectedFeatureAction) {
      return;
    }

    onPersistCharacter((currentCharacter) =>
      activateFeatureActionForCharacter(currentCharacter, selectedFeatureAction.key)
    );

    openDiceRoller({
      title: `Indomitable (${option.ability} Save)`,
      formula: option.formula,
      formulaDisplay: option.formulaDisplay,
      description: selectedFeatureAction.detail
    });

    closeActionDrawer();
  }

  function submitHealingLight(diceCount: number, target: HealingLightTarget) {
    if (!selectedFeatureAction || diceCount <= 0) {
      return;
    }

    const healingFormula = `${diceCount}d6`;
    const dieLabel = diceCount === 1 ? "Healing d6" : "Healing d6s";

    onPersistCharacter((currentCharacter) => {
      const roundTrackerResource = getRoundTrackerResourceForEconomyType(
        selectedFeatureAction.economyType
      );
      const preparedCharacter = prepareCharacterForResourceConsumption(
        currentCharacter,
        roundTrackerResource
      );
      const nextCharacter = spendWarlockHealingLightDiceForCharacter(preparedCharacter, diceCount);

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
      description: `${selectedFeatureAction.detail} ${diceCount} ${dieLabel} expended.`,
      onResolvedResult:
        target === "self"
          ? ({ result }) => {
              onPersistCharacter((currentCharacter) =>
                applyRolledHealingToCharacter(currentCharacter, result.total)
              );
            }
          : undefined
    });

    closeActionDrawer();
  }

  function submitAasimarHealingHands() {
    if (!selectedFeatureAction) {
      return;
    }

    const healingFormula = getAasimarHealingHandsFormula(character);

    onPersistCharacter((currentCharacter) => {
      const roundTrackerResource = getRoundTrackerResourceForEconomyType(
        selectedFeatureAction.economyType
      );
      const preparedCharacter = prepareCharacterForResourceConsumption(
        currentCharacter,
        roundTrackerResource
      );
      const nextCharacter = spendAasimarHealingHandsForCharacter(preparedCharacter);

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
      getFullManualToastText: ({ result }) => `Rolled ${result.total} Healing Hands healing.`,
      onResolvedResult:
        selectedAasimarHealingHandsTarget === "self"
          ? ({ result }) => {
              onPersistCharacter((currentCharacter) =>
                applyRolledHealingToCharacter(currentCharacter, result.total)
              );
            }
          : undefined
    });

    closeActionDrawer();
  }

  function submitAasimarCelestialRevelation() {
    if (!selectedFeatureAction || !selectedAasimarCelestialRevelationOptionKey) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      const roundTrackerResource = getRoundTrackerResourceForEconomyType(
        selectedFeatureAction.economyType
      );
      const preparedCharacter = prepareCharacterForResourceConsumption(
        currentCharacter,
        roundTrackerResource
      );
      const nextCharacter = activateAasimarCelestialRevelationForCharacter(
        preparedCharacter,
        selectedAasimarCelestialRevelationOptionKey
      );

      if (nextCharacter === preparedCharacter) {
        return currentCharacter;
      }

      return roundTrackerResource
        ? consumeRoundTrackerResourceForCharacter(nextCharacter, roundTrackerResource)
        : nextCharacter;
    });

    closeActionDrawer();
  }

  function submitDragonbornBreathWeapon() {
    if (!selectedFeatureAction) {
      return;
    }

    const damageFormula = getDragonbornBreathWeaponDamageFormula(character);
    const damageTypeLabel =
      getDragonbornBreathWeaponDamageTypeLabelForCharacter(character) ?? "Draconic Ancestry";

    onPersistCharacter((currentCharacter) => {
      const roundTrackerResource = getRoundTrackerResourceForEconomyType(
        selectedFeatureAction.economyType
      );
      const preparedCharacter = prepareCharacterForResourceConsumption(
        currentCharacter,
        roundTrackerResource
      );
      const nextCharacter = spendDragonbornBreathWeaponForCharacter(preparedCharacter);

      if (nextCharacter === preparedCharacter) {
        return currentCharacter;
      }

      return roundTrackerResource
        ? consumeRoundTrackerResourceForCharacter(nextCharacter, roundTrackerResource)
        : nextCharacter;
    });

    openDiceRoller({
      title: selectedFeatureAction.name,
      formula: damageFormula,
      formulaDisplay: damageFormula,
      description: `${selectedFeatureAction.detail} Damage type: ${damageTypeLabel}.`,
      getFullManualToastText: ({ result }) =>
        `Rolled ${result.total} ${damageTypeLabel} Breath Weapon damage.`
    });

    closeActionDrawer();
  }

  function submitDragonbornDraconicFlight() {
    if (!selectedFeatureAction) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      const roundTrackerResource = getRoundTrackerResourceForEconomyType(
        selectedFeatureAction.economyType
      );
      const preparedCharacter = prepareCharacterForResourceConsumption(
        currentCharacter,
        roundTrackerResource
      );
      const nextCharacter = activateDragonbornDraconicFlightForCharacter(preparedCharacter);

      if (nextCharacter === preparedCharacter) {
        return currentCharacter;
      }

      return roundTrackerResource
        ? consumeRoundTrackerResourceForCharacter(nextCharacter, roundTrackerResource)
        : nextCharacter;
    });

    closeActionDrawer();
  }

  function submitDwarfStonecunning() {
    if (!selectedFeatureAction) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      const roundTrackerResource = getRoundTrackerResourceForEconomyType(
        selectedFeatureAction.economyType
      );
      const preparedCharacter = prepareCharacterForResourceConsumption(
        currentCharacter,
        roundTrackerResource
      );
      const nextCharacter = activateDwarfStonecunningForCharacter(preparedCharacter);

      if (nextCharacter === preparedCharacter) {
        return currentCharacter;
      }

      return roundTrackerResource
        ? consumeRoundTrackerResourceForCharacter(nextCharacter, roundTrackerResource)
        : nextCharacter;
    });

    closeActionDrawer();
  }

  function submitGoliathCloudsJaunt() {
    if (!selectedFeatureAction) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      const roundTrackerResource = getRoundTrackerResourceForEconomyType(
        selectedFeatureAction.economyType
      );
      const preparedCharacter = prepareCharacterForResourceConsumption(
        currentCharacter,
        roundTrackerResource
      );
      const nextCharacter = consumeGoliathGiantAncestryUseForCharacter(preparedCharacter);

      if (nextCharacter === preparedCharacter) {
        return currentCharacter;
      }

      return roundTrackerResource
        ? consumeRoundTrackerResourceForCharacter(nextCharacter, roundTrackerResource)
        : nextCharacter;
    });

    closeActionDrawer();
  }

  function submitGoliathLargeForm() {
    if (!selectedFeatureAction) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      const roundTrackerResource = getRoundTrackerResourceForEconomyType(
        selectedFeatureAction.economyType
      );
      const preparedCharacter = prepareCharacterForResourceConsumption(
        currentCharacter,
        roundTrackerResource
      );
      const nextCharacter = activateGoliathLargeFormForCharacter(preparedCharacter);

      if (nextCharacter === preparedCharacter) {
        return currentCharacter;
      }

      return roundTrackerResource
        ? consumeRoundTrackerResourceForCharacter(nextCharacter, roundTrackerResource)
        : nextCharacter;
    });

    closeActionDrawer();
  }

  function submitGoliathStonesEndurance() {
    if (!selectedFeatureAction) {
      return;
    }

    const damageReductionFormula = getGoliathStoneEnduranceDamageReductionFormula(character);
    const damageReductionFormulaDisplay =
      getGoliathStoneEnduranceDamageReductionFormulaDisplay(character);

    onPersistCharacter((currentCharacter) => {
      const roundTrackerResource = getRoundTrackerResourceForEconomyType(
        selectedFeatureAction.economyType
      );
      const preparedCharacter = prepareCharacterForResourceConsumption(
        currentCharacter,
        roundTrackerResource
      );
      const nextCharacter = consumeGoliathGiantAncestryUseForCharacter(preparedCharacter);

      if (nextCharacter === preparedCharacter) {
        return currentCharacter;
      }

      return roundTrackerResource
        ? consumeRoundTrackerResourceForCharacter(nextCharacter, roundTrackerResource)
        : nextCharacter;
    });

    openDiceRoller({
      title: selectedFeatureAction.name,
      formula: damageReductionFormula,
      formulaDisplay: damageReductionFormulaDisplay,
      description: "Stone's Endurance damage reduction roll.",
      getFullManualToastText: ({ result }) =>
        `Reduced incoming damage by ${result.total} with Stone's Endurance.`
    });

    closeActionDrawer();
  }

  function submitGoliathStormsThunder() {
    if (!selectedFeatureAction) {
      return;
    }

    const damageFormula = getGoliathStormThunderDamageFormula();

    onPersistCharacter((currentCharacter) => {
      const roundTrackerResource = getRoundTrackerResourceForEconomyType(
        selectedFeatureAction.economyType
      );
      const preparedCharacter = prepareCharacterForResourceConsumption(
        currentCharacter,
        roundTrackerResource
      );
      const nextCharacter = consumeGoliathGiantAncestryUseForCharacter(preparedCharacter);

      if (nextCharacter === preparedCharacter) {
        return currentCharacter;
      }

      return roundTrackerResource
        ? consumeRoundTrackerResourceForCharacter(nextCharacter, roundTrackerResource)
        : nextCharacter;
    });

    openDiceRoller({
      title: selectedFeatureAction.name,
      formula: damageFormula,
      formulaDisplay: "1d8 Thunder",
      description: "Storm's Thunder damage roll.",
      getFullManualToastText: ({ result }) =>
        `Rolled ${result.total} Thunder damage for Storm's Thunder.`
    });

    closeActionDrawer();
  }

  function submitMonkElementalBurst() {
    if (!selectedFeatureAction) {
      return;
    }

    const damageFormula = getMonkWarriorOfTheElementsElementalBurstDamageFormula(character);

    if (!damageFormula) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      const roundTrackerResource = getRoundTrackerResourceForEconomyType(
        selectedFeatureAction.economyType
      );
      const preparedCharacter = prepareCharacterForResourceConsumption(
        currentCharacter,
        roundTrackerResource
      );
      const nextCharacter = activateFeatureActionForCharacter(
        preparedCharacter,
        selectedFeatureAction.key
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
      formula: damageFormula,
      formulaDisplay: damageFormula,
      description: selectedFeatureAction.detail
    });

    closeActionDrawer();
  }

  function submitSorcererWarpingImplosion() {
    if (!selectedFeatureAction) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      const roundTrackerResource = getRoundTrackerResourceForEconomyType(
        selectedFeatureAction.economyType
      );
      const preparedCharacter = prepareCharacterForResourceConsumption(
        currentCharacter,
        roundTrackerResource
      );
      const nextCharacter = activateFeatureActionForCharacter(
        preparedCharacter,
        selectedFeatureAction.key
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
      formula: sorcererWarpingImplosionDamageFormula,
      formulaDisplay: sorcererWarpingImplosionDamageFormulaDisplay,
      description: "3~30 Damage = 3d10 Force"
    });

    closeActionDrawer();
  }

  function submitSorcererSpellfireBurst(effect: SpellfireBurstEffect) {
    if (!selectedFeatureAction || selectedFeatureAction.key !== sorcererSpellfireBurstActionKey) {
      return;
    }

    const formula =
      effect === "bolstering-flames"
        ? getSorcererSpellfireBurstBolsteringFlamesRollFormula(character)
        : getSorcererSpellfireBurstRadiantFireRollFormula(character);
    const title = effect === "bolstering-flames" ? "Bolstering Flames" : "Radiant Fire";

    onPersistCharacter((currentCharacter) => {
      const nextCharacter = activateFeatureActionForCharacter(
        currentCharacter,
        selectedFeatureAction.key
      );

      return nextCharacter === currentCharacter ? currentCharacter : nextCharacter;
    });

    openDiceRoller({
      title,
      formula: formula.formula,
      formulaDisplay: formula.formulaDisplay,
      description: formula.fact.value,
      onResolvedResult:
        effect === "bolstering-flames" && selectedSpellfireBurstTarget === "self"
          ? ({ result }) => {
              onPersistCharacter((currentCharacter) =>
                applyRolledTemporaryHitPointsToCharacter(
                  currentCharacter,
                  result.total,
                  "Bolstering Flames"
                )
              );
            }
          : undefined
    });

    closeActionDrawer();
  }

  function submitSorcererWildMagicSurge() {
    if (!selectedFeatureAction || selectedFeatureAction.key !== sorcererWildMagicSurgeActionKey) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      const nextCharacter = activateFeatureActionForCharacter(
        currentCharacter,
        selectedFeatureAction.key
      );

      return nextCharacter === currentCharacter ? currentCharacter : nextCharacter;
    });

    const hasControlledChaos = hasSorcererControlledChaosFeatureForCharacter(character);

    openDiceRoller(
      hasControlledChaos
        ? {
            title: selectedFeatureAction.name,
            description: "Roll twice on the Wild Magic Surge table and use either number.",
            entries: [
              {
                label: "First Roll",
                formula: "1d100",
                formulaDisplay: "1d100"
              },
              {
                label: "Second Roll",
                formula: "1d100",
                formulaDisplay: "1d100"
              }
            ]
          }
        : {
            title: selectedFeatureAction.name,
            formula: "1d100",
            formulaDisplay: "1d100",
            description: "Roll on the Wild Magic Surge table."
          }
    );
  }

  function submitSneakAttack({ effectKeys, useRendMind }: SneakAttackActionSelection) {
    if (!selectedFeatureAction) {
      return;
    }

    const sneakAttackFormula = getRogueSneakAttackFormula(character, effectKeys);

    if (!sneakAttackFormula) {
      return;
    }

    const sneakAttackFormulaDisplay =
      getRogueSneakAttackFormulaDisplay(character, effectKeys) ?? sneakAttackFormula;

    const selectedEffects = getRogueSneakAttackEffectDefinitions(character).filter((effect) =>
      effectKeys.includes(effect.key)
    );
    const hasRendMind = hasRogueSoulknifeRendMindFeature(character);
    const canUseRendMind =
      useRendMind &&
      hasRendMind &&
      (getRogueSoulknifeRendMindUsesRemaining(character) > 0 ||
        getRogueSoulknifePsionicDiceRemaining(character) > 0);
    const rendMindSaveDc = getRogueSoulknifeRendMindSavingThrowDc(character);
    const baseDescription = selectedFeatureAction.detail.endsWith(".")
      ? selectedFeatureAction.detail
      : `${selectedFeatureAction.detail}.`;
    const description = [
      baseDescription,
      selectedEffects.length > 0
        ? `Cunning Strike: ${selectedEffects.map((effect) => effect.name).join(", ")}.`
        : null,
      canUseRendMind && rendMindSaveDc !== null
        ? `Rend Mind: Wisdom save DC ${rendMindSaveDc} or Stunned for 1 minute.`
        : null
    ]
      .filter((entry): entry is string => Boolean(entry))
      .join(" ");

    onPersistCharacter((currentCharacter) => {
      const activatedCharacter = activateFeatureActionForCharacter(
        currentCharacter,
        selectedFeatureAction.key
      );

      if (activatedCharacter === currentCharacter) {
        return currentCharacter;
      }

      return canUseRendMind
        ? consumeRogueSoulknifeRendMindUse(activatedCharacter)
        : activatedCharacter;
    });

    openDiceRoller({
      title: "Sneak Attack",
      formula: sneakAttackFormula,
      formulaDisplay: sneakAttackFormulaDisplay,
      description
    });

    closeActionDrawer();
  }

  function submitRogueSoulknifePsionicDieRollAction(action: FeatureActionCard) {
    const rollFormula =
      action.key === rogueSoulknifePsychicWhispersActionKey
        ? getRogueSoulknifePsychicWhispersRollFormula(character)
        : getRogueSoulknifePsychicTeleportationRollFormula(character);
    const rollFormulaDisplay =
      action.key === rogueSoulknifePsychicWhispersActionKey
        ? getRogueSoulknifePsychicWhispersRollFormulaDisplay(character)
        : getRogueSoulknifePsychicTeleportationRollFormulaDisplay(character);

    if (!rollFormula) {
      return;
    }

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

      return roundTrackerResource
        ? consumeRoundTrackerResourceForCharacter(nextCharacter, roundTrackerResource)
        : nextCharacter;
    });

    openDiceRoller({
      title: action.name,
      formula: rollFormula,
      formulaDisplay: rollFormulaDisplay ?? rollFormula,
      description: action.detail
    });

    closeActionDrawer();
  }

  function submitArcaneRecovery(selection: ArcaneRecoverySelection) {
    onPersistCharacter((currentCharacter) =>
      activateArcaneRecoveryForCharacter(currentCharacter, selection)
    );
    closeActionDrawer();
  }

  function submitPortent(portentRolls: CharacterWizardPortentRoll[]) {
    onPersistCharacter((currentCharacter) =>
      setWizardDivinerPortentRolls(currentCharacter, portentRolls)
    );
    closeActionDrawer();
  }

  function submitThirdEye() {
    if (!selectedFeatureAction || !selectedThirdEyeOptionKey) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      const roundTrackerResource = getRoundTrackerResourceForEconomyType(
        selectedFeatureAction.economyType
      );
      const preparedCharacter = prepareCharacterForResourceConsumption(
        currentCharacter,
        roundTrackerResource
      );
      const nextCharacter = activateWizardDivinerThirdEye(
        preparedCharacter,
        selectedThirdEyeOptionKey
      );

      if (nextCharacter === preparedCharacter) {
        return currentCharacter;
      }

      return roundTrackerResource
        ? consumeRoundTrackerResourceForCharacter(nextCharacter, roundTrackerResource)
        : nextCharacter;
    });
    closeActionDrawer();
  }

  function submitBlessingOfTheTrickster() {
    if (!selectedFeatureAction) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      const roundTrackerResource = getRoundTrackerResourceForEconomyType(
        selectedFeatureAction.economyType
      );
      const preparedCharacter = prepareCharacterForResourceConsumption(
        currentCharacter,
        roundTrackerResource
      );
      const nextCharacter = activateClericBlessingOfTheTricksterForCharacter(
        preparedCharacter,
        selectedBlessingOfTheTricksterTarget
      );
      const characterToUpdate =
        nextCharacter === preparedCharacter ? preparedCharacter : nextCharacter;

      return roundTrackerResource
        ? consumeRoundTrackerResourceForCharacter(characterToUpdate, roundTrackerResource)
        : characterToUpdate;
    });
    closeActionDrawer();
  }

  function submitWildShape() {
    if (!selectedFeatureAction || !selectedWildShapeMonsterSlug) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      const roundTrackerResource = getRoundTrackerResourceForEconomyType(
        selectedFeatureAction.economyType
      );
      const preparedCharacter = prepareCharacterForResourceConsumption(
        currentCharacter,
        roundTrackerResource
      );
      const nextCharacter = activateDruidWildShapeForCharacter(
        preparedCharacter,
        selectedWildShapeMonsterSlug
      );

      if (nextCharacter === preparedCharacter) {
        return currentCharacter;
      }

      return roundTrackerResource
        ? consumeRoundTrackerResourceForCharacter(nextCharacter, roundTrackerResource)
        : nextCharacter;
    });

    closeActionDrawer();
  }

  function submitStarryForm() {
    if (!selectedFeatureAction || !selectedStarryFormConstellation) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      const roundTrackerResource = getRoundTrackerResourceForEconomyType(
        selectedFeatureAction.economyType
      );
      const preparedCharacter = prepareCharacterForResourceConsumption(
        currentCharacter,
        roundTrackerResource
      );
      const nextCharacter = activateDruidStarryFormForCharacter(
        preparedCharacter,
        selectedStarryFormConstellation
      );

      if (nextCharacter === preparedCharacter) {
        return currentCharacter;
      }

      return roundTrackerResource
        ? consumeRoundTrackerResourceForCharacter(nextCharacter, roundTrackerResource)
        : nextCharacter;
    });

    closeActionDrawer();
  }

  function submitWildCompanion() {
    if (!selectedFeatureAction) {
      return;
    }

    if (
      selectedWildCompanionResource === "spell-slot" &&
      selectedWildCompanionSpellSlotRemaining <= 0
    ) {
      return;
    }

    if (selectedWildCompanionResource === "wild-shape" && wildShapeUsesRemaining <= 0) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      const roundTrackerResource = getRoundTrackerResourceForEconomyType(
        selectedFeatureAction.economyType
      );
      const preparedCharacter = prepareCharacterForResourceConsumption(
        currentCharacter,
        roundTrackerResource
      );
      const nextCharacter = activateDruidWildCompanionForCharacter(
        preparedCharacter,
        selectedWildCompanionResource === "spell-slot"
          ? {
              kind: "spell-slot",
              spellSlotLevel: selectedWildCompanionSpellSlotLevel
            }
          : {
              kind: "wild-shape"
            }
      );

      if (nextCharacter === preparedCharacter) {
        return currentCharacter;
      }

      return roundTrackerResource
        ? consumeRoundTrackerResourceForCharacter(nextCharacter, roundTrackerResource)
        : nextCharacter;
    });

    closeActionDrawer();
  }

  function submitNatureMagician() {
    if (!selectedNatureMagicianOption) {
      return;
    }

    onPersistCharacter((currentCharacter) =>
      activateDruidNatureMagicianForCharacter(
        currentCharacter,
        selectedNatureMagicianOption.spellSlotLevel
      )
    );

    closeActionDrawer();
  }

  function submitWildResurgence() {
    if (!selectedWildResurgenceMode) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      if (selectedWildResurgenceMode === "spell-slot-to-wild-shape") {
        return activateDruidWildResurgenceWildShapeRecoveryForCharacter(
          currentCharacter,
          selectedWildResurgenceSpellSlotLevel
        );
      }

      return activateDruidWildResurgenceLevelOneSpellSlotRecoveryForCharacter(currentCharacter);
    });

    closeActionDrawer();
  }

  function submitRage() {
    if (!selectedFeatureAction) {
      return;
    }

    const requiresRageOption = selectedRageOptions.length > 0;
    const requiresPowerOption = selectedRagePowerOptions.length > 0;

    if (requiresRageOption && !selectedRageOptionKey) {
      return;
    }

    if (requiresPowerOption && !selectedRagePowerOptionKey) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      const roundTrackerResource = getRoundTrackerResourceForEconomyType(
        selectedFeatureAction.economyType
      );
      const preparedCharacter = prepareCharacterForResourceConsumption(
        currentCharacter,
        roundTrackerResource
      );
      const nextCharacter =
        requiresRageOption && selectedRageOptionKey
          ? activateBarbarianWildHeartRage(
              preparedCharacter,
              selectedRageOptionKey,
              selectedRagePowerOptionKey ?? undefined,
              {
                useRageOfTheGods: isRageOfTheGodsSelected
              }
            )
          : activateBarbarianRage(preparedCharacter, {
              useRageOfTheGods: isRageOfTheGodsSelected
            });

      if (nextCharacter === preparedCharacter) {
        return currentCharacter;
      }

      return roundTrackerResource
        ? consumeRoundTrackerResourceForCharacter(nextCharacter, roundTrackerResource)
        : nextCharacter;
    });

    closeActionDrawer();
  }

  function submitBrutalStrike() {
    if (!selectedFeatureAction) {
      return;
    }

    activateFeatureAction(selectedFeatureAction);
    closeActionDrawer();
  }

  function convertSpellSlotToSorceryPoints(spellSlotLevel: number) {
    onPersistCharacter((currentCharacter) =>
      convertSpellSlotToSorceryPointsForCharacter(currentCharacter, spellSlotLevel)
    );
    closeActionDrawer();
  }

  function createSpellSlotFromSorceryPoints(spellSlotLevel: number) {
    onPersistCharacter((currentCharacter) => {
      const preparedCharacter = prepareCharacterForRoundTrackerResourceConsumption(
        currentCharacter,
        "bonusAction"
      );
      const nextCharacter = createSpellSlotFromSorceryPointsForCharacter(
        preparedCharacter,
        spellSlotLevel
      );

      if (nextCharacter === preparedCharacter) {
        return currentCharacter;
      }

      return consumeRoundTrackerResourceForCharacter(nextCharacter, "bonusAction");
    });

    closeActionDrawer();
  }

  function confirmFontOfMagicSelection() {
    if (!selectedFontOfMagicSelection) {
      return;
    }

    if (selectedFontOfMagicSelection.kind === "slot-to-points") {
      convertSpellSlotToSorceryPoints(selectedFontOfMagicSelection.spellSlotLevel);
      return;
    }

    createSpellSlotFromSorceryPoints(selectedFontOfMagicSelection.spellSlotLevel);
  }

  function rollFixedSpellHuntersRimeTemporaryHitPoints(spell: Pick<SpellEntry, "id" | "name">) {
    if (spell.id !== huntersMarkSpellId || !fixedSpellHuntersRimeTemporaryHitPointsFormula) {
      return;
    }

    openDiceRoller({
      title: "Hunter's Rime",
      formula: fixedSpellHuntersRimeTemporaryHitPointsFormula,
      formulaDisplay:
        fixedSpellHuntersRimeTemporaryHitPointsFormulaDisplay ??
        fixedSpellHuntersRimeTemporaryHitPointsFormula,
      description: `When you cast ${spell.name}, you gain Temporary Hit Points.`,
      onResolvedResult: ({ result }) => {
        onPersistCharacter((currentCharacter) =>
          applyRolledTemporaryHitPointsToCharacter(currentCharacter, result.total, "Hunter's Rime")
        );
      }
    });
  }

  function rollFixedSpellFalseLifeTemporaryHitPoints(
    spell: Pick<SpellEntry, "id" | "name">,
    spellSlotLevel: number,
    maximizeDie: boolean
  ) {
    if (spell.id !== falseLifeSpellId) {
      return;
    }

    openDiceRoller({
      title: maximizeDie ? "Fiendish Vigor" : spell.name,
      formula: getFalseLifeTemporaryHitPointsFormula({
        maximizeDie,
        spellSlotLevel
      }),
      formulaDisplay: getFalseLifeTemporaryHitPointsFormulaDisplay(spellSlotLevel, {
        maximizeDie
      }),
      description: maximizeDie
        ? "When you cast False Life with Fiendish Vigor, you gain Temporary Hit Points and treat the d4 as a 4."
        : `When you cast ${spell.name}, you gain Temporary Hit Points.`,
      onResolvedResult: ({ result }) => {
        const temporaryHitPoints = maximizeDie
          ? result.total
          : getFalseLifeTemporaryHitPointsFromRoll(result.total, spellSlotLevel);
        const source = maximizeDie ? fiendishVigorTemporaryHitPointsSource : spell.name;

        onPersistCharacter((currentCharacter) =>
          applyFalseLifeTemporaryHitPointsToCharacter(currentCharacter, temporaryHitPoints, source)
        );
      }
    });
  }

  function rollFortifyingSoulHealing(
    action: FeatureActionCard,
    options: { applySelfResult?: boolean } = {}
  ) {
    const healingFormula = getRangerWinterWalkerFortifyingSoulHealingFormula(character);
    const healingFormulaDisplay =
      getRangerWinterWalkerFortifyingSoulHealingFormulaDisplay(character);
    const shouldApplySelfResult = options.applySelfResult === true;

    if (!healingFormula) {
      return;
    }

    openDiceRoller({
      title: action.name,
      formula: healingFormula,
      formulaDisplay: healingFormulaDisplay ?? healingFormula,
      description: action.detail,
      onResolvedResult: shouldApplySelfResult
        ? ({ result }) => {
            onPersistCharacter((currentCharacter) =>
              applyRolledHealingToCharacter(currentCharacter, result.total)
            );
          }
        : undefined
    });
  }

  function castFixedSpellAction(options?: {
    roundTrackerResourceOverride?: "action" | "bonusAction" | "reaction" | null;
    spellCastEffectIds?: string[];
    useBeguilingMagic?: boolean;
    useElementalSmite?: boolean;
    elementalSmiteOption?: PaladinOathOfTheNobleGeniesElementalSmiteOptionKey | null;
    useGoliathAncestry?: boolean;
    useFrozenHaunt?: boolean;
    frozenHauntFallbackSlotLevel?: number;
    castAsRitual?: boolean;
    spellImplementationOptions?: SpellImplementationOptionValues;
  }) {
    if (!fixedSpellExecute || !fixedSpellEntry || !selectedFeatureAction) {
      return;
    }

    const useBeguilingMagic = options?.useBeguilingMagic === true;
    const useElementalSmite =
      options?.useElementalSmite === true &&
      selectedActionSpellSupportsElementalSmite &&
      channelDivinityUsesRemaining > 0;
    const elementalSmiteOption = useElementalSmite ? (options?.elementalSmiteOption ?? null) : null;
    const useFrozenHaunt =
      options?.useFrozenHaunt === true && selectedActionSpellFrozenHauntOptionState !== null;
    const useGoliathAncestry =
      options?.useGoliathAncestry === true &&
      selectedActionSpellGoliathAncestryState !== null &&
      !selectedActionSpellGoliathAncestryState.disabled;
    const frozenHauntFallbackSlotLevel = useFrozenHaunt
      ? (options?.frozenHauntFallbackSlotLevel ?? null)
      : null;
    const castAsRitual = options?.castAsRitual === true;
    const spellImplementationOptions =
      fixedSpellExecute.effectKind === "armor-of-shadows"
        ? {
            ...(options?.spellImplementationOptions ?? {}),
            [mageArmorCastOnSelfOptionId]: true
          }
        : (options?.spellImplementationOptions ?? {});
    const minimumSlotLevel = Math.max(
      getSpellLevel(fixedSpellEntry),
      fixedSpellMinimumActionSlotLevel ?? 1
    );
    const slotLevel = Math.max(minimumSlotLevel, selectedFixedSpellSlotLevel);
    const castsWithoutSpellSlot =
      fixedSpellFreeCastSlotLevel !== null && slotLevel === fixedSpellFreeCastSlotLevel;
    const roundTrackerResource =
      options?.roundTrackerResourceOverride ??
      fixedSpellActionPaths[0]?.roundTrackerResource ??
      getRoundTrackerResourceForEconomyType(selectedFeatureAction.economyType);
    const fixedSpellActionPath =
      fixedSpellActionPaths.find((path) => path.roundTrackerResource === roundTrackerResource) ??
      fixedSpellActionPaths[0] ??
      null;
    const sharedEconomyContext = fixedSpellActionPath
      ? {
          economyType: fixedSpellActionPath.economyType,
          actionCategory: ACTION_CATEGORY.MAGIC,
          spellLevel: fixedSpellEntry.spellLevel
        }
      : createEconomyMultiContextForFeatureAction(selectedFeatureAction);

    if (useElementalSmite && elementalSmiteOption === null) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      const preparedCharacter = prepareCharacterForResourceConsumption(
        currentCharacter,
        roundTrackerResource
      );
      let nextCharacter = preparedCharacter;
      const spellSlotTotals = getSpellSlotTotalsForCharacter(
        preparedCharacter.className,
        preparedCharacter.level
      );
      const spellSlotsExpended = normalizeSpellSlotsExpended(
        preparedCharacter.spellSlotsExpended,
        spellSlotTotals
      );

      if (fixedSpellExecute.effectKind === "paladins-smite") {
        nextCharacter = consumePaladinsSmiteUseForCharacter(preparedCharacter);
      } else if (fixedSpellExecute.effectKind === "faithful-steed") {
        nextCharacter = consumeFaithfulSteedUseForCharacter(preparedCharacter);
      } else if (fixedSpellExecute.effectKind === "favored-enemy") {
        nextCharacter = consumeRangerFavoredEnemyUseForCharacter(preparedCharacter);
      } else if (fixedSpellExecute.effectKind === "shadow-arts-darkness") {
        nextCharacter = expendMonkFocusPointForCharacter(preparedCharacter);
      } else if (fixedSpellExecute.effectKind === "contact-patron") {
        nextCharacter = consumeContactPatronUseForCharacter(preparedCharacter);
      } else if (fixedSpellExecute.effectKind === "gift-of-the-depths") {
        nextCharacter = consumeWarlockGiftOfTheDepthsUseForCharacter(preparedCharacter);
      } else if (fixedSpellExecute.effectKind === "mantle-of-majesty") {
        nextCharacter =
          getMantleOfMajestyUsesRemainingForCharacter(preparedCharacter) > 0
            ? consumeMantleOfMajestyUseForCharacter(preparedCharacter)
            : preparedCharacter;
      } else if (fixedSpellExecute.effectKind === "restorative-reagents") {
        nextCharacter = consumeArtificerRestorativeReagentsUseForCharacter(preparedCharacter);
      } else if (fixedSpellExecute.effectKind === "illuminated-cartography") {
        nextCharacter = consumeArtificerIlluminatedCartographyUseForCharacter(preparedCharacter);
      } else if (fixedSpellExecute.effectKind === "unerring-path") {
        nextCharacter = consumeArtificerUnerringPathUseForCharacter(preparedCharacter);
      } else if (fixedSpellExecute.effectKind === "conjured-cauldron") {
        nextCharacter = consumeArtificerConjuredCauldronUseForCharacter(preparedCharacter);
      }

      if (
        nextCharacter === preparedCharacter &&
        fixedSpellExecute.effectKind === "gift-of-the-depths"
      ) {
        return currentCharacter;
      }

      if (
        nextCharacter === preparedCharacter &&
        fixedSpellExecute.effectKind !== "mantle-of-majesty" &&
        !isWarlockInvocationSpellEffectKind(fixedSpellExecute.effectKind)
      ) {
        return currentCharacter;
      }

      let nextCharacterWithSpellSlot = nextCharacter;
      const nextSpellSlotsExpended = [...spellSlotsExpended];

      if (fixedSpellConsumesSpellSlot && !castsWithoutSpellSlot) {
        if (
          (spellSlotTotals[slotLevel - 1] ?? 0) - (nextSpellSlotsExpended[slotLevel - 1] ?? 0) <=
          0
        ) {
          return currentCharacter;
        }

        nextSpellSlotsExpended[slotLevel - 1] = (nextSpellSlotsExpended[slotLevel - 1] ?? 0) + 1;
        nextCharacterWithSpellSlot = {
          ...nextCharacter,
          spellSlotsExpended: nextSpellSlotsExpended
        };
      }

      const currentFrozenHauntOptionState =
        getRangerWinterWalkerFrozenHauntSpellOptionStateForCharacter(
          preparedCharacter,
          fixedSpellEntry,
          spellSlotTotals,
          nextSpellSlotsExpended
        );
      const usesFrozenHauntCharge =
        useFrozenHaunt && (currentFrozenHauntOptionState?.usesRemaining ?? 0) > 0;
      const shouldSpendFrozenHauntFallbackSlot = useFrozenHaunt && !usesFrozenHauntCharge;

      if (shouldSpendFrozenHauntFallbackSlot) {
        const availableFrozenHauntFallbackSlotLevels =
          getRangerWinterWalkerFrozenHauntSpellOptionStateForCharacter(
            preparedCharacter,
            fixedSpellEntry,
            spellSlotTotals,
            nextSpellSlotsExpended
          )?.fallbackSpellSlotLevels ?? [];

        if (
          frozenHauntFallbackSlotLevel === null ||
          !availableFrozenHauntFallbackSlotLevels.includes(frozenHauntFallbackSlotLevel)
        ) {
          return currentCharacter;
        }

        nextSpellSlotsExpended[frozenHauntFallbackSlotLevel - 1] =
          (nextSpellSlotsExpended[frozenHauntFallbackSlotLevel - 1] ?? 0) + 1;
        nextCharacterWithSpellSlot = {
          ...nextCharacterWithSpellSlot,
          spellSlotsExpended: nextSpellSlotsExpended
        };
      }

      const nextCharacterWithConcentration =
        fixedSpellExecute.effectKind === "mantle-of-majesty"
          ? applyMantleOfMajestyStatusForCharacter(nextCharacterWithSpellSlot)
          : {
              ...nextCharacterWithSpellSlot,
              statusEntries: useFrozenHaunt
                ? applyRangerWinterWalkerFrozenHauntStatusEntriesForCharacter(
                    applySpellConcentrationToStatusEntries(
                      nextCharacterWithSpellSlot.statusEntries,
                      fixedSpellEntry
                    )
                  )
                : applySpellConcentrationToStatusEntries(
                    nextCharacterWithSpellSlot.statusEntries,
                    fixedSpellEntry
                  )
            };
      const nextCharacterWithSpellImplementation = applySpellImplementationForCharacter({
        character: nextCharacterWithConcentration,
        spell: fixedSpellEntry,
        spellSlotLevel: slotLevel,
        castSource: "fixed-feature",
        options: spellImplementationOptions
      });
      const nextCharacterWithBeguilingMagic = useBeguilingMagic
        ? consumeBeguilingMagicOrBardicInspirationForCharacter(nextCharacterWithSpellImplementation)
        : nextCharacterWithSpellImplementation;
      const nextCharacterWithElementalSmite = useElementalSmite
        ? applyPaladinOathOfTheNobleGeniesElementalSmiteEffect(
            expendChannelDivinityUseForCharacter(nextCharacterWithBeguilingMagic),
            elementalSmiteOption
          )
        : nextCharacterWithBeguilingMagic;
      const nextCharacterWithFrozenHaunt = usesFrozenHauntCharge
        ? consumeRangerWinterWalkerFrozenHauntUseForCharacter(nextCharacterWithElementalSmite)
        : nextCharacterWithElementalSmite;
      const nextCharacterWithGoliathAncestry = useGoliathAncestry
        ? consumeGoliathGiantAncestryUseForCharacter(nextCharacterWithFrozenHaunt)
        : nextCharacterWithFrozenHaunt;
      const nextCharacterWithFeatCastEffects = applyFeatSpellCastEffectsForCharacter(
        nextCharacterWithGoliathAncestry,
        fixedSpellEntry,
        options?.spellCastEffectIds
      );

      if (!nextCharacterWithFeatCastEffects) {
        return currentCharacter;
      }

      const spellConsumedSpellSlot =
        (fixedSpellConsumesSpellSlot && !castsWithoutSpellSlot) ||
        shouldSpendFrozenHauntFallbackSlot;
      const nextCharacterWithSorcererSubclassRecharge = spellConsumedSpellSlot
        ? restoreSorcererSubclassFeaturesOnSpellSlotCastForCharacter(
            nextCharacterWithFeatCastEffects
          )
        : nextCharacterWithFeatCastEffects;
      const nextCharacterWithSpellCastEffects = applySpellCastFeatureEffectsForCharacter(
        nextCharacterWithSorcererSubclassRecharge,
        fixedSpellEntry,
        { includeBardBattleMagic: !castAsRitual }
      );
      const nextCharacterWithSharedMulti = roundTrackerResource
        ? consumeSharedEconomyMultiForCharacterAction(
            nextCharacterWithSpellCastEffects,
            sharedEconomyContext
          )
        : nextCharacterWithSpellCastEffects;

      if (nextCharacterWithSharedMulti !== nextCharacterWithSpellCastEffects) {
        return nextCharacterWithSharedMulti;
      }

      return roundTrackerResource
        ? consumeRoundTrackerResourceForCharacter(
            nextCharacterWithSharedMulti,
            roundTrackerResource
          )
        : nextCharacterWithSharedMulti;
    });

    rollFixedSpellHuntersRimeTemporaryHitPoints(fixedSpellEntry);
    rollFixedSpellFalseLifeTemporaryHitPoints(
      fixedSpellEntry,
      slotLevel,
      fixedSpellExecute.effectKind === "fiendish-vigor"
    );
    closeActionDrawer();
  }

  function castDivineInterventionSpell(options?: {
    useBeguilingMagic?: boolean;
    useGoliathAncestry?: boolean;
    spellImplementationOptions?: SpellImplementationOptionValues;
  }) {
    if (!selectedDivineInterventionSpell || !selectedFeatureAction) {
      return;
    }

    const useBeguilingMagic = options?.useBeguilingMagic === true;
    const useGoliathAncestry =
      options?.useGoliathAncestry === true &&
      selectedActionSpellGoliathAncestryState !== null &&
      !selectedActionSpellGoliathAncestryState.disabled;
    const spellImplementationOptions = options?.spellImplementationOptions ?? {};

    onPersistCharacter((currentCharacter) => {
      const roundTrackerResource = getRoundTrackerResourceForEconomyType(
        selectedFeatureAction.economyType
      );
      const preparedCharacter = prepareCharacterForResourceConsumption(
        currentCharacter,
        roundTrackerResource
      );
      const nextCharacter = activateFeatureActionForCharacter(
        preparedCharacter,
        selectedFeatureAction.key
      );

      if (nextCharacter === preparedCharacter) {
        return currentCharacter;
      }

      const nextCharacterWithConcentration = {
        ...nextCharacter,
        statusEntries: applySpellConcentrationToStatusEntries(
          nextCharacter.statusEntries,
          selectedDivineInterventionSpell
        )
      };
      const nextCharacterWithSpellImplementation = applySpellImplementationForCharacter({
        character: nextCharacterWithConcentration,
        spell: selectedDivineInterventionSpell,
        spellSlotLevel: null,
        castSource: "divine-intervention",
        options: spellImplementationOptions
      });
      const nextCharacterWithBeguilingMagic = useBeguilingMagic
        ? consumeBeguilingMagicOrBardicInspirationForCharacter(nextCharacterWithSpellImplementation)
        : nextCharacterWithSpellImplementation;
      const nextCharacterWithGoliathAncestry = useGoliathAncestry
        ? consumeGoliathGiantAncestryUseForCharacter(nextCharacterWithBeguilingMagic)
        : nextCharacterWithBeguilingMagic;
      const nextCharacterWithSpellCastEffects = applySpellCastFeatureEffectsForCharacter(
        nextCharacterWithGoliathAncestry,
        selectedDivineInterventionSpell
      );

      return roundTrackerResource
        ? consumeRoundTrackerResourceForCharacter(
            nextCharacterWithSpellCastEffects,
            roundTrackerResource
          )
        : nextCharacterWithSpellCastEffects;
    });

    closeActionDrawer();
  }

  function openMysticArcanumSpell(spellLevel: number, spell: SpellEntry) {
    if (spellLevel !== 6 && spellLevel !== 7 && spellLevel !== 8 && spellLevel !== 9) {
      return;
    }

    setSelectedMysticArcanumSpell(spell);
    setSelectedMysticArcanumSpellLevel(spellLevel);
  }

  function castMysticArcanumSpell(options?: {
    useBeguilingMagic?: boolean;
    useGoliathAncestry?: boolean;
    spellImplementationOptions?: SpellImplementationOptionValues;
  }) {
    if (!selectedMysticArcanumSpell || selectedMysticArcanumSpellLevel === null) {
      return;
    }

    const useBeguilingMagic = options?.useBeguilingMagic === true;
    const useGoliathAncestry =
      options?.useGoliathAncestry === true &&
      selectedActionSpellGoliathAncestryState !== null &&
      !selectedActionSpellGoliathAncestryState.disabled;
    const spellImplementationOptions = options?.spellImplementationOptions ?? {};

    onPersistCharacter((currentCharacter) => {
      const roundTrackerResource = getRoundTrackerResourceForSpell(selectedMysticArcanumSpell);
      const preparedCharacter = roundTrackerResource
        ? prepareCharacterForRoundTrackerResourceConsumption(currentCharacter, roundTrackerResource)
        : currentCharacter;
      const nextCharacter = consumeMysticArcanumUseForCharacter(
        preparedCharacter,
        selectedMysticArcanumSpellLevel
      );

      if (nextCharacter === preparedCharacter) {
        return currentCharacter;
      }

      const nextCharacterWithConcentration = {
        ...nextCharacter,
        statusEntries: applySpellConcentrationToStatusEntries(
          nextCharacter.statusEntries,
          selectedMysticArcanumSpell
        )
      };
      const nextCharacterWithSpellImplementation = applySpellImplementationForCharacter({
        character: nextCharacterWithConcentration,
        spell: selectedMysticArcanumSpell,
        spellSlotLevel: selectedMysticArcanumSpellLevel,
        castSource: "mystic-arcanum",
        options: spellImplementationOptions
      });
      const nextCharacterWithBeguilingMagic = useBeguilingMagic
        ? consumeBeguilingMagicOrBardicInspirationForCharacter(nextCharacterWithSpellImplementation)
        : nextCharacterWithSpellImplementation;
      const nextCharacterWithGoliathAncestry = useGoliathAncestry
        ? consumeGoliathGiantAncestryUseForCharacter(nextCharacterWithBeguilingMagic)
        : nextCharacterWithBeguilingMagic;
      const nextCharacterWithSpellCastEffects = applySpellCastFeatureEffectsForCharacter(
        nextCharacterWithGoliathAncestry,
        selectedMysticArcanumSpell
      );

      return roundTrackerResource
        ? consumeRoundTrackerResourceForCharacter(
            nextCharacterWithSpellCastEffects,
            roundTrackerResource
          )
        : nextCharacterWithSpellCastEffects;
    });

    closeActionDrawer();
  }

  function updateMonkElementalAttunementResistanceDamageType(nextDamageType: DAMAGE_TYPE) {
    onPersistCharacter((currentCharacter) =>
      setMonkWarriorOfTheElementsElementalResistanceDamageTypeSelection(
        currentCharacter,
        nextDamageType
      )
    );
  }

  return {
    toggleFeatureOptionSelection,
    handleFeatureOptionExecute,
    activateSelectedChannelDivinity,
    confirmSelectedFeatureOptions,
    isArcaneFirearmSubmitting,
    isArtificerMagicItemTinkerSubmitting,
    isEldritchCannonSubmitting,
    isExperimentalElixirSubmitting,
    isReplicateMagicItemSubmitting,
    isSteelDefenderSubmitting,
    isTinkersMagicSubmitting,
    submitArtificerArcaneFirearm,
    submitArtificerChargeMagicItem,
    submitArtificerDrainMagicItem,
    submitArtificerEldritchCannon,
    submitArtificerExperimentalElixir,
    submitArtificerReplicateMagicItem,
    submitArtificerSteelDefender,
    submitArtificerTinkersMagic,
    submitArtificerTransmuteMagicItem,
    submitLayOnHands,
    submitAasimarHealingHands,
    submitAasimarCelestialRevelation,
    submitDragonbornBreathWeapon,
    submitDragonbornDraconicFlight,
    submitDwarfStonecunning,
    submitGoliathCloudsJaunt,
    submitGoliathLargeForm,
    submitGoliathStonesEndurance,
    submitGoliathStormsThunder,
    submitWarriorOfTheGods,
    submitIndomitable,
    submitHealingLight,
    submitMonkElementalBurst,
    submitSorcererWarpingImplosion,
    submitSorcererSpellfireBurst,
    submitSorcererWildMagicSurge,
    submitSneakAttack,
    submitRogueSoulknifePsionicDieRollAction,
    submitArcaneRecovery,
    submitPortent,
    submitThirdEye,
    submitBlessingOfTheTrickster,
    submitWildShape,
    submitStarryForm,
    submitWildCompanion,
    submitNatureMagician,
    submitWildResurgence,
    submitRage,
    submitBrutalStrike,
    convertSpellSlotToSorceryPoints,
    createSpellSlotFromSorceryPoints,
    confirmFontOfMagicSelection,
    rollFixedSpellHuntersRimeTemporaryHitPoints,
    rollFortifyingSoulHealing,
    castFixedSpellAction,
    castDivineInterventionSpell,
    openMysticArcanumSpell,
    castMysticArcanumSpell,
    updateMonkElementalAttunementResistanceDamageType
  };
}
