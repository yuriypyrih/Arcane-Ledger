import {
  CLASS_FEATURE,
  type ReactionEntry,
  type SpellDescriptionEntry
} from "../../../../codex/entries";
import type { Character, CharacterStatusEntry } from "../../../../types";
import { createFeatureSourcedDescriptionEntries } from "../../actionModalDescriptions";
import {
  compileFeatureContributions,
  createClassContributionSource,
  getFeatureDescriptionAdditions,
  projectCompiledContributionsToClassFeatureDerivedState,
  type FeatureContributionSpec,
  type FeatureDescriptionContributionTarget
} from "../../featureContributions";
import type { WeaponAction } from "../../gameplay";
import type {
  ClassFeatureDerivedState,
  CollectedClassFeatureCharacter,
  FeatureActionCard
} from "../types";
import {
  canUseMonkMartialArts,
  getMonkAbilityScoreBonuses,
  getMonkArmorClassModes,
  getMonkCommonAction,
  getMonkDerivedStatusEntries,
  getMonkFeatureActions,
  getMonkMartialArtsDie,
  getMonkReactionEntries,
  getMonkSavingThrowProficiencyEntries,
  getMonkSpeedBonuses,
  getMonkUnarmedDamageTypeLabel,
  getMonkWeaponAction,
  hasMonkFeature,
  monkFlurryOfBlowsActionKey,
  monkPatientDefenseActionKey,
  monkStepOfTheWindActionKey,
  monkSuperiorDefenseActionKey
} from "./monk";
import { getFeatureDescriptionForCharacter } from "../featureDescriptions";

function getFeatureActionByKey(
  actions: FeatureActionCard[],
  actionKey: string
): FeatureActionCard[] {
  return actions.filter((action) => action.key === actionKey);
}

function getReactionEntryById(reactions: ReactionEntry[], reactionId: string): ReactionEntry[] {
  return reactions.filter((reaction) => reaction.id === reactionId);
}

function getStatusEntriesBySource(
  statuses: CharacterStatusEntry[],
  source: string
): CharacterStatusEntry[] {
  return statuses.filter((status) => status.source === source);
}

function createMonkLocalHookContribution(input: {
  id: string;
  label: string;
  entryId: CLASS_FEATURE;
}): FeatureContributionSpec {
  return {
    source: createClassContributionSource(input)
  };
}

function createMonkFeatureDescriptionAdditions(
  character: CollectedClassFeatureCharacter,
  feature: CLASS_FEATURE,
  sourceLabel: string
): SpellDescriptionEntry[][] {
  const description = getFeatureDescriptionForCharacter(character, feature);

  return description.length > 0
    ? [createFeatureSourcedDescriptionEntries(character, feature, description, sourceLabel)]
    : [];
}

function createMonkMartialArtsContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "monk-martial-arts",
      label: "Martial Arts",
      entryId: CLASS_FEATURE.MARTIAL_ARTS
    }),
    weaponActionTransforms: [
      {
        id: "monk-weapon-description-sections",
        transform: (_character: Character, action: unknown) =>
          getMonkWeaponAction(character, action as WeaponAction)
      }
    ],
    classMechanics: {
      monkMartialArtsDie: getMonkMartialArtsDie(character),
      monkUnarmedDamageTypeLabel: "Bludgeoning",
      canUseMonkMartialArts: (context) => canUseMonkMartialArts(character, context)
    }
  };
}

function createMonkUnarmoredDefenseContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "monk-unarmored-defense",
      label: "Unarmored Defense",
      entryId: CLASS_FEATURE.UNARMORED_DEFENSE
    }),
    armorClassModes: [
      {
        id: "monk-unarmored-defense-mode",
        getModes: (context) => getMonkArmorClassModes(character, context)
      }
    ]
  };
}

function createMonkFocusContribution(
  character: CollectedClassFeatureCharacter,
  featureActions: FeatureActionCard[]
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "monk-monks-focus",
      label: "Monk's Focus",
      entryId: CLASS_FEATURE.MONKS_FOCUS
    }),
    actions: [
      ...getFeatureActionByKey(featureActions, monkFlurryOfBlowsActionKey),
      ...getFeatureActionByKey(featureActions, monkPatientDefenseActionKey),
      ...getFeatureActionByKey(featureActions, monkStepOfTheWindActionKey)
    ],
    commonActionTransforms: [
      {
        id: "monk-focus-common-action-transform",
        transform: <TAction extends Pick<FeatureActionCard, "key" | "descriptionAdditions">>(
          _character: Character,
          action: TAction
        ): TAction =>
          getMonkCommonAction(
            character,
            action as unknown as FeatureActionCard
          ) as unknown as TAction
      }
    ]
  };
}

function createMonkUnarmoredMovementContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "monk-unarmored-movement",
      label: "Unarmored Movement",
      entryId: CLASS_FEATURE.UNARMORED_MOVEMENT
    }),
    speedBonusProviders: [
      {
        id: "monk-unarmored-movement-speed",
        getBonuses: (context) => getMonkSpeedBonuses(character, context)
      }
    ]
  };
}

function createMonkUncannyMetabolismContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "monk-uncanny-metabolism",
      label: "Uncanny Metabolism",
      entryId: CLASS_FEATURE.UNCANNY_METABOLISM
    }),
    descriptionAdditions: [
      {
        id: "monk-uncanny-metabolism-initiative",
        target: "initiative",
        getDescriptionAdditions: () =>
          createMonkFeatureDescriptionAdditions(
            character,
            CLASS_FEATURE.UNCANNY_METABOLISM,
            "Uncanny Metabolism"
          )
      }
    ]
  };
}

function createMonkDeflectAttacksContribution(
  reactionEntries: ReactionEntry[]
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "monk-deflect-attacks",
      label: "Deflect Attacks",
      entryId: CLASS_FEATURE.DEFLECT_ATTACKS
    }),
    reactions: getReactionEntryById(reactionEntries, "reaction-deflect-attacks")
  };
}

function createMonkSlowFallContribution(reactionEntries: ReactionEntry[]): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "monk-slow-fall",
      label: "Slow Fall",
      entryId: CLASS_FEATURE.SLOW_FALL
    }),
    reactions: getReactionEntryById(reactionEntries, "reaction-slow-fall")
  };
}

function createMonkEmpoweredStrikesContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "monk-empowered-strikes",
      label: "Empowered Strikes",
      entryId: CLASS_FEATURE.EMPOWERED_STRIKES
    }),
    classMechanics: {
      monkUnarmedDamageTypeLabel: getMonkUnarmedDamageTypeLabel(character)
    }
  };
}

function createMonkAcrobaticMovementContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "monk-acrobatic-movement",
      label: "Acrobatic Movement",
      entryId: CLASS_FEATURE.ACROBATIC_MOVEMENT
    }),
    descriptionAdditions: [
      {
        id: "monk-acrobatic-movement-speed",
        target: "stat",
        targetKey: "speed",
        getDescriptionAdditions: () =>
          createMonkFeatureDescriptionAdditions(
            character,
            CLASS_FEATURE.ACROBATIC_MOVEMENT,
            "Acrobatic Movement"
          )
      }
    ]
  };
}

function createMonkSelfRestorationContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "monk-self-restoration",
      label: "Self-Restoration",
      entryId: CLASS_FEATURE.SELF_RESTORATION
    }),
    statuses: getStatusEntriesBySource(getMonkDerivedStatusEntries(character), "Self Restoration")
  };
}

function createMonkDeflectEnergyContribution(): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "monk-deflect-energy",
      label: "Deflect Energy",
      entryId: CLASS_FEATURE.DEFLECT_ENERGY
    })
  };
}

function createMonkDisciplinedSurvivorContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "monk-disciplined-survivor",
      label: "Disciplined Survivor",
      entryId: CLASS_FEATURE.DISCIPLINED_SURVIVOR
    }),
    savingThrowProficiencyEntries: getMonkSavingThrowProficiencyEntries(character),
    descriptionAdditions: [
      {
        id: "monk-disciplined-survivor-stat",
        target: "stat",
        getDescriptionAdditions: () =>
          createMonkFeatureDescriptionAdditions(
            character,
            CLASS_FEATURE.DISCIPLINED_SURVIVOR,
            "Disciplined Survivor"
          )
      }
    ]
  };
}

function createMonkPerfectFocusContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "monk-perfect-focus",
      label: "Perfect Focus",
      entryId: CLASS_FEATURE.PERFECT_FOCUS
    }),
    descriptionAdditions: [
      {
        id: "monk-perfect-focus-initiative",
        target: "initiative",
        getDescriptionAdditions: () =>
          createMonkFeatureDescriptionAdditions(
            character,
            CLASS_FEATURE.PERFECT_FOCUS,
            "Perfect Focus"
          )
      }
    ]
  };
}

function createMonkSuperiorDefenseContribution(
  character: CollectedClassFeatureCharacter,
  featureActions: FeatureActionCard[]
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "monk-superior-defense",
      label: "Superior Defense",
      entryId: CLASS_FEATURE.SUPERIOR_DEFENSE
    }),
    actions: getFeatureActionByKey(featureActions, monkSuperiorDefenseActionKey),
    statuses: getStatusEntriesBySource(getMonkDerivedStatusEntries(character), "Superior Defense")
  };
}

function createMonkBodyAndMindContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "monk-body-and-mind",
      label: "Body and Mind",
      entryId: CLASS_FEATURE.BODY_AND_MIND
    }),
    abilityScoreBonuses: getMonkAbilityScoreBonuses(character)
  };
}

export function collectMonkFeatureContributions(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec[] {
  const featureActions = getMonkFeatureActions(character);
  const reactionEntries = getMonkReactionEntries(character);

  return [
    createMonkMartialArtsContribution(character),
    createMonkUnarmoredDefenseContribution(character),
    createMonkFocusContribution(character, featureActions),
    createMonkUnarmoredMovementContribution(character),
    ...(hasMonkFeature(character, CLASS_FEATURE.UNCANNY_METABOLISM)
      ? [createMonkUncannyMetabolismContribution(character)]
      : []),
    createMonkDeflectAttacksContribution(reactionEntries),
    ...(hasMonkFeature(character, CLASS_FEATURE.SLOW_FALL)
      ? [createMonkSlowFallContribution(reactionEntries)]
      : []),
    ...(hasMonkFeature(character, CLASS_FEATURE.EXTRA_ATTACK)
      ? [
          createMonkLocalHookContribution({
            id: "monk-extra-attack",
            label: "Extra Attack",
            entryId: CLASS_FEATURE.EXTRA_ATTACK
          })
        ]
      : []),
    ...(hasMonkFeature(character, CLASS_FEATURE.STUNNING_STRIKE)
      ? [
          createMonkLocalHookContribution({
            id: "monk-stunning-strike",
            label: "Stunning Strike",
            entryId: CLASS_FEATURE.STUNNING_STRIKE
          })
        ]
      : []),
    ...(hasMonkFeature(character, CLASS_FEATURE.EMPOWERED_STRIKES)
      ? [createMonkEmpoweredStrikesContribution(character)]
      : []),
    ...(hasMonkFeature(character, CLASS_FEATURE.EVASION)
      ? [
          createMonkLocalHookContribution({
            id: "monk-evasion",
            label: "Evasion",
            entryId: CLASS_FEATURE.EVASION
          })
        ]
      : []),
    ...(hasMonkFeature(character, CLASS_FEATURE.ACROBATIC_MOVEMENT)
      ? [createMonkAcrobaticMovementContribution(character)]
      : []),
    ...(hasMonkFeature(character, CLASS_FEATURE.HEIGHTENED_FOCUS)
      ? [
          createMonkLocalHookContribution({
            id: "monk-heightened-focus",
            label: "Heightened Focus",
            entryId: CLASS_FEATURE.HEIGHTENED_FOCUS
          })
        ]
      : []),
    ...(hasMonkFeature(character, CLASS_FEATURE.SELF_RESTORATION)
      ? [createMonkSelfRestorationContribution(character)]
      : []),
    ...(hasMonkFeature(character, CLASS_FEATURE.DEFLECT_ENERGY)
      ? [createMonkDeflectEnergyContribution()]
      : []),
    ...(hasMonkFeature(character, CLASS_FEATURE.DISCIPLINED_SURVIVOR)
      ? [createMonkDisciplinedSurvivorContribution(character)]
      : []),
    ...(hasMonkFeature(character, CLASS_FEATURE.PERFECT_FOCUS)
      ? [createMonkPerfectFocusContribution(character)]
      : []),
    ...(hasMonkFeature(character, CLASS_FEATURE.SUPERIOR_DEFENSE)
      ? [createMonkSuperiorDefenseContribution(character, featureActions)]
      : []),
    ...(hasMonkFeature(character, CLASS_FEATURE.BODY_AND_MIND)
      ? [createMonkBodyAndMindContribution(character)]
      : [])
  ];
}

export function getMonkClassFeatureDerivedState(
  character: CollectedClassFeatureCharacter
): ClassFeatureDerivedState {
  return projectCompiledContributionsToClassFeatureDerivedState(
    compileFeatureContributions(collectMonkFeatureContributions(character)),
    {
      character: character as Character
    }
  );
}

export function getMonkFeatureDescriptionAdditions(
  character: CollectedClassFeatureCharacter,
  target: FeatureDescriptionContributionTarget,
  targetKey?: string
): SpellDescriptionEntry[][] {
  return getFeatureDescriptionAdditions(
    compileFeatureContributions(collectMonkFeatureContributions(character)),
    target,
    {
      character: character as Character,
      targetKey
    }
  );
}
