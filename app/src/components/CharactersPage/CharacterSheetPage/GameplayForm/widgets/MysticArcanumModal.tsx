import clsx from "clsx";
import { X } from "lucide-react";
import type { SpellEntry } from "../../../../../codex/entries";
import type { FeatureActionCard } from "../../../../../pages/CharactersPage/classFeatures";
import SpellListRow from "../../../../SpellListRow";
import shared from "../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import sheetStyles from "../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import sharedModalStyles from "./FeatureActionModal.module.css";
import styles from "./DivineInterventionModal.module.css";

type MysticArcanumModalProps = {
  action: FeatureActionCard;
  spells: Array<{
    spellLevel: number;
    spell: SpellEntry;
    expended: boolean;
  }>;
  onSpellSelect: (spellLevel: number, spell: SpellEntry) => void;
  onClose: () => void;
};

function MysticArcanumModal({
  action,
  spells,
  onSpellSelect,
  onClose
}: MysticArcanumModalProps) {
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
        aria-labelledby="mystic-arcanum-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={sheetStyles.spellManagementHeader}>
          <div className={sharedModalStyles.modalHeading}>
            <p className={sheetStyles.eyebrow}>Warlock</p>
            <h3 id="mystic-arcanum-modal-title" className={sheetStyles.sheetPanelTitle}>
              {action.name}
            </h3>
            <p className={shared.helperText}>{action.detail}</p>
          </div>
          <button
            type="button"
            className={sheetStyles.spellManagementCloseButton}
            onClick={onClose}
            aria-label="Close Mystic Arcanum"
          >
            <X size={18} />
          </button>
        </div>

        <div className={clsx(sheetStyles.spellManagementList, styles.divineInterventionList)}>
          {spells.length === 0 ? (
            <p className={shared.emptyText}>
              No Mystic Arcanum spells are selected yet. Choose them in Class Features & Feats.
            </p>
          ) : (
            <ul className={styles.divineInterventionSelectionList}>
              {spells.map(({ spellLevel, spell, expended }) => (
                <li key={`${spell.id}-${spellLevel}`}>
                  <SpellListRow
                    spell={spell}
                    onClick={() => onSpellSelect(spellLevel, spell)}
                    disabled={expended}
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

export default MysticArcanumModal;
