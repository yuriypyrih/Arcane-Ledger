import clsx from "clsx";
import { Minus, Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import ActionButton from "../../../../ActionButton";
import CellContainer from "../../../../CellContainer/CellContainer";
import type { Character } from "../../../../../types";
import type { FeatureActionCard } from "../../../../../pages/CharactersPage/classFeatures";
import {
  getArcaneRecoveryRecoveryLevelLimit,
  type ArcaneRecoverySelection
} from "../../../../../pages/CharactersPage/classFeatures/wizard/wizard";
import {
  getSpellSlotTotalsForCharacter,
  normalizeSpellSlotsExpended
} from "../../../../../pages/CharactersPage/spellcasting";
import shared from "../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import sheetStyles from "../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import sharedModalStyles from "./FeatureActionModal.module.css";
import styles from "./ArcaneRecoveryModal.module.css";

type ArcaneRecoveryModalProps = {
  action: FeatureActionCard;
  character: Character;
  onRecover: (selection: ArcaneRecoverySelection) => void;
  onClose: () => void;
};

function ArcaneRecoveryModal({ action, character, onRecover, onClose }: ArcaneRecoveryModalProps) {
  const [selection, setSelection] = useState<ArcaneRecoverySelection>({});
  const recoveryLimit = getArcaneRecoveryRecoveryLevelLimit(character);
  const spellSlotTotals = getSpellSlotTotalsForCharacter(character.className, character.level);
  const spellSlotsExpended = normalizeSpellSlotsExpended(
    character.spellSlotsExpended,
    spellSlotTotals
  );
  const selectedLevelTotal = ([1, 2, 3, 4, 5] as const).reduce(
    (total, slotLevel) => total + (selection[slotLevel] ?? 0) * slotLevel,
    0
  );
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

  function updateSelection(slotLevel: 1 | 2 | 3 | 4 | 5, delta: -1 | 1) {
    setSelection((current) => {
      const currentCount = current[slotLevel] ?? 0;
      const expendedCount = spellSlotsExpended[slotLevel - 1] ?? 0;
      const currentTotal = ([1, 2, 3, 4, 5] as const).reduce(
        (total, level) => total + (current[level] ?? 0) * level,
        0
      );
      const nextCount =
        delta < 0
          ? Math.max(0, currentCount - 1)
          : Math.min(
              expendedCount,
              currentCount + 1,
              currentCount + Math.floor((recoveryLimit - currentTotal) / slotLevel)
            );

      return nextCount <= 0
        ? Object.fromEntries(
            Object.entries(current).filter(([level]) => Number(level) !== slotLevel)
          )
        : {
            ...current,
            [slotLevel]: nextCount
          };
    });
  }

  return (
    <div className={sheetStyles.spellManagementBackdrop} role="presentation" onClick={onClose}>
      <section
        className={clsx(sheetStyles.spellManagementModal, sharedModalStyles.featureActionModal)}
        role="dialog"
        aria-modal="true"
        aria-labelledby="arcane-recovery-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={sheetStyles.spellManagementHeader}>
          <div className={sharedModalStyles.modalHeading}>
            <p className={sheetStyles.eyebrow}>Wizard</p>
            <h3 id="arcane-recovery-modal-title" className={sheetStyles.sheetPanelTitle}>
              {action.name}
            </h3>
            <p className={shared.helperText}>
              Recover expended spell slots with a combined level up to {recoveryLimit}. Slots
              recovered this way must be level 5 or lower.
            </p>
          </div>
          <button
            type="button"
            className={sheetStyles.spellManagementCloseButton}
            onClick={onClose}
            aria-label="Close Arcane Recovery"
          >
            <X size={18} />
          </button>
        </div>

        <CellContainer
          label="Recovery Budget"
          content={`${selectedLevelTotal}/${recoveryLimit} slot levels selected`}
          className={styles.arcaneRecoverySummary}
          labelClassName={styles.arcaneRecoverySummaryLabel}
          contentClassName={styles.arcaneRecoverySummaryValue}
        />

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
                      {`Level ${option.slotLevel} Slot`}
                    </strong>
                    <small className={styles.arcaneRecoveryCardMeta}>
                      {`${option.expendedSlots} expended`}
                    </small>
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
                    <span className={styles.arcaneRecoveryCount}>{option.selectedCount}</span>
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
        ) : (
          <p className={shared.emptyText}>
            No expended spell slots of level 1-5 can be recovered right now.
          </p>
        )}

        <div className={sharedModalStyles.featureActionModalFooter}>
          <ActionButton
            disabled={selectedLevelTotal <= 0}
            onClick={() => onRecover(selection)}
          >
            Recover Spell Slots
          </ActionButton>
        </div>
      </section>
    </div>
  );
}

export default ArcaneRecoveryModal;
