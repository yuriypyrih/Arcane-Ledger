export const DICE_ROLLER_BEHAVIOR_PREFERENCES = [
  "full_manual",
  "manual_with_roller",
  "full_auto"
] as const;

export const THEME_MODE_PREFERENCES = ["light", "dark"] as const;

export type DiceRollerBehaviorPreference = (typeof DICE_ROLLER_BEHAVIOR_PREFERENCES)[number];
export type ThemeModePreference = (typeof THEME_MODE_PREFERENCES)[number];

export type UserPreferences = {
  diceRollerBehavior: DiceRollerBehaviorPreference;
  broadLayout: boolean;
  themeMode: ThemeModePreference;
};

export type UserPreferencesEnvelope = {
  preferences: UserPreferences;
};
