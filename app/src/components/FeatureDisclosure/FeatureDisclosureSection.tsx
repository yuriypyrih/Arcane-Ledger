import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import styles from "./FeatureDisclosure.module.css";

type FeatureDisclosureSectionProps = {
  className?: string;
  bodyClassName?: string;
  headerClassName?: string;
  bodyId?: string;
  header: ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  children?: ReactNode;
};

function FeatureDisclosureSection({
  className,
  bodyClassName,
  headerClassName,
  bodyId,
  header,
  isExpanded,
  onToggle,
  children
}: FeatureDisclosureSectionProps) {
  return (
    <article className={className}>
      <button
        type="button"
        className={styles.sectionToggle}
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-controls={bodyId}
      >
        <div className={clsx(styles.sectionHeaderContent, headerClassName)}>{header}</div>
        <span className={styles.sectionToggleMeta}>
          <ChevronDown
            size={18}
            aria-hidden="true"
            className={clsx(styles.sectionToggleIcon, !isExpanded && styles.sectionToggleIconCollapsed)}
          />
        </span>
      </button>

      {isExpanded ? (
        <div id={bodyId} className={bodyClassName}>
          {children}
        </div>
      ) : null}
    </article>
  );
}

export default FeatureDisclosureSection;
