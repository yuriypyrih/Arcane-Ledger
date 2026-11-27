import { useNavigate } from "react-router-dom";
import type { GameSessionAvailabilityState, PlayerGameSessionRecord } from "../../api/gameSessions";
import ActionButton from "../ActionButton";
import styles from "./PlayerSessionsPanel.module.css";

const AVAILABILITY_OPTIONS: { state: GameSessionAvailabilityState; label: string }[] = [
  { state: "yes", label: "Yes" },
  { state: "maybe", label: "Maybe" },
  { state: "no", label: "No" }
];

type PlayerSessionsListProps = {
  sessions: PlayerGameSessionRecord[];
  userId: string | null;
  onNavigate?: () => void;
  onVote: (sessionId: string, state: GameSessionAvailabilityState) => void | Promise<void>;
};

/** Upcoming sessions for a player: vote on availability and join a live session. */
function PlayerSessionsList({ sessions, userId, onNavigate, onVote }: PlayerSessionsListProps) {
  const navigate = useNavigate();

  return (
    <div className={styles.panel}>
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
                onClick={() => {
                  onNavigate?.();
                  navigate(`/characters/${session.characterClientId}`);
                }}
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
                    onClick={() => void onVote(session.id, option.state)}
                  >
                    {option.label}
                  </ActionButton>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default PlayerSessionsList;
