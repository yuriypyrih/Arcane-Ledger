import type { ResultPopup } from "../../types";
import styles from "./RollResultPopup.module.css";

type RollResultPopupProps = {
  result: ResultPopup;
};

function RollResultPopup({ result }: RollResultPopupProps) {
  return (
    <div className={styles.resultPopup}>
      <p className={styles.resultPopupLabel}>Result</p>
      <strong className={styles.resultPopupValue}>{result.total}</strong>
      <p className={styles.resultPopupText}>{result.breakdown}</p>
    </div>
  );
}

export default RollResultPopup;
