import { Cross } from "lucide-react";
import type { CSSProperties } from "react";
import type { Character } from "../../../../../types";
import {
  getPaladinHealingPoolRemainingForCharacter,
  getPaladinHealingPoolTotalForCharacter
} from "../../../../../pages/CharactersPage/classFeatures";
import styles from "./PoolOfHealingWidget.module.css";

type PoolOfHealingWidgetProps = {
  character: Character;
};

function getPoolOfHealingFillStyle(remaining: number, total: number): CSSProperties {
  const ratio = total > 0 ? Math.max(0, Math.min(1, remaining / total)) : 0;

  return {
    width: `${ratio * 100}%`
  };
}

function PoolOfHealingWidget({ character }: PoolOfHealingWidgetProps) {
  const totalPool = getPaladinHealingPoolTotalForCharacter(character);
  const remainingPool = getPaladinHealingPoolRemainingForCharacter(character);

  if (totalPool <= 0) {
    return null;
  }

  return (
    <div className={styles.pill}>
      <span className={styles.fill} style={getPoolOfHealingFillStyle(remainingPool, totalPool)} />
      <span className={styles.content}>
        <Cross size={16} />
        <span className={styles.label}>
          <span>Pool of Healing</span>
          <span className={styles.count}>
            {remainingPool}/{totalPool}
          </span>
        </span>
      </span>
    </div>
  );
}

export default PoolOfHealingWidget;
