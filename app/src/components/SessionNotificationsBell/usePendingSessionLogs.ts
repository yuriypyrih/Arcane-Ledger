import { useCallback, useEffect, useRef, useState } from "react";
import {
  dismissSessionLogReminder,
  listPendingSessionLogs,
  type PendingSessionLog
} from "../../api/gameSessions";
import { SESSION_LOG_REMINDER_EVENT } from "../../lib/sessionLogReminder";
import { useAppSelector } from "../../store";

/** Ended sessions the GM has not written a log for yet; refreshed when the app asks or the tab regains focus. */
export function usePendingSessionLogs() {
  const userId = useAppSelector((state) => state.auth.user?.id ?? null);
  const [logs, setLogs] = useState<PendingSessionLog[]>([]);
  const latestRequest = useRef(0);

  const refresh = useCallback(() => {
    if (!userId) {
      setLogs([]);
      return;
    }

    const request = ++latestRequest.current;

    listPendingSessionLogs({ suppressFailureToast: true })
      .then(({ gameSessions }) => {
        if (request === latestRequest.current) {
          setLogs(gameSessions);
        }
      })
      .catch(() => undefined);
  }, [userId]);

  useEffect(refresh, [refresh]);
  useEffect(() => {
    window.addEventListener(SESSION_LOG_REMINDER_EVENT, refresh);
    window.addEventListener("focus", refresh);

    return () => {
      window.removeEventListener(SESSION_LOG_REMINDER_EVENT, refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [refresh]);

  const dismiss = useCallback(
    async (sessionId: string) => {
      setLogs((current) => current.filter((entry) => entry.id !== sessionId));

      try {
        await dismissSessionLogReminder(sessionId, { suppressFailureToast: true });
      } finally {
        refresh();
      }
    },
    [refresh]
  );

  return { dismiss, logs };
}
