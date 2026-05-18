import clsx from "clsx";
import { clampNumber } from "../../../../pages/CharactersPage/CharacterSheetPage/utils";
import {
  normalizeMagicTemporaryHitPoints,
  normalizeTemporaryHitPoints
} from "../GameplayForm/gameplayStateUtils";
import styles from "./HitPointControls.module.css";

type HitPointBarProps = {
  currentHitPoints: number;
  maxHitPoints: number;
  temporaryHitPoints: number;
  magicTemporaryHitPoints?: number;
  className?: string;
};

function HitPointBar({
  currentHitPoints,
  maxHitPoints,
  temporaryHitPoints,
  magicTemporaryHitPoints = 0,
  className
}: HitPointBarProps) {
  const normalizedMaxHitPoints = Math.max(1, Math.floor(maxHitPoints));
  const normalizedCurrentHitPoints = clampNumber(
    currentHitPoints,
    0,
    normalizedMaxHitPoints,
    currentHitPoints
  );
  const normalizedTemporaryHitPoints = normalizeTemporaryHitPoints(temporaryHitPoints);
  const normalizedMagicTemporaryHitPoints =
    normalizeMagicTemporaryHitPoints(magicTemporaryHitPoints);
  const totalDisplayedHitPoints =
    normalizedCurrentHitPoints + normalizedTemporaryHitPoints + normalizedMagicTemporaryHitPoints;
  const barMaximumHitPoints = Math.max(normalizedMaxHitPoints, totalDisplayedHitPoints);
  const currentHitPointPercent =
    barMaximumHitPoints > 0 ? (normalizedCurrentHitPoints / barMaximumHitPoints) * 100 : 0;
  const visibleTemporaryHitPointPercent =
    barMaximumHitPoints > 0 ? (normalizedTemporaryHitPoints / barMaximumHitPoints) * 100 : 0;
  const visibleMagicTemporaryHitPointPercent =
    barMaximumHitPoints > 0 ? (normalizedMagicTemporaryHitPoints / barMaximumHitPoints) * 100 : 0;

  return (
    <div className={clsx(styles.barTrack, className)}>
      <div className={styles.barMeter}>
        <div
          className={styles.barFill}
          style={{ width: `${Math.max(0, currentHitPointPercent)}%` }}
        />
        {visibleTemporaryHitPointPercent > 0 ? (
          <div
            className={styles.barTempFill}
            style={{
              left: `${Math.max(0, currentHitPointPercent)}%`,
              width: `${visibleTemporaryHitPointPercent}%`
            }}
          />
        ) : null}
        {visibleMagicTemporaryHitPointPercent > 0 ? (
          <div
            className={styles.barMagicTempFill}
            style={{
              left: `${Math.max(0, currentHitPointPercent + visibleTemporaryHitPointPercent)}%`,
              width: `${visibleMagicTemporaryHitPointPercent}%`
            }}
          />
        ) : null}
      </div>
    </div>
  );
}

export default HitPointBar;
