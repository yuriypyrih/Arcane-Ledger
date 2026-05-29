import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import styles from "./DmToolsPage.module.css";

export type DmToolsListCardAction = {
  disabled?: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
  title?: string;
};

type DmToolsListCardProps = {
  actions?: DmToolsListCardAction[];
  ariaLabel?: string;
  disabled?: boolean;
  icon: ReactNode;
  meta?: ReactNode;
  onClick?: () => void;
  title: ReactNode;
  to?: string;
};

function DmToolsListCardContent({
  icon,
  meta,
  title
}: Pick<DmToolsListCardProps, "icon" | "meta" | "title">) {
  return (
    <>
      <span className={styles.dmToolsListCardIcon}>{icon}</span>
      <span className={styles.dmToolsListCardMainText}>
        <strong>{title}</strong>
        {meta ? <small>{meta}</small> : null}
      </span>
    </>
  );
}

function getCardClassName(disabled?: boolean) {
  return disabled
    ? `${styles.dmToolsListCard} ${styles.dmToolsListCardDisabled}`
    : styles.dmToolsListCard;
}

function DmToolsListCard({
  actions,
  ariaLabel,
  disabled,
  icon,
  meta,
  onClick,
  title,
  to
}: DmToolsListCardProps) {
  const content = <DmToolsListCardContent icon={icon} meta={meta} title={title} />;

  return (
    <article className={getCardClassName(disabled)}>
      {to ? (
        <Link to={to} className={styles.dmToolsListCardMain} aria-label={ariaLabel}>
          {content}
        </Link>
      ) : onClick ? (
        <button
          type="button"
          className={styles.dmToolsListCardMain}
          aria-label={ariaLabel}
          disabled={disabled}
          onClick={onClick}
        >
          {content}
        </button>
      ) : (
        <div className={styles.dmToolsListCardMain}>{content}</div>
      )}

      {actions?.length ? (
        <div className={styles.dmToolsListCardActions}>
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              className={styles.iconButton}
              aria-label={action.label}
              title={action.title ?? action.label}
              disabled={action.disabled}
              onClick={action.onClick}
            >
              {action.icon}
            </button>
          ))}
        </div>
      ) : null}
    </article>
  );
}

export default DmToolsListCard;
