import clsx from "clsx";
import { Plus } from "lucide-react";
import ActionButton from "../../../../../ActionButton";
import SelectInput from "../../../../FormInputs/SelectInput";
import shared from "../../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import { isExhaustionConditionOptionValue } from "../../../../../../pages/CharactersPage/traits";
import {
  OverlayBody,
  OverlayCloseButton,
  OverlayFooter,
  OverlayHeader,
  OverlayHeaderContent,
  OverlayTitle,
  OverlayTitleRow,
  SheetModal
} from "../../../../../Overlay";
import ManualStatusDurationFields from "./ManualStatusDurationFields";
import type { ManualStatusDurationType } from "./manualStatusDuration";
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
  durationType: ManualStatusDurationType;
  durationValue: number;
  createDisabled: boolean;
  onCreateCustomTrait: () => void;
  onTabChange: (tab: TraitEditorTab) => void;
  onValueChange: (tab: TraitEditorTab, value: string) => void;
  onDurationTypeChange: (value: ManualStatusDurationType) => void;
  onDurationValueChange: (value: number) => void;
  onCreate: () => void;
  onClose: () => void;
};

function TraitEditorModal({
  activeTab,
  values,
  durationType,
  durationValue,
  createDisabled,
  onCreateCustomTrait,
  onTabChange,
  onValueChange,
  onDurationTypeChange,
  onDurationValueChange,
  onCreate,
  onClose
}: TraitEditorModalProps) {
  const isExhaustionSelection =
    activeTab === "conditions" && isExhaustionConditionOptionValue(values[activeTab]);
  const activeTabLabel = traitEditorTabs.find((tab) => tab.id === activeTab)?.label ?? "Conditions";

  return (
    <SheetModal titleId="trait-modal-title" onClose={onClose} size="medium">
      <OverlayHeader className={styles.header}>
        <OverlayHeaderContent className={styles.headerContent}>
          <OverlayTitleRow className={styles.titleRow}>
            <OverlayTitle id="trait-modal-title">Edit Traits & Conditions</OverlayTitle>
          </OverlayTitleRow>
        </OverlayHeaderContent>
        <div className={styles.titleActions}>
          <button
            type="button"
            className={clsx(shared.editButton, styles.titleActionButton)}
            onClick={onCreateCustomTrait}
          >
            <Plus size={16} aria-hidden="true" />
            <span>Custom Trait</span>
          </button>
        </div>
        <OverlayCloseButton label="Close traits and conditions editor" onClick={onClose} />
      </OverlayHeader>

      <OverlayBody className={styles.body}>
        <div className={styles.quickAddStack}>
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
              <span className={shared.fieldLabel}>{activeTabLabel}</span>
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

            <ManualStatusDurationFields
              durationType={durationType}
              durationValue={durationValue}
              disabled={isExhaustionSelection}
              onDurationTypeChange={onDurationTypeChange}
              onDurationValueChange={onDurationValueChange}
            />
          </div>
        </div>
      </OverlayBody>

      <OverlayFooter className={styles.footer}>
        <ActionButton
          className={styles.createButton}
          onClick={onCreate}
          disabled={createDisabled}
          icon={<Plus size={18} aria-hidden="true" />}
        >
          Create
        </ActionButton>
      </OverlayFooter>
    </SheetModal>
  );
}

export default TraitEditorModal;
