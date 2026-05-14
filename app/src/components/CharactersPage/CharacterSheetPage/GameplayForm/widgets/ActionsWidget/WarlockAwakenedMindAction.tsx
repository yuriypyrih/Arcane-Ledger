import ActionButton from "../../../../../ActionButton";
import ActionShape, { type ActionShapeType } from "../../../../../ActionShape";
import FeatureOptInToggle from "../../../FeatureOptInToggle/FeatureOptInToggle";
import {
  createChargesOrResourceCardUsage,
  createFeatureActionCardCost
} from "../../../../../../pages/CharactersPage/classFeatures/cardUsage";
import { runWithActionConfirmationToast } from "../../../actionConfirmationToast";
import styles from "./WarlockAwakenedMindAction.module.css";

type WarlockAwakenedMindActionFooterProps = {
  confirmLabel: string;
  actionShape: ActionShapeType | null;
  actionShapeAvailable: boolean;
  actionShapeMultiCount: number;
  disabled: boolean;
  clairvoyantCombatantUsesRemaining: number;
  clairvoyantCombatantUsesTotal: number;
  toggleDisabled: boolean;
  toggleDisabledReason?: string | null;
  isClairvoyantCombatantSelected: boolean;
  onConfirm: () => void;
  onClairvoyantCombatantSelectedChange: (checked: boolean) => void;
};

export function WarlockAwakenedMindActionFooter({
  confirmLabel,
  actionShape,
  actionShapeAvailable,
  actionShapeMultiCount,
  disabled,
  clairvoyantCombatantUsesRemaining,
  clairvoyantCombatantUsesTotal,
  toggleDisabled,
  toggleDisabledReason = null,
  isClairvoyantCombatantSelected,
  onConfirm,
  onClairvoyantCombatantSelectedChange
}: WarlockAwakenedMindActionFooterProps) {
  return (
    <div className={styles.footerStack}>
      <FeatureOptInToggle
        label="Clairvoyant Combatant"
        checked={isClairvoyantCombatantSelected}
        disabled={toggleDisabled}
        muted={toggleDisabled}
        onCheckedChange={onClairvoyantCombatantSelectedChange}
        title={toggleDisabledReason ?? undefined}
        usage={createChargesOrResourceCardUsage(
          clairvoyantCombatantUsesRemaining,
          clairvoyantCombatantUsesTotal,
          createFeatureActionCardCost({
            resourceLabel: "Pact Magic Slot"
          })
        )}
        usageKey="clairvoyant-combatant"
      />
      <ActionButton
        className={styles.confirmButton}
        onClick={() => runWithActionConfirmationToast(actionShape, onConfirm)}
        disabled={disabled}
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
    </div>
  );
}
