import { Link } from "react-router-dom";
import { useState } from "react";
import CharacterList from "../../components/CharactersPage/CharacterList";
import { deleteCharacter, loadCharacters } from "./storage";
import styles from "./CharactersPage.module.css";

function CharactersPage() {
  const [characters, setCharacters] = useState(() => loadCharacters());

  function handleDeleteCharacter(characterId: number) {
    setCharacters(deleteCharacter(characterId));
  }

  return (
    <section className={styles.page}>
      <div className={styles.heroCard}>
        <div>
          <p className={styles.eyebrow}>Character forge</p>
          <h2 className={styles.title}>Build and revisit your party roster</h2>
          <p className={styles.description}>
            Start a new sheet on a separate page, then come back here to review or update the
            heroes you have already created.
          </p>
        </div>
        <Link to="/characters/new" className={styles.primaryButton}>
          New character
        </Link>
      </div>
      <CharacterList characters={characters} onDeleteCharacter={handleDeleteCharacter} />
    </section>
  );
}

export default CharactersPage;
