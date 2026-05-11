import clsx from "clsx";
import { TriangleAlert } from "lucide-react";
import styles from "./InputRequiredBadge.module.css";

type InputRequiredBadgeProps = {
  className?: string;
};

function InputRequiredBadge({ className }: InputRequiredBadgeProps) {
  return (
    <span className={clsx(styles.root, className)}>
      <TriangleAlert size={16} aria-hidden="true" />
      <span>Input Required</span>
    </span>
  );
}

export default InputRequiredBadge;
