import { CalendarDays } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listCampaigns, type CampaignRecord } from "../../api/campaigns";
import { listGameSessions, type GameSessionRecord } from "../../api/gameSessions";
import ActionButton from "../../components/ActionButton";
import PlayerSessionsList, { useUpcomingSessions } from "../../components/PlayerSessionsPanel";
import { useCampaignEvents } from "../../lib/useCampaignEvents";
import styles from "./SessionsPage.module.css";

type GmCampaignSessions = { campaign: CampaignRecord; sessions: GameSessionRecord[] };

function formatWhen(scheduledAt: string | null) {
  return scheduledAt
    ? new Date(scheduledAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })
    : "No time set";
}

/** Sessions for everyone: the ones you play in, and the ones you run as a GM. */
function SessionsPage() {
  const navigate = useNavigate();
  const { sessions: playerSessions, userId, vote } = useUpcomingSessions();
  const [gmCampaigns, setGmCampaigns] = useState<GmCampaignSessions[]>([]);

  const refreshGmSessions = useCallback(() => {
    listCampaigns({ suppressFailureToast: true })
      .then(async ({ campaigns }) =>
        Promise.all(
          campaigns.map(async (campaign) => ({
            campaign,
            sessions: (
              await listGameSessions(campaign.id, { suppressFailureToast: true }).catch(() => ({
                gameSessions: [] as GameSessionRecord[]
              }))
            ).gameSessions.filter(
              (session) => session.status === "planned" || session.status === "live"
            )
          }))
        )
      )
      .then(setGmCampaigns)
      .catch(() => undefined);
  }, []);

  useEffect(refreshGmSessions, [refreshGmSessions]);
  useCampaignEvents(
    gmCampaigns.map(({ campaign }) => campaign.id),
    refreshGmSessions
  );

  const gmWithSessions = gmCampaigns.filter(({ sessions }) => sessions.length > 0);

  return (
    <section className={styles.page}>
      <h2 className={styles.title}>
        <CalendarDays size={20} aria-hidden="true" />
        <span>Sessions</span>
      </h2>

      <section className={styles.section} aria-labelledby="sessions-playing">
        <h3 id="sessions-playing" className={styles.sectionTitle}>
          Playing in
        </h3>
        {playerSessions.length > 0 ? (
          <PlayerSessionsList sessions={playerSessions} userId={userId} onVote={vote} />
        ) : (
          <p className={styles.empty}>No upcoming sessions for your characters.</p>
        )}
      </section>

      <section className={styles.section} aria-labelledby="sessions-running">
        <h3 id="sessions-running" className={styles.sectionTitle}>
          Running as GM
        </h3>
        {gmWithSessions.length > 0 ? (
          gmWithSessions.map(({ campaign, sessions }) => (
            <div key={campaign.id} className={styles.campaign}>
              <strong>{campaign.name}</strong>
              {sessions.map((session) => (
                <div key={session.id} className={styles.row}>
                  <div>
                    <span>{session.title}</span>
                    <span className={styles.meta}>
                      {session.status === "live" ? "Live now" : formatWhen(session.scheduledAt)}
                    </span>
                  </div>
                  <ActionButton
                    variant="OUTLINE"
                    fullWidth={false}
                    size="sm"
                    onClick={() => navigate(`/gm-tools/campaign-manager/${campaign.id}`)}
                  >
                    Open campaign
                  </ActionButton>
                </div>
              ))}
            </div>
          ))
        ) : (
          <p className={styles.empty}>No planned or live sessions in your campaigns.</p>
        )}
      </section>
    </section>
  );
}

export default SessionsPage;
