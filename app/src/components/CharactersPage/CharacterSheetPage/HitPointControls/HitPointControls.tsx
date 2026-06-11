import clsx from "clsx";
import { HeartMinus, HeartPlus } from "lucide-react";
import type { ChangeEvent, ReactNode } from "react";
import { useState } from "react";
import NumberInput from "../../FormInputs/NumberInput";
import { clampNumber } from "../../../../pages/CharactersPage/CharacterSheetPage/utils";
import { normalizeTemporaryHitPoints } from "../GameplayForm/gameplayStateUtils";
import TemporaryHitPoints from "../TemporaryHitPoints";
import HitPointBar from "./HitPointBar";
import styles from "./HitPointControls.module.css";

type HitPointControlsProps = {
  currentHitPoints: number;
  maxHitPoints: number;
  temporaryHitPoints: number;
  temporaryHitPointsSource?: string;
  magicTemporaryHitPoints?: number;
  statusText?: string;
  extraTemporaryHitPointControl?: ReactNode;
  temporaryHitPointsDescription?: string;
  className?: string;
  readOnly?: boolean;
  showSummary?: boolean;
  onDamage?: (amount: number) => void;
  onHeal?: (amount: number) => void;
  onSaveTemporaryHitPoints?: (value: number) => void;
};

function HitPointControls({
  currentHitPoints,
  maxHitPoints,
  temporaryHitPoints,
  temporaryHitPointsSource,
  magicTemporaryHitPoints = 0,
  statusText,
  extraTemporaryHitPointControl,
  temporaryHitPointsDescription,
  className,
  readOnly = false,
  showSummary = true,
  onDamage,
  onHeal,
  onSaveTemporaryHitPoints
}: HitPointControlsProps) {
  const [hitPointStep, setHitPointStep] = useState(1);
  const normalizedMaxHitPoints = Math.max(1, Math.floor(maxHitPoints));
  const normalizedCurrentHitPoints = clampNumber(
    currentHitPoints,
    0,
    normalizedMaxHitPoints,
    currentHitPoints
  );
  const normalizedTemporaryHitPoints = normalizeTemporaryHitPoints(temporaryHitPoints);
  const canAdjustHitPoints = !readOnly && Boolean(onDamage && onHeal);

  function updateHitPointStep(event: ChangeEvent<HTMLInputElement>) {
    const normalizedValue = event.target.value.replace(/^0+(?=\d)/, "");
    setHitPointStep(clampNumber(normalizedValue, 0, 999, 0));
  }

  function adjustHitPoints(direction: -1 | 1) {
    const amount = clampNumber(hitPointStep, 0, 999, 0);

    if (amount === 0) {
      setHitPointStep(1);
      return;
    }

    if (direction > 0) {
      onHeal?.(amount);
    } else {
      onDamage?.(amount);
    }

    setHitPointStep(1);
  }

  return (
    <div className={clsx(styles.root, className)}>
      {showSummary ? (
        <div className={styles.summary}>
          <div className={styles.valueRow}>
            <div className={styles.summaryCopy}>
              <div className={styles.currentRow}>
                <strong>
                  {normalizedCurrentHitPoints}/{normalizedMaxHitPoints} HP
                </strong>
                <TemporaryHitPoints
                  temporaryHitPoints={normalizedTemporaryHitPoints}
                  temporaryHitPointsSource={temporaryHitPointsSource}
                  description={temporaryHitPointsDescription}
                  readOnly={readOnly}
                  onSaveTemporaryHitPoints={onSaveTemporaryHitPoints}
                />
                {extraTemporaryHitPointControl}
              </div>

              {statusText ? <span>{statusText}</span> : null}
            </div>
          </div>
        </div>
      ) : null}

      <div className={styles.actionRow}>
        <HitPointBar
          currentHitPoints={currentHitPoints}
          maxHitPoints={maxHitPoints}
          temporaryHitPoints={temporaryHitPoints}
          magicTemporaryHitPoints={magicTemporaryHitPoints}
        />

        {readOnly ? null : (
          <div className={styles.stepControl}>
            <NumberInput
              min={0}
              className={styles.stepInput}
              value={hitPointStep}
              onChange={updateHitPointStep}
            />
            <button
              type="button"
              className={clsx(styles.actionButton, styles.damageButton)}
              onClick={() => adjustHitPoints(-1)}
              disabled={!canAdjustHitPoints}
              title={`Deal ${hitPointStep} hit points`}
            >
              <HeartMinus size={20} />
            </button>
            <button
              type="button"
              className={clsx(styles.actionButton, styles.healButton)}
              onClick={() => adjustHitPoints(1)}
              disabled={!canAdjustHitPoints}
              title={`Heal ${hitPointStep} hit points`}
            >
              <HeartPlus size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default HitPointControls;
