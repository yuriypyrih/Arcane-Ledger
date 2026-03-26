import { X } from "lucide-react";
import SelectInput from "../../../FormInputs/SelectInput";
import shared from "../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import sheetStyles from "../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import {
  durationPresetOptions,
  getStatusDurationLabel,
  getStatusEntryDescription,
  getStatusEntrySourceLabel,
  getStatusEntryTitle
} from "../../../../../pages/CharactersPage/traits";
import type { CharacterStatusEntry } from "../../../../../types";
import { STATUS_DURATION_PRESET } from "../../../../../types";
import styles from "./TraitsConditionsWidget.module.css";
import {
  getStatusDrawerBadgeLabel,
  isStatusEntryDurationEditable,
  isStatusEntryRemovable
} from "./traitsWidgetUtils";

type StatusEntryDrawerProps = {
  entry: CharacterStatusEntry;
  isEditingDuration: boolean;
  durationPreset: STATUS_DURATION_PRESET;
  onDurationPresetChange: (preset: STATUS_DURATION_PRESET) => void;
  onStartEditDuration: () => void;
  onCancelEditDuration: () => void;
  onApplyDuration: () => void;
  onRemove: () => void;
  onClose: () => void;
};

function StatusEntryDrawer({
  entry,
  isEditingDuration,
  durationPreset,
  onDurationPresetChange,
  onStartEditDuration,
  onCancelEditDuration,
  onApplyDuration,
  onRemove,
  onClose
}: StatusEntryDrawerProps) {
  const canEditDuration = isStatusEntryDurationEditable(entry);
  const canRemove = isStatusEntryRemovable(entry);

  return (
    <div className={sheetStyles.spellDrawerBackdrop} role="presentation" onClick={onClose}>
      <section
        className={sheetStyles.spellDrawer}
        role="dialog"
        aria-modal="true"
        aria-labelledby="status-drawer-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={sheetStyles.spellDrawerHandle} aria-hidden="true" />
        <div className={sheetStyles.spellDrawerHeader}>
          <div className={sheetStyles.spellDrawerHeaderContent}>
            <p className={sheetStyles.spellDrawerBadge}>
              {getStatusDrawerBadgeLabel(entry.group)}
            </p>
            <div className={sheetStyles.spellDrawerTitleRow}>
              <h3 id="status-drawer-title">{getStatusEntryTitle(entry)}</h3>
            </div>
            <p className={sheetStyles.spellDrawerSummary}>{getStatusEntryDescription(entry)}</p>
          </div>
          <button
            type="button"
            className={sheetStyles.spellDrawerCloseButton}
            onClick={onClose}
            aria-label="Close trait details"
          >
            <X size={18} />
          </button>
        </div>

        <div className={styles.drawerBody}>
          <div className={styles.drawerFacts}>
            <div className={styles.drawerFact}>
              <span>Duration</span>
              <strong>{getStatusDurationLabel(entry.duration)}</strong>
            </div>
            <div className={styles.drawerFact}>
              <span>Source</span>
              <strong>{getStatusEntrySourceLabel(entry)}</strong>
            </div>
          </div>

          {isEditingDuration ? (
            <div className={styles.durationEditor}>
              <label className={shared.field}>
                <span>Duration</span>
                <SelectInput
                  value={durationPreset}
                  onChange={(event) =>
                    onDurationPresetChange(event.target.value as STATUS_DURATION_PRESET)
                  }
                >
                  {durationPresetOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </SelectInput>
              </label>

              <div className={styles.durationEditorActions}>
                <button type="button" className={shared.saveButton} onClick={onApplyDuration}>
                  Apply
                </button>
                <button type="button" className={shared.cancelButton} onClick={onCancelEditDuration}>
                  Cancel
                </button>
              </div>
            </div>
          ) : null}

          {isEditingDuration || canEditDuration || canRemove ? (
            <div className={styles.drawerFooter}>
              {canEditDuration ? (
                <button type="button" className={shared.editButton} onClick={onStartEditDuration}>
                  Edit Duration
                </button>
              ) : (
                <span />
              )}

              {canRemove ? (
                <button type="button" className={styles.removeButton} onClick={onRemove}>
                  Remove
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

export default StatusEntryDrawer;
