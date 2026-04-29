import clsx from "clsx";
import { useState } from "react";
import type { Character, CharacterWizardPortentRoll } from "../../../../../../types";
import { getWizardDivinerPortentRolls } from "../../../../../../pages/CharactersPage/classFeatures/wizard/subclasses/wizardDivinerPortent";
import sharedModalStyles from "./FeatureActionModal.module.css";
import styles from "./PortentActionBody.module.css";

export const portentActionFormId = "wizard-diviner-portent-form";

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

  if (
    !Number.isFinite(numericValue) ||
    !Number.isInteger(numericValue) ||
    numericValue < 1 ||
    numericValue > 20
  ) {
    return undefined;
  }

  return numericValue;
}

function PortentActionBody({ character, onSubmit }: PortentActionBodyProps) {
  const currentPortentRolls = getWizardDivinerPortentRolls(character);
  const [draftRolls, setDraftRolls] = useState<PortentDraftRoll[]>(() =>
    currentPortentRolls.map((roll) => ({
      value: roll.value?.toString() ?? "",
      used: roll.used === true
    }))
  );

  function updateDraftRoll(index: number, updates: Partial<PortentDraftRoll>) {
    setDraftRolls((currentDraftRolls) =>
      currentDraftRolls.map((draftRoll, currentIndex) =>
        currentIndex === index ? { ...draftRoll, ...updates } : draftRoll
      )
    );
  }

  function submitPortentDrafts() {
    onSubmit(
      draftRolls.map((draftRoll) => ({
        value: normalizePortentDraftValue(draftRoll.value),
        used: draftRoll.used
      }))
    );
  }

  return (
    <form
      id={portentActionFormId}
      className={styles.portentForm}
      onSubmit={(event) => {
        event.preventDefault();
        submitPortentDrafts();
      }}
    >
      <div className={styles.portentRollGrid}>
        {draftRolls.map((draftRoll, index) => (
          <div
            key={`portent-roll-${index + 1}`}
            className={clsx(styles.portentRollCard, draftRoll.used && styles.portentRollCardUsed)}
          >
            <div className={styles.portentRollHeader}>
              <strong className={styles.portentRollTitle}>{`Roll ${index + 1}`}</strong>
              <span className={styles.portentRollStatus}>{draftRoll.used ? "Used" : "Ready"}</span>
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
    </form>
  );
}

export default PortentActionBody;
