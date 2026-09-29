export { default as WarriorOfTheGodsActionFooter } from "./ActionDiceConfirmFooter";

import CellContainer from "../../../../../CellContainer/CellContainer";

import sharedModalStyles from "./FeatureActionModal.module.css";

type WarriorOfTheGodsActionBodyProps = {
  remainingCharges: number;
  selectedChargeCount: number;
  onSelectedChargeCountChange: (count: number) => void;
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
