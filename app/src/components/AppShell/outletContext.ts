import type { ThemeModePreference } from "../../storage/preferences";

export type AppShellOutletContext = {
  isBroadLayoutActive: boolean;
  themeMode: ThemeModePreference;
  onToggleThemeMode: () => void;
};
