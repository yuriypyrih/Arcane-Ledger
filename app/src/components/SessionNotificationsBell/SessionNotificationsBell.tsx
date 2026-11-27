import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PlayerSessionsList, { useUpcomingSessions } from "../PlayerSessionsPanel";
import styles from "./SessionNotificationsBell.module.css";

/** Header bell: session invites and join prompts live here instead of on every page. */
function SessionNotificationsBell() {
  const navigate = useNavigate();
  const { attentionCount, sessions, userId, vote } = useUpcomingSessions();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

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

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        type="button"
        className={isOpen ? `${styles.button} ${styles.buttonActive}` : styles.button}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={
          attentionCount > 0 ? `Notifications, ${attentionCount} need you` : "Notifications"
        }
        onClick={() => setIsOpen((open) => !open)}
      >
        <Bell size={16} aria-hidden="true" />
        {attentionCount > 0 ? <span className={styles.badge}>{attentionCount}</span> : null}
      </button>
      {isOpen ? (
        <div className={styles.popover} role="dialog" aria-label="Notifications">
          <strong className={styles.title}>Session notifications</strong>
          {sessions.length > 0 ? (
            <PlayerSessionsList
              sessions={sessions}
              userId={userId}
              onNavigate={() => setIsOpen(false)}
              onVote={vote}
            />
          ) : (
            <p className={styles.empty}>No upcoming sessions.</p>
          )}
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
        </div>
      ) : null}
    </div>
  );
}

export default SessionNotificationsBell;
