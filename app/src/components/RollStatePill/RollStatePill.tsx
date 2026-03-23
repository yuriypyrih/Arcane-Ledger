import clsx from "clsx";
import styles from "./RollStatePill.module.css";

export type RollStateTone = "advantage" | "disadvantage";

type RollStatePillProps = {
  tone: RollStateTone;
  label?: string;
  className?: string;
  detailText?: string;
};

const defaultLabels: Record<RollStateTone, string> = {
  advantage: "Advantage",
  disadvantage: "Disadvantage"
};

function RollStatePill({ tone, label, className, detailText }: RollStatePillProps) {
  const labelText = label ?? defaultLabels[tone];

  return (
    <span
      className={clsx(
        styles.pill,
        tone === "advantage" ? styles.advantage : styles.disadvantage,
        className
      )}
    >
      <span className={styles.label}>{detailText ? `${labelText}:` : labelText}</span>
      {detailText ? <span className={styles.detail}>{detailText}</span> : null}
    </span>
  );
}

export default RollStatePill;
