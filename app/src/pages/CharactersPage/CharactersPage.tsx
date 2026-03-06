import { Link } from "react-router-dom";
import CharacterList from "../../components/CharactersPage/CharacterList";
import { loadCharacters } from "./storage";
import styles from "./CharactersPage.module.css";

function CharactersPage() {
  const characters = loadCharacters();

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
      <CharacterList characters={characters} />
    </section>
  );
}

export default CharactersPage;
