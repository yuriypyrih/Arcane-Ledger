import { CLASS_FEATURE } from "../../../../../codex/entries/enums";
import type { SpellEntry } from "../../../../../codex/entries";
import type { Character } from "../../../../../types";
import { appendFeatureSourcedDescriptionAddition } from "../../../actionModalDescriptions";
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
  getBenignTranspositionAction,
  restoreBenignTranspositionOnLongRest
} from "./wizardConjurerBenignTransposition";
import { transformDurableSummonsSpell } from "./wizardConjurerDurableSummons";
import { transformFocusedConjurationSpell } from "./wizardConjurerSpells";
import {
  restoreSplinteredSummonsOnLongRest,
  transformSplinteredSummonsSpell
} from "./wizardConjurerSplinteredSummons";

export const conjurerSubclassId = "wizard-conjurer";

function collectWizardConjurerContributions(
  character: SubclassRuntimeCharacter
): FeatureContributionSpec[] {
  const contributions: FeatureContributionSpec[] = [];
  const distantTransposition = getFeatureDescriptionMetadataForCharacter(
    character,
    CLASS_FEATURE.DISTANT_TRANSPOSITION
  );
  if (distantTransposition) {
    contributions.push({
      source: createSubclassContributionSource({
        id: "wizard-conjurer-distant-transposition",
        label: distantTransposition.name,
        entryId: CLASS_FEATURE.DISTANT_TRANSPOSITION
      }),
      featureActionTransforms: [
        {
          id: "wizard-conjurer-distant-transposition-description",
          transform: (action) =>
            action.sourceFeature === CLASS_FEATURE.BENIGN_TRANSPOSITION
              ? appendFeatureSourcedDescriptionAddition(
                  { ...action, breakdown: "Teleport up to 60 ft. or swap places" },
                  character,
                  CLASS_FEATURE.DISTANT_TRANSPOSITION,
                  distantTransposition.description
                )
              : action
        }
      ]
    });
  }
  for (const { featureId, transform } of [
    { featureId: CLASS_FEATURE.DURABLE_SUMMONS, transform: transformDurableSummonsSpell },
    { featureId: CLASS_FEATURE.FOCUSED_CONJURATION, transform: transformFocusedConjurationSpell },
    { featureId: CLASS_FEATURE.SPLINTERED_SUMMONS, transform: transformSplinteredSummonsSpell }
  ]) {
    const feature = getFeatureDescriptionMetadataForCharacter(character, featureId);
    if (!feature) continue;
    contributions.push({
      source: createSubclassContributionSource({
        id: `wizard-conjurer-${featureId}`,
        label: feature.name,
        entryId: featureId
      }),
      spellTransforms: [
        {
          id: `wizard-conjurer-${featureId}-description`,
          transform: (spell) => transform(character, spell)
        }
      ]
    });
  }
  const benignTransposition = getBenignTranspositionAction(character);
  if (benignTransposition) {
    contributions.push({
      source: createSubclassContributionSource({
        id: benignTransposition.key,
        label: benignTransposition.name,
        entryId: CLASS_FEATURE.BENIGN_TRANSPOSITION
      }),
      actions: [benignTransposition]
    });
  }
  const savant = getFeatureDescriptionMetadataForCharacter(
    character,
    CLASS_FEATURE.CONJURATION_SAVANT
  );
  if (savant) {
    contributions.push({
      source: createSubclassContributionSource({
        id: "wizard-conjurer-savant",
        label: savant.name,
        entryId: CLASS_FEATURE.CONJURATION_SAVANT
      }),
      alwaysSpellbookSpellIds: getWizardSavantSpellIdsFromFeatureState({
        ...character,
        level: getClassLevel(character, "Wizard")
      })
    });
  }
  return contributions;
}

export const getWizardConjurerDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  projectCompiledContributionsToSubclassDerivedFeatureState(
    getCompiledFeatureContributions(character, collectWizardConjurerContributions),
    { character: character as Character }
  );

export function transformConjurerSpell(
  character: SubclassRuntimeCharacter,
  spell: SpellEntry
): SpellEntry {
  return transformSplinteredSummonsSpell(
    character,
    transformFocusedConjurationSpell(character, transformDurableSummonsSpell(character, spell))
  );
}

export function restoreConjurerOnLongRest(character: Character): Character {
  return restoreSplinteredSummonsOnLongRest(restoreBenignTranspositionOnLongRest(character));
}
