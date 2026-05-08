import { Home, Menu } from "lucide-react";
import { useState } from "react";
import { NavLink, useMatch } from "react-router-dom";
import { useMediaQuery } from "../../../lib/useMediaQuery";
import {
  getBroadLayoutPreference,
  updateBroadLayoutPreference
} from "../../../storage/preferences";
import { MEDIA_QUERIES } from "../../../styles/breakpoints";
import type { NavigationLink } from "../navigationLinks";
import styles from "./PrimaryNav.module.css";

type PrimaryNavProps = {
  links: NavigationLink[];
};

function PrimaryNav({ links }: PrimaryNavProps) {
  const characterSheetMatch = useMatch({ path: "/characters/:characterId", end: true });
  const isXlUp = useMediaQuery(MEDIA_QUERIES.xlUp);
  const [broadLayout, setBroadLayout] = useState(() => getBroadLayoutPreference());
  const showBroadLayoutSwitch = Boolean(characterSheetMatch) && isXlUp;

  function toggleBroadLayout() {
    const nextBroadLayout = !broadLayout;
    setBroadLayout(nextBroadLayout);
    updateBroadLayoutPreference(nextBroadLayout);
  }

  return (
    <nav className={styles.nav} aria-label="Primary">
      <div className={styles.leftCluster}>
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? `${styles.brandLink} ${styles.navLinkActive}` : styles.brandLink
          }
          end
          aria-label="D&D Companion home"
        >
          <Home size={16} aria-hidden="true" />
          <span>D&amp;D Companion</span>
        </NavLink>
        <div className={styles.linkGroup}>
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
              }
            >
              <Icon size={15} aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </div>
      <div className={styles.rightCluster}>
        {showBroadLayoutSwitch ? (
          <button
            type="button"
            role="switch"
            aria-checked={broadLayout}
            className={
              broadLayout
                ? `${styles.broadLayoutSwitch} ${styles.broadLayoutSwitchActive}`
                : styles.broadLayoutSwitch
            }
            onClick={toggleBroadLayout}
          >
            <span className={styles.broadLayoutLabel}>Broad Layout</span>
            <span className={styles.switchTrack} aria-hidden="true">
              <span className={styles.switchThumb} />
            </span>
          </button>
        ) : null}
        <button
          type="button"
          className={styles.menuButton}
          disabled
          aria-label="More options"
          title="More options"
        >
          <Menu size={17} aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}

export default PrimaryNav;
