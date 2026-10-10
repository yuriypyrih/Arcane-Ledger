import { hasCharacterClass, getClassSubclassId } from "../../../multiclassState";
import type {
  SubclassDerivedFeatureState,
  SubclassRuntimeCharacter,
  SubclassRuntimeRegistry
} from "../../subclassRuntime";
import {
  alchemistSubclassId,
  getArtificerAlchemistDerivedFeatureState
} from "./artificerAlchemist";
import { armorerSubclassId, getArtificerArmorerDerivedFeatureState } from "./artificerArmorer";
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

import {
  reanimatorSubclassId,
  getArtificerReanimatorDerivedFeatureState
} from "./artificerReanimator";

const artificerSubclassRuntimeRegistry: SubclassRuntimeRegistry = {
  [reanimatorSubclassId]: getArtificerReanimatorDerivedFeatureState,
  [alchemistSubclassId]: getArtificerAlchemistDerivedFeatureState,
  [armorerSubclassId]: getArtificerArmorerDerivedFeatureState,
  [artilleristSubclassId]: getArtificerArtilleristDerivedFeatureState,
  [battleSmithSubclassId]: getArtificerBattleSmithDerivedFeatureState,
  [cartographerSubclassId]: getArtificerCartographerDerivedFeatureState
};

export function getArtificerSubclassDerivedFeatureState(
  character: SubclassRuntimeCharacter
): SubclassDerivedFeatureState {
  if (!hasCharacterClass(character, "Artificer") || !getClassSubclassId(character, "Artificer")) {
    return {};
  }

  return (
    artificerSubclassRuntimeRegistry[getClassSubclassId(character, "Artificer")]?.(character) ?? {}
  );
}
