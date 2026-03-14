import { RARITY_TYPES } from "../../../codex/entries";
import { formatCodexLabel } from "../../../utils/codex";
import styles from "./RarityPill.module.css";

type RarityPillProps = {
  rarity: RARITY_TYPES;
};

const appearanceByRarity: Record<RARITY_TYPES, { color: string; background: string; border: string }> = {
  [RARITY_TYPES.CUSTOM]: {
    color: "#14685d",
    background: "#dff5f0",
    border: "#8acfc1"
  },
  [RARITY_TYPES.COMMON]: {
    color: "#ffffff",
    background: "#4f3c2d",
    border: "#6b5441"
  },
  [RARITY_TYPES.RARE]: {
    color: "#0070dd",
    background: "#e7f3ff",
    border: "#8abde8"
  },
  [RARITY_TYPES.EPIC]: {
    color: "#a335ee",
    background: "#f2e6ff",
    border: "#d2a5f4"
  },
  [RARITY_TYPES.LEGENDARY]: {
    color: "#ffaa00",
    background: "#6a3817",
    border: "#bf7224"
  }
};

function RarityPill({ rarity }: RarityPillProps) {
  const appearance = appearanceByRarity[rarity];

  return (
    <span
      className={styles.pill}
      style={{
        color: appearance.color,
        backgroundColor: appearance.background,
        borderColor: appearance.border
      }}
    >
      {formatCodexLabel(rarity)}
    </span>
  );
}

export default RarityPill;
