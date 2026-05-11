import { Users } from "lucide-react";
import styles from "./CharacterEmptyState.module.css";

function CharacterEmptyState() {
  return (
    <div className={styles.root}>
      <Users size={18} aria-hidden="true" />
      <span>No characters yet</span>
    </div>
  );
}

export default CharacterEmptyState;
