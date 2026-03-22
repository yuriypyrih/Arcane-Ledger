import clsx from "clsx";
import styles from "./RollStatePill.module.css";

export type RollStateTone = "advantage" | "disadvantage";

type RollStatePillProps = {
  tone: RollStateTone;
  label?: string;
  className?: string;
};

const defaultLabels: Record<RollStateTone, string> = {
  advantage: "Advantage",
  disadvantage: "Disadvantage"
};

function RollStatePill({ tone, label, className }: RollStatePillProps) {
  return (
    <span
      className={clsx(
        styles.pill,
        tone === "advantage" ? styles.advantage : styles.disadvantage,
        className
      )}
    >
      {label ?? defaultLabels[tone]}
    </span>
  );
}

export default RollStatePill;
