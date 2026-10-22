import { Save } from "lucide-react";
import { applyActionResourceTransition } from "../actionResourceTransition";
import type { ActionFormKind } from "./types";
import {
  type ActionFormAdapter,
  type ActionFormBodyContext,
  type ActionFormFooterContext
} from "./types";
import PortentActionBody, { portentActionFormId } from "../PortentActionBody";
import ThirdEyeActionBody from "../ThirdEyeActionBody";
import ArcaneRecoveryActionBody from "../forms/ArcaneRecoveryActionBody";
import ActionButton from "../../../../../../ActionButton";
import styles from "../ActionsWidget.module.css";
import {
  getArcaneRecoverySelectionLevelTotal,
  type ArcaneRecoverySelection
} from "../../../../../../../pages/CharactersPage/classFeatures/wizard/wizard";
import ActionShape from "../../../../../../ActionShape";
import { type CharacterWizardPortentRoll } from "../../../../../../../types";
import { activateArcaneRecoveryForCharacter } from "../../../../../../../pages/CharactersPage/classFeatures";
import { setWizardDivinerPortentRolls } from "../../../../../../../pages/CharactersPage/classFeatures/wizard/subclasses/wizardDivinerPortent";
import { activateWizardDivinerThirdEye } from "../../../../../../../pages/CharactersPage/classFeatures/wizard/subclasses/wizardDivinerThirdEye";

import { type ActionsWidgetSubmissionContext } from "../types";

function renderPortentBody(context: ActionFormBodyContext) {
  const { character, selectedAction, submitPortent } = context;
  if (
    !selectedAction ||
    selectedAction.kind !== "feature" ||
    selectedAction.drawer.kind !== "custom-form"
  )
    return undefined;
  if (selectedAction.drawer.formKind === "portent") {
    return <PortentActionBody character={character} onSubmit={submitPortent} />;
  }
  return undefined;
}

function renderThirdEyeBody(context: ActionFormBodyContext) {
  const { selectedAction, selectedThirdEyeOptionKey, setSelectedThirdEyeOptionKey } = context;
  if (
    !selectedAction ||
    selectedAction.kind !== "feature" ||
    selectedAction.drawer.kind !== "custom-form"
  )
    return undefined;
  if (selectedAction.drawer.formKind === "third-eye") {
    return (
      <ThirdEyeActionBody
        selectedOptionKey={selectedThirdEyeOptionKey}
        onSelectOption={setSelectedThirdEyeOptionKey}
      />
    );
  }
  return undefined;
}

function renderArcaneRecoveryBody(context: ActionFormBodyContext) {
  const {
    character,
    selectedAction,
    selectedArcaneRecoverySelection,
    setSelectedArcaneRecoverySelection
  } = context;
  if (
    !selectedAction ||
    selectedAction.kind !== "feature" ||
    selectedAction.drawer.kind !== "custom-form"
  )
    return undefined;
  if (selectedAction.drawer.formKind === "arcane-recovery") {
    return (
      <ArcaneRecoveryActionBody
        character={character}
        selection={selectedArcaneRecoverySelection}
        onSelectionChange={setSelectedArcaneRecoverySelection}
      />
    );
  }
  return undefined;
}

function renderPortentFooter(context: ActionFormFooterContext) {
  const { selectedAction } = context;
  if (!selectedAction) return undefined;
  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "custom-form" &&
    selectedAction.drawer.formKind === "portent"
  ) {
    return (
      <ActionButton
        className={styles.footerActionButton}
        type="submit"
        form={portentActionFormId}
        icon={<Save size={16} aria-hidden="true" />}
      >
        Save Portent
      </ActionButton>
    );
  }
  return undefined;
}

function renderArcaneRecoveryFooter(context: ActionFormFooterContext) {
  const { selectedFeaturePrimaryLabel } = context;
  const {
    selectedAction,
    selectedArcaneRecoverySelection,
    selectedFeatureActionPrimaryDisabledReason,
    submitArcaneRecovery,
    confirmSelectedActionToast
  } = context;
  if (!selectedAction) return undefined;
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
        onClick={confirmSelectedActionToast(() =>
          submitArcaneRecovery(selectedArcaneRecoverySelection)
        )}
        disabled={
          selectedFeatureActionPrimaryDisabledReason !== null ||
          selectedArcaneRecoveryLevelTotal <= 0
        }
      >
        {selectedFeaturePrimaryLabel}
      </ActionButton>
    );
  }
  return undefined;
}

function renderThirdEyeFooter(context: ActionFormFooterContext) {
  const { selectedFeaturePrimaryLabel } = context;
  const {
    selectedAction,
    selectedActionEconomyShapeState,
    selectedFeatureActionPrimaryDisabledReason,
    selectedThirdEyeOptionKey,
    submitThirdEye,
    confirmSelectedActionToast
  } = context;
  if (!selectedAction) return undefined;
  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "custom-form" &&
    selectedAction.drawer.formKind === "third-eye"
  ) {
    return (
      <ActionButton
        className={styles.footerActionButton}
        onClick={confirmSelectedActionToast(submitThirdEye)}
        disabled={
          selectedThirdEyeOptionKey === null || selectedFeatureActionPrimaryDisabledReason !== null
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
  return undefined;
}
export const wizardFormAdapters = {
  portent: { body: renderPortentBody, footer: renderPortentFooter },
  "third-eye": { body: renderThirdEyeBody, footer: renderThirdEyeFooter },
  "arcane-recovery": { body: renderArcaneRecoveryBody, footer: renderArcaneRecoveryFooter }
} satisfies Partial<Record<ActionFormKind, ActionFormAdapter>>;
export function createWizardFormSubmissions(context: ActionsWidgetSubmissionContext) {
  const {
    onPersistCharacter,
    closeActionDrawer,
    prepareCharacterForResourceConsumption,
    selectedFeatureAction,
    selectedThirdEyeOptionKey
  } = context;
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

    onPersistCharacter((currentCharacter) =>
      applyActionResourceTransition(
        currentCharacter,
        selectedFeatureAction.economyType,
        prepareCharacterForResourceConsumption,
        (preparedCharacter) =>
          activateWizardDivinerThirdEye(preparedCharacter, selectedThirdEyeOptionKey)
      )
    );
    closeActionDrawer();
  }
  return { submitArcaneRecovery, submitPortent, submitThirdEye };
}
