import { CLASS_FEATURE } from "../../../../codex/entries";
import type { SpellDescriptionEntry } from "../../../../codex/entries";
import type { Character } from "../../../../types";
import { createFeatureSourcedDescriptionEntries } from "../../actionModalDescriptions";
import {
  compileFeatureContributions,
  createClassContributionSource,
  getFeatureDescriptionAdditions,
  projectCompiledContributionsToClassFeatureDerivedState,
  type FeatureDescriptionContribution,
  type FeatureDescriptionContributionTarget,
  type FeatureContributionSpec
} from "../../featureContributions";
import type { WeaponAction } from "../../gameplay";
import type { ClassFeatureDerivedState, CollectedClassFeatureCharacter } from "../types";
import { getFeatureDescriptionForCharacter } from "../featureDescriptions";
import {
  barbarianBrutalStrikeActionKey,
  barbarianRageActionKey,
  getBarbarianAbilityScoreBonuses,
  getBarbarianArmorClassBonuses,
  getBarbarianArmorClassModes,
  getBarbarianBrutalStrikeAction,
  getBarbarianBrutalStrikeOptions,
  getBarbarianBrutalStrikeWeaponDamageBonuses,
  getBarbarianCoreStatIndicators,
  getBarbarianDangerSenseSavingThrowIndicators,
  getBarbarianFastMovementSpeedBonuses,
  getBarbarianFeatureAction,
  getBarbarianPrimalKnowledgeSkillIndicators,
  getBarbarianRageAbilityCheckIndicators,
  getBarbarianRageDerivedConditions,
  getBarbarianRageSavingThrowIndicators,
  getBarbarianRageSkillIndicators,
  getBarbarianRageWeaponDamageBonuses,
  getBarbarianRecklessAttackDerivedConditions,
  getBarbarianSkillBonuses,
  getBarbarianSkillProficiencyEntries,
  getBarbarianSpellcastingState,
  getBarbarianWeaponMasteryOptions,
  getBarbarianWeaponMasterySelectionCount,
  getBarbarianWeaponMasterySelections,
  getBarbarianWeaponProficiencyEntries,
  setBarbarianWeaponMasterySelections
} from "./barbarian";
import { transformBarbarianRecklessAttackWeaponAction } from "./barbarianRecklessAttack";

export const barbarianLifeAndDeathLedgerDescriptionTargetKey =
  "barbarian-life-and-death-ledger";

function compactActions<TAction>(actions: Array<TAction | null>): TAction[] {
  return actions.filter((action): action is TAction => action !== null);
}

function compactDescriptionAdditions(
  additions: Array<FeatureDescriptionContribution | null>
): FeatureDescriptionContribution[] {
  return additions.filter(
    (addition): addition is FeatureDescriptionContribution => addition !== null
  );
}

function createSourcedFeatureDescriptionAddition(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>,
  feature: CLASS_FEATURE,
  entries: SpellDescriptionEntry[],
  sourceLabel?: string
): SpellDescriptionEntry[][] {
  return entries.length > 0
    ? [createFeatureSourcedDescriptionEntries(character, feature, entries, sourceLabel)]
    : [];
}

function createBarbarianRageContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "barbarian-rage",
      label: "Rage",
      entryId: CLASS_FEATURE.RAGE
    }),
    actions: compactActions([getBarbarianFeatureAction(character)]),
    weaponDamageBonuses: [
      {
        id: "barbarian-rage-damage",
        getBonuses: (context) => getBarbarianRageWeaponDamageBonuses(character, context)
      }
    ],
    savingThrowIndicators: getBarbarianRageSavingThrowIndicators(character),
    abilityCheckIndicators: getBarbarianRageAbilityCheckIndicators(character),
    skillIndicators: getBarbarianRageSkillIndicators(character),
    spellcastingState: getBarbarianSpellcastingState(character),
    statuses: getBarbarianRageDerivedConditions(character)
  };
}

function createBarbarianDangerSenseContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "barbarian-danger-sense",
      label: "Danger Sense",
      entryId: CLASS_FEATURE.DANGER_SENSE
    }),
    savingThrowIndicators: getBarbarianDangerSenseSavingThrowIndicators(character)
  };
}

function createBarbarianWeaponMasteryContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "barbarian-weapon-mastery",
      label: "Weapon Mastery",
      entryId: CLASS_FEATURE.WEAPON_MASTERY
    }),
    weaponProficiencyEntries: getBarbarianWeaponProficiencyEntries(character),
    classMechanics: {
      weaponMastery: {
        selectionCount: getBarbarianWeaponMasterySelectionCount(character),
        options: getBarbarianWeaponMasteryOptions(),
        selections: getBarbarianWeaponMasterySelections(character),
        setSelections: setBarbarianWeaponMasterySelections
      }
    }
  };
}

function createBarbarianPrimalKnowledgeContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  const primalKnowledgeRageDescription = getFeatureDescriptionForCharacter(
    character,
    CLASS_FEATURE.PRIMAL_KNOWLEDGE
  ).slice(1, 2);

  return {
    source: createClassContributionSource({
      id: "barbarian-primal-knowledge",
      label: "Primal Knowledge",
      entryId: CLASS_FEATURE.PRIMAL_KNOWLEDGE
    }),
    descriptionAdditions: compactDescriptionAdditions([
      primalKnowledgeRageDescription.length > 0
        ? {
            id: "barbarian-primal-knowledge-rage-description",
            target: "commonAction",
            targetKey: barbarianRageActionKey,
            getDescriptionAdditions: () =>
              createSourcedFeatureDescriptionAddition(
                character,
                CLASS_FEATURE.PRIMAL_KNOWLEDGE,
                primalKnowledgeRageDescription,
                "Primal Knowledge"
              )
          }
        : null
    ]),
    skillProficiencyEntries: getBarbarianSkillProficiencyEntries(character),
    skillIndicators: getBarbarianPrimalKnowledgeSkillIndicators(character),
    skillBonuses: [
      {
        id: "barbarian-primal-knowledge-skill-bonus",
        getBonuses: (skill) => getBarbarianSkillBonuses(character, skill)
      }
    ]
  };
}

function createBarbarianInstinctivePounceContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  const instinctivePounceDescription = getFeatureDescriptionForCharacter(
    character,
    CLASS_FEATURE.INSTINCTIVE_POUNCE
  );

  return {
    source: createClassContributionSource({
      id: "barbarian-instinctive-pounce",
      label: "Instinctive Pounce",
      entryId: CLASS_FEATURE.INSTINCTIVE_POUNCE
    }),
    descriptionAdditions: compactDescriptionAdditions([
      instinctivePounceDescription.length > 0
        ? {
            id: "barbarian-instinctive-pounce-rage-description",
            target: "commonAction",
            targetKey: barbarianRageActionKey,
            getDescriptionAdditions: () =>
              createSourcedFeatureDescriptionAddition(
                character,
                CLASS_FEATURE.INSTINCTIVE_POUNCE,
                instinctivePounceDescription,
                "Instinctive Pounce"
              )
          }
        : null
    ])
  };
}

function createBarbarianBrutalStrikeContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "barbarian-brutal-strike",
      label: "Brutal Strike",
      entryId: CLASS_FEATURE.BRUTAL_STRIKE
    }),
    actions: compactActions([getBarbarianBrutalStrikeAction(character)]),
    actionOptions: {
      [barbarianBrutalStrikeActionKey]: getBarbarianBrutalStrikeOptions(character)
    },
    weaponDamageBonuses: [
      {
        id: "barbarian-brutal-strike-damage",
        getBonuses: (context) => getBarbarianBrutalStrikeWeaponDamageBonuses(character, context)
      }
    ]
  };
}

function createBarbarianRecklessAttackContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "barbarian-reckless-attack",
      label: "Reckless Attack",
      entryId: CLASS_FEATURE.RECKLESS_ATTACK
    }),
    weaponActionTransforms: [
      {
        id: "barbarian-reckless-attack-weapon-action",
        transform: (_runtimeCharacter, action) =>
          transformBarbarianRecklessAttackWeaponAction(character, action as WeaponAction)
      }
    ],
    statuses: getBarbarianRecklessAttackDerivedConditions(character)
  };
}

function createBarbarianUnarmoredDefenseContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "barbarian-unarmored-defense",
      label: "Unarmored Defense",
      entryId: CLASS_FEATURE.UNARMORED_DEFENSE
    }),
    armorClassModes: [
      {
        id: "barbarian-unarmored-defense-mode",
        getModes: (context) => getBarbarianArmorClassModes(character, context)
      }
    ],
    armorClassBonuses: [
      {
        id: "barbarian-unarmored-defense-bonuses",
        getBonuses: (context) => getBarbarianArmorClassBonuses(character, context)
      }
    ]
  };
}

function createBarbarianFastMovementContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "barbarian-fast-movement",
      label: "Fast Movement",
      entryId: CLASS_FEATURE.FAST_MOVEMENT
    }),
    speedBonusProviders: [
      {
        id: "barbarian-fast-movement-speed",
        getBonuses: (context) => getBarbarianFastMovementSpeedBonuses(character, context)
      }
    ]
  };
}

function createBarbarianRelentlessRageContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  const relentlessRageDescription = getFeatureDescriptionForCharacter(
    character,
    CLASS_FEATURE.RELENTLESS_RAGE
  );

  return {
    source: createClassContributionSource({
      id: "barbarian-relentless-rage",
      label: "Relentless Rage",
      entryId: CLASS_FEATURE.RELENTLESS_RAGE
    }),
    descriptionAdditions: compactDescriptionAdditions([
      relentlessRageDescription.length > 0
        ? {
            id: "barbarian-relentless-rage-life-and-death-description",
            target: "custom",
            targetKey: barbarianLifeAndDeathLedgerDescriptionTargetKey,
            getDescriptionAdditions: () =>
              createSourcedFeatureDescriptionAddition(
                character,
                CLASS_FEATURE.RELENTLESS_RAGE,
                relentlessRageDescription
              )
          }
        : null
    ])
  };
}

function createBarbarianPersistentRageContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  const persistentRageDescription = getFeatureDescriptionForCharacter(
    character,
    CLASS_FEATURE.PERSISTENT_RAGE
  );
  const initiativeEntries = persistentRageDescription.slice(0, 1);
  const rageEntries = persistentRageDescription.slice(1);

  return {
    source: createClassContributionSource({
      id: "barbarian-persistent-rage",
      label: "Persistent Rage",
      entryId: CLASS_FEATURE.PERSISTENT_RAGE
    }),
    descriptionAdditions: compactDescriptionAdditions([
      initiativeEntries.length > 0
        ? {
            id: "barbarian-persistent-rage-initiative-description",
            target: "initiative",
            getDescriptionAdditions: () =>
              createSourcedFeatureDescriptionAddition(
                character,
                CLASS_FEATURE.PERSISTENT_RAGE,
                initiativeEntries,
                "Persistent Rage"
              )
          }
        : null,
      rageEntries.length > 0
        ? {
            id: "barbarian-persistent-rage-rage-description",
            target: "commonAction",
            targetKey: barbarianRageActionKey,
            getDescriptionAdditions: () =>
              createSourcedFeatureDescriptionAddition(
                character,
                CLASS_FEATURE.PERSISTENT_RAGE,
                rageEntries,
                "Persistent Rage"
              )
          }
        : null
    ])
  };
}

function createBarbarianFeralInstinctContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "barbarian-feral-instinct",
      label: "Feral Instinct",
      entryId: CLASS_FEATURE.FERAL_INSTINCT
    }),
    coreStatIndicators: getBarbarianCoreStatIndicators(character)
  };
}

function createBarbarianPrimalChampionContribution(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec {
  return {
    source: createClassContributionSource({
      id: "barbarian-primal-champion",
      label: "Primal Champion",
      entryId: CLASS_FEATURE.PRIMAL_CHAMPION
    }),
    abilityScoreBonuses: getBarbarianAbilityScoreBonuses(character)
  };
}

export function collectBarbarianFeatureContributions(
  character: CollectedClassFeatureCharacter
): FeatureContributionSpec[] {
  return [
    createBarbarianRageContribution(character),
    createBarbarianDangerSenseContribution(character),
    createBarbarianWeaponMasteryContribution(character),
    createBarbarianPrimalKnowledgeContribution(character),
    createBarbarianBrutalStrikeContribution(character),
    createBarbarianRecklessAttackContribution(character),
    createBarbarianUnarmoredDefenseContribution(character),
    createBarbarianFastMovementContribution(character),
    createBarbarianInstinctivePounceContribution(character),
    createBarbarianRelentlessRageContribution(character),
    createBarbarianPersistentRageContribution(character),
    createBarbarianFeralInstinctContribution(character),
    createBarbarianPrimalChampionContribution(character)
  ];
}

export function getBarbarianClassFeatureDerivedState(
  character: CollectedClassFeatureCharacter
): ClassFeatureDerivedState {
  return projectCompiledContributionsToClassFeatureDerivedState(
    compileFeatureContributions(collectBarbarianFeatureContributions(character)),
    {
      character: character as Character
    }
  );
}

export function getBarbarianFeatureDescriptionAdditions(
  character: CollectedClassFeatureCharacter,
  target: FeatureDescriptionContributionTarget,
  targetKey?: string
): SpellDescriptionEntry[][] {
  return getFeatureDescriptionAdditions(
    compileFeatureContributions(collectBarbarianFeatureContributions(character)),
    target,
    {
      character: character as Character,
      targetKey
    }
  );
}
