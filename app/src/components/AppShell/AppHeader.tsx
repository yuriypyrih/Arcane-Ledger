import PrimaryNav from "./PrimaryNav";
import { navigationLinks } from "./navigationLinks";
import type { ThemeModePreference } from "../../storage/preferences";
import styles from "./AppShell.module.css";

type AppHeaderProps = {
  broadLayout?: boolean;
  characterSheetId?: number | null;
  /** Drops the page-gutter margins, for screens that are not laid out by the app shell. */
  flush?: boolean;
  showBroadLayoutSwitch?: boolean;
  themeMode: ThemeModePreference;
  onToggleBroadLayout?: () => void;
  onToggleThemeMode: () => void;
};

function ignore() {
  // The broad layout switch is hidden on screens without a character sheet.
}

/** The app's top bar, shared by the app shell and by full-bleed screens such as the table view. */
function AppHeader({
  broadLayout = false,
  characterSheetId = null,
  flush = false,
  showBroadLayoutSwitch = false,
  themeMode,
  onToggleBroadLayout = ignore,
  onToggleThemeMode
}: AppHeaderProps) {
  return (
    <header className={flush ? `${styles.header} ${styles.headerFlush}` : styles.header}>
      <div className={styles.headerInner}>
        <PrimaryNav
          links={navigationLinks}
          broadLayout={broadLayout}
          characterSheetId={characterSheetId}
          showBroadLayoutSwitch={showBroadLayoutSwitch}
          themeMode={themeMode}
          onToggleBroadLayout={onToggleBroadLayout}
          onToggleThemeMode={onToggleThemeMode}
        />
      </div>
    </header>
  );
}

export default AppHeader;
