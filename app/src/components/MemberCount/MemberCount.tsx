import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";
import styles from "./MemberCount.module.css";

type MemberCountProps = HTMLAttributes<HTMLSpanElement> & {
  children?: ReactNode;
  current?: number;
  total?: number;
  label?: string;
};

function MemberCount({ children, className, current, total, label, ...props }: MemberCountProps) {
  const content =
    children ??
    (current !== undefined && total !== undefined && label ? `${current}/${total} ${label}` : null);

  return (
    <span {...props} className={clsx(styles.memberCount, className)}>
      {content}
    </span>
  );
}

export default MemberCount;
