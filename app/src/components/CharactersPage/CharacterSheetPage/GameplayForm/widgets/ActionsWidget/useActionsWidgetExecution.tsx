import { applyActionResourceTransition } from "./actionResourceTransition";
import { getSheetSpellSlotTotals } from "../../../../../../pages/CharactersPage/multiclassSpellcasting";
/* eslint-disable @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps */

import { useEffect } from "react";

import type { Character } from "../../../../../../types";
import { getMonsterKey } from "../../../../../../utils/monsters";

import { getKeywordReferences } from "../../../../../../pages/CharactersPage/keywordDescriptions";
import {
  activateBardicInspirationForCharacter,
  activateInnateSorceryForCharacter,
  activateFeatureActionForCharacter,
  applyInspiredEclipseStatusForCharacter,
  applyRangerWinterWalkerFortifyingSoulSelfStatusForCharacter,
  consumeWarlockEldritchSmitePactMagicSlotForCharacter,
  consumeWarlockLifedrinkerHitDieForCharacter,
  consumeFighterPsiWarriorPsionicStrikeForCharacter,
  consumeRangerGloomStalkerDreadAmbusherUseForCharacter,
  consumeRangerWinterWalkerPolarStrikesUseForCharacter,
  consumeRangerTirelessUseForCharacter,
  clearRoundScopedFeatureStateForCharacter,
  consumeNonMagicActionForCharacter,
  consumeWeaponAttackActionForCharacter,
  getBardicInspirationUsesRemainingForCharacter,
  markFeatureWeaponBonusUseForCharacter,
  markRangerHunterHordeBreakerUsedForCharacter,
  type FeatureActionCard
} from "../../../../../../pages/CharactersPage/classFeatures";
import {
  boonOfFateImproveFateActionKey,
  boonOfRecoveryRecoverVitalityActionKey,
  collectFeatDerivedState,
  consumeBoonOfFateImproveFateForCharacter,
  cultOfDragonInitiateInspiredByFearActionKey,
  durableSpeedyRecoveryActionKey,
  getBoonOfRecoveryRecoverVitalityFormula,
  getDurableSpeedyRecoveryHealingFormulaForCharacter,
  purpleDragonCommandantEncourageAllyActionKey,
  spendBoonOfRecoveryDiceForCharacter,
  spendCultOfDragonInitiateInspiredByFearForCharacter,
  spendDurableSpeedyRecoveryHitDieForCharacter,
  spendPurpleDragonCommandantEncourageAllyForCharacter
} from "../../../../../../pages/CharactersPage/feats/runtime";
import { getPurpleDragonCommandantEncourageAllyFormula } from "../../../../../../pages/CharactersPage/feats/runtime/actions";
import { restoreHeroicInspirationForCharacter } from "../../../../../../pages/CharactersPage/heroicInspiration";
import { getHitDiceRemainingForCharacter } from "../../../../../../pages/CharactersPage/hitDice";
import { bardicInspirationActionKey } from "../../../../../../pages/CharactersPage/classFeatures/bard/bard";
import { activateBarbarianRecklessAttack } from "../../../../../../pages/CharactersPage/classFeatures/barbarian/barbarian";
import { applyBarbarianRecklessAttackIndicatorToWeaponAction } from "../../../../../../pages/CharactersPage/classFeatures/barbarian/barbarianRecklessAttack";

import {
  applyDhampirVampiricBiteWeaponAction,
  applyOrcAdrenalineRushForCharacter,
  consumeDhampirVampiricBiteUseForCharacter,
  consumeGoliathGiantAncestryUseForCharacter,
  getOrcAdrenalineRushUsesRemaining,
  hasOrcAdrenalineRushCommonActionBonusPath,
  rebornKnowledgeFromPastLifeActionKey,
  rebornKnowledgeFromPastLifeRollFormula
} from "../../../../../../pages/CharactersPage/species";
import { hasExpeditiousRetreatDashBonusActionPath } from "../../../../../../pages/CharactersPage/characterRuntime/spellImplementations";

import {
  druidNatureMagicianActionKey,
  druidWildResurgenceActionKey,
  druidWildCompanionActionKey,
  druidWildShapeActionKey
} from "../../../../../../pages/CharactersPage/classFeatures/druid/druid";

import {
  consumeFighterBattleMasterKnowYourEnemyForCharacter,
  expendFighterBattleMasterSuperiorityDieForCharacter,
  getFighterBattleMasterCombatSuperiorityUsedThisTurnForCharacter,
  getFighterBattleMasterSuperiorityDiceRemainingForCharacter,
  applyFighterTeamTacticsStatus,
  consumeFighterGroupRecoveryUse,
  getFighterGroupRecoveryHealingFormula,
  getFighterGroupRecoveryUsesRemaining,
  getFighterSecondWindHealingFormula,
  markFighterBattleMasterCombatSuperiorityUsedForCharacter
} from "../../../../../../pages/CharactersPage/classFeatures/fighter/fighter";

import {
  activatePaladinOathOfDevotionSacredWeapon,
  applyPaladinOathOfDevotionSacredWeaponAction
} from "../../../../../../pages/CharactersPage/classFeatures/paladin/subclasses/paladinOathOfDevotion";
import {
  activatePaladinOathOfVengeanceVowOfEnmity,
  applyPaladinOathOfVengeanceVowOfEnmityAction
} from "../../../../../../pages/CharactersPage/classFeatures/paladin/subclasses/paladinOathOfVengeance";

import {
  fortifyingSoulActionKey,
  getRangerTirelessTemporaryHitPointsFormulaDisplay,
  getRangerTirelessTemporaryHitPointsFormula
} from "../../../../../../pages/CharactersPage/classFeatures/ranger/ranger";
import { rangerBeastMasterReviveActionKey } from "../../../../../../pages/CharactersPage/classFeatures/ranger/subclasses/rangerBeastMaster";
import { innateSorceryActionKey } from "../../../../../../pages/CharactersPage/classFeatures/sorcerer/sorcerer";

import { sorcererTidesOfChaosActionKey } from "../../../../../../pages/CharactersPage/classFeatures/sorcerer/subclasses/sorcererWildMagicSorcery";
import {
  activateWarlockAwakenedMind,
  darkOnesOwnLuckActionKey,
  hurlThroughHellActionKey
} from "../../../../../../pages/CharactersPage/classFeatures/warlock/warlock";
import { awakenedMindActionKey } from "../../../../../../pages/CharactersPage/classFeatures/warlock/subclasses/warlockGreatOldOnePatron";

import { wizardAbjurerArcaneWardActionKey } from "../../../../../../pages/CharactersPage/classFeatures/wizard/subclasses";

import { getCharacterRuntime } from "../../../../../../pages/CharactersPage/characterRuntime/characterRuntime";

import {
  activateCustomActionForCharacter,
  isCustomActionKey
} from "../../../../../../pages/CharactersPage/customActions";
import {
  ECONOMY_TYPE,
  getRoundTrackerResourceForEconomyType,
  type EconomyType
} from "../../../../../../pages/CharactersPage/actionEconomy";

import { type WeaponAction } from "../../../../../../pages/CharactersPage/gameplay";
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

import { consumeTrueStrikePendingAttackForCharacter } from "../../../../../../pages/CharactersPage/characterRuntime/spellImplementations";

import { FEATS } from "../../../../../../codex/entries/enums";

import {
  getSpellLevel,
  normalizeSpellSlotsExpended
} from "../../../../../../pages/CharactersPage/spellcasting";

import { getRollModeFromIndicators } from "../../../../../RollStatePill/rollState";
import { useBodyScrollLock } from "../../../../../../lib/useBodyScrollLock";

import { setNextRollModeOverride } from "../../../../../../store";

import {
  appendRollModifier,
  getWeaponAttackFormulaPresentation,
  getWeaponDamageFormulaPresentation
} from "./actionsWidgetPresentation";
import { applyArcaneWardActionUse } from "./arcaneWardAction";
import {
  applyRangerHuntersMarkTargetWeaponAction,
  getRangerHuntersMarkTargetWeaponOptionState,
  huntersMarkWeaponDamageBonusLabel
} from "./rangerHuntersMarkWeapon";

import { applyWeaponDamageBonusPreview } from "./fighterPsiWarriorWeapon";
import { applyCriticalHitToWeaponAction } from "./weaponCriticalHit";
import { consumeMonkStunningStrike } from "../../../../../../pages/CharactersPage/classFeatures/monk/monkStunningStrike";
import {
  activateMonkFlurryOfBlows,
  monkStepOfTheWindActionKey
} from "../../../../../../pages/CharactersPage/classFeatures/monk/monk";
import {
  activateMonkWarriorOfMercyHandOfHealing,
  getMonkWarriorOfMercyHandOfHealingFormula
} from "../../../../../../pages/CharactersPage/classFeatures/monk/subclasses/monkWarriorOfMercy";
import {
  consumeMonkWarriorOfTheOpenHandFleetStepFollowUpUse,
  activateMonkWarriorOfTheOpenHandQuiveringPalmMark,
  getMonkWarriorOfTheOpenHandWholenessOfBodyHealingFormula,
  monkWholenessOfBodyActionKey
} from "../../../../../../pages/CharactersPage/classFeatures/monk/subclasses/monkWarriorOfTheOpenHand";
import {
  activateMonkWarriorOfShadowImprovedShadowStep,
  monkShadowStepActionKey
} from "../../../../../../pages/CharactersPage/classFeatures/monk/subclasses/monkWarriorOfShadow";

import { type WeaponAttackPathState } from "./weaponActionEconomy";
import {
  grantMonkFleetStepFollowUpIfEligible,
  shouldConsumeMonkFleetStepFollowUp
} from "./actionHelpers";
import type { ActionsWidgetExecutionContext } from "./types";

import { useActionsWidgetSubmissions } from "./useActionsWidgetSubmissions";

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
    isVampiricBiteSelected,
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
    selectedWeaponVampiricBiteState,
    selectedWeaponVampiricBiteToggleDisabled,
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
    setIsVampiricBiteSelected,
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

  function executeFeatureActivate(
    action: FeatureActionCard,
    economyTypeOverride: EconomyType | null = null
  ) {
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
        const spellSlotTotals = getSheetSpellSlotTotals(currentCharacter);
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
      onPersistCharacter((currentCharacter) => applyActionResourceTransition(currentCharacter, action.economyType, prepareCharacterForResourceConsumption, preparedCharacter => activateInnateSorceryForCharacter(preparedCharacter, {
          useCrownOfSpellfire: isCrownOfSpellfireSelected
        })));
      closeActionDrawer();
      return;
    }

    if (action.key === awakenedMindActionKey) {
      const useClairvoyantCombatant =
        isClairvoyantCombatantSelected && !selectedClairvoyantCombatantToggleDisabled;

      onPersistCharacter((currentCharacter) => applyActionResourceTransition(currentCharacter, action.economyType, prepareCharacterForResourceConsumption, preparedCharacter => activateWarlockAwakenedMind(preparedCharacter, {
          useClairvoyantCombatant
        })));
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

    if (action.key === purpleDragonCommandantEncourageAllyActionKey) {
      if ((action.usesRemaining ?? 0) <= 0) {
        return;
      }

      const featState = collectFeatDerivedState(character);
      const featEntry = featState.normalizedFeats.find(
        (entry) => entry.feat === FEATS.PURPLE_DRAGON_COMMANDANT
      );
      const formula = getPurpleDragonCommandantEncourageAllyFormula(
        character,
        featEntry?.epicBoonAbilityChoice?.ability ?? "STR",
        featState.normalizedFeats
      );

      onPersistCharacter((currentCharacter) => applyActionResourceTransition(currentCharacter, action.economyType, prepareCharacterForResourceConsumption, preparedCharacter => spendPurpleDragonCommandantEncourageAllyForCharacter(preparedCharacter)));

      openDiceRoller({
        title: "Encourage Ally",
        formula: formula.formula,
        formulaDisplay: formula.formulaDisplay,
        description: "Roll Temporary Hit Points for the ally you bolster.",
        getFullManualToastText: ({ result }) =>
          `Rolled ${result.total} Encourage Ally Temporary Hit Points.`
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

      onPersistCharacter((currentCharacter) => applyActionResourceTransition(currentCharacter, action.economyType, prepareCharacterForResourceConsumption, preparedCharacter => spendBoonOfRecoveryDiceForCharacter(preparedCharacter, diceCount)));

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
        const nextCharacter = spendCultOfDragonInitiateInspiredByFearForCharacter(currentCharacter);

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

      onPersistCharacter((currentCharacter) => applyActionResourceTransition(currentCharacter, action.economyType, prepareCharacterForResourceConsumption, preparedCharacter => spendDurableSpeedyRecoveryHitDieForCharacter(preparedCharacter)));

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
      onPersistCharacter((currentCharacter) => applyActionResourceTransition(currentCharacter, action.economyType, prepareCharacterForResourceConsumption, preparedCharacter => consumeFighterBattleMasterKnowYourEnemyForCharacter(preparedCharacter)));
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

    if (action.key === rebornKnowledgeFromPastLifeActionKey) {
      if ((action.usesRemaining ?? 0) <= 0) {
        return;
      }

      activateFeatureAction(action);
      openDiceRoller({
        title: action.name,
        formula: rebornKnowledgeFromPastLifeRollFormula,
        formulaDisplay: rebornKnowledgeFromPastLifeRollFormula,
        description: action.detail,
        getFullManualToastText: ({ result }) => `Rolled ${result.total} Knowledge from a Past Life.`
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

      onPersistCharacter((currentCharacter) => applyActionResourceTransition(currentCharacter, action.economyType, prepareCharacterForResourceConsumption, preparedCharacter => consumeRangerTirelessUseForCharacter(preparedCharacter)));

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

    activateFeatureAction(action, economyTypeOverride);
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
      (sacredWeaponIsActive ||
        (isSacredWeaponSelected && !selectedWeaponSacredWeaponToggleDisabled));
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
    const useVampiricBite =
      action.attackKind === "unarmed" &&
      isVampiricBiteSelected &&
      selectedWeaponVampiricBiteState !== null &&
      !selectedWeaponVampiricBiteToggleDisabled;
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

    if (useVampiricBite) {
      effectiveAction = applyDhampirVampiricBiteWeaponAction(character, effectiveAction);
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
      useQuiveringPalm ||
      useVampiricBite;

    setIsDreadfulStrikeSelected(false);
    setIsColossusSlayerSelected(false);
    setIsPolarStrikesSelected(false);
    setIsGoliathAncestryStrikeSelected(false);
    setIsStunningStrikeSelected(false);
    setIsEmpoweredStrikesSelected(false);
    setIsHandOfHarmSelected(false);
    setIsQuiveringPalmSelected(false);
    setIsVampiricBiteSelected(false);
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

        if (useVampiricBite) {
          nextCharacter = consumeDhampirVampiricBiteUseForCharacter(nextCharacter);
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
