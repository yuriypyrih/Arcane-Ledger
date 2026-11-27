import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Play,
  Plus,
  Square,
  Swords,
  Tv,
  X
} from "lucide-react";
import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  cancelGameSession,
  createGameSession,
  endGameSession,
  listGameSessions,
  startGameSession,
  type GameSessionRecord
} from "../../api/gameSessions";
import { useHref, useNavigate } from "react-router-dom";
import {
  startCampaignLiveEncounterTracker,
  type CampaignPreparedEncounterRecord
} from "../../api/campaigns";
import ActionButton from "../../components/ActionButton";
import { patchSelectedCampaign, useAppDispatch } from "../../store";
import { useCampaignEvents } from "../../lib/useCampaignEvents";
import CampaignSessionDetailsEditor from "./CampaignSessionDetailsEditor";
import {
  openLiveEncounterTrackerWindow,
  openTableDisplayWindow
} from "./liveEncounterTrackerWindow";
import { getDmToolsApiErrorMessage } from "./dmToolsApiErrors";
import DmToolsEmptyState from "./DmToolsEmptyState";
import dmStyles from "./DmToolsPage.module.css";
import styles from "./CampaignSessionsSection.module.css";

type CampaignSessionsSectionProps = {
  campaignId: string;
  className?: string;
  hasLiveEncounter: boolean;
  partyGroupId: string | null;
  preparedEncounters: CampaignPreparedEncounterRecord[];
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function toDayKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function formatSessionDate(value: string | null) {
  return value
    ? new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })
    : "Unscheduled";
}

function countAvailability(session: GameSessionRecord) {
  return {
    yes: session.availability.filter((entry) => entry.state === "yes").length,
    maybe: session.availability.filter((entry) => entry.state === "maybe").length,
    no: session.availability.filter((entry) => entry.state === "no").length
  };
}

function CampaignSessionsSection({
  campaignId,
  className,
  hasLiveEncounter,
  partyGroupId,
  preparedEncounters
}: CampaignSessionsSectionProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const tableDisplayHref = useHref(`/table/${partyGroupId ?? ""}`);
  const trackerHref = useHref(`/gm-tools/campaign-manager/${campaignId}/live-encounter`);
  const [sessions, setSessions] = useState<GameSessionRecord[]>([]);
  const [month, setMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [title, setTitle] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    listGameSessions(campaignId, { suppressFailureToast: true })
      .then(({ gameSessions }) => setSessions(gameSessions))
      .catch((loadError) =>
        setError(getDmToolsApiErrorMessage(loadError, "Unable to load sessions."))
      );
  }, [campaignId]);

  useEffect(refresh, [refresh]);
  useCampaignEvents([campaignId], refresh);

  const sessionsByDay = useMemo(() => {
    const byDay = new Map<string, GameSessionRecord[]>();

    sessions.forEach((session) => {
      if (session.scheduledAt && session.status !== "cancelled") {
        const key = toDayKey(new Date(session.scheduledAt));
        byDay.set(key, [...(byDay.get(key) ?? []), session]);
      }
    });

    return byDay;
  }, [sessions]);

  const calendarCells = useMemo(() => {
    const leadingBlanks = (month.getDay() + 6) % 7;
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();

    return [
      ...Array.from({ length: leadingBlanks }, () => null),
      ...Array.from(
        { length: daysInMonth },
        (_, index) => new Date(month.getFullYear(), month.getMonth(), index + 1)
      )
    ];
  }, [month]);

  async function runAction(sessionId: string, action: () => Promise<unknown>, fallback: string) {
    setBusyId(sessionId);
    setError(null);

    try {
      await action();
      refresh();
    } catch (actionError) {
      setError(getDmToolsApiErrorMessage(actionError, fallback));
    } finally {
      setBusyId(null);
    }
  }

  async function handleStartCombat(sessionId: string, preparedEncounterId: string) {
    setBusyId(sessionId);
    setError(null);

    try {
      const campaignPatch = await startCampaignLiveEncounterTracker(
        campaignId,
        preparedEncounterId,
        {
          suppressFailureToast: true
        }
      );

      dispatch(patchSelectedCampaign(campaignPatch));
      navigate(`/gm-tools/campaign-manager/${campaignId}/live-encounter`);
    } catch (combatError) {
      setError(getDmToolsApiErrorMessage(combatError, "Unable to start combat."));
    } finally {
      setBusyId(null);
    }
  }

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setIsCreating(true);
    setError(null);

    try {
      await createGameSession(
        campaignId,
        { title, scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null },
        { suppressFailureToast: true }
      );
      setTitle("");
      setScheduledAt("");
      refresh();
    } catch (createError) {
      setError(getDmToolsApiErrorMessage(createError, "Unable to create session."));
    } finally {
      setIsCreating(false);
    }
  }

  const visibleSessions = sessions.filter((session) => session.status !== "cancelled");

  return (
    <section
      className={[dmStyles.membersPanel, className].filter(Boolean).join(" ")}
      aria-labelledby="campaign-sessions-title"
    >
      <div className={dmStyles.memberPanelHeader}>
        <h3 id="campaign-sessions-title" className={dmStyles.bodyTitle}>
          Game Sessions
        </h3>
      </div>

      {error ? <p className={dmStyles.modalError}>{error}</p> : null}

      <form className={styles.createForm} onSubmit={(event) => void handleCreate(event)}>
        <input
          className={styles.input}
          aria-label="Session title"
          placeholder="Session title"
          value={title}
          minLength={2}
          maxLength={128}
          required
          onChange={(event) => setTitle(event.target.value)}
        />
        <input
          className={styles.input}
          aria-label="Session date and time"
          type="datetime-local"
          value={scheduledAt}
          onChange={(event) => setScheduledAt(event.target.value)}
        />
        <ActionButton
          type="submit"
          icon={<Plus size={16} aria-hidden="true" />}
          fullWidth={false}
          size="sm"
          loading={isCreating}
        >
          Schedule
        </ActionButton>
      </form>

      <div className={styles.calendar} aria-label="Session calendar">
        <div className={styles.calendarHeader}>
          <button
            type="button"
            className={styles.navButton}
            aria-label="Previous month"
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
          <strong>{month.toLocaleString([], { month: "long", year: "numeric" })}</strong>
          <button
            type="button"
            className={styles.navButton}
            aria-label="Next month"
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
        <div className={styles.calendarGrid}>
          {WEEKDAYS.map((weekday) => (
            <span key={weekday} className={styles.weekday}>
              {weekday}
            </span>
          ))}
          {calendarCells.map((date, index) => {
            const daySessions = date ? (sessionsByDay.get(toDayKey(date)) ?? []) : [];

            return (
              <span
                key={date ? toDayKey(date) : `blank-${index}`}
                className={
                  daySessions.length > 0 ? `${styles.day} ${styles.dayWithSession}` : styles.day
                }
                title={daySessions.map((session) => session.title).join(", ") || undefined}
              >
                {date?.getDate()}
              </span>
            );
          })}
        </div>
      </div>

      {visibleSessions.length > 0 ? (
        <ul className={styles.sessionList}>
          {visibleSessions.map((session) => {
            const counts = countAvailability(session);
            const isBusy = busyId === session.id;

            return (
              <li key={session.id} className={styles.sessionItem}>
                <div>
                  <strong>{session.title}</strong>
                  <span className={styles.status} data-status={session.status}>
                    {session.status}
                  </span>
                  <p className={styles.meta}>
                    {formatSessionDate(session.scheduledAt)}
                    {session.status === "planned"
                      ? ` · ${counts.yes} yes · ${counts.maybe} maybe · ${counts.no} no`
                      : null}
                  </p>
                </div>
                <div className={styles.actions}>
                  {session.status === "planned" ? (
                    <>
                      <ActionButton
                        actionType="SUCCESS"
                        icon={<Play size={16} aria-hidden="true" />}
                        fullWidth={false}
                        size="sm"
                        disabled={isBusy}
                        onClick={() =>
                          void runAction(
                            session.id,
                            () => startGameSession(session.id, { suppressFailureToast: true }),
                            "Unable to start session."
                          )
                        }
                      >
                        Start
                      </ActionButton>
                      <ActionButton
                        actionType="ERROR"
                        variant="OUTLINE"
                        icon={<X size={16} aria-hidden="true" />}
                        fullWidth={false}
                        size="sm"
                        disabled={isBusy}
                        onClick={() =>
                          void runAction(
                            session.id,
                            () => cancelGameSession(session.id, { suppressFailureToast: true }),
                            "Unable to cancel session."
                          )
                        }
                      >
                        Cancel
                      </ActionButton>
                    </>
                  ) : null}
                  {session.status === "live" ? (
                    <>
                      {hasLiveEncounter ? (
                        <>
                          <ActionButton
                            actionType="SUCCESS"
                            icon={<Swords size={16} aria-hidden="true" />}
                            fullWidth={false}
                            size="sm"
                            onClick={() =>
                              navigate(`/gm-tools/campaign-manager/${campaignId}/live-encounter`)
                            }
                          >
                            Open combat
                          </ActionButton>
                          <ActionButton
                            variant="OUTLINE"
                            icon={<ExternalLink size={16} aria-hidden="true" />}
                            fullWidth={false}
                            size="sm"
                            onClick={() => openLiveEncounterTrackerWindow(trackerHref)}
                          >
                            Pop out
                          </ActionButton>
                          <ActionButton
                            variant="OUTLINE"
                            icon={<Tv size={16} aria-hidden="true" />}
                            fullWidth={false}
                            size="sm"
                            disabled={!partyGroupId}
                            onClick={() => openTableDisplayWindow(tableDisplayHref)}
                          >
                            Table view
                          </ActionButton>
                        </>
                      ) : (
                        (session.linkedPreparedEncounterIds.length > 0
                          ? preparedEncounters.filter((encounter) =>
                              session.linkedPreparedEncounterIds.includes(encounter.id)
                            )
                          : preparedEncounters
                        ).map((encounter) => (
                          <ActionButton
                            key={encounter.id}
                            icon={<Swords size={16} aria-hidden="true" />}
                            fullWidth={false}
                            size="sm"
                            disabled={isBusy}
                            onClick={() => void handleStartCombat(session.id, encounter.id)}
                          >
                            {`Start combat: ${encounter.name}`}
                          </ActionButton>
                        ))
                      )}
                      <ActionButton
                        actionType="WARNING"
                        icon={<Square size={16} aria-hidden="true" />}
                        fullWidth={false}
                        size="sm"
                        disabled={isBusy}
                        onClick={() =>
                          void runAction(
                            session.id,
                            async () => {
                              await endGameSession(session.id, { suppressFailureToast: true });
                              // The server closes the combat hosted by this session.
                              dispatch(
                                patchSelectedCampaign({
                                  campaignId,
                                  patch: { liveEncounterTracker: null }
                                })
                              );
                            },
                            "Unable to end session."
                          )
                        }
                      >
                        End session
                      </ActionButton>
                    </>
                  ) : null}
                </div>
                <CampaignSessionDetailsEditor
                  key={`${session.id}-${session.revision}`}
                  preparedEncounters={preparedEncounters}
                  session={session}
                  onSaved={refresh}
                />
              </li>
            );
          })}
        </ul>
      ) : (
        <DmToolsEmptyState icon={<CalendarDays size={18} aria-hidden="true" />}>
          No sessions scheduled yet.
        </DmToolsEmptyState>
      )}
    </section>
  );
}

export default CampaignSessionsSection;
