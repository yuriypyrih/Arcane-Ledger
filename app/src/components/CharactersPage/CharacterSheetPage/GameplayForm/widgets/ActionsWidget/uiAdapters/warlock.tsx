import { applyActionResourceTransition } from "../actionResourceTransition";
import type { ActionFormKind } from "./types";
import {
  type ActionFormAdapter,
  type ActionFormBodyContext,
  type ActionFormFooterContext
} from "./types";
import HealingLightActionBody, { type HealingLightTarget } from "../HealingLightActionBody";
import { getActionShapeForEconomyType } from "../../../gameplayWidgetUtils";
import ActionDiceConfirmFooter from "../ActionDiceConfirmFooter";
import { spendWarlockHealingLightDiceForCharacter } from "../../../../../../../pages/CharactersPage/classFeatures";

import { applyRolledHealingToCharacter } from "../../../gameplayStateUtils";
import { type ActionsWidgetSubmissionContext } from "../types";

function renderHealingLightBody(context: ActionFormBodyContext) {
  const {
    selectedAction,
    selectedHealingLightDiceCount,
    selectedHealingLightDiceRemaining,
    selectedHealingLightMaxDicePerUse,
    selectedHealingLightTarget,
    setSelectedHealingLightDiceCount,
    setSelectedHealingLightTarget
  } = context;
  if (
    !selectedAction ||
    selectedAction.kind !== "feature" ||
    selectedAction.drawer.kind !== "custom-form"
  )
    return undefined;
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
  return undefined;
}

function renderHealingLightFooter(context: ActionFormFooterContext) {
  const {
    isDiceRollerSettingsOpen,
    selectedAction,
    selectedActionEconomyShapeState,
    selectedFeatureActionPrimaryDisabledReason,
    selectedHealingLightDiceCount,
    selectedHealingLightMaxSelectableDice,
    selectedHealingLightTarget,
    setIsDiceRollerSettingsOpen,
    submitHealingLight
  } = context;
  if (!selectedAction) return undefined;
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
  return undefined;
}
export const warlockFormAdapters = {
  "healing-light": { body: renderHealingLightBody, footer: renderHealingLightFooter }
} satisfies Partial<Record<ActionFormKind, ActionFormAdapter>>;
export function createWarlockFormSubmissions(context: ActionsWidgetSubmissionContext) {
  const {
    onPersistCharacter,
    openDiceRoller,
    closeActionDrawer,
    prepareCharacterForResourceConsumption,
    selectedFeatureAction
  } = context;
  function submitHealingLight(diceCount: number, target: HealingLightTarget) {
    if (!selectedFeatureAction || diceCount <= 0) {
      return;
    }

    const healingFormula = `${diceCount}d6`;
    const dieLabel = diceCount === 1 ? "Healing d6" : "Healing d6s";

    onPersistCharacter((currentCharacter) =>
      applyActionResourceTransition(
        currentCharacter,
        selectedFeatureAction.economyType,
        prepareCharacterForResourceConsumption,
        (preparedCharacter) =>
          spendWarlockHealingLightDiceForCharacter(preparedCharacter, diceCount)
      )
    );

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
  return { submitHealingLight };
}
