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
  getWarlockClairvoyantCombatantUsesRemaining,
  getWarlockClairvoyantCombatantUsesTotal,
  hurlThroughHellActionKey
} from "../../../../../../pages/CharactersPage/classFeatures/warlock/warlock";
import { awakenedMindActionKey } from "../../../../../../pages/CharactersPage/classFeatures/warlock/subclasses/warlockGreatOldOnePatron";
import {
  getArcaneRecoverySelectionLevelTotal,
  type ArcaneRecoverySelection
} from "../../../../../../pages/CharactersPage/classFeatures/wizard/wizard";
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
import PortentActionBody from "./PortentActionBody";
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
    () => getMantleOfMajestyUsesRemainingForCharacter(character),
    [character.classFeatureState, character.className, character.level, character.subclassId]
  );
  const effectiveAbilities = useMemo(() => getAbilityScoresForCharacter(character), [character]);
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
    () => getDruidWildShapeKnownFormsForCharacter(character),
    [character.classFeatureState, character.className, character.level]
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
    () => getDruidWildShapeUsesTotalForCharacter(character),
    [character.className, character.level]
  );
  const wildShapeUsesRemaining = useMemo(
    () => getDruidWildShapeUsesRemainingForCharacter(character),
    [character.classFeatureState, character.className, character.level]
  );
  const wildResurgenceSpellSlotRecoveryUsesRemaining = useMemo(
    () => getDruidWildResurgenceSpellSlotRecoveryUsesRemainingForCharacter(character),
    [character.classFeatureState, character.className, character.level]
  );
  const {
    selectedWeaponAction,
    selectedWeaponDetails,
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
    () => getMonkWarriorOfMercyFlurryOfHealingAndHarmUsesTotal(character),
    [character]
  );
  const selectedFlurryOfHealingAndHarmUsesRemaining = useMemo(
    () => getMonkWarriorOfMercyFlurryOfHealingAndHarmUsesRemaining(character),
    [character]
  );
  const selectedFlurryOfHealingAndHarmActive = useMemo(
    () => isMonkWarriorOfMercyFlurryOfHealingAndHarmActive(character),
    [character]
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
  }, [selectedFeatureAction?.key, selectedWarriorOfTheGodsUsesRemaining]);
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
  const selectedDrawerWarning =
    selectedOptionWarning ??
    selectedLayOnHandsWarning ??
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
  const paladinAuraOfProtectionBonus = hasActivePaladinAuraOfProtectionForCharacter(character)
    ? Math.max(1, getAbilityModifierBreakdownForCharacter(character, "CHA").total)
    : 0;
  const indomitableSavingThrowOptions = useMemo(
    () =>
      abilityKeys.map((ability) => {
        const abilityModifier = getAbilityModifierBreakdownForCharacter(character, ability).total;
        const savingThrowProficiency = getSavingThrowProficiencyForAbilityKey(ability);
        const savingThrowLevel = getSavingThrowLevelFromEntries(
          character.savingThrowProficiencies,
          savingThrowProficiency
        );
        const proficiencyContribution =
          getProficiencyBonus(character.level) * getProficiencyMultiplier(savingThrowLevel);
        const total =
          abilityModifier +
          proficiencyContribution +
          paladinAuraOfProtectionBonus +
          resolveFeatureSavingThrowBonusTotal(character, ability);
        const fighterLevelBonus = Math.max(1, Math.floor(character.level));
        const totalWithIndomitable = total + fighterLevelBonus;

        return {
          ability,
          total,
          formula: formatD20RollFormula(totalWithIndomitable),
          formulaDisplay: `d20 ${formatSignedLabel(total, `${ability} Save`)} + ${fighterLevelBonus} Fighter Level`
        };
      }),
    [
      character.level,
      character.savingThrowProficiencies,
      effectiveAbilities,
      paladinAuraOfProtectionBonus
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
      if (currentValue && wildShapeKnownForms.some((monster) => monster.slug === currentValue)) {
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
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    hasOverlayOpen,
    isCommonActionsOpen,
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

    onPersistCharacter((currentCharacter) => {
      const nextCharacter = activateFeatureActionForCharacter(currentCharacter, action.key);
      const roundTrackerResource = getRoundTrackerResourceForEconomyType(nextAction.economyType);
      const preparedCharacter = prepareCharacterForResourceConsumption(
        currentCharacter,
        roundTrackerResource
      );
      const preparedNextCharacter =
        preparedCharacter === currentCharacter
          ? nextCharacter
          : activateFeatureActionForCharacter(preparedCharacter, action.key);
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

  function executeCommonAction(
    action: FeatureActionCard,
    economyType: EconomyType = action.economyType
  ) {
    if (
      action.key === "common-action-dash" &&
      economyType === ECONOMY_TYPE.BONUS_ACTION &&
      shouldConsumeMonkFleetStepFollowUp(character)
    ) {
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
      description: selectedFeatureAction.detail
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

    if (action.key === rangerBeastMasterReviveActionKey) {
      const spellSlotLevel = selectedBeastMasterReviveSpellSlotLevel;

      if (spellSlotLevel === null) {
        return;
      }

      onPersistCharacter((currentCharacter) => {
        const spellSlotTotals = getSpellSlotTotalsForCharacter(
          currentCharacter.className,
          currentCharacter.level
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
      activateFeatureAction(action);
      rollFortifyingSoulHealing(action);
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
      getCombatActionsForCharacter(currentCharacter).find(
        (combatAction): combatAction is Extract<GameplayActionDefinition, { kind: "weapon" }> =>
          combatAction.kind === "weapon" && combatAction.action.key === action.key
      )?.action ?? action;
    const resolvedEconomyType = economyTypeOverride ?? currentAction.economyType;
    const roundTrackerResource = getRoundTrackerResourceForEconomyType(resolvedEconomyType);
    const preparedCharacter = prepareCharacterForResourceConsumption(
      currentCharacter,
      roundTrackerResource
    );
    const preparedActionBase =
      getCombatActionsForCharacter(preparedCharacter).find(
        (combatAction): combatAction is Extract<GameplayActionDefinition, { kind: "weapon" }> =>
          combatAction.kind === "weapon" && combatAction.action.key === action.key
      )?.action ?? currentAction;
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

  function handleWeaponAttackRoll(action: WeaponAction, economyTypeOverride?: EconomyType) {
    const useSacredWeapon =
      isSacredWeaponSelected &&
      selectedWeaponSacredWeaponState !== null &&
      !selectedWeaponSacredWeaponToggleDisabled;
    const useVowOfEnmity =
      isVowOfEnmitySelected &&
      selectedWeaponVowOfEnmityState !== null &&
      !selectedWeaponVowOfEnmityToggleDisabled;
    const useHuntersMarkTarget =
      isHuntersMarkTargetSelected &&
      selectedWeaponHuntersMarkTargetState !== null &&
      !selectedWeaponHuntersMarkTargetToggleDisabled;
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

      if (useSacredWeapon) {
        nextCharacter = activatePaladinOathOfDevotionSacredWeapon(nextCharacter);
      }

      if (useVowOfEnmity) {
        nextCharacter = activatePaladinOathOfVengeanceVowOfEnmity(nextCharacter);
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
        ? consumeWeaponAttackActionForCharacter(nextCharacter, preparedAction)
        : nextCharacter;
    });

    setIsSacredWeaponSelected(false);
    setIsVowOfEnmitySelected(false);
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
    const useSacredWeapon =
      isSacredWeaponSelected &&
      selectedWeaponSacredWeaponState !== null &&
      !selectedWeaponSacredWeaponToggleDisabled;
    const effectiveAction =
      (useDreadfulStrike ||
        useFeyDreadfulStrikes ||
        useColossusSlayer ||
        usePolarStrikes ||
        useHuntersMarkTarget ||
        useEmpoweredStrikes ||
        useHandOfHarm ||
        usePsionicStrike ||
        useSacredWeapon) &&
      selectedWeaponEffectiveAction
        ? selectedWeaponEffectiveAction
        : action;
    const damageAction = nextRollCriticalHitOverride
      ? applyCriticalHitToWeaponAction(effectiveAction)
      : effectiveAction;
    const damageFormula = appendRollModifier(
      damageAction.damageFormula,
      damageAction.damageAbilityModifier ?? damageAction.abilityModifier
    );
    const damageFormulaDisplay = getWeaponDamageFormulaPresentation(damageAction).value;

    openDiceRoller({
      title: `${damageAction.name} damage`,
      formula: damageFormula,
      formulaDisplay: damageFormulaDisplay,
      description: `${damageAction.name} damage roll`
    });

    const hasDamageRollSideEffects =
      effectiveAction.damageBonusEntries.length > 0 ||
      useDreadfulStrike ||
      useFeyDreadfulStrikes ||
      useColossusSlayer ||
      usePolarStrikes ||
      useStunningStrike ||
      useEmpoweredStrikes ||
      usePsionicStrike ||
      useHandOfHarm ||
      useQuiveringPalm;

    setIsDreadfulStrikeSelected(false);
    setIsColossusSlayerSelected(false);
    setIsPolarStrikesSelected(false);
    setIsStunningStrikeSelected(false);
    setIsEmpoweredStrikesSelected(false);
    setIsHandOfHarmSelected(false);
    setIsQuiveringPalmSelected(false);
    setIsPsionicStrikeSelected(false);

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

        if (useDreadfulStrike) {
          nextCharacter = consumeRangerGloomStalkerDreadAmbusherUseForCharacter(nextCharacter);
        }

        if (usePolarStrikes) {
          nextCharacter = consumeRangerWinterWalkerPolarStrikesUseForCharacter(nextCharacter);
        }

        if (useQuiveringPalm) {
          nextCharacter = activateMonkWarriorOfTheOpenHandQuiveringPalmMark(nextCharacter);
        }

        if (useStunningStrike) {
          nextCharacter = consumeMonkStunningStrike(nextCharacter);
        }
      }

      const nextCharacterWithInvisibleConditionsRemoved =
        removeInvisibleConditionFromCharacter(nextCharacter);

      return shouldTrackRoundScopedResources(nextCharacterWithInvisibleConditionsRemoved.roundTracker)
        ? nextCharacterWithInvisibleConditionsRemoved
        : clearRoundScopedFeatureStateForCharacter(nextCharacterWithInvisibleConditionsRemoved);
    });
  }

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
      description: `${selectedFeatureAction.detail} ${chargeCount} ${chargeLabel} expended.`
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

  function rollFortifyingSoulHealing(action: FeatureActionCard) {
    const healingFormula = getRangerWinterWalkerFortifyingSoulHealingFormula(character);
    const healingFormulaDisplay =
      getRangerWinterWalkerFortifyingSoulHealingFormulaDisplay(character);

    if (!healingFormula) {
      return;
    }

    openDiceRoller({
      title: action.name,
      formula: healingFormula,
      formulaDisplay: healingFormulaDisplay ?? healingFormula,
      description: action.detail
    });
  }

  function castFixedSpellAction(options?: {
    roundTrackerResourceOverride?: "action" | "bonusAction" | "reaction" | null;
    useBeguilingMagic?: boolean;
    useElementalSmite?: boolean;
    elementalSmiteOption?: PaladinOathOfTheNobleGeniesElementalSmiteOptionKey | null;
    useFrozenHaunt?: boolean;
    frozenHauntFallbackSlotLevel?: number;
    castAsRitual?: boolean;
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
    const frozenHauntFallbackSlotLevel = useFrozenHaunt
      ? (options?.frozenHauntFallbackSlotLevel ?? null)
      : null;
    const castAsRitual = options?.castAsRitual === true;
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
      } else if (fixedSpellExecute.effectKind === "mantle-of-majesty") {
        nextCharacter =
          getMantleOfMajestyUsesRemainingForCharacter(preparedCharacter) > 0
            ? consumeMantleOfMajestyUseForCharacter(preparedCharacter)
            : preparedCharacter;
      }

      if (
        nextCharacter === preparedCharacter &&
        fixedSpellExecute.effectKind !== "mantle-of-majesty"
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
      const nextCharacterWithBeguilingMagic = useBeguilingMagic
        ? consumeBeguilingMagicOrBardicInspirationForCharacter(nextCharacterWithConcentration)
        : nextCharacterWithConcentration;
      const nextCharacterWithElementalSmite = useElementalSmite
        ? applyPaladinOathOfTheNobleGeniesElementalSmiteEffect(
            expendChannelDivinityUseForCharacter(nextCharacterWithBeguilingMagic),
            elementalSmiteOption
          )
        : nextCharacterWithBeguilingMagic;
      const nextCharacterWithFrozenHaunt = usesFrozenHauntCharge
        ? consumeRangerWinterWalkerFrozenHauntUseForCharacter(nextCharacterWithElementalSmite)
        : nextCharacterWithElementalSmite;
      const spellConsumedSpellSlot =
        (fixedSpellConsumesSpellSlot && !castsWithoutSpellSlot) ||
        shouldSpendFrozenHauntFallbackSlot;
      const nextCharacterWithSorcererSubclassRecharge = spellConsumedSpellSlot
        ? restoreSorcererSubclassFeaturesOnSpellSlotCastForCharacter(nextCharacterWithFrozenHaunt)
        : nextCharacterWithFrozenHaunt;
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
    closeActionDrawer();
  }

  function castDivineInterventionSpell(options?: { useBeguilingMagic?: boolean }) {
    if (!selectedDivineInterventionSpell || !selectedFeatureAction) {
      return;
    }

    const useBeguilingMagic = options?.useBeguilingMagic === true;

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
      const nextCharacterWithBeguilingMagic = useBeguilingMagic
        ? consumeBeguilingMagicOrBardicInspirationForCharacter(nextCharacterWithConcentration)
        : nextCharacterWithConcentration;
      const nextCharacterWithSpellCastEffects = applySpellCastFeatureEffectsForCharacter(
        nextCharacterWithBeguilingMagic,
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

  function castMysticArcanumSpell(options?: { useBeguilingMagic?: boolean }) {
    if (!selectedMysticArcanumSpell || selectedMysticArcanumSpellLevel === null) {
      return;
    }

    const useBeguilingMagic = options?.useBeguilingMagic === true;

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
      const nextCharacterWithBeguilingMagic = useBeguilingMagic
        ? consumeBeguilingMagicOrBardicInspirationForCharacter(nextCharacterWithConcentration)
        : nextCharacterWithConcentration;
      const nextCharacterWithSpellCastEffects = applySpellCastFeatureEffectsForCharacter(
        nextCharacterWithBeguilingMagic,
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

  function renderActionDrawerBody() {
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

  function renderActionHeaderAside() {
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

  function renderActionDrawerFooter() {
    if (!selectedAction) {
      return null;
    }

    if (selectedAction.kind === "weapon") {
      const showPsionicStrikeToggle =
        selectedAction.action.attackKind === "weapon" &&
        selectedWeaponPsionicStrikeFormula !== null;

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
          {selectedUnarmedStrikeFlurryOfHealingAndHarmHelperText ? (
            <p className={styles.footerHelperText}>
              {selectedUnarmedStrikeFlurryOfHealingAndHarmHelperText}
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
            onAttack={(economyType) => handleWeaponAttackRoll(selectedAction.action, economyType)}
            onDamage={() => handleWeaponDamageRoll(selectedAction.action)}
            onDiceRollerSettingsOpenChange={setIsDiceRollerSettingsOpen}
          />
        </div>
      );
    }

    const selectedFeaturePrimaryLabel =
      ("confirmLabel" in selectedAction.drawer ? selectedAction.drawer.confirmLabel : undefined) ??
      getFeatureActionDrawerPrimaryLabel(selectedAction.action);

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
          crownOfSpellfireFallbackSorceryPointCost={
            selectedCrownOfSpellfireFallbackSorceryPointCost
          }
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
            selectedFeatureActionPrimaryDisabledReason !== null ||
            selectedIndomitableOption === null
          }
          isDiceRollerSettingsOpen={isDiceRollerSettingsOpen}
          onConfirm={() =>
            selectedIndomitableOption && submitIndomitable(selectedIndomitableOption)
          }
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
            selectedThirdEyeOptionKey === null ||
            selectedFeatureActionPrimaryDisabledReason !== null
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
          disabled={
            !selectedWildShapeMonster || selectedFeatureActionPrimaryDisabledReason !== null
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
          headerAside={renderActionHeaderAside()}
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
          footer={renderActionDrawerFooter()}
        >
          {renderActionDrawerBody()}
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
