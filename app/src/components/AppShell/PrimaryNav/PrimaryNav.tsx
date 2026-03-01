import { NavLink } from "react-router-dom";
import type { NavigationLink } from "../navigationLinks";
import styles from "./PrimaryNav.module.css";

type PrimaryNavProps = {
  links: NavigationLink[];
};

function PrimaryNav({ links }: PrimaryNavProps) {
  return (
    <nav className={styles.nav} aria-label="Primary">
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
          }
          end={to === "/"}
        >
          <Icon size={16} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export default PrimaryNav;
