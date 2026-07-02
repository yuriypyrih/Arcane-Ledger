import {
  DAMAGE_TYPE,
  getSpeciesEntryByName,
  getSpellEntryById,
  type SpeciesEntry,
  type SpellDescriptionEntry,
  type SpellEntry
} from "../../codex/entries";
import {
  SENSE,
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  type AbilityKey,
  type Character,
  type CharacterGenasiFeatureState,
  type CharacterGenasiLineage,
  type CharacterGenasiSpellcastingAbility,
  type CharacterStatusEntry
} from "../../types";
import { appendSourcedDescriptionAddition } from "./actionModalDescriptions";
import { ECONOMY_TYPE } from "./actionEconomy";
import { createChargesCardUsage } from "./classFeatures/cardUsage";
import { addSpellSource } from "./classFeatures/spellSources";
import type { FeatureSpeedBonus, SpellSourceMap } from "./classFeatures/types";
import type {
  FeatureSpellActionPathContribution,
  FeatureSpellCastEffectContribution
} from "./featureContributions";

export type GenasiLineageOption = {
  key: CharacterGenasiLineage;
  name: string;
  cantripId: string;
  spellsByLevel: readonly {
    level: number;
    spellId: string;
    withoutMaterialComponent?: boolean;
  }[];
  resistance?: DAMAGE_TYPE;
  speedBonuses?: readonly FeatureSpeedBonus[];
};

export type GenasiFreeCastState = {
  usesRemaining: number;
  usesTotal: number;
};

const genasiSpeciesId = "species-genasi-mpmm";
const genasiDefaultLineage: CharacterGenasiLineage = "water";
const genasiDefaultSpellcastingAbility: CharacterGenasiSpellcastingAbility = "CHA";
const bladeWardSpellId = "spell-blade-ward";
const genasiSpellcastingAbilityOptions = [
  "INT",
  "WIS",
  "CHA"
] as const satisfies readonly CharacterGenasiSpellcastingAbility[];

export const genasiLineageFreeCastContributionId = "species-genasi-lineage-free-cast";
export const genasiBladeWardBonusActionSpellActionPathId =
  "species-genasi-merge-with-stone-blade-ward-bonus-action";
export const genasiBladeWardBonusActionSpellCastEffectId =
  "species-genasi-merge-with-stone-blade-ward-spend";

const genasiLineageOptions = [
  {
    key: "water",
    name: "Water",
    cantripId: "spell-acid-splash",
    spellsByLevel: [
      {
        level: 3,
        spellId: "spell-create-or-destroy-water"
      },
      {
        level: 5,
        spellId: "spell-water-walk",
        withoutMaterialComponent: true
      }
    ],
    resistance: DAMAGE_TYPE.ACID,
    speedBonuses: [
      {
        label: "Water Genasi",
        value: 0,
        movementType: "swim",
        setBaseFromWalkMultiplier: 1
      }
    ]
  },
  {
    key: "fire",
    name: "Fire",
    cantripId: "spell-produce-flame",
    spellsByLevel: [
      {
        level: 3,
        spellId: "spell-burning-hands"
      },
      {
        level: 5,
        spellId: "spell-flame-blade",
        withoutMaterialComponent: true
      }
    ],
    resistance: DAMAGE_TYPE.FIRE
  },
  {
    key: "earth",
    name: "Earth",
    cantripId: bladeWardSpellId,
    spellsByLevel: [
      {
        level: 5,
        spellId: "spell-pass-without-trace",
        withoutMaterialComponent: true
      }
    ]
  },
  {
    key: "air",
    name: "Air",
    cantripId: "spell-shocking-grasp",
    spellsByLevel: [
      {
        level: 3,
        spellId: "spell-feather-fall",
        withoutMaterialComponent: true
      },
      {
        level: 5,
        spellId: "spell-levitate",
        withoutMaterialComponent: true
      }
    ],
    resistance: DAMAGE_TYPE.LIGHTNING,
    speedBonuses: [
      {
        label: "Air Genasi",
        value: 5,
        movementType: "walk"
      }
    ]
  }
] as const satisfies readonly GenasiLineageOption[];

const genasiLineageNameByKey = genasiLineageOptions.reduce<Record<CharacterGenasiLineage, string>>(
  (names, option) => {
    names[option.key] = option.name;
    return names;
  },
  {} as Record<CharacterGenasiLineage, string>
);
const genasiLineageKeys = new Set<CharacterGenasiLineage>(
  genasiLineageOptions.map((option) => option.key)
);
const genasiSpellcastingAbilitySet = new Set<string>(genasiSpellcastingAbilityOptions);

type GenasiRuntimeCharacter = Pick<Character, "species"> &
  Partial<Pick<Character, "level" | "speciesChoices" | "speciesFeatureState">>;

function getGenasiEntry(species = "Genasi"): SpeciesEntry | null {
  const entry = getSpeciesEntryByName(species.trim());

  return entry?.id === genasiSpeciesId ? entry : null;
}

function getGenasiDescriptionSection(heading: string): SpellDescriptionEntry[] {
  const description = getGenasiEntry()?.description.filter(
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

function getGenasiDescriptionText(heading: string, fallback: string): string {
  const section = getGenasiDescriptionSection(heading);

  return section.length > 0 ? section.join("\n") : fallback;
}

function getSpeciesProficiencyBonus(level: number): number {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));
  return Math.floor((normalizedLevel - 1) / 4) + 2;
}

function clampExpendedUses(value: unknown): number {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? Math.max(0, Math.floor(parsedValue)) : 0;
}

function clampExpendedSpellIds(value: unknown): string[] {
  return Array.isArray(value)
    ? value
        .filter((spellId): spellId is string => typeof spellId === "string")
        .map((spellId) => spellId.trim())
        .filter(Boolean)
    : [];
}

function getGenasiFeatureState(
  character: Partial<Pick<Character, "speciesFeatureState">>
): CharacterGenasiFeatureState {
  return character.speciesFeatureState?.genasi ?? {};
}

function setGenasiFeatureState(
  character: Character,
  state: CharacterGenasiFeatureState
): Character {
  return {
    ...character,
    speciesFeatureState: {
      ...character.speciesFeatureState,
      genasi: {
        ...getGenasiFeatureState(character),
        ...state
      }
    }
  };
}

function createGenasiStatusEntry(
  options: Pick<CharacterStatusEntry, "group" | "value"> &
    Partial<Pick<CharacterStatusEntry, "description" | "rangeFeet">> & {
      sourceId: string;
    }
): CharacterStatusEntry {
  return {
    id: options.sourceId,
    group: options.group,
    value: options.value,
    source: "Genasi",
    sourceType: STATUS_ENTRY_SOURCE_TYPE.SPECIES,
    duration: {
      kind: STATUS_DURATION_KIND.INFINITE
    },
    sourceId: options.sourceId,
    rangeFeet: options.rangeFeet ?? null,
    description: options.description
  };
}

function getGenasiLineageOption(
  character: Pick<Character, "species"> & Partial<Pick<Character, "speciesChoices">>
): GenasiLineageOption | null {
  const lineage = getGenasiLineageForCharacter(character);

  return lineage ? (genasiLineageOptions.find((option) => option.key === lineage) ?? null) : null;
}

function getGenasiUnlockedLeveledSpellIds(character: GenasiRuntimeCharacter): string[] {
  const lineageOption = getGenasiLineageOption(character);

  if (!lineageOption) {
    return [];
  }

  const level = Math.max(1, character.level ?? 1);

  return lineageOption.spellsByLevel
    .filter((spell) => level >= spell.level)
    .map((spell) => spell.spellId);
}

function isGenasiSpellWithoutMaterialComponent(
  character: GenasiRuntimeCharacter,
  spellId: string
): boolean {
  const lineageOption = getGenasiLineageOption(character);
  const level = Math.max(1, character.level ?? 1);

  return (
    lineageOption?.spellsByLevel.some(
      (spell) =>
        spell.spellId === spellId &&
        spell.withoutMaterialComponent === true &&
        level >= spell.level
    ) ?? false
  );
}

function isEarthGenasi(character: GenasiRuntimeCharacter): boolean {
  return getGenasiLineageForCharacter(character) === "earth";
}

export function isGenasiSpecies(species: string): boolean {
  return getGenasiEntry(species) !== null;
}

export function normalizeGenasiLineage(value: unknown): CharacterGenasiLineage | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const key = value.trim();
  return genasiLineageKeys.has(key as CharacterGenasiLineage)
    ? (key as CharacterGenasiLineage)
    : undefined;
}

export function normalizeGenasiSpellcastingAbility(
  value: unknown
): CharacterGenasiSpellcastingAbility | undefined {
  return typeof value === "string" && genasiSpellcastingAbilitySet.has(value)
    ? (value as CharacterGenasiSpellcastingAbility)
    : undefined;
}

export function normalizeGenasiFeatureState(value: unknown): CharacterGenasiFeatureState {
  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : {};

  return {
    freeCastExpendedSpellIds: clampExpendedSpellIds(record.freeCastExpendedSpellIds),
    bladeWardBonusActionUsesExpended: clampExpendedUses(
      record.bladeWardBonusActionUsesExpended
    )
  };
}

export function getDefaultGenasiLineageForSpecies(
  species: string
): CharacterGenasiLineage | undefined {
  return isGenasiSpecies(species)
    ? (normalizeGenasiLineage(getGenasiEntry()?.starterPack.recommendedGenasiLineage) ??
        genasiDefaultLineage)
    : undefined;
}

export function getDefaultGenasiSpellcastingAbilityForSpecies(
  species: string
): CharacterGenasiSpellcastingAbility | undefined {
  return isGenasiSpecies(species)
    ? (normalizeGenasiSpellcastingAbility(
        getGenasiEntry()?.starterPack.recommendedGenasiSpellcastingAbility
      ) ?? genasiDefaultSpellcastingAbility)
    : undefined;
}

export function getGenasiLineageOptionsForSpecies(species: string): GenasiLineageOption[] {
  return isGenasiSpecies(species) ? [...genasiLineageOptions] : [];
}

export function getGenasiSpellcastingAbilityOptionsForSpecies(
  species: string
): CharacterGenasiSpellcastingAbility[] {
  return isGenasiSpecies(species) ? [...genasiSpellcastingAbilityOptions] : [];
}

export function formatGenasiLineageOptionLabel(option: Pick<GenasiLineageOption, "name">): string {
  return option.name;
}

export function getGenasiLineageForCharacter(
  character: Pick<Character, "species"> & Partial<Pick<Character, "speciesChoices">>
): CharacterGenasiLineage | null {
  if (!isGenasiSpecies(character.species)) {
    return null;
  }

  return normalizeGenasiLineage(character.speciesChoices?.genasiLineage) ?? null;
}

export function getGenasiGrantedCantripEntriesForCharacter(
  character: GenasiRuntimeCharacter
): SpellEntry[] {
  const lineageOption = getGenasiLineageOption(character);

  if (!lineageOption) {
    return [];
  }

  const spell = getSpellEntryById(lineageOption.cantripId);
  return spell ? [spell] : [];
}

export function getGenasiAlwaysPreparedSpellIdsForCharacter(
  character: GenasiRuntimeCharacter
): string[] {
  return getGenasiUnlockedLeveledSpellIds(character);
}

export function getGenasiAlwaysPreparedSpellSourceMapForCharacter(
  character: GenasiRuntimeCharacter
): SpellSourceMap {
  const sourceMap: SpellSourceMap = {};
  const lineageOption = getGenasiLineageOption(character);

  if (!lineageOption) {
    return sourceMap;
  }

  addSpellSource(sourceMap, lineageOption.cantripId, "Genasi");

  getGenasiAlwaysPreparedSpellIdsForCharacter(character).forEach((spellId) => {
    addSpellSource(sourceMap, spellId, "Genasi");
  });

  return sourceMap;
}

export function getGenasiSpellcastingAbilityForCharacter(
  character: GenasiRuntimeCharacter,
  spellId: string
): AbilityKey | null {
  const lineageOption = getGenasiLineageOption(character);

  if (!lineageOption) {
    return null;
  }

  const genasiSpellIds = new Set([
    lineageOption.cantripId,
    ...lineageOption.spellsByLevel.map((spell) => spell.spellId)
  ]);

  if (!genasiSpellIds.has(spellId)) {
    return null;
  }

  return (
    normalizeGenasiSpellcastingAbility(character.speciesChoices?.genasiSpellcastingAbility) ?? null
  );
}

export function getGenasiLineageFreeCastStateForCharacter(
  character: GenasiRuntimeCharacter,
  spellId: string
): GenasiFreeCastState | null {
  const unlockedSpellIds = getGenasiUnlockedLeveledSpellIds(character);

  if (!unlockedSpellIds.includes(spellId)) {
    return null;
  }

  const expendedSpellIds = new Set(
    clampExpendedSpellIds(getGenasiFeatureState(character).freeCastExpendedSpellIds)
  );

  return {
    usesRemaining: expendedSpellIds.has(spellId) ? 0 : 1,
    usesTotal: 1
  };
}

export function consumeGenasiLineageFreeCastForCharacter(
  character: Character,
  spellId: string
): Character {
  const freeCastState = getGenasiLineageFreeCastStateForCharacter(character, spellId);

  if (!freeCastState || freeCastState.usesRemaining <= 0) {
    return character;
  }

  const expendedSpellIds = new Set(
    clampExpendedSpellIds(getGenasiFeatureState(character).freeCastExpendedSpellIds)
  );
  expendedSpellIds.add(spellId);

  return setGenasiFeatureState(character, {
    freeCastExpendedSpellIds: [...expendedSpellIds]
  });
}

export function getGenasiLineageFreeCastUsesTotal(character: GenasiRuntimeCharacter): number {
  return getGenasiUnlockedLeveledSpellIds(character).length;
}

export function getGenasiLineageFreeCastUsesRemaining(character: GenasiRuntimeCharacter): number {
  const unlockedSpellIds = getGenasiUnlockedLeveledSpellIds(character);

  if (unlockedSpellIds.length === 0) {
    return 0;
  }

  const expendedSpellIds = new Set(
    clampExpendedSpellIds(getGenasiFeatureState(character).freeCastExpendedSpellIds)
  );

  return unlockedSpellIds.filter((spellId) => !expendedSpellIds.has(spellId)).length;
}

export function restoreGenasiLineageFreeCastsOnLongRest(character: Character): Character {
  if (getGenasiLineageFreeCastUsesTotal(character) <= 0) {
    return character;
  }

  const expendedSpellIds = clampExpendedSpellIds(
    getGenasiFeatureState(character).freeCastExpendedSpellIds
  );

  if (expendedSpellIds.length === 0) {
    return character;
  }

  return setGenasiFeatureState(character, {
    freeCastExpendedSpellIds: []
  });
}

export function getGenasiBladeWardBonusActionUsesTotal(
  character: GenasiRuntimeCharacter
): number {
  return isEarthGenasi(character) ? getSpeciesProficiencyBonus(character.level ?? 1) : 0;
}

export function getGenasiBladeWardBonusActionUsesRemaining(
  character: GenasiRuntimeCharacter
): number {
  const total = getGenasiBladeWardBonusActionUsesTotal(character);

  if (total <= 0) {
    return 0;
  }

  return Math.max(
    0,
    total - clampExpendedUses(getGenasiFeatureState(character).bladeWardBonusActionUsesExpended)
  );
}

export function consumeGenasiBladeWardBonusActionUseForCharacter(
  character: Character
): Character {
  if (getGenasiBladeWardBonusActionUsesRemaining(character) <= 0) {
    return character;
  }

  return setGenasiFeatureState(character, {
    bladeWardBonusActionUsesExpended:
      clampExpendedUses(getGenasiFeatureState(character).bladeWardBonusActionUsesExpended) + 1
  });
}

export function restoreGenasiBladeWardBonusActionUsesOnLongRest(character: Character): Character {
  if (getGenasiBladeWardBonusActionUsesTotal(character) <= 0) {
    return character;
  }

  const expendedUses = clampExpendedUses(
    getGenasiFeatureState(character).bladeWardBonusActionUsesExpended
  );

  if (expendedUses <= 0) {
    return character;
  }

  return setGenasiFeatureState(character, {
    bladeWardBonusActionUsesExpended: 0
  });
}

export function getGenasiDerivedStatusEntriesForCharacter(
  character: GenasiRuntimeCharacter
): CharacterStatusEntry[] {
  const entry = getGenasiEntry(character.species);

  if (!entry) {
    return [];
  }

  const lineageOption = getGenasiLineageOption(character);
  const entries = [
    createGenasiStatusEntry({
      group: STATUS_ENTRY_GROUP.SENSES,
      value: SENSE.DARKVISION,
      sourceId: "species-genasi-darkvision",
      rangeFeet: 60,
      description: getGenasiDescriptionText(
        "Darkvision",
        "You have Darkvision with a range of 60 feet."
      )
    })
  ];

  if (!lineageOption) {
    return entries;
  }

  if (lineageOption.resistance) {
    entries.push(
      createGenasiStatusEntry({
        group: STATUS_ENTRY_GROUP.RESISTANCES,
        value: lineageOption.resistance,
        sourceId: `species-genasi-${lineageOption.key}-resistance`
      })
    );
  }

  if (lineageOption.key === "water") {
    entries.push(
      createGenasiStatusEntry({
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: "Amphibious",
        sourceId: "species-genasi-water-amphibious",
        description: "You breathe air and water."
      })
    );
  }

  if (lineageOption.key === "earth") {
    entries.push(
      createGenasiStatusEntry({
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: "Earth Walk",
        sourceId: "species-genasi-earth-walk",
        description:
          "You can move across difficult terrain without expending extra movement if you are using your walking Speed on the ground or a floor."
      })
    );
  }

  if (lineageOption.key === "air") {
    entries.push(
      createGenasiStatusEntry({
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: "Unending Breath",
        sourceId: "species-genasi-air-unending-breath",
        description: "You can hold your breath indefinitely while you're not Incapacitated."
      })
    );
  }

  return entries;
}

export function getGenasiSpeedBonusesForCharacter(
  character: GenasiRuntimeCharacter
): FeatureSpeedBonus[] {
  const lineageOption = getGenasiLineageOption(character);

  return lineageOption?.speedBonuses ? [...lineageOption.speedBonuses] : [];
}

export function getGenasiSpellActionPathContributionsForCharacter(
  character: GenasiRuntimeCharacter
): FeatureSpellActionPathContribution[] {
  if (!isEarthGenasi(character)) {
    return [];
  }

  return [
    {
      id: genasiBladeWardBonusActionSpellActionPathId,
      spellId: bladeWardSpellId,
      economyType: ECONOMY_TYPE.BONUS_ACTION,
      actionLabel: "Merge with Stone",
      getDisabledReason: ({ character: currentCharacter }) =>
        getGenasiBladeWardBonusActionUsesRemaining(currentCharacter) <= 0
          ? "Merge with Stone has no bonus-action Blade Ward uses remaining."
          : null,
      getUsage: ({ character: currentCharacter }) =>
        createChargesCardUsage(
          getGenasiBladeWardBonusActionUsesRemaining(currentCharacter),
          getGenasiBladeWardBonusActionUsesTotal(currentCharacter)
        ),
      spellCastEffectIds: [genasiBladeWardBonusActionSpellCastEffectId]
    }
  ];
}

export function getGenasiSpellCastEffectsForCharacter(
  character: GenasiRuntimeCharacter
): FeatureSpellCastEffectContribution[] {
  if (!isEarthGenasi(character)) {
    return [];
  }

  return [
    {
      id: genasiBladeWardBonusActionSpellCastEffectId,
      apply: (currentCharacter, context) => {
        if (
          context.spell.id !== bladeWardSpellId ||
          context.spellActionPathId !== genasiBladeWardBonusActionSpellActionPathId
        ) {
          return currentCharacter;
        }

        return consumeGenasiBladeWardBonusActionUseForCharacter(currentCharacter);
      }
    }
  ];
}

export function getGenasiSpellEntryForCharacter(
  character: GenasiRuntimeCharacter,
  spell: SpellEntry
): SpellEntry {
  const lineageOption = getGenasiLineageOption(character);

  if (!lineageOption) {
    return spell;
  }

  if (lineageOption.key === "earth" && spell.id === bladeWardSpellId) {
    return appendSourcedDescriptionAddition(spell, "Genasi", [
      "You can cast this cantrip as normal, and you can also cast it as a Bonus Action a number of times equal to your Proficiency Bonus, regaining all expended uses when you finish a Long Rest."
    ]);
  }

  if (!isGenasiSpellWithoutMaterialComponent(character, spell.id)) {
    return spell;
  }

  return appendSourcedDescriptionAddition(spell, "Genasi", [
    `When you cast this spell with your ${genasiLineageNameByKey[lineageOption.key]} Genasi lineage trait, it doesn't require a material component.`
  ]);
}
