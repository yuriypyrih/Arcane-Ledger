import ActionButton from "../../../../../../ActionButton";
import ActionShape, { type ActionShapeType } from "../../../../../../ActionShape";
import { runWithActionConfirmationToastAsync } from "../../../../actionConfirmationToast";
import ActionFooterButtonRow from "../ActionFooterButtonRow";
import styles from "../ActionsWidget.module.css";

type ArtificerArcaneFirearmActionFooterProps = {
  selectedStackId: string | null;
  isSubmitting: boolean;
  disabledReason: string | null;
  actionShape: ActionShapeType | null;
  actionShapeAvailable: boolean;
  actionShapeMultiCount: number;
  confirmLabel: string;
  onUseArcaneFirearm: (stackId: string) => Promise<void>;
};

function ArtificerArcaneFirearmActionFooter({
  selectedStackId,
  isSubmitting,
  disabledReason,
  actionShape,
  actionShapeAvailable,
  actionShapeMultiCount,
  confirmLabel,
  onUseArcaneFirearm
}: ArtificerArcaneFirearmActionFooterProps) {
  function handleSubmit() {
    if (!selectedStackId) {
      return;
    }

    void runWithActionConfirmationToastAsync("action", () =>
      onUseArcaneFirearm(selectedStackId)
    ).catch(() => undefined);
  }

  return (
    <ActionFooterButtonRow>
      <ActionButton
        className={styles.weaponFooterButton}
        onClick={handleSubmit}
        loading={isSubmitting}
        disabled={!selectedStackId || disabledReason !== null}
        trailingBadge={
          actionShape ? (
            <ActionShape
              shape={actionShape}
              isSelected={actionShapeAvailable}
              multiCount={actionShapeMultiCount}
              className={styles.footerActionShape}
            />
          ) : null
        }
      >
        {confirmLabel}
      </ActionButton>
    </ActionFooterButtonRow>
  );
}

export default ArtificerArcaneFirearmActionFooter;
