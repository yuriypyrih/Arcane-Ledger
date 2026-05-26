import { CloudUpload, Trash2 } from "lucide-react";
import { useId, useMemo, useState } from "react";
import ActionButton from "../components/ActionButton";
import RadioContainerOption from "../components/CharactersPage/CharacterSheetPage/RadioContainerOption";
import {
  OverlayBody,
  OverlayEyebrow,
  OverlayFooter,
  OverlayHeader,
  OverlayHeaderContent,
  OverlaySummary,
  OverlayTitle,
  SheetModal
} from "../components/Overlay";
import { formatCharacterSheetSize } from "../pages/CharactersPage/characterSheetSize";
import type { PortableCharacterSheet } from "../types";
import { getPortableCharacterSheetSync } from "./characterSyncRecords";
import styles from "./UnclaimedCharactersModal.module.css";

type UnclaimedCharactersModalProps = {
  availableSlots: number;
  currentCount: number;
  error: string | null;
  isBusy: boolean;
  limit: number;
  records: PortableCharacterSheet[];
  onConfirm: (selectedRecords: PortableCharacterSheet[]) => void;
};

function getRecordSelectionId(record: PortableCharacterSheet) {
  return getPortableCharacterSheetSync(record)?.clientId ?? `local-${record.identity.localId}`;
}

function getRecordMeta(record: PortableCharacterSheet) {
  const sheetSize = formatCharacterSheetSize(record.summary.sheetSizeBytes);
  const parts = [
    `Level ${record.summary.level}`,
    record.summary.species,
    record.summary.className,
    record.summary.background,
    sheetSize
  ].filter(Boolean);

  return parts.join(" / ");
}

function UnclaimedCharactersModal({
  availableSlots,
  currentCount,
  error,
  isBusy,
  limit,
  records,
  onConfirm
}: UnclaimedCharactersModalProps) {
  const titleId = useId();
  const defaultSelectedIds = useMemo(
    () => records.slice(0, Math.max(0, availableSlots)).map(getRecordSelectionId),
    [availableSlots, records]
  );
  const [selectedIds, setSelectedIds] = useState(() => new Set(defaultSelectedIds));
  const selectedRecords = records.filter((record) => selectedIds.has(getRecordSelectionId(record)));
  const selectedCount = selectedRecords.length;
  const isSelectionFull = selectedCount >= availableSlots;

  function unselectAllRecords() {
    setSelectedIds(new Set());
  }

  function toggleRecord(record: PortableCharacterSheet) {
    const selectionId = getRecordSelectionId(record);
    const isSelected = selectedIds.has(selectionId);

    if (!isSelected && isSelectionFull) {
      return;
    }

    setSelectedIds((currentSelection) => {
      const nextSelection = new Set(currentSelection);

      if (isSelected) {
        nextSelection.delete(selectionId);
      } else {
        nextSelection.add(selectionId);
      }

      return nextSelection;
    });
  }

  return (
    <SheetModal
      titleId={titleId}
      onClose={() => undefined}
      isBusy={isBusy}
      busyLabel="Importing characters"
      panelClassName={styles.modalPanel}
      size="medium"
    >
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayEyebrow>Account sync</OverlayEyebrow>
          <OverlayTitle id={titleId}>Unclaimed Characters</OverlayTitle>
          <OverlaySummary>
            These local sheets are not attached to this account. Choose which ones to import.
          </OverlaySummary>
        </OverlayHeaderContent>
      </OverlayHeader>

      <OverlayBody className={styles.body}>
        <div className={styles.capacityBar}>
          <span className={styles.capacityPill}>
            {currentCount}/{limit} account slots used
          </span>
          <span>{selectedCount} selected</span>
          <button
            type="button"
            className={styles.linkButton}
            disabled={selectedCount === 0 || isBusy}
            onClick={unselectAllRecords}
          >
            Unselect All
          </button>
        </div>

        <ul className={styles.recordList}>
          {records.map((record) => {
            const selectionId = getRecordSelectionId(record);
            const isSelected = selectedIds.has(selectionId);
            const isDisabled = !isSelected && isSelectionFull;

            return (
              <li key={selectionId}>
                <RadioContainerOption
                  header={record.summary.name}
                  selected={isSelected}
                  disabled={isDisabled || availableSlots <= 0}
                  indicatorType="checkbox"
                  breakdown={getRecordMeta(record)}
                  onSelect={() => toggleRecord(record)}
                />
              </li>
            );
          })}
        </ul>

        <p className={styles.warning}>
          Unselected sheets will be removed from this device after confirmation.
        </p>
        {error ? <p className={styles.error}>{error}</p> : null}
      </OverlayBody>

      <OverlayFooter className={styles.footer}>
        <ActionButton
          actionType={selectedCount > 0 ? "INFO" : "WARNING"}
          fullWidth
          icon={
            selectedCount > 0 ? (
              <CloudUpload size={16} aria-hidden="true" />
            ) : (
              <Trash2 size={16} aria-hidden="true" />
            )
          }
          onClick={() => onConfirm(selectedRecords)}
        >
          {selectedCount > 0 ? `Import ${selectedCount}` : "Discard unclaimed"}
        </ActionButton>
      </OverlayFooter>
    </SheetModal>
  );
}

export default UnclaimedCharactersModal;
