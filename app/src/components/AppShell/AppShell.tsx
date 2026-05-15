import { useEffect, useState } from "react";
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

const BROAD_LAYOUT_LG_COMPACT_CLASS = "broad-layout-lg-compact";

function AppShell() {
  const characterSheetMatch = useMatch({ path: "/characters/:characterId", end: true });
  const characterSheetId = characterSheetMatch?.params.characterId;
  const isLgUp = useMediaQuery(MEDIA_QUERIES.lgUp);
  const isLgOnly = useMediaQuery(MEDIA_QUERIES.lgOnly);
  const [broadLayout, setBroadLayout] = useState(() => getBroadLayoutPreference());
  const showBroadLayoutSwitch =
    Boolean(characterSheetId && /^\d+$/.test(characterSheetId)) && isLgUp;
  const isBroadLayoutActive = broadLayout && showBroadLayoutSwitch;
  const useLgCompactScale = isBroadLayoutActive && isLgOnly;
  const outletContext: AppShellOutletContext = {
    isBroadLayoutActive
  };

  useEffect(() => {
    if (typeof document === "undefined") {
      return undefined;
    }

    document.documentElement.classList.toggle(
      BROAD_LAYOUT_LG_COMPACT_CLASS,
      useLgCompactScale
    );

    return () => {
      document.documentElement.classList.remove(BROAD_LAYOUT_LG_COMPACT_CLASS);
    };
  }, [useLgCompactScale]);

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
