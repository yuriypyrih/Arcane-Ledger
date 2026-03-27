import clsx from "clsx";
import { X } from "lucide-react";
import { useState } from "react";
import { CONDITION_NAME } from "../../../../../types";
import type { FeatureActionCard } from "../../../../../pages/CharactersPage/classFeatures";
import shared from "../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import sheetStyles from "../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import styles from "./LayOnHandsModal.module.css";

type LayOnHandsTarget = "self" | "other";
type LayOnHandsCondition = "none" | CONDITION_NAME.POISONED;

type LayOnHandsModalProps = {
  action: FeatureActionCard;
  remainingPool: number;
  onSubmit: (options: {
    target: LayOnHandsTarget;
    poolSpendAmount: number;
    condition: LayOnHandsCondition;
  }) => void;
  onClose: () => void;
};

function normalizePoolSpendAmount(value: string): number {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return 0;
  }

  return Math.max(0, Math.floor(parsedValue));
}

function LayOnHandsModal({
  action,
  remainingPool,
  onSubmit,
  onClose
}: LayOnHandsModalProps) {
  const [target, setTarget] = useState<LayOnHandsTarget>("self");
  const [poolSpendInput, setPoolSpendInput] = useState("0");
  const [condition, setCondition] = useState<LayOnHandsCondition>("none");
  const poolSpendAmount = normalizePoolSpendAmount(poolSpendInput);
  const conditionCost = condition === CONDITION_NAME.POISONED ? 5 : 0;
  const totalCost = poolSpendAmount;
  const healingAmount = Math.max(0, poolSpendAmount - conditionCost);
  const notEnoughCapacity =
    totalCost > remainingPool || (conditionCost > 0 && totalCost < conditionCost);
  const canSubmit = totalCost > 0 && !notEnoughCapacity;

  return (
    <div className={sheetStyles.spellManagementBackdrop} role="presentation" onClick={onClose}>
      <section
        className={clsx(sheetStyles.spellManagementModal, styles.modal)}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lay-on-hands-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={sheetStyles.spellManagementHeader}>
          <div className={styles.heading}>
            <p className={sheetStyles.eyebrow}>Paladin</p>
            <h3 id="lay-on-hands-modal-title">{action.name}</h3>
            <p className={shared.helperText}>{action.detail}</p>
          </div>
          <button
            type="button"
            className={sheetStyles.spellManagementCloseButton}
            onClick={onClose}
            aria-label="Close Lay on Hands"
          >
            <X size={18} />
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.targetSwitch} role="tablist" aria-label="Lay on Hands target">
            <button
              type="button"
              role="tab"
              aria-selected={target === "self"}
              className={clsx(styles.targetButton, target === "self" && styles.targetButtonActive)}
              onClick={() => setTarget("self")}
            >
              Myself
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={target === "other"}
              className={clsx(styles.targetButton, target === "other" && styles.targetButtonActive)}
              onClick={() => setTarget("other")}
            >
              Another
            </button>
          </div>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Pool Spend</span>
            <input
              className={styles.fieldControl}
              type="number"
              min={0}
              inputMode="numeric"
              value={poolSpendInput}
              onChange={(event) => setPoolSpendInput(event.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Condition to Cure</span>
            <select
              className={styles.fieldControl}
              value={condition}
              onChange={(event) => setCondition(event.target.value as LayOnHandsCondition)}
            >
              <option value="none">None</option>
              <option value={CONDITION_NAME.POISONED}>Poisoned</option>
            </select>
          </label>

          <div className={styles.capacityBlock}>
            <span>Pool of Healing</span>
            <strong>
              {remainingPool} remaining | {healingAmount} heal | {totalCost} total spend
            </strong>
          </div>
        </div>

        <div className={shared.formActions}>
          <button type="button" className={shared.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <div className={styles.actionsRow}>
            {notEnoughCapacity ? <span className={styles.warning}>Not enough capacity</span> : null}
            <button
              type="button"
              className={shared.saveButton}
              disabled={!canSubmit}
              onClick={() =>
                onSubmit({
                  target,
                  poolSpendAmount,
                  condition
                })
              }
            >
              Heal
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LayOnHandsModal;
