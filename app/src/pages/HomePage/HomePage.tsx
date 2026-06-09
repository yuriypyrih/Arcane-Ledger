import {
  Cloud,
  Headset,
  Image,
  Sparkles,
  Swords,
  Users
} from "lucide-react";
import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import ActionButton from "../../components/ActionButton";
import CharacterEmptyState from "../../components/CharactersPage/CharacterEmptyState";
import CharacterRow from "../../components/CharactersPage/CharacterRow";
import { useAppSelector } from "../../store";
import { GUEST_CHARACTER_LIMIT, USER_CHARACTER_LIMIT } from "../CharactersPage/characterLimits";
import { useCharacterRosterEntries } from "../CharactersPage/useCharacterRosterEntries";
import { DM_TOOLS_TABS, createDmToolsPath, type DmToolsTabId } from "../DmToolsPage/dmToolsTabs";
import styles from "./HomePage.module.css";

const dmToolToneClassNames = {
  "campaign-manager": styles.toolToneCampaign,
  "party-manager": styles.toolToneParty,
  "encounter-templates": styles.toolToneEncounter
} satisfies Record<DmToolsTabId, string>;

function HomePage() {
  const navigate = useNavigate();
  const { status, user } = useAppSelector((state) => state.auth);
  const ownerId = status === "authenticated" && user ? user.id : null;
  const characters = useCharacterRosterEntries(ownerId);
  const visibleCharacters = useMemo(() => characters.slice(0, 3), [characters]);
  const accountCapacityMultiplier = Math.floor(USER_CHARACTER_LIMIT / GUEST_CHARACTER_LIMIT);
  const shouldShowGuestBanner = status === "guest";
  const shouldShowGmTools = status === "authenticated";
  const canUseDmTools = user?.role === "admin" || user?.role === "keeper";

  return (
    <section className={styles.page}>
      <section className={styles.workbenchHero} aria-labelledby="home-dashboard-title">
        <div className={styles.heroContent}>
          <div className={styles.heroPortrait} aria-hidden="true">
            <img
              className={styles.heroPortraitImage}
              src="/icons/icon-512.png"
              alt=""
              width="512"
              height="512"
            />
          </div>
          <div className={styles.heroCopy}>
            <h2 id="home-dashboard-title" className={styles.title}>
              <span className={styles.titleText}>Arcane Ledger</span>
              <span className={styles.titleRuneLayer} aria-hidden="true" />
            </h2>
            <p className={styles.heroText}>
              A powerful artifact for bringing your fantasy to life, kept by ancient scribes who
              remember your spells, classes, inventory, bestiary, and much more.
            </p>
            <p className={styles.heroRuleLine}>Compatible with 5e and PHB 2024 rules</p>
            <p className={styles.heroCustomLine}>
              A versatile tool with enough room for even the wildest homebrews.
            </p>
          </div>
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
            <div className={styles.emptyCharacterRow}>
              <CharacterEmptyState className={styles.emptyCharacterMessage} />
              <ActionButton
                className={styles.emptyCharacterCreateAction}
                fullWidth={false}
                onClick={() => navigate("/characters/new")}
              >
                + New Character
              </ActionButton>
            </div>
          )}
        </section>

        <div className={styles.dashboardSide}>
          {shouldShowGmTools ? (
            <section className={styles.panel} aria-labelledby="home-tools-title">
              <div className={styles.panelHeader}>
                <div>
                  <p className={styles.eyebrow}>GM tools</p>
                  <h3 id="home-tools-title" className={styles.panelTitle}>
                    Prep Tray
                  </h3>
                </div>
              </div>
              <div className={styles.toolGrid}>
                {DM_TOOLS_TABS.map(({ homeLabel, icon: ToolIcon, id }) => {
                  const toolButtonClassName = `${styles.toolButton} ${dmToolToneClassNames[id]}`;

                  return canUseDmTools ? (
                    <Link key={id} to={createDmToolsPath(id)} className={toolButtonClassName}>
                      <ToolIcon size={16} aria-hidden="true" />
                      <span className={styles.toolText}>
                        <strong>{homeLabel}</strong>
                      </span>
                    </Link>
                  ) : (
                    <button
                      key={id}
                      type="button"
                      className={`${toolButtonClassName} ${styles.toolButtonDisabled}`}
                      disabled
                      title="GM tools require Keeper or Admin access."
                    >
                      <ToolIcon size={16} aria-hidden="true" />
                      <span className={styles.toolText}>
                        <strong>{homeLabel}</strong>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          ) : null}

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
                    Create up to {USER_CHARACTER_LIMIT} characters, {accountCapacityMultiplier}x the
                    guest limit
                  </span>
                </li>
                <li>
                  <Cloud size={18} aria-hidden="true" />
                  <span>Cloud-stored characters you can open anywhere</span>
                </li>
                <li>
                  <Swords size={18} aria-hidden="true" />
                  <span>GM Tools like Campaign Manager and Encounter Tracker</span>
                </li>
                <li>
                  <Image size={18} aria-hidden="true" />
                  <span>Change avatars for your characters</span>
                </li>
                <li>
                  <Headset size={18} aria-hidden="true" />
                  <span>Submit support tickets when you need help</span>
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
