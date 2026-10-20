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

export function getArtificerSubclassDerivedFeatureState(
  character: SubclassRuntimeCharacter
): SubclassDerivedFeatureState {
  if (!hasCharacterClass(character, "Artificer") || !getClassSubclassId(character, "Artificer")) {
    return {};
  }

  // Ability helpers import the class runtime again. Read subclass IDs and resolvers
  // only when deriving a character, after that module cycle has initialized.
  const artificerSubclassRuntimeRegistry: SubclassRuntimeRegistry = {
    [reanimatorSubclassId]: getArtificerReanimatorDerivedFeatureState,
    [alchemistSubclassId]: getArtificerAlchemistDerivedFeatureState,
    [armorerSubclassId]: getArtificerArmorerDerivedFeatureState,
    [artilleristSubclassId]: getArtificerArtilleristDerivedFeatureState,
    [battleSmithSubclassId]: getArtificerBattleSmithDerivedFeatureState,
    [cartographerSubclassId]: getArtificerCartographerDerivedFeatureState
  };

  return (
    artificerSubclassRuntimeRegistry[getClassSubclassId(character, "Artificer")]?.(character) ?? {}
  );
}
