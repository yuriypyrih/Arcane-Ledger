import {
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
import { appendSourcedDescriptionAddition } from "../../../actionModalDescriptions";
import { getAbilityModifier } from "../../../gameplay";
import {
  createMagicTemporaryHitPointsAssignment,
  gainMagicTemporaryHitPointsAssignment,
  normalizeMagicTemporaryHitPoints,
  normalizeMagicTemporaryHitPointsSource
} from "../../../shared";
import type { DerivedFeatureStatusEntry, MagicTemporaryHitPointsFeature } from "../../types";
import {
  transformSpellToBonusAction,
  type SubclassRuntimeResolver
} from "../../subclassRuntime";
import { getWizardSavantSpellIdsFromFeatureState } from "../savant";

export const abjurerSubclassId = "wizard-abjurer";

const arcaneWardMagicTemporaryHitPointsFeatureId = "wizard-abjurer-arcane-ward";
const arcaneWardLabel = "Arcane Ward";
const arcaneWardModalTitle = "Arcane Ward Magical Temporary HP";
const projectedWardReactionId = "reaction-wizard-abjurer-projected-ward";
const projectedWardName = "Projected Ward";
const spellBreakerName = "Spell Breaker";
export const wizardAbjurerSpellResistanceStatusSourceId =
  "feature-wizard-abjurer-spell-resistance";
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

function transformWizardAbjurerSpellBreakerSpell(spell: SpellEntry): SpellEntry {
  if (spell.id !== counterspellSpellId && spell.id !== dispelMagicSpellId) {
    return spell;
  }

  const nextSpell = appendSourcedDescriptionAddition(
    spell,
    spellBreakerName,
    spellBreakerDescription
  );

  return spell.id === dispelMagicSpellId
    ? transformSpellToBonusAction(dispelMagicSpellId, nextSpell)
    : nextSpell;
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
    Math.floor((character.level ?? 0) * 2 + getAbilityModifier(character.abilities?.INT ?? 10))
  );
}

export function getWizardAbjurerMagicTemporaryHitPointsFeature(
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

  const feature = getWizardAbjurerMagicTemporaryHitPointsFeature(character);

  if (!feature) {
    return character;
  }

  const nextMagicTemporaryHitPointsAssignment = gainMagicTemporaryHitPointsAssignment(
    character.magicTemporaryHitPoints,
    normalizedSpellSlotLevel * 2,
    feature.maxHitPoints,
    feature.label
  );
  const currentMagicTemporaryHitPoints = normalizeMagicTemporaryHitPoints(
    character.magicTemporaryHitPoints
  );
  const currentMagicTemporaryHitPointsSource = normalizeMagicTemporaryHitPointsSource(
    character.magicTemporaryHitPointsSource
  );

  if (
    nextMagicTemporaryHitPointsAssignment.magicTemporaryHitPoints === currentMagicTemporaryHitPoints &&
    nextMagicTemporaryHitPointsAssignment.magicTemporaryHitPointsSource ===
      currentMagicTemporaryHitPointsSource
  ) {
    return character;
  }

  return {
    ...character,
    ...nextMagicTemporaryHitPointsAssignment
  };
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

  if (currentMagicTemporaryHitPoints <= 0 && currentMagicTemporaryHitPointsSource === undefined) {
    return character;
  }

  return {
    ...character,
    ...createMagicTemporaryHitPointsAssignment(0)
  };
}

export const getWizardAbjurerDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  typeof character.level === "number"
    ? {
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
        reactionEntries:
          character.level >= 6
            ? [projectedWardReactionEntry]
            : [],
        transformSpellEntry: hasWizardAbjurerSpellBreakerFeature(character)
          ? transformWizardAbjurerSpellBreakerSpell
          : undefined
      }
    : {};
