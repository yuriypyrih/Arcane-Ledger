import clsx from "clsx";
import { OverlayFooter } from "../../../Overlay";
import sheetStyles from "../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import styles from "./SpellSlotActionSheet.module.css";

type SpellSlotActionSheetProps = {
  slotLevel: number;
  totalSlots: number;
  expendedSlots: number;
  onResetSlot: () => void;
  onUseSlot: () => void;
  onResetAll: () => void;
};

function SpellSlotActionSheet({
  slotLevel,
  totalSlots,
  expendedSlots,
  onResetSlot,
  onUseSlot,
  onResetAll
}: SpellSlotActionSheetProps) {
  const remainingSlots = Math.max(0, totalSlots - expendedSlots);
  const hasSlots = totalSlots > 0;
  const visibleSquares = hasSlots ? totalSlots : 4;

  return (
    <div className={styles.content}>
      <p className={styles.description}>
        {hasSlots
          ? `${remainingSlots}/${totalSlots} level ${slotLevel} spell slots available.`
          : `No level ${slotLevel} spell slots are available for this character right now.`}
      </p>

      <div className={styles.statusCard}>
        <div>
          <p className={styles.levelLabel}>{`Level ${slotLevel}`}</p>
          <p className={styles.levelSummary}>
            {hasSlots ? `${remainingSlots}/${totalSlots} available` : "No slots available"}
          </p>
        </div>

        <div className={styles.slotSquares} aria-hidden="true">
          {Array.from({ length: visibleSquares }, (_, index) => (
            <span
              key={`spell-slot-sheet-${slotLevel}-${index}`}
              className={clsx(
                styles.slotSquare,
                !hasSlots && styles.slotSquarePlaceholder,
                index < remainingSlots && styles.slotSquareFilled
              )}
            />
          ))}
        </div>
      </div>

      <OverlayFooter className={styles.footer}>
        <div className={styles.footerActions}>
          <button
            type="button"
            className={clsx(sheetStyles.castButton, styles.footerButton)}
            onClick={onResetSlot}
            disabled={expendedSlots <= 0}
            aria-label={`Reset 1 level ${slotLevel} spell slot`}
          >
            Reset 1
          </button>
          <button
            type="button"
            className={clsx(sheetStyles.castButton, styles.footerButton)}
            onClick={onUseSlot}
            disabled={!hasSlots || remainingSlots <= 0}
            aria-label={`Use 1 level ${slotLevel} spell slot`}
          >
            Use 1
          </button>
          <button
            type="button"
            className={clsx(sheetStyles.castButton, styles.footerButton)}
            onClick={onResetAll}
            disabled={expendedSlots <= 0}
            aria-label={`Reset all level ${slotLevel} spell slots`}
          >
            Reset All
          </button>
        </div>
      </OverlayFooter>
    </div>
  );
}

export default SpellSlotActionSheet;
