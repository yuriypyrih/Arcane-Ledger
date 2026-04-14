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
  [RARITY_TYPES.NO_RARITY]: {
    color: "#5b524b",
    background: "#ede5dd",
    border: "#cbbeb0"
  },
  [RARITY_TYPES.COMMON]: {
    color: "#4b3f35",
    background: "#f7f2eb",
    border: "#d7c9ba"
  },
  [RARITY_TYPES.UNCOMMON]: {
    color: "#1f7a43",
    background: "#e6f6ea",
    border: "#9dd2ae"
  },
  [RARITY_TYPES.RARE]: {
    color: "#0e62ba",
    background: "#e7f3ff",
    border: "#8abde8"
  },
  [RARITY_TYPES.VERY_RARE]: {
    color: "#7b36b2",
    background: "#f3e9ff",
    border: "#cba3ef"
  },
  [RARITY_TYPES.LEGENDARY]: {
    color: "#9b5200",
    background: "#fff0d9",
    border: "#efbf72"
  },
  [RARITY_TYPES.ARTIFACT]: {
    color: "#9e2f24",
    background: "#ffe7e2",
    border: "#e7a79d"
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
