import { Bell } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import PlayerSessionsList, { useUpcomingSessions } from "../PlayerSessionsPanel";
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
  const { attentionCount, sessions, userId, vote } = useUpcomingSessions();
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
          attentionCount > 0 ? `Notifications, ${attentionCount} need you` : "Notifications"
        }
        title={label ? undefined : "Notifications"}
        onClick={handleToggle}
      >
        <span className={styles.icon}>
          <Bell size={defaultLook ? 16 : 22} aria-hidden="true" />
          {attentionCount > 0 ? <span className={styles.badge}>{attentionCount}</span> : null}
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
