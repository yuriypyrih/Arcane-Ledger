import clsx from "clsx";
import { Plus } from "lucide-react";
import SelectInput from "../../../FormInputs/SelectInput";
import shared from "../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import {
  durationPresetOptions,
  isRoundDurationPreset,
  isExhaustionConditionOptionValue
} from "../../../../../pages/CharactersPage/traits";
import { STATUS_DURATION_PRESET, STATUS_DURATION_ROUND_TICK } from "../../../../../types";
import { statusRoundTickOptions } from "../../../../../pages/CharactersPage/traits";
import {
  OverlayBody,
  OverlayCloseButton,
  OverlayFooter,
  OverlayHeader,
  OverlayHeaderContent,
  OverlayTitle,
  OverlayTitleRow,
  SheetModal
} from "../../../../Overlay";
import sheetStyles from "../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import CustomTraitBuilder from "./CustomTraitBuilder";
import type { CustomTraitDraft, CustomTraitMode } from "./customTraitDraft";
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
  durationPreset: STATUS_DURATION_PRESET;
  roundTickOn: STATUS_DURATION_ROUND_TICK;
  customTraitDraft: CustomTraitDraft;
  createDisabled: boolean;
  onModeChange: (mode: CustomTraitMode) => void;
  onTabChange: (tab: TraitEditorTab) => void;
  onValueChange: (tab: TraitEditorTab, value: string) => void;
  onDurationPresetChange: (preset: STATUS_DURATION_PRESET) => void;
  onRoundTickOnChange: (tickOn: STATUS_DURATION_ROUND_TICK) => void;
  onCustomTraitNameChange: (value: string) => void;
  onCustomTraitDescriptionChange: (value: string) => void;
  onCustomTraitDurationPresetChange: (preset: STATUS_DURATION_PRESET) => void;
  onCustomTraitRoundTickOnChange: (tickOn: STATUS_DURATION_ROUND_TICK) => void;
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
  durationPreset,
  roundTickOn,
  customTraitDraft,
  createDisabled,
  onModeChange,
  onTabChange,
  onValueChange,
  onDurationPresetChange,
  onRoundTickOnChange,
  onCustomTraitNameChange,
  onCustomTraitDescriptionChange,
  onCustomTraitDurationPresetChange,
  onCustomTraitRoundTickOnChange,
  onCustomTraitEffectTargetChange,
  onCustomTraitEffectValueChange,
  onAddCustomTraitEffect,
  onRemoveCustomTraitEffect,
  onCreate,
  onClose
}: TraitEditorModalProps) {
  const isExhaustionSelection =
    activeTab === "conditions" && isExhaustionConditionOptionValue(values[activeTab]);
  const showRoundTickSelector = isRoundDurationPreset(durationPreset) && !isExhaustionSelection;
  const isCustomTraitMode = mode === "custom-trait";
  const activeTabLabel = traitEditorTabs.find((tab) => tab.id === activeTab)?.label ?? "Conditions";

  return (
    <SheetModal
      titleId="trait-modal-title"
      onClose={onClose}
      panelClassName={clsx(styles.modalPanel, isCustomTraitMode && styles.modalPanelExpanded)}
    >
      <OverlayHeader className={styles.header}>
        <OverlayHeaderContent className={styles.headerContent}>
          <OverlayTitleRow className={styles.titleRow}>
            <OverlayTitle id="trait-modal-title">Edit Traits &amp; Conditions</OverlayTitle>
            <button
              type="button"
              className={clsx(styles.modePill, isCustomTraitMode && styles.modePillActive)}
              aria-pressed={isCustomTraitMode}
              onClick={() =>
                onModeChange(isCustomTraitMode ? "quick-add" : "custom-trait")
              }
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
            onDurationPresetChange={onCustomTraitDurationPresetChange}
            onRoundTickOnChange={onCustomTraitRoundTickOnChange}
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
          </div>
        )}
      </OverlayBody>

      <OverlayFooter className={styles.footer}>
        <button
          type="button"
          className={clsx(sheetStyles.castButton, styles.createButton)}
          onClick={onCreate}
          disabled={createDisabled}
        >
          <Plus size={18} aria-hidden="true" />
          <span>Create</span>
        </button>
      </OverlayFooter>
    </SheetModal>
  );
}

export default TraitEditorModal;
