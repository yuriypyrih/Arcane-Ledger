import { CLASS_FEATURE } from "../../../../codex/entries";
import type { Character } from "../../../../types";
import {
  compileFeatureContributions,
  createClassContributionSource,
  projectCompiledContributionsToClassFeatureDerivedState,
  type FeatureContributionSpec
} from "../../featureContributions";
import type {
  ClassFeatureDerivedState,
  CollectedClassFeatureCharacter,
  FeatureActionCard
} from "../types";
import {
  arcaneRecoveryActionKey,
  getWizardFeatureActions,
  getWizardSignatureSpellIds,
  getWizardSkillProficiencyEntries,
  getWizardSpellMasterySpellIds,
  hasWizardFeature
} from "./wizard";

function getFeatureActionByKey(
  actions: FeatureActionCard[],
  actionKey: string
): FeatureActionCard[] {
  return actions.filter((action) => action.key === actionKey);
}

function createWizardLocalHookContribution(input: {
  id: string;
  label: string;
  entryId: CLASS_FEATURE;
}): FeatureContributionSpec {
  return {
    source: createClassContributionSource(input)
  };
}

function createWizardArcaneRecoveryContribution(
  featureActions: FeatureActionCard[]
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "wizard-arcane-recovery",
      label: "Arcane Recovery",
      entryId: CLASS_FEATURE.ARCANE_RECOVERY
    }),
    actions: getFeatureActionByKey(featureActions, arcaneRecoveryActionKey)
  };
}

function createWizardScholarContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "wizard-scholar",
      label: "Scholar",
      entryId: CLASS_FEATURE.SCHOLAR
    }),
    skillProficiencyEntries: getWizardSkillProficiencyEntries(character)
  };
}

function createWizardSpellMasteryContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "wizard-spell-mastery",
      label: "Spell Mastery",
      entryId: CLASS_FEATURE.SPELL_MASTERY
    }),
    alwaysPreparedSpellIds: getWizardSpellMasterySpellIds(character)
  };
}

function createWizardSignatureSpellsContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "wizard-signature-spells",
      label: "Signature Spells",
      entryId: CLASS_FEATURE.SIGNATURE_SPELLS
    }),
    alwaysPreparedSpellIds: getWizardSignatureSpellIds(character)
  };
}

export function collectWizardFeatureContributions(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec[] {
  const featureActions = getWizardFeatureActions(character);
  const contributions: FeatureContributionSpec[] = [];

  if (hasWizardFeature(character, CLASS_FEATURE.SPELLCASTING)) {
    contributions.push(
      createWizardLocalHookContribution({
        id: "wizard-spellcasting",
        label: "Spellcasting",
        entryId: CLASS_FEATURE.SPELLCASTING
      })
    );
  }

  if (hasWizardFeature(character, CLASS_FEATURE.RITUAL_ADEPT)) {
    contributions.push(
      createWizardLocalHookContribution({
        id: "wizard-ritual-adept",
        label: "Ritual Adept",
        entryId: CLASS_FEATURE.RITUAL_ADEPT
      })
    );
  }

  if (hasWizardFeature(character, CLASS_FEATURE.ARCANE_RECOVERY)) {
    contributions.push(createWizardArcaneRecoveryContribution(featureActions));
  }

  if (hasWizardFeature(character, CLASS_FEATURE.SCHOLAR)) {
    contributions.push(createWizardScholarContribution(character));
  }

  if (hasWizardFeature(character, CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT)) {
    contributions.push(
      createWizardLocalHookContribution({
        id: "wizard-ability-score-improvement",
        label: "Ability Score Improvement",
        entryId: CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT
      })
    );
  }

  if (hasWizardFeature(character, CLASS_FEATURE.MEMORIZE_SPELL)) {
    contributions.push(
      createWizardLocalHookContribution({
        id: "wizard-memorize-spell",
        label: "Memorize Spell",
        entryId: CLASS_FEATURE.MEMORIZE_SPELL
      })
    );
  }

  if (hasWizardFeature(character, CLASS_FEATURE.SPELL_MASTERY)) {
    contributions.push(createWizardSpellMasteryContribution(character));
  }

  if (hasWizardFeature(character, CLASS_FEATURE.EPIC_BOON)) {
    contributions.push(
      createWizardLocalHookContribution({
        id: "wizard-epic-boon",
        label: "Epic Boon",
        entryId: CLASS_FEATURE.EPIC_BOON
      })
    );
  }

  if (hasWizardFeature(character, CLASS_FEATURE.SIGNATURE_SPELLS)) {
    contributions.push(createWizardSignatureSpellsContribution(character));
  }

  return contributions;
}

export function getWizardClassFeatureDerivedState(
  character: CollectedClassFeatureCharacter
): ClassFeatureDerivedState {
  return projectCompiledContributionsToClassFeatureDerivedState(
    compileFeatureContributions(collectWizardFeatureContributions(character)),
    {
      character: character as Character
    }
  );
}
