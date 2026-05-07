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
  type CharacterDragonbornDraconicAncestry,
  type CharacterDragonbornFeatureState,
  type CharacterStatusEntry
} from "../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "./actionEconomy";
import { getAbilityModifierForCharacter } from "./abilities";
import { createChargesCardUsage } from "./classFeatures/cardUsage";
import type {
  FeatureActionCard,
  FeatureActionFact,
  FeatureSpeedBonus
} from "./classFeatures/types";
import { formatFormulaCell, formatSignedFormulaTerm } from "./shared/formulas";
import { createCharacterStatusEntry, normalizeCharacterStatusEntries } from "./statusEntries";

type DragonbornActionCharacter = Pick<Character, "species" | "level" | "abilities"> &
  Partial<Pick<Character, "speciesChoices" | "speciesFeatureState" | "statusEntries">>;

export type DragonbornDraconicAncestryOption = {
  key: CharacterDragonbornDraconicAncestry;
  dragon: string;
  damageType: DAMAGE_TYPE;
};

const dragonbornSpeciesId = "species-dragonborn-2024";
const dragonbornBreathWeaponActionKey = "species-dragonborn-breath-weapon";
const dragonbornDraconicFlightActionKey = "species-dragonborn-draconic-flight";
const dragonbornDraconicFlightStatusSourceId = "species-dragonborn-draconic-flight";
const dragonbornDraconicFlightUsesTotal = 1;

const dragonbornDraconicAncestryOptions: DragonbornDraconicAncestryOption[] = [
  { key: "black", dragon: "Black", damageType: DAMAGE_TYPE.ACID },
  { key: "blue", dragon: "Blue", damageType: DAMAGE_TYPE.LIGHTNING },
  { key: "brass", dragon: "Brass", damageType: DAMAGE_TYPE.FIRE },
  { key: "bronze", dragon: "Bronze", damageType: DAMAGE_TYPE.LIGHTNING },
  { key: "copper", dragon: "Copper", damageType: DAMAGE_TYPE.ACID },
  { key: "gold", dragon: "Gold", damageType: DAMAGE_TYPE.FIRE },
  { key: "green", dragon: "Green", damageType: DAMAGE_TYPE.POISON },
  { key: "red", dragon: "Red", damageType: DAMAGE_TYPE.FIRE },
  { key: "silver", dragon: "Silver", damageType: DAMAGE_TYPE.COLD },
  { key: "white", dragon: "White", damageType: DAMAGE_TYPE.COLD }
];
const dragonbornDraconicAncestryKeys = new Set<CharacterDragonbornDraconicAncestry>(
  dragonbornDraconicAncestryOptions.map((option) => option.key)
);

function getDragonbornEntry(): SpeciesEntry | null {
  const entry = getSpeciesEntryByName("Dragonborn");

  return entry?.id === dragonbornSpeciesId ? entry : null;
}

function getDragonbornDescriptionSection(heading: string): SpellDescriptionEntry[] {
  const description = getDragonbornEntry()?.description.filter(
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

function getDragonbornDescriptionText(heading: string, fallback: string): string {
  const section = getDragonbornDescriptionSection(heading);

  return section.length > 0 ? section.join("\n") : fallback;
}

function getDragonbornDescriptionPlainText(heading: string, fallback: string): string {
  return stripDescriptionMarkup(getDragonbornDescriptionText(heading, fallback))
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

function getDragonbornFeatureState(
  character: Partial<Pick<Character, "speciesFeatureState">>
): CharacterDragonbornFeatureState {
  return character.speciesFeatureState?.dragonborn ?? {};
}

function setDragonbornFeatureState(
  character: Character,
  state: CharacterDragonbornFeatureState
): Character {
  return {
    ...character,
    speciesFeatureState: {
      ...character.speciesFeatureState,
      dragonborn: {
        ...getDragonbornFeatureState(character),
        ...state
      }
    }
  };
}

export function isDragonbornSpecies(species: string): boolean {
  return getSpeciesEntryByName(species.trim())?.id === dragonbornSpeciesId;
}

export function getDragonbornDraconicAncestryOptions(): DragonbornDraconicAncestryOption[] {
  return [...dragonbornDraconicAncestryOptions];
}

export function getDragonbornDraconicAncestryOptionsForSpecies(
  species: string
): DragonbornDraconicAncestryOption[] {
  return isDragonbornSpecies(species) ? getDragonbornDraconicAncestryOptions() : [];
}

export function normalizeDragonbornDraconicAncestry(
  value: unknown
): CharacterDragonbornDraconicAncestry | null {
  return typeof value === "string" &&
    dragonbornDraconicAncestryKeys.has(value as CharacterDragonbornDraconicAncestry)
    ? (value as CharacterDragonbornDraconicAncestry)
    : null;
}

export function getDefaultDragonbornDraconicAncestryForSpecies(
  species: string
): CharacterDragonbornDraconicAncestry | null {
  if (!isDragonbornSpecies(species)) {
    return null;
  }

  return normalizeDragonbornDraconicAncestry(
    getDragonbornEntry()?.starterPack.recommendedDraconicAncestry
  );
}

export function formatDragonbornDamageTypeLabel(damageType: DAMAGE_TYPE): string {
  return `${damageType.charAt(0)}${damageType.slice(1).toLowerCase()}`;
}

export function formatDragonbornDraconicAncestryOptionLabel(
  option: DragonbornDraconicAncestryOption
): string {
  return `${option.dragon}: ${formatDragonbornDamageTypeLabel(option.damageType)}`;
}

export function getDragonbornDraconicAncestryForCharacter(
  character: Pick<Character, "species"> & Partial<Pick<Character, "speciesChoices">>
): DragonbornDraconicAncestryOption | null {
  if (!isDragonbornSpecies(character.species)) {
    return null;
  }

  const ancestry = normalizeDragonbornDraconicAncestry(character.speciesChoices?.draconicAncestry);

  return dragonbornDraconicAncestryOptions.find((option) => option.key === ancestry) ?? null;
}

export function normalizeDragonbornFeatureState(value: unknown): CharacterDragonbornFeatureState {
  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : {};

  return {
    breathWeaponUsesExpended: clampExpendedUses(record.breathWeaponUsesExpended),
    draconicFlightExpended: record.draconicFlightExpended === true
  };
}

export function getDragonbornBreathWeaponUsesTotal(
  character: Partial<Pick<Character, "species" | "level">>
): number {
  return character.species && isDragonbornSpecies(character.species)
    ? getSpeciesProficiencyBonus(character.level ?? 1)
    : 0;
}

export function getDragonbornBreathWeaponUsesRemaining(
  character: Partial<Pick<Character, "species" | "level" | "speciesFeatureState">>
): number {
  const total = getDragonbornBreathWeaponUsesTotal(character);
  const expended = clampExpendedUses(getDragonbornFeatureState(character).breathWeaponUsesExpended);

  return Math.max(0, total - expended);
}

export function spendDragonbornBreathWeaponForCharacter(character: Character): Character {
  if (getDragonbornBreathWeaponUsesRemaining(character) <= 0) {
    return character;
  }

  const dragonbornState = getDragonbornFeatureState(character);

  return setDragonbornFeatureState(character, {
    breathWeaponUsesExpended: clampExpendedUses(dragonbornState.breathWeaponUsesExpended) + 1
  });
}

export function restoreDragonbornBreathWeaponOnLongRest(character: Character): Character {
  if (getDragonbornBreathWeaponUsesTotal(character) <= 0) {
    return character;
  }

  const dragonbornState = getDragonbornFeatureState(character);

  if (clampExpendedUses(dragonbornState.breathWeaponUsesExpended) <= 0) {
    return character;
  }

  return setDragonbornFeatureState(character, {
    breathWeaponUsesExpended: 0
  });
}

export function getDragonbornDraconicFlightUsesTotal(
  character: Partial<Pick<Character, "species" | "level">>
): number {
  return character.species && isDragonbornSpecies(character.species) && (character.level ?? 1) >= 5
    ? dragonbornDraconicFlightUsesTotal
    : 0;
}

export function getDragonbornDraconicFlightUsesRemaining(
  character: Partial<Pick<Character, "species" | "level" | "speciesFeatureState">>
): number {
  const total = getDragonbornDraconicFlightUsesTotal(character);

  if (total <= 0) {
    return 0;
  }

  return getDragonbornFeatureState(character).draconicFlightExpended === true ? 0 : total;
}

export function restoreDragonbornDraconicFlightOnLongRest(character: Character): Character {
  if (getDragonbornDraconicFlightUsesTotal(character) <= 0) {
    return character;
  }

  const dragonbornState = getDragonbornFeatureState(character);

  if (dragonbornState.draconicFlightExpended !== true) {
    return character;
  }

  return setDragonbornFeatureState(character, {
    draconicFlightExpended: false
  });
}

export function getDragonbornBreathWeaponDamageDiceCount(
  character: Pick<Character, "level">
): number {
  if (character.level >= 17) {
    return 4;
  }

  if (character.level >= 11) {
    return 3;
  }

  return character.level >= 5 ? 2 : 1;
}

export function getDragonbornBreathWeaponDamageFormula(
  character: Pick<Character, "level">
): string {
  return `${getDragonbornBreathWeaponDamageDiceCount(character)}d10`;
}

export function getDragonbornBreathWeaponSaveDc(
  character: Pick<Character, "level" | "abilities"> & Partial<Pick<Character, "statusEntries">>
): number {
  return (
    8 +
    getAbilityModifierForCharacter(character, "CON") +
    getSpeciesProficiencyBonus(character.level)
  );
}

function getDragonbornBreathWeaponSaveDcFact(
  character: Pick<Character, "level" | "abilities"> & Partial<Pick<Character, "statusEntries">>
): FeatureActionFact {
  const constitutionModifier = getAbilityModifierForCharacter(character, "CON");
  const proficiencyBonus = getSpeciesProficiencyBonus(character.level);
  const saveDc = getDragonbornBreathWeaponSaveDc(character);
  const formulaCell = formatFormulaCell({
    formula: String(saveDc),
    displayTerms: [
      "DC 8 (Base)",
      formatSignedFormulaTerm(proficiencyBonus, "Prof. Bonus"),
      formatSignedFormulaTerm(constitutionModifier, "CON")
    ]
  });

  return {
    label: "Breath Weapon DC Formula",
    value: `Dexterity DC ${saveDc} = ${formulaCell.value}`,
    fullWidth: true
  };
}

function getDragonbornBreathWeaponDamageFormulaFact(
  character: Pick<Character, "level">,
  ancestry: DragonbornDraconicAncestryOption
): FeatureActionFact {
  const formula = getDragonbornBreathWeaponDamageFormula(character);
  const damageLabel = `${formatDragonbornDamageTypeLabel(ancestry.damageType)} damage`;
  const formulaCell = formatFormulaCell({
    formula,
    resultLabel: damageLabel
  });

  return {
    label: "Damage Formula",
    value: formulaCell.value,
    breakdown: formulaCell.breakdown,
    fullWidth: true
  };
}

function getDragonbornBreathWeaponDescription(): SpellDescriptionEntry[] {
  const section = getDragonbornDescriptionSection("Breath Weapon");

  return section.length > 0
    ? section
    : [
        "When you take the Attack action on your turn, you can replace one of your attacks with an exhalation of magical energy. Each creature in the area makes a Dexterity saving throw. On a failed save, a creature takes damage determined by your Draconic Ancestry, or half as much damage on a successful save."
      ];
}

function getDragonbornDraconicFlightDescription(): SpellDescriptionEntry[] {
  const section = getDragonbornDescriptionSection("Draconic Flight");

  return section.length > 0
    ? section
    : [
        "When you reach character level 5, you can sprout spectral wings as a Bonus Action for 10 minutes. During that time, you have a Fly Speed equal to your Speed. Once you use this trait, you can't use it again until you finish a Long Rest."
      ];
}

function getDragonbornDraconicFlightStatusDescription(): string {
  return getDragonbornDescriptionPlainText(
    "Draconic Flight",
    "You sprout spectral wings for 10 minutes. During that time, you have a Fly Speed equal to your Speed."
  );
}

export function isDragonbornDraconicFlightStatusEntry(
  entry: Pick<CharacterStatusEntry, "sourceId">
): boolean {
  return entry.sourceId === dragonbornDraconicFlightStatusSourceId;
}

export function normalizeDragonbornDraconicFlightStatusEntry(
  entry: CharacterStatusEntry
): CharacterStatusEntry {
  return {
    ...entry,
    value: "Draconic Flight",
    source: "Draconic Flight",
    sourceType: STATUS_ENTRY_SOURCE_TYPE.SPECIES,
    description: getDragonbornDraconicFlightStatusDescription()
  };
}

export function hasActiveDragonbornDraconicFlight(
  character: Partial<Pick<Character, "statusEntries">>
): boolean {
  return normalizeCharacterStatusEntries(character.statusEntries).some(
    isDragonbornDraconicFlightStatusEntry
  );
}

export function activateDragonbornDraconicFlightForCharacter(character: Character): Character {
  if (
    getDragonbornDraconicFlightUsesRemaining(character) <= 0 ||
    hasActiveDragonbornDraconicFlight(character)
  ) {
    return character;
  }

  return {
    ...setDragonbornFeatureState(character, {
      draconicFlightExpended: true
    }),
    statusEntries: [
      ...normalizeCharacterStatusEntries(character.statusEntries).filter(
        (entry) => !isDragonbornDraconicFlightStatusEntry(entry)
      ),
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: "Draconic Flight",
        source: "Draconic Flight",
        sourceType: STATUS_ENTRY_SOURCE_TYPE.SPECIES,
        duration: {
          kind: STATUS_DURATION_KIND.MINUTES,
          amount: 10
        },
        sourceId: dragonbornDraconicFlightStatusSourceId,
        description: getDragonbornDraconicFlightStatusDescription()
      })
    ]
  };
}

function getDragonbornBreathWeaponAction(character: DragonbornActionCharacter): FeatureActionCard {
  const total = getDragonbornBreathWeaponUsesTotal(character);
  const remaining = getDragonbornBreathWeaponUsesRemaining(character);
  const ancestry = getDragonbornDraconicAncestryForCharacter(character);
  const damageFormula = getDragonbornBreathWeaponDamageFormula(character);
  const description = getDragonbornBreathWeaponDescription();
  const damageTypeLabel = ancestry
    ? formatDragonbornDamageTypeLabel(ancestry.damageType)
    : "ancestry";
  const disabledReason = !ancestry
    ? "Choose a Draconic Ancestry before using Breath Weapon."
    : remaining <= 0
      ? "Breath Weapon recharges when you finish a Long Rest."
      : undefined;
  const facts = ancestry
    ? [
        getDragonbornBreathWeaponSaveDcFact(character),
        getDragonbornBreathWeaponDamageFormulaFact(character, ancestry)
      ]
    : [getDragonbornBreathWeaponSaveDcFact(character)];

  return {
    key: dragonbornBreathWeaponActionKey,
    name: "Breath Weapon",
    summary: ancestry
      ? `Exhale ${damageTypeLabel} in a cone or line.`
      : "Exhale damage tied to your Draconic Ancestry.",
    detail: ancestry
      ? `Dexterity save for ${damageFormula} ${damageTypeLabel} damage.`
      : "Choose your Draconic Ancestry to set the damage type.",
    breakdown: "Area breath damage",
    economyType: ECONOMY_TYPE.ACTION,
    actionCategory: ACTION_CATEGORY.ATTACK,
    usesRemaining: remaining,
    usesTotal: total,
    cardUsage: createChargesCardUsage(remaining, total),
    disabled: Boolean(disabledReason),
    disabledReason,
    description,
    facts,
    drawer: {
      kind: "custom-form",
      formKind: "dragonborn-breath-weapon",
      eyebrow: "Dragonborn Trait",
      description,
      facts,
      factsSectionTitle: null
    },
    execute: {
      kind: "custom-form",
      formKind: "dragonborn-breath-weapon"
    }
  };
}

function getDragonbornDraconicFlightAction(
  character: DragonbornActionCharacter
): FeatureActionCard {
  const total = getDragonbornDraconicFlightUsesTotal(character);
  const remaining = getDragonbornDraconicFlightUsesRemaining(character);
  const isActive = hasActiveDragonbornDraconicFlight(character);
  const description = getDragonbornDraconicFlightDescription();
  const disabledReason = isActive
    ? "Draconic Flight is already active."
    : remaining <= 0
      ? "Draconic Flight recharges when you finish a Long Rest."
      : undefined;

  return {
    key: dragonbornDraconicFlightActionKey,
    name: "Draconic Flight",
    summary: "Sprout spectral wings for 10 minutes.",
    detail: "Gain a Fly Speed equal to your Speed.",
    breakdown: isActive ? "Flight is active" : "Gain temporary flight",
    economyType: ECONOMY_TYPE.BONUS_ACTION,
    actionCategory: ACTION_CATEGORY.MAGIC,
    usesRemaining: remaining,
    usesTotal: total,
    cardUsage: createChargesCardUsage(remaining, total),
    isActive,
    disabled: Boolean(disabledReason),
    disabledReason,
    description,
    drawer: {
      kind: "confirm",
      eyebrow: "Dragonborn Trait",
      description
    },
    execute: {
      kind: "custom-form",
      formKind: "dragonborn-draconic-flight"
    }
  };
}

function createDragonbornStatusEntry(
  options: Pick<CharacterStatusEntry, "group" | "value"> &
    Partial<Pick<CharacterStatusEntry, "rangeFeet" | "description">> & {
      sourceId: string;
    }
): CharacterStatusEntry {
  return {
    id: options.sourceId,
    group: options.group,
    value: options.value,
    source: "Dragonborn",
    sourceType: STATUS_ENTRY_SOURCE_TYPE.SPECIES,
    duration: {
      kind: STATUS_DURATION_KIND.INFINITE
    },
    sourceId: options.sourceId,
    rangeFeet: options.rangeFeet ?? null,
    description: options.description
  };
}

export function getDragonbornActionsForCharacter(character: Character): FeatureActionCard[] {
  if (!isDragonbornSpecies(character.species)) {
    return [];
  }

  return [
    getDragonbornBreathWeaponAction(character),
    ...(character.level >= 5 ? [getDragonbornDraconicFlightAction(character)] : [])
  ];
}

export function getDragonbornSpeedBonusesForCharacter(
  character: Pick<Character, "species"> & Partial<Pick<Character, "statusEntries">>
): FeatureSpeedBonus[] {
  if (!isDragonbornSpecies(character.species) || !hasActiveDragonbornDraconicFlight(character)) {
    return [];
  }

  return [
    {
      label: "Draconic Flight",
      value: 0,
      movementType: "fly",
      setBaseFromWalkMultiplier: 1
    }
  ];
}

export function getDragonbornDerivedStatusEntriesForCharacter(
  character: Pick<Character, "species"> & Partial<Pick<Character, "speciesChoices">>
): CharacterStatusEntry[] {
  if (!isDragonbornSpecies(character.species)) {
    return [];
  }

  const ancestry = getDragonbornDraconicAncestryForCharacter(character);
  const darkvisionDescription = getDragonbornDescriptionText(
    "Darkvision",
    "You have Darkvision with a range of 60 feet."
  );
  const resistanceDescription = getDragonbornDescriptionText(
    "Damage Resistance",
    "You have Resistance to the damage type determined by your Draconic Ancestry trait."
  );

  return [
    createDragonbornStatusEntry({
      group: STATUS_ENTRY_GROUP.SENSES,
      value: SENSE.DARKVISION,
      sourceId: "species-dragonborn-darkvision",
      rangeFeet: 60,
      description: darkvisionDescription
    }),
    ...(ancestry
      ? [
          createDragonbornStatusEntry({
            group: STATUS_ENTRY_GROUP.RESISTANCES,
            value: ancestry.damageType,
            sourceId: `species-dragonborn-damage-resistance-${ancestry.key}`,
            description: resistanceDescription
          })
        ]
      : [])
  ];
}

export function getDragonbornBreathWeaponDamageTypeLabelForCharacter(
  character: Pick<Character, "species"> & Partial<Pick<Character, "speciesChoices">>
): string | null {
  const ancestry = getDragonbornDraconicAncestryForCharacter(character);

  return ancestry ? formatDragonbornDamageTypeLabel(ancestry.damageType) : null;
}
