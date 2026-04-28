import { useMemo } from "react";
import type { Character } from "../../../../../../types";
import type { GameplayActionDefinition } from "../../../../../../pages/CharactersPage/combatActions";
import {
  getPaladinHealingPoolRemainingForCharacter,
  getPaladinHealingPoolTotalForCharacter
} from "../../../../../../pages/CharactersPage/classFeatures";
import { getFighterBattleMasterSuperiorityDieForCharacter } from "../../../../../../pages/CharactersPage/classFeatures/fighter/fighter";
import { fighterBattleMasterCombatSuperiorityActionKey } from "../../../../../../pages/CharactersPage/classFeatures/fighter/subclasses/fighterBattleMaster";
import type { LayOnHandsCondition } from "../../../../../../pages/CharactersPage/classFeatures/paladin/paladin";
import {
  getMonkWarriorOfTheElementsElementalResistanceDamageTypeSelection,
  monkElementalAttunementActionKey
} from "../../../../../../pages/CharactersPage/classFeatures/monk/subclasses/monkWarriorOfTheElements";

type UseSelectedActionModelArgs = {
  character: Character;
  selectableActions: GameplayActionDefinition[];
  selectedActionKey: string | null;
  selectedLayOnHandsPoolSpendInput: string;
  selectedLayOnHandsConditions: LayOnHandsCondition[];
};

export function useSelectedActionModel({
  character,
  selectableActions,
  selectedActionKey,
  selectedLayOnHandsPoolSpendInput,
  selectedLayOnHandsConditions
}: UseSelectedActionModelArgs) {
  const selectedAction =
    selectedActionKey !== null
      ? (selectableActions.find((combatAction) => combatAction.key === selectedActionKey) ?? null)
      : null;
  const selectedFeatureAction = selectedAction?.kind === "feature" ? selectedAction.action : null;
  const isHordeBreakerSelected =
    selectedAction?.kind === "weapon" &&
    selectedAction.action.key === character.classFeatureState?.ranger?.hunterHordeBreakerActionKey;
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
  const selectedActionBadges = useMemo(
    () => (selectedCombatSuperiorityDie ? [`Current ${selectedCombatSuperiorityDie.toUpperCase()}`] : []),
    [selectedCombatSuperiorityDie]
  );

  return {
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
    selectedCombatSuperiorityDie,
    selectedActionBadges
  };
}
