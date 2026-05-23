import {
  BookOpen,
  Clock3,
  Construction,
  Hammer,
  HardHat,
  LayoutDashboard,
  Plus,
  ScrollText,
  Shield,
  Wrench
} from "lucide-react";
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
  const visibleCharacters = useMemo(() => characters.slice(0, 3), [characters]);

  return (
    <section className={styles.page}>
      <section className={styles.workbenchHero} aria-labelledby="home-dashboard-title">
        <div className={styles.heroCopy}>
          <p className={styles.heroEyebrow}>
            <Construction size={16} aria-hidden="true" />
            <span>Under construction</span>
          </p>
          <h2 id="home-dashboard-title" className={styles.title}>
            Dashboard workbench
          </h2>
          <p className={styles.heroText}>Big dashboard upgrades are being prepared.</p>
          <div className={styles.buildNotes} aria-label="Dashboard build notes">
            <span>
              <HardHat size={15} aria-hidden="true" />
              Foundation set
            </span>
            <span>
              <Hammer size={15} aria-hidden="true" />
              New panels in progress
            </span>
            <span>
              <Wrench size={15} aria-hidden="true" />
              Tools being tuned
            </span>
          </div>
        </div>

        <div className={styles.headerActions}>
          <ActionButton
            icon={<Plus size={16} aria-hidden="true" />}
            fullWidth={false}
            onClick={() => navigate("/characters/new")}
          >
            New Character
          </ActionButton>
          <Link to="/compendium" className={styles.secondaryAction}>
            <BookOpen size={16} aria-hidden="true" />
            <span>Compendium</span>
          </Link>
        </div>
      </section>

      <div className={styles.dashboardGrid}>
        <section className={styles.panel} aria-labelledby="home-characters-title">
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.eyebrow}>Roster</p>
              <h3 id="home-characters-title" className={styles.panelTitle}>
                Top Active Characters
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
            <span className={styles.statusPill}>
              <LayoutDashboard size={14} aria-hidden="true" />
              In progress
            </span>
          </div>
          <div className={styles.toolGrid}>
            <button type="button" className={styles.toolButton} disabled>
              <Shield size={16} aria-hidden="true" />
              <span className={styles.toolText}>
                <strong>Encounter Forge</strong>
                <small>Coming soon</small>
              </span>
            </button>
            <button type="button" className={styles.toolButton} disabled>
              <Clock3 size={16} aria-hidden="true" />
              <span className={styles.toolText}>
                <strong>Session Table</strong>
                <small>In progress</small>
              </span>
            </button>
            <button type="button" className={styles.toolButton} disabled>
              <BookOpen size={16} aria-hidden="true" />
              <span className={styles.toolText}>
                <strong>Campaign Notes</strong>
                <small>Queued</small>
              </span>
            </button>
          </div>
        </section>
      </div>
    </section>
  );
}

export default HomePage;
