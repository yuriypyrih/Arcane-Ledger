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
import { getSorcererSpellEntry } from "./innateSorcerySpell";
import {
  fontOfMagicActionKey,
  getSorcererFeatureActions,
  getSorcererMetamagicOptionsForAction,
  hasSorcererFeature,
  innateSorceryActionKey,
  metamagicActionKey
} from "./sorcerer";

function getFeatureActionByKey(
  actions: FeatureActionCard[],
  actionKey: string
): FeatureActionCard[] {
  return actions.filter((action) => action.key === actionKey);
}

function createSorcererLocalHookContribution(input: {
  id: string;
  label: string;
  entryId: CLASS_FEATURE;
}): FeatureContributionSpec {
  return {
    source: createClassContributionSource(input)
  };
}

function createSorcererInnateSorceryContribution(
  character: CollectedClassFeatureCharacter,
  featureActions: FeatureActionCard[]
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "sorcerer-innate-sorcery",
      label: "Innate Sorcery",
      entryId: CLASS_FEATURE.INNATE_SORCERY
    }),
    actions: getFeatureActionByKey(featureActions, innateSorceryActionKey),
    spellTransforms: [
      {
        id: "sorcerer-innate-sorcery-spell-transform",
        transform: (spell) => getSorcererSpellEntry(character, spell)
      }
    ]
  };
}

function createSorcererFontOfMagicContribution(
  featureActions: FeatureActionCard[]
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "sorcerer-font-of-magic",
      label: "Font of Magic",
      entryId: CLASS_FEATURE.FONT_OF_MAGIC
    }),
    actions: getFeatureActionByKey(featureActions, fontOfMagicActionKey)
  };
}

function createSorcererMetamagicContribution(
  character: CollectedClassFeatureCharacter,
  featureActions: FeatureActionCard[]
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "sorcerer-metamagic",
      label: "Metamagic",
      entryId: CLASS_FEATURE.METAMAGIC
    }),
    actions: getFeatureActionByKey(featureActions, metamagicActionKey),
    actionOptions: {
      [metamagicActionKey]: getSorcererMetamagicOptionsForAction(character)
    }
  };
}

export function collectSorcererFeatureContributions(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec[] {
  const featureActions = getSorcererFeatureActions(character);
  const contributions: FeatureContributionSpec[] = [];

  if (hasSorcererFeature(character, CLASS_FEATURE.SPELLCASTING)) {
    contributions.push(
      createSorcererLocalHookContribution({
        id: "sorcerer-spellcasting",
        label: "Spellcasting",
        entryId: CLASS_FEATURE.SPELLCASTING
      })
    );
  }

  if (hasSorcererFeature(character, CLASS_FEATURE.INNATE_SORCERY)) {
    contributions.push(createSorcererInnateSorceryContribution(character, featureActions));
  }

  if (hasSorcererFeature(character, CLASS_FEATURE.FONT_OF_MAGIC)) {
    contributions.push(createSorcererFontOfMagicContribution(featureActions));
  }

  if (hasSorcererFeature(character, CLASS_FEATURE.METAMAGIC)) {
    contributions.push(createSorcererMetamagicContribution(character, featureActions));
  }

  if (hasSorcererFeature(character, CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT)) {
    contributions.push(
      createSorcererLocalHookContribution({
        id: "sorcerer-ability-score-improvement",
        label: "Ability Score Improvement",
        entryId: CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT
      })
    );
  }

  if (hasSorcererFeature(character, CLASS_FEATURE.SORCEROUS_RESTORATION)) {
    contributions.push(
      createSorcererLocalHookContribution({
        id: "sorcerer-sorcerous-restoration",
        label: "Sorcerous Restoration",
        entryId: CLASS_FEATURE.SORCEROUS_RESTORATION
      })
    );
  }

  if (hasSorcererFeature(character, CLASS_FEATURE.SORCERY_INCARNATE)) {
    contributions.push(
      createSorcererLocalHookContribution({
        id: "sorcerer-sorcery-incarnate",
        label: "Sorcery Incarnate",
        entryId: CLASS_FEATURE.SORCERY_INCARNATE
      })
    );
  }

  if (hasSorcererFeature(character, CLASS_FEATURE.EPIC_BOON)) {
    contributions.push(
      createSorcererLocalHookContribution({
        id: "sorcerer-epic-boon",
        label: "Epic Boon",
        entryId: CLASS_FEATURE.EPIC_BOON
      })
    );
  }

  if (hasSorcererFeature(character, CLASS_FEATURE.ARCANE_APOTHEOSIS)) {
    contributions.push(
      createSorcererLocalHookContribution({
        id: "sorcerer-arcane-apotheosis",
        label: "Arcane Apotheosis",
        entryId: CLASS_FEATURE.ARCANE_APOTHEOSIS
      })
    );
  }

  return contributions;
}

export function getSorcererClassFeatureDerivedState(
  character: CollectedClassFeatureCharacter
): ClassFeatureDerivedState {
  return projectCompiledContributionsToClassFeatureDerivedState(
    compileFeatureContributions(collectSorcererFeatureContributions(character)),
    {
      character: character as Character
    }
  );
}
