import type { Character } from "../../../../types";
import styles from "./CharacterList.module.css";

type CharacterListProps = {
  characters: Character[];
  onEdit: (character: Character) => void;
};

function CharacterList({ characters, onEdit }: CharacterListProps) {
  return (
    <div className={styles.listCard}>
      <div className={styles.listHeader}>
        <div>
          <p className={styles.eyebrow}>Party roster</p>
          <h3 className={styles.title}>Characters</h3>
        </div>
        <span>{characters.length} total</span>
      </div>

      {characters.length === 0 ? (
        <p className={styles.empty}>No characters yet. Create one to start tracking your party.</p>
      ) : (
        <ul className={styles.list}>
          {characters.map((character) => (
            <li key={character.id} className={styles.card}>
              <div>
                <h4>{character.name}</h4>
                <p>
                  {character.className} · Level {character.level}
                </p>
              </div>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => onEdit(character)}
              >
                Edit
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CharacterList;
