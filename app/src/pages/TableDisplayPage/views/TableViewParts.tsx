import { Shield, Swords } from "lucide-react";
import { useState } from "react";
import type { TableDisplayCard } from "../tableDisplayModel";
import { getCardTone, getHitPointRatio, hasHitPoints, isCardDown } from "./tableViewHelpers";
import styles from "./TableViewParts.module.css";

export function Portrait({ card, className }: { card: TableDisplayCard; className?: string }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const hasImage = Boolean(card.imageUrl) && failedUrl !== card.imageUrl;

  return (
    <span
      className={className ? `${styles.portrait} ${className}` : styles.portrait}
      data-side={card.isAlly ? "player" : "monster"}
    >
      {hasImage ? (
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
          {card.isAlly ? <Shield /> : <Swords />}
        </span>
      )}
    </span>
  );
}

export function HitPointBar({ card, className }: { card: TableDisplayCard; className?: string }) {
  if (!hasHitPoints(card)) {
    return null;
  }

  return (
    <span className={className ? `${styles.track} ${className}` : styles.track} aria-hidden="true">
      <span
        className={styles.fill}
        data-tone={getCardTone(card)}
        style={{ width: `${getHitPointRatio(card) * 100}%` }}
      />
    </span>
  );
}

/** Current hit points as a number the room can read, or the vitality word when numbers are hidden. */
export function HitPointReadout({ card }: { card: TableDisplayCard }) {
  if (hasHitPoints(card)) {
    return (
      <span className={styles.readout}>
        {isCardDown(card) ? (
          <span className={styles.readoutMain}>Down</span>
        ) : (
          <>
            <span className={styles.readoutMain}>{card.currentHitPoints}</span>
            <span className={styles.readoutMax}>{`/ ${card.maxHitPoints}`}</span>
          </>
        )}
        {card.temporaryHitPoints > 0 ? (
          <span className={styles.readoutTemp}>{`+${card.temporaryHitPoints}`}</span>
        ) : null}
      </span>
    );
  }

  return card.vitalityLabel ? (
    <span className={styles.readout}>
      <span className={styles.readoutWord}>{card.vitalityLabel}</span>
    </span>
  ) : null;
}

const TAG_GROUPS = [
  { key: "resistances", label: "Resist", tone: "resist" },
  { key: "immunities", label: "Immune", tone: "immune" },
  { key: "conditionImmunities", label: "Status immune", tone: "condition" },
  { key: "vulnerabilities", label: "Vulnerable", tone: "vulnerable" }
] as const;

/** Revealed resistances, immunities and vulnerabilities; renders nothing when there are none. */
export function DefenseTags({ card, className }: { card: TableDisplayCard; className?: string }) {
  const groups = TAG_GROUPS.filter(({ key }) => card[key].length > 0);

  if (groups.length === 0) {
    return null;
  }

  return (
    <div className={className ? `${styles.tags} ${className}` : styles.tags}>
      {groups.map(({ key, label, tone }) => (
        <span key={key} className={styles.tagGroup} data-tone={tone}>
          <span className={styles.tagLabel}>{label}</span>
          <span className={styles.tagValues}>{card[key].join(" · ")}</span>
        </span>
      ))}
    </div>
  );
}

export function StatChip({ label, value }: { label: string; value: number | null }) {
  if (value === null) {
    return null;
  }

  return (
    <span className={styles.stat}>
      <span className={styles.statLabel}>{label}</span>
      <span className={styles.statValue}>{value}</span>
    </span>
  );
}
