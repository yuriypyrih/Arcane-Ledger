import { useMemo } from "react";
import type { Character } from "../../../../../../types";
import type { GameplayActionDefinition } from "../../../../../../pages/CharactersPage/combatActions";
import {
  type FeatureActionCard,
  getMonkFocusPointsRemainingForCharacter,
  getWarlockEldritchSmiteWeaponOptionStateForCharacter,
  getWarlockLifedrinkerWeaponOptionStateForCharacter
} from "../../../../../../pages/CharactersPage/classFeatures";
import {
  applyBarbarianRecklessAttackIndicatorToWeaponAction,
  getBarbarianRecklessAttackWeaponOptionState
} from "../../../../../../pages/CharactersPage/classFeatures/barbarian/barbarianRecklessAttack";
import { getBarbarianRecklessAttackWeaponDamagePreviewBonuses } from "../../../../../../pages/CharactersPage/classFeatures/barbarian/barbarian";
import {
  createFeatureActionCardCost,
  createFreeCardUsage,
  createNamedResourceCardUsage
} from "../../../../../../pages/CharactersPage/classFeatures/cardUsage";
import {
  applyPaladinOathOfDevotionSacredWeaponAction,
  getPaladinOathOfDevotionSacredWeaponOptionState
} from "../../../../../../pages/CharactersPage/classFeatures/paladin/subclasses/paladinOathOfDevotion";
import {
  applyPaladinOathOfVengeanceVowOfEnmityAction,
  getPaladinOathOfVengeanceVowOfEnmityOptionState
} from "../../../../../../pages/CharactersPage/classFeatures/paladin/subclasses/paladinOathOfVengeance";
import { getRangerFeyWandererDreadfulStrikesOptionState } from "../../../../../../pages/CharactersPage/classFeatures/ranger/subclasses/rangerFeyWanderer";
import { getRangerGloomStalkerDreadAmbusherOptionState } from "../../../../../../pages/CharactersPage/classFeatures/ranger/subclasses/rangerGloomStalker";
import {
  getRangerHunterColossusSlayerOptionState,
  getRangerHunterHordeBreakerOptionState
} from "../../../../../../pages/CharactersPage/classFeatures/ranger/subclasses/rangerHunter";
import { getRangerWinterWalkerPolarStrikesOptionState } from "../../../../../../pages/CharactersPage/classFeatures/ranger/subclasses/rangerWinterWalker";
import {
  getFighterPsiWarriorPsionicStrikeFormulaForCharacter,
  hasFighterPsiWarriorPsionicStrikeAvailableForCharacter
} from "../../../../../../pages/CharactersPage/classFeatures/fighter/fighter";
import { getMonkStunningStrikeOptionState } from "../../../../../../pages/CharactersPage/classFeatures/monk/monkStunningStrike";
import { getMonkWarriorOfTheElementsEmpoweredStrikesOptionState } from "../../../../../../pages/CharactersPage/classFeatures/monk/subclasses/monkWarriorOfTheElements";
import { getMonkWarriorOfMercyHandOfHarmOptionState } from "../../../../../../pages/CharactersPage/classFeatures/monk/subclasses/monkWarriorOfMercy";
import {
  getMonkWarriorOfTheOpenHandQuiveringPalmOptionState,
  monkWarriorOfTheOpenHandQuiveringPalmFocusCost
} from "../../../../../../pages/CharactersPage/classFeatures/monk/subclasses/monkWarriorOfTheOpenHand";
import { getMonkWarriorOfShadowImprovedShadowStepOptionState } from "../../../../../../pages/CharactersPage/classFeatures/monk/subclasses/monkWarriorOfShadow";
import type { ResolvedCustomWeaponEntry } from "../../../../../../pages/CharactersPage/customEquipment";
import {
  findInventoryItemStackById,
  getInventoryItemFeatureTagLabels
} from "../../../../../../pages/CharactersPage/inventoryItems";
import { hasActiveWeaponMastery } from "../../../../../../pages/CharactersPage/weaponMasteryStatus";
import {
  applyLightWeaponDamagePenalty,
  shouldApplyLightWeaponDamagePenalty
} from "../../../../../../pages/CharactersPage/weaponLightProperty";
import { hasAppliedWeaponProficiency } from "../../../../../../pages/CharactersPage/weaponProficiencyStatus";
import { adaptItemWeapon } from "../../../../../../utils/items/adaptItemWeapon";
import {
  appendCriticalHitToFormulaBreakdown,
  applyCriticalHitToWeaponAction
} from "./weaponCriticalHit";
import {
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
  appendGoliathAttackDescriptionAddition,
  getGoliathAttackOptionStateForCharacter
} from "../../../../../../pages/CharactersPage/species";
import {
  applyRangerHuntersMarkTargetWeaponAction,
  getRangerHuntersMarkTargetWeaponOptionState
} from "./rangerHuntersMarkWeapon";
import { getMonkFocusComboDisabledReason } from "./monkWeaponFocusCombos";
import { codexWeaponEntriesByName } from "./actionHelpers";
import { resolveFeatureIndicators } from "../../../../../RollStatePill/rollState";

type UseSelectedWeaponActionModelArgs = {
  character: Character;
  selectedAction: GameplayActionDefinition | null;
  selectedFeatureAction: FeatureActionCard | null;
  customWeaponEntriesById: Map<string, ResolvedCustomWeaponEntry>;
  nextRollCriticalHitOverride: boolean;
  isDreadfulStrikeSelected: boolean;
  isColossusSlayerSelected: boolean;
  isEmpoweredStrikesSelected: boolean;
  isEldritchSmiteSelected: boolean;
  isGoliathAncestryStrikeSelected: boolean;
  isHandOfHarmSelected: boolean;
  isHuntersMarkTargetSelected: boolean;
  isLifedrinkerSelected: boolean;
  isPolarStrikesSelected: boolean;
  isPsionicStrikeSelected: boolean;
  isQuiveringPalmSelected: boolean;
  isRecklessAttackSelected: boolean;
  isSacredWeaponSelected: boolean;
  isStunningStrikeSelected: boolean;
  isVowOfEnmitySelected: boolean;
};

export function useSelectedWeaponActionModel({
  character,
  selectedAction,
  selectedFeatureAction,
  customWeaponEntriesById,
  nextRollCriticalHitOverride,
  isDreadfulStrikeSelected,
  isColossusSlayerSelected,
  isEmpoweredStrikesSelected,
  isEldritchSmiteSelected,
  isGoliathAncestryStrikeSelected,
  isHandOfHarmSelected,
  isHuntersMarkTargetSelected,
  isLifedrinkerSelected,
  isPolarStrikesSelected,
  isPsionicStrikeSelected,
  isQuiveringPalmSelected,
  isRecklessAttackSelected,
  isSacredWeaponSelected,
  isStunningStrikeSelected,
  isVowOfEnmitySelected
}: UseSelectedWeaponActionModelArgs) {
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
  const selectedWeaponInventoryStack = useMemo(() => {
    if (!selectedWeaponAction || !selectedWeaponAction.key.startsWith("inventory-")) {
      return null;
    }

    const inventoryItemId = selectedWeaponAction.key.replace(/^inventory-/, "");

    return findInventoryItemStackById(character.inventoryItems, inventoryItemId);
  }, [character.inventoryItems, selectedWeaponAction]);
  const selectedWeaponItemRecord = selectedWeaponInventoryStack?.item ?? null;
  const selectedWeaponIsAttuned = Boolean(selectedWeaponInventoryStack?.attuned);
  const selectedWeaponFeatureTagLabels = getInventoryItemFeatureTagLabels(
    selectedWeaponInventoryStack
  );
  const selectedWeaponHasActiveMastery = useMemo(() => {
    if (!selectedWeaponAction) {
      return false;
    }

    if (selectedWeaponAction.hasActiveMastery) {
      return true;
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
        name: selectedWeaponItemRecord.weapon?.name
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

    if (selectedWeaponAction.weaponTraining) {
      return hasAppliedWeaponProficiency(character.weaponProficiencies, {
        training: selectedWeaponAction.weaponTraining,
        combatType: selectedWeaponAction.combatType,
        properties: selectedWeaponAction.properties
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
  const selectedWeaponEldritchSmiteState = useMemo(
    () => getWarlockEldritchSmiteWeaponOptionStateForCharacter(character, selectedWeaponAction),
    [character, selectedWeaponAction]
  );
  const selectedWeaponLifedrinkerState = useMemo(
    () => getWarlockLifedrinkerWeaponOptionStateForCharacter(character, selectedWeaponAction),
    [character, selectedWeaponAction]
  );
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
  const selectedWeaponFeyDreadfulStrikesState = useMemo(
    () => getRangerFeyWandererDreadfulStrikesOptionState(character, selectedWeaponAction),
    [character, selectedWeaponAction]
  );
  const selectedWeaponColossusSlayerState = useMemo(
    () => getRangerHunterColossusSlayerOptionState(character, selectedWeaponAction),
    [character, selectedWeaponAction]
  );
  const selectedWeaponHordeBreakerState = useMemo(
    () => getRangerHunterHordeBreakerOptionState(character, selectedWeaponAction),
    [character, selectedWeaponAction]
  );
  const selectedWeaponPolarStrikesState = useMemo(
    () => getRangerWinterWalkerPolarStrikesOptionState(character, selectedWeaponAction),
    [character, selectedWeaponAction]
  );
  const selectedWeaponGoliathAncestryState = useMemo(
    () => (selectedWeaponAction ? getGoliathAttackOptionStateForCharacter(character) : null),
    [character, selectedWeaponAction]
  );
  const selectedWeaponHuntersMarkTargetState = useMemo(
    () => getRangerHuntersMarkTargetWeaponOptionState(character, selectedWeaponAction),
    [character, selectedWeaponAction]
  );
  const selectedWeaponRecklessAttackState = useMemo(
    () => getBarbarianRecklessAttackWeaponOptionState(character, selectedWeaponAction),
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
  const selectedWeaponFeyDreadfulStrikesToggleDisabled =
    selectedWeaponFeyDreadfulStrikesState?.disabled ?? false;
  const selectedWeaponColossusSlayerToggleDisabled =
    selectedWeaponColossusSlayerState?.disabled ?? false;
  const selectedWeaponHordeBreakerToggleDisabled =
    selectedWeaponHordeBreakerState?.disabled ?? false;
  const selectedWeaponPolarStrikesToggleDisabled =
    selectedWeaponPolarStrikesState?.disabled ?? false;
  const selectedWeaponGoliathAncestryToggleDisabled =
    selectedWeaponGoliathAncestryState?.disabled ?? false;
  const selectedWeaponHuntersMarkTargetToggleDisabled = !selectedWeaponHuntersMarkTargetState;
  const selectedWeaponRecklessAttackToggleDisabled =
    selectedWeaponRecklessAttackState?.disabled ?? false;
  const selectedWeaponEldritchSmiteToggleDisabled =
    selectedWeaponEldritchSmiteState?.disabled ?? false;
  const selectedWeaponLifedrinkerToggleDisabled = selectedWeaponLifedrinkerState?.disabled ?? false;
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
      (isRecklessAttackSelected || selectedWeaponRecklessAttackState?.active === true) &&
      selectedWeaponRecklessAttackState &&
      !selectedWeaponRecklessAttackToggleDisabled
    ) {
      nextAction = applyBarbarianRecklessAttackIndicatorToWeaponAction(nextAction);
    }

    if (selectedWeaponRecklessAttackState?.active === true) {
      getBarbarianRecklessAttackWeaponDamagePreviewBonuses(character, {
        name: nextAction.name,
        ability: nextAction.ability,
        attackKind: nextAction.attackKind,
        combatType: nextAction.combatType ?? null,
        damageBonusEntries: nextAction.damageBonusEntries
      }).forEach((damageBonus) => {
        nextAction = applyWeaponDamageBonusPreview(nextAction, damageBonus);
      });
    }

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
      isDreadfulStrikeSelected &&
      selectedWeaponFeyDreadfulStrikesState &&
      !selectedWeaponFeyDreadfulStrikesToggleDisabled
    ) {
      nextAction = applyWeaponDamageBonusPreview(
        nextAction,
        selectedWeaponFeyDreadfulStrikesState.damageBonus
      );
    }

    if (
      isColossusSlayerSelected &&
      selectedWeaponColossusSlayerState &&
      !selectedWeaponColossusSlayerToggleDisabled
    ) {
      nextAction = applyWeaponDamageBonusPreview(
        nextAction,
        selectedWeaponColossusSlayerState.damageBonus
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
      isGoliathAncestryStrikeSelected &&
      selectedWeaponGoliathAncestryState?.damageBonus &&
      !selectedWeaponGoliathAncestryToggleDisabled
    ) {
      nextAction = applyWeaponDamageBonusPreview(
        nextAction,
        selectedWeaponGoliathAncestryState.damageBonus
      );
    }

    if (
      isHuntersMarkTargetSelected &&
      selectedWeaponHuntersMarkTargetState &&
      !selectedWeaponHuntersMarkTargetToggleDisabled
    ) {
      nextAction = applyRangerHuntersMarkTargetWeaponAction(
        nextAction,
        selectedWeaponHuntersMarkTargetState
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
      isEldritchSmiteSelected &&
      selectedWeaponEldritchSmiteState &&
      !selectedWeaponEldritchSmiteToggleDisabled
    ) {
      nextAction = applyWeaponDamageBonusPreview(
        nextAction,
        selectedWeaponEldritchSmiteState.damageBonus
      );
    }

    if (
      nextAction.attackKind === "weapon" &&
      isLifedrinkerSelected &&
      selectedWeaponLifedrinkerState &&
      !selectedWeaponLifedrinkerToggleDisabled
    ) {
      nextAction = applyWeaponDamageBonusPreview(
        nextAction,
        selectedWeaponLifedrinkerState.damageBonus
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

    if (shouldApplyLightWeaponDamagePenalty(character.roundTracker, nextAction)) {
      nextAction = applyLightWeaponDamagePenalty(nextAction);
    }

    return nextAction;
  }, [
    character,
    isDreadfulStrikeSelected,
    isColossusSlayerSelected,
    isEmpoweredStrikesSelected,
    isEldritchSmiteSelected,
    isGoliathAncestryStrikeSelected,
    isHandOfHarmSelected,
    isHuntersMarkTargetSelected,
    isLifedrinkerSelected,
    isPolarStrikesSelected,
    isRecklessAttackSelected,
    isSacredWeaponSelected,
    isVowOfEnmitySelected,
    isPsionicStrikeSelected,
    selectedWeaponAction,
    selectedWeaponDreadAmbusherState,
    selectedWeaponDreadfulStrikeToggleDisabled,
    selectedWeaponEldritchSmiteState,
    selectedWeaponEldritchSmiteToggleDisabled,
    selectedWeaponFeyDreadfulStrikesState,
    selectedWeaponFeyDreadfulStrikesToggleDisabled,
    selectedWeaponColossusSlayerState,
    selectedWeaponColossusSlayerToggleDisabled,
    selectedWeaponGoliathAncestryState,
    selectedWeaponGoliathAncestryToggleDisabled,
    selectedWeaponEmpoweredStrikesState,
    selectedWeaponEmpoweredStrikesToggleDisabled,
    selectedWeaponHandOfHarmToggleDisabled,
    selectedWeaponHandOfHarmState,
    selectedWeaponHuntersMarkTargetState,
    selectedWeaponHuntersMarkTargetToggleDisabled,
    selectedWeaponLifedrinkerState,
    selectedWeaponLifedrinkerToggleDisabled,
    selectedWeaponPolarStrikesState,
    selectedWeaponPolarStrikesToggleDisabled,
    selectedWeaponRecklessAttackState,
    selectedWeaponRecklessAttackToggleDisabled,
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
  const selectedWeaponDrawerDescription = useMemo(() => {
    const drawerDescription = selectedWeaponAction
      ? getWeaponDrawerDescription(selectedWeaponAction, selectedWeaponItemRecord)
      : {
          description: [],
          descriptionAdditions: []
        };

    return appendGoliathAttackDescriptionAddition(
      drawerDescription,
      selectedWeaponGoliathAncestryState
    );
  }, [selectedWeaponAction, selectedWeaponGoliathAncestryState, selectedWeaponItemRecord]);
  const selectedWeaponRollState = useMemo(
    () =>
      selectedWeaponEffectiveAction
        ? resolveFeatureIndicators(selectedWeaponEffectiveAction.indicators)
        : null,
    [selectedWeaponEffectiveAction]
  );

  return {
    selectedWeaponAction,
    selectedWeaponEntry,
    selectedWeaponItemRecord,
    selectedWeaponIsAttuned,
    selectedWeaponFeatureTagLabels,
    selectedWeaponHasActiveMastery,
    selectedWeaponHasProficiency,
    selectedWeaponDetails,
    selectedWeaponPsionicStrikeFormula,
    selectedWeaponPsionicStrikeAvailable,
    selectedWeaponEldritchSmiteState,
    selectedWeaponLifedrinkerState,
    selectedWeaponSacredWeaponState,
    selectedWeaponVowOfEnmityState,
    selectedWeaponDreadAmbusherState,
    selectedWeaponFeyDreadfulStrikesState,
    selectedWeaponColossusSlayerState,
    selectedWeaponHordeBreakerState,
    selectedWeaponPolarStrikesState,
    selectedWeaponGoliathAncestryState,
    selectedWeaponHuntersMarkTargetState,
    selectedWeaponRecklessAttackState,
    selectedWeaponFocusPointsRemaining,
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
    selectedWeaponGoliathAncestryToggleDisabled,
    selectedWeaponHuntersMarkTargetToggleDisabled,
    selectedWeaponRecklessAttackToggleDisabled,
    selectedWeaponEldritchSmiteToggleDisabled,
    selectedWeaponLifedrinkerToggleDisabled,
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
  };
}
