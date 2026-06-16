import { useEffect, useState } from "react";
import { Outlet, useMatch } from "react-router-dom";
import { useMediaQuery } from "../../lib/useMediaQuery";
import {
  applyThemeModePreferenceToDocument,
  getBroadLayoutPreference,
  getThemeModePreference,
  PREFERENCES_CHANGED_EVENT,
  updateBroadLayoutPreference,
  updateThemeModePreference
} from "../../storage/preferences";
import type { ThemeModePreference } from "../../storage/preferences";
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
  const characterSheetLocalId =
    characterSheetId && /^\d+$/.test(characterSheetId) ? Number(characterSheetId) : null;
  const isLgUp = useMediaQuery(MEDIA_QUERIES.lgUp);
  const isLgOnly = useMediaQuery(MEDIA_QUERIES.lgOnly);
  const [broadLayout, setBroadLayout] = useState(() => getBroadLayoutPreference());
  const [themeMode, setThemeMode] = useState<ThemeModePreference>(() => getThemeModePreference());
  const showBroadLayoutSwitch = characterSheetLocalId !== null && isLgUp;
  const isBroadLayoutActive = broadLayout && showBroadLayoutSwitch;
  const useLgCompactScale = isBroadLayoutActive && isLgOnly;

  useEffect(() => {
    applyThemeModePreferenceToDocument(themeMode);
  }, [themeMode]);

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

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    function syncPreferences() {
      setBroadLayout(getBroadLayoutPreference());
      setThemeMode(getThemeModePreference());
    }

    window.addEventListener(PREFERENCES_CHANGED_EVENT, syncPreferences);

    return () => {
      window.removeEventListener(PREFERENCES_CHANGED_EVENT, syncPreferences);
    };
  }, []);

  function toggleBroadLayout() {
    const nextBroadLayout = !broadLayout;
    setBroadLayout(nextBroadLayout);
    updateBroadLayoutPreference(nextBroadLayout);
  }

  function toggleThemeMode() {
    const nextThemeMode: ThemeModePreference = themeMode === "dark" ? "light" : "dark";
    setThemeMode(nextThemeMode);
    updateThemeModePreference(nextThemeMode);
  }

  const outletContext: AppShellOutletContext = {
    isBroadLayoutActive,
    themeMode,
    onToggleThemeMode: toggleThemeMode
  };

  return (
    <div className={isBroadLayoutActive ? `${styles.shell} ${styles.shellBroad}` : styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <PrimaryNav
            links={navigationLinks}
            broadLayout={broadLayout}
            characterSheetId={characterSheetLocalId}
            showBroadLayoutSwitch={showBroadLayoutSwitch}
            themeMode={themeMode}
            onToggleBroadLayout={toggleBroadLayout}
            onToggleThemeMode={toggleThemeMode}
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
