import clsx from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";
import { DefaultCharacterPortraitIcon } from "../CharacterPortrait";
import { getClassSignatureStyle } from "../classSignature";
import styles from "./CharacterRow.module.css";

type CharacterRowBaseProps = {
  actions?: ReactNode;
  avatarUrl?: string | null;
  badges?: ReactNode;
  className: string;
  level?: number | string;
  linkAriaLabel?: string;
  linkTo?: string;
  name: string;
  secondaryMeta?: ReactNode;
  subtitle: ReactNode;
};

type CharacterRowIconButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function CharacterRowIconButton({
  className,
  type = "button",
  ...buttonProps
}: CharacterRowIconButtonProps) {
  return (
    <button
      {...buttonProps}
      type={type}
      className={clsx(styles.iconButton, className)}
    />
  );
}

export function CharacterRowBase({
  actions,
  avatarUrl,
  badges,
  className,
  level,
  linkAriaLabel,
  linkTo,
  name,
  secondaryMeta,
  subtitle
}: CharacterRowBaseProps) {
  return (
    <article className={styles.row} style={getClassSignatureStyle(className)}>
      {linkTo ? (
        <Link
          to={linkTo}
          className={styles.rowLink}
          aria-label={linkAriaLabel ?? `View ${name}`}
        />
      ) : null}
      <span className={styles.characterPortrait}>
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className={styles.characterPortraitImage} />
        ) : (
          <DefaultCharacterPortraitIcon className={styles.characterPortraitDefaultIcon} />
        )}
      </span>
      <span className={styles.characterMain}>
        <strong>{name}</strong>
        <span>{subtitle}</span>
      </span>
      <span className={styles.characterSide}>
        {level !== undefined && level !== null ? (
          <span className={styles.characterMeta}>Lv {level}</span>
        ) : null}
        {secondaryMeta ? <span className={styles.characterMeta}>{secondaryMeta}</span> : null}
        {badges}
        {actions ? <span className={styles.characterActions}>{actions}</span> : null}
      </span>
    </article>
  );
}
