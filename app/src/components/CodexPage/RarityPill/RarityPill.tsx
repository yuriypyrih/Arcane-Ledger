import type { CSSProperties } from "react";
import {
  getRarityAppearance,
  getRarityDisplayLabel,
  type RarityPillValue
} from "./rarityPresentation";
import styles from "./RarityPill.module.css";

type RarityPillProps = {
  rarity: RarityPillValue;
  className?: string;
};

function RarityPill({ rarity, className }: RarityPillProps) {
  if (!rarity) {
    return null;
  }

  const label = getRarityDisplayLabel(rarity);

  if (!label) {
    return null;
  }

  const appearance = getRarityAppearance(rarity);
  const style = {
    "--rarity-pill-color": appearance.color,
    "--rarity-pill-background": appearance.background,
    "--rarity-pill-border": appearance.border
  } as CSSProperties;

  return (
    <span
      className={[styles.pill, className ?? ""].join(" ").trim()}
      style={style}
    >
      {label}
    </span>
  );
}

export default RarityPill;
