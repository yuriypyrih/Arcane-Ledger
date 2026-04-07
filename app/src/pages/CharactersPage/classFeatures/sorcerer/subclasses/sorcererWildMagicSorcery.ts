import type { SubclassRuntimeResolver } from "../../subclassRuntime";

export const wildMagicSorcerySubclassId = "sorcerer-wild-magic-sorcery";

export const getSorcererWildMagicSorceryDerivedFeatureState: SubclassRuntimeResolver = () => ({
  alwaysPreparedSpellIds: []
});
