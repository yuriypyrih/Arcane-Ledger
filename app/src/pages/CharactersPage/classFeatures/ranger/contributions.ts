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
  FeatureActionCard,
  FeatureSkillProficiencyEntry
} from "../types";
import {
  favoredEnemyActionKey,
  getRangerAlwaysPreparedSpellIds,
  getRangerDerivedStatusEntries,
  getRangerFeatureActions,
  getRangerLanguageProficiencyEntries,
  getRangerSkillProficiencyEntries,
  getRangerSpeedBonuses,
  getRangerSpellDamageFormula,
  getRangerSpellEntry,
  getRangerWeaponMasteryOptions,
  getRangerWeaponMasterySelectionCount,
  getRangerWeaponMasterySelections,
  getRangerWeaponProficiencyEntries,
  hasRangerFeature,
  naturesVeilActionKey,
  setRangerWeaponMasterySelections,
  tirelessActionKey
} from "./ranger";

const rangerDeftExplorerSource = "Deft Explorer";
const rangerExpertiseSource = "Level 9: Expertise";

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

function getSkillProficiencyEntriesBySource(
  entries: FeatureSkillProficiencyEntry[],
  source: string
): FeatureSkillProficiencyEntry[] {
  return entries.filter((entry) => entry.sourceStr === source);
}

function createRangerLocalHookContribution(input: {
  id: string;
  label: string;
  entryId: CLASS_FEATURE;
}): FeatureContributionSpec {
  return {
    source: createClassContributionSource(input)
  };
}

function createRangerFavoredEnemyContribution(
  character: CollectedClassFeatureCharacter,
  featureActions: FeatureActionCard[]
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "ranger-favored-enemy",
      label: "Favored Enemy",
      entryId: CLASS_FEATURE.FAVORED_ENEMY
    }),
    actions: getFeatureActionByKey(featureActions, favoredEnemyActionKey),
    alwaysPreparedSpellIds: getRangerAlwaysPreparedSpellIds(character),
    spellTransforms: [
      {
        id: "ranger-hunters-mark-feature-transform",
        transform: (spell) => getRangerSpellEntry(character, spell)
      }
    ],
    spellDamageFormulaOverrideProviders: [
      {
        id: "ranger-hunters-mark-damage-formula",
        getOverride: (spell) => getRangerSpellDamageFormula(character, spell)
      }
    ]
  };
}

function createRangerWeaponMasteryContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "ranger-weapon-mastery",
      label: "Weapon Mastery",
      entryId: CLASS_FEATURE.WEAPON_MASTERY
    }),
    weaponProficiencyEntries: getRangerWeaponProficiencyEntries(character),
    classMechanics: {
      weaponMastery: {
        selectionCount: getRangerWeaponMasterySelectionCount(character),
        options: getRangerWeaponMasteryOptions(),
        selections: getRangerWeaponMasterySelections(character),
        setSelections: setRangerWeaponMasterySelections
      }
    }
  };
}

function createRangerDeftExplorerContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  const skillEntries = getRangerSkillProficiencyEntries(character);

  return {
    source: createClassContributionSource({
      id: "ranger-deft-explorer",
      label: rangerDeftExplorerSource,
      entryId: CLASS_FEATURE.DEFT_EXPLORER
    }),
    skillProficiencyEntries: getSkillProficiencyEntriesBySource(
      skillEntries,
      rangerDeftExplorerSource
    ),
    languageProficiencyEntries: getRangerLanguageProficiencyEntries(character)
  };
}

function createRangerRovingContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "ranger-roving",
      label: "Roving",
      entryId: CLASS_FEATURE.ROVING
    }),
    speedBonusProviders: [
      {
        id: "ranger-roving-speed",
        getBonuses: (context) => getRangerSpeedBonuses(character, context)
      }
    ]
  };
}

function createRangerExpertiseContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "ranger-expertise",
      label: "Expertise",
      entryId: CLASS_FEATURE.EXPERTISE
    }),
    skillProficiencyEntries: getSkillProficiencyEntriesBySource(
      getRangerSkillProficiencyEntries(character),
      rangerExpertiseSource
    )
  };
}

function createRangerTirelessContribution(
  featureActions: FeatureActionCard[]
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "ranger-tireless",
      label: "Tireless",
      entryId: CLASS_FEATURE.TIRELESS
    }),
    actions: getFeatureActionByKey(featureActions, tirelessActionKey)
  };
}

function createRangerNaturesVeilContribution(
  featureActions: FeatureActionCard[]
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "ranger-natures-veil",
      label: "Nature's Veil",
      entryId: CLASS_FEATURE.NATURES_VEIL
    }),
    actions: getFeatureActionByKey(featureActions, naturesVeilActionKey)
  };
}

function createRangerFeralSensesContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "ranger-feral-senses",
      label: "Feral Senses",
      entryId: CLASS_FEATURE.FERAL_SENSES
    }),
    statuses: getStatusEntriesBySource(getRangerDerivedStatusEntries(character), "Feral Senses")
  };
}

export function collectRangerFeatureContributions(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec[] {
  const featureActions = getRangerFeatureActions(character);
  const contributions: FeatureContributionSpec[] = [
    createRangerLocalHookContribution({
      id: "ranger-spellcasting",
      label: "Spellcasting",
      entryId: CLASS_FEATURE.SPELLCASTING
    }),
    createRangerFavoredEnemyContribution(character, featureActions),
    createRangerWeaponMasteryContribution(character)
  ];

  if (hasRangerFeature(character, CLASS_FEATURE.DEFT_EXPLORER)) {
    contributions.push(createRangerDeftExplorerContribution(character));
  }

  if (hasRangerFeature(character, CLASS_FEATURE.FIGHTING_STYLE)) {
    contributions.push(
      createRangerLocalHookContribution({
        id: "ranger-fighting-style",
        label: "Fighting Style",
        entryId: CLASS_FEATURE.FIGHTING_STYLE
      })
    );
  }

  if (hasRangerFeature(character, CLASS_FEATURE.EXTRA_ATTACK)) {
    contributions.push(
      createRangerLocalHookContribution({
        id: "ranger-extra-attack",
        label: "Extra Attack",
        entryId: CLASS_FEATURE.EXTRA_ATTACK
      })
    );
  }

  if (hasRangerFeature(character, CLASS_FEATURE.ROVING)) {
    contributions.push(createRangerRovingContribution(character));
  }

  if (hasRangerFeature(character, CLASS_FEATURE.EXPERTISE)) {
    contributions.push(createRangerExpertiseContribution(character));
  }

  if (hasRangerFeature(character, CLASS_FEATURE.TIRELESS)) {
    contributions.push(createRangerTirelessContribution(featureActions));
  }

  if (hasRangerFeature(character, CLASS_FEATURE.RELENTLESS_HUNTER)) {
    contributions.push(
      createRangerLocalHookContribution({
        id: "ranger-relentless-hunter",
        label: "Relentless Hunter",
        entryId: CLASS_FEATURE.RELENTLESS_HUNTER
      })
    );
  }

  if (hasRangerFeature(character, CLASS_FEATURE.NATURES_VEIL)) {
    contributions.push(createRangerNaturesVeilContribution(featureActions));
  }

  if (hasRangerFeature(character, CLASS_FEATURE.PRECISE_HUNTER)) {
    contributions.push(
      createRangerLocalHookContribution({
        id: "ranger-precise-hunter",
        label: "Precise Hunter",
        entryId: CLASS_FEATURE.PRECISE_HUNTER
      })
    );
  }

  if (hasRangerFeature(character, CLASS_FEATURE.FERAL_SENSES)) {
    contributions.push(createRangerFeralSensesContribution(character));
  }

  if (hasRangerFeature(character, CLASS_FEATURE.EPIC_BOON)) {
    contributions.push(
      createRangerLocalHookContribution({
        id: "ranger-epic-boon",
        label: "Epic Boon",
        entryId: CLASS_FEATURE.EPIC_BOON
      })
    );
  }

  if (hasRangerFeature(character, CLASS_FEATURE.FOE_SLAYER)) {
    contributions.push(
      createRangerLocalHookContribution({
        id: "ranger-foe-slayer",
        label: "Foe Slayer",
        entryId: CLASS_FEATURE.FOE_SLAYER
      })
    );
  }

  return contributions;
}

export function getRangerClassFeatureDerivedState(
  character: CollectedClassFeatureCharacter
): ClassFeatureDerivedState {
  return projectCompiledContributionsToClassFeatureDerivedState(
    compileFeatureContributions(collectRangerFeatureContributions(character)),
    {
      character: character as Character
    }
  );
}
