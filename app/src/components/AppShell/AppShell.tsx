import { Outlet } from "react-router-dom";
import ToastHost from "../ToastViewport";
import PrimaryNav from "./PrimaryNav";
import { navigationLinks } from "./navigationLinks";
import styles from "./AppShell.module.css";

function AppShell() {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <PrimaryNav links={navigationLinks} />
        </div>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
      <ToastHost />
    </div>
  );
}

export default AppShell;
