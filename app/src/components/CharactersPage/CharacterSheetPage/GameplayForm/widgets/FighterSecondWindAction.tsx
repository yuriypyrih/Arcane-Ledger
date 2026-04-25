import clsx from "clsx";
import ActionShape, { type ActionShapeType } from "../../../../ActionShape";
import CellContainer from "../../../../CellContainer/CellContainer";
import FeatureOptInToggle from "../../FeatureOptInToggle/FeatureOptInToggle";
import d20Icon from "../../../../../assets/svg/d20.svg";
import sheetStyles from "../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import { createChargesCardUsage } from "../../../../../pages/CharactersPage/classFeatures/cardUsage";
import {
  formatFormulaBreakdown,
  formatFormulaCell
} from "../../../../../pages/CharactersPage/shared/formulas";
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
  return formatFormulaCell({
    formula,
    resultLabel: "Heal"
  }).value;
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
        breakdown={formatFormulaBreakdown(["+ Fighter Level"])}
        contentClassName={styles.formulaValue}
        breakdownClassName={styles.formulaBreakdown}
      />
      {groupRecoveryFormula ? (
        <CellContainer
          className={styles.fullWidthCell}
          label="Group Recovery Formula"
          content={formatHealingFormulaValue(groupRecoveryFormula)}
          breakdown={formatFormulaBreakdown(["+ Fighter Level"])}
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
          usage={createChargesCardUsage(groupRecoveryUsesRemaining, groupRecoveryUsesTotal)}
          usageKey="group-recovery"
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
