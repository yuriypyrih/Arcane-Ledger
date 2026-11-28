import {
  CalendarClock,
  Check,
  CircleHelp,
  Clock,
  MailWarning,
  Undo2,
  UserRound,
  X
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  getCampaignPlayerStatus,
  withdrawGameSessionReschedule,
  type CampaignPlayerStatusPlayer,
  type CampaignPlayerStatusSession,
  type GameSessionAvailabilityState
} from "../../api/gameSessions";
import ActionButton from "../../components/ActionButton";
import ExternalImage from "../../components/ExternalImage";
import { isSessionEvent, useCampaignEvents } from "../../lib/useCampaignEvents";
import { getDmToolsApiErrorMessage } from "./dmToolsApiErrors";
import DmToolsEmptyState from "./DmToolsEmptyState";
import ProposeRescheduleModal from "./ProposeRescheduleModal";
import styles from "./CampaignPlayersTab.module.css";

type CampaignPlayersTabProps = {
  campaignId: string;
  hasParty: boolean;
};

const ANSWER_LABELS: Record<GameSessionAvailabilityState | "pending", string> = {
  yes: "Accepted",
  maybe: "Maybe",
  no: "Declined",
  pending: "No answer yet"
};

function AnswerIcon({ answer }: { answer: GameSessionAvailabilityState | "pending" }) {
  const props = { size: 14, "aria-hidden": true } as const;

  return answer === "yes" ? (
    <Check {...props} />
  ) : answer === "maybe" ? (
    <CircleHelp {...props} />
  ) : answer === "no" ? (
    <X {...props} />
  ) : (
    <Clock {...props} />
  );
}

function formatWhen(value: string | null) {
  return value
    ? new Date(value).toLocaleString([], { dateStyle: "full", timeStyle: "short" })
    : "No time set";
}

function PlayerAvatar({ player }: { player: CampaignPlayerStatusPlayer }) {
  return (
    <span className={styles.avatar}>
      <ExternalImage
        src={player.avatarUrl}
        className={styles.avatarImage}
        fallback={
          <span className={styles.avatarFallback} aria-hidden="true">
            {player.nickname.charAt(0).toUpperCase() || <UserRound size={18} />}
          </span>
        }
      />
    </span>
  );
}

/** The GM's view of the players: who they are and how each answered for upcoming sessions. */
function CampaignPlayersTab({ campaignId, hasParty }: CampaignPlayersTabProps) {
  const [players, setPlayers] = useState<CampaignPlayerStatusPlayer[]>([]);
  const [sessions, setSessions] = useState<CampaignPlayerStatusSession[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proposing, setProposing] = useState<CampaignPlayerStatusSession | null>(null);
  const [busySessionId, setBusySessionId] = useState<string | null>(null);
  const latestRequest = useRef(0);

  const refresh = useCallback(() => {
    const request = ++latestRequest.current;

    getCampaignPlayerStatus(campaignId, { suppressFailureToast: true })
      .then((status) => {
        if (request !== latestRequest.current) {
          return;
        }

        setPlayers(status.players);
        setSessions(status.sessions);
        setError(null);
        setHasLoaded(true);
      })
      .catch((loadError) => {
        if (request !== latestRequest.current) {
          return;
        }

        setError(getDmToolsApiErrorMessage(loadError, "Unable to load player status."));
        setHasLoaded(true);
      });
  }, [campaignId]);

  useEffect(refresh, [refresh]);
  useEffect(
    () => () => {
      latestRequest.current += 1;
    },
    []
  );
  useCampaignEvents([campaignId], (type) => {
    if (isSessionEvent(type)) {
      refresh();
    }
  });

  async function handleWithdraw(sessionId: string) {
    setBusySessionId(sessionId);

    try {
      await withdrawGameSessionReschedule(sessionId, { suppressFailureToast: true });
      refresh();
    } catch (withdrawError) {
      setError(getDmToolsApiErrorMessage(withdrawError, "Unable to withdraw the proposal."));
    } finally {
      setBusySessionId(null);
    }
  }

  if (!hasLoaded) {
    return (
      <DmToolsEmptyState icon={<UserRound size={18} aria-hidden="true" />}>
        Loading players...
      </DmToolsEmptyState>
    );
  }

  if (error && players.length === 0 && sessions.length === 0) {
    return <p className={styles.error}>{error}</p>;
  }

  if (!hasParty || players.length === 0) {
    return (
      <DmToolsEmptyState icon={<UserRound size={18} aria-hidden="true" />}>
        {hasParty
          ? "No other players are in this campaign's party yet."
          : "Pick a party above to see its players here."}
      </DmToolsEmptyState>
    );
  }

  return (
    <div className={styles.tab}>
      {error ? <p className={styles.error}>{error}</p> : null}

      <section aria-labelledby="campaign-players-heading" className={styles.section}>
        <h3 id="campaign-players-heading" className={styles.heading}>
          Players
        </h3>
        <ul className={styles.roster}>
          {players.map((player) => (
            <li key={player.userId} className={styles.playerCard}>
              <PlayerAvatar player={player} />
              <div className={styles.playerText}>
                <strong className={styles.playerName}>{player.nickname}</strong>
                <p className={styles.playerBio}>{player.bio || "No bio yet."}</p>
                {player.emailVerified ? null : (
                  <p className={styles.warning}>
                    <MailWarning size={14} aria-hidden="true" /> Email not verified, so no session
                    emails reach this player.
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="campaign-answers-heading" className={styles.section}>
        <h3 id="campaign-answers-heading" className={styles.heading}>
          Upcoming sessions
        </h3>
        {sessions.length === 0 ? (
          <p className={styles.muted}>
            No planned or live sessions. Schedule one on the Sessions tab.
          </p>
        ) : (
          <ul className={styles.sessions}>
            {sessions.map((session) => {
              const accepted = session.responses.filter((entry) => entry.state === "yes").length;
              const playerById = new Map(players.map((player) => [player.userId, player]));

              return (
                <li key={session.id} className={styles.sessionCard}>
                  <div className={styles.sessionHeader}>
                    <div>
                      <strong className={styles.sessionTitle}>{session.title}</strong>
                      <span className={styles.sessionWhen}>
                        {session.status === "live" ? "Live now" : formatWhen(session.scheduledAt)}
                      </span>
                    </div>
                    <span className={styles.tally}>
                      {accepted} of {players.length} accepted
                    </span>
                  </div>

                  {session.rescheduleProposal ? (
                    <p className={styles.proposal}>
                      <CalendarClock size={16} aria-hidden="true" />
                      <span>
                        Proposed:{" "}
                        <strong>{formatWhen(session.rescheduleProposal.proposedAt)}</strong>
                        {session.rescheduleProposal.message
                          ? ` · "${session.rescheduleProposal.message}"`
                          : ""}
                      </span>
                    </p>
                  ) : null}

                  <ul className={styles.answers}>
                    {session.responses.map((response) => {
                      const player = playerById.get(response.userId);
                      const answer = response.state ?? "pending";

                      return player ? (
                        <li key={response.userId} className={styles.answer} data-answer={answer}>
                          <PlayerAvatar player={player} />
                          <span className={styles.answerName}>{player.nickname}</span>
                          <span className={styles.answerChip}>
                            <AnswerIcon answer={answer} />
                            {ANSWER_LABELS[answer]}
                          </span>
                        </li>
                      ) : null;
                    })}
                  </ul>

                  {session.status === "planned" ? (
                    <div className={styles.sessionActions}>
                      <ActionButton
                        variant="OUTLINE"
                        fullWidth={false}
                        size="sm"
                        icon={<CalendarClock size={16} aria-hidden="true" />}
                        onClick={() => setProposing(session)}
                      >
                        Propose reschedule
                      </ActionButton>
                      {session.rescheduleProposal ? (
                        <ActionButton
                          variant="GHOST"
                          fullWidth={false}
                          size="sm"
                          icon={<Undo2 size={16} aria-hidden="true" />}
                          loading={busySessionId === session.id}
                          onClick={() => void handleWithdraw(session.id)}
                        >
                          Withdraw proposal
                        </ActionButton>
                      ) : null}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {proposing ? (
        <ProposeRescheduleModal
          sessionId={proposing.id}
          sessionTitle={proposing.title}
          onClose={() => setProposing(null)}
          onProposed={refresh}
        />
      ) : null}
    </div>
  );
}

export default CampaignPlayersTab;
