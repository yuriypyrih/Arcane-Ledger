import { Minus, Plus } from "lucide-react";
import { useMemo } from "react";
import type { Character } from "../../../../../../../types";
import {
  type ArcaneRecoverySelection,
  type ArcaneRecoverySlotLevel,
  getArcaneRecoverySelectionLevelTotal,
  getArcaneRecoveryRecoveryLevelLimit
} from "../../../../../../../pages/CharactersPage/classFeatures/wizard/wizard";
import {
  getSpellSlotTotalsForCharacter,
  normalizeSpellSlotsExpended
} from "../../../../../../../pages/CharactersPage/spellcasting";
import styles from "../ArcaneRecoveryModal.module.css";

type ArcaneRecoveryActionBodyProps = {
  character: Character;
  selection: ArcaneRecoverySelection;
  onSelectionChange: (selection: ArcaneRecoverySelection) => void;
};

function ArcaneRecoveryActionBody({
  character,
  selection,
  onSelectionChange
}: ArcaneRecoveryActionBodyProps) {
  const recoveryLimit = getArcaneRecoveryRecoveryLevelLimit(character);
  const spellSlotTotals = getSpellSlotTotalsForCharacter(character.className, character.level);
  const spellSlotsExpended = normalizeSpellSlotsExpended(
    character.spellSlotsExpended,
    spellSlotTotals
  );
  const selectedLevelTotal = getArcaneRecoverySelectionLevelTotal(selection);
  const availableOptions = useMemo(
    () =>
      ([1, 2, 3, 4, 5] as const)
        .map((slotLevel) => {
          const totalSlots = spellSlotTotals[slotLevel - 1] ?? 0;
          const expendedSlots = spellSlotsExpended[slotLevel - 1] ?? 0;

          return {
            slotLevel,
            totalSlots,
            expendedSlots,
            selectedCount: selection[slotLevel] ?? 0
          };
        })
        .filter((option) => option.totalSlots > 0 && option.expendedSlots > 0),
    [selection, spellSlotTotals, spellSlotsExpended]
  );

  function updateSelection(slotLevel: ArcaneRecoverySlotLevel, delta: -1 | 1) {
    const currentCount = selection[slotLevel] ?? 0;
    const expendedCount = spellSlotsExpended[slotLevel - 1] ?? 0;
    const currentTotal = getArcaneRecoverySelectionLevelTotal(selection);
    const nextCount =
      delta < 0
        ? Math.max(0, currentCount - 1)
        : Math.min(
            expendedCount,
            currentCount + 1,
            currentCount + Math.floor((recoveryLimit - currentTotal) / slotLevel)
          );

    if (nextCount <= 0) {
      const nextSelection = { ...selection };
      delete nextSelection[slotLevel];
      onSelectionChange(nextSelection);
      return;
    }

    onSelectionChange({
      ...selection,
      [slotLevel]: nextCount
    });
  }

  return (
    <>
      <div className={styles.arcaneRecoverySummary}>
        <span className={styles.arcaneRecoverySummaryLabel}>Recovery Budget</span>
        <strong>{`${selectedLevelTotal}/${recoveryLimit} slot levels selected`}</strong>
      </div>

      {availableOptions.length > 0 ? (
        <div className={styles.arcaneRecoveryGrid}>
          {availableOptions.map((option) => {
            const remainingBudget = recoveryLimit - selectedLevelTotal;
            const canDecrease = option.selectedCount > 0;
            const canIncrease =
              option.selectedCount < option.expendedSlots && remainingBudget >= option.slotLevel;

            return (
              <div
                key={`arcane-recovery-level-${option.slotLevel}`}
                className={styles.arcaneRecoveryCard}
              >
                <div className={styles.arcaneRecoveryCardHeader}>
                  <strong className={styles.arcaneRecoveryCardTitle}>
                    {`Level ${option.slotLevel} slot ${option.expendedSlots}/${option.totalSlots}`}
                  </strong>
                </div>
                <div className={styles.arcaneRecoveryControlRow}>
                  <button
                    type="button"
                    className={styles.arcaneRecoveryControlButton}
                    onClick={() => updateSelection(option.slotLevel, -1)}
                    disabled={!canDecrease}
                    aria-label={`Recover one fewer level ${option.slotLevel} slot`}
                  >
                    <Minus size={15} />
                  </button>
                  <span className={styles.arcaneRecoveryCount}>
                    {`Recover ${option.selectedCount}`}
                  </span>
                  <button
                    type="button"
                    className={styles.arcaneRecoveryControlButton}
                    onClick={() => updateSelection(option.slotLevel, 1)}
                    disabled={!canIncrease}
                    aria-label={`Recover one more level ${option.slotLevel} slot`}
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </>
  );
}

export default ArcaneRecoveryActionBody;
