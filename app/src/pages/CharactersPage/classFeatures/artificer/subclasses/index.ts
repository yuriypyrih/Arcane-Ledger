import type {
  SubclassDerivedFeatureState,
  SubclassRuntimeCharacter,
  SubclassRuntimeRegistry
} from "../../subclassRuntime";
import {
  alchemistSubclassId,
  getArtificerAlchemistDerivedFeatureState
} from "./artificerAlchemist";
import {
  armorerSubclassId,
  getArtificerArmorerDerivedFeatureState
} from "./artificerArmorer";
import {
  artilleristSubclassId,
  getArtificerArtilleristDerivedFeatureState
} from "./artificerArtillerist";
import {
  battleSmithSubclassId,
  getArtificerBattleSmithDerivedFeatureState
} from "./artificerBattleSmith";
import {
  cartographerSubclassId,
  getArtificerCartographerDerivedFeatureState
} from "./artificerCartographer";

const artificerSubclassRuntimeRegistry: SubclassRuntimeRegistry = {
  [alchemistSubclassId]: getArtificerAlchemistDerivedFeatureState,
  [armorerSubclassId]: getArtificerArmorerDerivedFeatureState,
  [artilleristSubclassId]: getArtificerArtilleristDerivedFeatureState,
  [battleSmithSubclassId]: getArtificerBattleSmithDerivedFeatureState,
  [cartographerSubclassId]: getArtificerCartographerDerivedFeatureState
};

export function getArtificerSubclassDerivedFeatureState(
  character: SubclassRuntimeCharacter
): SubclassDerivedFeatureState {
  if (character.className !== "Artificer" || !character.subclassId) {
    return {};
  }

  return artificerSubclassRuntimeRegistry[character.subclassId]?.(character) ?? {};
}
