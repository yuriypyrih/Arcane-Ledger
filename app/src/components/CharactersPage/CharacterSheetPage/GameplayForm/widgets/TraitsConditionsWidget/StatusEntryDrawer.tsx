import clsx from "clsx";
import { Check, Clock3, Minus, Plus, Trash2, X, type LucideIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import ActionButton from "../../../../../ActionButton";
import type { DivinityEntry, SpellEntry } from "../../../../../../codex/entries";
import CellContainer from "../../../../../../components/CellContainer/CellContainer";
import ConcentrationLabel from "../../../../../../components/ConcentrationLabel";
import DescriptionContent from "../../../../../../components/DescriptionContent/DescriptionContent";
import KeywordReferenceDrawer from "../../../../../../components/KeywordReferenceDrawer/KeywordReferenceDrawer";
import CodexDivinityDrawer from "../../../../../CodexPage/CodexDivinityDrawer/CodexDivinityDrawer";
import CodexSpellDrawer from "../../../../../CodexPage/CodexSpellDrawer/CodexSpellDrawer";
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
  getStatusEntryTitle
} from "../../../../../../pages/CharactersPage/traits";
import type { Character, CharacterStatusEntry } from "../../../../../../types";
import { EFFECT_NAME, STATUS_ENTRY_GROUP } from "../../../../../../types";
import type { ResolvedKeywordReference } from "../../../../../../utils/codex/renderCodexRichText";
import styles from "./StatusEntryDrawer.module.css";
import {
  getStatusDrawerBadgeLabel,
  isStatusEntryDurationEditable,
  isStatusEntryRemovable
} from "./traitsWidgetUtils";
import ManualStatusDurationFields from "./ManualStatusDurationFields";
import type { ManualStatusDurationType } from "./manualStatusDuration";

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
  onIncreaseExhaustion?: () => void;
  onDecreaseExhaustion?: () => void;
  onClose: () => void;
};

type FooterAction = {
  label: string;
  icon: LucideIcon;
  tone?: "accent" | "danger" | "neutral";
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
  const { description: descriptionEntries, descriptionAdditions } =
    getStatusEntryDescriptionContent(entry, character);
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
          <OverlayCloseButton label="Close trait details" onClick={onClose} />
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

          <OverlayDetailsGrid className={styles.drawerFacts}>
            <CellContainer label="Duration" content={getStatusDurationLabel(entry.duration)} />
            <CellContainer label="Source" content={getStatusEntrySourceLabel(entry)} />
            {isExhaustionEntry ? (
              <CellContainer label="Current Level" content={`Level ${entry.conditionLevel ?? 1}`} />
            ) : null}
          </OverlayDetailsGrid>

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

        {footerActions.length > 0 || customFooterContent ? (
          <OverlayFooter className={styles.footer}>
            {customFooterContent}
            {footerActions.length > 0 ? (
              <div
                className={styles.footerActionRow}
                style={{
                  gridTemplateColumns: `repeat(${Math.max(1, footerActions.length)}, minmax(0, 1fr))`
                }}
              >
                {footerActions.map((action) => {
                  const Icon = action.icon;

                  return (
                    <ActionButton
                      key={action.label}
                      className={styles.footerActionButton}
                      actionType={action.tone === "danger" ? "ERROR" : "INFO"}
                      variant={
                        action.tone === "neutral" || action.tone === "danger" ? "GHOST" : "FILL"
                      }
                      onClick={action.onClick}
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
