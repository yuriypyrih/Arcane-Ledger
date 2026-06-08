import { CLASS_FEATURE } from "../../../../codex/entries";
import type { Character } from "../../../../types";
import {
  compileFeatureContributions,
  createClassContributionSource,
  projectCompiledContributionsToClassFeatureDerivedState,
  type FeatureContributionSpec
} from "../../featureContributions";
import type { ClassFeatureDerivedState, CollectedClassFeatureCharacter } from "../types";
import {
  getBardExpertiseSkillProficiencyEntries,
  getBardFeatureAction,
  getBardReactionEntries,
  getBardSkillBonuses,
  getBardWordsOfCreationAlwaysPreparedSpellIds,
  getBardicInspirationDie,
  transformBardWordsOfCreationSpellEntry
} from "./bard";

function compactActions<TAction>(actions: Array<TAction | null>): TAction[] {
  return actions.filter((action): action is TAction => action !== null);
}

function createBardicInspirationContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "bard-bardic-inspiration",
      label: "Bardic Inspiration",
      entryId: CLASS_FEATURE.BARDIC_INSPIRATION
    }),
    actions: compactActions([getBardFeatureAction(character)]),
    classMechanics: {
      bardicInspirationDie: getBardicInspirationDie(character)
    }
  };
}

function createBardExpertiseContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "bard-expertise",
      label: "Expertise",
      entryId: CLASS_FEATURE.EXPERTISE
    }),
    skillProficiencyEntries: getBardExpertiseSkillProficiencyEntries(character)
  };
}

function createBardJackOfAllTradesContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "bard-jack-of-all-trades",
      label: "Jack of All Trades",
      entryId: CLASS_FEATURE.JACK_OF_ALL_TRADES
    }),
    skillBonuses: [
      {
        id: "bard-jack-of-all-trades-skill-bonus",
        getBonuses: (_skill, proficiencyLevel) =>
          getBardSkillBonuses(character, proficiencyLevel)
      }
    ]
  };
}

function createBardCountercharmContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "bard-countercharm",
      label: "Countercharm",
      entryId: CLASS_FEATURE.COUNTERCHARM
    }),
    reactions: getBardReactionEntries(character)
  };
}

function createBardWordsOfCreationContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "bard-words-of-creation",
      label: "Words of Creation",
      entryId: CLASS_FEATURE.WORDS_OF_CREATION
    }),
    alwaysPreparedSpellIds: getBardWordsOfCreationAlwaysPreparedSpellIds(character),
    spellTransforms: [
      {
        id: "bard-words-of-creation-spell-transform",
        transform: (spell) => transformBardWordsOfCreationSpellEntry(character, spell)
      }
    ]
  };
}

export function collectBardFeatureContributions(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec[] {
  return [
    createBardicInspirationContribution(character),
    createBardExpertiseContribution(character),
    createBardJackOfAllTradesContribution(character),
    createBardCountercharmContribution(character),
    createBardWordsOfCreationContribution(character)
  ];
}

export function getBardClassFeatureDerivedState(
  character: CollectedClassFeatureCharacter
): ClassFeatureDerivedState {
  return projectCompiledContributionsToClassFeatureDerivedState(
    compileFeatureContributions(collectBardFeatureContributions(character)),
    {
      character: character as Character
    }
  );
}
