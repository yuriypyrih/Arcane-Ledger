import { Bell, BellOff, EyeOff, NotebookPen } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { setGameSessionHidden } from "../../api/gameSessions";
import {
  loadPreferences,
  PREFERENCES_CHANGED_EVENT,
  updatePreferences
} from "../../storage/preferences";
import PlayerSessionsList, { useUpcomingSessions } from "../PlayerSessionsPanel";
import { usePendingSessionLogs } from "./usePendingSessionLogs";
import styles from "./SessionNotificationsBell.module.css";

type SessionNotificationsBellProps = {
  /** Replaces the round icon-button look, for example with a sidebar button. */
  buttonClassName?: string;
  /** Text next to the icon; the icon alone is shown without it. */
  label?: string;
  /** "side" opens next to the button and is for bells inside a scrolling sidebar. */
  placement?: "below" | "side";
};

const NARROW_SCREEN_PX = 700;

/** Session invites and join prompts live behind this bell instead of on every page. */
function SessionNotificationsBell({
  buttonClassName,
  label,
  placement = "below"
}: SessionNotificationsBellProps) {
  const navigate = useNavigate();
  const { attentionCount, refresh, sessions, userId, vote } = useUpcomingSessions();
  const { dismiss: dismissLog, logs: pendingLogs } = usePendingSessionLogs();
  const [showBadge, setShowBadge] = useState(() => loadPreferences().notificationBadge);
  const [isDismissing, setIsDismissing] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [sidePosition, setSidePosition] = useState<CSSProperties | undefined>(undefined);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    const sync = () => setShowBadge(loadPreferences().notificationBadge);

    window.addEventListener(PREFERENCES_CHANGED_EVENT, sync);

    return () => window.removeEventListener(PREFERENCES_CHANGED_EVENT, sync);
  }, []);

  /** Hides every session in the bell. They stay on the Sessions page under "Show hidden". */
  async function handleDismissAll() {
    setIsDismissing(true);

    try {
      await Promise.allSettled(
        sessions.map((session) =>
          setGameSessionHidden(session.id, true, { suppressFailureToast: true })
        )
      );
    } finally {
      setIsDismissing(false);
      refresh();
    }
  }

  function handleToggle() {
    if (!isOpen && placement === "side") {
      // A fixed position keeps the popover from being clipped by the sidebar's own scrolling.
      const rect = buttonRef.current?.getBoundingClientRect();

      setSidePosition(
        !rect
          ? undefined
          : window.innerWidth < NARROW_SCREEN_PX
            ? { left: 8, right: 8, bottom: Math.max(8, window.innerHeight - rect.top + 8) }
            : { left: rect.right + 8, bottom: Math.max(8, window.innerHeight - rect.bottom) }
      );
    }

    setIsOpen((open) => !open);
  }

  const needsYouCount = attentionCount + pendingLogs.length;
  const defaultLook = !buttonClassName;
  const buttonClasses = [
    defaultLook ? styles.button : buttonClassName,
    defaultLook && isOpen ? styles.buttonActive : ""
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={placement === "side" ? `${styles.root} ${styles.rootBlock}` : styles.root}
      ref={rootRef}
    >
      <button
        ref={buttonRef}
        type="button"
        className={buttonClasses}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={
          showBadge && needsYouCount > 0
            ? `Notifications, ${needsYouCount} need you`
            : "Notifications"
        }
        title={label ? undefined : "Notifications"}
        onClick={handleToggle}
      >
        <span className={styles.icon}>
          <Bell size={defaultLook ? 16 : 22} aria-hidden="true" />
          {showBadge && needsYouCount > 0 ? (
            <span className={styles.badge}>{needsYouCount}</span>
          ) : null}
        </span>
        {label ? <span>{label}</span> : null}
      </button>
      {isOpen ? (
        <div
          className={
            placement === "side" ? `${styles.popover} ${styles.popoverSide}` : styles.popover
          }
          style={placement === "side" ? sidePosition : undefined}
          role="dialog"
          aria-label="Notifications"
        >
          <strong className={styles.title}>Notifications</strong>
          {pendingLogs.length > 0 ? (
            <ul className={styles.logReminders} aria-label="Session logs to write">
              {pendingLogs.map((log) => (
                <li key={log.id} className={styles.logReminder}>
                  <NotebookPen size={18} aria-hidden="true" />
                  <div className={styles.logReminderText}>
                    <strong>{log.title} ended</strong>
                    <span>Write the log so your players can catch up. {log.campaignName}</span>
                  </div>
                  <div className={styles.logActions}>
                    <button
                      type="button"
                      className={styles.logAction}
                      onClick={() => {
                        setIsOpen(false);
                        navigate(
                          `/gm-tools/campaign-manager/${log.campaignId}?tab=sessions&session=${log.id}`
                        );
                      }}
                    >
                      Write log
                    </button>
                    <button
                      type="button"
                      className={styles.quiet}
                      onClick={() => void dismissLog(log.id)}
                    >
                      Dismiss
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
          {sessions.length > 0 ? (
            <PlayerSessionsList
              sessions={sessions}
              userId={userId}
              onNavigate={() => setIsOpen(false)}
              onVote={vote}
            />
          ) : pendingLogs.length === 0 ? (
            <p className={styles.empty}>Nothing needs you right now.</p>
          ) : null}
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.link}
              onClick={() => {
                setIsOpen(false);
                navigate("/sessions");
              }}
            >
              Open Sessions
            </button>
            {sessions.length > 0 ? (
              <button
                type="button"
                className={styles.quiet}
                disabled={isDismissing}
                onClick={() => void handleDismissAll()}
              >
                <EyeOff size={14} aria-hidden="true" /> Dismiss all
              </button>
            ) : null}
            <button
              type="button"
              className={styles.quiet}
              aria-pressed={!showBadge}
              onClick={() => updatePreferences({ notificationBadge: !showBadge })}
            >
              {showBadge ? (
                <BellOff size={14} aria-hidden="true" />
              ) : (
                <Bell size={14} aria-hidden="true" />
              )}
              {showBadge ? "Hide the red badge" : "Show the red badge"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default SessionNotificationsBell;
