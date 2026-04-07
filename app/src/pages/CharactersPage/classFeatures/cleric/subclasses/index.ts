import type {
  SubclassDerivedFeatureState,
  SubclassRuntimeCharacter,
  SubclassRuntimeRegistry
} from "../../subclassRuntime";
import {
  getClericKnowledgeDomainDerivedFeatureState,
  knowledgeDomainSubclassId
} from "./clericKnowledgeDomain";
import { getClericLifeDomainDerivedFeatureState, lifeDomainSubclassId } from "./clericLifeDomain";
import {
  getClericLightDomainDerivedFeatureState,
  lightDomainSubclassId
} from "./clericLightDomain";
import {
  getClericTrickeryDomainDerivedFeatureState,
  trickeryDomainSubclassId
} from "./clericTrickeryDomain";
import { getClericWarDomainDerivedFeatureState, warDomainSubclassId } from "./clericWarDomain";

const clericSubclassRuntimeRegistry: SubclassRuntimeRegistry = {
  [knowledgeDomainSubclassId]: getClericKnowledgeDomainDerivedFeatureState,
  [lifeDomainSubclassId]: getClericLifeDomainDerivedFeatureState,
  [lightDomainSubclassId]: getClericLightDomainDerivedFeatureState,
  [trickeryDomainSubclassId]: getClericTrickeryDomainDerivedFeatureState,
  [warDomainSubclassId]: getClericWarDomainDerivedFeatureState
};

export function getClericSubclassDerivedFeatureState(
  character: SubclassRuntimeCharacter
): SubclassDerivedFeatureState {
  if (character.className !== "Cleric" || !character.subclassId) {
    return {};
  }

  return clericSubclassRuntimeRegistry[character.subclassId]?.(character) ?? {};
}
