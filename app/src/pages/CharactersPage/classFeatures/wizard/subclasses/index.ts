import type {
  SubclassDerivedFeatureState,
  SubclassRuntimeCharacter,
  SubclassRuntimeRegistry
} from "../../subclassRuntime";
import { abjurerSubclassId, getWizardAbjurerDerivedFeatureState } from "./wizardAbjurer";
import {
  bladesingerSubclassId,
  getWizardBladesingerDerivedFeatureState
} from "./wizardBladesinger";
import { divinerSubclassId, getWizardDivinerDerivedFeatureState } from "./wizardDiviner";
import { evokerSubclassId, getWizardEvokerDerivedFeatureState } from "./wizardEvoker";
import {
  getWizardIllusionistDerivedFeatureState,
  illusionistSubclassId
} from "./wizardIllusionist";

const wizardSubclassRuntimeRegistry: SubclassRuntimeRegistry = {
  [abjurerSubclassId]: getWizardAbjurerDerivedFeatureState,
  [bladesingerSubclassId]: getWizardBladesingerDerivedFeatureState,
  [divinerSubclassId]: getWizardDivinerDerivedFeatureState,
  [evokerSubclassId]: getWizardEvokerDerivedFeatureState,
  [illusionistSubclassId]: getWizardIllusionistDerivedFeatureState
};

export function getWizardSubclassDerivedFeatureState(
  character: SubclassRuntimeCharacter
): SubclassDerivedFeatureState {
  if (character.className !== "Wizard" || !character.subclassId) {
    return {};
  }

  return wizardSubclassRuntimeRegistry[character.subclassId]?.(character) ?? {};
}
