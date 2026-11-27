import { Maximize, Minimize, Shield, Swords } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { CampaignLiveEncounterTrackerRecord } from "../../api/campaigns";
import { getPartyGroupLiveEncounter } from "../../api/partyGroups";
import { usePartyEvents } from "../../lib/useCampaignEvents";
import { useAppSelector } from "../../store";
import { getDmToolsApiErrorMessage } from "../DmToolsPage/dmToolsApiErrors";
import { normalizeLiveEncounterTracker } from "../DmToolsPage/liveEncounterTrackerUtils";
import { getHitPointTone, toTableDisplayCards, type TableDisplayCard } from "./tableDisplayModel";
import styles from "./TableDisplayPage.module.css";

function DamageTags({ label, values, tone }: { label: string; tone: string; values: string[] }) {
  if (values.length === 0) {
    return null;
  }

  return (
    <div className={styles.tagRow}>
      <span className={styles.tagLabel}>{label}</span>
      {values.map((value) => (
        <span key={value} className={styles.tag} data-tone={tone}>
          {value}
        </span>
      ))}
    </div>
  );
}

function CombatantCard({ card }: { card: TableDisplayCard }) {
  const hasHitPoints = card.currentHitPoints !== null && card.maxHitPoints !== null;
  const ratio = hasHitPoints
    ? Math.min(1, Math.max(0, (card.currentHitPoints ?? 0) / Math.max(1, card.maxHitPoints ?? 1)))
    : 0;
  const isDown = hasHitPoints && (card.currentHitPoints ?? 0) <= 0;

  return (
    <li
      className={styles.card}
      data-side={card.isAlly ? "player" : "monster"}
      data-pack={card.packPosition === "single" ? undefined : card.packPosition}
      data-active={card.isActive || undefined}
      data-down={isDown || undefined}
      aria-current={card.isActive ? "true" : undefined}
    >
      <div className={styles.portrait}>
        {card.imageUrl ? (
          <img src={card.imageUrl} alt="" className={styles.portraitImage} />
        ) : (
          <span className={styles.portraitFallback} aria-hidden="true">
            {card.isAlly ? <Shield size={42} /> : <Swords size={42} />}
          </span>
        )}
        <span className={styles.orderBadge} aria-label={`Turn order ${card.order}`}>
          {card.order}
        </span>
      </div>

      <div className={styles.chips}>
        {card.initiative !== null ? (
          <span className={styles.chip}>
            <span className={styles.chipLabel}>Init</span>
            {card.initiative}
          </span>
        ) : null}
        {card.ac !== null ? (
          <span className={styles.chip}>
            <span className={styles.chipLabel}>AC</span>
            {card.ac}
          </span>
        ) : null}
        {card.passivePerception !== null ? (
          <span className={styles.chip}>
            <span className={styles.chipLabel}>PP</span>
            {card.passivePerception}
          </span>
        ) : null}
      </div>

      <h3 className={styles.name}>{card.name}</h3>
      {card.subtitle ? <p className={styles.subtitle}>{card.subtitle}</p> : null}

      <div className={styles.vitals}>
        {hasHitPoints ? (
          <>
            <p className={styles.hitPoints}>
              {isDown ? "Down" : `${card.currentHitPoints} / ${card.maxHitPoints} HP`}
              {card.temporaryHitPoints > 0 ? (
                <span
                  className={styles.temporaryHitPoints}
                >{` +${card.temporaryHitPoints} THP`}</span>
              ) : null}
            </p>
            <div className={styles.hitPointTrack} aria-hidden="true">
              <span
                className={styles.hitPointFill}
                data-tone={getHitPointTone(card.currentHitPoints ?? 0, card.maxHitPoints ?? 1)}
                style={{ width: `${ratio * 100}%` }}
              />
            </div>
          </>
        ) : card.vitalityLabel ? (
          <p className={styles.hitPoints}>{card.vitalityLabel}</p>
        ) : null}
      </div>

      <div className={styles.tags}>
        <DamageTags label="Resist" tone="resist" values={card.resistances} />
        <DamageTags label="Immune" tone="immune" values={card.immunities} />
        <DamageTags label="Vulnerable" tone="vulnerable" values={card.vulnerabilities} />
      </div>
    </li>
  );
}

/**
 * Full-screen, read-only view of the live encounter for a projector or a player's second screen.
 * It shows exactly what players are allowed to see and updates live over SSE.
 */
function TableDisplayPage() {
  const { partyGroupId = "" } = useParams();
  const authStatus = useAppSelector((state) => state.auth.status);
  const [tracker, setTracker] = useState<CampaignLiveEncounterTrackerRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const refresh = useCallback(() => {
    if (!partyGroupId) {
      return;
    }

    getPartyGroupLiveEncounter(partyGroupId, { suppressFailureToast: true })
      .then(({ liveEncounterTracker }) => {
        setTracker(
          liveEncounterTracker ? normalizeLiveEncounterTracker(liveEncounterTracker) : null
        );
        setError(null);
        setHasLoaded(true);
      })
      .catch((loadError) => {
        setError(getDmToolsApiErrorMessage(loadError, "Unable to load the encounter."));
        setHasLoaded(true);
      });
  }, [partyGroupId]);

  useEffect(() => {
    if (authStatus === "authenticated") {
      refresh();
    }
  }, [authStatus, refresh]);
  usePartyEvents(authStatus === "authenticated" ? partyGroupId : null, refresh);

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));

    document.addEventListener("fullscreenchange", onChange);

    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void document.documentElement.requestFullscreen?.();
    }
  }

  const validTracker = tracker?.status.state === "valid" ? tracker : null;
  const cards = validTracker ? toTableDisplayCards(validTracker) : [];
  const activeCard = cards.find((card) => card.isActive);

  return (
    <main className={styles.screen}>
      <header className={styles.header}>
        <h1 className={styles.title}>{validTracker?.preparedEncounterName ?? "Table View"}</h1>
        <div className={styles.headerRight}>
          <div className={styles.controls}>
            <button type="button" className={styles.controlButton} onClick={toggleFullscreen}>
              {isFullscreen ? (
                <Minimize size={16} aria-hidden="true" />
              ) : (
                <Maximize size={16} aria-hidden="true" />
              )}
              <span>{isFullscreen ? "Exit full screen" : "Full screen"}</span>
            </button>
            <Link className={styles.controlButton} to="/">
              Leave table view
            </Link>
          </div>
          {validTracker ? (
            <div className={styles.roundPlaque}>
              <span className={styles.roundLabel}>Current round</span>
              <span className={styles.roundNumber}>{validTracker.roundNumber}</span>
            </div>
          ) : null}
        </div>
      </header>

      <p className={styles.srOnly} role="status" aria-live="polite">
        {validTracker && activeCard
          ? `Round ${validTracker.roundNumber}. ${activeCard.name}'s turn.`
          : ""}
      </p>

      {authStatus === "guest" ? (
        <p className={styles.message}>Sign in to view this table.</p>
      ) : error ? (
        <p className={styles.message}>{error}</p>
      ) : !hasLoaded ? (
        <p className={styles.message}>Gathering the party…</p>
      ) : !validTracker ? (
        <p className={styles.message}>
          No encounter in progress. This screen updates the moment combat begins.
        </p>
      ) : cards.length === 0 ? (
        <p className={styles.message}>Waiting for initiative…</p>
      ) : (
        <ol className={styles.cards} aria-label="Initiative order">
          {cards.map((card) => (
            <CombatantCard key={card.id} card={card} />
          ))}
        </ol>
      )}
    </main>
  );
}

export default TableDisplayPage;
