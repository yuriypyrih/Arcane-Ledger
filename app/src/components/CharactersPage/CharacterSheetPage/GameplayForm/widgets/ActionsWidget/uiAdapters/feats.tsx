import { applyActionResourceTransition } from "../actionResourceTransition";
import type { ActionFormKind } from "./types";
import {
  type ActionFormAdapter,
  type ActionFormBodyContext,
  type ActionFormFooterContext
} from "./types";
import RecoverVitalityActionBody from "../RecoverVitalityActionBody";
import FluidFormsShapechangerActionBody from "../forms/FluidFormsShapechangerActionBody";
import GenieMagicActionBody from "../forms/GenieMagicActionBody";

import { getActionShapeForEconomyType } from "../../../gameplayWidgetUtils";
import ActionDiceConfirmFooter from "../ActionDiceConfirmFooter";
import ActionShape from "../../../../../../ActionShape";
import ActionButton from "../../../../../../ActionButton";
import styles from "../ActionsWidget.module.css";
import { activateBoonOfFluidFormsShapechangerForCharacter } from "../../../../../../../pages/CharactersPage/feats/runtime";

import { type ActionsWidgetSubmissionContext } from "../types";

function renderRecoverVitalityBody(context: ActionFormBodyContext) {
  const {
    selectedAction,
    selectedRecoverVitalityDiceCount,
    selectedRecoverVitalityDiceRemaining,
    setSelectedRecoverVitalityDiceCount
  } = context;
  if (
    !selectedAction ||
    selectedAction.kind !== "feature" ||
    selectedAction.drawer.kind !== "custom-form"
  )
    return undefined;
  if (selectedAction.drawer.formKind === "recover-vitality") {
    return (
      <RecoverVitalityActionBody
        remainingDice={selectedRecoverVitalityDiceRemaining}
        selectedDiceCount={selectedRecoverVitalityDiceCount}
        onSelectedDiceCountChange={setSelectedRecoverVitalityDiceCount}
      />
    );
  }
  return undefined;
}

function renderBoonFluidFormsShapechangerBody(context: ActionFormBodyContext) {
  const {
    selectedAction,
    selectedFluidFormsMonster,
    isFluidFormsMonsterModalOpen,
    setSelectedFluidFormsMonster,
    setIsFluidFormsMonsterModalOpen
  } = context;
  if (
    !selectedAction ||
    selectedAction.kind !== "feature" ||
    selectedAction.drawer.kind !== "custom-form"
  )
    return undefined;
  if (selectedAction.drawer.formKind === "boon-fluid-forms-shapechanger") {
    return (
      <FluidFormsShapechangerActionBody
        selectedMonster={selectedFluidFormsMonster}
        isPickerOpen={isFluidFormsMonsterModalOpen}
        onPickerOpenChange={setIsFluidFormsMonsterModalOpen}
        onSelectMonster={setSelectedFluidFormsMonster}
      />
    );
  }
  return undefined;
}

function renderGenieMagicWishMagicBody(context: ActionFormBodyContext) {
  const { selectedAction, selectedGenieMagicSpell, setSelectedGenieMagicSpell } = context;
  if (
    !selectedAction ||
    selectedAction.kind !== "feature" ||
    selectedAction.drawer.kind !== "custom-form"
  )
    return undefined;
  if (selectedAction.drawer.formKind === "genie-magic-wish-magic") {
    return (
      <GenieMagicActionBody
        selectedSpell={selectedGenieMagicSpell}
        onSpellSelect={setSelectedGenieMagicSpell}
      />
    );
  }
  return undefined;
}

function renderRecoverVitalityFooter(context: ActionFormFooterContext) {
  const {
    executeFeatureActivate,
    isDiceRollerSettingsOpen,
    selectedAction,
    selectedActionEconomyShapeState,
    selectedFeatureActionPrimaryDisabledReason,
    selectedRecoverVitalityDiceCount,
    selectedRecoverVitalityMaxSelectableDice,
    setIsDiceRollerSettingsOpen
  } = context;
  if (!selectedAction) return undefined;
  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "custom-form" &&
    selectedAction.drawer.formKind === "recover-vitality"
  ) {
    const selectedDiceCanBeUsed =
      selectedRecoverVitalityDiceCount > 0 &&
      selectedRecoverVitalityDiceCount <= selectedRecoverVitalityMaxSelectableDice;

    return (
      <ActionDiceConfirmFooter
        actionName={selectedAction.action.name}
        confirmLabel="Use Recover Vitality"
        actionShape={getActionShapeForEconomyType(selectedAction.economyType)}
        actionShapeAvailable={selectedActionEconomyShapeState?.isAvailable ?? true}
        actionShapeMultiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
        disabled={selectedFeatureActionPrimaryDisabledReason !== null || !selectedDiceCanBeUsed}
        isDiceRollerSettingsOpen={isDiceRollerSettingsOpen}
        onConfirm={() => executeFeatureActivate(selectedAction.action)}
        onDiceRollerSettingsOpenChange={setIsDiceRollerSettingsOpen}
      />
    );
  }
  return undefined;
}

function renderBoonFluidFormsShapechangerFooter(context: ActionFormFooterContext) {
  const { selectedFeaturePrimaryLabel } = context;
  const {
    selectedAction,
    selectedActionEconomyShapeState,
    selectedFeatureActionPrimaryDisabledReason,
    selectedFluidFormsMonster,
    submitBoonOfFluidFormsShapechanger,
    confirmSelectedActionToast
  } = context;
  if (!selectedAction) return undefined;
  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "custom-form" &&
    selectedAction.drawer.formKind === "boon-fluid-forms-shapechanger"
  ) {
    return (
      <ActionButton
        className={styles.footerActionButton}
        onClick={confirmSelectedActionToast(submitBoonOfFluidFormsShapechanger)}
        disabled={!selectedFluidFormsMonster || selectedFeatureActionPrimaryDisabledReason !== null}
        trailingBadge={
          <ActionShape
            shape="action"
            isSelected={selectedActionEconomyShapeState?.isAvailable ?? true}
            className={styles.footerActionShape}
          />
        }
      >
        {selectedFeaturePrimaryLabel}
      </ActionButton>
    );
  }
  return undefined;
}

function renderGenieMagicWishMagicFooter(context: ActionFormFooterContext) {
  const { selectedFeaturePrimaryLabel } = context;
  const {
    selectedAction,
    selectedActionEconomyShapeState,
    selectedFeatureActionPrimaryDisabledReason,
    setIsFixedSpellDrawerOpen
  } = context;
  if (!selectedAction) return undefined;
  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "custom-form" &&
    selectedAction.drawer.formKind === "genie-magic-wish-magic" &&
    selectedAction.execute.kind === "spell"
  ) {
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
  return undefined;
}
export const featsFormAdapters = {
  "recover-vitality": { body: renderRecoverVitalityBody, footer: renderRecoverVitalityFooter },
  "boon-fluid-forms-shapechanger": {
    body: renderBoonFluidFormsShapechangerBody,
    footer: renderBoonFluidFormsShapechangerFooter
  },
  "genie-magic-wish-magic": {
    body: renderGenieMagicWishMagicBody,
    footer: renderGenieMagicWishMagicFooter
  }
} satisfies Partial<Record<ActionFormKind, ActionFormAdapter>>;
export function createFeatsFormSubmissions(context: ActionsWidgetSubmissionContext) {
  const {
    onPersistCharacter,
    closeActionDrawer,
    prepareCharacterForResourceConsumption,
    selectedFeatureAction,
    selectedFluidFormsMonster
  } = context;
  function submitBoonOfFluidFormsShapechanger() {
    if (!selectedFeatureAction || !selectedFluidFormsMonster) {
      return;
    }

    onPersistCharacter((currentCharacter) =>
      applyActionResourceTransition(
        currentCharacter,
        selectedFeatureAction.economyType,
        prepareCharacterForResourceConsumption,
        (preparedCharacter) =>
          activateBoonOfFluidFormsShapechangerForCharacter(
            preparedCharacter,
            selectedFluidFormsMonster
          )
      )
    );

    closeActionDrawer();
  }
  return { submitBoonOfFluidFormsShapechanger };
}
