import {
  DAMAGE_TYPE,
  getSpeciesEntryByName,
  type SpeciesEntry,
  type SpellDescriptionEntry
} from "../../codex/entries";
import {
  SENSE,
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  type Character,
  type CharacterDwarfFeatureState,
  type CharacterStatusEntry
} from "../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "./actionEconomy";
import { createSourcedDescriptionEntries } from "./actionModalDescriptions";
import { createChargesCardUsage } from "./classFeatures/cardUsage";
import type { FeatureActionCard } from "./classFeatures/types";
import { createCharacterStatusEntry, normalizeCharacterStatusEntries } from "./statusEntries";

type DwarfActionCharacter = Pick<Character, "species" | "level"> &
  Partial<Pick<Character, "speciesFeatureState" | "statusEntries">>;

const dwarfSpeciesId = "species-dwarf-2024";
const dwarfStonecunningActionKey = "species-dwarf-stonecunning";
const dwarfStonecunningStatusSourceId = "species-dwarf-stonecunning";

function getDwarfEntry(): SpeciesEntry | null {
  const entry = getSpeciesEntryByName("Dwarf");

  return entry?.id === dwarfSpeciesId ? entry : null;
}

function getDwarfDescriptionSection(heading: string): SpellDescriptionEntry[] {
  const description = getDwarfEntry()?.description.filter(
    (descriptionEntry): descriptionEntry is string => typeof descriptionEntry === "string"
  );

  if (!description) {
    return [];
  }

  const startIndex = description.findIndex((descriptionEntry) =>
    descriptionEntry.includes(`<strong>${heading}.`)
  );

  if (startIndex < 0) {
    return [];
  }

  const section: string[] = [];

  for (let index = startIndex; index < description.length; index += 1) {
    const descriptionEntry = description[index]!;

    if (index > startIndex && descriptionEntry.startsWith("<strong>")) {
      break;
    }

    section.push(descriptionEntry);
  }

  return section;
}

function stripDescriptionMarkup(value: string): string {
  return value
    .replace(/<strong>(.*?)<\/strong>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getDwarfDescriptionText(heading: string, fallback: string): string {
  const section = getDwarfDescriptionSection(heading);

  return section.length > 0 ? section.join("\n") : fallback;
}

function getDwarfDescriptionPlainText(heading: string, fallback: string): string {
  return stripDescriptionMarkup(getDwarfDescriptionText(heading, fallback))
    .replace(new RegExp(`^${heading}\\.\\s*`, "i"), "")
    .trim();
}

function getSpeciesProficiencyBonus(level: number): number {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));
  return Math.floor((normalizedLevel - 1) / 4) + 2;
}

function clampExpendedUses(value: unknown): number {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? Math.max(0, Math.floor(parsedValue)) : 0;
}

function getDwarfFeatureState(
  character: Partial<Pick<Character, "speciesFeatureState">>
): CharacterDwarfFeatureState {
  return character.speciesFeatureState?.dwarf ?? {};
}

function setDwarfFeatureState(character: Character, state: CharacterDwarfFeatureState): Character {
  return {
    ...character,
    speciesFeatureState: {
      ...character.speciesFeatureState,
      dwarf: {
        ...getDwarfFeatureState(character),
        ...state
      }
    }
  };
}

function getDwarvenResilienceDescriptionAddition(): SpellDescriptionEntry[] {
  const description = getDwarfDescriptionSection("Dwarven Resilience");

  return createSourcedDescriptionEntries(
    "Dwarven Resilience",
    description.length > 0
      ? description
      : [
          "You have Resistance to Poison damage. You also have Advantage on saving throws you make to avoid or end the Poisoned condition."
        ]
  );
}

function getStonecunningDescription(): SpellDescriptionEntry[] {
  const description = getDwarfDescriptionSection("Stonecunning");

  return description.length > 0
    ? description
    : [
        "As a Bonus Action, you gain Tremorsense with a range of 60 feet for 10 minutes. You must be on a stone surface or touching a stone surface to use this Tremorsense. The stone can be natural or worked.",
        "You can use this Bonus Action a number of times equal to your Proficiency Bonus, and you regain all expended uses when you finish a Long Rest."
      ];
}

function getStonecunningTremorsenseDescriptionAddition(): SpellDescriptionEntry[] {
  const description = getDwarfDescriptionPlainText(
    "Stonecunning",
    "As a Bonus Action, you gain Tremorsense with a range of 60 feet for 10 minutes. You must be on a stone surface or touching a stone surface to use this Tremorsense. The stone can be natural or worked."
  );
  const firstPart = description.split(" You must be on a stone surface")[0]?.trim();

  return createSourcedDescriptionEntries("Stonecunning", [
    firstPart && firstPart.length > 0
      ? firstPart
      : "As a Bonus Action, you gain Tremorsense with a range of 60 feet for 10 minutes."
  ]);
}

export function isDwarfSpecies(species: string): boolean {
  return getSpeciesEntryByName(species.trim())?.id === dwarfSpeciesId;
}

export function normalizeDwarfFeatureState(value: unknown): CharacterDwarfFeatureState {
  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : {};

  return {
    stonecunningUsesExpended: clampExpendedUses(record.stonecunningUsesExpended)
  };
}

export function getDwarfStonecunningUsesTotal(
  character: Partial<Pick<Character, "species" | "level">>
): number {
  return character.species && isDwarfSpecies(character.species)
    ? getSpeciesProficiencyBonus(character.level ?? 1)
    : 0;
}

export function getDwarfStonecunningUsesRemaining(
  character: Partial<Pick<Character, "species" | "level" | "speciesFeatureState">>
): number {
  const total = getDwarfStonecunningUsesTotal(character);
  const expended = clampExpendedUses(getDwarfFeatureState(character).stonecunningUsesExpended);

  return Math.max(0, total - expended);
}

export function restoreDwarfStonecunningOnLongRest(character: Character): Character {
  if (getDwarfStonecunningUsesTotal(character) <= 0) {
    return character;
  }

  const dwarfState = getDwarfFeatureState(character);

  if (clampExpendedUses(dwarfState.stonecunningUsesExpended) <= 0) {
    return character;
  }

  return setDwarfFeatureState(character, {
    stonecunningUsesExpended: 0
  });
}

export function isDwarfStonecunningStatusEntry(
  entry: Pick<CharacterStatusEntry, "sourceId">
): boolean {
  return entry.sourceId === dwarfStonecunningStatusSourceId;
}

export function normalizeDwarfStonecunningStatusEntry(
  entry: CharacterStatusEntry
): CharacterStatusEntry {
  return {
    ...entry,
    group: STATUS_ENTRY_GROUP.SENSES,
    value: SENSE.TREMORSENSE,
    source: "Stonecunning",
    sourceType: STATUS_ENTRY_SOURCE_TYPE.SPECIES,
    rangeFeet: 60,
    description: undefined,
    descriptionAdditions: [getStonecunningTremorsenseDescriptionAddition()]
  };
}

export function hasActiveDwarfStonecunning(
  character: Partial<Pick<Character, "statusEntries">>
): boolean {
  return normalizeCharacterStatusEntries(character.statusEntries).some(
    isDwarfStonecunningStatusEntry
  );
}

export function activateDwarfStonecunningForCharacter(character: Character): Character {
  if (getDwarfStonecunningUsesRemaining(character) <= 0 || hasActiveDwarfStonecunning(character)) {
    return character;
  }

  const dwarfState = getDwarfFeatureState(character);

  return {
    ...setDwarfFeatureState(character, {
      stonecunningUsesExpended: clampExpendedUses(dwarfState.stonecunningUsesExpended) + 1
    }),
    statusEntries: [
      ...normalizeCharacterStatusEntries(character.statusEntries).filter(
        (entry) => !isDwarfStonecunningStatusEntry(entry)
      ),
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.SENSES,
        value: SENSE.TREMORSENSE,
        source: "Stonecunning",
        sourceType: STATUS_ENTRY_SOURCE_TYPE.SPECIES,
        duration: {
          kind: STATUS_DURATION_KIND.MINUTES,
          amount: 10
        },
        sourceId: dwarfStonecunningStatusSourceId,
        rangeFeet: 60,
        descriptionAdditions: [getStonecunningTremorsenseDescriptionAddition()]
      })
    ]
  };
}

function getDwarfStonecunningAction(character: DwarfActionCharacter): FeatureActionCard {
  const total = getDwarfStonecunningUsesTotal(character);
  const remaining = getDwarfStonecunningUsesRemaining(character);
  const isActive = hasActiveDwarfStonecunning(character);
  const description = getStonecunningDescription();
  const disabledReason = isActive
    ? "Stonecunning is already active."
    : remaining <= 0
      ? "Stonecunning recharges when you finish a Long Rest."
      : undefined;

  return {
    key: dwarfStonecunningActionKey,
    name: "Stonecunning",
    summary: "Gain Tremorsense with a range of 60 feet for 10 minutes.",
    detail: "You must be on or touching a stone surface.",
    breakdown: isActive ? "Tremorsense is active" : "Gain Tremorsense",
    economyType: ECONOMY_TYPE.BONUS_ACTION,
    actionCategory: ACTION_CATEGORY.UTILITY,
    usesRemaining: remaining,
    usesTotal: total,
    cardUsage: createChargesCardUsage(remaining, total),
    isActive,
    disabled: Boolean(disabledReason),
    disabledReason,
    description,
    drawer: {
      kind: "confirm",
      eyebrow: "Dwarf Trait",
      description
    },
    execute: {
      kind: "custom-form",
      formKind: "dwarf-stonecunning"
    }
  };
}

function createDwarfStatusEntry(
  options: Pick<CharacterStatusEntry, "group" | "value"> &
    Partial<Pick<CharacterStatusEntry, "rangeFeet" | "description" | "descriptionAdditions">> & {
      sourceId: string;
      source?: string;
    }
): CharacterStatusEntry {
  return {
    id: options.sourceId,
    group: options.group,
    value: options.value,
    source: options.source ?? "Dwarf",
    sourceType: STATUS_ENTRY_SOURCE_TYPE.SPECIES,
    duration: {
      kind: STATUS_DURATION_KIND.INFINITE
    },
    sourceId: options.sourceId,
    rangeFeet: options.rangeFeet ?? null,
    description: options.description,
    descriptionAdditions: options.descriptionAdditions
  };
}

export function getDwarfActionsForCharacter(character: Character): FeatureActionCard[] {
  if (!isDwarfSpecies(character.species)) {
    return [];
  }

  return [getDwarfStonecunningAction(character)];
}

export function getDwarfDerivedStatusEntriesForCharacter(
  character: Pick<Character, "species">
): CharacterStatusEntry[] {
  if (!isDwarfSpecies(character.species)) {
    return [];
  }

  const darkvisionDescription = getDwarfDescriptionText(
    "Darkvision",
    "You have Darkvision with a range of 120 feet."
  );

  return [
    createDwarfStatusEntry({
      group: STATUS_ENTRY_GROUP.SENSES,
      value: SENSE.DARKVISION,
      sourceId: "species-dwarf-darkvision",
      rangeFeet: 120,
      description: darkvisionDescription
    }),
    createDwarfStatusEntry({
      group: STATUS_ENTRY_GROUP.RESISTANCES,
      value: DAMAGE_TYPE.POISON,
      sourceId: "species-dwarf-dwarven-resilience-poison",
      descriptionAdditions: [getDwarvenResilienceDescriptionAddition()]
    })
  ];
}
