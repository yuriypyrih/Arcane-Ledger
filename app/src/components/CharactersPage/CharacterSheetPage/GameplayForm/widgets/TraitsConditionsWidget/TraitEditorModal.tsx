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
import CustomTraitBuilder from "./CustomTraitBuilder";
import ManualStatusDurationFields from "./ManualStatusDurationFields";
import type { CustomTraitDraft, CustomTraitMode } from "./customTraitDraft";
import type { ManualStatusDurationType } from "./manualStatusDuration";
import styles from "./TraitEditorModal.module.css";
import {
  formatTraitEditorOptionLabel,
  getTraitEditorOptions,
  traitEditorTabs,
  type TraitEditorTab
} from "./traitsWidgetUtils";

type TraitEditorModalProps = {
  mode: CustomTraitMode;
  activeTab: TraitEditorTab;
  values: Record<TraitEditorTab, string>;
  durationType: ManualStatusDurationType;
  durationValue: number;
  customTraitDraft: CustomTraitDraft;
  createDisabled: boolean;
  onModeChange: (mode: CustomTraitMode) => void;
  onTabChange: (tab: TraitEditorTab) => void;
  onValueChange: (tab: TraitEditorTab, value: string) => void;
  onDurationTypeChange: (value: ManualStatusDurationType) => void;
  onDurationValueChange: (value: number) => void;
  onCustomTraitNameChange: (value: string) => void;
  onCustomTraitDescriptionChange: (value: string) => void;
  onCustomTraitDurationTypeChange: (value: ManualStatusDurationType) => void;
  onCustomTraitDurationValueChange: (value: number) => void;
  onCustomTraitEffectTargetChange: (effectId: string, value: string) => void;
  onCustomTraitEffectValueChange: (effectId: string, value: string) => void;
  onAddCustomTraitEffect: () => void;
  onRemoveCustomTraitEffect: (effectId: string) => void;
  onCreate: () => void;
  onClose: () => void;
};

function TraitEditorModal({
  mode,
  activeTab,
  values,
  durationType,
  durationValue,
  customTraitDraft,
  createDisabled,
  onModeChange,
  onTabChange,
  onValueChange,
  onDurationTypeChange,
  onDurationValueChange,
  onCustomTraitNameChange,
  onCustomTraitDescriptionChange,
  onCustomTraitDurationTypeChange,
  onCustomTraitDurationValueChange,
  onCustomTraitEffectTargetChange,
  onCustomTraitEffectValueChange,
  onAddCustomTraitEffect,
  onRemoveCustomTraitEffect,
  onCreate,
  onClose
}: TraitEditorModalProps) {
  const isExhaustionSelection =
    activeTab === "conditions" && isExhaustionConditionOptionValue(values[activeTab]);
  const isCustomTraitMode = mode === "custom-trait";
  const activeTabLabel = traitEditorTabs.find((tab) => tab.id === activeTab)?.label ?? "Conditions";

  return (
    <SheetModal
      titleId="trait-modal-title"
      onClose={onClose}
      size="medium"
      panelClassName={isCustomTraitMode ? styles.modalPanelExpanded : undefined}
    >
      <OverlayHeader className={styles.header}>
        <OverlayHeaderContent className={styles.headerContent}>
          <OverlayTitleRow className={styles.titleRow}>
            <OverlayTitle id="trait-modal-title">Edit Traits &amp; Conditions</OverlayTitle>
            <button
              type="button"
              className={clsx(styles.modePill, isCustomTraitMode && styles.modePillActive)}
              aria-pressed={isCustomTraitMode}
              onClick={() => onModeChange(isCustomTraitMode ? "quick-add" : "custom-trait")}
            >
              <Plus size={14} aria-hidden="true" />
              <span>Custom Feature Trait</span>
            </button>
          </OverlayTitleRow>
        </OverlayHeaderContent>
        <OverlayCloseButton label="Close traits and conditions editor" onClick={onClose} />
      </OverlayHeader>

      <OverlayBody className={clsx(styles.body, isCustomTraitMode && styles.bodyExpanded)}>
        {isCustomTraitMode ? (
          <CustomTraitBuilder
            draft={customTraitDraft}
            onNameChange={onCustomTraitNameChange}
            onDescriptionChange={onCustomTraitDescriptionChange}
            onDurationTypeChange={onCustomTraitDurationTypeChange}
            onDurationValueChange={onCustomTraitDurationValueChange}
            onEffectTargetChange={onCustomTraitEffectTargetChange}
            onEffectValueChange={onCustomTraitEffectValueChange}
            onAddEffect={onAddCustomTraitEffect}
            onRemoveEffect={onRemoveCustomTraitEffect}
          />
        ) : (
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
        )}
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
