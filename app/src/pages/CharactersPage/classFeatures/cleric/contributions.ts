import { CLASS_FEATURE } from "../../../../codex/entries";
import type { Character } from "../../../../types";
import type { WeaponAction } from "../../gameplay";
import {
  compileFeatureContributions,
  createClassContributionSource,
  projectCompiledContributionsToClassFeatureDerivedState,
  type FeatureContributionSpec
} from "../../featureContributions";
import type { ClassFeatureDerivedState, CollectedClassFeatureCharacter } from "../types";
import {
  channelDivinityActionKey,
  getClericArmorProficiencyEntries,
  getClericCantripBonus,
  getClericCantripDamageBonus,
  getClericChannelDivinityAction,
  getClericDivineInterventionAction,
  getClericFeatureActionOptions,
  getClericSkillBonuses,
  getClericSpellEntry,
  getClericWeaponAction,
  getClericWeaponDamageBonuses,
  getClericWeaponProficiencyEntries
} from "./cleric";
import { hasClericFeature } from "./clericFeatureState";

function compactActions<TAction>(actions: Array<TAction | null>): TAction[] {
  return actions.filter((action): action is TAction => action !== null);
}

function createClericDivineOrderContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "cleric-divine-order",
      label: "Divine Order",
      entryId: CLASS_FEATURE.DIVINE_ORDER
    }),
    cantripLimitBonus: getClericCantripBonus(character),
    skillBonuses: [
      {
        id: "cleric-divine-order-skill-bonus",
        getBonuses: (skill) => getClericSkillBonuses(character, skill)
      }
    ],
    weaponProficiencyEntries: getClericWeaponProficiencyEntries(character),
    armorProficiencyEntries: getClericArmorProficiencyEntries(character)
  };
}

function createClericChannelDivinityContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "cleric-channel-divinity",
      label: "Channel Divinity",
      entryId: CLASS_FEATURE.CHANNEL_DIVINITY
    }),
    actions: compactActions([getClericChannelDivinityAction(character)]),
    actionOptions: {
      [channelDivinityActionKey]: getClericFeatureActionOptions(character)
    }
  };
}

function createClericBlessedStrikesContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "cleric-blessed-strikes",
      label: "Blessed Strikes",
      entryId: CLASS_FEATURE.BLESSED_STRIKES
    }),
    cantripDamageBonus: getClericCantripDamageBonus(character),
    weaponDamageBonuses: [
      {
        id: "cleric-blessed-strikes-weapon-damage",
        getBonuses: (context) => getClericWeaponDamageBonuses(character, context)
      }
    ],
    spellTransforms: [
      {
        id: "cleric-blessed-strikes-spell-transform",
        transform: (spell) => getClericSpellEntry(character, spell)
      }
    ],
    weaponActionTransforms: [
      {
        id: "cleric-blessed-strikes-weapon-action-transform",
        transform: (_character, action) => getClericWeaponAction(character, action as WeaponAction)
      }
    ]
  };
}

function createClericDivineInterventionContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "cleric-divine-intervention",
      label: "Divine Intervention",
      entryId: CLASS_FEATURE.DIVINE_INTERVENTION
    }),
    actions: compactActions([getClericDivineInterventionAction(character)])
  };
}

function createClericLocalHookContribution(input: {
  id: string;
  label: string;
  entryId: CLASS_FEATURE;
}): FeatureContributionSpec {
  return {
    source: createClassContributionSource(input)
  };
}

export function collectClericFeatureContributions(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec[] {
  return [
    createClericDivineOrderContribution(character),
    createClericChannelDivinityContribution(character),
    ...(hasClericFeature(character, CLASS_FEATURE.SEAR_UNDEAD)
      ? [
          createClericLocalHookContribution({
            id: "cleric-sear-undead",
            label: "Sear Undead",
            entryId: CLASS_FEATURE.SEAR_UNDEAD
          })
        ]
      : []),
    createClericBlessedStrikesContribution(character),
    ...(hasClericFeature(character, CLASS_FEATURE.IMPROVED_BLESSED_STRIKES)
      ? [
          createClericLocalHookContribution({
            id: "cleric-improved-blessed-strikes",
            label: "Improved Blessed Strikes",
            entryId: CLASS_FEATURE.IMPROVED_BLESSED_STRIKES
          })
        ]
      : []),
    createClericDivineInterventionContribution(character),
    ...(hasClericFeature(character, CLASS_FEATURE.GREATER_DIVINE_INTERVENTION)
      ? [
          createClericLocalHookContribution({
            id: "cleric-greater-divine-intervention",
            label: "Greater Divine Intervention",
            entryId: CLASS_FEATURE.GREATER_DIVINE_INTERVENTION
          })
        ]
      : [])
  ];
}

export function getClericClassFeatureDerivedState(
  character: CollectedClassFeatureCharacter
): ClassFeatureDerivedState {
  return projectCompiledContributionsToClassFeatureDerivedState(
    compileFeatureContributions(collectClericFeatureContributions(character)),
    {
      character: character as Character
    }
  );
}
