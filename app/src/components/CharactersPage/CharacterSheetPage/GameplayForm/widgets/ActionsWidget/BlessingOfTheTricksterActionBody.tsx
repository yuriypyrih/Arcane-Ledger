import clsx from "clsx";
import styles from "./BlessingOfTheTricksterActionBody.module.css";

type BlessingOfTheTricksterTarget = "self" | "other";

type BlessingOfTheTricksterActionBodyProps = {
  selectedTarget: BlessingOfTheTricksterTarget;
  onSelectTarget: (target: BlessingOfTheTricksterTarget) => void;
};

function BlessingOfTheTricksterActionBody({
  selectedTarget,
  onSelectTarget
}: BlessingOfTheTricksterActionBodyProps) {
  return (
    <div className={styles.targetSwitch} role="tablist" aria-label="Blessing target">
      <button
        type="button"
        className={clsx(
          styles.targetButton,
          selectedTarget === "self" && styles.targetButtonActive
        )}
        aria-pressed={selectedTarget === "self"}
        onClick={() => onSelectTarget("self")}
      >
        Yourself
      </button>
      <button
        type="button"
        className={clsx(
          styles.targetButton,
          selectedTarget === "other" && styles.targetButtonActive
        )}
        aria-pressed={selectedTarget === "other"}
        onClick={() => onSelectTarget("other")}
      >
        Another
      </button>
    </div>
  );
}

export default BlessingOfTheTricksterActionBody;
