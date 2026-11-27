import { BookOpenText, CalendarClock, CalendarDays, Eye, EyeOff } from "lucide-react";
import type { GameSessionAvailabilityState } from "../../api/gameSessions";
import ActionButton from "../../components/ActionButton";
import ExternalImage from "../../components/ExternalImage";
import {
  formatRelativeDay,
  formatSessionDate,
  getSessionGroup,
  type SessionRow
} from "./sessionGroups";
import styles from "./SessionsPage.module.css";

const AVAILABILITY_OPTIONS: { label: string; state: GameSessionAvailabilityState }[] = [
  { state: "yes", label: "Yes" },
  { state: "maybe", label: "Maybe" },
  { state: "no", label: "No" }
];

type SessionListRowProps = {
  myVote: GameSessionAvailabilityState | undefined;
  row: SessionRow;
  onJoin: (row: SessionRow) => void;
  onOpenCampaign: (row: SessionRow) => void;
  onReadLog: (row: SessionRow) => void;
  onToggleHidden: (row: SessionRow) => void;
  onVote: (row: SessionRow, state: GameSessionAvailabilityState) => void;
};

function getStatusLabel(row: SessionRow) {
  if (row.status === "live") {
    return "Live now";
  }

  if (row.status === "ended") {
    return "Ended";
  }

  if (row.status === "cancelled") {
    return "Cancelled";
  }

  return getSessionGroup(row) === "past" ? "Not held" : "Planned";
}

/** One session: where and when, what state it is in, and what the user can do with it. */
function SessionListRow({
  myVote,
  row,
  onJoin,
  onOpenCampaign,
  onReadLog,
  onToggleHidden,
  onVote
}: SessionListRowProps) {
  const relative = row.status === "planned" ? formatRelativeDay(row.scheduledAt) : null;

  return (
    <li className={styles.row} data-status={row.status} data-hidden={row.hidden || undefined}>
      <span className={styles.thumb}>
        <ExternalImage
          src={row.campaignImageUrl}
          className={styles.thumbImage}
          fallback={<CalendarDays size={22} aria-hidden="true" />}
        />
      </span>

      <div className={styles.rowMain}>
        <div className={styles.rowTitleLine}>
          <h3 className={styles.rowTitle}>{row.title}</h3>
          <span className={styles.pill} data-kind={row.status}>
            {getStatusLabel(row)}
          </span>
          <span className={styles.pill} data-kind={row.role}>
            {row.role === "gm" ? "GM" : "Player"}
          </span>
          {row.hidden ? (
            <span className={styles.pill} data-kind="hidden">
              Hidden
            </span>
          ) : null}
        </div>
        <p className={styles.rowMeta}>
          <span className={styles.campaignName}>{row.campaignName}</span>
          <span className={styles.metaDot} aria-hidden="true">
            ·
          </span>
          <time className={styles.when} dateTime={row.scheduledAt ?? undefined}>
            {formatSessionDate(row.scheduledAt)}
          </time>
          {relative ? <span className={styles.relative}>{relative}</span> : null}
        </p>
        {row.rescheduleProposal ? (
          <p className={styles.proposal}>
            <CalendarClock size={16} aria-hidden="true" />
            <span>
              The GM proposed{" "}
              <strong>{formatSessionDate(row.rescheduleProposal.proposedAt)}</strong>
              {row.rescheduleProposal.message ? ` · “${row.rescheduleProposal.message}”` : ""}
            </span>
          </p>
        ) : null}
      </div>

      <div className={styles.rowActions}>
        {row.role === "player" && row.status === "live" ? (
          <ActionButton
            actionType="SUCCESS"
            fullWidth={false}
            size="sm"
            disabled={!row.characterClientId}
            onClick={() => onJoin(row)}
          >
            Join session
          </ActionButton>
        ) : null}
        {row.role === "player" && row.status === "planned" ? (
          <div className={styles.votes} role="group" aria-label={`Availability for ${row.title}`}>
            {AVAILABILITY_OPTIONS.map((option) => (
              <ActionButton
                key={option.state}
                variant={myVote === option.state ? "FILL" : "OUTLINE"}
                fullWidth={false}
                size="sm"
                aria-pressed={myVote === option.state}
                onClick={() => onVote(row, option.state)}
              >
                {option.label}
              </ActionButton>
            ))}
          </div>
        ) : null}
        {row.role === "gm" ? (
          <ActionButton
            variant="OUTLINE"
            fullWidth={false}
            size="sm"
            onClick={() => onOpenCampaign(row)}
          >
            Open campaign
          </ActionButton>
        ) : null}
        <ActionButton
          variant="GHOST"
          fullWidth={false}
          size="sm"
          icon={<BookOpenText size={16} aria-hidden="true" />}
          title="Read the log of the last session before this one"
          onClick={() => onReadLog(row)}
        >
          Read last session log
        </ActionButton>
        {row.role === "player" ? (
          <ActionButton
            variant="GHOST"
            fullWidth={false}
            size="sm"
            aria-pressed={row.hidden}
            icon={
              row.hidden ? (
                <Eye size={16} aria-hidden="true" />
              ) : (
                <EyeOff size={16} aria-hidden="true" />
              )
            }
            title={
              row.hidden
                ? "Show this session in your lists again"
                : "Hide this session from your lists"
            }
            onClick={() => onToggleHidden(row)}
          >
            {row.hidden ? "Unhide" : "Hide"}
          </ActionButton>
        ) : null}
      </div>
    </li>
  );
}

export default SessionListRow;
