import type { ActionShapeType } from "../../../../../ActionShape";
import FeatureOptInToggle from "../../../FeatureOptInToggle/FeatureOptInToggle";
import ActionDiceConfirmFooter from "./ActionDiceConfirmFooter";
import styles from "./ActionsWidget.module.css";

type FortifyingSoulActionFooterProps = {
  actionName: string;
  confirmLabel: string;
  actionShape: ActionShapeType | null;
  actionShapeAvailable: boolean;
  actionShapeMultiCount: number;
  disabled: boolean;
  includingSelf: boolean;
  isDiceRollerSettingsOpen: boolean;
  onConfirm: () => void;
  onDiceRollerSettingsOpenChange: (isOpen: boolean) => void;
  onIncludingSelfChange: (checked: boolean) => void;
};

function FortifyingSoulActionFooter({
  actionName,
  confirmLabel,
  actionShape,
  actionShapeAvailable,
  actionShapeMultiCount,
  disabled,
  includingSelf,
  isDiceRollerSettingsOpen,
  onConfirm,
  onDiceRollerSettingsOpenChange,
  onIncludingSelfChange
}: FortifyingSoulActionFooterProps) {
  return (
    <div className={styles.footerActionStack}>
      <FeatureOptInToggle
        label="Including myself"
        checked={includingSelf}
        disabled={disabled}
        muted={disabled}
        onCheckedChange={onIncludingSelfChange}
      />
      <ActionDiceConfirmFooter
        actionName={actionName}
        confirmLabel={confirmLabel}
        actionShape={actionShape}
        actionShapeAvailable={actionShapeAvailable}
        actionShapeMultiCount={actionShapeMultiCount}
        disabled={disabled}
        isDiceRollerSettingsOpen={isDiceRollerSettingsOpen}
        onConfirm={onConfirm}
        onDiceRollerSettingsOpenChange={onDiceRollerSettingsOpenChange}
      />
    </div>
  );
}

export default FortifyingSoulActionFooter;
