import {
  ACTION_TYPE,
  CLASS_FEATURE,
  REACTION,
  getSpellEntryByName,
  type ReactionEntry,
  MAGIC_SCHOOL,
  type SpellEntry
} from "../../../../../codex/entries";
import { getSubclassEntryById } from "../../../../../codex/subclasses";
import {
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  type Character
} from "../../../../../types";
import {
  appendFeatureSourcedDescriptionAddition,
  createFeatureSourcedDescriptionEntries
} from "../../../actionModalDescriptions";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import { getAbilityModifierForCharacter } from "../../../abilities";
import { getSpellSlotTotalsForCharacter, normalizeSpellSlotsExpended } from "../../../spellcasting";
import {
  createMagicTemporaryHitPointsAssignment,
  gainMagicTemporaryHitPointsAssignment,
  normalizeMagicTemporaryHitPoints,
  normalizeMagicTemporaryHitPointsSource
} from "../../../shared";
import type {
  DerivedFeatureStatusEntry,
  FeatureActionCard,
  MagicTemporaryHitPointsFeature
} from "../../types";
import type { SubclassRuntimeResolver } from "../../subclassRuntime";
import { getWizardSavantSpellIdsFromFeatureState } from "../savant";

export const abjurerSubclassId = "wizard-abjurer";
export const wizardAbjurerArcaneWardActionKey = "wizard-abjurer-arcane-ward";

const arcaneWardMagicTemporaryHitPointsFeatureId = "wizard-abjurer-arcane-ward";
const arcaneWardLabel = "Arcane Ward";
const arcaneWardModalTitle = "Arcane Ward Magical Temporary HP";
const projectedWardReactionId = "reaction-wizard-abjurer-projected-ward";
const projectedWardName = "Projected Ward";
const spellBreakerName = "Spell Breaker";
export const wizardAbjurerSpellResistanceStatusSourceId = "feature-wizard-abjurer-spell-resistance";
const arcaneWardDescription =
  "This ward absorbs incoming damage before normal Temporary HP. Its maximum equals twice your character level plus your Intelligence modifier, it gains 2 Magical Temporary HP per spell slot level whenever you cast an Abjuration spell with a spell slot, and it resets to 0 on a Long Rest.";
const abjurerSubclassEntry = getSubclassEntryById(abjurerSubclassId);
const counterspellSpellId = getSpellEntryByName("Counterspell")?.id ?? null;
const dispelMagicSpellId = getSpellEntryByName("Dispel Magic")?.id ?? null;

function getWizardAbjurerFeatureDescriptionEntries(feature: CLASS_FEATURE): string[] {
  const featureRow = abjurerSubclassEntry?.features.find((row) =>
    row.classFeatures.includes(feature)
  );

  return (featureRow?.featureOverrides?.[feature]?.description ?? []).filter(
    (entry): entry is string => typeof entry === "string"
  );
}

const projectedWardReactionEntry: ReactionEntry = {
  id: projectedWardReactionId,
  reaction: REACTION.PROJECTED_WARD,
  name: projectedWardName,
  sourceType: "feature",
  sourceFeature: CLASS_FEATURE.PROJECTED_WARD,
  sourceLabel: "Abjurer",
  description: getWizardAbjurerFeatureDescriptionEntries(CLASS_FEATURE.PROJECTED_WARD)
};
const spellBreakerDescription = getWizardAbjurerFeatureDescriptionEntries(
  CLASS_FEATURE.SPELL_BREAKER
);

export function hasWizardAbjurerArcaneWardFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Wizard" &&
    character.subclassId === abjurerSubclassId &&
    (character.level ?? 0) >= 3
  );
}

function hasWizardAbjurerSpellBreakerFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Wizard" &&
    character.subclassId === abjurerSubclassId &&
    (character.level ?? 0) >= 10
  );
}

function hasWizardAbjurerSpellResistanceFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Wizard" &&
    character.subclassId === abjurerSubclassId &&
    (character.level ?? 0) >= 14
  );
}

function getWizardAbjurerSpellBreakerAlwaysPreparedSpellIds(): string[] {
  return [counterspellSpellId, dispelMagicSpellId].filter(
    (spellId): spellId is string => typeof spellId === "string" && spellId.length > 0
  );
}

function hasWizardAbjurerArcaneWardBeenCreated(
  character: Partial<Pick<Character, "classFeatureState">>
): boolean {
  return character.classFeatureState?.wizard?.arcaneWardCreatedThisLongRest === true;
}

function getWizardAbjurerAvailableSpellSlotCount(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "spellSlotsExpended">>
): number {
  const spellSlotTotals = getSpellSlotTotalsForCharacter(character.className, character.level ?? 1);
  const spellSlotsExpended = normalizeSpellSlotsExpended(
    character.spellSlotsExpended,
    spellSlotTotals
  );

  return spellSlotTotals.reduce(
    (total, slotTotal, index) => total + Math.max(0, slotTotal - (spellSlotsExpended[index] ?? 0)),
    0
  );
}

function transformWizardAbjurerSpellBreakerSpell(
  character: Parameters<SubclassRuntimeResolver>[0],
  spell: SpellEntry
): SpellEntry {
  if (spell.id !== counterspellSpellId && spell.id !== dispelMagicSpellId) {
    return spell;
  }

  const nextSpell = appendFeatureSourcedDescriptionAddition(
    spell,
    character,
    CLASS_FEATURE.SPELL_BREAKER,
    spellBreakerDescription,
    spellBreakerName
  );

  return nextSpell;
}

export function canUseWizardAbjurerSpellBreakerBonusActionPathForSpell(
  character: Parameters<SubclassRuntimeResolver>[0],
  spell: Pick<SpellEntry, "castingTime" | "id">
): boolean {
  return (
    hasWizardAbjurerSpellBreakerFeature(character) &&
    spell.id === dispelMagicSpellId &&
    spell.castingTime.includes(ACTION_TYPE.ACTION)
  );
}

export function getWizardAbjurerSpellResistanceSavingThrowDescriptionAdditions(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): SpellDescriptionEntry[][] {
  if (!hasWizardAbjurerSpellResistanceFeature(character)) {
    return [];
  }

  const descriptionEntries = getWizardAbjurerFeatureDescriptionEntries(
    CLASS_FEATURE.SPELL_RESISTANCE
  );

  return descriptionEntries.length > 0
    ? [
        createFeatureSourcedDescriptionEntries(
          character,
          CLASS_FEATURE.SPELL_RESISTANCE,
          descriptionEntries,
          "Spell Resistance"
        )
      ]
    : [];
}

function getWizardAbjurerDerivedStatusEntries(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): DerivedFeatureStatusEntry[] {
  if (!hasWizardAbjurerSpellResistanceFeature(character)) {
    return [];
  }

  return [
    {
      id: wizardAbjurerSpellResistanceStatusSourceId,
      sourceId: wizardAbjurerSpellResistanceStatusSourceId,
      group: STATUS_ENTRY_GROUP.EFFECTS,
      value: "Spell Resistance",
      source: "Spell Resistance",
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.INFINITE
      }
    }
  ];
}

export function getWizardAbjurerArcaneWardMaximumHitPoints(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "subclassId">>
): number {
  if (!hasWizardAbjurerArcaneWardFeature(character)) {
    return 0;
  }

  return Math.max(
    0,
    Math.floor((character.level ?? 0) * 2 + getAbilityModifierForCharacter(character, "INT"))
  );
}

function createWizardAbjurerMagicTemporaryHitPointsFeature(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "subclassId">>
): MagicTemporaryHitPointsFeature | null {
  const maxHitPoints = getWizardAbjurerArcaneWardMaximumHitPoints(character);

  if (maxHitPoints <= 0) {
    return null;
  }

  return {
    id: arcaneWardMagicTemporaryHitPointsFeatureId,
    label: arcaneWardLabel,
    modalTitle: arcaneWardModalTitle,
    description: arcaneWardDescription,
    maxHitPoints
  };
}

export function getWizardAbjurerMagicTemporaryHitPointsFeature(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "classFeatureState" | "level" | "subclassId">>
): MagicTemporaryHitPointsFeature | null {
  if (!hasWizardAbjurerArcaneWardBeenCreated(character)) {
    return null;
  }

  return createWizardAbjurerMagicTemporaryHitPointsFeature(character);
}

function applyWizardAbjurerArcaneWardGain(character: Character, spellSlotLevel: number): Character {
  const feature = createWizardAbjurerMagicTemporaryHitPointsFeature(character);

  if (!feature) {
    return character;
  }

  const wizardState = character.classFeatureState?.wizard ?? {};
  const hasCreatedWard = hasWizardAbjurerArcaneWardBeenCreated(character);
  const nextMagicTemporaryHitPointsAssignment = hasCreatedWard
    ? gainMagicTemporaryHitPointsAssignment(
        character.magicTemporaryHitPoints,
        spellSlotLevel * 2,
        feature.maxHitPoints,
        feature.label
      )
    : createMagicTemporaryHitPointsAssignment(feature.maxHitPoints, feature.label);
  const nextWizardState = hasCreatedWard
    ? wizardState
    : {
        ...wizardState,
        arcaneWardCreatedThisLongRest: true
      };

  if (
    nextMagicTemporaryHitPointsAssignment.magicTemporaryHitPoints ===
      normalizeMagicTemporaryHitPoints(character.magicTemporaryHitPoints) &&
    nextMagicTemporaryHitPointsAssignment.magicTemporaryHitPointsSource ===
      normalizeMagicTemporaryHitPointsSource(character.magicTemporaryHitPointsSource) &&
    nextWizardState === wizardState
  ) {
    return character;
  }

  return {
    ...character,
    ...nextMagicTemporaryHitPointsAssignment,
    classFeatureState: {
      ...character.classFeatureState,
      wizard: nextWizardState
    }
  };
}

export function applyWizardAbjurerArcaneWardAfterSpellCast(
  character: Character,
  spell: Pick<SpellEntry, "magicSchool">,
  spellSlotLevel: number | null | undefined
): Character {
  const normalizedSpellSlotLevel =
    typeof spellSlotLevel === "number" && Number.isFinite(spellSlotLevel)
      ? Math.max(0, Math.floor(spellSlotLevel))
      : 0;

  if (
    !hasWizardAbjurerArcaneWardFeature(character) ||
    spell.magicSchool !== MAGIC_SCHOOL.ABJURATION ||
    normalizedSpellSlotLevel <= 0
  ) {
    return character;
  }

  return applyWizardAbjurerArcaneWardGain(character, normalizedSpellSlotLevel);
}

export function activateWizardAbjurerArcaneWard(
  character: Character,
  spellSlotLevel: number
): Character {
  const normalizedSpellSlotLevel =
    typeof spellSlotLevel === "number" && Number.isFinite(spellSlotLevel)
      ? Math.max(0, Math.floor(spellSlotLevel))
      : 0;

  if (!hasWizardAbjurerArcaneWardFeature(character) || normalizedSpellSlotLevel <= 0) {
    return character;
  }

  return applyWizardAbjurerArcaneWardGain(character, normalizedSpellSlotLevel);
}

function getWizardAbjurerArcaneWardFeatureActions(
  character: Parameters<SubclassRuntimeResolver>[0]
): FeatureActionCard[] {
  if (!hasWizardAbjurerArcaneWardFeature(character)) {
    return [];
  }

  const availableSpellSlotCount = getWizardAbjurerAvailableSpellSlotCount({
    className: character.className,
    level: character.level,
    spellSlotsExpended: character.spellSlotsExpended
  });
  const disabledReason =
    availableSpellSlotCount <= 0 ? "No spell slots remain to fuel Arcane Ward." : undefined;

  return [
    {
      key: wizardAbjurerArcaneWardActionKey,
      name: arcaneWardLabel,
      sourceFeature: CLASS_FEATURE.ARCANE_WARD,
      summary: "Expend a spell slot to create or replenish your ward.",
      detail:
        "Expend a spell slot as a Bonus Action. The first creation this Long Rest fills the ward; later uses restore twice the slot level.",
      economyType: ECONOMY_TYPE.BONUS_ACTION,
      actionCategory: ACTION_CATEGORY.MAGIC,
      drawer: {
        kind: "confirm",
        eyebrow: "Abjurer",
        confirmLabel: "Use Arcane Ward"
      },
      execute: {
        kind: "activate",
        label: "Use Arcane Ward"
      },
      disabled: Boolean(disabledReason),
      disabledReason
    }
  ];
}

export function restoreWizardAbjurerArcaneWardOnLongRest(character: Character): Character {
  if (!hasWizardAbjurerArcaneWardFeature(character)) {
    return character;
  }

  const currentMagicTemporaryHitPoints = normalizeMagicTemporaryHitPoints(
    character.magicTemporaryHitPoints
  );
  const currentMagicTemporaryHitPointsSource = normalizeMagicTemporaryHitPointsSource(
    character.magicTemporaryHitPointsSource
  );
  const wizardState = character.classFeatureState?.wizard ?? {};

  if (
    !hasWizardAbjurerArcaneWardBeenCreated(character) &&
    currentMagicTemporaryHitPoints <= 0 &&
    currentMagicTemporaryHitPointsSource === undefined
  ) {
    return character;
  }

  return {
    ...character,
    ...createMagicTemporaryHitPointsAssignment(0),
    classFeatureState: {
      ...character.classFeatureState,
      wizard: {
        ...wizardState,
        arcaneWardCreatedThisLongRest: false
      }
    }
  };
}

export const getWizardAbjurerDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  typeof character.level === "number"
    ? {
        featureActions: getWizardAbjurerArcaneWardFeatureActions(character),
        alwaysPreparedSpellIds: hasWizardAbjurerSpellBreakerFeature(character)
          ? getWizardAbjurerSpellBreakerAlwaysPreparedSpellIds()
          : [],
        alwaysSpellbookSpellIds: getWizardSavantSpellIdsFromFeatureState({
          className: character.className,
          level: character.level,
          subclassId: character.subclassId,
          classFeatureState: character.classFeatureState
        }),
        derivedStatusEntries: getWizardAbjurerDerivedStatusEntries(character),
        magicTemporaryHitPointsFeature: getWizardAbjurerMagicTemporaryHitPointsFeature(character),
        reactionEntries: character.level >= 6 ? [projectedWardReactionEntry] : [],
        transformSpellEntry: hasWizardAbjurerSpellBreakerFeature(character)
          ? (spell) => transformWizardAbjurerSpellBreakerSpell(character, spell)
          : undefined
      }
    : {};
