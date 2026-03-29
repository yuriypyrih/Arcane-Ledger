import clsx from "clsx";
import { BrainCircuit } from "lucide-react";
import styles from "./ConcentrationLabel.module.css";

type ConcentrationLabelProps = {
  className?: string;
  iconClassName?: string;
  iconSize?: number;
};

function ConcentrationLabel({
  className,
  iconClassName,
  iconSize = 14
}: ConcentrationLabelProps) {
  return (
    <span className={clsx(styles.root, className)}>
      <BrainCircuit
        size={iconSize}
        strokeWidth={2.1}
        className={clsx(styles.icon, iconClassName)}
      />
      <span>Concentration</span>
    </span>
  );
}

export default ConcentrationLabel;
