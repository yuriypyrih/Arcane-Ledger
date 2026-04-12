import clsx from "clsx";
import { Sparkles } from "lucide-react";
import ActionShape, { type ActionShapeType } from "../../../../ActionShape";
import sheetStyles from "../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import styles from "./SorcererInnateSorceryAction.module.css";

type SorcererInnateSorceryActionFooterProps = {
  confirmLabel: string;
  actionShape: ActionShapeType | null;
  actionShapeAvailable: boolean;
  actionShapeMultiCount: number;
  disabled: boolean;
  crownOfSpellfireUnlocked: boolean;
  crownOfSpellfireUsesRemaining: number;
  crownOfSpellfireUsesTotal: number;
  crownOfSpellfireFallbackSorceryPointCost: number;
  crownOfSpellfireDisabledReason?: string | null;
  isCrownOfSpellfireSelected: boolean;
  onConfirm: () => void;
  onCrownOfSpellfireSelectedChange: (checked: boolean) => void;
};

export function SorcererInnateSorceryActionFooter({
  confirmLabel,
  actionShape,
  actionShapeAvailable,
  actionShapeMultiCount,
  disabled,
  crownOfSpellfireUnlocked,
  crownOfSpellfireUsesRemaining,
  crownOfSpellfireUsesTotal,
  crownOfSpellfireFallbackSorceryPointCost,
  crownOfSpellfireDisabledReason = null,
  isCrownOfSpellfireSelected,
  onConfirm,
  onCrownOfSpellfireSelectedChange
}: SorcererInnateSorceryActionFooterProps) {
  return (
    <div className={styles.footerStack}>
      {crownOfSpellfireUnlocked ? (
        <label
          className={clsx(
            styles.toggle,
            crownOfSpellfireUsesRemaining <= 0 && styles.toggleDepleted
          )}
          title={crownOfSpellfireDisabledReason ?? undefined}
        >
          <span className={styles.toggleLabel}>
            <input
              type="checkbox"
              checked={isCrownOfSpellfireSelected}
              onChange={(event) => onCrownOfSpellfireSelectedChange(event.target.checked)}
            />
            <span>Crown of Spellfire</span>
            {crownOfSpellfireUsesRemaining > 0 ? (
              <span className={styles.tracker}>
                <span className={styles.trackerLabel}>Charge</span>
                <span className={sheetStyles.shortRestDots}>
                  {Array.from({ length: crownOfSpellfireUsesTotal }, (_, index) => (
                    <span
                      key={`crown-of-spellfire-charge-${index}`}
                      className={clsx(
                        sheetStyles.shortRestDot,
                        index < crownOfSpellfireUsesRemaining && sheetStyles.shortRestDotActive
                      )}
                    />
                  ))}
                </span>
              </span>
            ) : crownOfSpellfireFallbackSorceryPointCost > 0 ? (
              <span className={styles.costLabel}>
                <span>{`| Use ${crownOfSpellfireFallbackSorceryPointCost}`}</span>
                <Sparkles size={14} strokeWidth={2.1} />
              </span>
            ) : null}
          </span>
        </label>
      ) : null}
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
