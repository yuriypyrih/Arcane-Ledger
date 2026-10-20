import type { ActionFormKind } from "./types";
import {
  type ActionFormAdapter,
  type ActionFormBodyContext,
  type ActionFormFooterContext
} from "./types";
import BlessingOfTheTricksterActionBody from "../BlessingOfTheTricksterActionBody";
import {
  KeeperOfSoulsActionBody,
  KeeperOfSoulsActionFooter
} from "../forms/KeeperOfSoulsAction";
import ActionShape from "../../../../../../ActionShape";
import { getActionShapeForEconomyType } from "../../../gameplayWidgetUtils";
import ActionButton from "../../../../../../ActionButton";
import styles from "../ActionsWidget.module.css";
import { activateClericBlessingOfTheTricksterForCharacter } from "../../../../../../../pages/CharactersPage/classFeatures";
import { getRoundTrackerResourceForEconomyType } from "../../../../../../../pages/CharactersPage/actionEconomy";
import { consumeRoundTrackerResourceForCharacter } from "../../../gameplayStateUtils";
import { type ActionsWidgetSubmissionContext } from "../types";

function renderBlessingOfTheTricksterBody(context: ActionFormBodyContext) {
  const {
    selectedAction,
    selectedBlessingOfTheTricksterTarget,
    setSelectedBlessingOfTheTricksterTarget
  } = context;
  if (
    !selectedAction ||
    selectedAction.kind !== "feature" ||
    selectedAction.drawer.kind !== "custom-form"
  )
    return undefined;
  if (selectedAction.drawer.formKind === "blessing-of-the-trickster") {
    return (
      <BlessingOfTheTricksterActionBody
        selectedTarget={selectedBlessingOfTheTricksterTarget}
        onSelectTarget={setSelectedBlessingOfTheTricksterTarget}
      />
    );
  }
  return undefined;
}

function renderBlessingOfTheTricksterFooter(context: ActionFormFooterContext) {
  const { selectedFeaturePrimaryLabel } = context;
  const {
    selectedAction,
    selectedActionEconomyShapeState,
    selectedFeatureActionPrimaryDisabledReason,
    submitBlessingOfTheTrickster,
    confirmSelectedActionToast
  } = context;
  if (!selectedAction) return undefined;
  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "custom-form" &&
    selectedAction.drawer.formKind === "blessing-of-the-trickster"
  ) {
    const actionShape = getActionShapeForEconomyType(selectedAction.economyType);

    return (
      <ActionButton
        className={styles.footerActionButton}
        onClick={confirmSelectedActionToast(submitBlessingOfTheTrickster)}
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
export const clericFormAdapters = {
  "keeper-of-souls": {
    body: (context) => <KeeperOfSoulsActionBody context={context} />,
    footer: (context) => (
      <KeeperOfSoulsActionFooter key={context.selectedAction?.key} context={context} />
    )
  },
  "blessing-of-the-trickster": {
    body: renderBlessingOfTheTricksterBody,
    footer: renderBlessingOfTheTricksterFooter
  }
} satisfies Partial<Record<ActionFormKind, ActionFormAdapter>>;
export function createClericFormSubmissions(context: ActionsWidgetSubmissionContext) {
  const {
    onPersistCharacter,
    closeActionDrawer,
    prepareCharacterForResourceConsumption,
    selectedFeatureAction,
    selectedBlessingOfTheTricksterTarget
  } = context;
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
  return { submitBlessingOfTheTrickster };
}
