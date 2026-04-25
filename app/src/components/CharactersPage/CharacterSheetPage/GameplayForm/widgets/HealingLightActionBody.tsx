import { useState } from "react";
import ActionButton from "../../../../ActionButton";
import CellContainer from "../../../../CellContainer/CellContainer";
import shared from "../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import sharedModalStyles from "./FeatureActionModal.module.css";

type HealingLightActionBodyProps = {
  remainingDice: number;
  maxDicePerUse: number;
  onSubmit: (diceCount: number) => void;
};

function HealingLightActionBody({
  remainingDice,
  maxDicePerUse,
  onSubmit
}: HealingLightActionBodyProps) {
  const maxSelectableDice = Math.min(remainingDice, maxDicePerUse);
  const [diceInput, setDiceInput] = useState(() => (maxSelectableDice > 0 ? "1" : "0"));
  const selectedDiceCount = Math.max(
    0,
    Math.min(maxSelectableDice, Math.floor(Number(diceInput) || 0))
  );
  const selectedFormula = selectedDiceCount > 0 ? `${selectedDiceCount}d6` : "Choose dice to roll";

  return (
    <>
      <label className={sharedModalStyles.chargeSpendField}>
        <span className={sharedModalStyles.chargeSpendLabel}>Healing d6 to Expend</span>
        <input
          className={sharedModalStyles.chargeSpendInput}
          type="number"
          min={1}
          max={maxSelectableDice}
          inputMode="numeric"
          value={diceInput}
          onChange={(event) => setDiceInput(event.target.value)}
        />
      </label>

      <CellContainer
        label="Healing d6"
        content={`${remainingDice} available | ${maxSelectableDice} max per use`}
      />

      <CellContainer label="Healing Roll" content={selectedFormula} />

      <div className={shared.formActions}>
        <ActionButton
          disabled={selectedDiceCount <= 0}
          onClick={() => onSubmit(selectedDiceCount)}
        >
          Roll Healing
        </ActionButton>
      </div>
    </>
  );
}

export default HealingLightActionBody;
