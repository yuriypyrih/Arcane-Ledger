import {
  graveDomainSubclassId,
  getClericGraveDomainDerivedFeatureState
} from "./clericGraveDomain";
import {
  arcanaDomainSubclassId,
  getClericArcanaDomainDerivedFeatureState
} from "./clericArcanaDomain";
import { hasCharacterClass, getClassSubclassId } from "../../../multiclassState";
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
  [graveDomainSubclassId]: getClericGraveDomainDerivedFeatureState,
  [arcanaDomainSubclassId]: getClericArcanaDomainDerivedFeatureState,
  [knowledgeDomainSubclassId]: getClericKnowledgeDomainDerivedFeatureState,
  [lifeDomainSubclassId]: getClericLifeDomainDerivedFeatureState,
  [lightDomainSubclassId]: getClericLightDomainDerivedFeatureState,
  [trickeryDomainSubclassId]: getClericTrickeryDomainDerivedFeatureState,
  [warDomainSubclassId]: getClericWarDomainDerivedFeatureState
};

export function getClericSubclassDerivedFeatureState(
  character: SubclassRuntimeCharacter
): SubclassDerivedFeatureState {
  if (!hasCharacterClass(character, "Cleric") || !getClassSubclassId(character, "Cleric")) {
    return {};
  }

  return clericSubclassRuntimeRegistry[getClassSubclassId(character, "Cleric")]?.(character) ?? {};
}
