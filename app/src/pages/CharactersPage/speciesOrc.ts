import {
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
  type CharacterOrcFeatureState,
  type CharacterStatusEntry
} from "../../types";
import { createSourcedDescriptionEntries } from "./actionModalDescriptions";
import { createChargesCardUsage, createChargesHeaderTag } from "./classFeatures/cardUsage";
import type { FeatureActionCard } from "./classFeatures/types";
import { swapTemporaryHitPointsAssignment } from "./shared";

type OrcRuntimeCharacter = Pick<Character, "species"> &
  Partial<Pick<Character, "level" | "speciesFeatureState">>;

const orcSpeciesId = "species-orc-2024";
const orcDashActionKey = "common-action-dash";

function getOrcEntry(species = "Orc"): SpeciesEntry | null {
  const entry = getSpeciesEntryByName(species.trim());

  return entry?.id === orcSpeciesId ? entry : null;
}

function getOrcDescriptionSection(heading: string): SpellDescriptionEntry[] {
  const description = getOrcEntry()?.description.filter(
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

function getOrcDescriptionText(heading: string, fallback: string): string {
  const description = getOrcDescriptionSection(heading);

  return description.length > 0 ? description.join("\n") : fallback;
}

function getAdrenalineRushDescriptionAddition(): SpellDescriptionEntry[] {
  const description = getOrcDescriptionSection("Adrenaline Rush");

  return createSourcedDescriptionEntries(
    "Adrenaline Rush",
    description.length > 0
      ? description
      : [
          "You can take the Dash action as a Bonus Action. When you do so, you gain a number of Temporary Hit Points equal to your Proficiency Bonus.",
          "You can use this trait a number of times equal to your Proficiency Bonus, and you regain all expended uses when you finish a Long Rest."
        ]
  );
}

function getSpeciesProficiencyBonus(level: number): number {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));
  return Math.floor((normalizedLevel - 1) / 4) + 2;
}

function clampExpendedUses(value: unknown): number {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? Math.max(0, Math.floor(parsedValue)) : 0;
}

function getOrcFeatureState(
  character: Partial<Pick<Character, "speciesFeatureState">>
): CharacterOrcFeatureState {
  return character.speciesFeatureState?.orc ?? {};
}

function setOrcFeatureState(character: Character, state: CharacterOrcFeatureState): Character {
  return {
    ...character,
    speciesFeatureState: {
      ...character.speciesFeatureState,
      orc: {
        ...getOrcFeatureState(character),
        ...state
      }
    }
  };
}

function createOrcStatusEntry(
  options: Pick<CharacterStatusEntry, "group" | "value" | "description"> &
    Partial<Pick<CharacterStatusEntry, "rangeFeet">> & {
      sourceId: string;
    }
): CharacterStatusEntry {
  return {
    id: options.sourceId,
    group: options.group,
    value: options.value,
    source: "Orc",
    sourceType: STATUS_ENTRY_SOURCE_TYPE.SPECIES,
    duration: {
      kind: STATUS_DURATION_KIND.INFINITE
    },
    sourceId: options.sourceId,
    rangeFeet: options.rangeFeet ?? null,
    description: options.description
  };
}

export function isOrcSpecies(species: string): boolean {
  return getOrcEntry(species) !== null;
}

export function normalizeOrcFeatureState(value: unknown): CharacterOrcFeatureState {
  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : {};

  return {
    adrenalineRushUsesExpended: clampExpendedUses(record.adrenalineRushUsesExpended)
  };
}

export function getOrcAdrenalineRushUsesTotal(
  character: Partial<Pick<Character, "species" | "level">>
): number {
  return character.species && isOrcSpecies(character.species)
    ? getSpeciesProficiencyBonus(character.level ?? 1)
    : 0;
}

export function getOrcAdrenalineRushUsesRemaining(
  character: Partial<Pick<Character, "species" | "level" | "speciesFeatureState">>
): number {
  const total = getOrcAdrenalineRushUsesTotal(character);
  const expended = clampExpendedUses(getOrcFeatureState(character).adrenalineRushUsesExpended);

  return Math.max(0, total - expended);
}

export function restoreOrcAdrenalineRushOnLongRest(character: Character): Character {
  if (getOrcAdrenalineRushUsesTotal(character) <= 0) {
    return character;
  }

  const orcState = getOrcFeatureState(character);

  if (clampExpendedUses(orcState.adrenalineRushUsesExpended) <= 0) {
    return character;
  }

  return setOrcFeatureState(character, {
    adrenalineRushUsesExpended: 0
  });
}

export function applyOrcAdrenalineRushForCharacter(character: Character): Character {
  if (getOrcAdrenalineRushUsesRemaining(character) <= 0) {
    return character;
  }

  const orcState = getOrcFeatureState(character);
  const temporaryHitPoints = getSpeciesProficiencyBonus(character.level);
  const characterWithSpentCharge = setOrcFeatureState(character, {
    adrenalineRushUsesExpended: clampExpendedUses(orcState.adrenalineRushUsesExpended) + 1
  });

  return {
    ...characterWithSpentCharge,
    ...swapTemporaryHitPointsAssignment(
      characterWithSpentCharge.temporaryHitPoints,
      characterWithSpentCharge.temporaryHitPointsSource,
      temporaryHitPoints,
      "Adrenaline Rush"
    )
  };
}

export function hasOrcAdrenalineRushCommonActionBonusPath(
  character: OrcRuntimeCharacter,
  actionKey: string
): boolean {
  return isOrcSpecies(character.species) && actionKey === orcDashActionKey;
}

export function getOrcCommonActionForCharacter(
  character: OrcRuntimeCharacter,
  action: FeatureActionCard
): FeatureActionCard {
  if (!hasOrcAdrenalineRushCommonActionBonusPath(character, action.key)) {
    return action;
  }

  const usesTotal = getOrcAdrenalineRushUsesTotal(character);
  const usesRemaining = getOrcAdrenalineRushUsesRemaining(character);

  return {
    ...action,
    detail: `${action.detail} As an Orc, you can use Adrenaline Rush to Dash as a Bonus Action and gain Temporary Hit Points equal to your Proficiency Bonus.`,
    usesRemaining,
    usesTotal,
    cardUsage: createChargesCardUsage(usesRemaining, usesTotal),
    headerTags: [...(action.headerTags ?? []), createChargesHeaderTag(usesRemaining, usesTotal)],
    descriptionAdditions: [
      ...(action.descriptionAdditions ?? []),
      getAdrenalineRushDescriptionAddition()
    ]
  };
}

export function getOrcDerivedStatusEntriesForCharacter(
  character: Pick<Character, "species">
): CharacterStatusEntry[] {
  if (!isOrcSpecies(character.species)) {
    return [];
  }

  return [
    createOrcStatusEntry({
      group: STATUS_ENTRY_GROUP.SENSES,
      value: SENSE.DARKVISION,
      sourceId: "species-orc-darkvision",
      rangeFeet: 120,
      description: getOrcDescriptionText(
        "Darkvision",
        "You have Darkvision with a range of 120 feet."
      )
    })
  ];
}
