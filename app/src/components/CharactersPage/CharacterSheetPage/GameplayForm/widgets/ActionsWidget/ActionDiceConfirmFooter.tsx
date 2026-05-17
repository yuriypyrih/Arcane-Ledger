import ActionButton from "../../../../../ActionButton";
import ActionShape, { type ActionShapeType } from "../../../../../ActionShape";
import d20Icon from "../../../../../../assets/svg/d20.svg";
import DiceRollerSettingsButton from "../DiceRollerSettingsButton";
import ActionFooterButtonRow from "./ActionFooterButtonRow";
import styles from "./ActionsWidget.module.css";

type ActionDiceConfirmFooterProps = {
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

function ActionDiceConfirmFooter({
  actionName,
  confirmLabel,
  actionShape,
  actionShapeAvailable,
  actionShapeMultiCount,
  disabled,
  isDiceRollerSettingsOpen,
  onConfirm,
  onDiceRollerSettingsOpenChange
}: ActionDiceConfirmFooterProps) {
  return (
    <ActionFooterButtonRow
      settings={
        <DiceRollerSettingsButton
          actionName={actionName}
          className={styles.weaponFooterIconButton}
          isOpen={isDiceRollerSettingsOpen}
          ariaLabel="Open dice roller settings"
          onOpenChange={onDiceRollerSettingsOpenChange}
        />
      }
    >
      <ActionButton
        className={styles.weaponFooterButton}
        onClick={onConfirm}
        disabled={disabled}
        icon={<img src={d20Icon} alt="" className={styles.weaponFooterIcon} />}
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

export default ActionDiceConfirmFooter;
