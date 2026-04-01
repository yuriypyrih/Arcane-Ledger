import clsx from "clsx";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { DivinityEntry, SpellEntry } from "../../../../../codex/entries";
import CellContainer from "../../../../../components/CellContainer/CellContainer";
import ConcentrationLabel from "../../../../../components/ConcentrationLabel";
import DescriptionContent from "../../../../../components/DescriptionContent/DescriptionContent";
import KeywordReferenceDrawer from "../../../../../components/KeywordReferenceDrawer/KeywordReferenceDrawer";
import CodexDivinityDrawer from "../../../../CodexPage/CodexDivinityDrawer/CodexDivinityDrawer";
import CodexSpellDrawer from "../../../../CodexPage/CodexSpellDrawer/CodexSpellDrawer";
import SelectInput from "../../../FormInputs/SelectInput";
import shared from "../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import sheetStyles from "../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import {
  durationPresetOptions,
  isRoundDurationPreset,
  getStatusDurationLabel,
  getStatusEntryDescriptionEntries,
  isExhaustionStatusEntry,
  getStatusEntrySourceLabel,
  statusRoundTickOptions,
  getStatusEntryTitle
} from "../../../../../pages/CharactersPage/traits";
import type { CharacterStatusEntry } from "../../../../../types";
import {
  EFFECT_NAME,
  STATUS_DURATION_PRESET,
  STATUS_DURATION_ROUND_TICK,
  STATUS_ENTRY_GROUP
} from "../../../../../types";
import type { ResolvedKeywordReference } from "../../../../../utils/codex/renderCodexRichText";
import styles from "./StatusEntryDrawer.module.css";
import {
  getStatusDrawerBadgeLabel,
  isStatusEntryDurationEditable,
  isStatusEntryRemovable
} from "./traitsWidgetUtils";

type StatusEntryDrawerProps = {
  entry: CharacterStatusEntry;
  isEditingDuration: boolean;
  durationPreset: STATUS_DURATION_PRESET;
  roundTickOn: STATUS_DURATION_ROUND_TICK;
  onDurationPresetChange: (preset: STATUS_DURATION_PRESET) => void;
  onRoundTickOnChange: (tickOn: STATUS_DURATION_ROUND_TICK) => void;
  onStartEditDuration: () => void;
  onCancelEditDuration: () => void;
  onApplyDuration: () => void;
  onRemove: () => void;
  onIncreaseExhaustion?: () => void;
  onDecreaseExhaustion?: () => void;
  onClose: () => void;
};

function StatusEntryDrawer({
  entry,
  isEditingDuration,
  durationPreset,
  roundTickOn,
  onDurationPresetChange,
  onRoundTickOnChange,
  onStartEditDuration,
  onCancelEditDuration,
  onApplyDuration,
  onRemove,
  onIncreaseExhaustion,
  onDecreaseExhaustion,
  onClose
}: StatusEntryDrawerProps) {
  const canEditDuration = isStatusEntryDurationEditable(entry);
  const canRemove = isStatusEntryRemovable(entry);
  const isExhaustionEntry = isExhaustionStatusEntry(entry);
  const showRoundTickSelector = isRoundDurationPreset(durationPreset);
  const [selectedSpellReference, setSelectedSpellReference] = useState<SpellEntry | null>(null);
  const [selectedDivinityReference, setSelectedDivinityReference] = useState<DivinityEntry | null>(
    null
  );
  const [selectedKeyword, setSelectedKeyword] = useState<ResolvedKeywordReference | null>(null);
  const descriptionEntries = getStatusEntryDescriptionEntries(entry);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      if (selectedKeyword) {
        setSelectedKeyword(null);
        return;
      }

      if (selectedDivinityReference) {
        setSelectedDivinityReference(null);
        return;
      }

      if (selectedSpellReference) {
        setSelectedSpellReference(null);
        return;
      }

      onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, selectedDivinityReference, selectedKeyword, selectedSpellReference]);

  return (
    <>
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
                <h3 id="status-drawer-title" className={sheetStyles.spellDrawerTitle}>
                  {entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
                  entry.value === EFFECT_NAME.CONCENTRATION ? (
                    <ConcentrationLabel iconSize={18} />
                  ) : (
                    getStatusEntryTitle(entry)
                  )}
                </h3>
              </div>
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
            <DescriptionContent
              description={descriptionEntries}
              className={clsx(
                sheetStyles.spellDrawerDescriptionList,
                sheetStyles.spellDrawerDescriptionSection
              )}
              entryClassName={sheetStyles.spellDrawerDescriptionLine}
              strongClassName={sheetStyles.spellDrawerDescriptionStrong}
              linkClassName={styles.inlineLinkButton}
              onOpenKeyword={setSelectedKeyword}
              onOpenSpell={setSelectedSpellReference}
              onOpenDivinity={setSelectedDivinityReference}
            />

            <div className={styles.drawerFacts}>
              <CellContainer label="Duration" content={getStatusDurationLabel(entry.duration)} />
              <CellContainer label="Source" content={getStatusEntrySourceLabel(entry)} />
              {isExhaustionEntry ? (
                <CellContainer
                  label="Current Level"
                  content={`Level ${entry.conditionLevel ?? 1}`}
                />
              ) : null}
            </div>

            {isEditingDuration ? (
              <div className={styles.durationEditor}>
                <label className={shared.field}>
                  <span className={shared.fieldLabel}>Duration</span>
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

                <div className={styles.durationEditorActions}>
                  <button type="button" className={shared.saveButton} onClick={onApplyDuration}>
                    Apply
                  </button>
                  <button
                    type="button"
                    className={shared.cancelButton}
                    onClick={onCancelEditDuration}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}

            {isExhaustionEntry ? (
              <div className={styles.exhaustionActionRow}>
                <button type="button" className={shared.saveButton} onClick={onIncreaseExhaustion}>
                  Increase Exhaustion
                </button>
                <button
                  type="button"
                  className={shared.cancelButton}
                  onClick={onDecreaseExhaustion}
                >
                  Decrease Exhaustion
                </button>
                <button type="button" className={styles.removeButton} onClick={onRemove}>
                  Remove Exhaustion
                </button>
              </div>
            ) : isEditingDuration || canEditDuration || canRemove ? (
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

      {selectedSpellReference ? (
        <CodexSpellDrawer
          spell={selectedSpellReference}
          onClose={() => setSelectedSpellReference(null)}
        />
      ) : null}
      {selectedDivinityReference ? (
        <CodexDivinityDrawer
          divinity={selectedDivinityReference}
          onClose={() => setSelectedDivinityReference(null)}
        />
      ) : null}
      {selectedKeyword ? (
        <KeywordReferenceDrawer
          title={selectedKeyword.title}
          entries={[
            {
              title: selectedKeyword.title,
              description: selectedKeyword.description
            }
          ]}
          badgeLabel="Keyword"
          onClose={() => setSelectedKeyword(null)}
        />
      ) : null}
    </>
  );
}

export default StatusEntryDrawer;
