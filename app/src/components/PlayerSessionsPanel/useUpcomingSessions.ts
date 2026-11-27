import { useCallback, useEffect, useRef, useState } from "react";
import {
  listMyUpcomingGameSessions,
  setGameSessionAvailability,
  type GameSessionAvailabilityState,
  type PlayerGameSessionRecord
} from "../../api/gameSessions";
import { isSessionEvent, useCampaignEvents } from "../../lib/useCampaignEvents";
import { useAppSelector } from "../../store";

/** The signed-in player's upcoming and live sessions, kept fresh by campaign events. */
export function useUpcomingSessions() {
  const userId = useAppSelector((state) => state.auth.user?.id ?? null);
  const [sessions, setSessions] = useState<PlayerGameSessionRecord[]>([]);
  const latestRequest = useRef(0);

  const refresh = useCallback(() => {
    if (!userId) {
      setSessions([]);
      return;
    }

    const request = ++latestRequest.current;

    listMyUpcomingGameSessions({ suppressFailureToast: true })
      .then(({ gameSessions }) => {
        // A slower, older response must not replace a newer one.
        if (request === latestRequest.current) {
          setSessions(gameSessions);
        }
      })
      .catch(() => undefined);
  }, [userId]);

  useEffect(refresh, [refresh]);
  useCampaignEvents(
    sessions.map((session) => session.campaignId),
    (type) => {
      if (isSessionEvent(type)) {
        refresh();
      }
    }
  );

  const vote = useCallback(
    async (sessionId: string, state: GameSessionAvailabilityState) => {
      try {
        await setGameSessionAvailability(sessionId, state, { suppressFailureToast: true });
      } finally {
        refresh();
      }
    },
    [refresh]
  );

  /** Sessions that need the player: one is live to join, or a planned one still lacks their vote. */
  const attentionCount = sessions.filter(
    (session) =>
      session.status === "live" || !session.availability.some((entry) => entry.userId === userId)
  ).length;

  return { attentionCount, refresh, sessions, userId, vote };
}
