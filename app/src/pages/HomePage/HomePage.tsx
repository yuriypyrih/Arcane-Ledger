import {
  BookOpen,
  Clock3,
  Construction,
  Cloud,
  Hammer,
  HardHat,
  Image,
  LayoutDashboard,
  LifeBuoy,
  Plus,
  ScrollText,
  Shield,
  Sparkles,
  Swords,
  Users,
  Wrench
} from "lucide-react";
import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import ActionButton from "../../components/ActionButton";
import CharacterEmptyState from "../../components/CharactersPage/CharacterEmptyState";
import CharacterRow from "../../components/CharactersPage/CharacterRow";
import { useAppSelector } from "../../store";
import {
  GUEST_CHARACTER_LIMIT,
  USER_CHARACTER_LIMIT,
  getCharacterLimitForAuth,
  hasReachedCharacterLimit
} from "../CharactersPage/characterLimits";
import { useCharacterRosterEntries } from "../CharactersPage/useCharacterRosterEntries";
import styles from "./HomePage.module.css";

function HomePage() {
  const navigate = useNavigate();
  const { status, user } = useAppSelector((state) => state.auth);
  const ownerId = status === "authenticated" && user ? user.id : null;
  const characters = useCharacterRosterEntries(ownerId);
  const characterLimit = getCharacterLimitForAuth(status, user?.role);
  const isCharacterLimitReached = hasReachedCharacterLimit(characters.length, characterLimit);
  const visibleCharacters = useMemo(() => characters.slice(0, 3), [characters]);
  const accountCapacityMultiplier = Math.floor(USER_CHARACTER_LIMIT / GUEST_CHARACTER_LIMIT);
  const shouldShowGuestBanner = status === "guest";

  return (
    <section className={styles.page}>
      <section className={styles.workbenchHero} aria-labelledby="home-dashboard-title">
        <div className={styles.heroContent}>
          <div className={styles.heroCopy}>
            <p className={styles.heroEyebrow}>
              <Construction size={16} aria-hidden="true" />
              <span>Under construction</span>
            </p>
            <h2 id="home-dashboard-title" className={styles.title}>
              Arcane Ledger Dashboard
            </h2>
            <p className={styles.heroText}>
              This home dashboard is actively being rebuilt. Big dashboard upgrades are being
              prepared.
            </p>
          </div>

          <div className={styles.headerActions}>
            <ActionButton
              icon={<Plus size={16} aria-hidden="true" />}
              fullWidth={false}
              disabled={isCharacterLimitReached}
              title={
                isCharacterLimitReached
                  ? `Character limit reached (${characterLimit}).`
                  : "Create a new character"
              }
              onClick={() => navigate("/characters/new")}
            >
              New Character
            </ActionButton>
            <Link to="/compendium" className={styles.secondaryAction}>
              <BookOpen size={16} aria-hidden="true" />
              <span>Compendium</span>
            </Link>
          </div>
        </div>

        <aside className={styles.constructionNotice} aria-label="Dashboard construction status">
          <HardHat className={styles.noticeIcon} aria-hidden="true" />
          <span className={styles.noticeKicker}>Work in progress</span>
          <strong>Dashboard build zone</strong>
          <span>Core tools, session panels, and table controls are still being assembled.</span>
          <div className={styles.noticeTools} aria-hidden="true">
            <Hammer size={18} />
            <Wrench size={18} />
          </div>
        </aside>
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

        <div className={styles.dashboardSide}>
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

          {shouldShowGuestBanner ? (
            <section className={styles.guestBanner} aria-labelledby="guest-benefits-title">
              <div className={styles.guestBannerHeader}>
                <p className={styles.guestBannerEyebrow}>
                  <Sparkles size={15} aria-hidden="true" />
                  <span>Consider registering</span>
                </p>
                <h3 id="guest-benefits-title" className={styles.guestBannerTitle}>
                  Account Benefits
                </h3>
              </div>

              <ul className={styles.guestBenefitList}>
                <li>
                  <Users size={18} aria-hidden="true" />
                  <span>
                    Create up to {USER_CHARACTER_LIMIT} characters, {accountCapacityMultiplier}x
                    the guest limit
                  </span>
                </li>
                <li>
                  <Cloud size={18} aria-hidden="true" />
                  <span>Cloud-stored characters you can open anywhere</span>
                </li>
                <li>
                  <Image size={18} aria-hidden="true" />
                  <span>Change avatars for your characters</span>
                </li>
                <li>
                  <LifeBuoy size={18} aria-hidden="true" />
                  <span>Submit support tickets when you need help</span>
                </li>
                <li>
                  <Swords size={18} aria-hidden="true" />
                  <span>Future party and combat tracking tools</span>
                </li>
                <li>
                  <Sparkles size={18} aria-hidden="true" />
                  <span>And much more as Arcane Ledger grows</span>
                </li>
              </ul>
            </section>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default HomePage;
