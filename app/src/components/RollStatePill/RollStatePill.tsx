import clsx from "clsx";
import { getRollStateDefaultLabel, type RollStateTone } from "./rollState";
import styles from "./RollStatePill.module.css";

type RollStatePillProps = {
  tone: RollStateTone;
  label?: string;
  className?: string;
  detailText?: string;
  size?: "default" | "small";
};

function RollStatePill({
  tone,
  label,
  className,
  detailText,
  size = "default"
}: RollStatePillProps) {
  const labelText = label ?? getRollStateDefaultLabel(tone);

  return (
    <span
      className={clsx(
        styles.pill,
        size === "small" && styles.small,
        tone === "advantage"
          ? styles.advantage
          : tone === "disadvantage"
            ? styles.disadvantage
            : styles.neutralized,
        className
      )}
    >
      <span className={styles.label}>{detailText ? `${labelText}:` : labelText}</span>
      {detailText ? <span className={styles.detail}>{detailText}</span> : null}
    </span>
  );
}

export default RollStatePill;
