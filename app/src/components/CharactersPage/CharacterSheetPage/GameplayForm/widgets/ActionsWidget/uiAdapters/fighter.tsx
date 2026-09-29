import type { ActionFormKind } from "./types";
import {
  type ActionFormAdapter,
  type ActionFormBodyContext,
  type ActionFormFooterContext
} from "./types";
import {
  IndomitableActionBody,
  IndomitableActionFooter,
  type IndomitableOption
} from "../IndomitableAction";
import { getActionShapeForEconomyType } from "../../../gameplayWidgetUtils";
import { activateFeatureActionForCharacter } from "../../../../../../../pages/CharactersPage/classFeatures";
import { type ActionsWidgetSubmissionContext } from "../types";

function renderIndomitableBody(context: ActionFormBodyContext) {
  const {
    indomitableSavingThrowOptions,
    selectedAction,
    selectedIndomitableAbility,
    setSelectedIndomitableAbility
  } = context;
  if (
    !selectedAction ||
    selectedAction.kind !== "feature" ||
    selectedAction.drawer.kind !== "custom-form"
  )
    return undefined;
  if (selectedAction.drawer.formKind === "indomitable") {
    return (
      <IndomitableActionBody
        options={indomitableSavingThrowOptions}
        selectedAbility={selectedIndomitableAbility}
        onSelectAbility={setSelectedIndomitableAbility}
      />
    );
  }
  return undefined;
}

function renderIndomitableFooter(context: ActionFormFooterContext) {
  const { selectedFeaturePrimaryLabel } = context;
  const {
    isDiceRollerSettingsOpen,
    selectedAction,
    selectedActionEconomyShapeState,
    selectedFeatureActionPrimaryDisabledReason,
    selectedIndomitableOption,
    setIsDiceRollerSettingsOpen,
    submitIndomitable
  } = context;
  if (!selectedAction) return undefined;
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
          selectedFeatureActionPrimaryDisabledReason !== null || selectedIndomitableOption === null
        }
        isDiceRollerSettingsOpen={isDiceRollerSettingsOpen}
        onConfirm={() => selectedIndomitableOption && submitIndomitable(selectedIndomitableOption)}
        onDiceRollerSettingsOpenChange={setIsDiceRollerSettingsOpen}
      />
    );
  }
  return undefined;
}
export const fighterFormAdapters = {
  indomitable: { body: renderIndomitableBody, footer: renderIndomitableFooter }
} satisfies Partial<Record<ActionFormKind, ActionFormAdapter>>;
export function createFighterFormSubmissions(context: ActionsWidgetSubmissionContext) {
  const { onPersistCharacter, openDiceRoller, closeActionDrawer, selectedFeatureAction } = context;
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
  return { submitIndomitable };
}
