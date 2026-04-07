import type {
  SubclassDerivedFeatureState,
  SubclassRuntimeCharacter,
  SubclassRuntimeRegistry
} from "../../subclassRuntime";
import {
  aberrantSorcerySubclassId,
  getSorcererAberrantSorceryDerivedFeatureState
} from "./sorcererAberrantSorcery";
import {
  clockworkSorcerySubclassId,
  getSorcererClockworkSorceryDerivedFeatureState
} from "./sorcererClockworkSorcery";
import {
  draconicSorcerySubclassId,
  getSorcererDraconicSorceryDerivedFeatureState
} from "./sorcererDraconicSorcery";
import {
  getSorcererSpellfireSorceryDerivedFeatureState,
  spellfireSorcerySubclassId
} from "./sorcererSpellfireSorcery";
import {
  getSorcererWildMagicSorceryDerivedFeatureState,
  wildMagicSorcerySubclassId
} from "./sorcererWildMagicSorcery";

const sorcererSubclassRuntimeRegistry: SubclassRuntimeRegistry = {
  [aberrantSorcerySubclassId]: getSorcererAberrantSorceryDerivedFeatureState,
  [clockworkSorcerySubclassId]: getSorcererClockworkSorceryDerivedFeatureState,
  [draconicSorcerySubclassId]: getSorcererDraconicSorceryDerivedFeatureState,
  [spellfireSorcerySubclassId]: getSorcererSpellfireSorceryDerivedFeatureState,
  [wildMagicSorcerySubclassId]: getSorcererWildMagicSorceryDerivedFeatureState
};

export function getSorcererSubclassDerivedFeatureState(
  character: SubclassRuntimeCharacter
): SubclassDerivedFeatureState {
  if (character.className !== "Sorcerer" || !character.subclassId) {
    return {};
  }

  return sorcererSubclassRuntimeRegistry[character.subclassId]?.(character) ?? {};
}
