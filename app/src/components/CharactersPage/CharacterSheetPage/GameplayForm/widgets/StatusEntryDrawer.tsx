import clsx from "clsx";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { DivinityEntry, SpellEntry } from "../../../../../codex/entries";
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
  getStatusDurationLabel,
  getStatusEntryDescriptionEntries,
  isExhaustionStatusEntry,
  getStatusEntrySourceLabel,
  getStatusEntryTitle
} from "../../../../../pages/CharactersPage/traits";
import type { CharacterStatusEntry } from "../../../../../types";
import { EFFECT_NAME, STATUS_DURATION_PRESET, STATUS_ENTRY_GROUP } from "../../../../../types";
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
  onDurationPresetChange: (preset: STATUS_DURATION_PRESET) => void;
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
  onDurationPresetChange,
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
                <h3 id="status-drawer-title">
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
              linkClassName={styles.inlineLinkButton}
              onOpenKeyword={setSelectedKeyword}
              onOpenSpell={setSelectedSpellReference}
              onOpenDivinity={setSelectedDivinityReference}
            />

            <div className={styles.drawerFacts}>
              <div className={styles.drawerFact}>
                <span>Duration</span>
                <strong>{getStatusDurationLabel(entry.duration)}</strong>
              </div>
              <div className={styles.drawerFact}>
                <span>Source</span>
                <strong>{getStatusEntrySourceLabel(entry)}</strong>
              </div>
              {isExhaustionEntry ? (
                <div className={styles.drawerFact}>
                  <span>Current Level</span>
                  <strong>{`Level ${entry.conditionLevel ?? 1}`}</strong>
                </div>
              ) : null}
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
