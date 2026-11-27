import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  listMyUpcomingGameSessions,
  setGameSessionAvailability,
  type GameSessionAvailabilityState,
  type PlayerGameSessionRecord
} from "../../api/gameSessions";
import { useCampaignEvents } from "../../lib/useCampaignEvents";
import { useAppSelector } from "../../store";
import ActionButton from "../ActionButton";
import styles from "./PlayerSessionsPanel.module.css";

const AVAILABILITY_OPTIONS: { state: GameSessionAvailabilityState; label: string }[] = [
  { state: "yes", label: "Yes" },
  { state: "maybe", label: "Maybe" },
  { state: "no", label: "No" }
];

/** Player-side view of upcoming sessions: vote on availability and join a live session. */
function PlayerSessionsPanel() {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const userId = user?.id ?? null;
  const [sessions, setSessions] = useState<PlayerGameSessionRecord[]>([]);

  const refresh = useCallback(() => {
    if (!userId) {
      setSessions([]);
      return;
    }

    listMyUpcomingGameSessions({ suppressFailureToast: true })
      .then(({ gameSessions }) => setSessions(gameSessions))
      .catch(() => undefined);
  }, [userId]);

  useEffect(refresh, [refresh]);
  useCampaignEvents(
    sessions.map((session) => session.campaignId),
    refresh
  );

  async function handleVote(sessionId: string, state: GameSessionAvailabilityState) {
    try {
      await setGameSessionAvailability(sessionId, state, { suppressFailureToast: true });
      refresh();
    } catch {
      refresh();
    }
  }

  if (!userId || sessions.length === 0) {
    return null;
  }

  return (
    <aside className={styles.panel} aria-label="Upcoming game sessions">
      {sessions.map((session) => {
        const myVote = session.availability.find((entry) => entry.userId === userId)?.state;

        return (
          <div key={session.id} className={styles.item}>
            <div>
              <strong>{session.title}</strong>
              <span className={styles.meta}>
                {session.campaignName}
                {session.scheduledAt
                  ? ` · ${new Date(session.scheduledAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}`
                  : null}
              </span>
            </div>
            {session.status === "live" ? (
              <ActionButton
                actionType="SUCCESS"
                fullWidth={false}
                size="sm"
                disabled={!session.characterClientId}
                onClick={() => navigate(`/characters/${session.characterClientId}`)}
              >
                Join session
              </ActionButton>
            ) : (
              <div
                className={styles.votes}
                role="group"
                aria-label={`Availability for ${session.title}`}
              >
                {AVAILABILITY_OPTIONS.map((option) => (
                  <ActionButton
                    key={option.state}
                    variant={myVote === option.state ? "FILL" : "OUTLINE"}
                    fullWidth={false}
                    size="sm"
                    aria-pressed={myVote === option.state}
                    onClick={() => void handleVote(session.id, option.state)}
                  >
                    {option.label}
                  </ActionButton>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </aside>
  );
}

export default PlayerSessionsPanel;
