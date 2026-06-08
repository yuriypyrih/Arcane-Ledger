import {
  CLASS_FEATURE,
  REACTION,
  SPELL_LIST_CLASS,
  type ReactionEntry,
  type SpellEntry
} from "../../../../../codex/entries";
import { getSubclassEntryById } from "../../../../../codex/subclasses";
import type { Character } from "../../../../../types";
import { appendFeatureSourcedDescriptionAddition } from "../../../actionModalDescriptions";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import {
  compileFeatureContributions,
  createSubclassContributionSource,
  projectCompiledContributionsToSubclassDerivedFeatureState,
  type FeatureContributionSpec
} from "../../../featureContributions";
import type { SubclassRuntimeResolver } from "../../subclassRuntime";
import type { FeatureActionCard } from "../../types";

export const wildMagicSorcerySubclassId = "sorcerer-wild-magic-sorcery";
export const sorcererWildMagicSurgeActionKey = "sorcerer-wild-magic-surge";
export const sorcererTidesOfChaosActionKey = "sorcerer-tides-of-chaos";
export const sorcererBendLuckReactionId = "reaction-sorcerer-wild-magic-sorcery-bend-luck";

const wildMagicSurgeName = "Wild Magic Surge";
const tidesOfChaosName = "Tides of Chaos";
const bendLuckName = "Bend Luck";
const tamedSurgeName = "Tamed Surge";
const tidesOfChaosUsesTotal = 1;
const tamedSurgeUsesTotal = 1;
const wildMagicSorcerySubclassEntry = getSubclassEntryById(wildMagicSorcerySubclassId);

type WildMagicSorceryCharacter = Pick<Character, "className"> &
  Partial<Pick<Character, "classFeatureState" | "level" | "subclassId">>;

function getSorcererWildMagicFeatureDescription(feature: CLASS_FEATURE): string[] {
  return (
    wildMagicSorcerySubclassEntry?.features.find((row) => row.classFeatures.includes(feature))
      ?.featureOverrides?.[feature]?.description ?? []
  ).filter((entry): entry is string => typeof entry === "string");
}

const tidesOfChaosDescription = getSorcererWildMagicFeatureDescription(
  CLASS_FEATURE.TIDES_OF_CHAOS
);
const wildMagicSurgeDescription = getSorcererWildMagicFeatureDescription(
  CLASS_FEATURE.WILD_MAGIC_SURGE
);
const wildMagicSurgeSpellDescription = wildMagicSurgeDescription.slice(0, 3);
const tidesOfChaosSpellDescription = tidesOfChaosDescription;
const controlledChaosDescription = getSorcererWildMagicFeatureDescription(
  CLASS_FEATURE.CONTROLLED_CHAOS
);
const bendLuckDescription = getSorcererWildMagicFeatureDescription(CLASS_FEATURE.BEND_LUCK);
const tamedSurgeDescription = getSorcererWildMagicFeatureDescription(CLASS_FEATURE.TAMED_SURGE);
const bendLuckReactionEntry: ReactionEntry = {
  id: sorcererBendLuckReactionId,
  reaction: REACTION.BEND_LUCK,
  name: bendLuckName,
  sourceType: "feature",
  sourceFeature: CLASS_FEATURE.BEND_LUCK,
  sourceLabel: "Wild Magic Sorcery",
  description: bendLuckDescription
};

function hasSorcererTidesOfChaosFeature(character: WildMagicSorceryCharacter): boolean {
  return hasSorcererWildMagicSurgeFeature(character);
}

function hasSorcererWildMagicSurgeFeature(character: WildMagicSorceryCharacter): boolean {
  return (
    character.className === "Sorcerer" &&
    character.subclassId === wildMagicSorcerySubclassId &&
    (character.level ?? 0) >= 3
  );
}

function hasSorcererBendLuckFeature(character: WildMagicSorceryCharacter): boolean {
  return (
    character.className === "Sorcerer" &&
    character.subclassId === wildMagicSorcerySubclassId &&
    (character.level ?? 0) >= 6
  );
}

function hasSorcererControlledChaosFeature(character: WildMagicSorceryCharacter): boolean {
  return (
    character.className === "Sorcerer" &&
    character.subclassId === wildMagicSorcerySubclassId &&
    (character.level ?? 0) >= 14
  );
}

export function hasSorcererControlledChaosFeatureForCharacter(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return hasSorcererControlledChaosFeature(character);
}

function hasSorcererTamedSurgeFeature(character: WildMagicSorceryCharacter): boolean {
  return (
    character.className === "Sorcerer" &&
    character.subclassId === wildMagicSorcerySubclassId &&
    (character.level ?? 0) >= 18
  );
}

export function getSorcererWildMagicTidesOfChaosUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return hasSorcererTidesOfChaosFeature(character) ? tidesOfChaosUsesTotal : 0;
}

export function getSorcererWildMagicTamedSurgeUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return hasSorcererTamedSurgeFeature(character) ? tamedSurgeUsesTotal : 0;
}

function getSorcererWildMagicTidesOfChaosUsesRemaining(
  character: WildMagicSorceryCharacter
): number {
  const totalUses = getSorcererWildMagicTidesOfChaosUsesTotal(character);
  const expendedUses = Number(character.classFeatureState?.sorcerer?.tidesOfChaosUsesExpended);
  const normalizedExpendedUses = Number.isFinite(expendedUses)
    ? Math.max(0, Math.min(totalUses, Math.floor(expendedUses)))
    : 0;

  return Math.max(0, totalUses - normalizedExpendedUses);
}

export function getSorcererWildMagicTamedSurgeUsesRemaining(
  character: WildMagicSorceryCharacter
): number {
  const totalUses = getSorcererWildMagicTamedSurgeUsesTotal(character);
  const expendedUses = Number(character.classFeatureState?.sorcerer?.tamedSurgeUsesExpended);
  const normalizedExpendedUses = Number.isFinite(expendedUses)
    ? Math.max(0, Math.min(totalUses, Math.floor(expendedUses)))
    : 0;

  return Math.max(0, totalUses - normalizedExpendedUses);
}

export function hasSorcererWildMagicSurgeFeatureForCharacter(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return hasSorcererWildMagicSurgeFeature(character);
}

function getSorcererWildMagicFeatureActions(
  character: WildMagicSorceryCharacter
): FeatureActionCard[] {
  const actions: FeatureActionCard[] = [];

  if (hasSorcererWildMagicSurgeFeature(character)) {
    const actionDescriptionAdditions = hasSorcererControlledChaosFeature(character)
      ? appendFeatureSourcedDescriptionAddition(
          { descriptionAdditions: [] },
          character,
          CLASS_FEATURE.CONTROLLED_CHAOS,
          controlledChaosDescription
        ).descriptionAdditions
      : [];

    actions.push({
      key: sorcererWildMagicSurgeActionKey,
      name: wildMagicSurgeName,
      summary: "Roll on the Wild Magic Surge table.",
      detail: "Roll on the Wild Magic Surge table.",
      breakdown: "Unleash surges of untamed magic",
      sourceFeature: CLASS_FEATURE.WILD_MAGIC_SURGE,
      economyType: ECONOMY_TYPE.FREE,
      actionCategory: ACTION_CATEGORY.MAGIC,
      description: wildMagicSurgeDescription,
      descriptionAdditions: actionDescriptionAdditions,
      drawer: {
        kind: "confirm",
        eyebrow: "Wild Magic Sorcery",
        description: wildMagicSurgeDescription,
        descriptionAdditions: actionDescriptionAdditions,
        confirmLabel: "Roll Wild Magic Surge"
      },
      execute: {
        kind: "activate"
      }
    });
  }

  if (hasSorcererTidesOfChaosFeature(character)) {
    const usesRemaining = getSorcererWildMagicTidesOfChaosUsesRemaining(character);
    const disabledReason = usesRemaining <= 0 ? "Tides of Chaos is depleted." : undefined;

    actions.push({
      key: sorcererTidesOfChaosActionKey,
      name: tidesOfChaosName,
      summary: "Gain Advantage on one D20 Test.",
      detail: "Give yourself Advantage on one D20 Test before you roll.",
      breakdown: "Advantage on one roll",
      economyType: ECONOMY_TYPE.FREE,
      actionCategory: ACTION_CATEGORY.MAGIC,
      usesRemaining,
      usesTotal: getSorcererWildMagicTidesOfChaosUsesTotal(character),
      description: tidesOfChaosDescription,
      drawer: {
        kind: "confirm",
        eyebrow: "Wild Magic Sorcery",
        description: tidesOfChaosDescription,
        helperText:
          usesRemaining > 0 ? "Use Tides of Chaos before you roll the D20 Test." : undefined
      },
      execute: {
        kind: "activate"
      },
      disabled: Boolean(disabledReason),
      disabledReason
    });
  }

  return actions;
}

export function activateSorcererWildMagicSurge(character: Character): Character {
  if (!hasSorcererWildMagicSurgeFeature(character)) {
    return character;
  }

  return character;
}

export function activateSorcererWildMagicTidesOfChaos(character: Character): Character {
  if (!hasSorcererTidesOfChaosFeature(character)) {
    return character;
  }

  if (getSorcererWildMagicTidesOfChaosUsesRemaining(character) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      sorcerer: {
        ...character.classFeatureState?.sorcerer,
        tidesOfChaosUsesExpended: tidesOfChaosUsesTotal
      }
    }
  };
}

export function consumeSorcererWildMagicTamedSurgeUse(character: Character): Character {
  if (!hasSorcererTamedSurgeFeature(character)) {
    return character;
  }

  if (getSorcererWildMagicTamedSurgeUsesRemaining(character) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      sorcerer: {
        ...character.classFeatureState?.sorcerer,
        tamedSurgeUsesExpended: tamedSurgeUsesTotal
      }
    }
  };
}

export function restoreSorcererWildMagicTidesOfChaosOnLongRest(character: Character): Character {
  if (!hasSorcererTidesOfChaosFeature(character)) {
    return character;
  }

  if ((character.classFeatureState?.sorcerer?.tidesOfChaosUsesExpended ?? 0) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      sorcerer: {
        ...character.classFeatureState?.sorcerer,
        tidesOfChaosUsesExpended: 0
      }
    }
  };
}

export function restoreSorcererWildMagicTamedSurgeOnLongRest(character: Character): Character {
  if (!hasSorcererTamedSurgeFeature(character)) {
    return character;
  }

  if ((character.classFeatureState?.sorcerer?.tamedSurgeUsesExpended ?? 0) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      sorcerer: {
        ...character.classFeatureState?.sorcerer,
        tamedSurgeUsesExpended: 0
      }
    }
  };
}

export function restoreSorcererWildMagicFeaturesOnLongRest(character: Character): Character {
  return restoreSorcererWildMagicTamedSurgeOnLongRest(
    restoreSorcererWildMagicTidesOfChaosOnLongRest(character)
  );
}

export function restoreSorcererWildMagicTidesOfChaosOnSpellCast(character: Character): Character {
  if (!hasSorcererTidesOfChaosFeature(character)) {
    return character;
  }

  if ((character.classFeatureState?.sorcerer?.tidesOfChaosUsesExpended ?? 0) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      sorcerer: {
        ...character.classFeatureState?.sorcerer,
        tidesOfChaosUsesExpended: 0
      }
    }
  };
}

function isWildMagicSorcerySpellCandidate(spell: Pick<SpellEntry, "spellLevel" | "spellLists">) {
  return spell.spellLevel > 0 && spell.spellLists.includes(SPELL_LIST_CLASS.SORCERER);
}

export function isSorcererTidesOfChaosActiveForSpell(
  character: WildMagicSorceryCharacter,
  spell: Pick<SpellEntry, "spellLevel" | "spellLists">
): boolean {
  return (
    hasSorcererTidesOfChaosFeature(character) &&
    isWildMagicSorcerySpellCandidate(spell) &&
    getSorcererWildMagicTidesOfChaosUsesRemaining(character) <= 0
  );
}

export function canUseSorcererWildMagicTamedSurgeForSpell(
  character: WildMagicSorceryCharacter,
  spell: Pick<SpellEntry, "spellLevel" | "spellLists">
): boolean {
  return hasSorcererTamedSurgeFeature(character) && isWildMagicSorcerySpellCandidate(spell);
}

function appendWildMagicSpellDescription(
  character: WildMagicSorceryCharacter,
  spell: SpellEntry,
  feature: CLASS_FEATURE,
  description: readonly string[],
  sourceLabel: string
): SpellEntry {
  if (!isWildMagicSorcerySpellCandidate(spell)) {
    return spell;
  }

  return appendFeatureSourcedDescriptionAddition(
    spell,
    character,
    feature,
    description,
    sourceLabel
  );
}

function getFeatureActionByKey(
  actions: FeatureActionCard[],
  actionKey: string
): FeatureActionCard[] {
  return actions.filter((action) => action.key === actionKey);
}

function createSorcererWildMagicLocalHookContribution(input: {
  id: string;
  label: string;
  entryId: CLASS_FEATURE;
}): FeatureContributionSpec {
  return {
    source: createSubclassContributionSource(input)
  };
}

function createSorcererWildMagicSurgeContribution(
  character: WildMagicSorceryCharacter,
  featureActions: FeatureActionCard[]
): FeatureContributionSpec {
  return {
    source: createSubclassContributionSource({
      id: "sorcerer-wild-magic-sorcery-wild-magic-surge",
      label: wildMagicSurgeName,
      entryId: CLASS_FEATURE.WILD_MAGIC_SURGE
    }),
    actions: getFeatureActionByKey(featureActions, sorcererWildMagicSurgeActionKey),
    spellTransforms: [
      {
        id: "sorcerer-wild-magic-sorcery-wild-magic-surge-spell-transform",
        transform: (spell) =>
          appendWildMagicSpellDescription(
            character,
            spell,
            CLASS_FEATURE.WILD_MAGIC_SURGE,
            wildMagicSurgeSpellDescription,
            wildMagicSurgeName
          )
      }
    ]
  };
}

function createSorcererWildMagicTidesOfChaosContribution(
  character: WildMagicSorceryCharacter,
  featureActions: FeatureActionCard[]
): FeatureContributionSpec {
  return {
    source: createSubclassContributionSource({
      id: "sorcerer-wild-magic-sorcery-tides-of-chaos",
      label: tidesOfChaosName,
      entryId: CLASS_FEATURE.TIDES_OF_CHAOS
    }),
    actions: getFeatureActionByKey(featureActions, sorcererTidesOfChaosActionKey),
    spellTransforms: [
      {
        id: "sorcerer-wild-magic-sorcery-tides-of-chaos-spell-transform",
        transform: (spell) =>
          appendWildMagicSpellDescription(
            character,
            spell,
            CLASS_FEATURE.TIDES_OF_CHAOS,
            tidesOfChaosSpellDescription,
            tidesOfChaosName
          )
      }
    ]
  };
}

function createSorcererWildMagicBendLuckContribution(): FeatureContributionSpec {
  return {
    source: createSubclassContributionSource({
      id: "sorcerer-wild-magic-sorcery-bend-luck",
      label: bendLuckName,
      entryId: CLASS_FEATURE.BEND_LUCK
    }),
    reactions: [bendLuckReactionEntry]
  };
}

function createSorcererWildMagicTamedSurgeContribution(
  character: WildMagicSorceryCharacter
): FeatureContributionSpec {
  return {
    source: createSubclassContributionSource({
      id: "sorcerer-wild-magic-sorcery-tamed-surge",
      label: tamedSurgeName,
      entryId: CLASS_FEATURE.TAMED_SURGE
    }),
    spellTransforms: [
      {
        id: "sorcerer-wild-magic-sorcery-tamed-surge-spell-transform",
        transform: (spell) =>
          appendWildMagicSpellDescription(
            character,
            spell,
            CLASS_FEATURE.TAMED_SURGE,
            tamedSurgeDescription,
            tamedSurgeName
          )
      }
    ]
  };
}

function collectSorcererWildMagicSorceryContributions(
  character: WildMagicSorceryCharacter
): FeatureContributionSpec[] {
  if (!hasSorcererWildMagicSurgeFeature(character)) {
    return [];
  }

  const featureActions = getSorcererWildMagicFeatureActions(character);
  const contributions: FeatureContributionSpec[] = [
    createSorcererWildMagicSurgeContribution(character, featureActions),
    createSorcererWildMagicTidesOfChaosContribution(character, featureActions)
  ];

  if (hasSorcererBendLuckFeature(character)) {
    contributions.push(createSorcererWildMagicBendLuckContribution());
  }

  if (hasSorcererControlledChaosFeature(character)) {
    contributions.push(
      createSorcererWildMagicLocalHookContribution({
        id: "sorcerer-wild-magic-sorcery-controlled-chaos",
        label: "Controlled Chaos",
        entryId: CLASS_FEATURE.CONTROLLED_CHAOS
      })
    );
  }

  if (hasSorcererTamedSurgeFeature(character)) {
    contributions.push(createSorcererWildMagicTamedSurgeContribution(character));
  }

  return contributions;
}

export const getSorcererWildMagicSorceryDerivedFeatureState: SubclassRuntimeResolver = (
  character
) =>
  projectCompiledContributionsToSubclassDerivedFeatureState(
    compileFeatureContributions(collectSorcererWildMagicSorceryContributions(character)),
    {
      character: character as Character
    }
  );
