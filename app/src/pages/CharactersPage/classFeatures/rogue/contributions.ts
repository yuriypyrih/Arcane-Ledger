import { CLASS_FEATURE } from "../../../../codex/entries";
import type { Character, CharacterStatusEntry } from "../../../../types";
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
  FeatureActionCard,
  FeatureSkillProficiencyEntry
} from "../types";
import {
  getRogueCommonAction,
  getRogueDerivedStatusEntries,
  getRogueFeatureActions,
  getRogueLanguageProficiencyEntries,
  getRogueReactionEntries,
  getRogueSavingThrowProficiencyEntries,
  getRogueSkillProficiencyEntries,
  getRogueSneakAttackDiceCount,
  getRogueSneakAttackFormula,
  getRogueSpeedBonuses,
  getRogueWeaponAction,
  getRogueWeaponMasteryOptions,
  getRogueWeaponMasterySelectionCount,
  getRogueWeaponMasterySelections,
  getRogueWeaponProficiencyEntries,
  hasRogueFeature,
  rogueSneakAttackActionKey,
  rogueSteadyAimActionKey,
  rogueStrokeOfLuckActionKey,
  setRogueWeaponMasterySelections
} from "./rogue";

const rogueLevel1ExpertiseSource = "Level 1: Expertise";
const rogueLevel6ExpertiseSource = "Level 6: Expertise";

function getFeatureActionByKey(
  actions: FeatureActionCard[],
  actionKey: string
): FeatureActionCard[] {
  return actions.filter((action) => action.key === actionKey);
}

function getSkillProficiencyEntriesBySource(
  entries: FeatureSkillProficiencyEntry[],
  source: string
): FeatureSkillProficiencyEntry[] {
  return entries.filter((entry) => entry.sourceStr === source);
}

function getStatusEntriesByValue(
  statuses: CharacterStatusEntry[],
  value: string
): CharacterStatusEntry[] {
  return statuses.filter((status) => status.value === value);
}

function createRogueLocalHookContribution(input: {
  id: string;
  label: string;
  entryId: CLASS_FEATURE;
}): FeatureContributionSpec {
  return {
    source: createClassContributionSource(input)
  };
}

function createRogueExpertiseContribution(
  character: CollectedClassFeatureCharacter,
  source: string
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: source,
      label: "Expertise",
      entryId: CLASS_FEATURE.EXPERTISE
    }),
    skillProficiencyEntries: getSkillProficiencyEntriesBySource(
      getRogueSkillProficiencyEntries(character),
      source
    )
  };
}

function createRogueSneakAttackContribution(
  character: CollectedClassFeatureCharacter,
  featureActions: FeatureActionCard[]
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "rogue-sneak-attack",
      label: "Sneak Attack",
      entryId: CLASS_FEATURE.SNEAK_ATTACK
    }),
    actions: getFeatureActionByKey(featureActions, rogueSneakAttackActionKey),
    classMechanics: {
      rogueSneakAttackDiceCount: getRogueSneakAttackDiceCount(character),
      rogueSneakAttackFormula: getRogueSneakAttackFormula(character) ?? "0"
    }
  };
}

function createRogueThievesCantContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "rogue-thieves-cant",
      label: "Thieves' Cant",
      entryId: CLASS_FEATURE.THIEVES_CANT
    }),
    languageProficiencyEntries: getRogueLanguageProficiencyEntries(character)
  };
}

function createRogueCunningActionContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "rogue-cunning-action",
      label: "Cunning Action",
      entryId: CLASS_FEATURE.CUNNING_ACTION
    }),
    commonActionTransforms: [
      {
        id: "rogue-cunning-action-common-action-transform",
        transform: <TAction extends Pick<FeatureActionCard, "key" | "descriptionAdditions">>(
          _character: Character,
          action: TAction
        ): TAction =>
          getRogueCommonAction(
            character,
            action as unknown as FeatureActionCard
          ) as unknown as TAction
      }
    ]
  };
}

function createRogueSteadyAimContribution(
  character: CollectedClassFeatureCharacter,
  featureActions: FeatureActionCard[]
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "rogue-steady-aim",
      label: "Steady Aim",
      entryId: CLASS_FEATURE.STEADY_AIM
    }),
    actions: getFeatureActionByKey(featureActions, rogueSteadyAimActionKey),
    speedBonusProviders: [
      {
        id: "rogue-steady-aim-speed",
        getBonuses: () => getRogueSpeedBonuses(character)
      }
    ],
    weaponActionTransforms: [
      {
        id: "rogue-steady-aim-weapon-transform",
        transform: (_character: Character, action: unknown) =>
          getRogueWeaponAction(character, action as WeaponAction)
      }
    ]
  };
}

function createRogueWeaponMasteryContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "rogue-weapon-mastery",
      label: "Weapon Mastery",
      entryId: CLASS_FEATURE.WEAPON_MASTERY
    }),
    weaponProficiencyEntries: getRogueWeaponProficiencyEntries(character),
    classMechanics: {
      weaponMastery: {
        selectionCount: getRogueWeaponMasterySelectionCount(character),
        options: getRogueWeaponMasteryOptions(),
        selections: getRogueWeaponMasterySelections(character),
        setSelections: setRogueWeaponMasterySelections
      }
    }
  };
}

function createRogueUncannyDodgeContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "rogue-uncanny-dodge",
      label: "Uncanny Dodge",
      entryId: CLASS_FEATURE.UNCANNY_DODGE
    }),
    reactions: getRogueReactionEntries(character)
  };
}

function createRogueSlipperyMindContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "rogue-slippery-mind",
      label: "Slippery Mind",
      entryId: CLASS_FEATURE.SLIPPERY_MIND
    }),
    savingThrowProficiencyEntries: getRogueSavingThrowProficiencyEntries(character)
  };
}

function createRogueElusiveContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "rogue-elusive",
      label: "Elusive",
      entryId: CLASS_FEATURE.ELUSIVE
    }),
    statuses: getStatusEntriesByValue(getRogueDerivedStatusEntries(character), "Elusive")
  };
}

function createRogueStrokeOfLuckContribution(
  featureActions: FeatureActionCard[]
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "rogue-stroke-of-luck",
      label: "Stroke of Luck",
      entryId: CLASS_FEATURE.STROKE_OF_LUCK
    }),
    actions: getFeatureActionByKey(featureActions, rogueStrokeOfLuckActionKey)
  };
}

export function collectRogueFeatureContributions(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec[] {
  const featureActions = getRogueFeatureActions(character);
  const contributions: FeatureContributionSpec[] = [];

  if (hasRogueFeature(character, CLASS_FEATURE.EXPERTISE)) {
    contributions.push(createRogueExpertiseContribution(character, rogueLevel1ExpertiseSource));
  }

  if (hasRogueFeature(character, CLASS_FEATURE.SNEAK_ATTACK)) {
    contributions.push(createRogueSneakAttackContribution(character, featureActions));
  }

  if (hasRogueFeature(character, CLASS_FEATURE.THIEVES_CANT)) {
    contributions.push(createRogueThievesCantContribution(character));
  }

  if (hasRogueFeature(character, CLASS_FEATURE.WEAPON_MASTERY)) {
    contributions.push(createRogueWeaponMasteryContribution(character));
  }

  if (hasRogueFeature(character, CLASS_FEATURE.CUNNING_ACTION)) {
    contributions.push(createRogueCunningActionContribution(character));
  }

  if (hasRogueFeature(character, CLASS_FEATURE.STEADY_AIM)) {
    contributions.push(createRogueSteadyAimContribution(character, featureActions));
  }

  if (hasRogueFeature(character, CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT)) {
    contributions.push(
      createRogueLocalHookContribution({
        id: "rogue-ability-score-improvement",
        label: "Ability Score Improvement",
        entryId: CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT
      })
    );
  }

  if (hasRogueFeature(character, CLASS_FEATURE.CUNNING_STRIKE)) {
    contributions.push(
      createRogueLocalHookContribution({
        id: "rogue-cunning-strike",
        label: "Cunning Strike",
        entryId: CLASS_FEATURE.CUNNING_STRIKE
      })
    );
  }

  if (hasRogueFeature(character, CLASS_FEATURE.UNCANNY_DODGE)) {
    contributions.push(createRogueUncannyDodgeContribution(character));
  }

  if (character.level >= 6 && hasRogueFeature(character, CLASS_FEATURE.EXPERTISE)) {
    contributions.push(createRogueExpertiseContribution(character, rogueLevel6ExpertiseSource));
  }

  if (hasRogueFeature(character, CLASS_FEATURE.EVASION)) {
    contributions.push(
      createRogueLocalHookContribution({
        id: "rogue-evasion",
        label: "Evasion",
        entryId: CLASS_FEATURE.EVASION
      })
    );
  }

  if (hasRogueFeature(character, CLASS_FEATURE.RELIABLE_TALENT)) {
    contributions.push(
      createRogueLocalHookContribution({
        id: "rogue-reliable-talent",
        label: "Reliable Talent",
        entryId: CLASS_FEATURE.RELIABLE_TALENT
      })
    );
  }

  if (hasRogueFeature(character, CLASS_FEATURE.IMPROVED_CUNNING_STRIKE)) {
    contributions.push(
      createRogueLocalHookContribution({
        id: "rogue-improved-cunning-strike",
        label: "Improved Cunning Strike",
        entryId: CLASS_FEATURE.IMPROVED_CUNNING_STRIKE
      })
    );
  }

  if (hasRogueFeature(character, CLASS_FEATURE.DEVIOUS_STRIKES)) {
    contributions.push(
      createRogueLocalHookContribution({
        id: "rogue-devious-strikes",
        label: "Devious Strikes",
        entryId: CLASS_FEATURE.DEVIOUS_STRIKES
      })
    );
  }

  if (hasRogueFeature(character, CLASS_FEATURE.SLIPPERY_MIND)) {
    contributions.push(createRogueSlipperyMindContribution(character));
  }

  if (hasRogueFeature(character, CLASS_FEATURE.ELUSIVE)) {
    contributions.push(createRogueElusiveContribution(character));
  }

  if (hasRogueFeature(character, CLASS_FEATURE.EPIC_BOON)) {
    contributions.push(
      createRogueLocalHookContribution({
        id: "rogue-epic-boon",
        label: "Epic Boon",
        entryId: CLASS_FEATURE.EPIC_BOON
      })
    );
  }

  if (hasRogueFeature(character, CLASS_FEATURE.STROKE_OF_LUCK)) {
    contributions.push(createRogueStrokeOfLuckContribution(featureActions));
  }

  return contributions;
}

export function getRogueClassFeatureDerivedState(
  character: CollectedClassFeatureCharacter
): ClassFeatureDerivedState {
  return projectCompiledContributionsToClassFeatureDerivedState(
    compileFeatureContributions(collectRogueFeatureContributions(character)),
    {
      character: character as Character
    }
  );
}
