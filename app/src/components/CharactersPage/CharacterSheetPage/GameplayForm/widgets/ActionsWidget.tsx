import clsx from "clsx";
import { BookOpen, Flame, Minus, Plus, Sparkles, Swords } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { fetchMonsterBySlug } from "../../../../../api";
import CellContainer from "../../../../CellContainer/CellContainer";
import DescriptionContent from "../../../../DescriptionContent/DescriptionContent";
import { useDiceRollerPopup } from "../../../../DicePage/DiceRollerPopup";
import SpellListRow from "../../../../SpellListRow";
import { MonsterEntryDrawer } from "../../../../MonsterEntryRenderer";
import CharacterSpellDrawer from "../../SpellCastingForm/CharacterSpellDrawer";
import SelectInput from "../../../FormInputs/SelectInput";
import ActionShape, { getActionShapeForCastingTime } from "../../../../ActionShape";
import RollStatePill from "../../../../RollStatePill/RollStatePill";
import FeatureOptInToggle from "../../FeatureOptInToggle/FeatureOptInToggle";
import type {
  Character,
  AbilityKey,
  CharacterWizardPortentRoll,
  CodexStatus,
  MonsterRecord
} from "../../../../../types";
import type { PersistCharacterUpdater } from "../../../../../pages/CharactersPage/CharacterSheetPage/types";
import { abilityKeys } from "../../../../../pages/CharactersPage/constants";
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
  getDruidNatureMagicianOptionsForCharacter,
  hasDruidTwinklingConstellationsFeatureForCharacter,
  getDruidWildResurgenceAvailableSpellSlotLevelsForCharacter,
  getDruidWildResurgenceSpellSlotRecoveryUsesRemainingForCharacter,
  getDruidWildShapeKnownFormsForCharacter,
  getDruidWildShapeUsesRemainingForCharacter,
  getDruidWildShapeUsesTotalForCharacter,
  consumeRangerFavoredEnemyUseForCharacter,
  consumeRangerTirelessUseForCharacter,
  consumeBarbarianWarriorOfTheGodsChargesForCharacter,
  convertSpellSlotToSorceryPointsForCharacter,
  consumeNonMagicActionForCharacter,
  consumeWeaponAttackActionForCharacter,
  createEconomyMultiContextForFeatureAction,
  createEconomyMultiContextForFeatureActionOption,
  expendMonkFocusPointForCharacter,
  getBardicInspirationUsesRemainingForCharacter,
  getBeguilingMagicUsesRemainingForCharacter,
  getBeguilingMagicUsesTotalForCharacter,
  getChannelDivinityUsesRemainingForCharacter,
  getChannelDivinityUsesTotalForCharacter,
  getInnateSorceryActivationSorceryPointCostForCharacter,
  getMonkFocusPointsRemainingForCharacter,
  getMantleOfMajestyFallbackSlotLevelForCharacter,
  getMantleOfMajestyUsesRemainingForCharacter,
  getSorcererMetamagicActionCostForCharacter,
  getSorcererSpellfireCrownOfSpellfireFallbackSorceryPointCostForCharacter,
  getSorcererSpellfireCrownOfSpellfireUsesRemainingForCharacter,
  getSorcererSpellfireCrownOfSpellfireUsesTotalForCharacter,
  getSorceryPointsRemainingForCharacter,
  getLayOnHandsCurableConditionsForCharacter,
  getPaladinHealingPoolRemainingForCharacter,
  getPaladinHealingPoolTotalForCharacter,
  getSavingThrowBonusesForCharacter,
  getSharedEconomyMultiCountForCharacterAction,
  getSpellEntryForCharacter,
  getSpellcastingStateForCharacter,
  getRangerWinterWalkerFrozenHauntSpellOptionStateForCharacter,
  getWarlockHealingLightDiceRemainingForCharacter,
  getWarlockHealingLightMaxSpendForCharacter,
  getWarlockMysticArcanumSelectionsForCharacter,
  getWarlockPactMagicSlotsRemainingForCharacter,
  hasActivePaladinAuraOfProtectionForCharacter,
  restoreSorcererSubclassFeaturesOnSpellSlotCastForCharacter,
  hasSorcererArcaneApotheosisFreeMetamagicAvailableForCharacter,
  markFeatureWeaponBonusUseForCharacter,
  spendWarlockHealingLightDiceForCharacter,
  transformCommonActionForCharacter,
  type FeatureActionCard,
  type FeatureActionExecuteConfig,
  type FeatureActionOptionCard
} from "../../../../../pages/CharactersPage/classFeatures";
import { bardicInspirationActionKey } from "../../../../../pages/CharactersPage/classFeatures/bard/bard";
import {
  createChargesCardUsage,
  createFreeCardUsage,
  createChargesOrResourceCardUsage,
  createFeatureActionCardCost,
  createNamedUsageHeaderTags,
  createNamedResourceCardUsage
} from "../../../../../pages/CharactersPage/classFeatures/cardUsage";
import { appendSourcedDescriptionAddition } from "../../../../../pages/CharactersPage/actionModalDescriptions";
import { mantleOfInspirationActionKey } from "../../../../../pages/CharactersPage/classFeatures/bard/subclasses/bardCollegeOfGlamour";
import {
  channelDivinityActionKey,
  divineInterventionActionKey,
  getClericDivineInterventionEnabledLevels,
  getClericDivineInterventionSpellEntries,
  preserveLifeActionKey
} from "../../../../../pages/CharactersPage/classFeatures/cleric/cleric";
import {
  type DruidStarryFormConstellation,
  druidNatureMagicianActionKey,
  druidWildResurgenceActionKey,
  druidWildCompanionActionKey,
  druidWildShapeActionKey
} from "../../../../../pages/CharactersPage/classFeatures/druid/druid";
import {
  activateBarbarianRage,
  activateBarbarianWildHeartRage,
  barbarianBrutalStrikeActionKey,
  barbarianRageActionKey,
  barbarianWarriorOfTheGodsActionKey,
  getBarbarianBrutalStrikeDamageFormula,
  getBarbarianBrutalStrikeSelectionLimit,
  getBarbarianRageOfTheWildsOptions,
  getBarbarianRageOfTheGodsUsesRemaining,
  getBarbarianRageOfTheGodsUsesTotal,
  getBarbarianPowerOfTheWildsOptions
} from "../../../../../pages/CharactersPage/classFeatures/barbarian/barbarian";
import {
  consumeFighterBattleMasterKnowYourEnemyForCharacter,
  expendFighterBattleMasterSuperiorityDieForCharacter,
  getFighterBattleMasterCombatSuperiorityUsedThisTurnForCharacter,
  getFighterBattleMasterSuperiorityDieForCharacter,
  getFighterBattleMasterSuperiorityDiceRemainingForCharacter,
  applyFighterTeamTacticsStatus,
  consumeFighterGroupRecoveryUse,
  getFighterGroupRecoveryHealingFormula,
  getFighterGroupRecoveryUsesRemaining,
  getFighterGroupRecoveryUsesTotal,
  getFighterPsiWarriorPsionicStrikeFormulaForCharacter,
  fighterIndomitableActionKey,
  fighterSecondWindActionKey,
  fighterTacticalMindActionKey,
  hasFighterPsiWarriorPsionicStrikeAvailableForCharacter,
  getFighterSecondWindHealingFormula,
  markFighterBattleMasterCombatSuperiorityUsedForCharacter
} from "../../../../../pages/CharactersPage/classFeatures/fighter/fighter";
import { fighterBattleMasterCombatSuperiorityActionKey } from "../../../../../pages/CharactersPage/classFeatures/fighter/subclasses/fighterBattleMaster";
import {
  paladinChannelDivinityActionKey,
  type LayOnHandsCondition
} from "../../../../../pages/CharactersPage/classFeatures/paladin/paladin";
import {
  activatePaladinOathOfDevotionSacredWeapon,
  applyPaladinOathOfDevotionSacredWeaponAction,
  getPaladinOathOfDevotionSacredWeaponOptionState
} from "../../../../../pages/CharactersPage/classFeatures/paladin/subclasses/paladinOathOfDevotion";
import {
  activatePaladinOathOfVengeanceVowOfEnmity,
  applyPaladinOathOfVengeanceVowOfEnmityAction,
  getPaladinOathOfVengeanceVowOfEnmityOptionState
} from "../../../../../pages/CharactersPage/classFeatures/paladin/subclasses/paladinOathOfVengeance";
import {
  applyPaladinOathOfTheNobleGeniesElementalSmiteEffect,
  getPaladinOathOfTheNobleGeniesElementalSmiteDamageDetail,
  hasPaladinOathOfTheNobleGeniesElementalSmite,
  paladinOathOfTheNobleGeniesElementalSmiteOptions,
  type PaladinOathOfTheNobleGeniesElementalSmiteOptionKey
} from "../../../../../pages/CharactersPage/classFeatures/paladin/subclasses/paladinOathOfTheNobleGenies";
import { getRangerTirelessTemporaryHitPointsFormula } from "../../../../../pages/CharactersPage/classFeatures/ranger/ranger";
import { getRangerGloomStalkerDreadAmbusherOptionState } from "../../../../../pages/CharactersPage/classFeatures/ranger/subclasses/rangerGloomStalker";
import { getRangerWinterWalkerPolarStrikesOptionState } from "../../../../../pages/CharactersPage/classFeatures/ranger/subclasses/rangerWinterWalker";
import {
  innateSorceryActionKey,
  metamagicActionKey
} from "../../../../../pages/CharactersPage/classFeatures/sorcerer/sorcerer";
import {
  activateWarlockAwakenedMind,
  getWarlockClairvoyantCombatantUsesRemaining,
  getWarlockClairvoyantCombatantUsesTotal,
  type MysticArcanumLevel
} from "../../../../../pages/CharactersPage/classFeatures/warlock/warlock";
import { awakenedMindActionKey } from "../../../../../pages/CharactersPage/classFeatures/warlock/subclasses/warlockGreatOldOnePatron";
import {
  type ArcaneRecoverySelection,
  getArcaneRecoveryRecoveryLevelLimit
} from "../../../../../pages/CharactersPage/classFeatures/wizard/wizard";
import { setWizardDivinerPortentRolls } from "../../../../../pages/CharactersPage/classFeatures/wizard/subclasses/wizardDivinerPortent";
import { activateWizardDivinerThirdEye } from "../../../../../pages/CharactersPage/classFeatures/wizard/subclasses/wizardDivinerThirdEye";
import type { WizardDivinerThirdEyeOptionKey } from "../../../../../pages/CharactersPage/classFeatures/wizard/subclasses/wizardDivinerThirdEyeConfig";
import {
  getRogueSneakAttackEffectDefinitions,
  getRogueSneakAttackFormula
} from "../../../../../pages/CharactersPage/classFeatures/rogue/rogue";
import {
  consumeRogueSoulknifeRendMindUse,
  getRogueSoulknifePsionicDiceRemaining,
  getRogueSoulknifeRendMindUsesRemaining
} from "../../../../../pages/CharactersPage/classFeatures/rogue/subclasses/rogueSoulknife";
import {
  getCombatActionsForCharacter,
  type GameplayActionDefinition
} from "../../../../../pages/CharactersPage/combatActions";
import {
  isRoundTrackerResourceAvailable,
  normalizeRoundTracker
} from "../../../../../pages/CharactersPage/combat";
import {
  getCommonActionCards,
  isCommonActionKey
} from "../../../../../pages/CharactersPage/commonActions";
import {
  ACTION_CATEGORY,
  ECONOMY_TYPE,
  getRoundTrackerResourceForEconomyType,
  type EconomyType
} from "../../../../../pages/CharactersPage/actionEconomy";
import {
  getAbilityModifierBreakdownForCharacter,
  getAbilityScoresForCharacter
} from "../../../../../pages/CharactersPage/abilities";
import {
  formatAbilityModifier,
  getProficiencyBonus,
  type WeaponAction
} from "../../../../../pages/CharactersPage/gameplay";
import { applySpellConcentrationToStatusEntries } from "../../../../../pages/CharactersPage/statusEntries";
import {
  applyRolledHealingToCharacter,
  applyRolledTemporaryHitPointsToCharacter,
  consumeRoundTrackerResourceForCharacter,
  prepareCharacterForRoundTrackerResourceConsumption
} from "../gameplayStateUtils";
import {
  getSpellDamageDetailForCharacter,
  getSpellOutcomeSummaryForCharacter
} from "../../../../../pages/CharactersPage/spellOutcome";
import { formatFeatureActionOptionValueLabel } from "../../../../../pages/CharactersPage/actionOutcome";
import {
  getSavingThrowLevelFromEntries,
  getSavingThrowProficiencyForAbilityKey
} from "../../../../../pages/CharactersPage/proficiency";
import { getFeatureDescriptionForCharacter } from "../../../../../pages/CharactersPage/classFeatures/featureDescriptions";
import { hasActiveWeaponMastery } from "../../../../../pages/CharactersPage/weaponMasteryStatus";
import { hasAppliedWeaponProficiency } from "../../../../../pages/CharactersPage/weaponProficiencyStatus";
import {
  CLASS_FEATURE,
  ACTION_TYPE,
  DAMAGE_TYPE,
  ENTRY_CATEGORIES,
  MAGIC_SCHOOL,
  getSpellEntryById,
  type SpellDescriptionEntry,
  type SpellEntry,
  type WeaponEntry
} from "../../../../../codex/entries";
import { getWeaponEntries } from "../../../../../codex/selectors";
import {
  formatSignedLabel,
  getProficiencyMultiplier,
  getRoundTrackerResourceForSpell
} from "../../../../../pages/CharactersPage/shared";
import {
  getSpellLevel,
  getSpellSlotTotalsForCharacter,
  normalizeSpellSlotsExpended
} from "../../../../../pages/CharactersPage/spellcasting";
import {
  getResolvedCustomLoadoutEntries,
  type ResolvedCustomWeaponEntry
} from "../../../../../pages/CharactersPage/customEquipment";
import sheetStyles from "../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import shared from "../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import widgetShellStyles from "../GameplayWidgetShared.module.css";
import {
  getActionShapeForEconomyType,
  getEconomyShapeState,
  getRoundTrackerActionWarning
} from "../gameplayWidgetUtils";
import {
  formatResolvedRollStateDetailText,
  getRollModeFromIndicators,
  resolveFeatureIndicators
} from "../../../../RollStatePill/rollState";
import { useBodyScrollLock } from "../../../../../lib/useBodyScrollLock";
import d20Icon from "../../../../../assets/svg/d20.svg";
import { useAppSelector } from "../../../../../store";
import { adaptItemWeapon } from "../../../../../utils/items/adaptItemWeapon";
import styles from "./ActionsWidget.module.css";
import { getSpellActionPathStates, getSpellActionPathWarning } from "../../spellActionPaths";
import sharedModalStyles from "./FeatureActionModal.module.css";
import arcaneRecoveryStyles from "./ArcaneRecoveryModal.module.css";
import fontOfMagicStyles from "./FontOfMagicModal.module.css";
import SneakAttackActionBody, { type SneakAttackActionSelection } from "./SneakAttackModal";
import divineStyles from "./DivineInterventionModal.module.css";
import GameplayActionDrawer from "./GameplayActionDrawer";
import { BardicInspirationActionFooter } from "./BardicInspirationActionFooter";
import CodexDivinityDrawer from "../../../../CodexPage/CodexDivinityDrawer/CodexDivinityDrawer";
import BlessingOfTheTricksterActionBody from "./BlessingOfTheTricksterActionBody";
import { ClericPreserveLifeActionBody } from "./ClericPreserveLifeAction";
import DiceRollerSettingsButton from "./DiceRollerSettingsButton";
import WeaponAttackFooterButtons from "./WeaponAttackFooterButtons";
import ClericChannelDivinityAction from "./ClericChannelDivinityAction";
import DruidStarryFormActionBody from "./DruidStarryFormActionBody";
import {
  FighterSecondWindActionBody,
  FighterSecondWindActionFooter
} from "./FighterSecondWindAction";
import HealingLightActionBody from "./HealingLightActionBody";
import {
  IndomitableActionBody,
  IndomitableActionFooter,
  type IndomitableOption
} from "./IndomitableAction";
import PortentActionBody from "./PortentActionBody";
import RadioContainerOption from "../../RadioContainerOption";
import {
  LayOnHandsActionBody,
  LayOnHandsActionFooter,
  type LayOnHandsTarget
} from "./LayOnHandsAction";
import { SorcererInnateSorceryActionFooter } from "./SorcererInnateSorceryAction";
import ThirdEyeActionBody from "./ThirdEyeActionBody";
import { WarlockAwakenedMindActionFooter } from "./WarlockAwakenedMindAction";
import { WarriorOfTheGodsActionBody, WarriorOfTheGodsActionFooter } from "./WarriorOfTheGodsAction";
import {
  appendRollModifier,
  formatWildShapeMonsterMeta,
  getWeaponAttackFormulaPresentation,
  getWeaponDamageFormulaPresentation,
  getWeaponDrawerDescription,
  getWeaponDrawerDetails
} from "./actionsWidgetPresentation";
import {
  applyWeaponDamageBonusPreview,
  createPsiWarriorPsionicStrikeDamageBonus
} from "./fighterPsiWarriorWeapon";
import {
  applyCriticalHitToWeaponAction,
  appendCriticalHitToFormulaBreakdown
} from "./weaponCriticalHit";
import {
  consumeMonkStunningStrike,
  getMonkStunningStrikeOptionState
} from "../../../../../pages/CharactersPage/classFeatures/monk/monkStunningStrike";
import {
  activateMonkFlurryOfBlows,
  getMonkPatientDefenseTemporaryHitPointsFormula,
  monkFlurryOfBlowsActionKey,
  monkPatientDefenseActionKey,
  monkStepOfTheWindActionKey
} from "../../../../../pages/CharactersPage/classFeatures/monk/monk";
import {
  activateMonkWarriorOfMercyHandOfHealing,
  getMonkWarriorOfMercyFlurryOfHealingAndHarmUsesRemaining,
  getMonkWarriorOfMercyFlurryOfHealingAndHarmUsesTotal,
  getMonkWarriorOfMercyHandOfHealingFormula,
  getMonkWarriorOfMercyHandOfHarmOptionState,
  isMonkWarriorOfMercyFlurryOfHealingAndHarmActive,
  monkHandOfHealingActionKey
} from "../../../../../pages/CharactersPage/classFeatures/monk/subclasses/monkWarriorOfMercy";
import {
  consumeMonkWarriorOfTheOpenHandFleetStepFollowUpUse,
  getMonkWarriorOfTheOpenHandFleetStepFollowUpUsesRemaining,
  grantMonkWarriorOfTheOpenHandFleetStepFollowUpUse,
  activateMonkWarriorOfTheOpenHandQuiveringPalmMark,
  getMonkWarriorOfTheOpenHandQuiveringPalmOptionState,
  monkWarriorOfTheOpenHandQuiveringPalmFocusCost,
  getMonkWarriorOfTheOpenHandWholenessOfBodyHealingFormula,
  monkWholenessOfBodyActionKey,
  warriorOfTheOpenHandSubclassId
} from "../../../../../pages/CharactersPage/classFeatures/monk/subclasses/monkWarriorOfTheOpenHand";
import {
  activateMonkWarriorOfShadowImprovedShadowStep,
  getMonkWarriorOfShadowImprovedShadowStepOptionState,
  monkShadowStepActionKey
} from "../../../../../pages/CharactersPage/classFeatures/monk/subclasses/monkWarriorOfShadow";
import {
  getMonkWarriorOfTheElementsElementalBurstDamageFormula,
  getMonkWarriorOfTheElementsElementalResistanceDamageTypeSelection,
  getMonkWarriorOfTheElementsEmpoweredStrikesOptionState,
  hasMonkWarriorOfTheElementsElementalEpitome,
  monkElementalAttunementActionKey,
  monkElementalBurstActionKey,
  setMonkWarriorOfTheElementsElementalResistanceDamageTypeSelection
} from "../../../../../pages/CharactersPage/classFeatures/monk/subclasses/monkWarriorOfTheElements";
import {
  FeatureActionCardButton,
  FeatureActionChoiceRow,
  FeatureActionOptionButton,
  WeaponActionCard
} from "./ActionCards";
import { CommonActionFooter } from "./CommonAction";
import ElementalAttunementResistanceSelector from "./ElementalAttunementResistanceSelector";
import { ElementalBurstActionFooter } from "./ElementalBurstAction";
import {
  MonkHandOfHealingActionCard,
  MonkHandOfHealingActionFooter
} from "./MonkHandOfHealingAction";
import { MonkFlurryOfBlowsActionFooter } from "./MonkFlurryOfBlowsActionFooter";
import CommonActionsModal from "./CommonActionsModal";
import { getCommonActionPathStates } from "./commonActionEconomy";
import { getMonkHandOfHealingActionPathStates } from "./monkHandOfHealingActionUtils";
import {
  createChannelDivinityOptionRows,
  type ChannelDivinityOptionRow
} from "../../channelDivinityUtils";
import { getWeaponAttackPathStates } from "./weaponActionEconomy";
import { getMonkFocusComboDisabledReason } from "./monkWeaponFocusCombos";

type RoundTrackerAvailability = {
  actionAvailable: boolean;
  bonusActionAvailable: boolean;
  reactionAvailable: boolean;
};

type ActionsWidgetProps = {
  character: Character;
  onPersistCharacter: PersistCharacterUpdater;
};

function getFeatureActionDrawerPrimaryLabel(action: Pick<FeatureActionCard, "name">): string {
  const normalizedName = action.name.trim();

  return normalizedName ? `Use ${normalizedName}` : "Use";
}

function shouldGrantMonkFleetStepFollowUp(
  character: Pick<Character, "className" | "level" | "subclassId" | "classFeatureState">,
  actionKey: string,
  economyType: EconomyType
): boolean {
  return (
    economyType === ECONOMY_TYPE.BONUS_ACTION &&
    character.className === "Monk" &&
    character.subclassId === warriorOfTheOpenHandSubclassId &&
    character.level >= 11 &&
    actionKey !== monkStepOfTheWindActionKey &&
    actionKey !== "common-action-dash"
  );
}

function grantMonkFleetStepFollowUpIfEligible(
  character: Character,
  actionKey: string,
  economyType: EconomyType
): Character {
  return shouldGrantMonkFleetStepFollowUp(character, actionKey, economyType)
    ? grantMonkWarriorOfTheOpenHandFleetStepFollowUpUse(character)
    : character;
}

function shouldConsumeMonkFleetStepFollowUp(
  character: Pick<
    Character,
    "className" | "level" | "subclassId" | "classFeatureState" | "roundTracker"
  >
): boolean {
  return (
    getMonkWarriorOfTheOpenHandFleetStepFollowUpUsesRemaining(character) > 0 &&
    !isRoundTrackerResourceAvailable(character.roundTracker, "bonusAction")
  );
}

function createCommonActionDefinition(action: FeatureActionCard): GameplayActionDefinition {
  return {
    kind: "feature",
    key: action.key,
    name: action.name,
    economyType: action.economyType,
    actionCategory: action.actionCategory,
    economyMultiCount: action.economyMultiCount,
    disabled: action.disabled,
    disabledReason: action.disabledReason,
    action,
    execute: {
      kind: "activate"
    },
    drawer: {
      kind: "confirm",
      eyebrow: "Common Action",
      description: action.description ?? [],
      descriptionAdditions: action.descriptionAdditions ?? [],
      helperText: action.drawer?.helperText,
      helperTextTone: action.drawer?.helperTextTone,
      blockedReason: action.drawer?.blockedReason,
      facts: action.drawer?.facts ?? action.facts ?? [],
      factsSectionTitle: action.drawer?.factsSectionTitle,
      headerTags: action.drawer?.headerTags ?? action.headerTags ?? [],
      confirmLabel: action.drawer?.confirmLabel ?? getFeatureActionDrawerPrimaryLabel(action)
    }
  };
}

type FontOfMagicSelection =
  | {
      kind: "slot-to-points";
      spellSlotLevel: number;
    }
  | {
      kind: "points-to-slot";
      spellSlotLevel: number;
    };

const frozenHauntFallbackSpellSlotMinimumLevel = 4;

type WildCompanionResourceKind = "wild-shape" | "spell-slot";
type WildResurgenceMode = "spell-slot-to-wild-shape" | "wild-shape-to-slot";
type BlessingOfTheTricksterTarget = "self" | "other";

function formatD20RollFormula(modifier: number): string {
  if (modifier === 0) {
    return "1d20";
  }

  return `1d20${modifier >= 0 ? "+" : ""}${modifier}`;
}

const codexWeaponEntriesByName = new Map<string, WeaponEntry>(
  getWeaponEntries().map((entry) => [entry.name, entry])
);

function resolveFeatureSavingThrowBonusTotal(character: Character, ability: AbilityKey): number {
  return getSavingThrowBonusesForCharacter(character, ability).reduce((total, bonus) => {
    if (bonus.abilityModifierSource) {
      const sourceValue = getAbilityModifierBreakdownForCharacter(
        character,
        bonus.abilityModifierSource
      ).total;
      return (
        total +
        (typeof bonus.minimumValue === "number"
          ? Math.max(bonus.minimumValue, sourceValue)
          : sourceValue)
      );
    }

    return total + (bonus.value ?? 0);
  }, 0);
}

function createContactPatronSpellEntry(spell: SpellEntry): SpellEntry {
  return {
    ...spell,
    description: [
      "<strong>Contact Patron.</strong> You mentally contact your patron directly. This casting doesn't expend a spell slot, and you automatically succeed on the DC 15 Intelligence saving throw.",
      ...spell.description.slice(1)
    ]
  };
}

function createShadowArtsDarknessSpellEntry(spell: SpellEntry): SpellEntry {
  return appendSourcedDescriptionAddition(
    {
      ...spell,
      components: []
    },
    "Shadow Arts",
    [
      "This casting doesn't expend a spell slot or spell components. You can see within the spell's area when you cast it with this feature, and while the spell persists, you can move its area to a space within 60 feet of yourself at the start of each of your turns."
    ]
  );
}

function getDivineInterventionLevelGroups(spells: SpellEntry[]): Record<number, SpellEntry[]> {
  return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].reduce<Record<number, SpellEntry[]>>((groups, level) => {
    groups[level] = spells
      .filter((spell) => getSpellLevel(spell) === level)
      .sort((left, right) => left.name.localeCompare(right.name));

    return groups;
  }, {});
}

function getFixedSpellEntryForExecute(
  character: Character,
  execute: Extract<FeatureActionExecuteConfig, { kind: "spell" }>
): SpellEntry | null {
  if (!execute.spellId) {
    return null;
  }

  const spell = getSpellEntryById(execute.spellId);

  if (!spell) {
    return null;
  }

  const transformedSpell = getSpellEntryForCharacter(character, spell);

  if (execute.effectKind === "contact-patron") {
    return createContactPatronSpellEntry(transformedSpell);
  }

  if (execute.effectKind === "shadow-arts-darkness") {
    return createShadowArtsDarknessSpellEntry(transformedSpell);
  }

  if (execute.effectKind === "mantle-of-majesty") {
    return {
      ...transformedSpell,
      castingTime: [ACTION_TYPE.BONUS_ACTION]
    };
  }

  return transformedSpell;
}

function FeatureOptionsActionBody({
  action,
  character,
  roundTracker,
  selectedOptionKeys,
  onToggleOption
}: {
  action: Extract<GameplayActionDefinition, { kind: "feature" }>;
  character: Character;
  roundTracker: RoundTrackerAvailability;
  selectedOptionKeys: string[];
  onToggleOption: (option: FeatureActionOptionCard) => void;
}) {
  const drawer = action.drawer.kind === "options" ? action.drawer : null;
  const selection = drawer?.selection ?? "single-immediate";
  const options = drawer?.options ?? [];
  const selectionLimit = drawer?.selectionLimit ?? options.length;

  return (
    <>
      <div className={clsx(sharedModalStyles.featureActionOptionGrid)}>
        {options.map((option) => {
          const isSelected = selectedOptionKeys.includes(option.key);
          const isDisabled =
            selection === "multi-confirm" &&
            !isSelected &&
            (option.disabled === true || selectedOptionKeys.length >= selectionLimit);
          const resolvedOption = isDisabled ? { ...option, disabled: true } : option;

          return (
            <FeatureActionOptionButton
              key={option.key}
              option={resolvedOption}
              character={character}
              roundTracker={roundTracker}
              selected={isSelected}
              selectionIndicatorType={selection === "multi-confirm" ? "checkbox" : "radio"}
              selectionName={selection === "multi-confirm" ? undefined : action.action.key}
              onClick={() => onToggleOption(option)}
              formatValueLabel={formatFeatureActionOptionValueLabel}
            />
          );
        })}
      </div>
    </>
  );
}

function ArcaneRecoveryActionBody({
  character,
  onRecover
}: {
  character: Character;
  onRecover: (selection: ArcaneRecoverySelection) => void;
}) {
  const [selection, setSelection] = useState<ArcaneRecoverySelection>({});
  const recoveryLimit = getArcaneRecoveryRecoveryLevelLimit(character);
  const spellSlotTotals = getSpellSlotTotalsForCharacter(character.className, character.level);
  const spellSlotsExpended = normalizeSpellSlotsExpended(
    character.spellSlotsExpended,
    spellSlotTotals
  );
  const selectedLevelTotal = ([1, 2, 3, 4, 5] as const).reduce(
    (total, slotLevel) => total + (selection[slotLevel] ?? 0) * slotLevel,
    0
  );
  const availableOptions = useMemo(
    () =>
      ([1, 2, 3, 4, 5] as const)
        .map((slotLevel) => {
          const totalSlots = spellSlotTotals[slotLevel - 1] ?? 0;
          const expendedSlots = spellSlotsExpended[slotLevel - 1] ?? 0;

          return {
            slotLevel,
            totalSlots,
            expendedSlots,
            selectedCount: selection[slotLevel] ?? 0
          };
        })
        .filter((option) => option.totalSlots > 0 && option.expendedSlots > 0),
    [selection, spellSlotTotals, spellSlotsExpended]
  );

  function updateSelection(slotLevel: 1 | 2 | 3 | 4 | 5, delta: -1 | 1) {
    setSelection((current) => {
      const currentCount = current[slotLevel] ?? 0;
      const expendedCount = spellSlotsExpended[slotLevel - 1] ?? 0;
      const currentTotal = ([1, 2, 3, 4, 5] as const).reduce(
        (total, level) => total + (current[level] ?? 0) * level,
        0
      );
      const nextCount =
        delta < 0
          ? Math.max(0, currentCount - 1)
          : Math.min(
              expendedCount,
              currentCount + 1,
              currentCount + Math.floor((recoveryLimit - currentTotal) / slotLevel)
            );

      return nextCount <= 0
        ? Object.fromEntries(
            Object.entries(current).filter(([level]) => Number(level) !== slotLevel)
          )
        : {
            ...current,
            [slotLevel]: nextCount
          };
    });
  }

  return (
    <>
      <div className={arcaneRecoveryStyles.arcaneRecoverySummary}>
        <span className={arcaneRecoveryStyles.arcaneRecoverySummaryLabel}>Recovery Budget</span>
        <strong>{`${selectedLevelTotal}/${recoveryLimit} slot levels selected`}</strong>
      </div>

      {availableOptions.length > 0 ? (
        <div className={arcaneRecoveryStyles.arcaneRecoveryGrid}>
          {availableOptions.map((option) => {
            const remainingBudget = recoveryLimit - selectedLevelTotal;
            const canDecrease = option.selectedCount > 0;
            const canIncrease =
              option.selectedCount < option.expendedSlots && remainingBudget >= option.slotLevel;

            return (
              <div
                key={`arcane-recovery-level-${option.slotLevel}`}
                className={arcaneRecoveryStyles.arcaneRecoveryCard}
              >
                <div className={arcaneRecoveryStyles.arcaneRecoveryCardHeader}>
                  <strong>{`Level ${option.slotLevel} Slot`}</strong>
                  <small>{`${option.expendedSlots} expended`}</small>
                </div>
                <div className={arcaneRecoveryStyles.arcaneRecoveryControlRow}>
                  <button
                    type="button"
                    className={arcaneRecoveryStyles.arcaneRecoveryControlButton}
                    onClick={() => updateSelection(option.slotLevel, -1)}
                    disabled={!canDecrease}
                    aria-label={`Recover one fewer level ${option.slotLevel} slot`}
                  >
                    <Minus size={15} />
                  </button>
                  <span className={arcaneRecoveryStyles.arcaneRecoveryCount}>
                    {option.selectedCount}
                  </span>
                  <button
                    type="button"
                    className={arcaneRecoveryStyles.arcaneRecoveryControlButton}
                    onClick={() => updateSelection(option.slotLevel, 1)}
                    disabled={!canIncrease}
                    aria-label={`Recover one more level ${option.slotLevel} slot`}
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className={shared.emptyText}>
          No expended spell slots of level 1-5 can be recovered right now.
        </p>
      )}

      <div className={shared.formActions}>
        <button
          type="button"
          className={sheetStyles.castButton}
          disabled={selectedLevelTotal <= 0}
          onClick={() => onRecover(selection)}
        >
          Recover Spell Slots
        </button>
      </div>
    </>
  );
}

function FontOfMagicActionBody({
  actionWarning,
  character,
  selectedSelection,
  onSelectSelection
}: {
  actionWarning: string | null;
  character: Character;
  selectedSelection: FontOfMagicSelection | null;
  onSelectSelection: (selection: FontOfMagicSelection) => void;
}) {
  const sorceryPointsRemaining = getSorceryPointsRemainingForCharacter(character);
  const spellSlotTotals = getSpellSlotTotalsForCharacter(character.className, character.level);
  const spellSlotsExpended = normalizeSpellSlotsExpended(
    character.spellSlotsExpended,
    spellSlotTotals
  );
  const spellSlotsRemaining = spellSlotTotals.map((total, index) =>
    Math.max(0, total - (spellSlotsExpended[index] ?? 0))
  );
  const spellSlotCreationRules = [
    { spellSlotLevel: 1, sorceryPointCost: 2, minimumSorcererLevel: 2 },
    { spellSlotLevel: 2, sorceryPointCost: 3, minimumSorcererLevel: 3 },
    { spellSlotLevel: 3, sorceryPointCost: 5, minimumSorcererLevel: 5 },
    { spellSlotLevel: 4, sorceryPointCost: 6, minimumSorcererLevel: 7 },
    { spellSlotLevel: 5, sorceryPointCost: 7, minimumSorcererLevel: 9 }
  ].filter((rule) => character.level >= rule.minimumSorcererLevel);
  const spellSlotToPointOptions = spellSlotTotals
    .map((total, index) => {
      const spellSlotLevel = index + 1;
      const remainingSlots = spellSlotsRemaining[index] ?? 0;
      const disabledReason =
        total <= 0
          ? "You don't have spell slots of this level."
          : remainingSlots <= 0
            ? "No spell slots of this level remain."
            : null;

      return {
        spellSlotLevel,
        total,
        remainingSlots,
        disabledReason
      };
    })
    .filter((option) => option.total > 0);

  return (
    <>
      <div className={fontOfMagicStyles.fontOfMagicSections}>
        <section className={fontOfMagicStyles.fontOfMagicSection}>
          <div className={fontOfMagicStyles.fontOfMagicSectionHeader}>
            <div>
              <h4>Spell Slot to Sorcery Points</h4>
              <p className={shared.helperText}>No action required.</p>
            </div>
          </div>

          {spellSlotToPointOptions.length > 0 ? (
            <div className={fontOfMagicStyles.fontOfMagicOptionGrid}>
              {spellSlotToPointOptions.map((option) => (
                <button
                  key={`font-of-magic-slot-to-points-${option.spellSlotLevel}`}
                  type="button"
                  className={clsx(
                    fontOfMagicStyles.fontOfMagicOptionButton,
                    selectedSelection?.kind === "slot-to-points" &&
                      selectedSelection.spellSlotLevel === option.spellSlotLevel &&
                      fontOfMagicStyles.fontOfMagicOptionButtonSelected
                  )}
                  disabled={option.disabledReason !== null}
                  onClick={() =>
                    onSelectSelection({
                      kind: "slot-to-points",
                      spellSlotLevel: option.spellSlotLevel
                    })
                  }
                >
                  <strong className={fontOfMagicStyles.fontOfMagicCompactLabel}>
                    <span>Level {option.spellSlotLevel} Slot</span>
                    <span aria-hidden="true">-&gt;</span>
                    <span className={fontOfMagicStyles.fontOfMagicSparkleValue}>
                      <span>{option.spellSlotLevel}</span>
                      <Sparkles size={14} />
                    </span>
                  </strong>
                </button>
              ))}
            </div>
          ) : (
            <p className={shared.emptyText}>No spell slots are available to convert right now.</p>
          )}
        </section>

        <section className={fontOfMagicStyles.fontOfMagicSection}>
          <div className={fontOfMagicStyles.fontOfMagicSectionHeader}>
            <div>
              <h4>Sorcery Points to Spell Slot</h4>
              <p className={shared.helperText}>Uses your Bonus Action.</p>
            </div>
            {actionWarning ? (
              <span className={fontOfMagicStyles.fontOfMagicWarning}>{actionWarning}</span>
            ) : null}
          </div>

          <div className={fontOfMagicStyles.fontOfMagicOptionGrid}>
            {spellSlotCreationRules.map((rule) => {
              const slotIndex = rule.spellSlotLevel - 1;
              const expendedSlots = spellSlotsExpended[slotIndex] ?? 0;
              const disabledReason =
                actionWarning ??
                (expendedSlots <= 0
                  ? "You already have all of those spell slots."
                  : sorceryPointsRemaining < rule.sorceryPointCost
                    ? `You need ${rule.sorceryPointCost} Sorcery Points.`
                    : null);

              return (
                <button
                  key={`font-of-magic-points-to-slot-${rule.spellSlotLevel}`}
                  type="button"
                  className={clsx(
                    fontOfMagicStyles.fontOfMagicOptionButton,
                    selectedSelection?.kind === "points-to-slot" &&
                      selectedSelection.spellSlotLevel === rule.spellSlotLevel &&
                      fontOfMagicStyles.fontOfMagicOptionButtonSelected
                  )}
                  disabled={disabledReason !== null}
                  onClick={() =>
                    onSelectSelection({
                      kind: "points-to-slot",
                      spellSlotLevel: rule.spellSlotLevel
                    })
                  }
                >
                  <strong className={fontOfMagicStyles.fontOfMagicCompactLabel}>
                    <span className={fontOfMagicStyles.fontOfMagicSparkleValue}>
                      <span>{rule.sorceryPointCost}</span>
                      <Sparkles size={14} />
                    </span>
                    <span aria-hidden="true">-&gt;</span>
                    <span>Level {rule.spellSlotLevel} Slot</span>
                  </strong>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}

function RageActionBody({
  action,
  rageOptions,
  powerOptions,
  rageOfTheGodsDescription,
  selectedRageOptionKey,
  selectedPowerOptionKey,
  onSelectRageOption,
  onSelectPowerOption,
  rageOfTheGodsUsesRemaining,
  rageOfTheGodsUsesTotal,
  isRageOfTheGodsSelected,
  onToggleRageOfTheGods
}: {
  action: FeatureActionCard;
  rageOptions: FeatureActionOptionCard[];
  powerOptions: FeatureActionOptionCard[];
  rageOfTheGodsDescription: SpellDescriptionEntry[];
  selectedRageOptionKey: string | null;
  selectedPowerOptionKey: string | null;
  onSelectRageOption: (optionKey: string) => void;
  onSelectPowerOption: (optionKey: string) => void;
  rageOfTheGodsUsesRemaining: number;
  rageOfTheGodsUsesTotal: number;
  isRageOfTheGodsSelected: boolean;
  onToggleRageOfTheGods: (checked: boolean) => void;
}) {
  return (
    <>
      {rageOptions.length > 0 ? (
        <section className={sharedModalStyles.wildHeartRageSection}>
          <div className={sharedModalStyles.wildHeartRageSectionHeading}>
            <h4 className={sharedModalStyles.wildHeartRageSectionTitle}>Rage of the Wilds</h4>
            <p className={sharedModalStyles.wildHeartRageSectionDescription}>
              Choose 1 option for this Rage.
            </p>
          </div>
          <div className={sharedModalStyles.wildHeartRageSectionOptions}>
            {rageOptions.map((option) => (
              <FeatureActionChoiceRow
                key={option.key}
                option={option}
                groupName={`feature-action-choice-${action.key}-rage`}
                selected={selectedRageOptionKey === option.key}
                onClick={() => onSelectRageOption(option.key)}
              />
            ))}
          </div>
        </section>
      ) : null}

      {powerOptions.length > 0 ? (
        <section className={sharedModalStyles.wildHeartRageSection}>
          <div className={sharedModalStyles.wildHeartRageSectionHeading}>
            <h4 className={sharedModalStyles.wildHeartRageSectionTitle}>Power of the Wilds</h4>
            <p className={sharedModalStyles.wildHeartRageSectionDescription}>
              Choose 1 option for this Rage.
            </p>
          </div>
          <div className={sharedModalStyles.wildHeartRageSectionOptions}>
            {powerOptions.map((option) => (
              <FeatureActionChoiceRow
                key={option.key}
                option={option}
                groupName={`feature-action-choice-${action.key}-power`}
                selected={selectedPowerOptionKey === option.key}
                onClick={() => onSelectPowerOption(option.key)}
              />
            ))}
          </div>
        </section>
      ) : null}

      {rageOfTheGodsUsesTotal > 0 ? (
        <section className={sharedModalStyles.wildHeartRageSection}>
          <div className={sharedModalStyles.wildHeartRageSectionHeading}>
            <h4 className={sharedModalStyles.wildHeartRageSectionTitle}>Rage of the Gods</h4>
            <p className={sharedModalStyles.wildHeartRageSectionDescription}>
              Choose whether to empower this Rage with your divine warrior form.
            </p>
          </div>
          <RadioContainerOption
            header="Use Rage of the Gods"
            breakdown={
              rageOfTheGodsDescription.length > 0 ? (
                <DescriptionContent
                  description={rageOfTheGodsDescription}
                  className={styles.rageEnhancementDescription}
                  entryClassName={styles.rageEnhancementDescriptionLine}
                />
              ) : (
                "You can assume the form of a divine warrior for a minute."
              )
            }
            selected={isRageOfTheGodsSelected}
            onSelect={() => onToggleRageOfTheGods(!isRageOfTheGodsSelected)}
            disabled={rageOfTheGodsUsesRemaining <= 0}
            indicatorType="checkbox"
            aside={
              <span className={styles.rageEnhancementMeta}>
                <span className={styles.rageEnhancementModeBadge}>Opt-in</span>
                <span>{`${rageOfTheGodsUsesRemaining}/${rageOfTheGodsUsesTotal}`}</span>
                <Flame size={14} />
              </span>
            }
          />
        </section>
      ) : null}
    </>
  );
}

function BrutalStrikeActionBody({
  options,
  selectionLimit,
  damageFormula,
  selectedOptionKeys,
  onToggleOption
}: {
  options: FeatureActionOptionCard[];
  selectionLimit: number;
  damageFormula: string;
  selectedOptionKeys: string[];
  onToggleOption: (optionKey: string) => void;
}) {
  const allowsMultipleSelections = selectionLimit > 1;
  const helperText = allowsMultipleSelections
    ? `Applying Brutal Strike adds the extra ${damageFormula} damage. You can optionally choose up to ${selectionLimit} different effects below.`
    : `Applying Brutal Strike adds the extra ${damageFormula} damage. You can optionally choose one effect below.`;

  return (
    <>
      <p className={shared.helperText}>{helperText}</p>
      <div className={sharedModalStyles.brutalStrikeOptionList}>
        {options.map((option) => {
          const isSelected = selectedOptionKeys.includes(option.key);
          const isSelectionLimitReached =
            !isSelected && selectionLimit > 0 && selectedOptionKeys.length >= selectionLimit;

          return (
            <RadioContainerOption
              key={option.key}
              header={option.name}
              breakdown={option.detail}
              selected={isSelected}
              indicatorType={allowsMultipleSelections ? "checkbox" : "radio"}
              disabled={isSelectionLimitReached}
              onSelect={() => onToggleOption(option.key)}
            />
          );
        })}
      </div>
    </>
  );
}

function DivineInterventionActionBody({
  character,
  onSpellSelect
}: {
  character: Character;
  onSpellSelect: (spell: SpellEntry) => void;
}) {
  const [activeLevel, setActiveLevel] = useState(0);
  const enabledLevels = useMemo(
    () => getClericDivineInterventionEnabledLevels(character),
    [character]
  );
  const spellEntries = useMemo(
    () => getClericDivineInterventionSpellEntries(character),
    [character]
  );
  const spellGroups = useMemo(() => getDivineInterventionLevelGroups(spellEntries), [spellEntries]);
  const firstAvailableLevel = useMemo(
    () =>
      enabledLevels.find((level) => (spellGroups[level]?.length ?? 0) > 0) ?? enabledLevels[0] ?? 0,
    [enabledLevels, spellGroups]
  );
  const activeSpells = spellGroups[activeLevel] ?? [];
  const outcomeSummariesById = useMemo(
    () =>
      new Map(
        spellEntries.map((spell) => [
          spell.id,
          getSpellOutcomeSummaryForCharacter(character, spell)
        ])
      ),
    [character, spellEntries]
  );

  useEffect(() => {
    setActiveLevel((currentLevel) => {
      if (enabledLevels.includes(currentLevel) && (spellGroups[currentLevel]?.length ?? 0) > 0) {
        return currentLevel;
      }

      return firstAvailableLevel;
    });
  }, [enabledLevels, spellGroups, firstAvailableLevel]);

  return (
    <>
      <div className={divineStyles.divineInterventionTabRow}>
        <span className={divineStyles.divineInterventionTabLabel}>Level</span>
        <div
          className={divineStyles.divineInterventionTabList}
          role="tablist"
          aria-label="Divine Intervention spell levels"
        >
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => {
            const isDisabled = !enabledLevels.includes(level);

            return (
              <button
                key={`divine-intervention-level-${level}`}
                type="button"
                role="tab"
                aria-selected={activeLevel === level}
                className={clsx(
                  divineStyles.divineInterventionTabButton,
                  activeLevel === level && divineStyles.divineInterventionTabButtonActive
                )}
                onClick={() => setActiveLevel(level)}
                disabled={isDisabled}
              >
                {level === 0 ? "C" : level}
              </button>
            );
          })}
        </div>
      </div>

      <div className={clsx(sheetStyles.spellManagementList, divineStyles.divineInterventionList)}>
        {activeSpells.length === 0 ? (
          <p className={shared.emptyText}>No spells are available at this level.</p>
        ) : (
          <ul className={divineStyles.divineInterventionSelectionList}>
            {activeSpells.map((spell) => (
              <li key={spell.id}>
                <SpellListRow
                  spell={spell}
                  onClick={() => onSpellSelect(spell)}
                  valueSummary={outcomeSummariesById.get(spell.id) ?? ""}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function MysticArcanumActionBody({
  character,
  onSpellSelect
}: {
  character: Character;
  onSpellSelect: (spellLevel: number, spell: SpellEntry) => void;
}) {
  const selections = useMemo(
    () => getWarlockMysticArcanumSelectionsForCharacter(character),
    [character]
  );
  const spells = useMemo(
    () =>
      selections.flatMap((selection) =>
        selection.spell
          ? [
              {
                spellLevel: selection.spellLevel,
                spell: selection.spell,
                expended: selection.expended
              }
            ]
          : []
      ),
    [selections]
  );

  return (
    <div className={clsx(sheetStyles.spellManagementList, divineStyles.divineInterventionList)}>
      {spells.length === 0 ? (
        <p className={shared.emptyText}>
          No Mystic Arcanum spells are selected yet. Choose them in Class Features & Feats.
        </p>
      ) : (
        <ul className={divineStyles.divineInterventionSelectionList}>
          {spells.map(({ spellLevel, spell, expended }) => (
            <li key={`${spell.id}-${spellLevel}`}>
              <SpellListRow
                spell={spell}
                onClick={() => onSpellSelect(spellLevel, spell)}
                disabled={expended}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function WildShapeActionBody({
  monsters,
  selectedMonsterSlug,
  onSelectMonster,
  onPreviewMonster
}: {
  monsters: MonsterRecord[];
  selectedMonsterSlug: string | null;
  onSelectMonster: (monsterSlug: string) => void;
  onPreviewMonster: (monsterSlug: string) => void;
}) {
  if (monsters.length === 0) {
    return <p className={shared.emptyText}>No Beast Shapes are selected yet.</p>;
  }

  return (
    <div className={styles.wildShapeBody}>
      {monsters.map((monster) => (
        <RadioContainerOption
          key={monster.slug}
          name="wild-shape-monster"
          header={monster.name}
          breakdown={
            <span className={styles.wildShapeOptionDescription}>
              {formatWildShapeMonsterMeta(monster)}
            </span>
          }
          selected={selectedMonsterSlug === monster.slug}
          onSelect={() => onSelectMonster(monster.slug)}
          className={styles.wildShapeOption}
          asideClassName={styles.wildShapeReferenceAside}
          aside={
            <button
              type="button"
              className={styles.wildShapeReferenceButton}
              onClick={() => onPreviewMonster(monster.slug)}
              aria-label={`Open ${monster.name} details`}
            >
              <BookOpen aria-hidden="true" />
            </button>
          }
        />
      ))}
    </div>
  );
}

function WildCompanionActionBody({
  wildShapeUsesRemaining,
  wildShapeUsesTotal,
  spellSlotOptions,
  selectedResource,
  selectedSpellSlotLevel,
  onSelectResource,
  onSelectSpellSlotLevel
}: {
  wildShapeUsesRemaining: number;
  wildShapeUsesTotal: number;
  spellSlotOptions: Array<{
    level: number;
    remaining: number;
    total: number;
  }>;
  selectedResource: WildCompanionResourceKind;
  selectedSpellSlotLevel: number;
  onSelectResource: (resource: WildCompanionResourceKind) => void;
  onSelectSpellSlotLevel: (slotLevel: number) => void;
}) {
  const availableSpellSlotOptions = spellSlotOptions.filter((slot) => slot.remaining > 0);
  const hasAvailableSpellSlots = availableSpellSlotOptions.length > 0;

  return (
    <div className={styles.wildCompanionBody}>
      <RadioContainerOption
        name="wild-companion-resource"
        header="Use 1 Wild Shape"
        subheader={`${wildShapeUsesRemaining}/${wildShapeUsesTotal} uses remaining`}
        selected={selectedResource === "wild-shape"}
        onSelect={() => onSelectResource("wild-shape")}
        disabled={wildShapeUsesRemaining <= 0}
      />
      <RadioContainerOption
        name="wild-companion-resource"
        header="Use Spell Slot"
        breakdown={
          hasAvailableSpellSlots
            ? `${availableSpellSlotOptions.reduce((sum, slot) => sum + slot.remaining, 0)} spell slots available`
            : "No spell slots available"
        }
        selected={selectedResource === "spell-slot"}
        onSelect={() => onSelectResource("spell-slot")}
        disabled={!hasAvailableSpellSlots}
      />
      {selectedResource === "spell-slot" && hasAvailableSpellSlots ? (
        <label className={styles.wildCompanionSelectField}>
          <span className={styles.wildCompanionSelectLabel}>Spell Slot</span>
          <SelectInput
            aria-label="Wild Companion spell slot"
            value={selectedSpellSlotLevel}
            className={styles.wildCompanionSelect}
            onChange={(event) => onSelectSpellSlotLevel(Number(event.target.value))}
          >
            {availableSpellSlotOptions.map((slot) => (
              <option key={`wild-companion-slot-${slot.level}`} value={slot.level}>
                Level {slot.level} ({slot.remaining}/{slot.total})
              </option>
            ))}
          </SelectInput>
        </label>
      ) : null}
    </div>
  );
}

function NatureMagicianActionBody({
  options,
  selectedSpellSlotLevel,
  onSelectSpellSlotLevel
}: {
  options: Array<{
    wildShapeCost: number;
    spellSlotLevel: number;
  }>;
  selectedSpellSlotLevel: number | null;
  onSelectSpellSlotLevel: (spellSlotLevel: number) => void;
}) {
  if (options.length <= 0) {
    return (
      <p className={shared.emptyText}>
        No matching expended spell slots can be restored right now.
      </p>
    );
  }

  return (
    <div className={styles.natureMagicianBody}>
      {options.map((option) => (
        <RadioContainerOption
          key={`nature-magician-${option.spellSlotLevel}`}
          name="nature-magician-option"
          header={`Recover 1 level ${option.spellSlotLevel} spell slot`}
          subheader={`Use ${option.wildShapeCost} Wild Shape`}
          selected={selectedSpellSlotLevel === option.spellSlotLevel}
          onSelect={() => onSelectSpellSlotLevel(option.spellSlotLevel)}
        />
      ))}
    </div>
  );
}

function WildResurgenceActionBody({
  spellSlotOptions,
  selectedMode,
  selectedSpellSlotLevel,
  wildShapeUsesRemaining,
  wildShapeUsesTotal,
  levelOneSpellSlotRemaining,
  levelOneSpellSlotTotal,
  spellSlotRecoveryUsesRemaining,
  onSelectMode,
  onSelectSpellSlotLevel
}: {
  spellSlotOptions: Array<{
    level: number;
    remaining: number;
    total: number;
  }>;
  selectedMode: WildResurgenceMode | null;
  selectedSpellSlotLevel: number;
  wildShapeUsesRemaining: number;
  wildShapeUsesTotal: number;
  levelOneSpellSlotRemaining: number;
  levelOneSpellSlotTotal: number;
  spellSlotRecoveryUsesRemaining: number;
  onSelectMode: (mode: WildResurgenceMode) => void;
  onSelectSpellSlotLevel: (slotLevel: number) => void;
}) {
  const availableSpellSlotOptions = spellSlotOptions.filter((slot) => slot.remaining > 0);
  const canRecoverWildShape = availableSpellSlotOptions.length > 0;
  const canRecoverLevelOneSpellSlot =
    spellSlotRecoveryUsesRemaining > 0 &&
    wildShapeUsesRemaining > 0 &&
    levelOneSpellSlotRemaining < levelOneSpellSlotTotal;

  return (
    <div className={styles.wildCompanionBody}>
      <RadioContainerOption
        name="wild-resurgence-mode"
        header="Recover 1 Wild Shape"
        breakdown={
          canRecoverWildShape
            ? "Expend an available spell slot. This can be done only once on each of your turns."
            : "Requires 0 Wild Shape remaining and an available spell slot"
        }
        selected={selectedMode === "spell-slot-to-wild-shape"}
        onSelect={() => onSelectMode("spell-slot-to-wild-shape")}
        disabled={!canRecoverWildShape}
      />
      {selectedMode === "spell-slot-to-wild-shape" && canRecoverWildShape ? (
        <label className={styles.wildCompanionSelectField}>
          <span className={styles.wildCompanionSelectLabel}>Spell Slot</span>
          <SelectInput
            aria-label="Wild Resurgence spell slot"
            value={selectedSpellSlotLevel}
            className={styles.wildCompanionSelect}
            onChange={(event) => onSelectSpellSlotLevel(Number(event.target.value))}
          >
            {availableSpellSlotOptions.map((slot) => (
              <option key={`wild-resurgence-slot-${slot.level}`} value={slot.level}>
                Level {slot.level} ({slot.remaining}/{slot.total})
              </option>
            ))}
          </SelectInput>
        </label>
      ) : null}
      <RadioContainerOption
        name="wild-resurgence-mode"
        header="Recover 1 Level 1 Spell Slot"
        breakdown={
          canRecoverLevelOneSpellSlot
            ? `${wildShapeUsesRemaining}/${wildShapeUsesTotal} Wild Shape uses remaining, ${spellSlotRecoveryUsesRemaining}/1 charge available`
            : "Requires 1 Wild Shape, an expended level 1 slot, and an unused charge"
        }
        selected={selectedMode === "wild-shape-to-slot"}
        onSelect={() => onSelectMode("wild-shape-to-slot")}
        disabled={!canRecoverLevelOneSpellSlot}
      />
    </div>
  );
}

function ActionsWidget({ character, onPersistCharacter }: ActionsWidgetProps) {
  const [isCommonActionsOpen, setIsCommonActionsOpen] = useState(false);
  const nextRollCriticalHitOverride = useAppSelector(
    (state) => state.diceRoller.nextRollCriticalHitOverride
  );
  const [selectedActionKey, setSelectedActionKey] = useState<string | null>(null);
  const [selectedActionOptionKeys, setSelectedActionOptionKeys] = useState<string[]>([]);
  const [selectedChannelDivinityOptionKey, setSelectedChannelDivinityOptionKey] = useState<
    string | null
  >(null);
  const [selectedFontOfMagicSelection, setSelectedFontOfMagicSelection] =
    useState<FontOfMagicSelection | null>(null);
  const [selectedWildShapeMonsterSlug, setSelectedWildShapeMonsterSlug] = useState<string | null>(
    null
  );
  const [selectedWildCompanionResource, setSelectedWildCompanionResource] =
    useState<WildCompanionResourceKind>("wild-shape");
  const [selectedBardicInspirationSpellSlotLevel, setSelectedBardicInspirationSpellSlotLevel] =
    useState<number | null>(null);
  const [selectedWildCompanionSpellSlotLevel, setSelectedWildCompanionSpellSlotLevel] = useState(1);
  const [selectedWildResurgenceMode, setSelectedWildResurgenceMode] =
    useState<WildResurgenceMode | null>(null);
  const [selectedWildResurgenceSpellSlotLevel, setSelectedWildResurgenceSpellSlotLevel] =
    useState(1);
  const [selectedNatureMagicianSpellSlotLevel, setSelectedNatureMagicianSpellSlotLevel] = useState<
    number | null
  >(null);
  const [selectedLayOnHandsTarget, setSelectedLayOnHandsTarget] =
    useState<LayOnHandsTarget>("self");
  const [selectedLayOnHandsPoolSpendInput, setSelectedLayOnHandsPoolSpendInput] = useState("0");
  const [selectedLayOnHandsConditions, setSelectedLayOnHandsConditions] = useState<
    LayOnHandsCondition[]
  >([]);
  const [selectedBlessingOfTheTricksterTarget, setSelectedBlessingOfTheTricksterTarget] =
    useState<BlessingOfTheTricksterTarget>("self");
  const [selectedThirdEyeOptionKey, setSelectedThirdEyeOptionKey] =
    useState<WizardDivinerThirdEyeOptionKey | null>(null);
  const [selectedStarryFormConstellation, setSelectedStarryFormConstellation] =
    useState<DruidStarryFormConstellation | null>(null);
  const [selectedWildShapePreviewSlug, setSelectedWildShapePreviewSlug] = useState<string | null>(
    null
  );
  const [selectedWildShapePreviewMonster, setSelectedWildShapePreviewMonster] =
    useState<MonsterRecord | null>(null);
  const [selectedWildShapePreviewStatus, setSelectedWildShapePreviewStatus] =
    useState<CodexStatus>("ready");
  const [selectedRageOptionKey, setSelectedRageOptionKey] = useState<string | null>(null);
  const [selectedRagePowerOptionKey, setSelectedRagePowerOptionKey] = useState<string | null>(null);
  const [isRageOfTheGodsSelected, setIsRageOfTheGodsSelected] = useState(false);
  const [selectedIndomitableAbility, setSelectedIndomitableAbility] = useState<AbilityKey | null>(
    null
  );
  const [selectedWarriorOfTheGodsChargeCount, setSelectedWarriorOfTheGodsChargeCount] = useState(1);
  const [isFixedSpellDrawerOpen, setIsFixedSpellDrawerOpen] = useState(false);
  const [selectedFixedSpellSlotLevel, setSelectedFixedSpellSlotLevel] = useState(1);
  const [isDiceRollerSettingsOpen, setIsDiceRollerSettingsOpen] = useState(false);
  const [selectedDivineInterventionSpell, setSelectedDivineInterventionSpell] =
    useState<SpellEntry | null>(null);
  const [selectedMysticArcanumSpell, setSelectedMysticArcanumSpell] = useState<SpellEntry | null>(
    null
  );
  const [selectedMysticArcanumSpellLevel, setSelectedMysticArcanumSpellLevel] =
    useState<MysticArcanumLevel | null>(null);
  const [useBeguilingMagicOnActionSpell, setUseBeguilingMagicOnActionSpell] = useState(false);
  const [useElementalSmiteOnActionSpell, setUseElementalSmiteOnActionSpell] = useState(false);
  const [selectedElementalSmiteOptionOnActionSpell, setSelectedElementalSmiteOptionOnActionSpell] =
    useState<PaladinOathOfTheNobleGeniesElementalSmiteOptionKey | null>(null);
  const [useFrozenHauntOnActionSpell, setUseFrozenHauntOnActionSpell] = useState(false);
  const [selectedFrozenHauntFallbackSlotLevel, setSelectedFrozenHauntFallbackSlotLevel] = useState(
    frozenHauntFallbackSpellSlotMinimumLevel
  );
  const [isCrownOfSpellfireSelected, setIsCrownOfSpellfireSelected] = useState(false);
  const [isInspiredEclipseSelected, setIsInspiredEclipseSelected] = useState(false);
  const [isGroupRecoverySelected, setIsGroupRecoverySelected] = useState(false);
  const [isClairvoyantCombatantSelected, setIsClairvoyantCombatantSelected] = useState(false);
  const [isPsionicStrikeSelected, setIsPsionicStrikeSelected] = useState(false);
  const [isDreadfulStrikeSelected, setIsDreadfulStrikeSelected] = useState(false);
  const [isPolarStrikesSelected, setIsPolarStrikesSelected] = useState(false);
  const [isSacredWeaponSelected, setIsSacredWeaponSelected] = useState(false);
  const [isVowOfEnmitySelected, setIsVowOfEnmitySelected] = useState(false);
  const [isStunningStrikeSelected, setIsStunningStrikeSelected] = useState(false);
  const [isHandOfHarmSelected, setIsHandOfHarmSelected] = useState(false);
  const [isFlurryOfHealingAndHarmSelected, setIsFlurryOfHealingAndHarmSelected] = useState(false);
  const [isEmpoweredStrikesSelected, setIsEmpoweredStrikesSelected] = useState(false);
  const [isQuiveringPalmSelected, setIsQuiveringPalmSelected] = useState(false);
  const [isImprovedShadowStepSelected, setIsImprovedShadowStepSelected] = useState(false);
  const { openDiceRoller, diceRollerPopup } = useDiceRollerPopup();

  const roundTracker = normalizeRoundTracker(character.roundTracker);
  const combatActions = useMemo(() => getCombatActionsForCharacter(character), [character]);
  const commonActionCards = useMemo(
    () =>
      getCommonActionCards().map((action) => transformCommonActionForCharacter(character, action)),
    [character]
  );
  const commonActions = useMemo(
    () => commonActionCards.map(createCommonActionDefinition),
    [commonActionCards]
  );
  const selectableActions = useMemo(
    () => [...combatActions, ...commonActions],
    [combatActions, commonActions]
  );
  const customWeaponEntriesById = useMemo(
    () =>
      new Map(
        getResolvedCustomLoadoutEntries(character.customEquipment)
          .filter(
            (entry): entry is ResolvedCustomWeaponEntry =>
              entry.category === ENTRY_CATEGORIES.WEAPONS
          )
          .map((entry) => [entry.customEquipmentId, entry])
      ),
    [character.customEquipment]
  );
  const spellcastingState = getSpellcastingStateForCharacter(character);
  const beguilingMagicUsesTotal = useMemo(
    () => getBeguilingMagicUsesTotalForCharacter(character),
    [character.className, character.level, character.subclassId]
  );
  const beguilingMagicUsesRemaining = useMemo(
    () => getBeguilingMagicUsesRemainingForCharacter(character),
    [character.classFeatureState, character.className, character.level, character.subclassId]
  );
  const bardicInspirationUsesRemaining = useMemo(
    () => getBardicInspirationUsesRemainingForCharacter(character),
    [
      character.abilities,
      character.classFeatureState,
      character.className,
      character.feats,
      character.level
    ]
  );
  const mantleOfMajestyUsesRemaining = useMemo(
    () => getMantleOfMajestyUsesRemainingForCharacter(character),
    [character.classFeatureState, character.className, character.level, character.subclassId]
  );
  const fixedSpellSlotTotals = useMemo(
    () => getSpellSlotTotalsForCharacter(character.className, character.level),
    [character.className, character.level]
  );
  const fixedSpellSlotsExpended = useMemo(
    () => normalizeSpellSlotsExpended(character.spellSlotsExpended, fixedSpellSlotTotals),
    [character.spellSlotsExpended, fixedSpellSlotTotals]
  );
  const fixedSpellSlotsRemaining = useMemo(
    () =>
      fixedSpellSlotTotals.map((total, index) =>
        Math.max(0, total - (fixedSpellSlotsExpended[index] ?? 0))
      ),
    [fixedSpellSlotTotals, fixedSpellSlotsExpended]
  );
  const wildCompanionSpellSlotOptions = useMemo(
    () =>
      fixedSpellSlotTotals.flatMap((total, index) =>
        total > 0
          ? [
              {
                level: index + 1,
                remaining: fixedSpellSlotsRemaining[index] ?? 0,
                total
              }
            ]
          : []
      ),
    [fixedSpellSlotTotals, fixedSpellSlotsRemaining]
  );
  const bardicInspirationFallbackSpellSlotOptions = useMemo(
    () =>
      fixedSpellSlotTotals.flatMap((total, index) =>
        total > 0 && (fixedSpellSlotsRemaining[index] ?? 0) > 0
          ? [
              {
                level: index + 1,
                remaining: fixedSpellSlotsRemaining[index] ?? 0,
                total
              }
            ]
          : []
      ),
    [fixedSpellSlotTotals, fixedSpellSlotsRemaining]
  );
  const firstAvailableBardicInspirationSpellSlotLevel =
    bardicInspirationFallbackSpellSlotOptions[0]?.level ?? null;
  const firstAvailableWildCompanionSpellSlotLevel =
    wildCompanionSpellSlotOptions.find((slot) => slot.remaining > 0)?.level ?? null;
  const wildResurgenceAvailableSpellSlotLevels = useMemo(
    () => getDruidWildResurgenceAvailableSpellSlotLevelsForCharacter(character),
    [
      character.classFeatureState,
      character.className,
      character.level,
      character.spellSlotsExpended
    ]
  );
  const wildResurgenceSpellSlotOptions = useMemo(
    () =>
      fixedSpellSlotTotals.flatMap((total, index) =>
        total > 0 && wildResurgenceAvailableSpellSlotLevels.includes(index + 1)
          ? [
              {
                level: index + 1,
                remaining: fixedSpellSlotsRemaining[index] ?? 0,
                total
              }
            ]
          : []
      ),
    [fixedSpellSlotTotals, fixedSpellSlotsRemaining, wildResurgenceAvailableSpellSlotLevels]
  );
  const firstAvailableWildResurgenceSpellSlotLevel =
    wildResurgenceSpellSlotOptions.find((slot) => slot.remaining > 0)?.level ?? null;
  const natureMagicianOptions = useMemo(
    () => getDruidNatureMagicianOptionsForCharacter(character),
    [
      character.classFeatureState,
      character.className,
      character.level,
      character.spellSlotsExpended
    ]
  );
  const effectiveAbilities = useMemo(() => getAbilityScoresForCharacter(character), [character]);
  const selectedAction =
    selectedActionKey !== null
      ? (selectableActions.find((combatAction) => combatAction.key === selectedActionKey) ?? null)
      : null;
  const selectedFeatureAction = selectedAction?.kind === "feature" ? selectedAction.action : null;
  const isLayOnHandsActionSelected =
    selectedAction?.kind === "feature" &&
    selectedAction.drawer.kind === "custom-form" &&
    selectedAction.drawer.formKind === "lay-on-hands";
  const selectedLayOnHandsTotalPool = isLayOnHandsActionSelected
    ? getPaladinHealingPoolTotalForCharacter(character)
    : 0;
  const selectedLayOnHandsRemainingPool = isLayOnHandsActionSelected
    ? getPaladinHealingPoolRemainingForCharacter(character)
    : 0;
  const selectedLayOnHandsPoolSpendAmount = Math.max(
    0,
    Math.floor(Number(selectedLayOnHandsPoolSpendInput) || 0)
  );
  const selectedLayOnHandsTotalCost =
    selectedLayOnHandsPoolSpendAmount + selectedLayOnHandsConditions.length * 5;
  const selectedLayOnHandsWarning =
    isLayOnHandsActionSelected && selectedLayOnHandsTotalCost > selectedLayOnHandsRemainingPool
      ? "Not enough Pool of Healing remains for that use."
      : null;
  const canSubmitLayOnHands =
    isLayOnHandsActionSelected &&
    selectedLayOnHandsTotalCost > 0 &&
    selectedLayOnHandsWarning === null;
  const selectedMonkElementalAttunementResistanceDamageType =
    selectedFeatureAction?.key === monkElementalAttunementActionKey
      ? getMonkWarriorOfTheElementsElementalResistanceDamageTypeSelection(character)
      : null;
  const selectedCombatSuperiorityDie =
    selectedFeatureAction?.key === fighterBattleMasterCombatSuperiorityActionKey
      ? getFighterBattleMasterSuperiorityDieForCharacter(character)
      : null;
  const selectedActionBadges = selectedCombatSuperiorityDie
    ? [`Current ${selectedCombatSuperiorityDie.toUpperCase()}`]
    : [];
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
  const selectedWeaponAction = selectedAction?.kind === "weapon" ? selectedAction.action : null;
  const selectedWeaponEntry = useMemo(() => {
    if (!selectedWeaponAction) {
      return null;
    }

    if (selectedWeaponAction.key.startsWith("custom-")) {
      return customWeaponEntriesById.get(selectedWeaponAction.key.replace(/^custom-/, "")) ?? null;
    }

    return codexWeaponEntriesByName.get(selectedWeaponAction.name) ?? null;
  }, [customWeaponEntriesById, selectedWeaponAction]);
  const selectedWeaponItemRecord = useMemo(() => {
    if (!selectedWeaponAction || !selectedWeaponAction.key.startsWith("inventory-")) {
      return null;
    }

    const inventoryItemId = selectedWeaponAction.key.replace(/^inventory-/, "");

    return character.inventoryItems.find((entry) => entry.id === inventoryItemId)?.item ?? null;
  }, [character.inventoryItems, selectedWeaponAction]);
  const selectedWeaponHasActiveMastery = useMemo(() => {
    if (!selectedWeaponAction) {
      return false;
    }

    if (selectedWeaponEntry?.baseWeapon) {
      return hasActiveWeaponMastery(character.weaponProficiencies, {
        baseWeapon: selectedWeaponEntry.baseWeapon
      });
    }

    if (selectedWeaponItemRecord?.weapon) {
      return hasActiveWeaponMastery(character.weaponProficiencies, selectedWeaponItemRecord.weapon);
    }

    return false;
  }, [
    character.weaponProficiencies,
    selectedWeaponAction,
    selectedWeaponEntry,
    selectedWeaponItemRecord
  ]);
  const selectedWeaponHasProficiency = useMemo(() => {
    if (!selectedWeaponAction) {
      return false;
    }

    if (selectedWeaponItemRecord) {
      const adaptedWeapon = adaptItemWeapon(selectedWeaponItemRecord);

      if (!adaptedWeapon) {
        return false;
      }

      return hasAppliedWeaponProficiency(character.weaponProficiencies, {
        training: adaptedWeapon.type.training,
        combatType: adaptedWeapon.type.combat,
        properties: adaptedWeapon.properties,
        name: selectedWeaponItemRecord.weapon?.name,
        key: selectedWeaponItemRecord.weapon?.key
      });
    }

    if (selectedWeaponEntry) {
      return hasAppliedWeaponProficiency(character.weaponProficiencies, {
        training: selectedWeaponEntry.type.training,
        combatType: selectedWeaponEntry.type.combat,
        properties: selectedWeaponEntry.properties,
        baseWeapon: selectedWeaponEntry.baseWeapon
      });
    }

    return false;
  }, [
    character.weaponProficiencies,
    selectedWeaponAction,
    selectedWeaponEntry,
    selectedWeaponItemRecord
  ]);
  const selectedWeaponDetails = useMemo(
    () =>
      selectedWeaponAction
        ? getWeaponDrawerDetails(
            selectedWeaponAction,
            selectedWeaponEntry,
            selectedWeaponItemRecord,
            {
              hasActiveMastery: selectedWeaponHasActiveMastery,
              hasWeaponProficiency: selectedWeaponHasProficiency
            }
          )
        : [],
    [
      selectedWeaponAction,
      selectedWeaponEntry,
      selectedWeaponHasActiveMastery,
      selectedWeaponHasProficiency,
      selectedWeaponItemRecord
    ]
  );
  const selectedWeaponPsionicStrikeFormula = useMemo(
    () =>
      selectedWeaponAction?.attackKind === "weapon"
        ? getFighterPsiWarriorPsionicStrikeFormulaForCharacter(character)
        : null,
    [character, selectedWeaponAction?.attackKind]
  );
  const selectedWeaponPsionicStrikeAvailable =
    selectedWeaponAction?.attackKind === "weapon"
      ? hasFighterPsiWarriorPsionicStrikeAvailableForCharacter(character)
      : false;
  const selectedWeaponSacredWeaponState = useMemo(
    () => getPaladinOathOfDevotionSacredWeaponOptionState(character, selectedWeaponAction),
    [character, selectedWeaponAction]
  );
  const selectedWeaponVowOfEnmityState = useMemo(
    () => getPaladinOathOfVengeanceVowOfEnmityOptionState(character, selectedWeaponAction),
    [character, selectedWeaponAction]
  );
  const selectedWeaponDreadAmbusherState = useMemo(
    () => getRangerGloomStalkerDreadAmbusherOptionState(character, selectedWeaponAction),
    [character, selectedWeaponAction]
  );
  const selectedWeaponPolarStrikesState = useMemo(
    () => getRangerWinterWalkerPolarStrikesOptionState(character, selectedWeaponAction),
    [character, selectedWeaponAction]
  );
  const selectedWeaponFocusPointsRemaining = useMemo(
    () => getMonkFocusPointsRemainingForCharacter(character),
    [character]
  );
  const selectedWeaponStunningStrikeState = useMemo(
    () => getMonkStunningStrikeOptionState(character, selectedWeaponAction),
    [character, selectedWeaponAction]
  );
  const selectedWeaponEmpoweredStrikesState = useMemo(
    () => getMonkWarriorOfTheElementsEmpoweredStrikesOptionState(character, selectedWeaponAction),
    [character, selectedWeaponAction]
  );
  const selectedWeaponHandOfHarmState = useMemo(
    () => getMonkWarriorOfMercyHandOfHarmOptionState(character, selectedWeaponAction),
    [character, selectedWeaponAction]
  );
  const selectedWeaponQuiveringPalmState = useMemo(
    () => getMonkWarriorOfTheOpenHandQuiveringPalmOptionState(character, selectedWeaponAction),
    [character, selectedWeaponAction]
  );
  const selectedWeaponHandOfHarmDisabledReason = useMemo(() => {
    if (!selectedWeaponHandOfHarmState) {
      return null;
    }

    if (selectedWeaponHandOfHarmState.disabledReason) {
      return selectedWeaponHandOfHarmState.disabledReason;
    }

    return getMonkFocusComboDisabledReason({
      focusPointsRemaining: selectedWeaponFocusPointsRemaining,
      currentOption: {
        label: "Hand of Harm",
        cost: selectedWeaponHandOfHarmState.focusPointCost
      },
      selectedOptions: [
        {
          label: "Stunning Strike",
          cost: selectedWeaponStunningStrikeState?.focusPointCost ?? 1,
          selected: isStunningStrikeSelected
        },
        {
          label: "Quivering Palm",
          cost: monkWarriorOfTheOpenHandQuiveringPalmFocusCost,
          selected: isQuiveringPalmSelected
        }
      ]
    });
  }, [
    isQuiveringPalmSelected,
    isStunningStrikeSelected,
    selectedWeaponFocusPointsRemaining,
    selectedWeaponHandOfHarmState,
    selectedWeaponStunningStrikeState
  ]);
  const selectedWeaponStunningStrikeDisabledReason = useMemo(() => {
    if (!selectedWeaponStunningStrikeState) {
      return null;
    }

    if (selectedWeaponStunningStrikeState.disabledReason) {
      return selectedWeaponStunningStrikeState.disabledReason;
    }

    return getMonkFocusComboDisabledReason({
      focusPointsRemaining: selectedWeaponFocusPointsRemaining,
      currentOption: {
        label: "Stunning Strike",
        cost: selectedWeaponStunningStrikeState.focusPointCost
      },
      selectedOptions: [
        {
          label: "Hand of Harm",
          cost: selectedWeaponHandOfHarmState?.focusPointCost ?? 1,
          selected: isHandOfHarmSelected
        },
        {
          label: "Quivering Palm",
          cost: monkWarriorOfTheOpenHandQuiveringPalmFocusCost,
          selected: isQuiveringPalmSelected
        }
      ]
    });
  }, [
    isHandOfHarmSelected,
    isQuiveringPalmSelected,
    selectedWeaponFocusPointsRemaining,
    selectedWeaponHandOfHarmState,
    selectedWeaponStunningStrikeState
  ]);
  const selectedWeaponQuiveringPalmDisabledReason = useMemo(() => {
    if (!selectedWeaponQuiveringPalmState) {
      return null;
    }

    if (selectedWeaponQuiveringPalmState.disabledReason) {
      return selectedWeaponQuiveringPalmState.disabledReason;
    }

    return getMonkFocusComboDisabledReason({
      focusPointsRemaining: selectedWeaponFocusPointsRemaining,
      currentOption: {
        label: "Quivering Palm",
        cost: monkWarriorOfTheOpenHandQuiveringPalmFocusCost
      },
      selectedOptions: [
        {
          label: "Stunning Strike",
          cost: selectedWeaponStunningStrikeState?.focusPointCost ?? 1,
          selected: isStunningStrikeSelected
        },
        {
          label: "Hand of Harm",
          cost: selectedWeaponHandOfHarmState?.focusPointCost ?? 1,
          selected: isHandOfHarmSelected
        }
      ]
    });
  }, [
    isHandOfHarmSelected,
    isStunningStrikeSelected,
    selectedWeaponFocusPointsRemaining,
    selectedWeaponHandOfHarmState,
    selectedWeaponQuiveringPalmState,
    selectedWeaponStunningStrikeState
  ]);
  const selectedWeaponSacredWeaponToggleDisabled =
    selectedWeaponSacredWeaponState?.disabled ?? false;
  const selectedWeaponVowOfEnmityToggleDisabled = selectedWeaponVowOfEnmityState?.disabled ?? false;
  const selectedWeaponDreadfulStrikeToggleDisabled =
    selectedWeaponDreadAmbusherState?.disabled ?? false;
  const selectedWeaponPolarStrikesToggleDisabled =
    selectedWeaponPolarStrikesState?.disabled ?? false;
  const selectedWeaponStunningStrikeToggleDisabled =
    selectedWeaponStunningStrikeDisabledReason !== null;
  const selectedWeaponEmpoweredStrikesToggleDisabled =
    selectedWeaponEmpoweredStrikesState?.disabled ?? false;
  const selectedWeaponHandOfHarmToggleDisabled = selectedWeaponHandOfHarmDisabledReason !== null;
  const selectedWeaponHandOfHarmUsage =
    selectedWeaponHandOfHarmState?.focusPointCost === 0
      ? createFreeCardUsage()
      : createNamedResourceCardUsage(
          createFeatureActionCardCost({
            amountText: String(selectedWeaponHandOfHarmState?.focusPointCost ?? 1),
            icon: "brain"
          })
        );
  const selectedWeaponQuiveringPalmToggleDisabled =
    selectedWeaponQuiveringPalmDisabledReason !== null;
  const selectedImprovedShadowStepState = useMemo(
    () => getMonkWarriorOfShadowImprovedShadowStepOptionState(character, selectedFeatureAction),
    [character, selectedFeatureAction]
  );
  const selectedWeaponEffectiveAction = useMemo(() => {
    if (!selectedWeaponAction) {
      return null;
    }

    let nextAction = selectedWeaponAction;

    if (
      isSacredWeaponSelected &&
      selectedWeaponSacredWeaponState &&
      !selectedWeaponSacredWeaponToggleDisabled
    ) {
      nextAction = applyPaladinOathOfDevotionSacredWeaponAction(character, nextAction);
    }

    if (
      isVowOfEnmitySelected &&
      selectedWeaponVowOfEnmityState &&
      !selectedWeaponVowOfEnmityToggleDisabled
    ) {
      nextAction = applyPaladinOathOfVengeanceVowOfEnmityAction(nextAction);
    }

    if (
      isDreadfulStrikeSelected &&
      selectedWeaponDreadAmbusherState &&
      !selectedWeaponDreadfulStrikeToggleDisabled
    ) {
      nextAction = applyWeaponDamageBonusPreview(
        nextAction,
        selectedWeaponDreadAmbusherState.damageBonus
      );
    }

    if (
      isPolarStrikesSelected &&
      selectedWeaponPolarStrikesState &&
      !selectedWeaponPolarStrikesToggleDisabled
    ) {
      nextAction = applyWeaponDamageBonusPreview(
        nextAction,
        selectedWeaponPolarStrikesState.damageBonus
      );
    }

    if (
      isEmpoweredStrikesSelected &&
      selectedWeaponEmpoweredStrikesState &&
      !selectedWeaponEmpoweredStrikesToggleDisabled
    ) {
      nextAction = applyWeaponDamageBonusPreview(
        nextAction,
        selectedWeaponEmpoweredStrikesState.damageBonus
      );
    }

    if (
      isHandOfHarmSelected &&
      selectedWeaponHandOfHarmState &&
      !selectedWeaponHandOfHarmToggleDisabled
    ) {
      nextAction = applyWeaponDamageBonusPreview(
        nextAction,
        selectedWeaponHandOfHarmState.damageBonus
      );
    }

    if (
      nextAction.attackKind === "weapon" &&
      isPsionicStrikeSelected &&
      selectedWeaponPsionicStrikeAvailable &&
      selectedWeaponPsionicStrikeFormula
    ) {
      nextAction = applyWeaponDamageBonusPreview(
        nextAction,
        createPsiWarriorPsionicStrikeDamageBonus(selectedWeaponPsionicStrikeFormula)
      );
    }

    return nextAction;
  }, [
    character,
    isDreadfulStrikeSelected,
    isEmpoweredStrikesSelected,
    isHandOfHarmSelected,
    isPolarStrikesSelected,
    isSacredWeaponSelected,
    isVowOfEnmitySelected,
    isPsionicStrikeSelected,
    selectedWeaponAction,
    selectedWeaponDreadAmbusherState,
    selectedWeaponDreadfulStrikeToggleDisabled,
    selectedWeaponEmpoweredStrikesState,
    selectedWeaponEmpoweredStrikesToggleDisabled,
    selectedWeaponHandOfHarmToggleDisabled,
    selectedWeaponHandOfHarmState,
    selectedWeaponPolarStrikesState,
    selectedWeaponPolarStrikesToggleDisabled,
    selectedWeaponSacredWeaponState,
    selectedWeaponSacredWeaponToggleDisabled,
    selectedWeaponVowOfEnmityState,
    selectedWeaponVowOfEnmityToggleDisabled,
    selectedWeaponPsionicStrikeAvailable,
    selectedWeaponPsionicStrikeFormula
  ]);
  const selectedWeaponAttackFormula = useMemo(
    () =>
      selectedWeaponEffectiveAction
        ? getWeaponAttackFormulaPresentation(selectedWeaponEffectiveAction)
        : null,
    [selectedWeaponEffectiveAction]
  );
  const selectedWeaponDamageFormula = useMemo(() => {
    if (!selectedWeaponEffectiveAction) {
      return null;
    }

    const previewAction = nextRollCriticalHitOverride
      ? applyCriticalHitToWeaponAction(selectedWeaponEffectiveAction)
      : selectedWeaponEffectiveAction;
    const formulaPresentation = getWeaponDamageFormulaPresentation(previewAction);

    return nextRollCriticalHitOverride
      ? {
          ...formulaPresentation,
          breakdown: appendCriticalHitToFormulaBreakdown(formulaPresentation.breakdown)
        }
      : formulaPresentation;
  }, [nextRollCriticalHitOverride, selectedWeaponEffectiveAction]);
  const selectedWeaponDrawerDescription = useMemo(
    () =>
      selectedWeaponAction
        ? getWeaponDrawerDescription(selectedWeaponAction, selectedWeaponItemRecord)
        : {
            description: [],
            descriptionAdditions: []
          },
    [selectedWeaponAction, selectedWeaponItemRecord]
  );
  const selectedWeaponRollState = useMemo(
    () =>
      selectedWeaponEffectiveAction
        ? resolveFeatureIndicators(selectedWeaponEffectiveAction.indicators)
        : null,
    [selectedWeaponEffectiveAction]
  );
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
  const selectedFontOfMagicWarning =
    selectedFontOfMagicSelection?.kind === "points-to-slot"
      ? getRoundTrackerActionWarning("bonusAction", roundTracker)
      : null;
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

    return getWeaponAttackPathStates(character, selectedAction.action, roundTracker);
  }, [character, roundTracker, selectedAction]);
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
  const selectedDrawerWarning =
    selectedOptionWarning ??
    selectedLayOnHandsWarning ??
    (selectedAction?.kind === "feature" &&
    selectedAction.drawer.kind === "custom-form" &&
    selectedAction.drawer.formKind === "font-of-magic" &&
    selectedFontOfMagicSelection !== null
      ? selectedFontOfMagicWarning
      : (selectedActionWarning ?? selectedRageSelectionWarning));
  const selectedActionHeaderTags =
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
    setSelectedActionOptionKeys([]);
    setSelectedChannelDivinityOptionKey(null);
    setSelectedFontOfMagicSelection(null);
    setSelectedWildShapeMonsterSlug(null);
    setSelectedWildShapePreviewSlug(null);
    setSelectedWildShapePreviewMonster(null);
    setSelectedWildShapePreviewStatus("ready");
    setSelectedWildCompanionResource("wild-shape");
    setSelectedBardicInspirationSpellSlotLevel(null);
    setSelectedWildCompanionSpellSlotLevel(1);
    setSelectedWildResurgenceMode(null);
    setSelectedWildResurgenceSpellSlotLevel(1);
    setSelectedNatureMagicianSpellSlotLevel(null);
    setSelectedLayOnHandsTarget("self");
    setSelectedLayOnHandsPoolSpendInput("0");
    setSelectedLayOnHandsConditions([]);
    setSelectedBlessingOfTheTricksterTarget("self");
    setSelectedThirdEyeOptionKey(null);
    setSelectedStarryFormConstellation(null);
    setSelectedRageOptionKey(null);
    setSelectedRagePowerOptionKey(null);
    setIsRageOfTheGodsSelected(false);
    setSelectedWarriorOfTheGodsChargeCount(1);
    setUseBeguilingMagicOnActionSpell(false);
    setUseElementalSmiteOnActionSpell(false);
    setSelectedElementalSmiteOptionOnActionSpell(null);
    setIsDiceRollerSettingsOpen(false);
    setIsFixedSpellDrawerOpen(false);
    setSelectedFixedSpellSlotLevel(1);
    setSelectedDivineInterventionSpell(null);
    setSelectedMysticArcanumSpell(null);
    setSelectedMysticArcanumSpellLevel(null);
    setIsCrownOfSpellfireSelected(false);
    setIsInspiredEclipseSelected(false);
    setIsGroupRecoverySelected(false);
    setIsClairvoyantCombatantSelected(false);
    setIsPsionicStrikeSelected(false);
    setIsDreadfulStrikeSelected(false);
    setIsPolarStrikesSelected(false);
    setIsSacredWeaponSelected(false);
    setIsVowOfEnmitySelected(false);
    setIsStunningStrikeSelected(false);
    setIsEmpoweredStrikesSelected(false);
    setIsHandOfHarmSelected(false);
    setIsFlurryOfHealingAndHarmSelected(false);
    setIsQuiveringPalmSelected(false);
    setIsImprovedShadowStepSelected(false);
    setSelectedActionKey(null);
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
    setSelectedActionOptionKeys([]);
    setSelectedChannelDivinityOptionKey(null);
    setSelectedFontOfMagicSelection(null);
    setSelectedWildShapeMonsterSlug(null);
    setSelectedWildShapePreviewSlug(null);
    setSelectedWildShapePreviewMonster(null);
    setSelectedWildShapePreviewStatus("ready");
    setSelectedWildCompanionResource("wild-shape");
    setSelectedWildCompanionSpellSlotLevel(1);
    setSelectedWildResurgenceMode(null);
    setSelectedWildResurgenceSpellSlotLevel(1);
    setSelectedNatureMagicianSpellSlotLevel(null);
    setSelectedLayOnHandsTarget("self");
    setSelectedLayOnHandsPoolSpendInput("0");
    setSelectedLayOnHandsConditions([]);
    setSelectedThirdEyeOptionKey(null);
    setSelectedStarryFormConstellation(null);
    setSelectedRageOptionKey(null);
    setSelectedRagePowerOptionKey(null);
    setIsRageOfTheGodsSelected(false);
    setSelectedIndomitableAbility(null);
    setIsCrownOfSpellfireSelected(false);
    setIsGroupRecoverySelected(false);
    setIsClairvoyantCombatantSelected(false);
    setIsPsionicStrikeSelected(false);
    setIsSacredWeaponSelected(false);
    setIsVowOfEnmitySelected(false);
    setIsStunningStrikeSelected(false);
    setIsEmpoweredStrikesSelected(false);
    setIsHandOfHarmSelected(false);
    setIsQuiveringPalmSelected(false);
    setIsImprovedShadowStepSelected(false);
  }, [selectedActionKey]);

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
    let active = true;

    async function loadWildShapePreview() {
      if (!selectedWildShapePreviewSlug) {
        setSelectedWildShapePreviewMonster(null);
        setSelectedWildShapePreviewStatus("ready");
        return;
      }

      const cachedMonster = wildShapeMonsterCache[selectedWildShapePreviewSlug];

      if (cachedMonster?.document__slug?.trim()) {
        setSelectedWildShapePreviewMonster(cachedMonster);
        setSelectedWildShapePreviewStatus("ready");
        return;
      }

      setSelectedWildShapePreviewStatus("loading");

      try {
        const monster = await fetchMonsterBySlug(selectedWildShapePreviewSlug);

        if (!active) {
          return;
        }

        setSelectedWildShapePreviewMonster(monster);
        setSelectedWildShapePreviewStatus("ready");
      } catch {
        if (!active) {
          return;
        }

        setSelectedWildShapePreviewMonster(null);
        setSelectedWildShapePreviewStatus("error");
      }
    }

    void loadWildShapePreview();

    return () => {
      active = false;
    };
  }, [selectedWildShapePreviewSlug, wildShapeMonsterCache]);

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
        const alreadyUsedThisTurn =
          getFighterBattleMasterCombatSuperiorityUsedThisTurnForCharacter(preparedCharacter);
        const superiorityDiceRemaining =
          getFighterBattleMasterSuperiorityDiceRemainingForCharacter(preparedCharacter);

        if (alreadyUsedThisTurn || superiorityDiceRemaining <= 0) {
          return currentCharacter;
        }

        let nextCharacter = expendFighterBattleMasterSuperiorityDieForCharacter(preparedCharacter);
        nextCharacter = markFighterBattleMasterCombatSuperiorityUsedForCharacter(nextCharacter);

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

    if (effectKind === "tireless") {
      const temporaryHitPointsFormula = getRangerTirelessTemporaryHitPointsFormula(character);

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
        formulaDisplay: temporaryHitPointsFormula,
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
    const usePolarStrikes =
      action.attackKind === "weapon" &&
      isPolarStrikesSelected &&
      selectedWeaponPolarStrikesState !== null &&
      !selectedWeaponPolarStrikesToggleDisabled;
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
        usePolarStrikes ||
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

    if (
      effectiveAction.damageBonusEntries.length <= 0 &&
      !useDreadfulStrike &&
      !usePolarStrikes &&
      !useStunningStrike &&
      !useEmpoweredStrikes &&
      !usePsionicStrike &&
      !useHandOfHarm &&
      !useQuiveringPalm
    ) {
      setIsDreadfulStrikeSelected(false);
      setIsPolarStrikesSelected(false);
      setIsStunningStrikeSelected(false);
      setIsEmpoweredStrikesSelected(false);
      setIsHandOfHarmSelected(false);
      setIsQuiveringPalmSelected(false);
      setIsPsionicStrikeSelected(false);
      return;
    }

    onPersistCharacter((currentCharacter) => {
      let nextCharacter = effectiveAction.damageBonusEntries.reduce(
        (updatedCharacter, entry) =>
          markFeatureWeaponBonusUseForCharacter(updatedCharacter, entry.label),
        currentCharacter
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

      return nextCharacter;
    });

    setIsDreadfulStrikeSelected(false);
    setIsPolarStrikesSelected(false);
    setIsStunningStrikeSelected(false);
    setIsEmpoweredStrikesSelected(false);
    setIsHandOfHarmSelected(false);
    setIsQuiveringPalmSelected(false);
    setIsPsionicStrikeSelected(false);
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

  function submitHealingLight(diceCount: number) {
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
      description: `${selectedFeatureAction.detail} ${diceCount} ${dieLabel} expended.`
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

  function submitSneakAttack({ effectKeys, useRendMind }: SneakAttackActionSelection) {
    if (!selectedFeatureAction) {
      return;
    }

    const sneakAttackFormula = getRogueSneakAttackFormula(character, effectKeys);

    if (!sneakAttackFormula) {
      return;
    }

    const selectedEffects = getRogueSneakAttackEffectDefinitions(character).filter((effect) =>
      effectKeys.includes(effect.key)
    );
    const canUseRendMind =
      useRendMind &&
      (getRogueSoulknifeRendMindUsesRemaining(character) > 0 ||
        getRogueSoulknifePsionicDiceRemaining(character) > 0);
    const rendMindSaveDc =
      8 +
      getAbilityModifierBreakdownForCharacter(character, "DEX").total +
      getProficiencyBonus(character.level);
    const baseDescription = selectedFeatureAction.detail.endsWith(".")
      ? selectedFeatureAction.detail
      : `${selectedFeatureAction.detail}.`;
    const description = [
      baseDescription,
      selectedEffects.length > 0
        ? `Cunning Strike: ${selectedEffects.map((effect) => effect.name).join(", ")}.`
        : null,
      canUseRendMind ? `Rend Mind: Wisdom save DC ${rendMindSaveDc} or Stunned for 1 minute.` : null
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
      formulaDisplay: sneakAttackFormula,
      description
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
            {selectedWeaponDetails.map((detail) => (
              <CellContainer
                key={`${selectedAction.key}-${detail.key}`}
                label={detail.label}
                content={detail.value}
              />
            ))}
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
        return <ArcaneRecoveryActionBody character={character} onRecover={submitArcaneRecovery} />;
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
            remainingDice={getWarlockHealingLightDiceRemainingForCharacter(character)}
            maxDicePerUse={getWarlockHealingLightMaxSpendForCharacter(character)}
            onSubmit={submitHealingLight}
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
            onConfirm={submitSneakAttack}
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
      selectedAction.drawer.confirmLabel ??
      getFeatureActionDrawerPrimaryLabel(selectedAction.action);

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
      selectedAction.action.key === mantleOfInspirationActionKey
    ) {
      const actionShape = getActionShapeForEconomyType(selectedAction.economyType);

      return (
        <div className={styles.weaponFooterActions}>
          <button
            type="button"
            className={clsx(sheetStyles.castButton, styles.weaponFooterButton)}
            onClick={() => executeFeatureActivate(selectedAction.action)}
            disabled={selectedFeatureActionPrimaryDisabledReason !== null}
          >
            <span className={styles.centeredFooterButtonContent}>
              <img src={d20Icon} alt="" className={styles.weaponFooterIcon} />
              <span>{selectedFeaturePrimaryLabel}</span>
              {actionShape ? (
                <ActionShape
                  shape={actionShape}
                  isSelected={selectedActionEconomyShapeState?.isAvailable ?? true}
                  multiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
                  className={styles.footerActionShape}
                />
              ) : null}
            </span>
          </button>
          <DiceRollerSettingsButton
            actionName={selectedAction.action.name}
            className={clsx(sheetStyles.castButton, styles.weaponFooterIconButton)}
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
          <button
            type="button"
            className={clsx(sheetStyles.castButton, styles.footerActionButton)}
            onClick={() => executeFeatureActivate(selectedAction.action)}
            disabled={selectedFeatureActionPrimaryDisabledReason !== null}
          >
            <span>{selectedFeaturePrimaryLabel}</span>
            {actionShape ? (
              <ActionShape
                shape={actionShape}
                isSelected={selectedActionEconomyShapeState?.isAvailable ?? true}
                multiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
                className={styles.footerActionShape}
              />
            ) : null}
          </button>
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
        <button
          type="button"
          className={clsx(sheetStyles.castButton, styles.footerActionButton)}
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
        >
          <span>{selectedFeaturePrimaryLabel}</span>
          {selectedOptionShape && selectedOptionShapeState ? (
            <ActionShape
              shape={selectedOptionShape}
              isSelected={selectedOptionShapeState.isAvailable}
              multiCount={selectedOptionShapeState.multiCount}
              className={styles.footerActionShape}
            />
          ) : null}
        </button>
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
        <button
          type="button"
          className={clsx(sheetStyles.castButton, styles.footerActionButton)}
          onClick={submitBlessingOfTheTrickster}
          disabled={selectedFeatureActionPrimaryDisabledReason !== null}
        >
          <span>{selectedFeaturePrimaryLabel}</span>
          {actionShape ? (
            <ActionShape
              shape={actionShape}
              isSelected={selectedActionEconomyShapeState?.isAvailable ?? true}
              multiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
              className={styles.footerActionShape}
            />
          ) : null}
        </button>
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
        <button
          type="button"
          className={clsx(sheetStyles.castButton, styles.footerActionButton)}
          onClick={submitThirdEye}
          disabled={
            selectedThirdEyeOptionKey === null ||
            selectedFeatureActionPrimaryDisabledReason !== null
          }
        >
          <span>{selectedFeaturePrimaryLabel}</span>
          <ActionShape
            shape="bonusAction"
            isSelected={selectedActionEconomyShapeState?.isAvailable ?? true}
            multiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
            className={styles.footerActionShape}
          />
        </button>
      );
    }

    if (
      selectedAction.kind === "feature" &&
      selectedAction.drawer.kind === "custom-form" &&
      selectedAction.drawer.formKind === "wild-shape"
    ) {
      return (
        <button
          type="button"
          className={clsx(sheetStyles.castButton, styles.footerActionButton)}
          onClick={submitWildShape}
          disabled={
            !selectedWildShapeMonster || selectedFeatureActionPrimaryDisabledReason !== null
          }
        >
          <span>{selectedFeaturePrimaryLabel}</span>
          <ActionShape
            shape="bonusAction"
            isSelected={selectedActionEconomyShapeState?.isAvailable ?? true}
            className={styles.footerActionShape}
          />
        </button>
      );
    }

    if (
      selectedAction.kind === "feature" &&
      selectedAction.drawer.kind === "custom-form" &&
      selectedAction.drawer.formKind === "starry-form"
    ) {
      return (
        <button
          type="button"
          className={clsx(sheetStyles.castButton, styles.footerActionButton)}
          onClick={submitStarryForm}
          disabled={
            selectedFeatureActionPrimaryDisabledReason !== null ||
            selectedStarryFormConstellation === null
          }
        >
          <span>{selectedFeaturePrimaryLabel}</span>
          <ActionShape
            shape="bonusAction"
            isSelected={selectedActionEconomyShapeState?.isAvailable ?? true}
            className={styles.footerActionShape}
          />
        </button>
      );
    }

    if (
      selectedAction.kind === "feature" &&
      selectedAction.drawer.kind === "custom-form" &&
      selectedAction.drawer.formKind === "wild-companion"
    ) {
      return (
        <button
          type="button"
          className={clsx(sheetStyles.castButton, styles.footerActionButton)}
          onClick={submitWildCompanion}
          disabled={
            selectedFeatureActionPrimaryDisabledReason !== null ||
            !canUseSelectedWildCompanionResource
          }
        >
          <span>{selectedFeaturePrimaryLabel}</span>
          <ActionShape
            shape="action"
            isSelected={selectedActionEconomyShapeState?.isAvailable ?? true}
            multiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
            className={styles.footerActionShape}
          />
        </button>
      );
    }

    if (
      selectedAction.kind === "feature" &&
      selectedAction.drawer.kind === "custom-form" &&
      selectedAction.drawer.formKind === "nature-magician"
    ) {
      return (
        <button
          type="button"
          className={clsx(sheetStyles.castButton, styles.footerActionButton)}
          onClick={submitNatureMagician}
          disabled={
            selectedFeatureActionPrimaryDisabledReason !== null || !selectedNatureMagicianOption
          }
        >
          <span>{selectedFeaturePrimaryLabel}</span>
        </button>
      );
    }

    if (
      selectedAction.kind === "feature" &&
      selectedAction.drawer.kind === "custom-form" &&
      selectedAction.drawer.formKind === "wild-resurgence"
    ) {
      return (
        <button
          type="button"
          className={clsx(sheetStyles.castButton, styles.footerActionButton)}
          onClick={submitWildResurgence}
          disabled={
            !canUseSelectedWildResurgenceMode || selectedFeatureActionPrimaryDisabledReason !== null
          }
        >
          <span>{selectedFeaturePrimaryLabel}</span>
        </button>
      );
    }

    if (
      selectedAction.kind === "feature" &&
      selectedAction.drawer.kind === "custom-form" &&
      selectedAction.drawer.formKind === "font-of-magic"
    ) {
      return (
        <button
          type="button"
          className={clsx(sheetStyles.castButton, styles.footerActionButton)}
          onClick={confirmFontOfMagicSelection}
          disabled={
            selectedFontOfMagicSelection === null ||
            selectedFeatureActionPrimaryDisabledReason !== null ||
            (selectedFontOfMagicSelection.kind === "points-to-slot" &&
              selectedFontOfMagicWarning !== null)
          }
        >
          <span>{selectedFeaturePrimaryLabel}</span>
          {selectedFontOfMagicSelection?.kind === "points-to-slot" ? (
            <ActionShape
              shape="bonusAction"
              isSelected={selectedFontOfMagicWarning === null}
              className={styles.footerActionShape}
            />
          ) : null}
        </button>
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
        <button
          type="button"
          className={clsx(sheetStyles.castButton, styles.footerActionButton)}
          onClick={submitBrutalStrike}
          disabled={selectedFeatureActionPrimaryDisabledReason !== null}
        >
          <span>{selectedFeaturePrimaryLabel}</span>
          {actionShape ? (
            <ActionShape
              shape={actionShape}
              isSelected={selectedActionEconomyShapeState?.isAvailable ?? true}
              multiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
              className={styles.footerActionShape}
            />
          ) : null}
        </button>
      );
    }

    if (selectedAction.kind === "feature" && selectedAction.action.key === barbarianRageActionKey) {
      return (
        <button
          type="button"
          className={clsx(sheetStyles.castButton, styles.footerActionButton)}
          onClick={submitRage}
          disabled={
            selectedRageSelectionWarning !== null ||
            selectedFeatureActionPrimaryDisabledReason !== null
          }
        >
          <span>{selectedFeaturePrimaryLabel}</span>
          <ActionShape
            shape="bonusAction"
            isSelected={selectedActionEconomyShapeState?.isAvailable ?? true}
            className={styles.footerActionShape}
          />
        </button>
      );
    }

    if (selectedAction.drawer.kind !== "confirm") {
      return null;
    }

    if (selectedAction.execute.kind === "activate") {
      const actionShape = getActionShapeForEconomyType(selectedAction.economyType);
      const confirmAction = isCommonActionKey(selectedAction.action.key)
        ? executeCommonAction
        : executeFeatureActivate;

      return (
        <button
          type="button"
          className={clsx(sheetStyles.castButton, styles.footerActionButton)}
          onClick={() => confirmAction(selectedAction.action)}
          disabled={selectedFeatureActionPrimaryDisabledReason !== null}
        >
          <span>{selectedFeaturePrimaryLabel}</span>
          {actionShape ? (
            <ActionShape
              shape={actionShape}
              isSelected={selectedActionEconomyShapeState?.isAvailable ?? true}
              multiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
              className={styles.footerActionShape}
            />
          ) : null}
        </button>
      );
    }

    if (selectedAction.execute.kind === "spell") {
      const actionShape = getActionShapeForEconomyType(selectedAction.economyType);

      return (
        <button
          type="button"
          className={clsx(sheetStyles.castButton, styles.footerActionButton)}
          onClick={() => setIsFixedSpellDrawerOpen(true)}
          disabled={selectedFeatureActionPrimaryDisabledReason !== null}
        >
          <span>{selectedFeaturePrimaryLabel}</span>
          {actionShape ? (
            <ActionShape
              shape={actionShape}
              isSelected={selectedActionEconomyShapeState?.isAvailable ?? true}
              multiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
              className={styles.footerActionShape}
            />
          ) : null}
        </button>
      );
    }

    return null;
  }

  return (
    <>
      <section className={clsx(widgetShellStyles.widgetCard, styles.root)}>
        <header className={widgetShellStyles.widgetHeader}>
          <p className={widgetShellStyles.widgetTitle}>Actions</p>
          <button
            type="button"
            className={clsx(
              shared.editButton,
              styles.commonActionsButton,
              isCommonActionsOpen && styles.commonActionsButtonActive
            )}
            onClick={() => setIsCommonActionsOpen(true)}
          >
            <Swords size={16} />
            Common Actions
          </button>
        </header>
        {combatActions.length === 0 ? (
          <p className={shared.emptyText}>No actions available. Equip a weapon to roll attacks.</p>
        ) : (
          <div className={styles.grid}>
            {combatActions.map((combatAction) =>
              combatAction.kind === "weapon" ? (
                <WeaponActionCard
                  key={combatAction.key}
                  action={combatAction.action}
                  character={character}
                  roundTracker={roundTracker}
                  onClick={() => setSelectedActionKey(combatAction.key)}
                />
              ) : combatAction.action.key === monkHandOfHealingActionKey ? (
                <MonkHandOfHealingActionCard
                  key={combatAction.key}
                  action={combatAction.action}
                  character={character}
                  roundTracker={roundTracker}
                  onClick={() => setSelectedActionKey(combatAction.key)}
                />
              ) : (
                <FeatureActionCardButton
                  key={combatAction.key}
                  action={combatAction.action}
                  character={character}
                  roundTracker={roundTracker}
                  onClick={() => setSelectedActionKey(combatAction.key)}
                />
              )
            )}
          </div>
        )}
      </section>

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
              <button
                type="button"
                className={clsx(
                  sheetStyles.castButton,
                  styles.footerActionButton,
                  styles.channelDivinityFooterButton
                )}
                onClick={() => activateSelectedChannelDivinity(selectedChannelDivinityRow)}
                disabled={selectedChannelDivinityWarning !== null}
              >
                <span className={styles.centeredFooterButtonContent}>
                  <span>Use Channel Divinity</span>
                  {selectedChannelDivinityActionShape ? (
                    <ActionShape
                      shape={selectedChannelDivinityActionShape}
                      isSelected={selectedChannelDivinityShapeState?.isAvailable ?? true}
                      multiCount={selectedChannelDivinityShapeState?.multiCount ?? 0}
                      className={styles.footerActionShape}
                    />
                  ) : null}
                </span>
              </button>
            </div>
          }
        />
      ) : null}

      {isFixedSpellDrawerOpen && fixedSpellEntry && fixedSpellExecute ? (
        <CharacterSpellDrawer
          character={character}
          spell={fixedSpellEntry}
          damageDetailOverride={fixedSpellElementalSmiteDamageDetail}
          alwaysPrepared
          mode="standard"
          spellSlotTotals={fixedSpellSlotTotals}
          spellSlotsRemaining={fixedSpellSlotsRemaining}
          selectedSpellSlotLevel={selectedFixedSpellSlotLevel}
          onSelectedSpellSlotLevelChange={setSelectedFixedSpellSlotLevel}
          onClose={() => {
            setUseBeguilingMagicOnActionSpell(false);
            setUseElementalSmiteOnActionSpell(false);
            setSelectedElementalSmiteOptionOnActionSpell(null);
            setUseFrozenHauntOnActionSpell(false);
            setSelectedFrozenHauntFallbackSlotLevel(frozenHauntFallbackSpellSlotMinimumLevel);
            setIsFixedSpellDrawerOpen(false);
          }}
          onAction={(options) =>
            castFixedSpellAction({
              ...options,
              useBeguilingMagic: useBeguilingMagicOnActionSpell,
              useElementalSmite: useElementalSmiteOnActionSpell,
              elementalSmiteOption: selectedElementalSmiteOptionOnActionSpell,
              useFrozenHaunt: useFrozenHauntOnActionSpell,
              frozenHauntFallbackSlotLevel: selectedFrozenHauntFallbackSlotLevel
            })
          }
          actionLabel={fixedSpellExecute.actionLabel}
          actionConsumesSpellSlot={fixedSpellConsumesSpellSlot}
          minimumActionSpellSlotLevel={fixedSpellMinimumActionSlotLevel ?? undefined}
          freeCastSlotLevel={fixedSpellFreeCastSlotLevel}
          actionContextText={fixedSpellActionContextText}
          actionAvailabilityText={fixedSpellActionAvailabilityText}
          actionWarning={fixedSpellCastWarning}
          actionDisabled={spellcastingState.blocked || fixedSpellSharedCastWarning !== null}
          blockedReason={spellcastingState.blocked ? spellcastingState.reason : null}
          allowRitualCasting={fixedSpellExecute.allowRitualCasting}
          actionPaths={fixedSpellActionPaths
            .map((path) => {
              const actionShape = getActionShapeForEconomyType(path.economyType);

              return actionShape
                ? {
                    id: path.id,
                    actionLabel: fixedSpellExecute.actionLabel,
                    actionShape,
                    actionShapeAvailable: path.shapeState.isAvailable,
                    actionShapeMultiCount: path.shapeState.multiCount,
                    disabledReason: path.shapeState.disabledReason,
                    roundTrackerResourceOverride: path.roundTrackerResource
                  }
                : null;
            })
            .filter((path): path is NonNullable<typeof path> => path !== null)}
          actionOptions={
            selectedActionSpellSupportsBeguilingMagic ||
            selectedActionSpellSupportsElementalSmite ||
            selectedActionSpellFrozenHauntOptionState !== null
              ? [
                  ...(selectedActionSpellSupportsBeguilingMagic
                    ? [
                        {
                          id: "beguiling-magic",
                          label: "Beguiling Magic",
                          checked: useBeguilingMagicOnActionSpell,
                          onCheckedChange: setUseBeguilingMagicOnActionSpell,
                          disabled:
                            beguilingMagicUsesRemaining <= 0 && bardicInspirationUsesRemaining <= 0,
                          usage: createChargesOrResourceCardUsage(
                            beguilingMagicUsesRemaining,
                            beguilingMagicUsesTotal,
                            createFeatureActionCardCost({
                              amountText: "1",
                              icon: "music"
                            })
                          )
                        }
                      ]
                    : []),
                  ...(selectedActionSpellFrozenHauntOptionState
                    ? [
                        {
                          id: "frozen-haunt",
                          label: "Frozen Haunt",
                          checked: useFrozenHauntOnActionSpell,
                          onCheckedChange: setUseFrozenHauntOnActionSpell,
                          disabled: selectedActionSpellFrozenHauntOptionState.disabled,
                          usage: createChargesOrResourceCardUsage(
                            selectedActionSpellFrozenHauntOptionState.usesRemaining,
                            selectedActionSpellFrozenHauntOptionState.usesTotal,
                            createFeatureActionCardCost({
                              amountText: `${frozenHauntFallbackSpellSlotMinimumLevel}+`,
                              resourceLabel: "Spell Slot"
                            })
                          ),
                          select:
                            useFrozenHauntOnActionSpell &&
                            selectedActionSpellFrozenHauntOptionState.usesRemaining <= 0 &&
                            selectedActionSpellFrozenHauntFallbackSlotOptions.length > 0
                              ? {
                                  label: "Frozen Haunt Slot",
                                  value: selectedFrozenHauntFallbackSlotLevel,
                                  onValueChange: setSelectedFrozenHauntFallbackSlotLevel,
                                  options: selectedActionSpellFrozenHauntFallbackSlotOptions
                                }
                              : undefined
                        }
                      ]
                    : []),
                  ...(selectedActionSpellSupportsElementalSmite
                    ? [
                        {
                          id: "elemental-smite",
                          label: "Elemental Smite",
                          checked: useElementalSmiteOnActionSpell,
                          onCheckedChange: setUseElementalSmiteOnActionSpell,
                          disabled: selectedActionSpellElementalSmiteDisabled,
                          radioOptions: {
                            value: selectedElementalSmiteOptionOnActionSpell,
                            onValueChange: setSelectedElementalSmiteOptionOnActionSpell,
                            required: true,
                            placement: "body",
                            options: paladinOathOfTheNobleGeniesElementalSmiteOptions.map(
                              (option) => ({
                                id: option.key,
                                header: option.label,
                                description: option.descriptionEntries
                              })
                            )
                          },
                          usage: createNamedResourceCardUsage(
                            createFeatureActionCardCost({
                              amountText: "1",
                              icon: "pyromancy"
                            })
                          )
                        }
                      ]
                    : [])
                ]
              : undefined
          }
          backdropClassName={styles.divineInterventionDrawerBackdrop}
        />
      ) : null}

      {selectedDivineInterventionSpell && selectedFeatureAction ? (
        <CharacterSpellDrawer
          character={character}
          spell={selectedDivineInterventionSpell}
          mode="divine-intervention"
          spellSlotTotals={Array.from({ length: 9 }, () => 0)}
          spellSlotsRemaining={Array.from({ length: 9 }, () => 0)}
          selectedSpellSlotLevel={1}
          onSelectedSpellSlotLevelChange={() => {}}
          onClose={() => {
            setUseBeguilingMagicOnActionSpell(false);
            setSelectedDivineInterventionSpell(null);
          }}
          onAction={(options) =>
            castDivineInterventionSpell({
              ...options,
              useBeguilingMagic: useBeguilingMagicOnActionSpell
            })
          }
          actionLabel="Divine Intervention"
          actionWarning={selectedFeatureActionPrimaryDisabledReason}
          actionDisabled={selectedFeatureActionPrimaryDisabledReason !== null}
          blockedReason={selectedDivineInterventionBlockedReason}
          actionAvailabilityText={selectedFeatureAction.usesLabel ?? null}
          actionOptions={
            selectedActionSpellSupportsBeguilingMagic
              ? [
                  {
                    id: "beguiling-magic",
                    label: "Beguiling Magic",
                    checked: useBeguilingMagicOnActionSpell,
                    onCheckedChange: setUseBeguilingMagicOnActionSpell,
                    disabled:
                      beguilingMagicUsesRemaining <= 0 && bardicInspirationUsesRemaining <= 0,
                    usage: createChargesOrResourceCardUsage(
                      beguilingMagicUsesRemaining,
                      beguilingMagicUsesTotal,
                      createFeatureActionCardCost({
                        amountText: "1",
                        icon: "music"
                      })
                    )
                  }
                ]
              : undefined
          }
          backdropClassName={styles.divineInterventionDrawerBackdrop}
        />
      ) : null}

      {selectedMysticArcanumSpell ? (
        <CharacterSpellDrawer
          character={character}
          spell={selectedMysticArcanumSpell}
          alwaysPrepared
          mode="standard"
          spellSlotTotals={Array.from({ length: 9 }, () => 0)}
          spellSlotsRemaining={Array.from({ length: 9 }, () => 0)}
          selectedSpellSlotLevel={
            selectedMysticArcanumSpellLevel ?? selectedMysticArcanumSpell.spellLevel
          }
          onSelectedSpellSlotLevelChange={() => {}}
          onClose={() => {
            setUseBeguilingMagicOnActionSpell(false);
            setSelectedMysticArcanumSpell(null);
            setSelectedMysticArcanumSpellLevel(null);
          }}
          onAction={(options) =>
            castMysticArcanumSpell({
              ...options,
              useBeguilingMagic: useBeguilingMagicOnActionSpell
            })
          }
          actionConsumesSpellSlot={false}
          actionContextText="Using Mystic Arcanum"
          actionAvailabilityText="Cast without expending a spell slot. Mystic Arcanum spells can't be upcast."
          actionWarning={
            selectedFeatureActionPrimaryDisabledReason ??
            (selectedMysticArcanumExpended
              ? "This arcanum recharges on a Long Rest."
              : selectedMysticArcanumActionWarning)
          }
          actionDisabled={
            selectedFeatureActionPrimaryDisabledReason !== null ||
            selectedMysticArcanumExpended ||
            selectedMysticArcanumActionWarning !== null
          }
          blockedReason={selectedMysticArcanumBlockedReason}
          actionOptions={
            selectedActionSpellSupportsBeguilingMagic
              ? [
                  {
                    id: "beguiling-magic",
                    label: "Beguiling Magic",
                    checked: useBeguilingMagicOnActionSpell,
                    onCheckedChange: setUseBeguilingMagicOnActionSpell,
                    disabled:
                      beguilingMagicUsesRemaining <= 0 && bardicInspirationUsesRemaining <= 0,
                    usage: createChargesOrResourceCardUsage(
                      beguilingMagicUsesRemaining,
                      beguilingMagicUsesTotal,
                      createFeatureActionCardCost({
                        amountText: "1",
                        icon: "music"
                      })
                    )
                  }
                ]
              : undefined
          }
          backdropClassName={styles.divineInterventionDrawerBackdrop}
        />
      ) : null}

      {selectedWildShapePreviewSlug ? (
        <MonsterEntryDrawer
          monster={selectedWildShapePreviewMonster}
          status={selectedWildShapePreviewStatus}
          badgeLabel="Wild Shape Preview"
          backdropClassName={styles.wildShapePreviewDrawerBackdrop}
          onClose={() => setSelectedWildShapePreviewSlug(null)}
          contentSurface="plain"
          showHeaderDivider
        />
      ) : null}

      {diceRollerPopup}
    </>
  );
}

export default ActionsWidget;
