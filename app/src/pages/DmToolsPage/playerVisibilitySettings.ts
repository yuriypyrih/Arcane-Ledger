import type { PlayerVisibilitySettings } from "../../api/campaigns";

export const DEFAULT_PLAYER_VISIBILITY_SETTINGS = {
  showVitalityStatus: true,
  showHpBar: false,
  showMonsterType: false,
  showBaseStatBlockDescription: false,
  showDmDescription: false,
  showArmorClass: false,
  showChallengeRating: false,
  showAbilityScoresAndSavingThrows: false,
  showResistancesAndImmunities: false,
  showSkills: false,
  showSenses: false,
  showLanguages: false,
  showActionsAndReactions: false
} satisfies PlayerVisibilitySettings;

export type PlayerVisibilitySettingKey = keyof PlayerVisibilitySettings;

export type PlayerVisibilitySettingGroup = {
  label: string;
  settings: {
    key: PlayerVisibilitySettingKey;
    label: string;
  }[];
};

export const PLAYER_VISIBILITY_SETTING_GROUPS: PlayerVisibilitySettingGroup[] = [
  {
    label: "Vitality",
    settings: [
      { key: "showVitalityStatus", label: "Show vitality status" },
      { key: "showHpBar", label: "Show HP bar" }
    ]
  },
  {
    label: "Description",
    settings: [
      { key: "showMonsterType", label: "Show monster type" },
      { key: "showBaseStatBlockDescription", label: "Show base stat block description" },
      { key: "showDmDescription", label: "Show DM's description" }
    ]
  },
  {
    label: "Stats & Actions",
    settings: [
      { key: "showArmorClass", label: "Show Armor Class" },
      { key: "showChallengeRating", label: "Show Challenge Rating" },
      { key: "showAbilityScoresAndSavingThrows", label: "Show Ability Scores & Saving Throws" },
      { key: "showResistancesAndImmunities", label: "Show Resistances & Immunities" },
      { key: "showSkills", label: "Show Skills" },
      { key: "showSenses", label: "Show Senses" },
      { key: "showLanguages", label: "Show Languages" },
      { key: "showActionsAndReactions", label: "Show Actions & Reactions" }
    ]
  }
];

export function createPlayerVisibilitySettings(
  settings: PlayerVisibilitySettings | null | undefined
) {
  return {
    ...DEFAULT_PLAYER_VISIBILITY_SETTINGS,
    ...(settings ?? {})
  };
}
