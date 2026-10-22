import { CLASS_FEATURE } from "../../../../../codex/entries/enums";
import type { SpellEntry } from "../../../../../codex/entries";
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
  getWondrousAlterationSpellCastEffects,
  hasWondrousAlteration,
  restoreWondrousAlterationOnLongRest,
  transformWondrousAlterationSpell
} from "./wizardTransmuterWondrousAlteration";
import {
  getEmpoweredTransmutationSpellCastEffects,
  hasEmpoweredTransmutation,
  restoreEmpoweredTransmutationOnLongRest,
  transformEmpoweredTransmutationSpell
} from "./wizardTransmuterEmpoweredTransmutation";
import {
  getShapeShifterSpellCastEffects,
  hasShapeShifter,
  polymorphSpellId,
  restoreShapeShifterOnLongRest,
  transformShapeShifterSpell
} from "./wizardTransmuterShapeShifter";

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
    ...(hasEmpoweredTransmutation(character)
      ? [
          {
            source: createSubclassContributionSource({
              id: "wizard-transmuter-empowered-transmutation",
              label: "Empowered Transmutation",
              entryId: CLASS_FEATURE.EMPOWERED_TRANSMUTATION
            }),
            spellTransforms: [
              {
                id: "wizard-transmuter-empowered-transmutation-description",
                transform: (spell) => transformEmpoweredTransmutationSpell(character, spell)
              }
            ]
          } satisfies FeatureContributionSpec
        ]
      : []),
    ...(hasShapeShifter(character)
      ? [
          {
            source: createSubclassContributionSource({
              id: "wizard-transmuter-shape-shifter",
              label: "Shape-shifter",
              entryId: CLASS_FEATURE.SHAPE_SHIFTER
            }),
            alwaysPreparedSpellIds: [polymorphSpellId],
            spellTransforms: [
              {
                id: "wizard-transmuter-shape-shifter-description",
                transform: (spell) => transformShapeShifterSpell(character, spell)
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

export function transformTransmuterSpell(
  character: SubclassRuntimeCharacter,
  spell: SpellEntry
): SpellEntry {
  return transformShapeShifterSpell(
    character,
    transformEmpoweredTransmutationSpell(
      character,
      transformWondrousAlterationSpell(character, spell)
    )
  );
}

export function getTransmuterSpellCastEffects(character: Character) {
  return [
    ...getWondrousAlterationSpellCastEffects(character),
    ...getEmpoweredTransmutationSpellCastEffects(character),
    ...getShapeShifterSpellCastEffects(character)
  ];
}

export function restoreTransmuterOnLongRest(character: Character): Character {
  return restoreShapeShifterOnLongRest(
    restoreEmpoweredTransmutationOnLongRest(restoreWondrousAlterationOnLongRest(character))
  );
}

export const getWizardTransmuterDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  projectCompiledContributionsToSubclassDerivedFeatureState(
    getCompiledFeatureContributions(character, collectWizardTransmuterContributions),
    { character: character as Character }
  );
