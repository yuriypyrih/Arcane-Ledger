import { CLASS_FEATURE } from "../../../../codex/entries";
import type { Character, CharacterStatusEntry } from "../../../../types";
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
  abjureFoesActionKey,
  faithfulSteedActionKey,
  getPaladinAlwaysPreparedSpellIds,
  getPaladinDerivedStatusEntries,
  getPaladinFeatureActionOptions,
  getPaladinFeatureActions,
  getPaladinWeaponDamageBonuses,
  getPaladinWeaponMasteryOptions,
  getPaladinWeaponMasterySelectionCount,
  getPaladinWeaponMasterySelections,
  getPaladinWeaponProficiencyEntries,
  hasPaladinFeature,
  paladinChannelDivinityActionKey,
  paladinLayOnHandsActionKey,
  paladinsSmiteActionKey,
  setPaladinWeaponMasterySelections
} from "./paladin";

const divineSmiteSpellId = "spell-divine-smite";
const findSteedSpellId = "spell-find-steed";

function getFeatureActionByKey(
  actions: FeatureActionCard[],
  actionKey: string
): FeatureActionCard[] {
  return actions.filter((action) => action.key === actionKey);
}

function getStatusEntriesBySource(
  statuses: CharacterStatusEntry[],
  source: string
): CharacterStatusEntry[] {
  return statuses.filter((status) => status.source === source);
}

function createPaladinLocalHookContribution(input: {
  id: string;
  label: string;
  entryId: CLASS_FEATURE;
}): FeatureContributionSpec {
  return {
    source: createClassContributionSource(input)
  };
}

function createPaladinLayOnHandsContribution(
  featureActions: FeatureActionCard[]
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "paladin-lay-on-hands",
      label: "Lay on Hands",
      entryId: CLASS_FEATURE.LAY_ON_HANDS
    }),
    actions: getFeatureActionByKey(featureActions, paladinLayOnHandsActionKey)
  };
}

function createPaladinWeaponMasteryContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "paladin-weapon-mastery",
      label: "Weapon Mastery",
      entryId: CLASS_FEATURE.WEAPON_MASTERY
    }),
    weaponProficiencyEntries: getPaladinWeaponProficiencyEntries(character),
    classMechanics: {
      weaponMastery: {
        selectionCount: getPaladinWeaponMasterySelectionCount(character),
        options: getPaladinWeaponMasteryOptions(),
        selections: getPaladinWeaponMasterySelections(character),
        setSelections: setPaladinWeaponMasterySelections
      }
    }
  };
}

function createPaladinSmiteContribution(
  character: CollectedClassFeatureCharacter,
  featureActions: FeatureActionCard[]
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "paladin-paladins-smite",
      label: "Paladin's Smite",
      entryId: CLASS_FEATURE.PALADINS_SMITE
    }),
    actions: getFeatureActionByKey(featureActions, paladinsSmiteActionKey),
    alwaysPreparedSpellIds: getPaladinAlwaysPreparedSpellIds(character).filter(
      (spellId) => spellId === divineSmiteSpellId
    )
  };
}

function createPaladinChannelDivinityContribution(
  character: CollectedClassFeatureCharacter,
  featureActions: FeatureActionCard[]
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "paladin-channel-divinity",
      label: "Channel Divinity",
      entryId: CLASS_FEATURE.CHANNEL_DIVINITY
    }),
    actions: getFeatureActionByKey(featureActions, paladinChannelDivinityActionKey),
    actionOptions: {
      [paladinChannelDivinityActionKey]: getPaladinFeatureActionOptions(character)
    }
  };
}

function createPaladinFaithfulSteedContribution(
  character: CollectedClassFeatureCharacter,
  featureActions: FeatureActionCard[]
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "paladin-faithful-steed",
      label: "Faithful Steed",
      entryId: CLASS_FEATURE.FAITHFUL_STEED
    }),
    actions: getFeatureActionByKey(featureActions, faithfulSteedActionKey),
    alwaysPreparedSpellIds: getPaladinAlwaysPreparedSpellIds(character).filter(
      (spellId) => spellId === findSteedSpellId
    )
  };
}

function createPaladinAuraOfProtectionContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "paladin-aura-of-protection",
      label: "Aura of Protection",
      entryId: CLASS_FEATURE.AURA_OF_PROTECTION
    }),
    statuses: getStatusEntriesBySource(getPaladinDerivedStatusEntries(character), "Aura of Protection")
  };
}

function createPaladinAbjureFoesContribution(
  featureActions: FeatureActionCard[]
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "paladin-abjure-foes",
      label: "Abjure Foes",
      entryId: CLASS_FEATURE.ABJURE_FOES
    }),
    actions: getFeatureActionByKey(featureActions, abjureFoesActionKey)
  };
}

function createPaladinAuraOfCourageContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "paladin-aura-of-courage",
      label: "Aura of Courage",
      entryId: CLASS_FEATURE.AURA_OF_COURAGE
    }),
    statuses: getStatusEntriesBySource(getPaladinDerivedStatusEntries(character), "Aura of Courage")
  };
}

function createPaladinRadiantStrikesContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "paladin-radiant-strikes",
      label: "Radiant Strikes",
      entryId: CLASS_FEATURE.RADIANT_STRIKES
    }),
    weaponDamageBonuses: [
      {
        id: "paladin-radiant-strikes-weapon-damage",
        getBonuses: (context) => getPaladinWeaponDamageBonuses(character, context)
      }
    ]
  };
}

export function collectPaladinFeatureContributions(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec[] {
  const featureActions = getPaladinFeatureActions(character);
  const contributions: FeatureContributionSpec[] = [
    createPaladinLayOnHandsContribution(featureActions),
    createPaladinLocalHookContribution({
      id: "paladin-spellcasting",
      label: "Spellcasting",
      entryId: CLASS_FEATURE.SPELLCASTING
    }),
    createPaladinWeaponMasteryContribution(character),
    createPaladinLocalHookContribution({
      id: "paladin-fighting-style",
      label: "Fighting Style",
      entryId: CLASS_FEATURE.FIGHTING_STYLE
    }),
    createPaladinSmiteContribution(character, featureActions),
    createPaladinChannelDivinityContribution(character, featureActions)
  ];

  if (hasPaladinFeature(character, CLASS_FEATURE.EXTRA_ATTACK)) {
    contributions.push(
      createPaladinLocalHookContribution({
        id: "paladin-extra-attack",
        label: "Extra Attack",
        entryId: CLASS_FEATURE.EXTRA_ATTACK
      })
    );
  }

  contributions.push(createPaladinFaithfulSteedContribution(character, featureActions));

  if (hasPaladinFeature(character, CLASS_FEATURE.AURA_OF_PROTECTION)) {
    contributions.push(createPaladinAuraOfProtectionContribution(character));
  }

  if (hasPaladinFeature(character, CLASS_FEATURE.ABJURE_FOES)) {
    contributions.push(createPaladinAbjureFoesContribution(featureActions));
  }

  if (hasPaladinFeature(character, CLASS_FEATURE.AURA_OF_COURAGE)) {
    contributions.push(createPaladinAuraOfCourageContribution(character));
  }

  if (hasPaladinFeature(character, CLASS_FEATURE.RADIANT_STRIKES)) {
    contributions.push(createPaladinRadiantStrikesContribution(character));
  }

  if (hasPaladinFeature(character, CLASS_FEATURE.RESTORING_TOUCH)) {
    contributions.push(
      createPaladinLocalHookContribution({
        id: "paladin-restoring-touch",
        label: "Restoring Touch",
        entryId: CLASS_FEATURE.RESTORING_TOUCH
      })
    );
  }

  if (hasPaladinFeature(character, CLASS_FEATURE.AURA_EXPANSION)) {
    contributions.push(
      createPaladinLocalHookContribution({
        id: "paladin-aura-expansion",
        label: "Aura Expansion",
        entryId: CLASS_FEATURE.AURA_EXPANSION
      })
    );
  }

  if (hasPaladinFeature(character, CLASS_FEATURE.EPIC_BOON)) {
    contributions.push(
      createPaladinLocalHookContribution({
        id: "paladin-epic-boon",
        label: "Epic Boon",
        entryId: CLASS_FEATURE.EPIC_BOON
      })
    );
  }

  return contributions;
}

export function getPaladinClassFeatureDerivedState(
  character: CollectedClassFeatureCharacter
): ClassFeatureDerivedState {
  return projectCompiledContributionsToClassFeatureDerivedState(
    compileFeatureContributions(collectPaladinFeatureContributions(character)),
    {
      character: character as Character
    }
  );
}
