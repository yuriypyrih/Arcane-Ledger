export type DiceRollerBehaviorPreference = "full_manual" | "manual_with_roller" | "full_auto";
export type ThemeModePreference = "light" | "dark";

export type Preferences = {
  diceRollerBehavior: DiceRollerBehaviorPreference;
  broadLayout: boolean;
  themeMode: ThemeModePreference;
};

export type PreferencesEnvelope = {
  preferences: Preferences;
};
