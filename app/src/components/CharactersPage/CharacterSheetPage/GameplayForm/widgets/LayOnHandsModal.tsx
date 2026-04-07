import clsx from "clsx";
import { X } from "lucide-react";
import { useState } from "react";
import CellContainer from "../../../../CellContainer/CellContainer";
import type { FeatureActionCard } from "../../../../../pages/CharactersPage/classFeatures";
import type { LayOnHandsCondition } from "../../../../../pages/CharactersPage/classFeatures/paladin/paladin";
import shared from "../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import sheetStyles from "../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import styles from "./LayOnHandsModal.module.css";

type LayOnHandsTarget = "self" | "other";

type LayOnHandsModalProps = {
  action: FeatureActionCard;
  conditionOptions: LayOnHandsCondition[];
  remainingPool: number;
  onSubmit: (options: {
    target: LayOnHandsTarget;
    poolSpendAmount: number;
    conditions: LayOnHandsCondition[];
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
  conditionOptions,
  remainingPool,
  onSubmit,
  onClose
}: LayOnHandsModalProps) {
  const [target, setTarget] = useState<LayOnHandsTarget>("self");
  const [poolSpendInput, setPoolSpendInput] = useState("0");
  const [selectedConditions, setSelectedConditions] = useState<LayOnHandsCondition[]>([]);
  const poolSpendAmount = normalizePoolSpendAmount(poolSpendInput);
  const conditionCost = selectedConditions.length * 5;
  const totalCost = poolSpendAmount + conditionCost;
  const notEnoughCapacity = totalCost > remainingPool;
  const canSubmit = totalCost > 0 && !notEnoughCapacity;

  function toggleCondition(condition: LayOnHandsCondition) {
    setSelectedConditions((currentConditions) =>
      currentConditions.includes(condition)
        ? currentConditions.filter((entry) => entry !== condition)
        : [...currentConditions, condition]
    );
  }

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
            <h3 id="lay-on-hands-modal-title" className={sheetStyles.sheetPanelTitle}>
              {action.name}
            </h3>
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
            <span className={styles.fieldLabel}>Heal Amount</span>
            <input
              className={styles.fieldControl}
              type="number"
              min={0}
              inputMode="numeric"
              value={poolSpendInput}
              onChange={(event) => setPoolSpendInput(event.target.value)}
            />
          </label>

          <div className={styles.field}>
            <span className={styles.fieldLabel}>Conditions to Cure</span>
            <div className={styles.conditionList}>
              {conditionOptions.map((condition) => {
                const isSelected = selectedConditions.includes(condition);

                return (
                  <label
                    key={condition}
                    className={clsx(
                      styles.conditionOption,
                      isSelected && styles.conditionOptionSelected
                    )}
                  >
                    <input
                      type="checkbox"
                      className={styles.conditionCheckbox}
                      checked={isSelected}
                      onChange={() => toggleCondition(condition)}
                    />
                    <span>{condition}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <CellContainer
            className={styles.capacityBlock}
            labelClassName={styles.capacityLabel}
            contentClassName={styles.capacityValue}
            label="Pool of Healing"
            content={`${remainingPool} remaining | ${totalCost} total spend`}
          />
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
                  conditions: selectedConditions
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
