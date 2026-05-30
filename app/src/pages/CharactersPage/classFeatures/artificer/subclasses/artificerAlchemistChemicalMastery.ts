import {
  CLASS_FEATURE,
  DAMAGE_TYPE,
  type SpellDescriptionEntry,
  type SpellEntry
} from "../../../../../codex/entries";
import {
  CONDITION_NAME,
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  type Character,
  type CharacterArtificerFeatureState
} from "../../../../../types";
import { appendFeatureSourcedDescriptionAddition } from "../../../actionModalDescriptions";
import { ACTION_CARD_THEME } from "../../../actionCardTheme";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import { createChargesCardUsage } from "../../cardUsage";
import { getFeatureDescriptionForCharacter } from "../../featureDescriptions";
import type { SubclassRuntimeCharacter } from "../../subclassRuntime";
import type { DerivedFeatureStatusEntry, FeatureActionCard } from "../../types";
import { hasArtificerSubclassFeature } from "./artificerSubclassHelpers";

export const artificerConjuredCauldronActionKey = "artificer-conjured-cauldron";

const alchemistSubclassId = "artificer-alchemist";
const conjuredCauldronName = "Conjured Cauldron";
const conjuredCauldronSpellId = "spell-tashas-bubbling-cauldron";
const conjuredCauldronUsesTotal = 1;
const alchemicalEruptionMarker = "<strong>Alchemical Eruption.</strong>";
const chemicalResistanceName = "Chemical Resistance";
const chemicalResistanceSourceIdPrefix = "feature-artificer-chemical-mastery-resistance-";
const chemicalResistancePoisonedImmunitySourceId =
  "feature-artificer-chemical-mastery-immunity-poisoned";
const chemicalMasteryDamageTypes = new Set<DAMAGE_TYPE>([
  DAMAGE_TYPE.ACID,
  DAMAGE_TYPE.FIRE,
  DAMAGE_TYPE.POISON
]);

type ChemicalMasteryCharacter = Pick<Character, "className"> &
  Partial<Pick<Character, "classFeatureState" | "level" | "subclassId">>;

function normalizeUsesExpended(value: unknown, total: number): number {
  const parsedValue = Number(value);
  const normalizedValue = Number.isFinite(parsedValue) ? Math.floor(parsedValue) : 0;

  return Math.max(0, Math.min(total, normalizedValue));
}

function spellSupportsAlchemicalEruption(spell: Pick<SpellEntry, "damage"> | null): boolean {
  if (!spell || spell.damage.length <= 0) {
    return false;
  }

  return spell.damage.some(([, damageType]) =>
    (Array.isArray(damageType) ? damageType : [damageType]).some((entry) =>
      chemicalMasteryDamageTypes.has(entry)
    )
  );
}

function getChemicalMasteryDescriptionSection(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>,
  marker: string
): SpellDescriptionEntry[] {
  return getFeatureDescriptionForCharacter(character, CLASS_FEATURE.CHEMICAL_MASTERY).filter(
    (entry) => typeof entry === "string" && entry.startsWith(marker)
  );
}

function getAlchemicalEruptionDescription(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): SpellDescriptionEntry[] {
  return getChemicalMasteryDescriptionSection(character, alchemicalEruptionMarker);
}

function getConjuredCauldronDescription(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): SpellDescriptionEntry[] {
  return getChemicalMasteryDescriptionSection(
    character,
    `<strong>${conjuredCauldronName}.</strong>`
  );
}

export function hasArtificerChemicalMasteryFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return hasArtificerSubclassFeature(character, alchemistSubclassId, 15);
}

export function normalizeArtificerConjuredCauldronState(
  value: unknown,
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): Pick<CharacterArtificerFeatureState, "conjuredCauldronUsesExpended"> {
  if (!hasArtificerChemicalMasteryFeature(character)) {
    return {};
  }

  const record =
    value && typeof value === "object" ? (value as Partial<CharacterArtificerFeatureState>) : {};

  return {
    conjuredCauldronUsesExpended: normalizeUsesExpended(
      record.conjuredCauldronUsesExpended,
      conjuredCauldronUsesTotal
    )
  };
}

export function getArtificerConjuredCauldronUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return hasArtificerChemicalMasteryFeature(character) ? conjuredCauldronUsesTotal : 0;
}

export function getArtificerConjuredCauldronUsesRemaining(
  character: ChemicalMasteryCharacter
): number {
  const usesTotal = getArtificerConjuredCauldronUsesTotal(character);

  if (usesTotal <= 0) {
    return 0;
  }

  const usesExpended = normalizeUsesExpended(
    character.classFeatureState?.artificer?.conjuredCauldronUsesExpended,
    usesTotal
  );

  return Math.max(0, usesTotal - usesExpended);
}

export function transformArtificerAlchemistChemicalMasterySpellEntry(
  character: SubclassRuntimeCharacter,
  spell: SpellEntry
): SpellEntry {
  if (!hasArtificerChemicalMasteryFeature(character) || !spellSupportsAlchemicalEruption(spell)) {
    return spell;
  }

  return appendFeatureSourcedDescriptionAddition(
    spell,
    character,
    CLASS_FEATURE.CHEMICAL_MASTERY,
    getAlchemicalEruptionDescription(character),
    "Chemical Mastery"
  );
}

export function getArtificerAlchemistChemicalMasteryStatusEntries(
  character: SubclassRuntimeCharacter
): DerivedFeatureStatusEntry[] {
  if (!hasArtificerChemicalMasteryFeature(character)) {
    return [];
  }

  return [
    ...[DAMAGE_TYPE.ACID, DAMAGE_TYPE.POISON].map(
      (damageType): DerivedFeatureStatusEntry => ({
        id: `${chemicalResistanceSourceIdPrefix}${damageType.toLowerCase()}`,
        sourceId: `${chemicalResistanceSourceIdPrefix}${damageType.toLowerCase()}`,
        group: STATUS_ENTRY_GROUP.RESISTANCES,
        value: damageType,
        source: chemicalResistanceName,
        sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
        duration: {
          kind: STATUS_DURATION_KIND.INFINITE
        }
      })
    ),
    {
      id: chemicalResistancePoisonedImmunitySourceId,
      sourceId: chemicalResistancePoisonedImmunitySourceId,
      group: STATUS_ENTRY_GROUP.IMMUNITIES,
      value: CONDITION_NAME.POISONED,
      source: chemicalResistanceName,
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.INFINITE
      }
    }
  ];
}

export function getArtificerConjuredCauldronAction(
  character: SubclassRuntimeCharacter
): FeatureActionCard | null {
  if (!hasArtificerChemicalMasteryFeature(character)) {
    return null;
  }

  const usesTotal = getArtificerConjuredCauldronUsesTotal(character);
  const usesRemaining = getArtificerConjuredCauldronUsesRemaining(character);
  const description = getConjuredCauldronDescription(character);

  return {
    key: artificerConjuredCauldronActionKey,
    name: conjuredCauldronName,
    sourceFeature: CLASS_FEATURE.CHEMICAL_MASTERY,
    cardTheme: ACTION_CARD_THEME.MAGIC,
    summary: "Cast Tasha's Bubbling Cauldron without a spell slot.",
    detail: "Open Tasha's Bubbling Cauldron and cast it using your Conjured Cauldron charge.",
    breakdown: "Free cauldron spell",
    economyType: ECONOMY_TYPE.ACTION,
    actionCategory: ACTION_CATEGORY.MAGIC,
    usesRemaining,
    usesTotal,
    cardUsage: createChargesCardUsage(usesRemaining, usesTotal),
    description,
    drawer: {
      kind: "confirm",
      description,
      confirmLabel: "Open Tasha's Bubbling Cauldron"
    },
    execute: {
      kind: "spell",
      spellSource: "fixed",
      effectKind: "conjured-cauldron",
      spellId: conjuredCauldronSpellId,
      spellLevel: 6,
      label: "Open Tasha's Bubbling Cauldron",
      actionContextText: "Using Conjured Cauldron",
      actionAvailabilityText: "Cast without expending a spell slot or Material components.",
      actionConsumesSpellSlot: false
    },
    disabled: usesRemaining <= 0,
    disabledReason:
      usesRemaining <= 0
        ? "Conjured Cauldron recharges when you finish a Long Rest."
        : undefined
  };
}

export function consumeArtificerConjuredCauldronUse(character: Character): Character {
  const usesTotal = getArtificerConjuredCauldronUsesTotal(character);
  const usesRemaining = getArtificerConjuredCauldronUsesRemaining(character);

  if (usesTotal <= 0 || usesRemaining <= 0) {
    return character;
  }

  const currentArtificerState = character.classFeatureState?.artificer ?? {};
  const conjuredCauldronState = normalizeArtificerConjuredCauldronState(
    currentArtificerState,
    character
  );

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      artificer: {
        ...currentArtificerState,
        ...conjuredCauldronState,
        conjuredCauldronUsesExpended:
          (conjuredCauldronState.conjuredCauldronUsesExpended ?? 0) + 1
      }
    }
  };
}

export function restoreArtificerConjuredCauldronOnLongRest(character: Character): Character {
  if (!hasArtificerChemicalMasteryFeature(character)) {
    return character;
  }

  const currentArtificerState = character.classFeatureState?.artificer ?? {};
  const conjuredCauldronState = normalizeArtificerConjuredCauldronState(
    currentArtificerState,
    character
  );

  if ((conjuredCauldronState.conjuredCauldronUsesExpended ?? 0) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      artificer: {
        ...currentArtificerState,
        ...conjuredCauldronState,
        conjuredCauldronUsesExpended: 0
      }
    }
  };
}
