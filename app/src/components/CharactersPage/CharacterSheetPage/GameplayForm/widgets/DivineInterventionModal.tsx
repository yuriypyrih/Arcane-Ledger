import clsx from "clsx";
import { X } from "lucide-react";
import type { SpellEntry } from "../../../../../codex/entries";
import type { FeatureActionCard } from "../../../../../pages/CharactersPage/classFeatures";
import SpellListRow from "../../../../SpellListRow";
import shared from "../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import sheetStyles from "../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import sharedModalStyles from "./FeatureActionModal.module.css";
import styles from "./DivineInterventionModal.module.css";

type DivineInterventionModalProps = {
  action: FeatureActionCard;
  activeLevel: number;
  enabledLevels: number[];
  activeSpells: SpellEntry[];
  outcomeSummariesById: Map<string, string>;
  onLevelChange: (level: number) => void;
  onSpellSelect: (spell: SpellEntry) => void;
  onClose: () => void;
};

function DivineInterventionModal({
  action,
  activeLevel,
  enabledLevels,
  activeSpells,
  outcomeSummariesById,
  onLevelChange,
  onSpellSelect,
  onClose
}: DivineInterventionModalProps) {
  return (
    <div className={sheetStyles.spellManagementBackdrop} role="presentation" onClick={onClose}>
      <section
        className={clsx(
          sheetStyles.spellManagementModal,
          sharedModalStyles.featureActionModal,
          styles.divineInterventionModal
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="feature-action-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={sheetStyles.spellManagementHeader}>
          <div className={sharedModalStyles.modalHeading}>
            <p className={sheetStyles.eyebrow}>Cleric</p>
            <h3 id="feature-action-modal-title">{action.name}</h3>
            <p className={shared.helperText}>
              {action.detail} {action.usesLabel ?? ""}
            </p>
          </div>
          <button
            type="button"
            className={sheetStyles.spellManagementCloseButton}
            onClick={onClose}
            aria-label="Close Divine Intervention"
          >
            <X size={18} />
          </button>
        </div>

        <div className={styles.divineInterventionTabRow}>
          <span className={styles.divineInterventionTabLabel}>Level</span>
          <div
            className={styles.divineInterventionTabList}
            role="tablist"
            aria-label="Divine Intervention spell levels"
          >
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => {
              const isDisabled = !enabledLevels.includes(level);

              return (
                <button
                  key={`divine-intervention-level-${level}`}
                  type="button"
                  role="tab"
                  aria-selected={activeLevel === level}
                  className={clsx(
                    styles.divineInterventionTabButton,
                    activeLevel === level && styles.divineInterventionTabButtonActive
                  )}
                  onClick={() => onLevelChange(level)}
                  disabled={isDisabled}
                >
                  {level === 0 ? "C" : level}
                </button>
              );
            })}
          </div>
        </div>

        <div className={clsx(sheetStyles.spellManagementList, styles.divineInterventionList)}>
          {activeSpells.length === 0 ? (
            <p className={shared.emptyText}>No spells are available at this level.</p>
          ) : (
            <ul className={styles.divineInterventionSelectionList}>
              {activeSpells.map((spell) => (
                <li key={spell.id}>
                  <SpellListRow
                    spell={spell}
                    onClick={() => onSpellSelect(spell)}
                    valueSummary={outcomeSummariesById.get(spell.id) ?? ""}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

export default DivineInterventionModal;
