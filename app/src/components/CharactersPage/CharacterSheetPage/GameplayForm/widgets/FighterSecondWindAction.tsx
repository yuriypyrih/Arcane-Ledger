import clsx from "clsx";
import ActionShape, { type ActionShapeType } from "../../../../ActionShape";
import CellContainer from "../../../../CellContainer/CellContainer";
import sheetStyles from "../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import { parseRollFormulaRange } from "../../../../../pages/CharactersPage/actionOutcome";
import styles from "./FighterSecondWindAction.module.css";

type FighterSecondWindActionBodyProps = {
  healingFormula: string;
  groupRecoveryFormula?: string | null;
};

type FighterSecondWindActionFooterProps = {
  confirmLabel: string;
  actionShape: ActionShapeType | null;
  actionShapeAvailable: boolean;
  actionShapeMultiCount: number;
  disabled: boolean;
  groupRecoveryUnlocked: boolean;
  groupRecoveryUsesRemaining: number;
  groupRecoveryUsesTotal: number;
  isGroupRecoverySelected: boolean;
  onConfirm: () => void;
  onGroupRecoverySelectedChange: (checked: boolean) => void;
};

function formatHealingFormulaValue(formula: string) {
  const parsedRange = parseRollFormulaRange(formula);
  const normalizedFormula = formula.replace(/\+/g, " + ");

  if (!parsedRange) {
    return `Heal = ${normalizedFormula}`;
  }

  if (parsedRange.minimum === parsedRange.maximum) {
    return `${parsedRange.minimum} Heal = ${normalizedFormula}`;
  }

  return `${parsedRange.minimum}~${parsedRange.maximum} Heal = ${normalizedFormula}`;
}

export function FighterSecondWindActionBody({
  healingFormula,
  groupRecoveryFormula = null
}: FighterSecondWindActionBodyProps) {
  return (
    <div className={clsx(sheetStyles.spellDrawerDetails, styles.formulaGrid)}>
      <CellContainer
        className={styles.fullWidthCell}
        label="Second Wind Formula"
        content={formatHealingFormulaValue(healingFormula)}
        breakdown="[= +Fighter Level]"
        contentClassName={styles.formulaValue}
        breakdownClassName={styles.formulaBreakdown}
      />
      {groupRecoveryFormula ? (
        <CellContainer
          className={styles.fullWidthCell}
          label="Group Recovery Formula"
          content={formatHealingFormulaValue(groupRecoveryFormula)}
          breakdown="[= +Fighter Level]"
          contentClassName={styles.formulaValue}
          breakdownClassName={styles.formulaBreakdown}
        />
      ) : null}
    </div>
  );
}

export function FighterSecondWindActionFooter({
  confirmLabel,
  actionShape,
  actionShapeAvailable,
  actionShapeMultiCount,
  disabled,
  groupRecoveryUnlocked,
  groupRecoveryUsesRemaining,
  groupRecoveryUsesTotal,
  isGroupRecoverySelected,
  onConfirm,
  onGroupRecoverySelectedChange
}: FighterSecondWindActionFooterProps) {
  return (
    <div className={styles.footerStack}>
      {groupRecoveryUnlocked ? (
        <label
          className={clsx(
            styles.groupRecoveryToggle,
            groupRecoveryUsesRemaining <= 0 && styles.groupRecoveryToggleDisabled
          )}
        >
          <span className={styles.groupRecoveryToggleLabel}>
            <input
              type="checkbox"
              checked={isGroupRecoverySelected}
              disabled={groupRecoveryUsesRemaining <= 0}
              onChange={(event) => onGroupRecoverySelectedChange(event.target.checked)}
            />
            <span>Group Recovery</span>
            <span className={styles.groupRecoveryTracker}>
              <span className={styles.groupRecoveryTrackerLabel}>Charges</span>
              <span className={sheetStyles.shortRestDots}>
                {Array.from({ length: groupRecoveryUsesTotal }, (_, index) => (
                  <span
                    key={`group-recovery-charge-${index}`}
                    className={clsx(
                      sheetStyles.shortRestDot,
                      index < groupRecoveryUsesRemaining && sheetStyles.shortRestDotActive
                    )}
                  />
                ))}
              </span>
            </span>
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
