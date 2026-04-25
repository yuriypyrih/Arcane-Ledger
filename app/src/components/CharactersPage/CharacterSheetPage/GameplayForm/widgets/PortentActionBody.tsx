import clsx from "clsx";
import { useState } from "react";
import ActionButton from "../../../../ActionButton";
import CellContainer from "../../../../CellContainer/CellContainer";
import type { Character, CharacterWizardPortentRoll } from "../../../../../types";
import { getWizardDivinerPortentRolls } from "../../../../../pages/CharactersPage/classFeatures/wizard/subclasses/wizardDivinerPortent";
import shared from "../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import sharedModalStyles from "./FeatureActionModal.module.css";
import styles from "./PortentActionBody.module.css";

type PortentDraftRoll = {
  value: string;
  used: boolean;
};

type PortentActionBodyProps = {
  character: Character;
  onSubmit: (portentRolls: CharacterWizardPortentRoll[]) => void;
};

function normalizePortentDraftValue(value: string): number | undefined {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return undefined;
  }

  return Math.max(1, Math.min(20, Math.floor(numericValue)));
}

function formatPortentRollSummary(draftRolls: PortentDraftRoll[]): string {
  return draftRolls
    .map((draftRoll) => normalizePortentDraftValue(draftRoll.value) ?? "--")
    .join(" / ");
}

function PortentActionBody({ character, onSubmit }: PortentActionBodyProps) {
  const currentPortentRolls = getWizardDivinerPortentRolls(character);
  const [draftRolls, setDraftRolls] = useState<PortentDraftRoll[]>(() =>
    currentPortentRolls.map((roll) => ({
      value: roll.value?.toString() ?? "",
      used: roll.used === true
    }))
  );
  const readyCount = draftRolls.filter((roll) => !roll.used).length;
  const rollSummary = formatPortentRollSummary(draftRolls);

  function updateDraftRoll(index: number, updates: Partial<PortentDraftRoll>) {
    setDraftRolls((currentDraftRolls) =>
      currentDraftRolls.map((draftRoll, currentIndex) =>
        currentIndex === index ? { ...draftRoll, ...updates } : draftRoll
      )
    );
  }

  return (
    <>
      <div className={styles.portentSummaryGrid}>
        <CellContainer label="Charges Ready" content={`${readyCount}/${draftRolls.length} available`} />
        <CellContainer label="Foretelling Rolls" content={rollSummary} />
      </div>

      <div className={styles.portentRollGrid}>
        {draftRolls.map((draftRoll, index) => (
          <div
            key={`portent-roll-${index + 1}`}
            className={clsx(styles.portentRollCard, draftRoll.used && styles.portentRollCardUsed)}
          >
            <div className={styles.portentRollHeader}>
              <strong className={styles.portentRollTitle}>{`Roll ${index + 1}`}</strong>
              <span className={styles.portentRollStatus}>
                {draftRoll.used ? "Used" : "Ready"}
              </span>
            </div>

            <label className={sharedModalStyles.chargeSpendField}>
              <span className={sharedModalStyles.chargeSpendLabel}>Foretelling Roll</span>
              <input
                className={sharedModalStyles.chargeSpendInput}
                type="number"
                min={1}
                max={20}
                inputMode="numeric"
                placeholder="1-20"
                value={draftRoll.value}
                onChange={(event) => updateDraftRoll(index, { value: event.target.value })}
                aria-label={`Portent roll ${index + 1}`}
              />
            </label>

            <label className={styles.portentRollUsedLabel}>
              <input
                className={styles.portentRollUsedCheckbox}
                type="checkbox"
                checked={draftRoll.used}
                onChange={(event) => updateDraftRoll(index, { used: event.target.checked })}
              />
              <span>Mark as used</span>
            </label>
          </div>
        ))}
      </div>

      <p className={shared.helperText}>
        Enter the d20 results from your last Long Rest and mark each roll off once it has been
        spent.
      </p>

      <div className={shared.formActions}>
        <ActionButton
          onClick={() =>
            onSubmit(
              draftRolls.map((draftRoll) => ({
                value: normalizePortentDraftValue(draftRoll.value),
                used: draftRoll.used
              }))
            )
          }
        >
          Save Portent
        </ActionButton>
      </div>
    </>
  );
}

export default PortentActionBody;
