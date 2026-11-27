import { CalendarDays, Eye, EyeOff } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listCampaigns } from "../../api/campaigns";
import {
  listAllMyGameSessions,
  listGameSessions,
  setGameSessionAvailability,
  setGameSessionHidden,
  type GameSessionAvailabilityState
} from "../../api/gameSessions";
import ActionButton from "../../components/ActionButton";
import { useCampaignEvents } from "../../lib/useCampaignEvents";
import { useAppSelector } from "../../store";
import SessionListRow from "./SessionListRow";
import SessionLogModal from "./SessionLogModal";
import { SESSION_GROUPS, groupSessions, type SessionRow } from "./sessionGroups";
import styles from "./SessionsPage.module.css";

const SHOW_HIDDEN_KEY = "arcane-ledger.sessions-show-hidden";

function readShowHidden() {
  try {
    return window.localStorage.getItem(SHOW_HIDDEN_KEY) === "true";
  } catch {
    return false;
  }
}

function storeShowHidden(value: boolean) {
  try {
    window.localStorage.setItem(SHOW_HIDDEN_KEY, String(value));
  } catch {
    // The choice then lasts only for this visit.
  }
}

/** Every session the user plays in or runs, grouped into today, upcoming and past. */
function SessionsPage() {
  const navigate = useNavigate();
  const userId = useAppSelector((state) => state.auth.user?.id ?? null);
  const [rows, setRows] = useState<SessionRow[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHidden, setShowHidden] = useState(readShowHidden);
  const [logTarget, setLogTarget] = useState<SessionRow | null>(null);

  const refresh = useCallback(() => {
    if (!userId) {
      return;
    }

    const asPlayer = listAllMyGameSessions({ suppressFailureToast: true }).then(
      ({ gameSessions }): SessionRow[] =>
        gameSessions.map((session) => ({
          availability: session.availability,
          campaignId: session.campaignId,
          campaignImageUrl: session.campaignImageUrl,
          campaignName: session.campaignName,
          characterClientId: session.characterClientId,
          durationMinutes: session.durationMinutes,
          hidden: session.hidden,
          id: session.id,
          rescheduleProposal: session.rescheduleProposal,
          role: "player",
          scheduledAt: session.scheduledAt,
          status: session.status,
          title: session.title
        }))
    );
    const asGm = listCampaigns({ suppressFailureToast: true }).then(async ({ campaigns }) =>
      (
        await Promise.all(
          campaigns.map(async (campaign): Promise<SessionRow[]> => {
            const { gameSessions } = await listGameSessions(campaign.id, {
              suppressFailureToast: true
            }).catch(() => ({ gameSessions: [] }));

            return gameSessions.map((session) => ({
              availability: session.availability,
              campaignId: campaign.id,
              campaignImageUrl: campaign.imageUrl ?? "",
              campaignName: campaign.name,
              characterClientId: null,
              durationMinutes: session.durationMinutes,
              hidden: false,
              id: session.id,
              rescheduleProposal: session.rescheduleProposal,
              role: "gm",
              scheduledAt: session.scheduledAt,
              status: session.status,
              title: session.title
            }));
          })
        )
      ).flat()
    );

    // Either side may fail on its own (for example, no campaigns of your own); show what loaded.
    Promise.allSettled([asPlayer, asGm]).then(([player, gm]) => {
      const loaded = [player, gm].flatMap((result) =>
        result.status === "fulfilled" ? result.value : []
      );

      setRows(loaded);
      setError(
        player.status === "rejected" && gm.status === "rejected"
          ? "Unable to load your sessions."
          : null
      );
      setHasLoaded(true);
    });
  }, [userId]);

  useEffect(refresh, [refresh]);
  useCampaignEvents([...new Set(rows.map((row) => row.campaignId))], refresh);

  const hiddenCount = rows.filter((row) => row.hidden).length;
  const visibleRows = useMemo(
    () => (showHidden ? rows : rows.filter((row) => !row.hidden)),
    [rows, showHidden]
  );
  const groups = useMemo(() => groupSessions(visibleRows), [visibleRows]);

  function handleToggleShowHidden() {
    setShowHidden((current) => {
      storeShowHidden(!current);

      return !current;
    });
  }

  async function handleToggleHidden(row: SessionRow) {
    const next = !row.hidden;

    // Update the list straight away; a failed save puts the server's truth back.
    setRows((current) =>
      current.map((entry) =>
        entry.id === row.id && entry.role === "player" ? { ...entry, hidden: next } : entry
      )
    );

    try {
      await setGameSessionHidden(row.id, next, { suppressFailureToast: true });
    } catch {
      refresh();
    }
  }

  async function handleVote(row: SessionRow, state: GameSessionAvailabilityState) {
    try {
      await setGameSessionAvailability(row.id, state, { suppressFailureToast: true });
    } finally {
      refresh();
    }
  }

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Your table</p>
          <h1 className={styles.title}>
            <CalendarDays size={26} aria-hidden="true" />
            <span>Sessions</span>
          </h1>
        </div>
        {hiddenCount > 0 || showHidden ? (
          <ActionButton
            variant="OUTLINE"
            fullWidth={false}
            size="sm"
            role="switch"
            aria-checked={showHidden}
            icon={
              showHidden ? (
                <Eye size={16} aria-hidden="true" />
              ) : (
                <EyeOff size={16} aria-hidden="true" />
              )
            }
            onClick={handleToggleShowHidden}
          >
            {showHidden ? "Hide hidden sessions" : `Show hidden (${hiddenCount})`}
          </ActionButton>
        ) : null}
      </header>

      {error ? <p className={styles.error}>{error}</p> : null}
      {!hasLoaded ? <p className={styles.muted}>Gathering your sessions…</p> : null}

      {hasLoaded
        ? SESSION_GROUPS.map((group) => {
            const groupRows = groups[group.key];

            return (
              <section
                key={group.key}
                className={styles.group}
                aria-labelledby={`sessions-${group.key}`}
              >
                <div className={styles.groupHeader}>
                  <h2 id={`sessions-${group.key}`} className={styles.groupTitle}>
                    {group.title}
                  </h2>
                  <span className={styles.count}>{groupRows.length}</span>
                  <p className={styles.groupDescription}>{group.description}</p>
                </div>
                {groupRows.length > 0 ? (
                  <ul className={styles.list}>
                    {groupRows.map((row) => (
                      <SessionListRow
                        key={`${row.role}-${row.id}`}
                        row={row}
                        myVote={row.availability.find((entry) => entry.userId === userId)?.state}
                        onJoin={(target) => navigate(`/characters/${target.characterClientId}`)}
                        onOpenCampaign={(target) =>
                          navigate(`/gm-tools/campaign-manager/${target.campaignId}`)
                        }
                        onReadLog={setLogTarget}
                        onToggleHidden={(target) => void handleToggleHidden(target)}
                        onVote={(target, state) => void handleVote(target, state)}
                      />
                    ))}
                  </ul>
                ) : (
                  <p className={styles.empty}>Nothing here.</p>
                )}
              </section>
            );
          })
        : null}

      {logTarget ? (
        <SessionLogModal
          sessionId={logTarget.id}
          sessionTitle={logTarget.title}
          onClose={() => setLogTarget(null)}
        />
      ) : null}
    </section>
  );
}

export default SessionsPage;
