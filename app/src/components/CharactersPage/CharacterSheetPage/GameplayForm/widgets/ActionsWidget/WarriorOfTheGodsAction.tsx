import ActionButton from "../../../../../ActionButton";
import ActionShape, { type ActionShapeType } from "../../../../../ActionShape";
import CellContainer from "../../../../../CellContainer/CellContainer";
import d20Icon from "../../../../../../assets/svg/d20.svg";
import styles from "./ActionsWidget.module.css";
import sharedModalStyles from "./FeatureActionModal.module.css";
import DiceRollerSettingsButton from "../DiceRollerSettingsButton";

type WarriorOfTheGodsActionBodyProps = {
  remainingCharges: number;
  selectedChargeCount: number;
  onSelectedChargeCountChange: (count: number) => void;
};

type WarriorOfTheGodsActionFooterProps = {
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

function normalizeChargeCount(value: string, maxValue: number): number {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return 0;
  }

  return Math.max(0, Math.min(maxValue, Math.floor(parsedValue)));
}

export function WarriorOfTheGodsActionBody({
  remainingCharges,
  selectedChargeCount,
  onSelectedChargeCountChange
}: WarriorOfTheGodsActionBodyProps) {
  const selectedFormula =
    selectedChargeCount > 0 ? `${selectedChargeCount}d12` : "Choose dice to roll";

  return (
    <>
      <label className={sharedModalStyles.chargeSpendField}>
        <span className={sharedModalStyles.chargeSpendLabel}>Charges to Use</span>
        <input
          className={sharedModalStyles.chargeSpendInput}
          type="number"
          min={1}
          max={remainingCharges}
          inputMode="numeric"
          value={selectedChargeCount}
          onChange={(event) =>
            onSelectedChargeCountChange(normalizeChargeCount(event.target.value, remainingCharges))
          }
        />
      </label>

      <CellContainer
        label="Charges Remaining"
        content={`${remainingCharges} available | ${selectedChargeCount} selected`}
      />

      <CellContainer label="Healing Roll" content={selectedFormula} />
    </>
  );
}

export function WarriorOfTheGodsActionFooter({
  actionName,
  confirmLabel,
  actionShape,
  actionShapeAvailable,
  actionShapeMultiCount,
  disabled,
  isDiceRollerSettingsOpen,
  onConfirm,
  onDiceRollerSettingsOpenChange
}: WarriorOfTheGodsActionFooterProps) {
  return (
    <div className={styles.weaponFooterActions}>
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
      <DiceRollerSettingsButton
        actionName={actionName}
        className={styles.weaponFooterIconButton}
        isOpen={isDiceRollerSettingsOpen}
        aria-label="Open dice roller settings"
        onOpenChange={onDiceRollerSettingsOpenChange}
      />
    </div>
  );
}
