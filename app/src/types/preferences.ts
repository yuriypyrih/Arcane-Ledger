export type DiceRollerBehaviorPreference = "full_manual" | "manual_with_roller" | "full_auto";

export type Preferences = {
  diceRollerBehavior: DiceRollerBehaviorPreference;
  broadLayout: boolean;
};

export type PreferencesEnvelope = {
  preferences: Preferences;
};
