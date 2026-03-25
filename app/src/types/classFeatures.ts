export type CharacterRageFeatureState = {
  usesExpended: number;
  active: boolean;
};

export type ClericDivineOrderChoice = "protector" | "thaumaturge";
export type ClericBlessedStrikesChoice = "blessed-strike" | "potent-spellcasting";

export type CharacterClericFeatureState = {
  divineOrderChoice?: ClericDivineOrderChoice;
  blessedStrikesChoice?: ClericBlessedStrikesChoice;
  blessedStrikeUsedThisTurn?: boolean;
  channelDivinityUsesExpended?: number;
  divineInterventionUsed?: boolean;
};

export type CharacterClassFeatureState = {
  rage?: CharacterRageFeatureState;
  cleric?: CharacterClericFeatureState;
};
