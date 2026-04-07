import type {
  SubclassDerivedFeatureState,
  SubclassRuntimeCharacter,
  SubclassRuntimeRegistry
} from "../../subclassRuntime";
import {
  archfeyPatronSubclassId,
  getWarlockArchfeyPatronDerivedFeatureState
} from "./warlockArchfeyPatron";
import {
  celestialPatronSubclassId,
  getWarlockCelestialPatronDerivedFeatureState
} from "./warlockCelestialPatron";
import { fiendPatronSubclassId, getWarlockFiendPatronDerivedFeatureState } from "./warlockFiendPatron";
import {
  getWarlockGreatOldOnePatronDerivedFeatureState,
  greatOldOnePatronSubclassId
} from "./warlockGreatOldOnePatron";

const warlockSubclassRuntimeRegistry: SubclassRuntimeRegistry = {
  [archfeyPatronSubclassId]: getWarlockArchfeyPatronDerivedFeatureState,
  [celestialPatronSubclassId]: getWarlockCelestialPatronDerivedFeatureState,
  [fiendPatronSubclassId]: getWarlockFiendPatronDerivedFeatureState,
  [greatOldOnePatronSubclassId]: getWarlockGreatOldOnePatronDerivedFeatureState
};

export function getWarlockSubclassDerivedFeatureState(
  character: SubclassRuntimeCharacter
): SubclassDerivedFeatureState {
  if (character.className !== "Warlock" || !character.subclassId) {
    return {};
  }

  return warlockSubclassRuntimeRegistry[character.subclassId]?.(character) ?? {};
}
