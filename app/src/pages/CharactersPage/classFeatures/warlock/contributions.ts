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
import type { WeaponAction } from "../../gameplay";
import { collectWarlockInvocationContributions } from "./invocations/contributions";
import {
  contactPatronActionKey,
  getWarlockFeatureActions,
  getWarlockWeaponAction,
  hasWarlockFeature,
  magicalCunningActionKey,
  mysticArcanumActionKey
} from "./warlock";

const contactOtherPlaneSpellId = "spell-contact-other-plane";

function getFeatureActionByKey(
  actions: FeatureActionCard[],
  actionKey: string
): FeatureActionCard[] {
  return actions.filter((action) => action.key === actionKey);
}

function createWarlockLocalHookContribution(input: {
  id: string;
  label: string;
  entryId: CLASS_FEATURE;
}): FeatureContributionSpec {
  return {
    source: createClassContributionSource(input)
  };
}

function createWarlockEldritchInvocationsContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "warlock-eldritch-invocations",
      label: "Eldritch Invocations",
      entryId: CLASS_FEATURE.ELDRITCH_INVOCATIONS
    }),
    weaponActionTransforms: [
      {
        id: "warlock-eldritch-invocations-pact-blade-weapon-transform",
        transform: (_character, action) =>
          getWarlockWeaponAction(character, action as WeaponAction)
      }
    ]
  };
}

function createWarlockMagicalCunningContribution(
  featureActions: FeatureActionCard[]
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "warlock-magical-cunning",
      label: "Magical Cunning",
      entryId: CLASS_FEATURE.MAGICAL_CUNNING
    }),
    actions: getFeatureActionByKey(featureActions, magicalCunningActionKey)
  };
}

function createWarlockContactPatronContribution(
  featureActions: FeatureActionCard[]
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "warlock-contact-patron",
      label: "Contact Patron",
      entryId: CLASS_FEATURE.CONTACT_PATRON
    }),
    actions: getFeatureActionByKey(featureActions, contactPatronActionKey),
    alwaysPreparedSpellIds: [contactOtherPlaneSpellId]
  };
}

function createWarlockMysticArcanumContribution(
  featureActions: FeatureActionCard[]
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "warlock-mystic-arcanum",
      label: "Mystic Arcanum",
      entryId: CLASS_FEATURE.MYSTIC_ARCANUM
    }),
    actions: getFeatureActionByKey(featureActions, mysticArcanumActionKey)
  };
}

export function collectWarlockFeatureContributions(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec[] {
  const featureActions = getWarlockFeatureActions(character);
  const contributions: FeatureContributionSpec[] = [];

  if (hasWarlockFeature(character, CLASS_FEATURE.ELDRITCH_INVOCATIONS)) {
    contributions.push(createWarlockEldritchInvocationsContribution(character));
    contributions.push(...collectWarlockInvocationContributions(character));
  }

  if (hasWarlockFeature(character, CLASS_FEATURE.PACT_MAGIC)) {
    contributions.push(
      createWarlockLocalHookContribution({
        id: "warlock-pact-magic",
        label: "Pact Magic",
        entryId: CLASS_FEATURE.PACT_MAGIC
      })
    );
  }

  if (hasWarlockFeature(character, CLASS_FEATURE.MAGICAL_CUNNING)) {
    contributions.push(createWarlockMagicalCunningContribution(featureActions));
  }

  if (hasWarlockFeature(character, CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT)) {
    contributions.push(
      createWarlockLocalHookContribution({
        id: "warlock-ability-score-improvement",
        label: "Ability Score Improvement",
        entryId: CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT
      })
    );
  }

  if (hasWarlockFeature(character, CLASS_FEATURE.CONTACT_PATRON)) {
    contributions.push(createWarlockContactPatronContribution(featureActions));
  }

  if (hasWarlockFeature(character, CLASS_FEATURE.MYSTIC_ARCANUM)) {
    contributions.push(createWarlockMysticArcanumContribution(featureActions));
  }

  if (hasWarlockFeature(character, CLASS_FEATURE.EPIC_BOON)) {
    contributions.push(
      createWarlockLocalHookContribution({
        id: "warlock-epic-boon",
        label: "Epic Boon",
        entryId: CLASS_FEATURE.EPIC_BOON
      })
    );
  }

  if (hasWarlockFeature(character, CLASS_FEATURE.ELDRITCH_MASTER)) {
    contributions.push(
      createWarlockLocalHookContribution({
        id: "warlock-eldritch-master",
        label: "Eldritch Master",
        entryId: CLASS_FEATURE.ELDRITCH_MASTER
      })
    );
  }

  return contributions;
}

export function getWarlockClassFeatureDerivedState(
  character: CollectedClassFeatureCharacter
): ClassFeatureDerivedState {
  return projectCompiledContributionsToClassFeatureDerivedState(
    compileFeatureContributions(collectWarlockFeatureContributions(character)),
    {
      character: character as Character
    }
  );
}
