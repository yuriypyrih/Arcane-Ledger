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

  return (
    <span
      className={[styles.pill, className ?? ""].join(" ").trim()}
      style={{
        color: appearance.color,
        backgroundColor: appearance.background,
        borderColor: appearance.border
      }}
    >
      {label}
    </span>
  );
}

export default RarityPill;
