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
  tone?: "campaign" | "default" | "danger" | "encounter" | "party";
  title: ReactNode;
  to?: string;
};

function isDangerAction(action: DmToolsListCardAction) {
  return action.label.trim().toLowerCase().startsWith("delete");
}

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

function getCardClassName(disabled?: boolean, tone: DmToolsListCardProps["tone"] = "default") {
  const classNames = [styles.dmToolsListCard];

  if (tone === "campaign") {
    classNames.push(styles.dmToolsListCardCampaign);
  }

  if (tone === "party") {
    classNames.push(styles.dmToolsListCardParty);
  }

  if (tone === "encounter") {
    classNames.push(styles.dmToolsListCardEncounter);
  }

  if (tone === "danger") {
    classNames.push(styles.dmToolsListCardDanger);
  }

  if (disabled) {
    classNames.push(styles.dmToolsListCardDisabled);
  }

  return classNames.filter(Boolean).join(" ");
}

function DmToolsListCard({
  actions,
  ariaLabel,
  disabled,
  icon,
  meta,
  onClick,
  tone = "default",
  title,
  to
}: DmToolsListCardProps) {
  const content = <DmToolsListCardContent icon={icon} meta={meta} title={title} />;

  return (
    <article className={getCardClassName(disabled, tone)}>
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
              className={[
                styles.iconButton,
                isDangerAction(action) ? styles.dangerIconButton : ""
              ]
                .filter(Boolean)
                .join(" ")}
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
