import { createElement } from "react";
import {
  Component,
  Cross,
  ChessRook,
  Flame,
  Puzzle,
  Sparkles,
  Swords,
  type LucideIcon
} from "lucide-react";
import { ACTION_CARD_THEME } from "../../../../../../pages/CharactersPage/actionCardTheme";
import styles from "./ActionCards.module.css";

export const actionCardThemeClassByTheme: Record<ACTION_CARD_THEME, string> = {
  [ACTION_CARD_THEME.FEATURE]: styles.themeFeature,
  [ACTION_CARD_THEME.ATTACK]: styles.themeAttack,
  [ACTION_CARD_THEME.MAGIC]: styles.themeMagic,
  [ACTION_CARD_THEME.UTIL]: styles.themeUtil,
  [ACTION_CARD_THEME.HEAL]: styles.themeHeal,
  [ACTION_CARD_THEME.DEFENSE]: styles.themeDefense,
  [ACTION_CARD_THEME.WEAPON]: styles.themeWeapon
};

const actionCardThemeIconByTheme: Record<ACTION_CARD_THEME, LucideIcon> = {
  [ACTION_CARD_THEME.FEATURE]: Component,
  [ACTION_CARD_THEME.ATTACK]: Flame,
  [ACTION_CARD_THEME.MAGIC]: Sparkles,
  [ACTION_CARD_THEME.UTIL]: Puzzle,
  [ACTION_CARD_THEME.HEAL]: Cross,
  [ACTION_CARD_THEME.DEFENSE]: ChessRook,
  [ACTION_CARD_THEME.WEAPON]: Swords
};

export function getActionCardThemeClassNames(theme: ACTION_CARD_THEME | null | undefined) {
  return theme ? [styles.themedActionCard, actionCardThemeClassByTheme[theme]] : [];
}

export function ActionCardThemeTexture({ theme }: { theme: ACTION_CARD_THEME | null | undefined }) {
  if (!theme) {
    return null;
  }

  const Icon = actionCardThemeIconByTheme[theme];

  return createElement(Icon, {
    "aria-hidden": true,
    className: styles.themeTextureIcon,
    focusable: false,
    strokeWidth: 1.45
  });
}
