import { BookOpen, Dices, Home, ScrollText } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import styles from "./AppShell.module.css";

const links = [
  { to: "/", label: "Home", icon: Home },
  { to: "/dice", label: "Dice", icon: Dices },
  { to: "/characters", label: "Characters", icon: ScrollText },
  { to: "/codex", label: "Codex", icon: BookOpen }
];

function AppShell() {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>Offline-first party tools</p>
          <h1 className={styles.title}>DnD Companion</h1>
        </div>
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
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

export default AppShell;
