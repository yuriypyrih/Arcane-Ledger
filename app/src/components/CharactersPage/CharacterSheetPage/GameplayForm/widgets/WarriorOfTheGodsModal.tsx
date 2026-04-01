import { useState } from "react";
import CellContainer from "../../../../CellContainer/CellContainer";
import type { FeatureActionCard } from "../../../../../pages/CharactersPage/classFeatures";
import shared from "../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import FeatureActionOptionsModal from "./FeatureActionOptionsModal";
import styles from "./FeatureActionModal.module.css";

type WarriorOfTheGodsModalProps = {
  action: FeatureActionCard;
  remainingCharges: number;
  onSubmit: (chargeCount: number) => void;
  onClose: () => void;
};

function normalizeChargeCount(value: string, maxValue: number): number {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return 0;
  }

  return Math.max(0, Math.min(maxValue, Math.floor(parsedValue)));
}

function WarriorOfTheGodsModal({
  action,
  remainingCharges,
  onSubmit,
  onClose
}: WarriorOfTheGodsModalProps) {
  const [chargeInput, setChargeInput] = useState(() =>
    remainingCharges > 0 ? "1" : "0"
  );
  const selectedChargeCount = normalizeChargeCount(chargeInput, remainingCharges);
  const canSubmit = selectedChargeCount > 0 && selectedChargeCount <= remainingCharges;

  return (
    <FeatureActionOptionsModal
      action={action}
      eyebrow="Barbarian"
      helperText="Choose how many charges to spend. The modal tracks the spend only."
      onClose={onClose}
      bodyClassName={styles.chargeSpendBody}
      footer={
        <button
          type="button"
          className={shared.saveButton}
          disabled={!canSubmit}
          onClick={() => onSubmit(selectedChargeCount)}
        >
          Heal
        </button>
      }
    >
      <label className={styles.chargeSpendField}>
        <span className={styles.chargeSpendLabel}>Charges to Use</span>
        <input
          className={styles.chargeSpendInput}
          type="number"
          min={1}
          max={remainingCharges}
          inputMode="numeric"
          value={chargeInput}
          onChange={(event) => setChargeInput(event.target.value)}
        />
      </label>

      <CellContainer
        label="Charges Remaining"
        content={`${remainingCharges} available | ${selectedChargeCount} selected`}
      />
    </FeatureActionOptionsModal>
  );
}

export default WarriorOfTheGodsModal;
