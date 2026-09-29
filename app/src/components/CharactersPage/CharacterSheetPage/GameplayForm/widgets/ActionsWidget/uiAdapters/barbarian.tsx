import RageActionBody from "../forms/RageActionBody";
import { applyActionResourceTransition } from "../actionResourceTransition";
import type { ActionFormKind } from "./types";
import {
  type ActionFormAdapter,
  type ActionFormBodyContext,
  type ActionFormFooterContext
} from "./types";
import {
  WarriorOfTheGodsActionBody,
  WarriorOfTheGodsActionFooter
} from "../WarriorOfTheGodsAction";
import {
  getBarbarianBrutalStrikeDamageFormula,
  getBarbarianBrutalStrikeSelectionLimit
} from "../../../../../../../pages/CharactersPage/classFeatures/barbarian/barbarian";
import BrutalStrikeActionBody from "../forms/BrutalStrikeActionBody";
import { getActionShapeForEconomyType } from "../../../gameplayWidgetUtils";
import ActionShape from "../../../../../../ActionShape";
import ActionButton from "../../../../../../ActionButton";
import styles from "../ActionsWidget.module.css";
import { consumeBarbarianWarriorOfTheGodsChargesForCharacter } from "../../../../../../../pages/CharactersPage/classFeatures";

import { applyRolledHealingToCharacter } from "../../../gameplayStateUtils";
import { type ActionsWidgetSubmissionContext } from "../types";

function renderWarriorOfTheGodsBody(context: ActionFormBodyContext) {
  const {
    selectedAction,
    selectedWarriorOfTheGodsChargeCount,
    selectedWarriorOfTheGodsUsesRemaining,
    setSelectedWarriorOfTheGodsChargeCount
  } = context;
  if (
    !selectedAction ||
    selectedAction.kind !== "feature" ||
    selectedAction.drawer.kind !== "custom-form"
  )
    return undefined;
  if (selectedAction.drawer.formKind === "warrior-of-the-gods") {
    return (
      <WarriorOfTheGodsActionBody
        remainingCharges={selectedWarriorOfTheGodsUsesRemaining}
        selectedChargeCount={selectedWarriorOfTheGodsChargeCount}
        onSelectedChargeCountChange={setSelectedWarriorOfTheGodsChargeCount}
      />
    );
  }
  return undefined;
}

function renderBrutalStrikeBody(context: ActionFormBodyContext) {
  const { character, selectedAction, selectedActionOptionKeys, setSelectedActionOptionKeys } =
    context;
  if (
    !selectedAction ||
    selectedAction.kind !== "feature" ||
    selectedAction.drawer.kind !== "custom-form"
  )
    return undefined;
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
  return undefined;
}

function renderWarriorOfTheGodsFooter(context: ActionFormFooterContext) {
  const { selectedFeaturePrimaryLabel } = context;
  const {
    canSubmitSelectedWarriorOfTheGodsRoll,
    isDiceRollerSettingsOpen,
    selectedAction,
    selectedActionEconomyShapeState,
    selectedFeatureActionPrimaryDisabledReason,
    selectedWarriorOfTheGodsChargeCount,
    setIsDiceRollerSettingsOpen,
    submitWarriorOfTheGods
  } = context;
  if (!selectedAction) return undefined;
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
  return undefined;
}

function renderBrutalStrikeFooter(context: ActionFormFooterContext) {
  const { selectedFeaturePrimaryLabel } = context;
  const {
    selectedAction,
    selectedActionEconomyShapeState,
    selectedFeatureActionPrimaryDisabledReason,
    submitBrutalStrike,
    confirmSelectedActionToast
  } = context;
  if (!selectedAction) return undefined;
  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "custom-form" &&
    selectedAction.drawer.formKind === "brutal-strike"
  ) {
    const actionShape = getActionShapeForEconomyType(selectedAction.economyType);

    return (
      <ActionButton
        className={styles.footerActionButton}
        onClick={confirmSelectedActionToast(submitBrutalStrike)}
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
  return undefined;
}
export const barbarianFormAdapters = {
  "wild-heart-rage": { body: renderWildHeartRageBody },
  "warrior-of-the-gods": { body: renderWarriorOfTheGodsBody, footer: renderWarriorOfTheGodsFooter },
  "brutal-strike": { body: renderBrutalStrikeBody, footer: renderBrutalStrikeFooter }
} satisfies Partial<Record<ActionFormKind, ActionFormAdapter>>;
export function createBarbarianFormSubmissions(context: ActionsWidgetSubmissionContext) {
  const {
    onPersistCharacter,
    openDiceRoller,
    closeActionDrawer,
    prepareCharacterForResourceConsumption,
    activateFeatureAction,
    selectedFeatureAction
  } = context;
  function submitWarriorOfTheGods(chargeCount: number) {
    if (!selectedFeatureAction || chargeCount <= 0) {
      return;
    }

    const healingFormula = `${chargeCount}d12`;
    const chargeLabel = chargeCount === 1 ? "charge" : "charges";

    onPersistCharacter((currentCharacter) =>
      applyActionResourceTransition(
        currentCharacter,
        selectedFeatureAction.economyType,
        prepareCharacterForResourceConsumption,
        (preparedCharacter) =>
          consumeBarbarianWarriorOfTheGodsChargesForCharacter(preparedCharacter, chargeCount)
      )
    );

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

  function submitBrutalStrike() {
    if (!selectedFeatureAction) {
      return;
    }

    activateFeatureAction(selectedFeatureAction);
    closeActionDrawer();
  }
  return { submitWarriorOfTheGods, submitBrutalStrike };
}

function renderWildHeartRageBody(context: ActionFormBodyContext) {
  const {
    isRageOfTheGodsSelected,
    selectedAction,
    selectedRageOfTheGodsDescription,
    selectedRageOfTheGodsUsesRemaining,
    selectedRageOfTheGodsUsesTotal,
    selectedRageOptionKey,
    selectedRageOptions,
    selectedRagePowerOptionKey,
    selectedRagePowerOptions,
    setIsRageOfTheGodsSelected,
    setSelectedRageOptionKey,
    setSelectedRagePowerOptionKey
  } = context;
  if (
    !selectedAction ||
    selectedAction.kind !== "feature" ||
    selectedAction.drawer.kind !== "custom-form"
  )
    return undefined;
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
  return undefined;
}
