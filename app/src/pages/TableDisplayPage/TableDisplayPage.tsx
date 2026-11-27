import { Maximize, Minimize, Shield, Swords } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import type { CampaignLiveEncounterTrackerRecord } from "../../api/campaigns";
import { getPartyGroupLiveEncounter } from "../../api/partyGroups";
import { usePartyEvents } from "../../lib/useCampaignEvents";
import { AppHeader } from "../../components/AppShell";
import {
  applyThemeModePreferenceToDocument,
  getThemeModePreference,
  updateThemeModePreference,
  type ThemeModePreference
} from "../../storage/preferences";
import { useAppSelector } from "../../store";
import { getDmToolsApiErrorMessage } from "../DmToolsPage/dmToolsApiErrors";
import { normalizeLiveEncounterTracker } from "../DmToolsPage/liveEncounterTrackerUtils";
import { getHitPointTone, toTableDisplayCards, type TableDisplayCard } from "./tableDisplayModel";
import styles from "./TableDisplayPage.module.css";
import ArcaneCircleView from "./views/ArcaneCircleView";
import BattleLineView from "./views/BattleLineView";
import SpotlightView from "./views/SpotlightView";
import TwoSidesView from "./views/TwoSidesView";
import {
  TABLE_VIEW_OPTIONS,
  parseTableViewMode,
  readStoredTableViewMode,
  storeTableViewMode,
  type TableViewMode
} from "./views/tableViewMode";

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

function CardPortrait({ card }: { card: TableDisplayCard }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const hasImage = Boolean(card.imageUrl) && failedUrl !== card.imageUrl;

  return hasImage ? (
    // no-referrer: some image hosts refuse hotlinking, and the link should not reveal this page.
    <img
      src={card.imageUrl ?? undefined}
      alt=""
      className={styles.portraitImage}
      referrerPolicy="no-referrer"
      onError={() => setFailedUrl(card.imageUrl)}
    />
  ) : (
    <span className={styles.portraitFallback} aria-hidden="true">
      {card.isAlly ? <Shield size={42} /> : <Swords size={42} />}
    </span>
  );
}

function CombatantCard({ card, compact = false }: { card: TableDisplayCard; compact?: boolean }) {
  const hasHitPoints = card.currentHitPoints !== null && card.maxHitPoints !== null;
  const ratio = hasHitPoints
    ? Math.min(1, Math.max(0, (card.currentHitPoints ?? 0) / Math.max(1, card.maxHitPoints ?? 1)))
    : 0;
  const isDown = hasHitPoints && (card.currentHitPoints ?? 0) <= 0;

  return (
    <li
      className={styles.card}
      data-side={card.isAlly ? "player" : "monster"}
      data-compact={compact || undefined}
      data-active={(!compact && card.isActive) || undefined}
      data-down={isDown || undefined}
      aria-current={!compact && card.isActive ? "true" : undefined}
    >
      <div className={styles.portrait}>
        <CardPortrait card={card} />
        {compact ? null : (
          <span className={styles.orderBadge} aria-label={`Turn order ${card.order}`}>
            {card.order}
          </span>
        )}
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
        <DamageTags label="Status immune" tone="condition" values={card.conditionImmunities} />
        <DamageTags label="Vulnerable" tone="vulnerable" values={card.vulnerabilities} />
      </div>
    </li>
  );
}

type TurnSlot =
  | { card: TableDisplayCard; type: "single" }
  | { cards: TableDisplayCard[]; type: "pack" };

/** Creatures that share a turn become one slot, so a pack can be drawn as a single box. */
function toTurnSlots(cards: TableDisplayCard[]): TurnSlot[] {
  const slots: TurnSlot[] = [];

  cards.forEach((card) => {
    const lastSlot = slots.at(-1);

    if (card.packPosition === "single") {
      slots.push({ card, type: "single" });
    } else if (card.packPosition === "first" || lastSlot?.type !== "pack") {
      slots.push({ cards: [card], type: "pack" });
    } else {
      lastSlot.cards.push(card);
    }
  });

  return slots;
}

function getPackTitle(cards: TableDisplayCard[]) {
  const names = new Set(cards.map((card) => card.name));

  return names.size === 1 ? `${cards[0]?.name} pack` : `Pack of ${cards.length}`;
}

function PackBox({ cards }: { cards: TableDisplayCard[] }) {
  const first = cards[0]!;
  const isDown = cards.every(
    (card) => card.currentHitPoints !== null && (card.currentHitPoints ?? 0) <= 0
  );

  return (
    <li
      className={styles.pack}
      data-side={first.isAlly ? "player" : "monster"}
      data-active={first.isActive || undefined}
      data-down={isDown || undefined}
      aria-current={first.isActive ? "true" : undefined}
    >
      <div className={styles.packHeader}>
        <span className={styles.orderBadgeStatic} aria-label={`Turn order ${first.order}`}>
          {first.order}
        </span>
        <h3 className={styles.packTitle}>{getPackTitle(cards)}</h3>
        <span className={styles.packCount}>×{cards.length}</span>
        {first.initiative !== null ? (
          <span className={styles.chip}>
            <span className={styles.chipLabel}>Init</span>
            {first.initiative}
          </span>
        ) : null}
      </div>
      <ul className={styles.packMembers}>
        {cards.map((card) => (
          <CombatantCard key={card.id} card={card} compact />
        ))}
      </ul>
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
  const [themeMode, setThemeMode] = useState<ThemeModePreference>(() => getThemeModePreference());
  const [searchParams, setSearchParams] = useSearchParams();
  // The link wins (a shared or popped-out window), then this device's last pick, then the classic grid.
  const viewMode: TableViewMode =
    parseTableViewMode(searchParams.get("view")) ?? readStoredTableViewMode() ?? "classic";

  function toggleThemeMode() {
    const nextThemeMode: ThemeModePreference = themeMode === "dark" ? "light" : "dark";

    setThemeMode(nextThemeMode);
    updateThemeModePreference(nextThemeMode);
    applyThemeModePreferenceToDocument(nextThemeMode);
  }

  function selectViewMode(mode: TableViewMode) {
    storeTableViewMode(mode);
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);

        next.set("view", mode);

        return next;
      },
      { replace: true }
    );
  }

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
    <div className={styles.frame} data-fit={viewMode !== "classic" || undefined}>
      {/* Browser full screen is for the projector, so the app bar steps aside there. */}
      {isFullscreen ? null : (
        <AppHeader flush themeMode={themeMode} onToggleThemeMode={toggleThemeMode} />
      )}
      <main className={styles.screen} data-fit={viewMode !== "classic" || undefined}>
        <header className={styles.header}>
          <h1 className={styles.title}>{validTracker?.preparedEncounterName ?? "Table View"}</h1>
          <div className={styles.headerRight}>
            <div className={styles.controls}>
              <div className={styles.viewSwitch} role="group" aria-label="Table layout">
                {TABLE_VIEW_OPTIONS.map((option) => (
                  <button
                    key={option.mode}
                    type="button"
                    className={styles.viewButton}
                    aria-pressed={viewMode === option.mode}
                    title={option.description}
                    onClick={() => selectViewMode(option.mode)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
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
        ) : viewMode === "1" ? (
          <SpotlightView cards={cards} roundNumber={validTracker.roundNumber} />
        ) : viewMode === "2" ? (
          <TwoSidesView cards={cards} roundNumber={validTracker.roundNumber} />
        ) : viewMode === "3" ? (
          <ArcaneCircleView cards={cards} roundNumber={validTracker.roundNumber} />
        ) : viewMode === "4" ? (
          <BattleLineView cards={cards} roundNumber={validTracker.roundNumber} />
        ) : (
          <ol className={styles.cards} aria-label="Initiative order">
            {toTurnSlots(cards).map((slot) =>
              slot.type === "single" ? (
                <CombatantCard key={slot.card.id} card={slot.card} />
              ) : (
                <PackBox key={slot.cards.map((card) => card.id).join("+")} cards={slot.cards} />
              )
            )}
          </ol>
        )}
      </main>
    </div>
  );
}

export default TableDisplayPage;
