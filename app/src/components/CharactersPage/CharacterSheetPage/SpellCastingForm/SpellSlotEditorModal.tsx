import clsx from "clsx";
import { ChevronDown, ChevronUp } from "lucide-react";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import styles from "./SpellSlotEditorModal.module.css";

type SpellSlotEditorModalProps = {
  spellSlotTotals: number[];
  spellSlotsExpended: number[];
  onResetSlot: (slotLevel: number) => void;
  onUseSlot: (slotLevel: number) => void;
  onResetAll: () => void;
};

function SpellSlotEditorModal({
  spellSlotTotals,
  spellSlotsExpended,
  onResetSlot,
  onUseSlot,
  onResetAll
}: SpellSlotEditorModalProps) {
  const slotLevels = Array.from({ length: 9 }, (_, index) => ({
    level: index + 1,
    total: spellSlotTotals[index] ?? 0,
    expended: spellSlotsExpended[index] ?? 0
  }));
  const editableLevels = slotLevels.filter((slotRow) => slotRow.total > 0);
  const hasExpendedSlots = editableLevels.some((slotRow) => slotRow.expended > 0);

  if (editableLevels.length === 0) {
    return <p className={shared.emptyText}>No spell slots are available for this character yet.</p>;
  }

  return (
    <div className={styles.content}>
      <p className={styles.description}>
        Use or reset your spell slots up to their current limit.
      </p>

      <div className={styles.grid}>
        {slotLevels.map(({ level, total, expended }) => {
          const remaining = Math.max(0, total - expended);
          const hasSlots = total > 0;
          const visibleSquares = hasSlots ? total : 4;

          return (
            <section
              key={level}
              className={clsx(styles.card, !hasSlots && styles.cardDisabled)}
            >
              <div className={styles.cardHeader}>
                <div>
                  <p className={styles.levelLabel}>{`Level ${level}`}</p>
                  <p className={styles.levelSummary}>
                    {hasSlots ? `${remaining}/${total} available` : "No slots"}
                  </p>
                </div>
              </div>

              <div className={styles.cardBody}>
                <div>
                  <div className={styles.slotSquares} aria-hidden="true">
                    {Array.from({ length: visibleSquares }, (_, index) => (
                      <span
                        key={`spell-slot-${level}-${index}`}
                        className={clsx(
                          styles.slotSquare,
                          !hasSlots && styles.slotSquarePlaceholder,
                          index < remaining && styles.slotSquareFilled
                        )}
                      />
                    ))}
                  </div>
                  {!hasSlots ? <p className={styles.emptyState}>No slots</p> : null}
                </div>

                <div className={styles.stepper}>
                  <button
                    type="button"
                    className={styles.stepperButton}
                    disabled={expended <= 0}
                    onClick={() => onResetSlot(level)}
                    aria-label={`Reset level ${level} spell slot`}
                    title={`Reset level ${level} spell slot`}
                  >
                    <ChevronUp size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className={styles.stepperButton}
                    disabled={!hasSlots || remaining <= 0}
                    onClick={() => onUseSlot(level)}
                    aria-label={`Use level ${level} spell slot`}
                    title={`Use level ${level} spell slot`}
                  >
                    <ChevronDown size={16} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <div className={styles.footer}>
        <button
          type="button"
          className={styles.resetAllButton}
          disabled={!hasExpendedSlots}
          onClick={onResetAll}
        >
          Reset all
        </button>
      </div>
    </div>
  );
}

export default SpellSlotEditorModal;
