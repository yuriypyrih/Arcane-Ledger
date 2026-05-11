import { BookOpen, Clock3, Plus, ScrollText, Shield } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ActionButton from "../../components/ActionButton";
import CharacterEmptyState from "../../components/CharactersPage/CharacterEmptyState";
import CharacterRow from "../../components/CharactersPage/CharacterRow";
import { loadCharacters } from "../CharactersPage/storage";
import styles from "./HomePage.module.css";

function HomePage() {
  const navigate = useNavigate();
  const [characters] = useState(() => loadCharacters());
  const visibleCharacters = useMemo(() => characters.slice(0, 5), [characters]);

  return (
    <section className={styles.page}>
      <div className={styles.dashboardHeader}>
        <div>
          <p className={styles.eyebrow}>Session desk</p>
          <h2 className={styles.title}>Dashboard</h2>
        </div>
        <div className={styles.headerActions}>
          <ActionButton
            icon={<Plus size={16} aria-hidden="true" />}
            fullWidth={false}
            onClick={() => navigate("/characters/new")}
          >
            New Character
          </ActionButton>
          <Link to="/library" className={styles.secondaryAction}>
            <BookOpen size={16} aria-hidden="true" />
            <span>Library</span>
          </Link>
        </div>
      </div>

      <div className={styles.dashboardGrid}>
        <section className={styles.panel} aria-labelledby="home-characters-title">
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.eyebrow}>Party</p>
              <h3 id="home-characters-title" className={styles.panelTitle}>
                Characters
              </h3>
            </div>
            <Link to="/characters" className={styles.panelLink}>
              <ScrollText size={15} aria-hidden="true" />
              <span>Roster</span>
            </Link>
          </div>

          {visibleCharacters.length > 0 ? (
            <ul className={styles.characterList}>
              {visibleCharacters.map((character) => (
                <li key={character.id}>
                  <CharacterRow character={character} />
                </li>
              ))}
            </ul>
          ) : (
            <CharacterEmptyState />
          )}
        </section>

        <section className={styles.panel} aria-labelledby="home-tools-title">
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.eyebrow}>DM tools</p>
              <h3 id="home-tools-title" className={styles.panelTitle}>
                Prep Tray
              </h3>
            </div>
          </div>
          <div className={styles.toolGrid}>
            <button type="button" className={styles.toolButton} disabled>
              <Shield size={16} aria-hidden="true" />
              <span>Encounter</span>
            </button>
            <button type="button" className={styles.toolButton} disabled>
              <Clock3 size={16} aria-hidden="true" />
              <span>Session</span>
            </button>
            <button type="button" className={styles.toolButton} disabled>
              <BookOpen size={16} aria-hidden="true" />
              <span>Notes</span>
            </button>
          </div>
        </section>
      </div>
    </section>
  );
}

export default HomePage;
