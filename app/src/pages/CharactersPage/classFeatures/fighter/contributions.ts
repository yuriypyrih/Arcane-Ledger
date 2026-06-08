import { CLASS_FEATURE } from "../../../../codex/entries";
import type { Character } from "../../../../types";
import {
  compileFeatureContributions,
  createClassContributionSource,
  projectCompiledContributionsToClassFeatureDerivedState,
  type FeatureContributionSpec
} from "../../featureContributions";
import type { WeaponAction } from "../../gameplay";
import type {
  ClassFeatureDerivedState,
  CollectedClassFeatureCharacter,
  FeatureActionCard
} from "../types";
import {
  fighterActionSurgeActionKey,
  fighterIndomitableActionKey,
  fighterSecondWindActionKey,
  fighterTacticalMindActionKey,
  getFighterFeatureActions,
  getFighterStudiedAttacksWeaponAction,
  getFighterTacticalMasterWeaponAction,
  getFighterWeaponMasteryOptions,
  getFighterWeaponMasterySelectionCount,
  getFighterWeaponMasterySelections,
  getFighterWeaponProficiencyEntries,
  hasFighterFeature,
  setFighterWeaponMasterySelections
} from "./fighter";

function getFeatureActionByKey(
  actions: FeatureActionCard[],
  actionKey: string
) {
  return actions.filter((action) => action.key === actionKey);
}

function createFighterLocalHookContribution(input: {
  id: string;
  label: string;
  entryId: CLASS_FEATURE;
}): FeatureContributionSpec {
  return {
    source: createClassContributionSource(input)
  };
}

function createFighterFightingStyleContribution(): FeatureContributionSpec {
  return createFighterLocalHookContribution({
    id: "fighter-fighting-style",
    label: "Fighting Style",
    entryId: CLASS_FEATURE.FIGHTING_STYLE
  });
}

function createFighterSecondWindContribution(
  featureActions: FeatureActionCard[]
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "fighter-second-wind",
      label: "Second Wind",
      entryId: CLASS_FEATURE.SECOND_WIND
    }),
    actions: getFeatureActionByKey(featureActions, fighterSecondWindActionKey)
  };
}

function createFighterWeaponMasteryContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "fighter-weapon-mastery",
      label: "Weapon Mastery",
      entryId: CLASS_FEATURE.WEAPON_MASTERY
    }),
    weaponProficiencyEntries: getFighterWeaponProficiencyEntries(character),
    classMechanics: {
      weaponMastery: {
        selectionCount: getFighterWeaponMasterySelectionCount(character),
        options: getFighterWeaponMasteryOptions(),
        selections: getFighterWeaponMasterySelections(character),
        setSelections: setFighterWeaponMasterySelections
      }
    }
  };
}

function createFighterActionSurgeContribution(
  featureActions: FeatureActionCard[]
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "fighter-action-surge",
      label: "Action Surge",
      entryId: CLASS_FEATURE.ACTION_SURGE
    }),
    actions: getFeatureActionByKey(featureActions, fighterActionSurgeActionKey)
  };
}

function createFighterTacticalMindContribution(
  featureActions: FeatureActionCard[]
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "fighter-tactical-mind",
      label: "Tactical Mind",
      entryId: CLASS_FEATURE.TACTICAL_MIND
    }),
    actions: getFeatureActionByKey(featureActions, fighterTacticalMindActionKey)
  };
}

function createFighterIndomitableContribution(
  featureActions: FeatureActionCard[]
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "fighter-indomitable",
      label: "Indomitable",
      entryId: CLASS_FEATURE.INDOMITABLE
    }),
    actions: getFeatureActionByKey(featureActions, fighterIndomitableActionKey)
  };
}

function createFighterTacticalMasterContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "fighter-tactical-master",
      label: "Tactical Master",
      entryId: CLASS_FEATURE.TACTICAL_MASTER
    }),
    weaponActionTransforms: [
      {
        id: "fighter-tactical-master-weapon-action-transform",
        transform: (_character, action) =>
          getFighterTacticalMasterWeaponAction(character, action as WeaponAction)
      }
    ]
  };
}

function createFighterStudiedAttacksContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "fighter-studied-attacks",
      label: "Studied Attacks",
      entryId: CLASS_FEATURE.STUDIED_ATTACKS
    }),
    weaponActionTransforms: [
      {
        id: "fighter-studied-attacks-weapon-action-transform",
        transform: (_character, action) =>
          getFighterStudiedAttacksWeaponAction(character, action as WeaponAction)
      }
    ]
  };
}

export function collectFighterFeatureContributions(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec[] {
  const featureActions = getFighterFeatureActions(character);

  return [
    createFighterFightingStyleContribution(),
    createFighterSecondWindContribution(featureActions),
    createFighterWeaponMasteryContribution(character),
    createFighterActionSurgeContribution(featureActions),
    createFighterTacticalMindContribution(featureActions),
    ...(hasFighterFeature(character, CLASS_FEATURE.EXTRA_ATTACK)
      ? [
          createFighterLocalHookContribution({
            id: "fighter-extra-attack",
            label: "Extra Attack",
            entryId: CLASS_FEATURE.EXTRA_ATTACK
          })
        ]
      : []),
    ...(hasFighterFeature(character, CLASS_FEATURE.TACTICAL_SHIFT)
      ? [
          createFighterLocalHookContribution({
            id: "fighter-tactical-shift",
            label: "Tactical Shift",
            entryId: CLASS_FEATURE.TACTICAL_SHIFT
          })
        ]
      : []),
    createFighterIndomitableContribution(featureActions),
    createFighterTacticalMasterContribution(character),
    ...(hasFighterFeature(character, CLASS_FEATURE.TWO_EXTRA_ATTACKS)
      ? [
          createFighterLocalHookContribution({
            id: "fighter-two-extra-attacks",
            label: "Two Extra Attacks",
            entryId: CLASS_FEATURE.TWO_EXTRA_ATTACKS
          })
        ]
      : []),
    createFighterStudiedAttacksContribution(character),
    ...(hasFighterFeature(character, CLASS_FEATURE.THREE_EXTRA_ATTACKS)
      ? [
          createFighterLocalHookContribution({
            id: "fighter-three-extra-attacks",
            label: "Three Extra Attacks",
            entryId: CLASS_FEATURE.THREE_EXTRA_ATTACKS
          })
        ]
      : [])
  ];
}

export function getFighterClassFeatureDerivedState(
  character: CollectedClassFeatureCharacter
): ClassFeatureDerivedState {
  return projectCompiledContributionsToClassFeatureDerivedState(
    compileFeatureContributions(collectFighterFeatureContributions(character)),
    {
      character: character as Character
    }
  );
}
