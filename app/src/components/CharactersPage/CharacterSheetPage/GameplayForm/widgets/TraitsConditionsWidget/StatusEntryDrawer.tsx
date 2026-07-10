import clsx from "clsx";
import {
  Check,
  Clock3,
  Minus,
  Plus,
  Save,
  Trash2,
  Undo2,
  X,
  type LucideIcon
} from "lucide-react";
import { useState, type ReactNode } from "react";
import ActionButton from "../../../../../ActionButton";
import { FeatureTrackingBadgeButton } from "../../../../../FeatureDisclosure";
import type { DivinityEntry, SpellEntry } from "../../../../../../codex/entries";
import { TRACKER } from "../../../../../../codex/entries";
import CellContainer from "../../../../../../components/CellContainer/CellContainer";
import ConcentrationLabel from "../../../../../../components/ConcentrationLabel";
import DescriptionContent from "../../../../../../components/DescriptionContent/DescriptionContent";
import KeywordReferenceDrawer from "../../../../../../components/KeywordReferenceDrawer/KeywordReferenceDrawer";
import {
  LazyCodexDivinityDrawer as CodexDivinityDrawer,
  LazyCodexSpellDrawer as CodexSpellDrawer
} from "../../../../../CodexPage/LazyCodexReferenceDrawers";
import {
  OverlayBody,
  OverlayCloseButton,
  OverlayDetailsGrid,
  OverlayEyebrow,
  OverlayFooter,
  OverlayHeader,
  OverlayHeaderContent,
  OverlayTitle,
  OverlayTitleRow,
  SheetDrawer
} from "../../../../../Overlay";
import sheetStyles from "../../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import { orderDescriptionAdditionSections } from "../../../../../../pages/CharactersPage/actionModalDescriptions";
import {
  getStatusDurationLabel,
  getStatusEntryDescriptionContent,
  isExhaustionStatusEntry,
  getStatusEntrySourceLabel,
  getStatusEntrySpellSlotLabel,
  getStatusEntryOptionLabel,
  getStatusEntryTargetLabel,
  getStatusEntryTitle
} from "../../../../../../pages/CharactersPage/traits";
import type {
  Character,
  CharacterStatusEntry,
  CharacterStatusEntryNoteCharges
} from "../../../../../../types";
import { EFFECT_NAME, STATUS_ENTRY_GROUP } from "../../../../../../types";
import {
  resolveKeywordReference,
  type ResolvedKeywordReference
} from "../../../../../../utils/codex/renderCodexRichText";
import styles from "./StatusEntryDrawer.module.css";
import {
  getStatusDrawerBadgeLabel,
  isStatusEntryDurationEditable,
  isStatusEntryRemovable
} from "./traitsWidgetUtils";
import ManualStatusDurationFields from "./ManualStatusDurationFields";
import type { ManualStatusDurationType } from "./manualStatusDuration";
import { TraitNotesBody, TraitNotesFooterControls } from "./TraitNotesSection";
import { useTraitNotesEditor } from "./useTraitNotesEditor";

type StatusEntryDrawerProps = {
  character: Character;
  entry: CharacterStatusEntry;
  customContent?: ReactNode;
  afterDetailsContent?: ReactNode;
  customFooterContent?: ReactNode;
  isEditingDuration: boolean;
  durationType: ManualStatusDurationType;
  durationValue: number;
  onDurationTypeChange: (value: ManualStatusDurationType) => void;
  onDurationValueChange: (value: number) => void;
  onStartEditDuration: () => void;
  editActionIcon?: LucideIcon;
  editActionLabel?: string;
  onCancelEditDuration: () => void;
  onApplyDuration: () => void;
  onRemove: () => void;
  onSaveNotes?: (
    entry: CharacterStatusEntry,
    notes: string,
    noteCharges?: CharacterStatusEntryNoteCharges
  ) => void;
  onIncreaseExhaustion?: () => void;
  onDecreaseExhaustion?: () => void;
  onClose: () => void;
};

type FooterAction = {
  label: string;
  icon: LucideIcon;
  tone?: "accent" | "danger" | "neutral";
  disabled?: boolean;
  onClick: () => void;
};

function StatusEntryDrawer({
  character,
  entry,
  customContent = null,
  afterDetailsContent = null,
  customFooterContent = null,
  isEditingDuration,
  durationType,
  durationValue,
  onDurationTypeChange,
  onDurationValueChange,
  onStartEditDuration,
  editActionIcon = Clock3,
  editActionLabel = "Edit Duration",
  onCancelEditDuration,
  onApplyDuration,
  onRemove,
  onSaveNotes,
  onIncreaseExhaustion,
  onDecreaseExhaustion,
  onClose
}: StatusEntryDrawerProps) {
  const canEditDuration = isStatusEntryDurationEditable(entry);
  const canRemove = isStatusEntryRemovable(entry);
  const canShowNotes = Boolean(onSaveNotes) && (canEditDuration || canRemove);
  const traitNotesEditor = useTraitNotesEditor({
    entry,
    onSaveNotes: onSaveNotes ?? (() => undefined)
  });
  const isExhaustionEntry = isExhaustionStatusEntry(entry);
  const [selectedSpellReference, setSelectedSpellReference] = useState<SpellEntry | null>(null);
  const [selectedDivinityReference, setSelectedDivinityReference] = useState<DivinityEntry | null>(
    null
  );
  const [selectedKeyword, setSelectedKeyword] = useState<ResolvedKeywordReference | null>(null);
  const { description: descriptionEntries, descriptionAdditions } =
    getStatusEntryDescriptionContent(entry, character);
  const isSpellStatusEntry =
    typeof entry.sourceSpellId === "string" && entry.sourceSpellId.trim().length > 0;
  const shouldShowSpellSlotFact =
    isSpellStatusEntry && entry.group === STATUS_ENTRY_GROUP.EFFECTS;
  const targetLabel = isSpellStatusEntry ? getStatusEntryTargetLabel(entry) : null;
  const optionLabel = isSpellStatusEntry ? getStatusEntryOptionLabel(entry) : null;
  const spellFormulas = entry.spellFormulas ?? [];
  const shouldUseTwoFactLayout =
    !shouldShowSpellSlotFact && !targetLabel && !optionLabel && !isExhaustionEntry;
  const hasBaseDescription = descriptionEntries.length > 0;
  const descriptionSections = orderDescriptionAdditionSections(descriptionAdditions);
  const footerActions: FooterAction[] = isEditingDuration
    ? [
        {
          label: "Apply Duration",
          icon: Check,
          onClick: onApplyDuration
        },
        {
          label: "Cancel",
          icon: X,
          tone: "neutral",
          onClick: onCancelEditDuration
        }
      ]
    : isExhaustionEntry
      ? [
          {
            label: "Increase",
            icon: Plus,
            onClick: onIncreaseExhaustion ?? (() => undefined)
          },
          {
            label: "Decrease",
            icon: Minus,
            onClick: onDecreaseExhaustion ?? (() => undefined)
          },
          {
            label: "End Duration",
            icon: Trash2,
            tone: "danger",
            onClick: onRemove
          }
        ]
      : [
          ...(canEditDuration
            ? [
                {
                  label: editActionLabel,
                  icon: editActionIcon,
                  onClick: onStartEditDuration
                } satisfies FooterAction
              ]
            : []),
          ...(canRemove
            ? [
                {
                  label: "End Duration",
                  icon: Trash2,
                  tone: "danger",
                  onClick: onRemove
                } satisfies FooterAction
              ]
            : [])
        ];
  const visibleFooterActions: FooterAction[] = traitNotesEditor.isEditing
    ? [
        {
          label: "Save",
          icon: Save,
          disabled: !traitNotesEditor.canSave,
          onClick: traitNotesEditor.saveNotes
        },
        {
          label: "Cancel",
          icon: Undo2,
          tone: "neutral",
          onClick: traitNotesEditor.cancelEditing
        }
      ]
    : footerActions;

  function openTrackingKeyword(trackingState: TRACKER, trackingMessage?: string) {
    const resolvedKeyword = resolveKeywordReference(trackingState, undefined, trackingMessage);

    if (resolvedKeyword) {
      setSelectedKeyword(resolvedKeyword);
    }
  }

  return (
    <>
      <SheetDrawer
        titleId="status-drawer-title"
        onClose={onClose}
        onEscape={() => {
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
        }}
      >
        <OverlayHeader>
          <OverlayHeaderContent>
            <OverlayEyebrow>{getStatusDrawerBadgeLabel(entry)}</OverlayEyebrow>
            <OverlayTitleRow>
              <OverlayTitle id="status-drawer-title">
                {entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
                entry.value === EFFECT_NAME.CONCENTRATION ? (
                  <ConcentrationLabel iconSize={18} />
                ) : (
                  getStatusEntryTitle(entry)
                )}
              </OverlayTitle>
            </OverlayTitleRow>
          </OverlayHeaderContent>
          <div className={styles.headerActions}>
            {entry.trackingState ? (
              <FeatureTrackingBadgeButton
                trackingState={entry.trackingState}
                trackingMessage={entry.trackingMessage}
                onClick={openTrackingKeyword}
              />
            ) : null}
            <OverlayCloseButton label="Close trait details" onClick={onClose} />
          </div>
        </OverlayHeader>

        <OverlayBody className={styles.drawerBody}>
          {hasBaseDescription || descriptionSections.length > 0 ? (
            <div className={sheetStyles.spellDrawerDescriptionStack}>
              {hasBaseDescription ? (
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
              ) : null}
              {descriptionSections.map((section, index) => (
                <div
                  key={`${entry.id}-description-addition-${index}`}
                  className={sheetStyles.spellDrawerDescriptionAdditionSection}
                >
                  {hasBaseDescription || index > 0 ? (
                    <hr className={sheetStyles.spellDrawerDescriptionDivider} aria-hidden="true" />
                  ) : null}
                  <DescriptionContent
                    description={section}
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
                </div>
              ))}
            </div>
          ) : null}

          {customContent}

          <OverlayDetailsGrid
            className={clsx(
              styles.drawerFacts,
              targetLabel || optionLabel ? styles.drawerFactsWithTarget : null,
              shouldUseTwoFactLayout ? styles.drawerFactsTwoColumn : null
            )}
          >
            <CellContainer label="Duration" content={getStatusDurationLabel(entry.duration)} />
            {shouldShowSpellSlotFact ? (
              <CellContainer label="Spell Slot" content={getStatusEntrySpellSlotLabel(entry)} />
            ) : null}
            {targetLabel ? <CellContainer label="Target" content={targetLabel} /> : null}
            {optionLabel ? <CellContainer label="Option" content={optionLabel} /> : null}
            <CellContainer
              label="Source"
              content={getStatusEntrySourceLabel(entry)}
              className={
                shouldShowSpellSlotFact && !targetLabel && !optionLabel
                  ? styles.sourceFact
                  : undefined
              }
            />
            {spellFormulas.map((formula) => (
              <CellContainer
                key={`${formula.label}-${formula.content}`}
                className={sheetStyles.spellDrawerFormulaCell}
                label={formula.label}
                content={formula.content}
                breakdown={formula.breakdown}
              />
            ))}
            {isExhaustionEntry ? (
              <CellContainer label="Current Level" content={`Level ${entry.conditionLevel ?? 1}`} />
            ) : null}
          </OverlayDetailsGrid>

          {canShowNotes && onSaveNotes ? <TraitNotesBody editor={traitNotesEditor} /> : null}

          {afterDetailsContent}

          {isEditingDuration ? (
            <div className={styles.durationEditor}>
              <ManualStatusDurationFields
                durationType={durationType}
                durationValue={durationValue}
                onDurationTypeChange={onDurationTypeChange}
                onDurationValueChange={onDurationValueChange}
              />
            </div>
          ) : null}
        </OverlayBody>

        {visibleFooterActions.length > 0 || customFooterContent || canShowNotes ? (
          <OverlayFooter className={styles.footer}>
            {canShowNotes && !traitNotesEditor.isEditing ? (
              <TraitNotesFooterControls editor={traitNotesEditor} />
            ) : null}
            {customFooterContent}
            {visibleFooterActions.length > 0 ? (
              <div
                className={styles.footerActionRow}
                style={{
                  gridTemplateColumns: `repeat(${Math.max(1, visibleFooterActions.length)}, minmax(0, 1fr))`
                }}
              >
                {visibleFooterActions.map((action) => {
                  const Icon = action.icon;

                  return (
                    <ActionButton
                      key={action.label}
                      className={styles.footerActionButton}
                      actionType={action.tone === "danger" ? "ERROR" : "INFO"}
                      variant={
                        action.tone === "neutral" || action.tone === "danger" ? "OUTLINE" : "FILL"
                      }
                      onClick={action.onClick}
                      disabled={action.disabled}
                      icon={<Icon size={16} aria-hidden="true" />}
                    >
                      {action.label}
                    </ActionButton>
                  );
                })}
              </div>
            ) : null}
          </OverlayFooter>
        ) : null}
      </SheetDrawer>

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
              description: selectedKeyword.description,
              trackingMessage: selectedKeyword.trackingMessage
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
