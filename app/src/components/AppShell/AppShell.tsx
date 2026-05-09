import { useState } from "react";
import { Outlet, useMatch } from "react-router-dom";
import { useMediaQuery } from "../../lib/useMediaQuery";
import {
  getBroadLayoutPreference,
  updateBroadLayoutPreference
} from "../../storage/preferences";
import { MEDIA_QUERIES } from "../../styles/breakpoints";
import ToastHost from "../ToastViewport";
import PrimaryNav from "./PrimaryNav";
import { navigationLinks } from "./navigationLinks";
import type { AppShellOutletContext } from "./outletContext";
import styles from "./AppShell.module.css";

function AppShell() {
  const characterSheetMatch = useMatch({ path: "/characters/:characterId", end: true });
  const isXlUp = useMediaQuery(MEDIA_QUERIES.xlUp);
  const [broadLayout, setBroadLayout] = useState(() => getBroadLayoutPreference());
  const showBroadLayoutSwitch = Boolean(characterSheetMatch) && isXlUp;
  const isBroadLayoutActive = broadLayout && showBroadLayoutSwitch;
  const outletContext: AppShellOutletContext = {
    isBroadLayoutActive
  };

  function toggleBroadLayout() {
    const nextBroadLayout = !broadLayout;
    setBroadLayout(nextBroadLayout);
    updateBroadLayoutPreference(nextBroadLayout);
  }

  return (
    <div className={isBroadLayoutActive ? `${styles.shell} ${styles.shellBroad}` : styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <PrimaryNav
            links={navigationLinks}
            broadLayout={broadLayout}
            showBroadLayoutSwitch={showBroadLayoutSwitch}
            onToggleBroadLayout={toggleBroadLayout}
          />
        </div>
      </header>
      <main className={styles.main}>
        <Outlet context={outletContext} />
      </main>
      <ToastHost />
    </div>
  );
}

export default AppShell;
