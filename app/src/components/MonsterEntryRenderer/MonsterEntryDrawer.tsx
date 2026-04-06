import { X } from "lucide-react";
import { useId, type ReactNode } from "react";
import { SheetDrawer } from "../Overlay";
import type { CodexStatus, MonsterRecord } from "../../types";
import sheetStyles from "../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import MonsterEntryRenderer from "./MonsterEntryRenderer";
import styles from "./MonsterEntryDrawer.module.css";

type MonsterEntryDrawerProps = {
  monster: MonsterRecord | null;
  status: CodexStatus;
  onClose: () => void;
  badgeLabel?: string;
  backdropClassName?: string;
  drawerClassName?: string;
  footer?: ReactNode;
};

function MonsterEntryDrawer({
  monster,
  status,
  onClose,
  badgeLabel = "Monster",
  backdropClassName,
  drawerClassName,
  footer
}: MonsterEntryDrawerProps) {
  const titleId = useId();

  return (
    <SheetDrawer
      titleId={titleId}
      onClose={onClose}
      backdropClassName={backdropClassName}
      drawerClassName={drawerClassName}
    >
      <div className={sheetStyles.spellDrawerHeader}>
        <div className={sheetStyles.spellDrawerHeaderContent}>
          <p className={sheetStyles.spellDrawerBadge}>{badgeLabel}</p>
        </div>
        <button
          type="button"
          className={sheetStyles.spellDrawerCloseButton}
          onClick={onClose}
          aria-label="Close monster preview"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>

      <div className={`${sheetStyles.spellDrawerBody} ${styles.body}`}>
        {status === "loading" ? (
          <div className={styles.statusState}>
            <h3 id={titleId}>Loading monster...</h3>
            <p>Fetching the full monster entry.</p>
          </div>
        ) : null}

        {status === "error" ? (
          <div className={styles.statusState}>
            <h3 id={titleId}>Monster unavailable</h3>
            <p>The full monster entry could not be loaded.</p>
          </div>
        ) : null}

        {status === "ready" && monster ? (
          <MonsterEntryRenderer monster={monster} headingId={titleId} />
        ) : null}
      </div>

      {footer ? <div className={`${sheetStyles.spellDrawerActions} ${styles.footer}`}>{footer}</div> : null}
    </SheetDrawer>
  );
}

export default MonsterEntryDrawer;
