import { CLASS_FEATURE } from "../../../../codex/entries";
import type { Character } from "../../../../types";
import {
  compileFeatureContributions,
  createClassContributionSource,
  projectCompiledContributionsToClassFeatureDerivedState,
  type FeatureContributionSpec
} from "../../featureContributions";
import type { WeaponAction } from "../../gameplay";
import type { ClassFeatureDerivedState, CollectedClassFeatureCharacter } from "../types";
import {
  getDruidAlwaysPreparedSpellIds,
  getDruidArmorProficiencyEntries,
  getDruidCantripBonus,
  getDruidCantripDamageBonus,
  getDruidDerivedStatusEntries,
  getDruidLanguageProficiencyEntries,
  getDruidNatureMagicianAction,
  getDruidSkillBonuses,
  getDruidSpellcastingState,
  getDruidSpellEntry,
  getDruidWeaponAction,
  getDruidWeaponDamageBonuses,
  getDruidWeaponProficiencyEntries,
  getDruidWildCompanionAction,
  getDruidWildResurgenceAction,
  getDruidWildShapeAction,
  hasDruidFeature
} from "./druid";

function compactActions<TAction>(actions: Array<TAction | null>): TAction[] {
  return actions.filter((action): action is TAction => action !== null);
}

function createDruidSpellcastingContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "druid-spellcasting",
      label: "Spellcasting",
      entryId: CLASS_FEATURE.SPELLCASTING
    }),
    spellcastingState: getDruidSpellcastingState(character)
  };
}

function createDruidDruidicContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "druid-druidic",
      label: "Druidic",
      entryId: CLASS_FEATURE.DRUIDIC
    }),
    languageProficiencyEntries: getDruidLanguageProficiencyEntries(character),
    alwaysPreparedSpellIds: getDruidAlwaysPreparedSpellIds(character)
  };
}

function createDruidPrimalOrderContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "druid-primal-order",
      label: "Primal Order",
      entryId: CLASS_FEATURE.PRIMAL_ORDER
    }),
    cantripLimitBonus: getDruidCantripBonus(character),
    skillBonuses: [
      {
        id: "druid-primal-order-skill-bonus",
        getBonuses: (skill) => getDruidSkillBonuses(character, skill)
      }
    ],
    weaponProficiencyEntries: getDruidWeaponProficiencyEntries(character),
    armorProficiencyEntries: getDruidArmorProficiencyEntries(character)
  };
}

function createDruidWildShapeContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "druid-wild-shape",
      label: "Wild Shape",
      entryId: CLASS_FEATURE.WILD_SHAPE
    }),
    actions: compactActions([getDruidWildShapeAction(character)]),
    statuses: getDruidDerivedStatusEntries(character)
  };
}

function createDruidWildCompanionContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "druid-wild-companion",
      label: "Wild Companion",
      entryId: CLASS_FEATURE.WILD_COMPANION
    }),
    actions: compactActions([getDruidWildCompanionAction(character)])
  };
}

function createDruidWildResurgenceContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "druid-wild-resurgence",
      label: "Wild Resurgence",
      entryId: CLASS_FEATURE.WILD_RESURGENCE
    }),
    actions: compactActions([getDruidWildResurgenceAction(character)])
  };
}

function createDruidElementalFuryContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "druid-elemental-fury",
      label: "Elemental Fury",
      entryId: CLASS_FEATURE.ELEMENTAL_FURY
    }),
    cantripDamageBonus: getDruidCantripDamageBonus(character),
    spellTransforms: [
      {
        id: "druid-elemental-fury-spell-transform",
        transform: (spell) => getDruidSpellEntry(character, spell)
      }
    ],
    weaponDamageBonuses: [
      {
        id: "druid-elemental-fury-weapon-damage",
        getBonuses: (context) => getDruidWeaponDamageBonuses(character, context)
      }
    ],
    weaponActionTransforms: [
      {
        id: "druid-elemental-fury-weapon-action-transform",
        transform: (_character, action) => getDruidWeaponAction(character, action as WeaponAction)
      }
    ]
  };
}

function createDruidArchdruidContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "druid-archdruid",
      label: "Archdruid",
      entryId: CLASS_FEATURE.ARCHDRUID
    }),
    actions: compactActions([getDruidNatureMagicianAction(character)])
  };
}

function createDruidLocalHookContribution(input: {
  id: string;
  label: string;
  entryId: CLASS_FEATURE;
}): FeatureContributionSpec {
  return {
    source: createClassContributionSource(input)
  };
}

export function collectDruidFeatureContributions(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec[] {
  return [
    createDruidSpellcastingContribution(character),
    createDruidDruidicContribution(character),
    createDruidPrimalOrderContribution(character),
    createDruidWildShapeContribution(character),
    createDruidWildCompanionContribution(character),
    createDruidWildResurgenceContribution(character),
    createDruidElementalFuryContribution(character),
    ...(hasDruidFeature(character, CLASS_FEATURE.IMPROVED_ELEMENTAL_FURY)
      ? [
          createDruidLocalHookContribution({
            id: "druid-improved-elemental-fury",
            label: "Improved Elemental Fury",
            entryId: CLASS_FEATURE.IMPROVED_ELEMENTAL_FURY
          })
        ]
      : []),
    ...(hasDruidFeature(character, CLASS_FEATURE.BEAST_SPELLS)
      ? [
          createDruidLocalHookContribution({
            id: "druid-beast-spells",
            label: "Beast Spells",
            entryId: CLASS_FEATURE.BEAST_SPELLS
          })
        ]
      : []),
    createDruidArchdruidContribution(character)
  ];
}

export function getDruidClassFeatureDerivedState(
  character: CollectedClassFeatureCharacter
): ClassFeatureDerivedState {
  return projectCompiledContributionsToClassFeatureDerivedState(
    compileFeatureContributions(collectDruidFeatureContributions(character)),
    {
      character: character as Character
    }
  );
}
