/* eslint-disable @typescript-eslint/no-unused-vars */
import clsx from "clsx";
import { Sparkles } from "lucide-react";
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
import { getAbilityModifierBreakdownForCharacter } from "../../../../../../pages/CharactersPage/abilities";
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
import equipmentStyles from "../../../EquipmentForm/EquipmentForm.module.css";
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
import {
  renderActionDrawerBody,
  renderActionDrawerFooter,
  renderActionHeaderAside
} from "./ActionsWidgetDrawerRenderers";
import { useActionsWidgetExecution } from "./useActionsWidgetExecution";
import { useActionsWidgetActions } from "./useActionsWidgetActions";
import { useActionResourceOptionModel } from "./useActionResourceOptionModel";
import { useSelectedActionModel } from "./useSelectedActionModel";
import { useSelectedWeaponActionModel } from "./useSelectedWeaponActionModel";
import ActionsGrid from "./ActionsGrid";
import FeatureSpellDrawers from "./FeatureSpellDrawers";
import WildShapePreviewDrawer from "./WildShapePreviewDrawer";

const frozenHauntFallbackSpellSlotMinimumLevel = 4;
const initialSneakAttackActionSelection: SneakAttackActionSelection = {
  effectKeys: [],
  useRendMind: false
};

function ActionsWidget({ character, onPersistCharacter }: ActionsWidgetProps) {
  const dispatch = useAppDispatch();
  const [sneakAttackActionSelection, setSneakAttackActionSelection] =
    useState<SneakAttackActionSelection>(initialSneakAttackActionSelection);
  const [selectedSpellfireBurstTarget, setSelectedSpellfireBurstTarget] =
    useState<SpellfireBurstTarget>("self");
  const [selectedHealingLightDiceCount, setSelectedHealingLightDiceCount] = useState(1);
  const [selectedHealingLightTarget, setSelectedHealingLightTarget] =
    useState<HealingLightTarget>("self");
  const [selectedRecoverVitalityDiceCount, setSelectedRecoverVitalityDiceCount] = useState(1);
  const [selectedArcaneRecoverySelection, setSelectedArcaneRecoverySelection] =
    useState<ArcaneRecoverySelection>({});
  const [selectedWeaponDetailReference, setSelectedWeaponDetailReference] = useState<{
    title: string;
    entries: ReturnType<typeof getKeywordReferences>;
  } | null>(null);
  const {
    isCommonActionsOpen,
    setIsCommonActionsOpen,
    selectedActionKey,
    setSelectedActionKey,
    selectedActionOptionKeys,
    setSelectedActionOptionKeys,
    selectedChannelDivinityOptionKey,
    setSelectedChannelDivinityOptionKey,
    selectedFontOfMagicSelection,
    setSelectedFontOfMagicSelection,
    selectedWildShapeMonsterSlug,
    setSelectedWildShapeMonsterSlug,
    selectedWildCompanionResource,
    setSelectedWildCompanionResource,
    selectedBardicInspirationSpellSlotLevel,
    setSelectedBardicInspirationSpellSlotLevel,
    selectedArcaneWardSpellSlotLevel,
    setSelectedArcaneWardSpellSlotLevel,
    selectedBeastMasterReviveSpellSlotLevel,
    setSelectedBeastMasterReviveSpellSlotLevel,
    selectedWildCompanionSpellSlotLevel,
    setSelectedWildCompanionSpellSlotLevel,
    selectedWildResurgenceMode,
    setSelectedWildResurgenceMode,
    selectedWildResurgenceSpellSlotLevel,
    setSelectedWildResurgenceSpellSlotLevel,
    selectedNatureMagicianSpellSlotLevel,
    setSelectedNatureMagicianSpellSlotLevel,
    selectedLayOnHandsTarget,
    setSelectedLayOnHandsTarget,
    selectedLayOnHandsPoolSpendInput,
    setSelectedLayOnHandsPoolSpendInput,
    selectedLayOnHandsConditions,
    setSelectedLayOnHandsConditions,
    selectedBlessingOfTheTricksterTarget,
    setSelectedBlessingOfTheTricksterTarget,
    selectedThirdEyeOptionKey,
    setSelectedThirdEyeOptionKey,
    selectedStarryFormConstellation,
    setSelectedStarryFormConstellation,
    selectedWildShapePreviewSlug,
    setSelectedWildShapePreviewSlug,
    selectedRageOptionKey,
    setSelectedRageOptionKey,
    selectedRagePowerOptionKey,
    setSelectedRagePowerOptionKey,
    isRageOfTheGodsSelected,
    setIsRageOfTheGodsSelected,
    selectedIndomitableAbility,
    setSelectedIndomitableAbility,
    selectedWarriorOfTheGodsChargeCount,
    setSelectedWarriorOfTheGodsChargeCount,
    isFixedSpellDrawerOpen,
    setIsFixedSpellDrawerOpen,
    selectedFixedSpellSlotLevel,
    setSelectedFixedSpellSlotLevel,
    isDiceRollerSettingsOpen,
    setIsDiceRollerSettingsOpen,
    selectedDivineInterventionSpell,
    setSelectedDivineInterventionSpell,
    selectedMysticArcanumSpell,
    setSelectedMysticArcanumSpell,
    selectedMysticArcanumSpellLevel,
    setSelectedMysticArcanumSpellLevel,
    useBeguilingMagicOnActionSpell,
    setUseBeguilingMagicOnActionSpell,
    useElementalSmiteOnActionSpell,
    setUseElementalSmiteOnActionSpell,
    selectedElementalSmiteOptionOnActionSpell,
    setSelectedElementalSmiteOptionOnActionSpell,
    useFrozenHauntOnActionSpell,
    setUseFrozenHauntOnActionSpell,
    selectedFrozenHauntFallbackSlotLevel,
    setSelectedFrozenHauntFallbackSlotLevel,
    isCrownOfSpellfireSelected,
    setIsCrownOfSpellfireSelected,
    isInspiredEclipseSelected,
    setIsInspiredEclipseSelected,
    isGroupRecoverySelected,
    setIsGroupRecoverySelected,
    isClairvoyantCombatantSelected,
    setIsClairvoyantCombatantSelected,
    isPsionicStrikeSelected,
    setIsPsionicStrikeSelected,
    isDreadfulStrikeSelected,
    setIsDreadfulStrikeSelected,
    isColossusSlayerSelected,
    setIsColossusSlayerSelected,
    isPolarStrikesSelected,
    setIsPolarStrikesSelected,
    isHuntersMarkTargetSelected,
    setIsHuntersMarkTargetSelected,
    isSacredWeaponSelected,
    setIsSacredWeaponSelected,
    isVowOfEnmitySelected,
    setIsVowOfEnmitySelected,
    isStunningStrikeSelected,
    setIsStunningStrikeSelected,
    isHandOfHarmSelected,
    setIsHandOfHarmSelected,
    isFlurryOfHealingAndHarmSelected,
    setIsFlurryOfHealingAndHarmSelected,
    isEmpoweredStrikesSelected,
    setIsEmpoweredStrikesSelected,
    isQuiveringPalmSelected,
    setIsQuiveringPalmSelected,
    isImprovedShadowStepSelected,
    setIsImprovedShadowStepSelected,
    resetActionDrawerState,
    resetActionSelectionState
  } = useActionsWidgetUiState(frozenHauntFallbackSpellSlotMinimumLevel);
  const nextRollCriticalHitOverride = useAppSelector(
    (state) => state.diceRoller.nextRollCriticalHitOverride
  );
  const { openDiceRoller, diceRollerPopup } = useDiceRollerPopup();
  const {
    abilities,
    classFeatureState,
    className,
    feats,
    level,
    savingThrowProficiencies,
    statusEntries,
    subclassId
  } = character;
  const bardFeatureState = classFeatureState?.bard;
  const druidFeatureState = classFeatureState?.druid;
  const monkFeatureState = classFeatureState?.monk;

  const {
    roundTracker,
    combatActions,
    commonActionCards,
    selectableActions,
    customWeaponEntriesById
  } = useActionsWidgetActions(character);
  const {
    spellcastingState,
    beguilingMagicUsesTotal,
    beguilingMagicUsesRemaining,
    bardicInspirationUsesRemaining,
    fixedSpellSlotTotals,
    fixedSpellSlotsExpended,
    fixedSpellSlotsRemaining,
    wildCompanionSpellSlotOptions,
    bardicInspirationFallbackSpellSlotOptions,
    beastMasterReviveSpellSlotOptions,
    firstAvailableBardicInspirationSpellSlotLevel,
    firstAvailableBeastMasterReviveSpellSlotLevel,
    firstAvailableWildCompanionSpellSlotLevel,
    wildResurgenceAvailableSpellSlotLevels,
    wildResurgenceSpellSlotOptions,
    firstAvailableWildResurgenceSpellSlotLevel,
    natureMagicianOptions
  } = useActionResourceOptionModel(character);
  const mantleOfMajestyUsesRemaining = useMemo(
    () =>
      getMantleOfMajestyUsesRemainingForCharacter({
        classFeatureState: { bard: bardFeatureState },
        className,
        level,
        subclassId
      }),
    [bardFeatureState, className, level, subclassId]
  );
  const {
    selectedAction,
    selectedFeatureAction,
    isHordeBreakerSelected,
    isLayOnHandsActionSelected,
    selectedLayOnHandsTotalPool,
    selectedLayOnHandsRemainingPool,
    selectedLayOnHandsPoolSpendAmount,
    selectedLayOnHandsTotalCost,
    selectedLayOnHandsWarning,
    canSubmitLayOnHands,
    selectedMonkElementalAttunementResistanceDamageType,
    selectedActionBadges
  } = useSelectedActionModel({
    character,
    selectableActions,
    selectedActionKey,
    selectedLayOnHandsPoolSpendInput,
    selectedLayOnHandsConditions
  });
  const wildShapeKnownForms = useMemo(
    () =>
      getDruidWildShapeKnownFormsForCharacter({
        classFeatureState: { druid: druidFeatureState },
        className,
        level,
        subclassId
      }),
    [className, druidFeatureState, level, subclassId]
  );
  const wildShapeMonsterCache = useMemo(
    () =>
      wildShapeKnownForms.reduce<Record<string, MonsterRecord>>((cache, monster) => {
        cache[monster.slug] = monster;
        return cache;
      }, {}),
    [wildShapeKnownForms]
  );
  const wildShapeUsesTotal = useMemo(
    () => getDruidWildShapeUsesTotalForCharacter({ className, level }),
    [className, level]
  );
  const wildShapeUsesRemaining = useMemo(
    () =>
      getDruidWildShapeUsesRemainingForCharacter({
        classFeatureState: { druid: druidFeatureState },
        className,
        level,
        subclassId
      }),
    [className, druidFeatureState, level, subclassId]
  );
  const wildResurgenceSpellSlotRecoveryUsesRemaining = useMemo(
    () =>
      getDruidWildResurgenceSpellSlotRecoveryUsesRemainingForCharacter({
        classFeatureState: { druid: druidFeatureState },
        className,
        level,
        subclassId
      }),
    [className, druidFeatureState, level, subclassId]
  );
  const {
    selectedWeaponAction,
    selectedWeaponDetails,
    selectedWeaponIsAttuned,
    selectedWeaponPsionicStrikeFormula,
    selectedWeaponPsionicStrikeAvailable,
    selectedWeaponSacredWeaponState,
    selectedWeaponVowOfEnmityState,
    selectedWeaponDreadAmbusherState,
    selectedWeaponFeyDreadfulStrikesState,
    selectedWeaponColossusSlayerState,
    selectedWeaponHordeBreakerState,
    selectedWeaponPolarStrikesState,
    selectedWeaponHuntersMarkTargetState,
    selectedWeaponStunningStrikeState,
    selectedWeaponEmpoweredStrikesState,
    selectedWeaponHandOfHarmState,
    selectedWeaponQuiveringPalmState,
    selectedWeaponHandOfHarmDisabledReason,
    selectedWeaponStunningStrikeDisabledReason,
    selectedWeaponQuiveringPalmDisabledReason,
    selectedWeaponSacredWeaponToggleDisabled,
    selectedWeaponVowOfEnmityToggleDisabled,
    selectedWeaponDreadfulStrikeToggleDisabled,
    selectedWeaponFeyDreadfulStrikesToggleDisabled,
    selectedWeaponColossusSlayerToggleDisabled,
    selectedWeaponHordeBreakerToggleDisabled,
    selectedWeaponPolarStrikesToggleDisabled,
    selectedWeaponHuntersMarkTargetToggleDisabled,
    selectedWeaponStunningStrikeToggleDisabled,
    selectedWeaponEmpoweredStrikesToggleDisabled,
    selectedWeaponHandOfHarmToggleDisabled,
    selectedWeaponHandOfHarmUsage,
    selectedWeaponQuiveringPalmToggleDisabled,
    selectedImprovedShadowStepState,
    selectedWeaponEffectiveAction,
    selectedWeaponAttackFormula,
    selectedWeaponDamageFormula,
    selectedWeaponDrawerDescription,
    selectedWeaponRollState
  } = useSelectedWeaponActionModel({
    character,
    selectedAction,
    selectedFeatureAction,
    customWeaponEntriesById,
    nextRollCriticalHitOverride,
    isDreadfulStrikeSelected,
    isColossusSlayerSelected,
    isEmpoweredStrikesSelected,
    isHandOfHarmSelected,
    isHuntersMarkTargetSelected,
    isPolarStrikesSelected,
    isPsionicStrikeSelected,
    isQuiveringPalmSelected,
    isSacredWeaponSelected,
    isStunningStrikeSelected,
    isVowOfEnmitySelected
  });
  const selectedDrawerOptions = useMemo(
    () =>
      selectedAction?.kind === "feature" && selectedAction.drawer.kind === "options"
        ? selectedAction.drawer.options
        : [],
    [selectedAction]
  );
  const selectedChannelDivinityRows = useMemo(
    () =>
      selectedFeatureAction?.key === channelDivinityActionKey ||
      selectedFeatureAction?.key === paladinChannelDivinityActionKey
        ? createChannelDivinityOptionRows(selectedFeatureAction, selectedDrawerOptions)
        : [],
    [selectedDrawerOptions, selectedFeatureAction]
  );
  const selectedChannelDivinityRow = useMemo(
    () =>
      selectedChannelDivinityOptionKey
        ? (selectedChannelDivinityRows.find(
            (row) => row.option.key === selectedChannelDivinityOptionKey
          ) ?? null)
        : null,
    [selectedChannelDivinityOptionKey, selectedChannelDivinityRows]
  );
  const selectedWildShapeMonster = useMemo(
    () =>
      selectedFeatureAction?.key === druidWildShapeActionKey
        ? (wildShapeKnownForms.find((monster) => monster.slug === selectedWildShapeMonsterSlug) ??
          null)
        : null,
    [selectedFeatureAction?.key, selectedWildShapeMonsterSlug, wildShapeKnownForms]
  );
  const showBardicInspirationFallbackSlotSelect =
    selectedFeatureAction?.key === bardicInspirationActionKey &&
    bardicInspirationUsesRemaining <= 0;
  const selectedBardicInspirationFallbackSlotIsValid =
    selectedBardicInspirationSpellSlotLevel !== null &&
    bardicInspirationFallbackSpellSlotOptions.some(
      (slot) => slot.level === selectedBardicInspirationSpellSlotLevel
    );
  const arcaneWardSpellSlotOptions = useMemo(
    () => getArcaneWardSpellSlotOptions(fixedSpellSlotTotals, fixedSpellSlotsRemaining),
    [fixedSpellSlotTotals, fixedSpellSlotsRemaining]
  );
  const firstAvailableArcaneWardSpellSlotLevel = arcaneWardSpellSlotOptions[0]?.level ?? null;
  const selectedArcaneWardSpellSlotIsValid =
    selectedArcaneWardSpellSlotLevel !== null &&
    arcaneWardSpellSlotOptions.some((slot) => slot.level === selectedArcaneWardSpellSlotLevel);
  const selectedBeastMasterReviveSpellSlot =
    selectedBeastMasterReviveSpellSlotLevel !== null
      ? (beastMasterReviveSpellSlotOptions.find(
          (slot) => slot.level === selectedBeastMasterReviveSpellSlotLevel
        ) ?? null)
      : null;
  const selectedWildCompanionSpellSlotRemaining =
    fixedSpellSlotsRemaining[selectedWildCompanionSpellSlotLevel - 1] ?? 0;
  const canUseSelectedWildCompanionResource =
    selectedWildCompanionResource === "wild-shape"
      ? wildShapeUsesRemaining > 0
      : selectedWildCompanionSpellSlotRemaining > 0;
  const selectedWildResurgenceSpellSlotRemaining =
    fixedSpellSlotsRemaining[selectedWildResurgenceSpellSlotLevel - 1] ?? 0;
  const canRecoverWildShapeWithWildResurgence =
    wildResurgenceAvailableSpellSlotLevels.length > 0 &&
    selectedWildResurgenceSpellSlotRemaining > 0;
  const canRecoverLevelOneSpellSlotWithWildResurgence =
    wildResurgenceSpellSlotRecoveryUsesRemaining > 0 &&
    wildShapeUsesRemaining > 0 &&
    (fixedSpellSlotTotals[0] ?? 0) > 0 &&
    (fixedSpellSlotsExpended[0] ?? 0) > 0;
  const canUseSelectedWildResurgenceMode =
    selectedWildResurgenceMode === "spell-slot-to-wild-shape"
      ? canRecoverWildShapeWithWildResurgence
      : selectedWildResurgenceMode === "wild-shape-to-slot"
        ? canRecoverLevelOneSpellSlotWithWildResurgence
        : false;
  const selectedNatureMagicianOption =
    selectedFeatureAction?.key === druidNatureMagicianActionKey
      ? (natureMagicianOptions.find(
          (option) => option.spellSlotLevel === selectedNatureMagicianSpellSlotLevel
        ) ?? null)
      : null;
  const selectedRageOptions = useMemo(
    () =>
      selectedFeatureAction?.key === barbarianRageActionKey
        ? getBarbarianRageOfTheWildsOptions(character)
        : [],
    [character, selectedFeatureAction]
  );
  const selectedRagePowerOptions = useMemo(
    () =>
      selectedFeatureAction?.key === barbarianRageActionKey
        ? getBarbarianPowerOfTheWildsOptions(character)
        : [],
    [character, selectedFeatureAction]
  );
  const selectedRageOfTheGodsUsesTotal =
    selectedFeatureAction?.key === barbarianRageActionKey
      ? getBarbarianRageOfTheGodsUsesTotal(character)
      : 0;
  const selectedRageOfTheGodsUsesRemaining =
    selectedFeatureAction?.key === barbarianRageActionKey
      ? getBarbarianRageOfTheGodsUsesRemaining(character)
      : 0;
  const selectedRageOfTheGodsDescription = useMemo(
    () =>
      selectedFeatureAction?.key === barbarianRageActionKey
        ? getFeatureDescriptionForCharacter(character, CLASS_FEATURE.RAGE_OF_THE_GODS)
        : [],
    [character, selectedFeatureAction]
  );
  const selectedWarriorOfTheGodsUsesRemaining =
    selectedFeatureAction?.key === barbarianWarriorOfTheGodsActionKey
      ? (selectedFeatureAction.usesRemaining ?? 0)
      : 0;
  const selectedSecondWindHealingFormula =
    selectedFeatureAction?.key === fighterSecondWindActionKey
      ? getFighterSecondWindHealingFormula(character)
      : null;
  const selectedSecondWindGroupRecoveryUsesTotal =
    selectedFeatureAction?.key === fighterSecondWindActionKey
      ? getFighterGroupRecoveryUsesTotal(character)
      : 0;
  const selectedSecondWindGroupRecoveryUsesRemaining =
    selectedFeatureAction?.key === fighterSecondWindActionKey
      ? getFighterGroupRecoveryUsesRemaining(character)
      : 0;
  const selectedSecondWindGroupRecoveryFormula =
    selectedSecondWindGroupRecoveryUsesTotal > 0
      ? getFighterGroupRecoveryHealingFormula(character)
      : null;
  const isHealingLightActionSelected = selectedFeatureAction?.drawer?.formKind === "healing-light";
  const selectedHealingLightDiceRemaining = isHealingLightActionSelected
    ? getWarlockHealingLightDiceRemainingForCharacter(character)
    : 0;
  const selectedHealingLightMaxDicePerUse = isHealingLightActionSelected
    ? getWarlockHealingLightMaxSpendForCharacter(character)
    : 0;
  const selectedHealingLightMaxSelectableDice = Math.min(
    10,
    selectedHealingLightDiceRemaining,
    selectedHealingLightMaxDicePerUse
  );
  const isRecoverVitalityActionSelected =
    selectedFeatureAction?.drawer?.formKind === "recover-vitality";
  const selectedRecoverVitalityDiceRemaining = isRecoverVitalityActionSelected
    ? (selectedFeatureAction.usesRemaining ?? 0)
    : 0;
  const selectedRecoverVitalityMaxSelectableDice = Math.min(
    10,
    selectedRecoverVitalityDiceRemaining
  );
  const selectedMonkPatientDefenseTemporaryHitPointsFormula =
    selectedFeatureAction?.key === monkPatientDefenseActionKey
      ? getMonkPatientDefenseTemporaryHitPointsFormula(character)
      : null;
  const selectedMonkWholenessOfBodyHealingFormula =
    selectedFeatureAction?.key === monkWholenessOfBodyActionKey
      ? getMonkWarriorOfTheOpenHandWholenessOfBodyHealingFormula(character)
      : null;
  const selectedClairvoyantCombatantUsesTotal =
    selectedFeatureAction?.key === awakenedMindActionKey
      ? getWarlockClairvoyantCombatantUsesTotal(character)
      : 0;
  const selectedClairvoyantCombatantUsesRemaining =
    selectedFeatureAction?.key === awakenedMindActionKey
      ? getWarlockClairvoyantCombatantUsesRemaining(character)
      : 0;
  const selectedClairvoyantCombatantPactMagicSlotsRemaining =
    selectedFeatureAction?.key === awakenedMindActionKey
      ? getWarlockPactMagicSlotsRemainingForCharacter(character)
      : 0;
  const selectedClairvoyantCombatantToggleDisabled =
    selectedFeatureAction?.key === awakenedMindActionKey &&
    selectedClairvoyantCombatantUsesRemaining <= 0 &&
    selectedClairvoyantCombatantPactMagicSlotsRemaining <= 0;
  const selectedClairvoyantCombatantToggleDisabledReason =
    selectedClairvoyantCombatantToggleDisabled
      ? "No Clairvoyant Combatant charge or Pact Magic spell slots remaining."
      : null;
  const selectedDrawerOption = useMemo(
    () =>
      selectedDrawerOptions.find((option) => selectedActionOptionKeys.includes(option.key)) ?? null,
    [selectedActionOptionKeys, selectedDrawerOptions]
  );
  const selectedOptionEconomyShapeState = useMemo(() => {
    if (!selectedDrawerOption) {
      return null;
    }

    const sharedEconomyMultiCount = getSharedEconomyMultiCountForCharacterAction(
      character,
      createEconomyMultiContextForFeatureActionOption(selectedDrawerOption)
    );

    return getEconomyShapeState(
      selectedDrawerOption.economyType,
      roundTracker,
      (selectedDrawerOption.economyMultiCount ?? 0) + sharedEconomyMultiCount
    );
  }, [character, roundTracker, selectedDrawerOption]);
  const selectedOptionWarning = useMemo(
    () =>
      selectedDrawerOption
        ? selectedOptionEconomyShapeState
          ? selectedOptionEconomyShapeState.disabledReason
          : getRoundTrackerActionWarning(
              getRoundTrackerResourceForEconomyType(selectedDrawerOption.economyType),
              roundTracker
            )
        : null,
    [roundTracker, selectedDrawerOption, selectedOptionEconomyShapeState]
  );
  const selectedMetamagicCost = useMemo(
    () =>
      selectedFeatureAction?.key === metamagicActionKey
        ? getSorcererMetamagicActionCostForCharacter(character, selectedActionOptionKeys)
        : 0,
    [character, selectedActionOptionKeys, selectedFeatureAction]
  );
  const selectedFontOfMagicWarning = useMemo(() => {
    if (!selectedFontOfMagicSelection) {
      return null;
    }

    if (selectedFontOfMagicSelection.kind === "points-to-slot") {
      const actionWarning = getRoundTrackerActionWarning("bonusAction", roundTracker);

      if (actionWarning) {
        return actionWarning;
      }

      const spellSlotLevel = selectedFontOfMagicSelection.spellSlotLevel;
      const sorceryPointCostBySpellSlotLevel: Record<number, number> = {
        1: 2,
        2: 3,
        3: 5,
        4: 6,
        5: 7
      };
      const sorceryPointCost = sorceryPointCostBySpellSlotLevel[spellSlotLevel] ?? null;

      if ((fixedSpellSlotsExpended[spellSlotLevel - 1] ?? 0) <= 0) {
        return "You already have all of those spell slots.";
      }

      return sorceryPointCost !== null &&
        getSorceryPointsRemainingForCharacter(character) < sorceryPointCost
        ? `You need ${sorceryPointCost} Sorcery Points.`
        : null;
    }

    const spellSlotLevel = selectedFontOfMagicSelection.spellSlotLevel;
    const spellSlotIndex = spellSlotLevel - 1;
    const spellSlotTotal = fixedSpellSlotTotals[spellSlotIndex] ?? 0;
    const spellSlotsRemaining = Math.max(
      0,
      spellSlotTotal - (fixedSpellSlotsExpended[spellSlotIndex] ?? 0)
    );
    const sorceryPointsRemaining = getSorceryPointsRemainingForCharacter(character);
    const sorceryPointsTotal = getSorceryPointsTotalForCharacter(character);

    if (spellSlotTotal <= 0) {
      return "You don't have spell slots of this level.";
    }

    if (spellSlotsRemaining <= 0) {
      return "No spell slots of this level remain.";
    }

    return sorceryPointsRemaining + spellSlotLevel > sorceryPointsTotal
      ? `Converting this slot would exceed your Sorcery Point maximum (${sorceryPointsTotal}).`
      : null;
  }, [
    character,
    fixedSpellSlotTotals,
    fixedSpellSlotsExpended,
    roundTracker,
    selectedFontOfMagicSelection
  ]);
  const selectedActionEconomyShapeState = useMemo(() => {
    if (!selectedAction) {
      return null;
    }

    const sharedEconomyMultiCount =
      selectedAction.kind === "feature"
        ? getSharedEconomyMultiCountForCharacterAction(
            character,
            createEconomyMultiContextForFeatureAction(selectedAction.action)
          )
        : getSharedEconomyMultiCountForCharacterAction(character, {
            economyType: selectedAction.action.economyType,
            actionCategory: selectedAction.action.actionCategory,
            attackKind: selectedAction.action.attackKind
          });

    return getEconomyShapeState(
      selectedAction.economyType,
      roundTracker,
      (selectedAction.economyMultiCount ?? 0) + sharedEconomyMultiCount
    );
  }, [character, roundTracker, selectedAction]);
  const selectedWeaponAttackPathStates = useMemo(() => {
    if (!selectedAction || selectedAction.kind !== "weapon") {
      return [];
    }

    return getWeaponAttackPathStates(
      character,
      selectedWeaponEffectiveAction ?? selectedAction.action,
      roundTracker
    );
  }, [character, roundTracker, selectedAction, selectedWeaponEffectiveAction]);
  const selectedHandOfHealingActionPathStates = useMemo(() => {
    if (
      !selectedAction ||
      selectedAction.kind !== "feature" ||
      selectedAction.action.key !== monkHandOfHealingActionKey
    ) {
      return [];
    }

    return getMonkHandOfHealingActionPathStates(character, selectedAction.action, roundTracker);
  }, [character, roundTracker, selectedAction]);
  const selectedCommonActionPathStates = useMemo(() => {
    if (
      !selectedAction ||
      selectedAction.kind !== "feature" ||
      !isCommonActionKey(selectedAction.action.key)
    ) {
      return [];
    }

    return getCommonActionPathStates(character, selectedAction.action, roundTracker);
  }, [character, roundTracker, selectedAction]);
  const selectedFlurryOfHealingAndHarmUsesTotal = useMemo(
    () =>
      getMonkWarriorOfMercyFlurryOfHealingAndHarmUsesTotal({
        abilities,
        classFeatureState: { monk: monkFeatureState },
        className,
        level,
        subclassId
      }),
    [abilities, className, level, monkFeatureState, subclassId]
  );
  const selectedFlurryOfHealingAndHarmUsesRemaining = useMemo(
    () =>
      getMonkWarriorOfMercyFlurryOfHealingAndHarmUsesRemaining({
        abilities,
        classFeatureState: { monk: monkFeatureState },
        className,
        level,
        subclassId
      }),
    [abilities, className, level, monkFeatureState, subclassId]
  );
  const selectedFlurryOfHealingAndHarmActive = useMemo(
    () =>
      isMonkWarriorOfMercyFlurryOfHealingAndHarmActive({
        abilities,
        classFeatureState: { monk: monkFeatureState },
        className,
        level,
        subclassId
      }),
    [abilities, className, level, monkFeatureState, subclassId]
  );
  const selectedFlurryOfHealingAndHarmActiveHelperText = selectedFlurryOfHealingAndHarmActive
    ? "Flurry of Healing And Harm is active for this turn"
    : null;
  const selectedWeaponPrimaryAttackPathState =
    selectedAction?.kind === "weapon"
      ? (selectedWeaponAttackPathStates.find((path) => path.id === "primary") ?? null)
      : null;
  const selectedWeaponSecondaryAttackPathState =
    selectedAction?.kind === "weapon"
      ? (selectedWeaponAttackPathStates.find((path) => path.id === "secondary") ?? null)
      : null;
  const selectedCommonActionPrimaryPathState =
    selectedAction?.kind === "feature" && isCommonActionKey(selectedAction.action.key)
      ? (selectedCommonActionPathStates.find((path) => path.id === "primary") ?? null)
      : null;
  const selectedCommonActionSecondaryPathState =
    selectedAction?.kind === "feature" && isCommonActionKey(selectedAction.action.key)
      ? (selectedCommonActionPathStates.find((path) => path.id === "secondary") ?? null)
      : null;
  const selectedActionPrimaryWarning = useMemo(() => {
    if (!selectedAction) {
      return null;
    }

    if (selectedAction.kind === "feature" && selectedAction.action.ignoreEconomyAvailability) {
      return null;
    }

    return selectedActionEconomyShapeState
      ? selectedActionEconomyShapeState.disabledReason
      : getRoundTrackerActionWarning(
          getRoundTrackerResourceForEconomyType(selectedAction.economyType),
          roundTracker
        );
  }, [roundTracker, selectedAction, selectedActionEconomyShapeState]);
  const selectedActionWarning = useMemo(() => {
    if (!selectedAction) {
      return null;
    }

    if (selectedAction.kind === "feature" && isCommonActionKey(selectedAction.action.key)) {
      if (selectedCommonActionPathStates.some((path) => path.shapeState.isUsable)) {
        return null;
      }

      return (
        selectedCommonActionPrimaryPathState?.disabledReason ??
        selectedCommonActionSecondaryPathState?.disabledReason ??
        selectedActionPrimaryWarning
      );
    }

    if (selectedAction.kind !== "weapon") {
      return selectedActionPrimaryWarning;
    }

    if (selectedAction.disabledReason) {
      return selectedAction.disabledReason;
    }

    if (selectedWeaponAttackPathStates.some((path) => path.shapeState.isUsable)) {
      return null;
    }

    return (
      selectedWeaponPrimaryAttackPathState?.shapeState.disabledReason ??
      selectedWeaponSecondaryAttackPathState?.shapeState.disabledReason ??
      selectedActionPrimaryWarning
    );
  }, [
    selectedAction,
    selectedActionPrimaryWarning,
    selectedCommonActionPathStates,
    selectedCommonActionPrimaryPathState,
    selectedCommonActionSecondaryPathState,
    selectedWeaponAttackPathStates,
    selectedWeaponPrimaryAttackPathState,
    selectedWeaponSecondaryAttackPathState
  ]);
  const selectedInnateSorceryActivationSorceryPointCost =
    selectedFeatureAction?.key === innateSorceryActionKey
      ? getInnateSorceryActivationSorceryPointCostForCharacter(character)
      : 0;
  const selectedCrownOfSpellfireUsesTotal =
    selectedFeatureAction?.key === innateSorceryActionKey
      ? getSorcererSpellfireCrownOfSpellfireUsesTotalForCharacter(character)
      : 0;
  const selectedCrownOfSpellfireUsesRemaining =
    selectedFeatureAction?.key === innateSorceryActionKey
      ? getSorcererSpellfireCrownOfSpellfireUsesRemainingForCharacter(character)
      : 0;
  const selectedCrownOfSpellfireFallbackSorceryPointCost =
    selectedFeatureAction?.key === innateSorceryActionKey
      ? getSorcererSpellfireCrownOfSpellfireFallbackSorceryPointCostForCharacter(character)
      : 0;
  const selectedCrownOfSpellfireAvailableSorceryPoints = Math.max(
    0,
    getSorceryPointsRemainingForCharacter(character) -
      selectedInnateSorceryActivationSorceryPointCost
  );
  const selectedCrownOfSpellfireBlockedReason =
    isCrownOfSpellfireSelected &&
    selectedCrownOfSpellfireUsesRemaining <= 0 &&
    selectedCrownOfSpellfireAvailableSorceryPoints <
      selectedCrownOfSpellfireFallbackSorceryPointCost
      ? `You need ${selectedCrownOfSpellfireFallbackSorceryPointCost} Sorcery Points for Crown of Spellfire.`
      : null;
  const selectedActionBlockedReason =
    selectedAction?.kind === "feature"
      ? (selectedAction.drawer.blockedReason ?? selectedCrownOfSpellfireBlockedReason ?? null)
      : null;
  const selectedRageSelectionWarning = useMemo(() => {
    if (
      selectedAction?.kind !== "feature" ||
      selectedAction.action.key !== barbarianRageActionKey ||
      selectedAction.drawer.kind !== "custom-form"
    ) {
      return null;
    }

    const requiresRageOption = selectedRageOptions.length > 0;
    const requiresPowerOption = selectedRagePowerOptions.length > 0;
    const missingRageOption = requiresRageOption && selectedRageOptionKey === null;
    const missingPowerOption = requiresPowerOption && selectedRagePowerOptionKey === null;

    if (missingRageOption && missingPowerOption) {
      return "Choose a Rage of the Wilds and Power of the Wilds option to enter Rage.";
    }

    if (missingRageOption) {
      return "Choose a Rage of the Wilds option to enter Rage.";
    }

    if (missingPowerOption) {
      return "Choose a Power of the Wilds option to enter Rage.";
    }

    return null;
  }, [
    selectedAction,
    selectedRageOptionKey,
    selectedRageOptions.length,
    selectedRagePowerOptionKey,
    selectedRagePowerOptions.length
  ]);
  const selectedFeatureActionPrimaryDisabledReason =
    selectedAction?.kind === "feature"
      ? (selectedActionWarning ??
        selectedActionBlockedReason ??
        selectedAction.action.disabledReason ??
        null)
      : null;
  const selectedWildShapeSelectionWarning =
    selectedAction?.kind === "feature" &&
    selectedAction.drawer.kind === "custom-form" &&
    selectedAction.drawer.formKind === "wild-shape" &&
    wildShapeKnownForms.length <= 0
      ? "No Beast Shapes are selected yet."
      : null;
  const selectedBardicInspirationFallbackDisabledReason =
    selectedFeatureAction?.key !== bardicInspirationActionKey ||
    !showBardicInspirationFallbackSlotSelect
      ? selectedFeatureActionPrimaryDisabledReason
      : (selectedFeatureActionPrimaryDisabledReason ??
        (bardicInspirationFallbackSpellSlotOptions.length <= 0
          ? "No spell slots remain to fuel Font of Inspiration."
          : !selectedBardicInspirationFallbackSlotIsValid
            ? "Select a spell slot to regain Bardic Inspiration."
            : null));
  const selectedArcaneWardDisabledReason =
    selectedFeatureAction?.key !== wizardAbjurerArcaneWardActionKey
      ? selectedFeatureActionPrimaryDisabledReason
      : getArcaneWardDisabledReason(
          selectedFeatureActionPrimaryDisabledReason,
          arcaneWardSpellSlotOptions,
          selectedArcaneWardSpellSlotIsValid
        );
  const selectedBeastMasterReviveDisabledReason =
    selectedFeatureAction?.key !== rangerBeastMasterReviveActionKey
      ? selectedFeatureActionPrimaryDisabledReason
      : (selectedFeatureActionPrimaryDisabledReason ??
        (beastMasterReviveSpellSlotOptions.length <= 0
          ? "No spell slots remain to revive your Primal Companion."
          : !selectedBeastMasterReviveSpellSlot
            ? "Select a spell slot to revive your Primal Companion."
            : null));
  const showSelectedFlurryOfHealingAndHarmToggle =
    selectedAction?.kind === "feature" &&
    selectedAction.action.key === monkFlurryOfBlowsActionKey &&
    selectedFlurryOfHealingAndHarmUsesTotal > 0;
  const selectedFlurryOfHealingAndHarmDisabledReason =
    showSelectedFlurryOfHealingAndHarmToggle && selectedFlurryOfHealingAndHarmUsesRemaining <= 0
      ? "Flurry of Healing and Harm has no charges remaining."
      : null;
  const selectedFlurryOfBlowsPrimaryDisabledReason =
    selectedFeatureActionPrimaryDisabledReason ??
    (isFlurryOfHealingAndHarmSelected ? selectedFlurryOfHealingAndHarmDisabledReason : null);
  const selectedUnarmedStrikeFlurryOfHealingAndHarmHelperText =
    selectedAction?.kind === "weapon" &&
    selectedAction.action.key === "unarmed-strike" &&
    selectedFlurryOfHealingAndHarmActive
      ? selectedFlurryOfHealingAndHarmActiveHelperText
      : null;
  const selectedHandOfHealingFlurryOfHealingAndHarmHelperText =
    selectedFeatureAction?.key === monkHandOfHealingActionKey &&
    selectedFlurryOfHealingAndHarmActive
      ? selectedFlurryOfHealingAndHarmActiveHelperText
      : null;
  const selectedChannelDivinityWarning = selectedChannelDivinityRow
    ? (selectedFeatureActionPrimaryDisabledReason ??
      (selectedChannelDivinityRow.option.disabled
        ? (selectedChannelDivinityRow.option.disabledReason ?? "This divinity is unavailable.")
        : null) ??
      selectedChannelDivinityRow.option.disabledReason ??
      null)
    : null;
  const selectedChannelDivinityActionShape = selectedChannelDivinityRow
    ? getActionShapeForCastingTime(selectedChannelDivinityRow.entry.castingTime)
    : null;
  const selectedChannelDivinityShapeState = useMemo(
    () =>
      selectedChannelDivinityRow
        ? getEconomyShapeState(selectedChannelDivinityRow.option.economyType, roundTracker)
        : null,
    [roundTracker, selectedChannelDivinityRow]
  );
  const canSubmitSelectedWarriorOfTheGodsRoll =
    selectedWarriorOfTheGodsChargeCount > 0 &&
    selectedWarriorOfTheGodsChargeCount <= selectedWarriorOfTheGodsUsesRemaining;
  const selectedWeaponPrimaryDisabledReason =
    selectedAction?.kind === "weapon"
      ? (selectedAction.disabledReason ??
        selectedWeaponPrimaryAttackPathState?.shapeState.disabledReason ??
        null)
      : null;
  const selectedWeaponSecondaryDisabledReason =
    selectedAction?.kind === "weapon"
      ? (selectedAction.disabledReason ??
        selectedWeaponSecondaryAttackPathState?.shapeState.disabledReason ??
        null)
      : null;
  const selectedCommonActionPrimaryDisabledReason =
    selectedAction?.kind === "feature" && isCommonActionKey(selectedAction.action.key)
      ? (selectedAction.action.disabledReason ??
        selectedCommonActionPrimaryPathState?.disabledReason ??
        null)
      : null;
  const selectedCommonActionSecondaryDisabledReason =
    selectedAction?.kind === "feature" && isCommonActionKey(selectedAction.action.key)
      ? (selectedAction.action.disabledReason ??
        selectedCommonActionSecondaryPathState?.disabledReason ??
        null)
      : null;

  useEffect(() => {
    if (selectedFeatureAction?.key !== barbarianWarriorOfTheGodsActionKey) {
      return;
    }

    setSelectedWarriorOfTheGodsChargeCount((currentCount) => {
      if (selectedWarriorOfTheGodsUsesRemaining <= 0) {
        return 0;
      }

      return Math.max(1, Math.min(selectedWarriorOfTheGodsUsesRemaining, currentCount));
    });
  }, [
    selectedFeatureAction?.key,
    selectedWarriorOfTheGodsUsesRemaining,
    setSelectedWarriorOfTheGodsChargeCount
  ]);
  useEffect(() => {
    if (!isHealingLightActionSelected) {
      return;
    }

    setSelectedHealingLightDiceCount((currentCount) => {
      if (selectedHealingLightMaxSelectableDice <= 0) {
        return 1;
      }

      return Math.max(1, Math.min(selectedHealingLightMaxSelectableDice, currentCount));
    });
  }, [isHealingLightActionSelected, selectedHealingLightMaxSelectableDice]);
  useEffect(() => {
    if (!isRecoverVitalityActionSelected) {
      return;
    }

    setSelectedRecoverVitalityDiceCount((currentCount) => {
      if (selectedRecoverVitalityMaxSelectableDice <= 0) {
        return 1;
      }

      return Math.max(1, Math.min(selectedRecoverVitalityMaxSelectableDice, currentCount));
    });
  }, [isRecoverVitalityActionSelected, selectedRecoverVitalityMaxSelectableDice]);
  const selectedDrawerWarning =
    selectedOptionWarning ??
    selectedLayOnHandsWarning ??
    selectedWildShapeSelectionWarning ??
    (selectedAction?.kind === "feature" &&
    selectedAction.drawer.kind === "custom-form" &&
    selectedAction.drawer.formKind === "font-of-magic" &&
    selectedFontOfMagicSelection !== null
      ? selectedFontOfMagicWarning
      : (selectedActionWarning ?? selectedRageSelectionWarning));
  const selectedActionHeaderTags: FeatureActionHeaderTag[] =
    selectedAction?.kind === "weapon"
      ? []
      : isLayOnHandsActionSelected
        ? createNamedUsageHeaderTags(
            createFeatureActionCardCost({
              amountText: `${selectedLayOnHandsTotalCost}`
            }),
            selectedLayOnHandsRemainingPool,
            selectedLayOnHandsTotalPool,
            {
              label: "Pool of Healing"
            }
          )
        : selectedFeatureAction?.key === rangerBeastMasterReviveActionKey
          ? [
              {
                kind: "text",
                label: "Spell Slot",
                value: selectedBeastMasterReviveSpellSlot
                  ? `Use 1 out of ${selectedBeastMasterReviveSpellSlot.remaining}/${selectedBeastMasterReviveSpellSlot.total} Spell Slots`
                  : "No Spell Slots"
              }
            ]
          : (selectedAction?.drawer.headerTags ?? []);
  const fixedSpellExecute =
    selectedAction?.kind === "feature" &&
    selectedAction.execute.kind === "spell" &&
    selectedAction.execute.spellSource === "fixed"
      ? selectedAction.execute
      : null;
  const fixedSpellEntry = useMemo(
    () => (fixedSpellExecute ? getFixedSpellEntryForExecute(character, fixedSpellExecute) : null),
    [character, fixedSpellExecute]
  );
  const fixedSpellMinimumActionSlotLevel = useMemo(() => {
    if (fixedSpellExecute?.effectKind !== "mantle-of-majesty" || mantleOfMajestyUsesRemaining > 0) {
      return null;
    }

    return getMantleOfMajestyFallbackSlotLevelForCharacter(character);
  }, [character, fixedSpellExecute?.effectKind, mantleOfMajestyUsesRemaining]);
  const fixedSpellFreeCastSlotLevel =
    fixedSpellExecute?.effectKind === "mantle-of-majesty"
      ? mantleOfMajestyUsesRemaining > 0
        ? 1
        : null
      : (fixedSpellExecute?.freeCastSlotLevel ?? null);
  const fixedSpellConsumesSpellSlot =
    fixedSpellExecute?.effectKind === "mantle-of-majesty"
      ? true
      : (fixedSpellExecute?.actionConsumesSpellSlot ?? false);
  const fixedSpellActionAvailabilityText =
    fixedSpellExecute?.effectKind === "mantle-of-majesty"
      ? mantleOfMajestyUsesRemaining > 0
        ? "Cast Command at level 1 without expending a spell slot. Upcasting expends the selected spell slot."
        : fixedSpellMinimumActionSlotLevel !== null
          ? `Expend a level ${fixedSpellMinimumActionSlotLevel}+ spell slot to assume Mantle of Majesty.`
          : "No level 3+ spell slots remain to fuel Mantle of Majesty."
      : (fixedSpellExecute?.actionAvailabilityText ?? null);
  const fixedSpellActionContextText =
    fixedSpellExecute?.effectKind === "mantle-of-majesty"
      ? "Using Mantle of Majesty"
      : (fixedSpellExecute?.actionContextText ?? null);
  const selectedActionSpellEntry =
    fixedSpellEntry ?? selectedDivineInterventionSpell ?? selectedMysticArcanumSpell;
  const channelDivinityUsesTotal = getChannelDivinityUsesTotalForCharacter(character);
  const channelDivinityUsesRemaining = getChannelDivinityUsesRemainingForCharacter(character);
  const selectedActionSpellSupportsBeguilingMagic =
    selectedActionSpellEntry !== null &&
    beguilingMagicUsesTotal > 0 &&
    (selectedActionSpellEntry.magicSchool === MAGIC_SCHOOL.ENCHANTMENT ||
      selectedActionSpellEntry.magicSchool === MAGIC_SCHOOL.ILLUSION);
  const selectedActionSpellSupportsElementalSmite =
    selectedActionSpellEntry?.id === "spell-divine-smite" &&
    hasPaladinOathOfTheNobleGeniesElementalSmite(character);
  const selectedActionSpellElementalSmiteDisabled =
    selectedActionSpellSupportsElementalSmite && channelDivinityUsesRemaining <= 0;
  const fixedSpellElementalSmiteDamageDetail = useMemo(() => {
    if (!fixedSpellEntry || !useElementalSmiteOnActionSpell) {
      return null;
    }

    return getPaladinOathOfTheNobleGeniesElementalSmiteDamageDetail(
      getSpellDamageDetailForCharacter(character, fixedSpellEntry),
      selectedElementalSmiteOptionOnActionSpell
    );
  }, [
    character,
    fixedSpellEntry,
    selectedElementalSmiteOptionOnActionSpell,
    useElementalSmiteOnActionSpell
  ]);
  const selectedActionSpellFrozenHauntOptionState = useMemo(
    () =>
      getRangerWinterWalkerFrozenHauntSpellOptionStateForCharacter(
        character,
        fixedSpellEntry,
        fixedSpellSlotTotals,
        fixedSpellSlotsExpended
      ),
    [character, fixedSpellEntry, fixedSpellSlotTotals, fixedSpellSlotsExpended]
  );
  const fixedSpellHuntersRimeTemporaryHitPointsFormula =
    fixedSpellEntry?.id === huntersMarkSpellId
      ? getRangerWinterWalkerHuntersRimeTemporaryHitPointsFormulaForCharacter(character)
      : null;
  const fixedSpellHuntersRimeTemporaryHitPointsFormulaDisplay =
    fixedSpellEntry?.id === huntersMarkSpellId
      ? getRangerWinterWalkerHuntersRimeTemporaryHitPointsFormulaDisplayForCharacter(character)
      : null;
  const fixedSpellFacts =
    fixedSpellEntry?.id === huntersMarkSpellId
      ? getRangerWinterWalkerHuntersRimeTemporaryHitPointsFactsForCharacter(character)
      : [];
  const selectedActionSpellFrozenHauntFallbackSlotOptions = useMemo(
    () =>
      (selectedActionSpellFrozenHauntOptionState?.fallbackSpellSlotLevels ?? []).map(
        (slotLevel) => ({
          value: slotLevel,
          label: `Level ${slotLevel} (${fixedSpellSlotsRemaining[slotLevel - 1] ?? 0}/${fixedSpellSlotTotals[slotLevel - 1] ?? 0})`
        })
      ),
    [
      fixedSpellSlotTotals,
      fixedSpellSlotsRemaining,
      selectedActionSpellFrozenHauntOptionState?.fallbackSpellSlotLevels
    ]
  );
  const selectedActionSpellFrozenHauntFallbackSlotLevelIsValid =
    selectedActionSpellFrozenHauntOptionState?.fallbackSpellSlotLevels.includes(
      selectedFrozenHauntFallbackSlotLevel
    ) ?? false;
  const fixedSpellActionPaths = useMemo(
    () =>
      fixedSpellEntry ? getSpellActionPathStates(character, fixedSpellEntry, roundTracker) : [],
    [character, fixedSpellEntry, roundTracker]
  );
  const fixedSpellFrozenHauntWarning =
    useFrozenHauntOnActionSpell && selectedActionSpellFrozenHauntOptionState
      ? selectedActionSpellFrozenHauntOptionState.usesRemaining > 0
        ? null
        : (selectedActionSpellFrozenHauntOptionState.disabledReason ??
          (!selectedActionSpellFrozenHauntFallbackSlotLevelIsValid
            ? `Select a level ${frozenHauntFallbackSpellSlotMinimumLevel}+ spell slot for Frozen Haunt.`
            : null))
      : null;
  const fixedSpellSharedCastWarning =
    selectedActionBlockedReason ??
    selectedFeatureAction?.disabledReason ??
    fixedSpellFrozenHauntWarning;
  const fixedSpellCastWarning =
    fixedSpellSharedCastWarning ??
    (spellcastingState.blocked ? null : getSpellActionPathWarning(fixedSpellActionPaths));
  const paladinAuraOfProtectionBonus = hasActivePaladinAuraOfProtectionForCharacter({
    className,
    level,
    statusEntries
  })
    ? Math.max(
        1,
        getAbilityModifierBreakdownForCharacter(
          {
            abilities,
            classFeatureState,
            className,
            feats,
            level,
            statusEntries
          },
          "CHA"
        ).total
      )
    : 0;
  const indomitableSavingThrowOptions = useMemo(
    () =>
      abilityKeys.map((ability) => {
        const abilityContext = {
          abilities,
          classFeatureState,
          className,
          feats,
          level,
          statusEntries
        };
        const savingThrowBonusContext = {
          ...abilityContext,
          subclassId
        };
        const abilityModifier = getAbilityModifierBreakdownForCharacter(
          abilityContext,
          ability
        ).total;
        const savingThrowProficiency = getSavingThrowProficiencyForAbilityKey(ability);
        const savingThrowLevel = getSavingThrowLevelFromEntries(
          savingThrowProficiencies,
          savingThrowProficiency
        );
        const proficiencyContribution =
          getProficiencyBonus(level) * getProficiencyMultiplier(savingThrowLevel);
        const total =
          abilityModifier +
          proficiencyContribution +
          paladinAuraOfProtectionBonus +
          resolveFeatureSavingThrowBonusTotal(savingThrowBonusContext, ability);
        const fighterLevelBonus = Math.max(1, Math.floor(level));
        const totalWithIndomitable = total + fighterLevelBonus;

        return {
          ability,
          total,
          formula: formatD20RollFormula(totalWithIndomitable),
          formulaDisplay: `d20 ${formatSignedLabel(total, `${ability} Save`)} + ${fighterLevelBonus} Fighter Level`
        };
      }),
    [
      abilities,
      classFeatureState,
      className,
      feats,
      level,
      paladinAuraOfProtectionBonus,
      savingThrowProficiencies,
      statusEntries,
      subclassId
    ]
  );
  const selectedIndomitableOption =
    selectedIndomitableAbility !== null
      ? (indomitableSavingThrowOptions.find(
          (option) => option.ability === selectedIndomitableAbility
        ) ?? null)
      : null;
  const selectedMysticArcanumExpended =
    selectedMysticArcanumSpellLevel !== null
      ? (getWarlockMysticArcanumSelectionsForCharacter(character).find(
          (selection) => selection.spellLevel === selectedMysticArcanumSpellLevel
        )?.expended ?? false)
      : false;
  const selectedMysticArcanumBlockedReason = spellcastingState.blocked
    ? spellcastingState.reason
    : null;
  const selectedMysticArcanumActionWarning = getRoundTrackerActionWarning(
    selectedMysticArcanumSpell ? getRoundTrackerResourceForSpell(selectedMysticArcanumSpell) : null,
    roundTracker
  );
  const selectedDivineInterventionBlockedReason =
    selectedDivineInterventionSpell?.castingTime.includes(ACTION_TYPE.REACTION)
      ? "Divine Intervention can't cast Reaction spells."
      : spellcastingState.blocked
        ? spellcastingState.reason
        : null;
  const hasOverlayOpen =
    isCommonActionsOpen ||
    selectedAction !== null ||
    isDiceRollerSettingsOpen ||
    isFixedSpellDrawerOpen ||
    selectedDivineInterventionSpell !== null ||
    selectedMysticArcanumSpell !== null;
  const canUseInspiredEclipse =
    selectedAction?.kind === "feature" &&
    selectedAction.action.key === bardicInspirationActionKey &&
    character.className === "Bard" &&
    character.subclassId === "bard-college-of-the-moon" &&
    character.level >= 3;

  const {
    closeActionDrawer,
    openWeaponDetailReference,
    executeCommonAction,
    executeMonkHandOfHealingPath,
    executeMonkFlurryOfBlowsAction,
    submitMonkWholenessOfBody,
    submitMonkPatientDefense,
    executeFeatureActivate,
    resolvePreparedWeaponAction,
    handleWeaponAttackRoll,
    handleWeaponDamageRoll,
    toggleFeatureOptionSelection,
    handleFeatureOptionExecute,
    activateSelectedChannelDivinity,
    confirmSelectedFeatureOptions,
    submitLayOnHands,
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
  } = useActionsWidgetExecution({
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
    isCrownOfSpellfireSelected,
    isDiceRollerSettingsOpen,
    isDreadfulStrikeSelected,
    isEmpoweredStrikesSelected,
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
    selectedImprovedShadowStepState,
    selectedMonkPatientDefenseTemporaryHitPointsFormula,
    selectedMysticArcanumSpell,
    selectedMysticArcanumSpellLevel,
    selectedNatureMagicianOption,
    selectedRageOptionKey,
    selectedRageOptions,
    selectedRagePowerOptionKey,
    selectedRagePowerOptions,
    selectedSpellfireBurstTarget,
    selectedStarryFormConstellation,
    selectedThirdEyeOptionKey,
    selectedWeaponColossusSlayerState,
    selectedWeaponColossusSlayerToggleDisabled,
    selectedWeaponDreadAmbusherState,
    selectedWeaponDreadfulStrikeToggleDisabled,
    selectedWeaponEffectiveAction,
    selectedWeaponEmpoweredStrikesState,
    selectedWeaponEmpoweredStrikesToggleDisabled,
    selectedWeaponFeyDreadfulStrikesState,
    selectedWeaponFeyDreadfulStrikesToggleDisabled,
    selectedWeaponHandOfHarmState,
    selectedWeaponHandOfHarmToggleDisabled,
    selectedWeaponHordeBreakerState,
    selectedWeaponHordeBreakerToggleDisabled,
    selectedWeaponHuntersMarkTargetState,
    selectedWeaponHuntersMarkTargetToggleDisabled,
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
    setIsDiceRollerSettingsOpen,
    setIsDreadfulStrikeSelected,
    setIsEmpoweredStrikesSelected,
    setIsFixedSpellDrawerOpen,
    setIsFlurryOfHealingAndHarmSelected,
    setIsHandOfHarmSelected,
    setIsHuntersMarkTargetSelected,
    setIsImprovedShadowStepSelected,
    setIsPolarStrikesSelected,
    setIsPsionicStrikeSelected,
    setIsQuiveringPalmSelected,
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
    wildShapeUsesRemaining,
    selectedLayOnHandsTarget,
    selectedLayOnHandsTotalCost,
    selectedHealingLightTarget,
    selectedRecoverVitalityDiceCount,
    useBeguilingMagicOnActionSpell,
    useElementalSmiteOnActionSpell,
    selectedElementalSmiteOptionOnActionSpell,
    useFrozenHauntOnActionSpell,
    selectedFrozenHauntFallbackSlotLevel
  });

  const drawerRenderContext = {
    character, selectedAction, selectedWeaponRollState, selectedWeaponDetails, selectedWeaponAttackFormula, selectedWeaponDamageFormula, selectedFeatureAction, selectedDrawerOptions, selectedChannelDivinityRows, roundTracker, selectedActionOptionKeys, wildShapeKnownForms, selectedWildShapeMonsterSlug, wildShapeUsesRemaining, wildShapeUsesTotal, wildCompanionSpellSlotOptions, selectedWildCompanionResource, selectedWildCompanionSpellSlotLevel,
    natureMagicianOptions, selectedNatureMagicianSpellSlotLevel, wildResurgenceSpellSlotOptions, selectedWildResurgenceMode, selectedWildResurgenceSpellSlotLevel, fixedSpellSlotsRemaining, fixedSpellSlotTotals, wildResurgenceSpellSlotRecoveryUsesRemaining, selectedRageOptions, selectedRagePowerOptions, selectedRageOfTheGodsDescription, selectedRageOptionKey, selectedRagePowerOptionKey, selectedRageOfTheGodsUsesRemaining, selectedRageOfTheGodsUsesTotal, isRageOfTheGodsSelected, indomitableSavingThrowOptions, selectedIndomitableAbility,
    selectedLayOnHandsTarget, selectedLayOnHandsPoolSpendInput, selectedLayOnHandsConditions, selectedHealingLightDiceRemaining, selectedHealingLightMaxDicePerUse, selectedHealingLightDiceCount, selectedHealingLightTarget, selectedRecoverVitalityDiceRemaining, selectedRecoverVitalityMaxSelectableDice, selectedRecoverVitalityDiceCount, selectedWarriorOfTheGodsUsesRemaining, selectedWarriorOfTheGodsChargeCount, sneakAttackActionSelection, selectedSpellfireBurstTarget, selectedStarryFormConstellation, selectedFontOfMagicWarning, selectedFontOfMagicSelection, selectedFeatureActionPrimaryDisabledReason, selectedActionEconomyShapeState, selectedActionWarning, selectedActionPrimaryWarning,
    selectedActionBlockedReason, selectedDrawerWarning, showSelectedFlurryOfHealingAndHarmToggle, selectedFlurryOfHealingAndHarmUsesRemaining, selectedFlurryOfHealingAndHarmUsesTotal, isFlurryOfHealingAndHarmSelected, selectedWeaponPsionicStrikeFormula, selectedWeaponPsionicStrikeAvailable, isPsionicStrikeSelected, selectedWeaponSacredWeaponState, selectedWeaponVowOfEnmityState, selectedWeaponDreadAmbusherState, selectedWeaponFeyDreadfulStrikesState, selectedWeaponColossusSlayerState, selectedWeaponHordeBreakerState, selectedWeaponPolarStrikesState, selectedWeaponHuntersMarkTargetState, selectedWeaponStunningStrikeState,
    selectedWeaponEmpoweredStrikesState, selectedWeaponHandOfHarmState, selectedWeaponQuiveringPalmState, selectedImprovedShadowStepState, selectedWeaponHandOfHarmUsage, selectedWeaponSacredWeaponToggleDisabled, selectedWeaponVowOfEnmityToggleDisabled, selectedWeaponDreadfulStrikeToggleDisabled, selectedWeaponFeyDreadfulStrikesToggleDisabled, selectedWeaponColossusSlayerToggleDisabled, selectedWeaponHordeBreakerToggleDisabled, selectedWeaponPolarStrikesToggleDisabled, selectedWeaponHuntersMarkTargetToggleDisabled, selectedWeaponStunningStrikeToggleDisabled, selectedWeaponEmpoweredStrikesToggleDisabled, selectedWeaponHandOfHarmToggleDisabled, selectedWeaponQuiveringPalmToggleDisabled, isHuntersMarkTargetSelected,
    isDreadfulStrikeSelected, isColossusSlayerSelected, isHordeBreakerSelected, isPolarStrikesSelected, isSacredWeaponSelected, isVowOfEnmitySelected, isStunningStrikeSelected, isEmpoweredStrikesSelected, isHandOfHarmSelected, isQuiveringPalmSelected, isImprovedShadowStepSelected, isDiceRollerSettingsOpen, selectedMonkElementalAttunementResistanceDamageType, selectedSecondWindHealingFormula, selectedSecondWindGroupRecoveryFormula, isGroupRecoverySelected, selectedActionBadges, closeActionDrawer, executeCommonAction,
    executeMonkHandOfHealingPath, executeMonkFlurryOfBlowsAction, submitMonkPatientDefense, executeFeatureActivate, handleWeaponAttackRoll, handleWeaponDamageRoll, toggleFeatureOptionSelection, handleFeatureOptionExecute, confirmSelectedFeatureOptions, submitLayOnHands, submitWarriorOfTheGods, submitIndomitable, submitHealingLight, submitMonkElementalBurst, submitSorcererWarpingImplosion, submitSorcererSpellfireBurst, submitSorcererWildMagicSurge, submitSneakAttack,
    submitRogueSoulknifePsionicDieRollAction, submitArcaneRecovery, submitPortent, submitThirdEye, submitBlessingOfTheTrickster, submitWildShape, submitStarryForm, submitWildCompanion, submitNatureMagician, submitWildResurgence, submitRage, submitBrutalStrike, confirmFontOfMagicSelection, convertSpellSlotToSorceryPoints, createSpellSlotFromSorceryPoints, castFixedSpellAction, castDivineInterventionSpell, openMysticArcanumSpell,
    updateMonkElementalAttunementResistanceDamageType, openWeaponDetailReference, setSelectedActionOptionKeys, setSelectedWildShapeMonsterSlug, setSelectedWildShapePreviewSlug, setSelectedStarryFormConstellation, setSelectedWildCompanionResource, setSelectedWildCompanionSpellSlotLevel, setSelectedNatureMagicianSpellSlotLevel, setSelectedWildResurgenceMode, setSelectedWildResurgenceSpellSlotLevel, setSelectedRageOptionKey, setSelectedRagePowerOptionKey, setIsRageOfTheGodsSelected, setSelectedIndomitableAbility, setSelectedLayOnHandsTarget, setSelectedLayOnHandsPoolSpendInput, setSelectedLayOnHandsConditions,
    setSelectedHealingLightDiceCount, setSelectedHealingLightTarget, setSelectedRecoverVitalityDiceCount, setSelectedWarriorOfTheGodsChargeCount, setSneakAttackActionSelection, setSelectedSpellfireBurstTarget, setSelectedFontOfMagicSelection, setIsHuntersMarkTargetSelected, setIsDreadfulStrikeSelected, setIsColossusSlayerSelected, setIsPolarStrikesSelected, setIsSacredWeaponSelected, setIsVowOfEnmitySelected, setIsStunningStrikeSelected, setIsEmpoweredStrikesSelected, setIsHandOfHarmSelected, setIsQuiveringPalmSelected, setIsImprovedShadowStepSelected, setIsFlurryOfHealingAndHarmSelected,
    setIsGroupRecoverySelected, setIsPsionicStrikeSelected, setIsDiceRollerSettingsOpen, onPersistCharacter, arcaneWardSpellSlotOptions, bardicInspirationFallbackSpellSlotOptions, beastMasterReviveSpellSlotOptions, canSubmitLayOnHands, canSubmitSelectedWarriorOfTheGodsRoll, canUseInspiredEclipse, canUseSelectedWildCompanionResource, canUseSelectedWildResurgenceMode, isClairvoyantCombatantSelected, isCrownOfSpellfireSelected, isInspiredEclipseSelected, selectedArcaneRecoverySelection, selectedArcaneWardDisabledReason, selectedArcaneWardSpellSlotLevel,
    selectedBardicInspirationFallbackDisabledReason, selectedBardicInspirationSpellSlotLevel, selectedBeastMasterReviveDisabledReason, selectedBeastMasterReviveSpellSlotLevel, selectedBlessingOfTheTricksterTarget, selectedClairvoyantCombatantToggleDisabled, selectedClairvoyantCombatantToggleDisabledReason, selectedClairvoyantCombatantUsesRemaining, selectedClairvoyantCombatantUsesTotal, selectedCommonActionPathStates, selectedCommonActionPrimaryDisabledReason, selectedCommonActionSecondaryDisabledReason, selectedCrownOfSpellfireBlockedReason, selectedCrownOfSpellfireFallbackSorceryPointCost, selectedCrownOfSpellfireUsesRemaining, selectedCrownOfSpellfireUsesTotal, selectedDrawerOption, selectedFlurryOfBlowsPrimaryDisabledReason,
    selectedFlurryOfHealingAndHarmDisabledReason, selectedHandOfHealingActionPathStates, selectedHandOfHealingFlurryOfHealingAndHarmHelperText, selectedHealingLightMaxSelectableDice, selectedIndomitableOption, selectedLayOnHandsPoolSpendAmount, selectedMetamagicCost, selectedMonkPatientDefenseTemporaryHitPointsFormula, selectedMonkWholenessOfBodyHealingFormula, selectedNatureMagicianOption, selectedOptionEconomyShapeState, selectedOptionWarning, selectedRageSelectionWarning, selectedSecondWindGroupRecoveryUsesRemaining, selectedSecondWindGroupRecoveryUsesTotal, selectedThirdEyeOptionKey, selectedUnarmedStrikeFlurryOfHealingAndHarmHelperText, selectedWeaponHandOfHarmDisabledReason,
    selectedWeaponPrimaryAttackPathState, selectedWeaponPrimaryDisabledReason, selectedWeaponQuiveringPalmDisabledReason, selectedWeaponSecondaryAttackPathState, selectedWeaponSecondaryDisabledReason, selectedWeaponStunningStrikeDisabledReason, selectedWildShapeMonster, setIsClairvoyantCombatantSelected, setIsCrownOfSpellfireSelected, setIsFixedSpellDrawerOpen, setIsInspiredEclipseSelected, setSelectedArcaneRecoverySelection, setSelectedArcaneWardSpellSlotLevel, setSelectedBardicInspirationSpellSlotLevel, setSelectedBeastMasterReviveSpellSlotLevel, setSelectedBlessingOfTheTricksterTarget, setSelectedChannelDivinityOptionKey, setSelectedDivineInterventionSpell,
    setSelectedThirdEyeOptionKey, showBardicInspirationFallbackSlotSelect, submitMonkWholenessOfBody
  };


  return (
    <>
      <ActionsGrid
        character={character}
        combatActions={combatActions}
        isCommonActionsOpen={isCommonActionsOpen}
        roundTracker={roundTracker}
        onCommonActionsOpen={() => setIsCommonActionsOpen(true)}
        onActionSelect={setSelectedActionKey}
      />

      {isCommonActionsOpen ? (
        <CommonActionsModal
          character={character}
          roundTracker={roundTracker}
          actions={commonActionCards}
          isActionDrawerOpen={selectedAction !== null}
          onActionSelect={(action) => setSelectedActionKey(action.key)}
          onClose={() => setIsCommonActionsOpen(false)}
        />
      ) : null}

      {selectedAction ? (
        <GameplayActionDrawer
          title={selectedAction.name}
          eyebrow={selectedAction.drawer.eyebrow}
          badges={selectedActionBadges}
          titleAccessory={
            selectedAction.kind === "weapon" && selectedWeaponIsAttuned ? (
              <span className={equipmentStyles.drawerAttunedBadge}>
                <Sparkles size={13} aria-hidden="true" />
                <span>Attuned</span>
              </span>
            ) : null
          }
          headerAside={renderActionHeaderAside(drawerRenderContext)}
          description={
            selectedAction.kind === "weapon"
              ? selectedWeaponDrawerDescription.description
              : selectedAction.drawer.description
          }
          descriptionAdditions={
            selectedAction.kind === "weapon"
              ? selectedWeaponDrawerDescription.descriptionAdditions
              : selectedAction.drawer.descriptionAdditions
          }
          facts={
            selectedAction.kind === "weapon"
              ? (selectedWeaponAction?.facts ?? [])
              : selectedAction.drawer.facts
          }
          factsSectionTitle={
            selectedAction.kind === "weapon" ? undefined : selectedAction.drawer.factsSectionTitle
          }
          headerTags={selectedActionHeaderTags}
          helperText={selectedAction.drawer.helperText}
          warning={selectedDrawerWarning}
          blockedReason={
            selectedAction.kind === "feature"
              ? (selectedActionBlockedReason ?? selectedAction.disabledReason ?? null)
              : (selectedAction.disabledReason ?? null)
          }
          onClose={closeActionDrawer}
          footer={renderActionDrawerFooter(drawerRenderContext)}
        >
          {renderActionDrawerBody(drawerRenderContext)}
        </GameplayActionDrawer>
      ) : null}

      {selectedChannelDivinityRow ? (
        <CodexDivinityDrawer
          divinity={selectedChannelDivinityRow.entry}
          character={character}
          resources={[
            {
              kind: "tracker",
              label: "Uses",
              current: channelDivinityUsesRemaining,
              total: channelDivinityUsesTotal,
              icon: "pyromancy",
              cost: 1
            }
          ]}
          onClose={() => setSelectedChannelDivinityOptionKey(null)}
          footer={
            <div className={styles.footerActionStack}>
              {selectedChannelDivinityWarning ? (
                <div className={styles.channelDivinityFooterMeta}>
                  <p className={styles.channelDivinityFooterWarning}>
                    {selectedChannelDivinityWarning}
                  </p>
                </div>
              ) : null}
              <ActionButton
                className={clsx(styles.footerActionButton, styles.channelDivinityFooterButton)}
                onClick={() => activateSelectedChannelDivinity(selectedChannelDivinityRow)}
                disabled={selectedChannelDivinityWarning !== null}
                trailingBadge={
                  selectedChannelDivinityActionShape ? (
                    <ActionShape
                      shape={selectedChannelDivinityActionShape}
                      isSelected={selectedChannelDivinityShapeState?.isAvailable ?? true}
                      multiCount={selectedChannelDivinityShapeState?.multiCount ?? 0}
                      className={styles.footerActionShape}
                    />
                  ) : null
                }
              >
                Use Channel Divinity
              </ActionButton>
            </div>
          }
        />
      ) : null}

      <FeatureSpellDrawers
        character={character}
        isFixedSpellDrawerOpen={isFixedSpellDrawerOpen}
        fixedSpellEntry={fixedSpellEntry}
        fixedSpellExecute={fixedSpellExecute}
        fixedSpellElementalSmiteDamageDetail={fixedSpellElementalSmiteDamageDetail}
        fixedSpellSlotTotals={fixedSpellSlotTotals}
        fixedSpellSlotsRemaining={fixedSpellSlotsRemaining}
        selectedFixedSpellSlotLevel={selectedFixedSpellSlotLevel}
        onSelectedFixedSpellSlotLevelChange={setSelectedFixedSpellSlotLevel}
        onCloseFixedSpellDrawer={() => {
          setUseBeguilingMagicOnActionSpell(false);
          setUseElementalSmiteOnActionSpell(false);
          setSelectedElementalSmiteOptionOnActionSpell(null);
          setUseFrozenHauntOnActionSpell(false);
          setSelectedFrozenHauntFallbackSlotLevel(frozenHauntFallbackSpellSlotMinimumLevel);
          setIsDiceRollerSettingsOpen(false);
          setIsFixedSpellDrawerOpen(false);
        }}
        onCastFixedSpellAction={castFixedSpellAction}
        fixedSpellConsumesSpellSlot={fixedSpellConsumesSpellSlot}
        fixedSpellMinimumActionSlotLevel={fixedSpellMinimumActionSlotLevel}
        fixedSpellFreeCastSlotLevel={fixedSpellFreeCastSlotLevel}
        fixedSpellActionContextText={fixedSpellActionContextText}
        fixedSpellActionAvailabilityText={fixedSpellActionAvailabilityText}
        fixedSpellFacts={fixedSpellFacts}
        fixedSpellShowActionDiceControls={fixedSpellHuntersRimeTemporaryHitPointsFormula !== null}
        isDiceRollerSettingsOpen={isDiceRollerSettingsOpen}
        onDiceRollerSettingsOpenChange={setIsDiceRollerSettingsOpen}
        fixedSpellCastWarning={fixedSpellCastWarning}
        fixedSpellSharedCastWarning={fixedSpellSharedCastWarning}
        spellcastingBlocked={spellcastingState.blocked}
        spellcastingBlockedReason={spellcastingState.reason}
        fixedSpellActionPaths={fixedSpellActionPaths}
        selectedActionSpellSupportsBeguilingMagic={selectedActionSpellSupportsBeguilingMagic}
        selectedActionSpellSupportsElementalSmite={selectedActionSpellSupportsElementalSmite}
        selectedActionSpellElementalSmiteDisabled={selectedActionSpellElementalSmiteDisabled}
        selectedActionSpellFrozenHauntOptionState={selectedActionSpellFrozenHauntOptionState}
        selectedActionSpellFrozenHauntFallbackSlotOptions={
          selectedActionSpellFrozenHauntFallbackSlotOptions
        }
        beguilingMagicUsesRemaining={beguilingMagicUsesRemaining}
        beguilingMagicUsesTotal={beguilingMagicUsesTotal}
        bardicInspirationUsesRemaining={bardicInspirationUsesRemaining}
        useBeguilingMagicOnActionSpell={useBeguilingMagicOnActionSpell}
        onUseBeguilingMagicOnActionSpellChange={setUseBeguilingMagicOnActionSpell}
        useElementalSmiteOnActionSpell={useElementalSmiteOnActionSpell}
        onUseElementalSmiteOnActionSpellChange={setUseElementalSmiteOnActionSpell}
        selectedElementalSmiteOptionOnActionSpell={selectedElementalSmiteOptionOnActionSpell}
        onSelectedElementalSmiteOptionOnActionSpellChange={
          setSelectedElementalSmiteOptionOnActionSpell
        }
        useFrozenHauntOnActionSpell={useFrozenHauntOnActionSpell}
        onUseFrozenHauntOnActionSpellChange={setUseFrozenHauntOnActionSpell}
        selectedFrozenHauntFallbackSlotLevel={selectedFrozenHauntFallbackSlotLevel}
        onSelectedFrozenHauntFallbackSlotLevelChange={setSelectedFrozenHauntFallbackSlotLevel}
        frozenHauntFallbackSpellSlotMinimumLevel={frozenHauntFallbackSpellSlotMinimumLevel}
        selectedDivineInterventionSpell={selectedDivineInterventionSpell}
        selectedFeatureAction={selectedFeatureAction}
        selectedFeatureActionPrimaryDisabledReason={selectedFeatureActionPrimaryDisabledReason}
        selectedDivineInterventionBlockedReason={selectedDivineInterventionBlockedReason}
        onCloseDivineInterventionSpell={() => {
          setUseBeguilingMagicOnActionSpell(false);
          setSelectedDivineInterventionSpell(null);
        }}
        onCastDivineInterventionSpell={castDivineInterventionSpell}
        selectedMysticArcanumSpell={selectedMysticArcanumSpell}
        selectedMysticArcanumSpellLevel={selectedMysticArcanumSpellLevel}
        selectedMysticArcanumExpended={selectedMysticArcanumExpended}
        selectedMysticArcanumActionWarning={selectedMysticArcanumActionWarning}
        selectedMysticArcanumBlockedReason={selectedMysticArcanumBlockedReason}
        onCloseMysticArcanumSpell={() => {
          setUseBeguilingMagicOnActionSpell(false);
          setSelectedMysticArcanumSpell(null);
          setSelectedMysticArcanumSpellLevel(null);
        }}
        onCastMysticArcanumSpell={castMysticArcanumSpell}
      />

      <WildShapePreviewDrawer
        monsterCache={wildShapeMonsterCache}
        monsterSlug={selectedWildShapePreviewSlug}
        onClose={() => setSelectedWildShapePreviewSlug(null)}
      />

      {selectedWeaponDetailReference ? (
        <KeywordReferenceDrawer
          title={selectedWeaponDetailReference.title}
          entries={selectedWeaponDetailReference.entries}
          onClose={() => setSelectedWeaponDetailReference(null)}
        />
      ) : null}

      {diceRollerPopup}
    </>
  );
}

export default ActionsWidget;
