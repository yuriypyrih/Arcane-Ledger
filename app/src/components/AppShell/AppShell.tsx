import { Outlet } from "react-router-dom";
import PrimaryNav from "./PrimaryNav";
import { navigationLinks } from "./navigationLinks";
import styles from "./AppShell.module.css";

function AppShell() {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>Offline-first party tools</p>
          <h1 className={styles.title}>DnD Companion</h1>
        </div>
        <PrimaryNav links={navigationLinks} />
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

export default AppShell;
