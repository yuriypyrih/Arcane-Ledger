import { BookOpen, Clock3, Plus, ScrollText, Shield, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getClassSignatureStyle } from "../../components/CharactersPage/classSignature";
import { loadCharacters } from "../CharactersPage/storage";
import styles from "./HomePage.module.css";

function HomePage() {
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
          <Link to="/characters/new" className={styles.primaryAction}>
            <Plus size={16} aria-hidden="true" />
            <span>New Character</span>
          </Link>
          <Link to="/codex" className={styles.secondaryAction}>
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
                  <Link
                    to={`/characters/${character.id}`}
                    className={styles.characterRow}
                    style={getClassSignatureStyle(character.className)}
                  >
                    <span className={styles.characterMark} aria-hidden="true" />
                    <span className={styles.characterMain}>
                      <strong>{character.name}</strong>
                      <span>
                        {character.species} {character.className}
                      </span>
                    </span>
                    <span className={styles.characterMeta}>Lv {character.level}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className={styles.emptyState}>
              <Users size={18} aria-hidden="true" />
              <span>No characters yet</span>
            </div>
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
