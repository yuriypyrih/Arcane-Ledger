import clsx from "clsx";
import type { ReactNode } from "react";
import cardStyles from "./FeatCards.module.css";
import { triggerActionOnEnterOrSpace } from "./featEditorUtils";

type BuildSummaryCardProps = {
  headerActions?: ReactNode;
  isRepeatable?: boolean;
  meta: string;
  onClick?: () => void;
  selectedItems?: string[];
  summary?: string | null;
  title: string;
};

function BuildSummaryCard({
  headerActions,
  isRepeatable = false,
  meta,
  onClick,
  selectedItems,
  summary,
  title
}: BuildSummaryCardProps) {
  const isInteractive = typeof onClick === "function";

  return (
    <li
      className={clsx(cardStyles.card, isInteractive && cardStyles.interactiveCard)}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (event) => triggerActionOnEnterOrSpace(event, onClick) : undefined}
    >
      <div className={cardStyles.headerRow}>
        <div className={cardStyles.titleBlock}>
          <span className={cardStyles.title}>{title}</span>
          {isRepeatable ? (
            <>
              {" "}
              <span className={cardStyles.repeatable}>(repeatable)</span>
            </>
          ) : null}
        </div>
        {headerActions ? <div className={cardStyles.headerActions}>{headerActions}</div> : null}
      </div>
      <p className={cardStyles.meta}>{meta}</p>
      {selectedItems && selectedItems.length > 0 ? (
        <ul className={cardStyles.selectedList}>
          {selectedItems.map((item) => (
            <li key={item} className={cardStyles.selectedItem}>
              <span className={cardStyles.selectedText}>{item}</span>
            </li>
          ))}
        </ul>
      ) : summary ? (
        <p className={cardStyles.summary}>{summary}</p>
      ) : null}
    </li>
  );
}

export default BuildSummaryCard;
