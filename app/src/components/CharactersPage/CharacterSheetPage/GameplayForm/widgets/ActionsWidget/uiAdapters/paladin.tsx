import type { ActionFormKind } from "./types";
import {
  type ActionFormAdapter,
  type ActionFormBodyContext,
  type ActionFormFooterContext
} from "./types";
import {
  getLayOnHandsCurableConditionsForCharacter,
  applyLayOnHandsForCharacter
} from "../../../../../../../pages/CharactersPage/classFeatures";
import { LayOnHandsActionBody, LayOnHandsActionFooter } from "../LayOnHandsAction";
import { getActionShapeForEconomyType } from "../../../gameplayWidgetUtils";
import { type LayOnHandsCondition } from "../../../../../../../pages/CharactersPage/classFeatures/paladin/paladin";
import { getRoundTrackerResourceForEconomyType } from "../../../../../../../pages/CharactersPage/actionEconomy";
import { consumeRoundTrackerResourceForCharacter } from "../../../gameplayStateUtils";
import { type ActionsWidgetSubmissionContext } from "../types";

function renderLayOnHandsBody(context: ActionFormBodyContext) {
  const {
    character,
    selectedAction,
    selectedLayOnHandsConditions,
    selectedLayOnHandsPoolSpendInput,
    selectedLayOnHandsTarget,
    setSelectedLayOnHandsConditions,
    setSelectedLayOnHandsPoolSpendInput,
    setSelectedLayOnHandsTarget
  } = context;
  if (
    !selectedAction ||
    selectedAction.kind !== "feature" ||
    selectedAction.drawer.kind !== "custom-form"
  )
    return undefined;
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
  return undefined;
}

function renderLayOnHandsFooter(context: ActionFormFooterContext) {
  const { selectedFeaturePrimaryLabel } = context;
  const {
    canSubmitLayOnHands,
    selectedAction,
    selectedActionEconomyShapeState,
    selectedFeatureActionPrimaryDisabledReason,
    selectedLayOnHandsConditions,
    selectedLayOnHandsPoolSpendAmount,
    selectedLayOnHandsTarget,
    submitLayOnHands
  } = context;
  if (!selectedAction) return undefined;
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
  return undefined;
}
export const paladinFormAdapters = {
  "lay-on-hands": { body: renderLayOnHandsBody, footer: renderLayOnHandsFooter }
} satisfies Partial<Record<ActionFormKind, ActionFormAdapter>>;
export function createPaladinFormSubmissions(context: ActionsWidgetSubmissionContext) {
  const {
    onPersistCharacter,
    closeActionDrawer,
    prepareCharacterForResourceConsumption,
    selectedFeatureAction
  } = context;
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
  return { submitLayOnHands };
}
