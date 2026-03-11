import { COLOR_TYPES, RARITY_TYPES } from "../../../codex/entries";
import { formatCodexLabel } from "../../../utils/codex";
import styles from "./RarityPill.module.css";

type RarityPillProps = {
  rarity: RARITY_TYPES;
};

const textColorByRarity: Record<RARITY_TYPES, COLOR_TYPES> = {
  [RARITY_TYPES.COMMON]: COLOR_TYPES.WHITE,
  [RARITY_TYPES.RARE]: COLOR_TYPES.BLUE,
  [RARITY_TYPES.EPIC]: COLOR_TYPES.PURPLE,
  [RARITY_TYPES.LEGENDARY]: COLOR_TYPES.ORANGE
};

function RarityPill({ rarity }: RarityPillProps) {
  return (
    <span
      className={styles.pill}
      style={{
        color: textColorByRarity[rarity],
        backgroundColor: COLOR_TYPES.DARK_BROWN_TINT
      }}
    >
      {formatCodexLabel(rarity)}
    </span>
  );
}

export default RarityPill;
