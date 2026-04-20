import clsx from "clsx";
import ActionShape, { type ActionShapeType } from "../../../../ActionShape";
import CellContainer from "../../../../CellContainer/CellContainer";
import FeatureOptInToggle from "../../FeatureOptInToggle/FeatureOptInToggle";
import d20Icon from "../../../../../assets/svg/d20.svg";
import sheetStyles from "../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import { parseRollFormulaRange } from "../../../../../pages/CharactersPage/actionOutcome";
import actionStyles from "./ActionsWidget.module.css";
import DiceRollerSettingsButton from "./DiceRollerSettingsButton";
import styles from "./FighterSecondWindAction.module.css";

type FighterSecondWindActionBodyProps = {
  healingFormula: string;
  groupRecoveryFormula?: string | null;
};

type FighterSecondWindActionFooterProps = {
  actionName: string;
  confirmLabel: string;
  actionShape: ActionShapeType | null;
  actionShapeAvailable: boolean;
  actionShapeMultiCount: number;
  disabled: boolean;
  groupRecoveryUnlocked: boolean;
  groupRecoveryUsesRemaining: number;
  groupRecoveryUsesTotal: number;
  isGroupRecoverySelected: boolean;
  isDiceRollerSettingsOpen: boolean;
  onConfirm: () => void;
  onDiceRollerSettingsOpenChange: (isOpen: boolean) => void;
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
  actionName,
  confirmLabel,
  actionShape,
  actionShapeAvailable,
  actionShapeMultiCount,
  disabled,
  groupRecoveryUnlocked,
  groupRecoveryUsesRemaining,
  groupRecoveryUsesTotal,
  isGroupRecoverySelected,
  isDiceRollerSettingsOpen,
  onConfirm,
  onDiceRollerSettingsOpenChange,
  onGroupRecoverySelectedChange
}: FighterSecondWindActionFooterProps) {
  return (
    <div className={styles.footerStack}>
      {groupRecoveryUnlocked ? (
        <FeatureOptInToggle
          label="Group Recovery"
          checked={isGroupRecoverySelected}
          disabled={groupRecoveryUsesRemaining <= 0}
          muted={groupRecoveryUsesRemaining <= 0}
          onCheckedChange={onGroupRecoverySelectedChange}
          metaItems={[
            {
              kind: "tracker",
              current: groupRecoveryUsesRemaining,
              total: groupRecoveryUsesTotal
            }
          ]}
        />
      ) : null}
      <div className={actionStyles.weaponFooterActions}>
        <button
          type="button"
          className={clsx(sheetStyles.castButton, actionStyles.weaponFooterButton, styles.confirmButton)}
          onClick={onConfirm}
          disabled={disabled}
        >
          <span className={actionStyles.centeredFooterButtonContent}>
            <img src={d20Icon} alt="" className={actionStyles.weaponFooterIcon} />
            <span>{confirmLabel}</span>
            {actionShape ? (
              <ActionShape
                shape={actionShape}
                isSelected={actionShapeAvailable}
                multiCount={actionShapeMultiCount}
                className={styles.footerActionShape}
              />
            ) : null}
          </span>
        </button>
        <DiceRollerSettingsButton
          actionName={actionName}
          className={clsx(sheetStyles.castButton, actionStyles.weaponFooterIconButton)}
          isOpen={isDiceRollerSettingsOpen}
          ariaLabel="Open dice roller settings"
          onOpenChange={onDiceRollerSettingsOpenChange}
        />
      </div>
    </div>
  );
}
