import clsx from "clsx";
import ActionShape, { type ActionShapeType } from "../../../../ActionShape";
import d20Icon from "../../../../../assets/svg/d20.svg";
import sheetStyles from "../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import styles from "./ActionsWidget.module.css";
import DiceRollerSettingsButton from "./DiceRollerSettingsButton";

type ElementalBurstActionFooterProps = {
  actionName: string;
  confirmLabel: string;
  actionShape: ActionShapeType | null;
  actionShapeAvailable: boolean;
  actionShapeMultiCount: number;
  disabled: boolean;
  isDiceRollerSettingsOpen: boolean;
  onConfirm: () => void;
  onDiceRollerSettingsOpenChange: (isOpen: boolean) => void;
};

export function ElementalBurstActionFooter({
  actionName,
  confirmLabel,
  actionShape,
  actionShapeAvailable,
  actionShapeMultiCount,
  disabled,
  isDiceRollerSettingsOpen,
  onConfirm,
  onDiceRollerSettingsOpenChange
}: ElementalBurstActionFooterProps) {
  return (
    <div className={styles.weaponFooterActions}>
      <button
        type="button"
        className={clsx(sheetStyles.castButton, styles.weaponFooterButton)}
        onClick={onConfirm}
        disabled={disabled}
      >
        <span className={styles.centeredFooterButtonContent}>
          <img src={d20Icon} alt="" className={styles.weaponFooterIcon} />
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
        className={clsx(sheetStyles.castButton, styles.weaponFooterIconButton)}
        isOpen={isDiceRollerSettingsOpen}
        aria-label="Open dice roller settings"
        onOpenChange={onDiceRollerSettingsOpenChange}
      />
    </div>
  );
}
