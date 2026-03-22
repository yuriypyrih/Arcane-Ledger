export type CharacterRageFeatureState = {
  usesExpended: number;
  active: boolean;
};

export type CharacterClassFeatureState = {
  rage?: CharacterRageFeatureState;
};
