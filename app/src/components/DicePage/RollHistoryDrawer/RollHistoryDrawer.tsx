import type { RollRecord } from "../../../pages/DicePage/types";
import styles from "./RollHistoryDrawer.module.css";

type RollHistoryDrawerProps = {
  history: RollRecord[];
};

function RollHistoryDrawer({ history }: RollHistoryDrawerProps) {
  return (
    <div className={styles.historyDrawer}>
      {history.length === 0 ? (
        <p className={styles.empty}>Your latest rolls will appear here for this session.</p>
      ) : (
        <ul className={styles.historyList}>
          {history.map((entry) => (
            <li key={entry.id} className={styles.historyItem}>
              <div className={styles.historyTop}>
                <strong>{entry.total}</strong>
                <span>{entry.dice.length} dice</span>
              </div>
              <p>{entry.breakdown}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default RollHistoryDrawer;
