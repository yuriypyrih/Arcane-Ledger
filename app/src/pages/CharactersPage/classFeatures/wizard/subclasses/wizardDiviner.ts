import { CLASS_FEATURE } from "../../../../../codex/entries";
import type { Character } from "../../../../../types";
import {
  compileFeatureContributions,
  createSubclassContributionSource,
  projectCompiledContributionsToSubclassDerivedFeatureState,
  type FeatureContributionSpec
} from "../../../featureContributions";
import type { SubclassRuntimeResolver } from "../../subclassRuntime";
import type { FeatureActionCard } from "../../types";
import { getWizardSavantSpellIdsFromFeatureState } from "../savant";
import { transformWizardDivinerExpertDivinationSpell } from "./wizardDivinerExpertDivination";
import {
  divinerSubclassId as wizardDivinerSubclassId,
  hasWizardDivinerFeature
} from "./wizardDivinerShared";
import { getWizardDivinerPortentFeatureAction } from "./wizardDivinerPortent";
import { getWizardDivinerThirdEyeFeatureAction } from "./wizardDivinerThirdEye";

export const divinerSubclassId = wizardDivinerSubclassId;

function createWizardDivinerSource(input: {
  id: string;
  label: string;
  entryId: CLASS_FEATURE;
}) {
  return createSubclassContributionSource({
    ...input,
    id: `wizard-diviner-${input.id}`
  });
}

export function collectWizardDivinerContributions(
  character: Parameters<SubclassRuntimeResolver>[0]
): FeatureContributionSpec[] {
  if (
    character.className !== "Wizard" ||
    character.subclassId !== divinerSubclassId ||
    typeof character.level !== "number"
  ) {
    return [];
  }

  const portentAction = getWizardDivinerPortentFeatureAction(character);
  const thirdEyeAction = getWizardDivinerThirdEyeFeatureAction(character);
  const featureActions: FeatureActionCard[] = [portentAction, thirdEyeAction].filter(
    (action): action is FeatureActionCard => action !== null
  );
  const contributions: FeatureContributionSpec[] = [
    {
      source: createWizardDivinerSource({
        id: "divination-savant",
        label: "Divination Savant",
        entryId: CLASS_FEATURE.DIVINATION_SAVANT
      }),
      alwaysSpellbookSpellIds: getWizardSavantSpellIdsFromFeatureState({
        className: character.className,
        level: character.level,
        subclassId: character.subclassId,
        classFeatureState: character.classFeatureState
      })
    }
  ];

  if (portentAction) {
    contributions.push({
      source: createWizardDivinerSource({
        id: "portent",
        label: "Portent",
        entryId: CLASS_FEATURE.PORTENT
      }),
      actions: [portentAction]
    });
  }

  if (hasWizardDivinerFeature(character, 6)) {
    contributions.push({
      source: createWizardDivinerSource({
        id: "expert-divination",
        label: "Expert Divination",
        entryId: CLASS_FEATURE.EXPERT_DIVINATION
      }),
      spellTransforms: [
        {
          id: "wizard-diviner-expert-divination-spell-transform",
          transform: (spell) => transformWizardDivinerExpertDivinationSpell(character, spell)
        }
      ]
    });
  }

  if (thirdEyeAction) {
    contributions.push({
      source: createWizardDivinerSource({
        id: "the-third-eye",
        label: "The Third Eye",
        entryId: CLASS_FEATURE.THE_THIRD_EYE
      }),
      actions: featureActions.filter((action) => action.key === thirdEyeAction.key)
    });
  }

  if (hasWizardDivinerFeature(character, 14)) {
    contributions.push({
      source: createWizardDivinerSource({
        id: "greater-portent",
        label: "Greater Portent",
        entryId: CLASS_FEATURE.GREATER_PORTENT
      })
    });
  }

  return contributions;
}

export const getWizardDivinerDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  projectCompiledContributionsToSubclassDerivedFeatureState(
    compileFeatureContributions(collectWizardDivinerContributions(character)),
    {
      character: character as Character
    }
  );
