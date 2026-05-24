export const DICE_ROLLER_BEHAVIOR_PREFERENCES = [
  "full_manual",
  "manual_with_roller",
  "full_auto"
] as const;

export type DiceRollerBehaviorPreference = (typeof DICE_ROLLER_BEHAVIOR_PREFERENCES)[number];

export type UserPreferences = {
  diceRollerBehavior: DiceRollerBehaviorPreference;
  broadLayout: boolean;
};

export type UserPreferencesEnvelope = {
  preferences: UserPreferences;
};
