import { Users } from "lucide-react";
import styles from "./CharacterEmptyState.module.css";

type CharacterEmptyStateProps = {
  className?: string;
};

function CharacterEmptyState({ className }: CharacterEmptyStateProps) {
  return (
    <div className={className ? `${styles.root} ${className}` : styles.root}>
      <Users size={18} aria-hidden="true" />
      <span>No characters yet</span>
    </div>
  );
}

export default CharacterEmptyState;
