import clsx from "clsx";
import { Fragment, type ReactNode } from "react";
import ActionButton from "../../../ActionButton";
import {
  OverlayBody,
  OverlayCloseButton,
  OverlayFooter,
  OverlayHeader,
  OverlayHeaderContent,
  OverlayEyebrow,
  OverlaySummary,
  OverlayTitle,
  SheetModal
} from "../../../Overlay";
import { parseHistoryEntry } from "./masterChestTransactions";
import styles from "./MasterChestModal.module.css";

function getHistoryActionClassName(label: string) {
  if (label === "Transferred-in" || label === "Deposit") {
    return styles.historyActionIn;
  }

  if (label === "Transferred-out" || label === "Withdraw") {
    return styles.historyActionOut;
  }

  return undefined;
}

function MasterChestHistoryModal({
  history,
  onClose
}: {
  history: string[];
  onClose: () => void;
}) {
  return (
    <SheetModal
      titleId="master-chest-history-modal-title"
      onClose={onClose}
      size="small"
      backdropClassName={styles.historyModalBackdrop}
      panelClassName={styles.historyModal}
    >
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayEyebrow>Master Chest</OverlayEyebrow>
          <OverlayTitle id="master-chest-history-modal-title">History</OverlayTitle>
          <OverlaySummary>Latest saved transactions.</OverlaySummary>
        </OverlayHeaderContent>
        <OverlayCloseButton label="Close history modal" onClick={onClose} />
      </OverlayHeader>

      <OverlayBody className={styles.historyModalBody}>
        {history.length > 0 ? (
          <ol className={styles.historyList}>
            {history.map((entry, index) => (
              <li key={`${entry}-${index}`} className={styles.historyItem}>
                <HistoryEntry entry={entry} />
              </li>
            ))}
          </ol>
        ) : (
          <p className={styles.historyEmpty}>No saved transactions yet.</p>
        )}
      </OverlayBody>

      <OverlayFooter>
        <div className={styles.readOnlyFooterActions}>
          <ActionButton variant="OUTLINE" onClick={onClose}>
            Close
          </ActionButton>
        </div>
      </OverlayFooter>
    </SheetModal>
  );
}

function HistoryEntry({ entry }: { entry: string }) {
  const parsedEntry = parseHistoryEntry(entry);

  if (!parsedEntry.timestamp || !parsedEntry.actor || parsedEntry.actions.length === 0) {
    return <span>{entry}</span>;
  }

  return (
    <article className={styles.historyEntryContent}>
      <header className={styles.historyEntryHeader}>
        <time className={styles.historyTimestamp}>{parsedEntry.timestamp}</time>
        <span className={styles.historyActor}>{parsedEntry.actor}</span>
      </header>
      <div className={styles.historyActionList}>
        {parsedEntry.actions.map((action) => (
          <div key={`${action.label}-${action.content}`} className={styles.historyAction}>
            <strong
              className={clsx(
                styles.historyActionLabel,
                getHistoryActionClassName(action.label)
              )}
            >
              {action.label}
            </strong>
            <span className={styles.historyActionTokens}>
              {formatHistoryActionContent(action.content)}
            </span>
          </div>
        ))}
      </div>
    </article>
  );
}

function formatHistoryActionContent(content: string): ReactNode {
  const entries = content
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  return entries.map((entry, index) => (
    <Fragment key={`${entry}-${index}`}>
      {index > 0 ? <span className={styles.historyTokenSeparator}> </span> : null}
      <span className={styles.historyToken}>{entry}</span>
    </Fragment>
  ));
}

export default MasterChestHistoryModal;
