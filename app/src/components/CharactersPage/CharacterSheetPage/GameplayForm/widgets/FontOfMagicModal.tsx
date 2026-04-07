import clsx from "clsx";
import { Sparkles, X } from "lucide-react";
import type { Character } from "../../../../../types";
import type { FeatureActionCard } from "../../../../../pages/CharactersPage/classFeatures";
import {
  getSorceryPointsRemainingForCharacter,
  getSorceryPointsTotalForCharacter
} from "../../../../../pages/CharactersPage/classFeatures";
import { getSorcererSpellSlotCreationRules } from "../../../../../pages/CharactersPage/classFeatures/sorcerer/sorcerer";
import {
  getSpellSlotTotalsForCharacter,
  normalizeSpellSlotsExpended
} from "../../../../../pages/CharactersPage/spellcasting";
import shared from "../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import sheetStyles from "../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import sharedModalStyles from "./FeatureActionModal.module.css";
import styles from "./FontOfMagicModal.module.css";

type FontOfMagicModalProps = {
  action: FeatureActionCard;
  character: Character;
  actionWarning: string | null;
  onClose: () => void;
  onConvertSpellSlot: (spellSlotLevel: number) => void;
  onCreateSpellSlot: (spellSlotLevel: number) => void;
};

function FontOfMagicModal({
  action,
  character,
  actionWarning,
  onClose,
  onConvertSpellSlot,
  onCreateSpellSlot
}: FontOfMagicModalProps) {
  const sorceryPointsRemaining = getSorceryPointsRemainingForCharacter(character);
  const sorceryPointsTotal = getSorceryPointsTotalForCharacter(character);
  const spellSlotTotals = getSpellSlotTotalsForCharacter(character.className, character.level);
  const spellSlotsExpended = normalizeSpellSlotsExpended(
    character.spellSlotsExpended,
    spellSlotTotals
  );
  const spellSlotsRemaining = spellSlotTotals.map((total, index) =>
    Math.max(0, total - (spellSlotsExpended[index] ?? 0))
  );
  const spellSlotCreationRules = getSorcererSpellSlotCreationRules().filter(
    (rule) => character.level >= rule.minimumSorcererLevel
  );
  const spellSlotToPointOptions = spellSlotTotals
    .map((total, index) => {
      const spellSlotLevel = index + 1;
      const remainingSlots = spellSlotsRemaining[index] ?? 0;
      const disabledReason =
        total <= 0
          ? "You don't have spell slots of this level."
          : remainingSlots <= 0
            ? "No spell slots of this level remain."
            : sorceryPointsRemaining + spellSlotLevel > sorceryPointsTotal
              ? "Not enough room for that many Sorcery Points."
              : null;

      return {
        spellSlotLevel,
        total,
        remainingSlots,
        disabledReason
      };
    })
    .filter((option) => option.total > 0);

  return (
    <div className={sheetStyles.spellManagementBackdrop} role="presentation" onClick={onClose}>
      <section
        className={clsx(sheetStyles.spellManagementModal, sharedModalStyles.featureActionModal)}
        role="dialog"
        aria-modal="true"
        aria-labelledby="font-of-magic-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={sheetStyles.spellManagementHeader}>
          <div className={sharedModalStyles.modalHeading}>
            <p className={sheetStyles.eyebrow}>Sorcerer</p>
            <h3 id="font-of-magic-modal-title" className={sheetStyles.sheetPanelTitle}>
              {action.name}
            </h3>
            <p className={shared.helperText}>
              {action.detail} {sorceryPointsRemaining}/{sorceryPointsTotal} Sorcery Points.
            </p>
          </div>
          <button
            type="button"
            className={sheetStyles.spellManagementCloseButton}
            onClick={onClose}
            aria-label="Close Font of Magic"
          >
            <X size={18} />
          </button>
        </div>

        <div className={styles.fontOfMagicSections}>
          <section className={styles.fontOfMagicSection}>
            <div className={styles.fontOfMagicSectionHeader}>
              <div>
                <h4 className={styles.fontOfMagicSectionTitle}>Spell Slot to Sorcery Points</h4>
                <p className={shared.helperText}>No action required.</p>
              </div>
            </div>

            {spellSlotToPointOptions.length > 0 ? (
              <div className={styles.fontOfMagicOptionGrid}>
                {spellSlotToPointOptions.map((option) => (
                  <button
                    key={`font-of-magic-slot-to-points-${option.spellSlotLevel}`}
                    type="button"
                    className={styles.fontOfMagicOptionButton}
                    disabled={option.disabledReason !== null}
                    onClick={() => onConvertSpellSlot(option.spellSlotLevel)}
                  >
                    <strong className={styles.fontOfMagicCompactLabel}>
                      <span>Level {option.spellSlotLevel} Slot</span>
                      <span aria-hidden="true">-&gt;</span>
                      <span className={styles.fontOfMagicSparkleValue}>
                        <span>{option.spellSlotLevel}</span>
                        <Sparkles size={14} className={styles.fontOfMagicSparkleIcon} />
                      </span>
                    </strong>
                  </button>
                ))}
              </div>
            ) : (
              <p className={shared.emptyText}>No spell slots are available to convert right now.</p>
            )}
          </section>

          <section className={styles.fontOfMagicSection}>
            <div className={styles.fontOfMagicSectionHeader}>
              <div>
                <h4 className={styles.fontOfMagicSectionTitle}>Sorcery Points to Spell Slot</h4>
                <p className={shared.helperText}>Uses your Bonus Action.</p>
              </div>
              {actionWarning ? (
                <span className={styles.fontOfMagicWarning}>{actionWarning}</span>
              ) : null}
            </div>

            <div className={styles.fontOfMagicOptionGrid}>
              {spellSlotCreationRules.map((rule) => {
                const slotIndex = rule.spellSlotLevel - 1;
                const expendedSlots = spellSlotsExpended[slotIndex] ?? 0;
                const disabledReason =
                  actionWarning ??
                  (expendedSlots <= 0
                    ? "You already have all of those spell slots."
                    : sorceryPointsRemaining < rule.sorceryPointCost
                      ? `You need ${rule.sorceryPointCost} Sorcery Points.`
                      : null);

                return (
                  <button
                    key={`font-of-magic-points-to-slot-${rule.spellSlotLevel}`}
                    type="button"
                    className={styles.fontOfMagicOptionButton}
                    disabled={disabledReason !== null}
                    onClick={() => onCreateSpellSlot(rule.spellSlotLevel)}
                  >
                    <strong className={styles.fontOfMagicCompactLabel}>
                      <span className={styles.fontOfMagicSparkleValue}>
                        <span>{rule.sorceryPointCost}</span>
                        <Sparkles size={14} className={styles.fontOfMagicSparkleIcon} />
                      </span>
                      <span aria-hidden="true">-&gt;</span>
                      <span>Level {rule.spellSlotLevel} Slot</span>
                    </strong>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <div className={shared.formActions}>
          <button type="button" className={shared.cancelButton} onClick={onClose}>
            Close
          </button>
        </div>
      </section>
    </div>
  );
}

export default FontOfMagicModal;
