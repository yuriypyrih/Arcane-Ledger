import clsx from "clsx";
import { Skull } from "lucide-react";
import type { DeathSaveTrackState } from "../../../../../pages/CharactersPage/deathSaves";
import styles from "./DeathSavesWidget.module.css";

type DeathSavesIndicatorContentProps = {
  deathSaves: DeathSaveTrackState;
  showLabel?: boolean;
  title?: string;
};

type DeathSavesReadOnlyIndicatorProps = DeathSavesIndicatorContentProps & {
  className?: string;
  variant?: "pill" | "inline";
};

type DeathSaveTrack = "success" | "failure";

type DeathSaveDotsProps = {
  deathSaves: DeathSaveTrackState;
  track: DeathSaveTrack;
};

export function DeathSaveDots({ deathSaves, track }: DeathSaveDotsProps) {
  const current = track === "success" ? deathSaves.successes : deathSaves.failures;
  const dotClassName = track === "success" ? styles.dotSuccess : styles.dotFailure;

  return (
    <span className={styles.dotsRow} aria-hidden="true">
      {Array.from({ length: 3 }, (_, index) => (
        <span
          key={`${track}-${index}`}
          className={clsx(styles.dot, dotClassName, index < current && styles.dotActive)}
        />
      ))}
    </span>
  );
}

export function DeathSavesIndicatorContent({
  deathSaves,
  showLabel = true,
  title = "Death Saves"
}: DeathSavesIndicatorContentProps) {
  return (
    <>
      <Skull size={15} aria-hidden="true" />
      {showLabel ? <span className={styles.triggerLabel}>{title}</span> : null}
      <span className={styles.triggerDots}>
        <DeathSaveDots deathSaves={deathSaves} track="success" />
        <span className={styles.dotDivider} aria-hidden="true">
          |
        </span>
        <DeathSaveDots deathSaves={deathSaves} track="failure" />
      </span>
    </>
  );
}

function formatDeathSavesAriaLabel(deathSaves: DeathSaveTrackState) {
  return `Death saves: ${deathSaves.successes} successes and ${deathSaves.failures} failures`;
}

export function DeathSavesReadOnlyIndicator({
  className,
  deathSaves,
  showLabel = true,
  title = "Death Saves",
  variant = "pill"
}: DeathSavesReadOnlyIndicatorProps) {
  return (
    <span
      className={clsx(
        styles.trigger,
        styles.triggerReadOnly,
        variant === "inline" && styles.triggerInline,
        className
      )}
      aria-label={formatDeathSavesAriaLabel(deathSaves)}
    >
      <DeathSavesIndicatorContent deathSaves={deathSaves} showLabel={showLabel} title={title} />
    </span>
  );
}
