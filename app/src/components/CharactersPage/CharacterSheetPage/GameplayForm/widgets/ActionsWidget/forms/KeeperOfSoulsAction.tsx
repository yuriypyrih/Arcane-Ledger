import ActionButton from "../../../../../../ActionButton";
import ActionShape from "../../../../../../ActionShape";
import SegmentedChoiceControl from "../../../../../../SegmentedChoiceControl";
import { activateKeeperOfSouls } from "../../../../../../../pages/CharactersPage/classFeatures/cleric/subclasses/clericGraveDomain";
import { getActionShapeForEconomyType } from "../../../gameplayWidgetUtils";
import { applyActionResourceTransition } from "../actionResourceTransition";
import type { ActionsWidgetSubmissionContext } from "../types";
import type { ActionFormBodyContext, ActionFormFooterContext } from "../uiAdapters/types";
import styles from "../ActionsWidget.module.css";
import targetStyles from "./KeeperOfSoulsAction.module.css";

export function KeeperOfSoulsActionBody({ context }: { context: ActionFormBodyContext }) {
  return (
    <div className={targetStyles.targetSwitch}>
      <SegmentedChoiceControl
        ariaLabel="Keeper of Souls target"
        value={context.selectedKeeperOfSoulsTarget}
        options={[
          { value: "self", label: "Myself" },
          { value: "other", label: "Another" }
        ]}
        onValueChange={(value) =>
          context.setSelectedKeeperOfSoulsTarget(value === "other" ? "other" : "self")
        }
      />
    </div>
  );
}

export function KeeperOfSoulsActionFooter({ context }: { context: ActionFormFooterContext }) {
  const {
    selectedKeeperOfSoulsTarget,
    selectedAction,
    onPersistCharacter,
    closeActionDrawer,
    selectedFeaturePrimaryLabel,
    selectedFeatureActionPrimaryDisabledReason,
    selectedActionEconomyShapeState,
    confirmSelectedActionToast
  } = context;
  if (selectedAction?.kind !== "feature") return null;
  const actionShape = getActionShapeForEconomyType(selectedAction.economyType);
  const prepare =
    context.prepareCharacterForResourceConsumption as ActionsWidgetSubmissionContext["prepareCharacterForResourceConsumption"];

  function confirm() {
    if (!selectedAction || selectedFeatureActionPrimaryDisabledReason !== null) return;
    onPersistCharacter((current) =>
      applyActionResourceTransition(current, selectedAction.economyType, prepare, (prepared) =>
        activateKeeperOfSouls(prepared, selectedKeeperOfSoulsTarget)
      )
    );
    closeActionDrawer();
  }

  return (
    <ActionButton
      className={styles.footerActionButton}
      onClick={confirmSelectedActionToast(confirm)}
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
