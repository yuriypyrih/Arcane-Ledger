import { Menu } from "lucide-react";
import { NavLink } from "react-router-dom";
import type { NavigationLink } from "../navigationLinks";
import styles from "./PrimaryNav.module.css";

type PrimaryNavProps = {
  links: NavigationLink[];
  broadLayout: boolean;
  showBroadLayoutSwitch: boolean;
  onToggleBroadLayout: () => void;
};

function PrimaryNav({
  links,
  broadLayout,
  showBroadLayoutSwitch,
  onToggleBroadLayout
}: PrimaryNavProps) {
  return (
    <nav className={styles.nav} aria-label="Primary">
      <div className={styles.leftCluster}>
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? `${styles.brandLink} ${styles.navLinkActive}` : styles.brandLink
          }
          end
          aria-label="Arcane Ledger home"
        >
          <span>Arcane Ledger</span>
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
            onClick={onToggleBroadLayout}
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
