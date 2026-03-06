import { Link } from "react-router-dom";
import { abilityKeys } from "../../../pages/CharactersPage/constants";
import type { Character } from "../../../types";
import styles from "./CharacterList.module.css";

type CharacterListProps = {
  characters: Character[];
};

function CharacterList({ characters }: CharacterListProps) {
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
        <p className={styles.empty}>
          No characters yet. Create one to start building your next adventure party.
        </p>
      ) : (
        <ul className={styles.list}>
          {characters.map((character) => (
            <li key={character.id} className={styles.card}>
              <Link to={`/characters/${character.id}`} className={styles.cardLink}>
                <div className={styles.cardContent}>
                  <div className={styles.cardHeader}>
                    <div>
                      <h4>{character.name}</h4>
                      <p>
                        {character.species} {character.role} · Level {character.level}
                      </p>
                    </div>
                    <span className={styles.hitPoints}>
                      {character.currentHitPoints}/{character.hitPoints} HP
                    </span>
                  </div>
                  <ul className={styles.abilityList}>
                    {abilityKeys.map((ability) => (
                      <li key={ability}>
                        <span>{ability}</span>
                        <strong>{character.abilities[ability]}</strong>
                      </li>
                    ))}
                  </ul>
                </div>
                <span className={styles.secondaryButton}>Open sheet</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CharacterList;
