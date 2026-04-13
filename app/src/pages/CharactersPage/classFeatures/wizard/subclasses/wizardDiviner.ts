import type { SubclassRuntimeResolver } from "../../subclassRuntime";
import type { FeatureActionCard } from "../../types";
import { getWizardSavantSpellIdsFromFeatureState } from "../savant";
import { transformWizardDivinerExpertDivinationSpell } from "./wizardDivinerExpertDivination";
import { divinerSubclassId as wizardDivinerSubclassId } from "./wizardDivinerShared";
import { getWizardDivinerPortentFeatureAction } from "./wizardDivinerPortent";
import { getWizardDivinerThirdEyeFeatureAction } from "./wizardDivinerThirdEye";

export const divinerSubclassId = wizardDivinerSubclassId;

export const getWizardDivinerDerivedFeatureState: SubclassRuntimeResolver = (character) => {
  if (typeof character.level !== "number") {
    return {};
  }

  const portentAction = getWizardDivinerPortentFeatureAction(character);
  const thirdEyeAction = getWizardDivinerThirdEyeFeatureAction(character);
  const featureActions: FeatureActionCard[] = [portentAction, thirdEyeAction].filter(
    (action): action is FeatureActionCard => action !== null
  );

  return {
    alwaysSpellbookSpellIds: getWizardSavantSpellIdsFromFeatureState({
      className: character.className,
      level: character.level,
      subclassId: character.subclassId,
      classFeatureState: character.classFeatureState
    }),
    featureActions,
    transformSpellEntry: (spell) => transformWizardDivinerExpertDivinationSpell(character, spell)
  };
};
