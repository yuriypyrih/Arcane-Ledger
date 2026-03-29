import clsx from "clsx";
import { X } from "lucide-react";
import { formatAbilityModifier } from "../../../../../pages/CharactersPage/gameplay";
import type { AbilityKey } from "../../../../../types";
import type { FeatureActionCard } from "../../../../../pages/CharactersPage/classFeatures";
import shared from "../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import sheetStyles from "../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import sharedModalStyles from "./FeatureActionModal.module.css";
import styles from "./IndomitableModal.module.css";

type IndomitableOption = {
  ability: AbilityKey;
  total: number;
  formulaDisplay: string;
};

type IndomitableModalProps = {
  action: FeatureActionCard;
  options: IndomitableOption[];
  selectedAbility: AbilityKey | null;
  selectedOption: IndomitableOption | null;
  onSelectAbility: (ability: AbilityKey) => void;
  onRoll: () => void;
  onClose: () => void;
};

function IndomitableModal({
  action,
  options,
  selectedAbility,
  selectedOption,
  onSelectAbility,
  onRoll,
  onClose
}: IndomitableModalProps) {
  return (
    <div className={sheetStyles.spellManagementBackdrop} role="presentation" onClick={onClose}>
      <section
        className={clsx(sheetStyles.spellManagementModal, sharedModalStyles.featureActionModal)}
        role="dialog"
        aria-modal="true"
        aria-labelledby="indomitable-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={sheetStyles.spellManagementHeader}>
          <div className={sharedModalStyles.modalHeading}>
            <p className={sheetStyles.eyebrow}>Fighter</p>
            <h3 id="indomitable-modal-title">{action.name}</h3>
            <p className={shared.helperText}>
              Choose a saving throw to reroll. {action.usesLabel ?? ""}
            </p>
          </div>
          <button
            type="button"
            className={sheetStyles.spellManagementCloseButton}
            onClick={onClose}
            aria-label="Close Indomitable"
          >
            <X size={18} />
          </button>
        </div>

        <div className={styles.indomitableAbilityGrid}>
          {options.map((option) => (
            <button
              key={option.ability}
              type="button"
              className={clsx(
                styles.indomitableAbilityButton,
                selectedAbility === option.ability && styles.indomitableAbilityButtonActive
              )}
              onClick={() => onSelectAbility(option.ability)}
            >
              <strong>{option.ability}</strong>
              <small>{formatAbilityModifier(option.total)} Save</small>
            </button>
          ))}
        </div>

        <div className={styles.indomitableFormulaBlock}>
          <span>Formula</span>
          <strong>
            {selectedOption?.formulaDisplay ?? "Choose a saving throw to see the roll formula."}
          </strong>
        </div>

        <div className={shared.formActions}>
          <button type="button" className={shared.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={shared.saveButton}
            onClick={onRoll}
            disabled={selectedOption === null}
          >
            Roll Saving Throw
          </button>
        </div>
      </section>
    </div>
  );
}

export default IndomitableModal;
