import {
  getRarityAppearance,
  getRarityDisplayLabel,
  type RarityPillValue
} from "./rarityPresentation";
import styles from "./RarityPill.module.css";

type RarityPillProps = {
  rarity: RarityPillValue;
};

function RarityPill({ rarity }: RarityPillProps) {
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
      className={styles.pill}
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
