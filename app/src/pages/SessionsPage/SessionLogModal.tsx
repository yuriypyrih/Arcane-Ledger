import { BookOpenText } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { getPreviousGameSessionLog, type GameSessionLog } from "../../api/gameSessions";
import {
  OverlayBody,
  OverlayCloseButton,
  OverlayHeader,
  OverlayHeaderContent,
  OverlaySummary,
  OverlayTitle,
  SheetModal
} from "../../components/Overlay";
import { formatSessionDate } from "./sessionGroups";
import styles from "./SessionsPage.module.css";

type SessionLogModalProps = {
  sessionId: string;
  sessionTitle: string;
  onClose: () => void;
};

type LogState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; log: GameSessionLog | null };

/** Shows the log (recap) of the last earlier session of the same campaign, when there is one. */
function SessionLogModal({ sessionId, sessionTitle, onClose }: SessionLogModalProps) {
  const titleId = useId();
  const [state, setState] = useState<LogState>({ status: "loading" });

  useEffect(() => {
    let didCancel = false;

    getPreviousGameSessionLog(sessionId, { suppressFailureToast: true })
      .then(({ log }) => {
        if (!didCancel) {
          setState({ status: "ready", log });
        }
      })
      .catch(() => {
        if (!didCancel) {
          setState({ status: "error", message: "Unable to load the session log." });
        }
      });

    return () => {
      didCancel = true;
    };
  }, [sessionId]);

  return (
    <SheetModal titleId={titleId} onClose={onClose} size="medium">
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayTitle id={titleId}>Last session log</OverlayTitle>
          <OverlaySummary>Before {sessionTitle}</OverlaySummary>
        </OverlayHeaderContent>
        <OverlayCloseButton label="Close session log" onClick={onClose} />
      </OverlayHeader>
      <OverlayBody>
        {state.status === "loading" ? <p className={styles.logMuted}>Fetching the log…</p> : null}
        {state.status === "error" ? <p className={styles.logError}>{state.message}</p> : null}
        {state.status === "ready" && !state.log ? (
          <p className={styles.logMuted}>
            <BookOpenText size={18} aria-hidden="true" /> No earlier session has a log yet. The GM
            writes it after a session ends.
          </p>
        ) : null}
        {state.status === "ready" && state.log ? (
          <article className={styles.log}>
            <h3 className={styles.logTitle}>{state.log.title}</h3>
            <p className={styles.logDate}>
              {formatSessionDate(state.log.endedAt ?? state.log.scheduledAt)}
            </p>
            <p className={styles.logText}>{state.log.recap}</p>
          </article>
        ) : null}
      </OverlayBody>
    </SheetModal>
  );
}

export default SessionLogModal;
