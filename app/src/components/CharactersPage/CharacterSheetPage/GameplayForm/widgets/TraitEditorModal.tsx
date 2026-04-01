import clsx from "clsx";
import { X } from "lucide-react";
import SelectInput from "../../../FormInputs/SelectInput";
import shared from "../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import sheetStyles from "../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import {
  durationPresetOptions,
  isRoundDurationPreset,
  isExhaustionConditionOptionValue
} from "../../../../../pages/CharactersPage/traits";
import { STATUS_DURATION_PRESET, STATUS_DURATION_ROUND_TICK } from "../../../../../types";
import { statusRoundTickOptions } from "../../../../../pages/CharactersPage/traits";
import styles from "./TraitEditorModal.module.css";
import {
  formatTraitEditorOptionLabel,
  getTraitEditorOptions,
  traitEditorTabs,
  type TraitEditorTab
} from "./traitsWidgetUtils";

type TraitEditorModalProps = {
  activeTab: TraitEditorTab;
  values: Record<TraitEditorTab, string>;
  durationPreset: STATUS_DURATION_PRESET;
  roundTickOn: STATUS_DURATION_ROUND_TICK;
  onTabChange: (tab: TraitEditorTab) => void;
  onValueChange: (tab: TraitEditorTab, value: string) => void;
  onDurationPresetChange: (preset: STATUS_DURATION_PRESET) => void;
  onRoundTickOnChange: (tickOn: STATUS_DURATION_ROUND_TICK) => void;
  onSave: () => void;
  onClose: () => void;
};

function TraitEditorModal({
  activeTab,
  values,
  durationPreset,
  roundTickOn,
  onTabChange,
  onValueChange,
  onDurationPresetChange,
  onRoundTickOnChange,
  onSave,
  onClose
}: TraitEditorModalProps) {
  const isExhaustionSelection =
    activeTab === "conditions" && isExhaustionConditionOptionValue(values[activeTab]);
  const showRoundTickSelector = isRoundDurationPreset(durationPreset) && !isExhaustionSelection;

  return (
    <div className={sheetStyles.spellManagementBackdrop} role="presentation" onClick={onClose}>
      <section
        className={clsx(sheetStyles.spellManagementModal, styles.traitEditorModal)}
        role="dialog"
        aria-modal="true"
        aria-labelledby="trait-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={sheetStyles.spellManagementHeader}>
          <div className={styles.modalHeading}>
            <h3 id="trait-modal-title" className={styles.modalTitle}>
              Edit Traits &amp; Conditions
            </h3>
            <p className={shared.helperText}>
              Add passive traits and temporary states so the dashboard reflects what is currently
              affecting the character.
            </p>
          </div>
          <button
            type="button"
            className={sheetStyles.spellManagementCloseButton}
            onClick={onClose}
            aria-label="Close traits and conditions editor"
          >
            <X size={18} />
          </button>
        </div>

        <div className={styles.tabRow} role="tablist" aria-label="Trait categories">
          {traitEditorTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={clsx(styles.tabButton, activeTab === tab.id && styles.tabButtonActive)}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className={shared.formGrid}>
          <label className={shared.field}>
            <span className={shared.fieldLabel}>
              {traitEditorTabs.find((tab) => tab.id === activeTab)?.label}
            </span>
            <SelectInput
              value={values[activeTab]}
              onChange={(event) => onValueChange(activeTab, event.target.value)}
            >
              {getTraitEditorOptions(activeTab).map((option) => (
                <option key={option} value={option}>
                  {formatTraitEditorOptionLabel(activeTab, option)}
                </option>
              ))}
            </SelectInput>
          </label>

          <label className={shared.field}>
            <span className={shared.fieldLabel}>Duration</span>
            <SelectInput
              value={durationPreset}
              disabled={isExhaustionSelection}
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

          {showRoundTickSelector ? (
            <label className={shared.field}>
              <span className={shared.fieldLabel}>Round Tick</span>
              <SelectInput
                value={roundTickOn}
                onChange={(event) =>
                  onRoundTickOnChange(event.target.value as STATUS_DURATION_ROUND_TICK)
                }
              >
                {statusRoundTickOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </SelectInput>
            </label>
          ) : null}
        </div>

        <div className={shared.formActions}>
          <button type="button" className={shared.saveButton} onClick={onSave}>
            Save
          </button>
          <button type="button" className={shared.cancelButton} onClick={onClose}>
            Cancel
          </button>
        </div>
      </section>
    </div>
  );
}

export default TraitEditorModal;
