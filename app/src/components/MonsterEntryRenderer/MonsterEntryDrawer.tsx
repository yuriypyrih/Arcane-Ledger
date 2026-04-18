import { useId, type ReactNode } from "react";
import {
  OverlayBadge,
  OverlayBody,
  OverlayCloseButton,
  OverlayFooter,
  OverlayHeader,
  OverlayHeaderContent,
  OverlaySummary,
  OverlayTitle,
  OverlayTitleRow,
  SheetDrawer
} from "../Overlay";
import type { CodexStatus, MonsterRecord } from "../../types";
import MonsterEntryRenderer from "./MonsterEntryRenderer";
import { formatMonsterTitleMeta, getKnownMonsterText } from "./monsterEntryFormatting";
import styles from "./MonsterEntryDrawer.module.css";

type MonsterEntryDrawerProps = {
  monster: MonsterRecord | null;
  status: CodexStatus;
  onClose: () => void;
  badgeLabel?: string;
  backdropClassName?: string;
  drawerClassName?: string;
  footer?: ReactNode;
  contentSurface?: "card" | "plain";
  showHeaderDivider?: boolean;
};

function MonsterEntryDrawer({
  monster,
  status,
  onClose,
  badgeLabel = "Monster",
  backdropClassName,
  drawerClassName,
  footer,
  contentSurface = "card",
  showHeaderDivider = false
}: MonsterEntryDrawerProps) {
  const titleId = useId();
  const title =
    status === "ready" && monster
      ? (getKnownMonsterText(monster.name) ?? "Unknown Monster")
      : status === "loading"
        ? "Loading monster..."
        : "Monster unavailable";
  const summary =
    status === "ready" && monster
      ? formatMonsterTitleMeta(monster)
      : status === "loading"
        ? "Fetching the full monster entry."
        : "The full monster entry could not be loaded.";

  return (
    <SheetDrawer
      titleId={titleId}
      onClose={onClose}
      backdropClassName={backdropClassName}
      drawerClassName={drawerClassName}
    >
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayBadge>{badgeLabel}</OverlayBadge>
          <OverlayTitleRow>
            <OverlayTitle id={titleId}>{title}</OverlayTitle>
          </OverlayTitleRow>
          <OverlaySummary>{summary}</OverlaySummary>
        </OverlayHeaderContent>
        <OverlayCloseButton label="Close monster preview" onClick={onClose} />
      </OverlayHeader>

      <OverlayBody
        className={[styles.body, showHeaderDivider ? styles.bodyWithHeaderDivider : ""]
          .join(" ")
          .trim()}
      >
        {status === "loading" ? (
          <div className={styles.statusState}>
            <p>Fetching the full monster entry.</p>
          </div>
        ) : null}

        {status === "error" ? (
          <div className={styles.statusState}>
            <p>The full monster entry could not be loaded.</p>
          </div>
        ) : null}

        {status === "ready" && !monster ? (
          <div className={styles.statusState}>
            <p>No monster entry is available for this preview.</p>
          </div>
        ) : null}

        {status === "ready" && monster ? (
          <MonsterEntryRenderer
            monster={monster}
            showHeading={false}
            surface={contentSurface}
          />
        ) : null}
      </OverlayBody>

      {footer ? <OverlayFooter className={styles.footer}>{footer}</OverlayFooter> : null}
    </SheetDrawer>
  );
}

export default MonsterEntryDrawer;
