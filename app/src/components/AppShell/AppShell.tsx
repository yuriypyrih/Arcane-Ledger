import { Outlet, useLocation } from "react-router-dom";
import PrimaryNav from "./PrimaryNav";
import { navigationLinks } from "./navigationLinks";
import styles from "./AppShell.module.css";

function AppShell() {
  const { pathname } = useLocation();
  const isDiceRoute = pathname.startsWith("/dice");

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>D&D App</h1>
        </div>
        <PrimaryNav links={navigationLinks} />
      </header>
      <main className={[styles.main, isDiceRoute ? styles.mainFullBleed : ""].join(" ").trim()}>
        <Outlet />
      </main>
    </div>
  );
}

export default AppShell;
