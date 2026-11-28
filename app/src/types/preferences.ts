export type DiceRollerBehaviorPreference = "full_manual" | "manual_with_roller" | "full_auto";
export type ThemeModePreference = "light" | "dark";

export type Preferences = {
  diceRollerBehavior: DiceRollerBehaviorPreference;
  broadLayout: boolean;
  themeMode: ThemeModePreference;
  /** Email when the GM schedules a new session (or moves its time). */
  emailNewSession: boolean;
  /** Email when the GM proposes a new time for a session. */
  emailReschedule: boolean;
  /** Show the red count on the notification bell. */
  notificationBadge: boolean;
};

export type PreferencesEnvelope = {
  preferences: Preferences;
};
