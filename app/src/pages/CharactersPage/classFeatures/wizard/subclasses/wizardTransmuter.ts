import { CLASS_FEATURE } from "../../../../../codex/entries/enums";
import type { Character } from "../../../../../types";
import {
  createSubclassContributionSource,
  getCompiledFeatureContributions,
  projectCompiledContributionsToSubclassDerivedFeatureState,
  type FeatureContributionSpec
} from "../../../featureContributions";
import { getClassLevel } from "../../../multiclassState";
import { getFeatureDescriptionMetadataForCharacter } from "../../featureDescriptions";
import type { SubclassRuntimeCharacter, SubclassRuntimeResolver } from "../../subclassRuntime";
import { getWizardSavantSpellIdsFromFeatureState } from "../savant";
import {
  alterSelfSpellId,
  hasWondrousAlteration,
  transformWondrousAlterationSpell
} from "./wizardTransmuterWondrousAlteration";

export const transmuterSubclassId = "wizard-transmuter";

function collectWizardTransmuterContributions(
  character: SubclassRuntimeCharacter
): FeatureContributionSpec[] {
  const feature = getFeatureDescriptionMetadataForCharacter(
    character,
    CLASS_FEATURE.TRANSMUTATION_SAVANT
  );
  if (!feature) return [];
  return [
    ...(hasWondrousAlteration(character)
      ? [
          {
            source: createSubclassContributionSource({
              id: "wizard-transmuter-wondrous-alteration",
              label: "Wondrous Alteration",
              entryId: CLASS_FEATURE.WONDROUS_ALTERATION
            }),
            alwaysPreparedSpellIds: [alterSelfSpellId],
            spellTransforms: [
              {
                id: "wizard-transmuter-wondrous-alteration-description",
                transform: (spell) => transformWondrousAlterationSpell(character, spell)
              }
            ]
          } satisfies FeatureContributionSpec
        ]
      : []),
    {
      source: createSubclassContributionSource({
        id: "wizard-transmuter-savant",
        label: feature.name,
        entryId: CLASS_FEATURE.TRANSMUTATION_SAVANT
      }),
      alwaysSpellbookSpellIds: getWizardSavantSpellIdsFromFeatureState({
        ...character,
        level: getClassLevel(character, "Wizard")
      })
    }
  ];
}

export const getWizardTransmuterDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  projectCompiledContributionsToSubclassDerivedFeatureState(
    getCompiledFeatureContributions(character, collectWizardTransmuterContributions),
    { character: character as Character }
  );
