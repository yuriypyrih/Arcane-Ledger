import clsx from "clsx";
import ActionShape, { type ActionShapeType } from "../../../../ActionShape";
import sheetStyles from "../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import styles from "./WarlockAwakenedMindAction.module.css";

type WarlockAwakenedMindActionFooterProps = {
  confirmLabel: string;
  actionShape: ActionShapeType | null;
  actionShapeAvailable: boolean;
  actionShapeMultiCount: number;
  disabled: boolean;
  clairvoyantCombatantUsesRemaining: number;
  clairvoyantCombatantUsesTotal: number;
  pactMagicSlotsRemaining: number;
  pactMagicSlotTotal: number;
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
  pactMagicSlotsRemaining,
  pactMagicSlotTotal,
  toggleDisabled,
  toggleDisabledReason = null,
  isClairvoyantCombatantSelected,
  onConfirm,
  onClairvoyantCombatantSelectedChange
}: WarlockAwakenedMindActionFooterProps) {
  return (
    <div className={styles.footerStack}>
      <label
        className={clsx(
          styles.toggle,
          clairvoyantCombatantUsesRemaining <= 0 && styles.toggleDepleted,
          toggleDisabled && styles.toggleUnavailable
        )}
        title={toggleDisabledReason ?? undefined}
      >
        <span className={styles.toggleLabel}>
          <input
            type="checkbox"
            checked={isClairvoyantCombatantSelected}
            disabled={toggleDisabled}
            onChange={(event) => onClairvoyantCombatantSelectedChange(event.target.checked)}
          />
          <span>Clairvoyant Combatant</span>
          {clairvoyantCombatantUsesRemaining > 0 ? (
            <span className={styles.tracker}>
              <span className={styles.trackerLabel}>Charge</span>
              <span className={sheetStyles.shortRestDots}>
                {Array.from({ length: clairvoyantCombatantUsesTotal }, (_, index) => (
                  <span
                    key={`clairvoyant-combatant-charge-${index}`}
                    className={clsx(
                      sheetStyles.shortRestDot,
                      index < clairvoyantCombatantUsesRemaining && sheetStyles.shortRestDotActive
                    )}
                  />
                ))}
              </span>
            </span>
          ) : (
            <span className={styles.costLabel}>
              {`| Use 1 Pact Magic slot (${pactMagicSlotsRemaining}/${pactMagicSlotTotal})`}
            </span>
          )}
        </span>
      </label>
      <button
        type="button"
        className={clsx(sheetStyles.castButton, styles.confirmButton)}
        onClick={onConfirm}
        disabled={disabled}
      >
        <span>{confirmLabel}</span>
        {actionShape ? (
          <ActionShape
            shape={actionShape}
            isSelected={actionShapeAvailable}
            multiCount={actionShapeMultiCount}
            className={styles.footerActionShape}
          />
        ) : null}
      </button>
    </div>
  );
}
