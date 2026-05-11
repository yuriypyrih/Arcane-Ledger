import {
  BODY_SIZE,
  DAMAGE_TYPE,
  getSpeciesEntryByName,
  getSpellEntryById,
  type SpellEntry,
  type SpeciesEntry
} from "../../codex/entries";
import {
  type AbilityKey,
  SENSE,
  STATUS_DURATION_KIND,
  STATUS_DURATION_ROUND_TICK,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  type Character,
  type CharacterAasimarFeatureState,
  type CharacterDragonbornFeatureState,
  type CharacterDwarfFeatureState,
  type CharacterGnomeFeatureState,
  type CharacterGoliathFeatureState,
  type CharacterOrcFeatureState,
  type CharacterSpeciesChoices,
  type CharacterSpeciesFeatureState,
  type CharacterStatusEntry,
  type CharacterTieflingFeatureState
} from "../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "./actionEconomy";
import { createChargesCardUsage } from "./classFeatures/cardUsage";
import { addSpellSource } from "./classFeatures/spellSources";
import type {
  FeatureActionCard,
  FeatureActionFact,
  FeatureSpeedBonus,
  SpellSourceMap
} from "./classFeatures/types";
import { formatFormulaBreakdown, formatFormulaCell } from "./shared/formulas";
import { createCharacterStatusEntry, normalizeCharacterStatusEntries } from "./statusEntries";
import {
  getDefaultDragonbornDraconicAncestryForSpecies,
  getDragonbornActionsForCharacter,
  getDragonbornDerivedStatusEntriesForCharacter,
  getDragonbornDraconicAncestryForCharacter,
  getDragonbornDraconicAncestryOptionsForSpecies,
  getDragonbornSpeedBonusesForCharacter,
  formatDragonbornDraconicAncestryOptionLabel as formatDragonbornDraconicAncestrySummaryLabel,
  isDragonbornDraconicFlightStatusEntry,
  isDragonbornSpecies,
  normalizeDragonbornDraconicAncestry,
  normalizeDragonbornDraconicFlightStatusEntry,
  normalizeDragonbornFeatureState
} from "./speciesDragonborn";
import {
  getDwarfActionsForCharacter,
  getDwarfDerivedStatusEntriesForCharacter,
  isDwarfSpecies,
  isDwarfStonecunningStatusEntry,
  normalizeDwarfFeatureState,
  normalizeDwarfStonecunningStatusEntry
} from "./speciesDwarf";
import {
  getDefaultElfLineageForSpecies,
  getDefaultElfSkillProficiencyForSpecies,
  getDefaultElfSpellcastingAbilityForSpecies,
  getElfAlwaysPreparedSpellIdsForCharacter,
  getElfAlwaysPreparedSpellSourceMapForCharacter,
  getElfDerivedStatusEntriesForCharacter,
  getElfGrantedCantripEntriesForCharacter,
  getElfLineageOptionsForSpecies,
  getElfSkillProficiencyOptionsForSpecies,
  getElfSpeedBonusesForCharacter,
  getElfSpellcastingAbilityForCharacter,
  getElfSpellcastingAbilityOptionsForSpecies,
  formatElfLineageOptionLabel as formatElfLineageSummaryLabel,
  normalizeElfLineage,
  normalizeElfSkillProficiency,
  normalizeElfSpellcastingAbility
} from "./speciesElf";
import {
  getDefaultGnomeLineageForSpecies,
  getDefaultGnomeSpellcastingAbilityForSpecies,
  getGnomeAlwaysPreparedSpellIdsForCharacter,
  getGnomeAlwaysPreparedSpellSourceMapForCharacter,
  getGnomeDerivedStatusEntriesForCharacter,
  getGnomeGrantedCantripEntriesForCharacter,
  getGnomeLineageOptionsForSpecies,
  getGnomeSpellEntryForCharacter,
  getGnomeSpellcastingAbilityForCharacter,
  getGnomeSpellcastingAbilityOptionsForSpecies,
  formatGnomeLineageOptionLabel as formatGnomeLineageSummaryLabel,
  isGnomeSpecies,
  normalizeGnomeFeatureState,
  normalizeGnomeLineage,
  normalizeGnomeSpellcastingAbility
} from "./speciesGnome";
import {
  getDefaultGoliathGiantAncestryForSpecies,
  getGoliathActionsForCharacter,
  getGoliathBodySizeOverrideForCharacter,
  getGoliathDerivedStatusEntriesForCharacter,
  getGoliathGiantAncestryForCharacter,
  getGoliathGiantAncestryOptionsForSpecies,
  getGoliathSpeedBonusesForCharacter,
  formatGoliathGiantAncestryOptionLabel as formatGoliathGiantAncestrySummaryLabel,
  isGoliathLargeFormStatusEntry,
  isGoliathSpecies,
  normalizeGoliathFeatureState,
  normalizeGoliathGiantAncestry,
  normalizeGoliathLargeFormStatusEntry
} from "./speciesGoliath";
import { getHalflingDerivedStatusEntriesForCharacter } from "./speciesHalfling";
import {
  formatHumanOriginFeatOptionLabel as formatHumanOriginFeatSummaryLabel,
  getDefaultHumanOriginFeatForSpecies,
  getDefaultHumanSkillProficiencyForSpecies,
  getHumanOriginFeatForCharacter,
  getHumanOriginFeatOptionsForSpecies,
  getHumanSkillOptionsForSpecies,
  normalizeHumanOriginFeat,
  normalizeHumanSkillProficiency
} from "./speciesHuman";
import {
  getOrcCommonActionForCharacter,
  getOrcDerivedStatusEntriesForCharacter,
  isOrcSpecies,
  normalizeOrcFeatureState
} from "./speciesOrc";
import {
  formatTieflingFiendishLegacyOptionLabel as formatTieflingFiendishLegacySummaryLabel,
  getDefaultTieflingFiendishLegacyForSpecies,
  getDefaultTieflingSpellcastingAbilityForSpecies,
  getTieflingAlwaysPreparedSpellIdsForCharacter,
  getTieflingAlwaysPreparedSpellSourceMapForCharacter,
  getTieflingDerivedStatusEntriesForCharacter,
  getTieflingFiendishLegacyForCharacter,
  getTieflingFiendishLegacyOptionsForSpecies,
  getTieflingGrantedCantripEntriesForCharacter,
  getTieflingSpellcastingAbilityForCharacter,
  getTieflingSpellcastingAbilityOptionsForSpecies,
  isTieflingSpecies,
  normalizeTieflingFeatureState,
  normalizeTieflingFiendishLegacy,
  normalizeTieflingSpellcastingAbility
} from "./speciesTiefling";

export {
  activateDragonbornDraconicFlightForCharacter,
  formatDragonbornDraconicAncestryOptionLabel,
  getDragonbornBreathWeaponDamageFormula,
  getDragonbornBreathWeaponDamageTypeLabelForCharacter,
  getDragonbornBreathWeaponUsesTotal,
  getDragonbornDraconicAncestryOptionsForSpecies,
  getDragonbornDraconicFlightUsesTotal,
  restoreDragonbornBreathWeaponOnLongRest,
  restoreDragonbornDraconicFlightOnLongRest,
  spendDragonbornBreathWeaponForCharacter
} from "./speciesDragonborn";
export {
  activateDwarfStonecunningForCharacter,
  getDwarfStonecunningUsesTotal,
  restoreDwarfStonecunningOnLongRest
} from "./speciesDwarf";
export {
  formatElfLineageOptionLabel,
  getElfLineageOptionsForSpecies,
  getElfSkillProficiencyOptionsForSpecies,
  getElfSpellcastingAbilityOptionsForSpecies
} from "./speciesElf";
export {
  consumeGnomeSpeakWithAnimalsFreeCastForCharacter,
  formatGnomeLineageOptionLabel,
  getGnomeLineageOptionsForSpecies,
  getGnomeSpeakWithAnimalsFreeCastStateForCharacter,
  getGnomeSpeakWithAnimalsUsesTotal,
  getGnomeSpellcastingAbilityOptionsForSpecies,
  restoreGnomeSpeakWithAnimalsOnLongRest
} from "./speciesGnome";
export {
  activateGoliathLargeFormForCharacter,
  appendGoliathAttackDescriptionAddition,
  consumeGoliathGiantAncestryUseForCharacter,
  formatGoliathGiantAncestryOptionLabel,
  getGoliathAttackDamageDetail,
  getGoliathAttackOptionStateForCharacter,
  getGoliathGiantAncestryOptionsForSpecies,
  getGoliathGiantAncestryUsesTotal,
  getGoliathLargeFormUsesTotal,
  getGoliathStoneEnduranceDamageReductionFormula,
  getGoliathStoneEnduranceDamageReductionFormulaDisplay,
  getGoliathStormThunderDamageFormula,
  restoreGoliathGiantAncestryOnLongRest,
  restoreGoliathLargeFormOnLongRest
} from "./speciesGoliath";
export {
  formatHumanOriginFeatOptionLabel,
  getHumanOriginFeatOptionsForSpecies,
  getHumanResourcefulDescriptionEntriesForCharacter,
  getHumanSkillOptionsForSpecies,
  isHumanSpecies,
  reconcileHumanOriginFeatEntries,
  restoreHumanResourcefulHeroicInspirationOnLongRest
} from "./speciesHuman";
export {
  applyOrcAdrenalineRushForCharacter,
  getOrcAdrenalineRushUsesRemaining,
  getOrcAdrenalineRushUsesTotal,
  hasOrcAdrenalineRushCommonActionBonusPath,
  isOrcSpecies,
  restoreOrcAdrenalineRushOnLongRest
} from "./speciesOrc";
export {
  consumeTieflingFiendishLegacyFreeCastForCharacter,
  formatTieflingFiendishLegacyOptionLabel,
  getTieflingFiendishLegacyFreeCastStateForCharacter,
  getTieflingFiendishLegacyOptionsForSpecies,
  getTieflingFiendishLegacyUsesTotal,
  getTieflingSpellcastingAbilityOptionsForSpecies,
  restoreTieflingFiendishLegacyOnLongRest
} from "./speciesTiefling";

type SpeciesRuntimeCharacter = Pick<Character, "species"> &
  Partial<Pick<Character, "speciesChoices" | "statusEntries">>;
type SpeciesFeatureRuntimeCharacter = Pick<Character, "species" | "level"> &
  Partial<Pick<Character, "speciesFeatureState" | "statusEntries">>;

export type SpeciesSpeedDetails = {
  speed: number;
  source: string;
};

export type SpeciesChoiceSummaryItem = {
  label: string;
  value: string;
};

export type AasimarHealingHandsTarget = "self" | "other";
export type AasimarCelestialRevelationOptionKey =
  | "heavenly-wings"
  | "inner-radiance"
  | "necrotic-shroud";

export type AasimarCelestialRevelationOption = {
  key: AasimarCelestialRevelationOptionKey;
  name: string;
  description: string;
};

const fallbackWalkSpeed = 30;
const aasimarSpeciesId = "species-aasimar-2024";
const aasimarLightCantripId = "spell-light";
const celestialRevelationDurationRounds = 10;
const celestialRevelationStatusSourceIdPrefix = "species-aasimar-celestial-revelation";
const aasimarHealingHandsUsesTotal = 1;
const aasimarCelestialRevelationUsesTotal = 1;
const bodySizeValues = new Set<BODY_SIZE>(Object.values(BODY_SIZE));

export const aasimarHealingHandsActionKey = "species-aasimar-healing-hands";
export const aasimarCelestialRevelationActionKey = "species-aasimar-celestial-revelation";
const aasimarCelestialRevelationOptionDetails: Array<
  Omit<AasimarCelestialRevelationOption, "description"> & {
    fallbackDescription: string;
  }
> = [
  {
    key: "heavenly-wings",
    name: "Heavenly Wings",
    fallbackDescription:
      "Two spectral wings sprout from your back temporarily. Until the transformation ends, you have a Fly Speed equal to your Speed."
  },
  {
    key: "inner-radiance",
    name: "Inner Radiance",
    fallbackDescription:
      "Searing light temporarily radiates from your eyes and mouth. For the duration, you shed Bright Light in a 10-foot radius and Dim Light for an additional 10 feet, and at the end of each of your turns, each creature within 10 feet of you takes Radiant damage equal to your Proficiency Bonus."
  },
  {
    key: "necrotic-shroud",
    name: "Necrotic Shroud",
    fallbackDescription:
      "Your eyes briefly become pools of darkness, and flightless wings sprout from your back temporarily. Creatures other than your allies within 10 feet of you must succeed on a Charisma saving throw (DC 8 plus your Charisma modifier and Proficiency Bonus) or have the Frightened condition until the end of your next turn."
  }
];

const bodySizeLabels: Record<BODY_SIZE, string> = {
  [BODY_SIZE.TINY]: "Tiny",
  [BODY_SIZE.SMALL]: "Small",
  [BODY_SIZE.MEDIUM]: "Medium",
  [BODY_SIZE.LARGE]: "Large",
  [BODY_SIZE.HUGE]: "Huge",
  [BODY_SIZE.GARGANTUAN]: "Gargantuan"
};

function isBodySize(value: unknown): value is BODY_SIZE {
  return typeof value === "string" && bodySizeValues.has(value as BODY_SIZE);
}

function getSpeciesEntry(species: string): SpeciesEntry | null {
  return getSpeciesEntryByName(species.trim());
}

function getSpeciesDescriptionSection(entry: SpeciesEntry, heading: string): string[] {
  const description = entry.description.filter(
    (descriptionEntry): descriptionEntry is string => typeof descriptionEntry === "string"
  );
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

function getSpeciesDescriptionText(entry: SpeciesEntry, heading: string, fallback: string): string {
  const section = getSpeciesDescriptionSection(entry, heading);
  return section.length > 0 ? section.join("\n") : fallback;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripDescriptionMarkup(value: string): string {
  return value
    .replace(/<strong>(.*?)<\/strong>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getSpeciesDescriptionPlainText(
  entry: SpeciesEntry,
  heading: string,
  fallback: string
): string {
  const text = stripDescriptionMarkup(getSpeciesDescriptionText(entry, heading, fallback));
  return text.replace(new RegExp(`^${escapeRegExp(heading)}\\.\\s*`, "i"), "").trim();
}

function getAasimarEntry(): SpeciesEntry | null {
  const entry = getSpeciesEntry("Aasimar");

  return entry?.id === aasimarSpeciesId ? entry : null;
}

function isAasimarSpecies(species: string): boolean {
  return getSpeciesEntry(species)?.id === aasimarSpeciesId;
}

function getSpeciesProficiencyBonus(level: number): number {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));
  return Math.floor((normalizedLevel - 1) / 4) + 2;
}

function getAasimarFeatureState(
  character: Partial<Pick<Character, "speciesFeatureState">>
): CharacterAasimarFeatureState {
  return character.speciesFeatureState?.aasimar ?? {};
}

function normalizeAasimarFeatureState(value: unknown): CharacterAasimarFeatureState {
  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : {};

  return {
    healingHandsExpended: record.healingHandsExpended === true,
    celestialRevelationExpended: record.celestialRevelationExpended === true
  };
}

function normalizeDragonbornSpeciesFeatureState(value: unknown): CharacterDragonbornFeatureState {
  return normalizeDragonbornFeatureState(value);
}

function normalizeDwarfSpeciesFeatureState(value: unknown): CharacterDwarfFeatureState {
  return normalizeDwarfFeatureState(value);
}

function normalizeGnomeSpeciesFeatureState(value: unknown): CharacterGnomeFeatureState {
  return normalizeGnomeFeatureState(value);
}

function normalizeGoliathSpeciesFeatureState(value: unknown): CharacterGoliathFeatureState {
  return normalizeGoliathFeatureState(value);
}

function normalizeOrcSpeciesFeatureState(value: unknown): CharacterOrcFeatureState {
  return normalizeOrcFeatureState(value);
}

function normalizeTieflingSpeciesFeatureState(value: unknown): CharacterTieflingFeatureState {
  return normalizeTieflingFeatureState(value);
}

function getAasimarCelestialRevelationStatusSourceId(
  optionKey: AasimarCelestialRevelationOptionKey
): string {
  return `${celestialRevelationStatusSourceIdPrefix}-${optionKey}`;
}

function getAasimarCelestialRevelationStatusOptionKey(
  entry: Pick<CharacterStatusEntry, "sourceId">
): AasimarCelestialRevelationOptionKey | null {
  if (typeof entry.sourceId !== "string") {
    return null;
  }

  return (
    aasimarCelestialRevelationOptionDetails.find(
      (option) => entry.sourceId === getAasimarCelestialRevelationStatusSourceId(option.key)
    )?.key ?? null
  );
}

function getAasimarCelestialRevelationOption(
  optionKey: AasimarCelestialRevelationOptionKey
): AasimarCelestialRevelationOption | null {
  return getAasimarCelestialRevelationOptions().find((option) => option.key === optionKey) ?? null;
}

function formatAasimarCelestialRevelationStatusDescription(
  option: AasimarCelestialRevelationOption
): string {
  return `${option.name}. ${option.description}`;
}

export function getAasimarCelestialRevelationStatusOption(
  entry: Pick<CharacterStatusEntry, "sourceId">
): AasimarCelestialRevelationOption | null {
  const optionKey = getAasimarCelestialRevelationStatusOptionKey(entry);

  return optionKey ? getAasimarCelestialRevelationOption(optionKey) : null;
}

function isAasimarCelestialRevelationStatusEntry(
  entry: Pick<CharacterStatusEntry, "sourceId">
): boolean {
  return (
    typeof entry.sourceId === "string" &&
    entry.sourceId.startsWith(celestialRevelationStatusSourceIdPrefix)
  );
}

function normalizeAasimarCelestialRevelationStatusEntry(
  entry: CharacterStatusEntry
): CharacterStatusEntry {
  const option = getAasimarCelestialRevelationStatusOption(entry);

  if (!option) {
    return entry;
  }

  return {
    ...entry,
    value: option.name,
    source: "Celestial Revelation",
    sourceType: STATUS_ENTRY_SOURCE_TYPE.SPECIES,
    description: formatAasimarCelestialRevelationStatusDescription(option)
  };
}

function getAasimarHealingHandsDescription(): string[] {
  const entry = getAasimarEntry();

  return entry
    ? getSpeciesDescriptionSection(entry, "Healing Hands")
    : [
        "As a Magic action, you touch a creature and roll a number of d4s equal to your Proficiency Bonus. The creature regains a number of Hit Points equal to the total rolled. Once you use this trait, you can't use it again until you finish a Long Rest."
      ];
}

function getAasimarCelestialRevelationDescription(): string[] {
  const entry = getAasimarEntry();

  return entry
    ? getSpeciesDescriptionSection(entry, "Celestial Revelation")
    : [
        "When you reach character level 3, you can transform as a Bonus Action using Heavenly Wings, Inner Radiance, or Necrotic Shroud. The transformation lasts for 1 minute or until you end it. Once you transform, you can't do so again until you finish a Long Rest."
      ];
}

export function formatBodySize(bodySize: BODY_SIZE): string {
  return bodySizeLabels[bodySize];
}

export function formatBodySizeOptions(bodySizes: readonly BODY_SIZE[]): string {
  return bodySizes.map(formatBodySize).join(", ");
}

export function getSpeciesBodySizeOptions(species: string): BODY_SIZE[] {
  return [...(getSpeciesEntry(species)?.size ?? [])];
}

export function normalizeCharacterSpeciesChoices(
  species: string,
  value: unknown
): CharacterSpeciesChoices | undefined {
  const bodySizeOptions = getSpeciesBodySizeOptions(species);
  const draconicAncestryOptions = getDragonbornDraconicAncestryOptionsForSpecies(species);
  const elvenLineageOptions = getElfLineageOptionsForSpecies(species);
  const elfSkillProficiencyOptions = getElfSkillProficiencyOptionsForSpecies(species);
  const elfSpellcastingAbilityOptions = getElfSpellcastingAbilityOptionsForSpecies(species);
  const gnomeLineageOptions = getGnomeLineageOptionsForSpecies(species);
  const gnomeSpellcastingAbilityOptions = getGnomeSpellcastingAbilityOptionsForSpecies(species);
  const giantAncestryOptions = getGoliathGiantAncestryOptionsForSpecies(species);
  const humanSkillOptions = getHumanSkillOptionsForSpecies(species);
  const humanOriginFeatOptions = getHumanOriginFeatOptionsForSpecies(species);
  const tieflingLegacyOptions = getTieflingFiendishLegacyOptionsForSpecies(species);
  const tieflingSpellcastingAbilityOptions =
    getTieflingSpellcastingAbilityOptionsForSpecies(species);

  if (
    bodySizeOptions.length === 0 &&
    draconicAncestryOptions.length === 0 &&
    elvenLineageOptions.length === 0 &&
    elfSkillProficiencyOptions.length === 0 &&
    elfSpellcastingAbilityOptions.length === 0 &&
    gnomeLineageOptions.length === 0 &&
    gnomeSpellcastingAbilityOptions.length === 0 &&
    giantAncestryOptions.length === 0 &&
    humanSkillOptions.length === 0 &&
    humanOriginFeatOptions.length === 0 &&
    tieflingLegacyOptions.length === 0 &&
    tieflingSpellcastingAbilityOptions.length === 0
  ) {
    return undefined;
  }

  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const rawBodySize = record.bodySize;
  const draconicAncestry = normalizeDragonbornDraconicAncestry(record.draconicAncestry);
  const elvenLineage = normalizeElfLineage(record.elvenLineage);
  const elvenSkillProficiency = normalizeElfSkillProficiency(record.elvenSkillProficiency);
  const elvenSpellcastingAbility = normalizeElfSpellcastingAbility(
    record.elvenSpellcastingAbility
  );
  const gnomeLineage = normalizeGnomeLineage(record.gnomeLineage);
  const gnomeSpellcastingAbility = normalizeGnomeSpellcastingAbility(
    record.gnomeSpellcastingAbility
  );
  const giantAncestry = normalizeGoliathGiantAncestry(record.giantAncestry);
  const humanSkillProficiency = normalizeHumanSkillProficiency(record.humanSkillProficiency);
  const humanOriginFeat = normalizeHumanOriginFeat(record.humanOriginFeat);
  const tieflingLegacy = normalizeTieflingFiendishLegacy(record.tieflingLegacy);
  const tieflingSpellcastingAbility = normalizeTieflingSpellcastingAbility(
    record.tieflingSpellcastingAbility
  );
  const normalizedChoices: CharacterSpeciesChoices = {};

  if (isBodySize(rawBodySize) && bodySizeOptions.includes(rawBodySize)) {
    normalizedChoices.bodySize = rawBodySize;
  }

  if (!normalizedChoices.bodySize && bodySizeOptions.length === 1) {
    normalizedChoices.bodySize = bodySizeOptions[0]!;
  }

  if (
    draconicAncestry &&
    draconicAncestryOptions.some((option) => option.key === draconicAncestry)
  ) {
    normalizedChoices.draconicAncestry = draconicAncestry;
  }

  if (elvenLineage && elvenLineageOptions.some((option) => option.key === elvenLineage)) {
    normalizedChoices.elvenLineage = elvenLineage;
  }

  if (elvenSkillProficiency && elfSkillProficiencyOptions.includes(elvenSkillProficiency)) {
    normalizedChoices.elvenSkillProficiency = elvenSkillProficiency;
  }

  if (
    elvenSpellcastingAbility &&
    elfSpellcastingAbilityOptions.includes(elvenSpellcastingAbility)
  ) {
    normalizedChoices.elvenSpellcastingAbility = elvenSpellcastingAbility;
  }

  if (gnomeLineage && gnomeLineageOptions.some((option) => option.key === gnomeLineage)) {
    normalizedChoices.gnomeLineage = gnomeLineage;
  }

  if (
    gnomeSpellcastingAbility &&
    gnomeSpellcastingAbilityOptions.includes(gnomeSpellcastingAbility)
  ) {
    normalizedChoices.gnomeSpellcastingAbility = gnomeSpellcastingAbility;
  }

  if (giantAncestry && giantAncestryOptions.some((option) => option.key === giantAncestry)) {
    normalizedChoices.giantAncestry = giantAncestry;
  }

  if (humanSkillProficiency && humanSkillOptions.includes(humanSkillProficiency)) {
    normalizedChoices.humanSkillProficiency = humanSkillProficiency;
  }

  if (humanOriginFeat && humanOriginFeatOptions.some((option) => option.feat === humanOriginFeat)) {
    normalizedChoices.humanOriginFeat = humanOriginFeat;
  }

  if (tieflingLegacy && tieflingLegacyOptions.some((option) => option.key === tieflingLegacy)) {
    normalizedChoices.tieflingLegacy = tieflingLegacy;
  }

  if (
    tieflingSpellcastingAbility &&
    tieflingSpellcastingAbilityOptions.includes(tieflingSpellcastingAbility)
  ) {
    normalizedChoices.tieflingSpellcastingAbility = tieflingSpellcastingAbility;
  }

  return Object.keys(normalizedChoices).length > 0 ? normalizedChoices : undefined;
}

export function createDefaultSpeciesChoicesForSpecies(
  species: string
): CharacterSpeciesChoices | undefined {
  const entry = getSpeciesEntry(species);
  const bodySizeOptions = entry?.size ?? [];
  const recommendedBodySize = entry?.starterPack.recommendedBodySize;
  const bodySize =
    recommendedBodySize && bodySizeOptions.includes(recommendedBodySize)
      ? recommendedBodySize
      : bodySizeOptions[0];
  const draconicAncestry = getDefaultDragonbornDraconicAncestryForSpecies(species);
  const elvenLineage = getDefaultElfLineageForSpecies(species);
  const elvenSkillProficiency = getDefaultElfSkillProficiencyForSpecies(species);
  const elvenSpellcastingAbility = getDefaultElfSpellcastingAbilityForSpecies(species);
  const gnomeLineage = getDefaultGnomeLineageForSpecies(species);
  const gnomeSpellcastingAbility = getDefaultGnomeSpellcastingAbilityForSpecies(species);
  const giantAncestry = getDefaultGoliathGiantAncestryForSpecies(species);
  const humanSkillProficiency = getDefaultHumanSkillProficiencyForSpecies(species);
  const humanOriginFeat = getDefaultHumanOriginFeatForSpecies(species);
  const tieflingLegacy = getDefaultTieflingFiendishLegacyForSpecies(species);
  const tieflingSpellcastingAbility = getDefaultTieflingSpellcastingAbilityForSpecies(species);
  const defaultChoices: CharacterSpeciesChoices = {};

  if (bodySize) {
    defaultChoices.bodySize = bodySize;
  }

  if (draconicAncestry) {
    defaultChoices.draconicAncestry = draconicAncestry;
  }

  if (elvenLineage) {
    defaultChoices.elvenLineage = elvenLineage;
  }

  if (elvenSkillProficiency) {
    defaultChoices.elvenSkillProficiency = elvenSkillProficiency;
  }

  if (elvenSpellcastingAbility) {
    defaultChoices.elvenSpellcastingAbility = elvenSpellcastingAbility;
  }

  if (gnomeLineage) {
    defaultChoices.gnomeLineage = gnomeLineage;
  }

  if (gnomeSpellcastingAbility) {
    defaultChoices.gnomeSpellcastingAbility = gnomeSpellcastingAbility;
  }

  if (giantAncestry) {
    defaultChoices.giantAncestry = giantAncestry;
  }

  if (humanSkillProficiency) {
    defaultChoices.humanSkillProficiency = humanSkillProficiency;
  }

  if (humanOriginFeat) {
    defaultChoices.humanOriginFeat = humanOriginFeat;
  }

  if (tieflingLegacy) {
    defaultChoices.tieflingLegacy = tieflingLegacy;
  }

  if (tieflingSpellcastingAbility) {
    defaultChoices.tieflingSpellcastingAbility = tieflingSpellcastingAbility;
  }

  return Object.keys(defaultChoices).length > 0 ? defaultChoices : undefined;
}

export function getBodySizeForCharacter(character: SpeciesRuntimeCharacter): BODY_SIZE | null {
  const bodySizeOverride = getGoliathBodySizeOverrideForCharacter(character);

  if (bodySizeOverride) {
    return bodySizeOverride;
  }

  return (
    normalizeCharacterSpeciesChoices(character.species, character.speciesChoices)?.bodySize ??
    createDefaultSpeciesChoicesForSpecies(character.species)?.bodySize ??
    null
  );
}

export function getBodySizeLabelForCharacter(character: SpeciesRuntimeCharacter): string {
  const bodySize = getBodySizeForCharacter(character);
  return bodySize ? formatBodySize(bodySize) : "-";
}

export function getSpeciesChoiceSummaryItemsForCharacter(
  character: SpeciesRuntimeCharacter
): SpeciesChoiceSummaryItem[] {
  const choices = normalizeCharacterSpeciesChoices(character.species, character.speciesChoices);
  const items: SpeciesChoiceSummaryItem[] = [];
  const bodySize = getBodySizeForCharacter({
    species: character.species,
    speciesChoices: choices
  });
  const bodySizeOptions = getSpeciesBodySizeOptions(character.species);

  if (bodySizeOptions.length > 0) {
    items.push({
      label: "Size",
      value: bodySize ? formatBodySize(bodySize) : "Not selected"
    });
  }

  const draconicAncestry = getDragonbornDraconicAncestryForCharacter({
    species: character.species,
    speciesChoices: choices
  });

  if (getDragonbornDraconicAncestryOptionsForSpecies(character.species).length > 0) {
    items.push({
      label: "Draconic Ancestry",
      value: draconicAncestry
        ? formatDragonbornDraconicAncestrySummaryLabel(draconicAncestry)
        : "Not selected"
    });
  }

  const elfLineageOptions = getElfLineageOptionsForSpecies(character.species);

  if (elfLineageOptions.length > 0) {
    const lineage =
      elfLineageOptions.find((option) => option.key === choices?.elvenLineage) ?? null;

    items.push({
      label: "Elven Lineage",
      value: lineage ? formatElfLineageSummaryLabel(lineage) : "Not selected"
    });
  }

  if (getElfSkillProficiencyOptionsForSpecies(character.species).length > 0) {
    items.push({
      label: "Keen Senses",
      value: choices?.elvenSkillProficiency ?? "Not selected"
    });
  }

  if (getElfSpellcastingAbilityOptionsForSpecies(character.species).length > 0) {
    items.push({
      label: "Elven Spellcasting",
      value: choices?.elvenSpellcastingAbility ?? "Not selected"
    });
  }

  const gnomeLineageOptions = getGnomeLineageOptionsForSpecies(character.species);

  if (gnomeLineageOptions.length > 0) {
    const lineage =
      gnomeLineageOptions.find((option) => option.key === choices?.gnomeLineage) ?? null;

    items.push({
      label: "Gnomish Lineage",
      value: lineage ? formatGnomeLineageSummaryLabel(lineage) : "Not selected"
    });
  }

  if (getGnomeSpellcastingAbilityOptionsForSpecies(character.species).length > 0) {
    items.push({
      label: "Gnome Spellcasting",
      value: choices?.gnomeSpellcastingAbility ?? "Not selected"
    });
  }

  const giantAncestryOptions = getGoliathGiantAncestryOptionsForSpecies(character.species);

  if (giantAncestryOptions.length > 0) {
    const ancestry = getGoliathGiantAncestryForCharacter({
      species: character.species,
      speciesChoices: choices
    });

    items.push({
      label: "Giant Ancestry",
      value: ancestry ? formatGoliathGiantAncestrySummaryLabel(ancestry) : "Not selected"
    });
  }

  if (getHumanSkillOptionsForSpecies(character.species).length > 0) {
    items.push({
      label: "Skillful",
      value: choices?.humanSkillProficiency ?? "Not selected"
    });
  }

  const humanOriginFeatOptions = getHumanOriginFeatOptionsForSpecies(character.species);

  if (humanOriginFeatOptions.length > 0) {
    const originFeat = getHumanOriginFeatForCharacter({
      species: character.species,
      speciesChoices: choices
    });
    const originFeatOption =
      humanOriginFeatOptions.find((option) => option.feat === originFeat) ?? null;

    items.push({
      label: "Origin Feat",
      value: originFeatOption ? formatHumanOriginFeatSummaryLabel(originFeatOption) : "Not selected"
    });
  }

  const tieflingLegacyOptions = getTieflingFiendishLegacyOptionsForSpecies(character.species);

  if (tieflingLegacyOptions.length > 0) {
    const legacy = getTieflingFiendishLegacyForCharacter({
      species: character.species,
      speciesChoices: choices
    });
    const legacyOption = tieflingLegacyOptions.find((option) => option.key === legacy) ?? null;

    items.push({
      label: "Fiendish Legacy",
      value: legacyOption ? formatTieflingFiendishLegacySummaryLabel(legacyOption) : "Not selected"
    });
  }

  if (getTieflingSpellcastingAbilityOptionsForSpecies(character.species).length > 0) {
    items.push({
      label: "Legacy Spellcasting",
      value: choices?.tieflingSpellcastingAbility ?? "Not selected"
    });
  }

  return items;
}

export function getSpeciesSpeedDetailsForCharacter(
  character: Pick<Character, "species">
): SpeciesSpeedDetails {
  const entry = getSpeciesEntry(character.species);

  return {
    speed: entry?.speed ?? fallbackWalkSpeed,
    source: entry?.name ?? "Base"
  };
}

export function getSpeciesSpeedForCharacter(character: Pick<Character, "species">): number {
  return getSpeciesSpeedDetailsForCharacter(character).speed;
}

export function normalizeCharacterSpeciesFeatureState(
  species: string,
  value: unknown
): CharacterSpeciesFeatureState {
  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : {};

  if (isAasimarSpecies(species)) {
    return {
      aasimar: normalizeAasimarFeatureState(record.aasimar)
    };
  }

  if (isDragonbornSpecies(species)) {
    return {
      dragonborn: normalizeDragonbornSpeciesFeatureState(record.dragonborn)
    };
  }

  if (isDwarfSpecies(species)) {
    return {
      dwarf: normalizeDwarfSpeciesFeatureState(record.dwarf)
    };
  }

  if (isGnomeSpecies(species)) {
    return {
      gnome: normalizeGnomeSpeciesFeatureState(record.gnome)
    };
  }

  if (isGoliathSpecies(species)) {
    return {
      goliath: normalizeGoliathSpeciesFeatureState(record.goliath)
    };
  }

  if (isOrcSpecies(species)) {
    return {
      orc: normalizeOrcSpeciesFeatureState(record.orc)
    };
  }

  if (isTieflingSpecies(species)) {
    return {
      tiefling: normalizeTieflingSpeciesFeatureState(record.tiefling)
    };
  }

  return {};
}

export function normalizeSpeciesStatusEntriesForCharacter(
  character: Pick<Character, "species" | "level"> & Partial<Pick<Character, "statusEntries">>
): CharacterStatusEntry[] {
  let statusEntries = normalizeCharacterStatusEntries(character.statusEntries);

  if (isAasimarSpecies(character.species) && character.level >= 3) {
    statusEntries = statusEntries.map((entry) =>
      isAasimarCelestialRevelationStatusEntry(entry)
        ? normalizeAasimarCelestialRevelationStatusEntry(entry)
        : entry
    );
  } else {
    statusEntries = statusEntries.filter(
      (entry) => !isAasimarCelestialRevelationStatusEntry(entry)
    );
  }

  if (isDragonbornSpecies(character.species) && character.level >= 5) {
    statusEntries = statusEntries.map((entry) =>
      isDragonbornDraconicFlightStatusEntry(entry)
        ? normalizeDragonbornDraconicFlightStatusEntry(entry)
        : entry
    );
  } else {
    statusEntries = statusEntries.filter((entry) => !isDragonbornDraconicFlightStatusEntry(entry));
  }

  if (isDwarfSpecies(character.species)) {
    statusEntries = statusEntries.map((entry) =>
      isDwarfStonecunningStatusEntry(entry) ? normalizeDwarfStonecunningStatusEntry(entry) : entry
    );
  } else {
    statusEntries = statusEntries.filter((entry) => !isDwarfStonecunningStatusEntry(entry));
  }

  if (isGoliathSpecies(character.species) && character.level >= 5) {
    statusEntries = statusEntries.map((entry) =>
      isGoliathLargeFormStatusEntry(entry) ? normalizeGoliathLargeFormStatusEntry(entry) : entry
    );
  } else {
    statusEntries = statusEntries.filter((entry) => !isGoliathLargeFormStatusEntry(entry));
  }

  return statusEntries;
}

export function getAasimarHealingHandsFormula(character: Pick<Character, "level">): string {
  return `${getSpeciesProficiencyBonus(character.level)}d4`;
}

function getAasimarHealingHandsFormulaFact(character: Pick<Character, "level">): FeatureActionFact {
  const proficiencyBonus = getSpeciesProficiencyBonus(character.level);
  const formula = getAasimarHealingHandsFormula(character);
  const formulaCell = formatFormulaCell({
    formula,
    resultLabel: "Healing"
  });

  return {
    label: "Healing Formula",
    value: formulaCell.value,
    breakdown: formatFormulaBreakdown([`${proficiencyBonus} Prof. Bonus d4s`]),
    fullWidth: true
  };
}

export function getAasimarHealingHandsUsesTotal(
  character: Partial<Pick<Character, "species">>
): number {
  return character.species && isAasimarSpecies(character.species)
    ? aasimarHealingHandsUsesTotal
    : 0;
}

export function getAasimarHealingHandsUsesRemaining(
  character: Partial<Pick<Character, "species" | "speciesFeatureState">>
): number {
  const total = getAasimarHealingHandsUsesTotal(character);

  if (total <= 0) {
    return 0;
  }

  return getAasimarFeatureState(character).healingHandsExpended === true ? 0 : total;
}

export function spendAasimarHealingHandsForCharacter(character: Character): Character {
  if (getAasimarHealingHandsUsesRemaining(character) <= 0) {
    return character;
  }

  return {
    ...character,
    speciesFeatureState: {
      ...character.speciesFeatureState,
      aasimar: {
        ...getAasimarFeatureState(character),
        healingHandsExpended: true
      }
    }
  };
}

export function restoreAasimarHealingHandsOnLongRest(character: Character): Character {
  if (getAasimarHealingHandsUsesTotal(character) <= 0) {
    return character;
  }

  const aasimarState = getAasimarFeatureState(character);

  if (aasimarState.healingHandsExpended !== true) {
    return character;
  }

  return {
    ...character,
    speciesFeatureState: {
      ...character.speciesFeatureState,
      aasimar: {
        ...aasimarState,
        healingHandsExpended: false
      }
    }
  };
}

export function getAasimarCelestialRevelationUsesTotal(
  character: Partial<Pick<Character, "species" | "level">>
): number {
  return character.species && isAasimarSpecies(character.species) && (character.level ?? 1) >= 3
    ? aasimarCelestialRevelationUsesTotal
    : 0;
}

export function hasActiveAasimarCelestialRevelation(
  character: Partial<Pick<Character, "statusEntries">>
): boolean {
  return normalizeCharacterStatusEntries(character.statusEntries).some(
    isAasimarCelestialRevelationStatusEntry
  );
}

export function getAasimarCelestialRevelationUsesRemaining(
  character: Partial<Pick<Character, "species" | "level" | "speciesFeatureState">>
): number {
  const total = getAasimarCelestialRevelationUsesTotal(character);

  if (total <= 0) {
    return 0;
  }

  return getAasimarFeatureState(character).celestialRevelationExpended === true ? 0 : total;
}

export function restoreAasimarCelestialRevelationOnLongRest(character: Character): Character {
  if (getAasimarCelestialRevelationUsesTotal(character) <= 0) {
    return character;
  }

  const aasimarState = getAasimarFeatureState(character);

  if (aasimarState.celestialRevelationExpended !== true) {
    return character;
  }

  return {
    ...character,
    speciesFeatureState: {
      ...character.speciesFeatureState,
      aasimar: {
        ...aasimarState,
        celestialRevelationExpended: false
      }
    }
  };
}

export function activateAasimarCelestialRevelationForCharacter(
  character: Character,
  optionKey: AasimarCelestialRevelationOptionKey
): Character {
  const option = getAasimarCelestialRevelationOption(optionKey);

  if (!option || getAasimarCelestialRevelationUsesRemaining(character) <= 0) {
    return character;
  }

  const description = formatAasimarCelestialRevelationStatusDescription(option);
  const aasimarState = getAasimarFeatureState(character);

  return {
    ...character,
    speciesFeatureState: {
      ...character.speciesFeatureState,
      aasimar: {
        ...aasimarState,
        celestialRevelationExpended: true
      }
    },
    statusEntries: [
      ...normalizeCharacterStatusEntries(character.statusEntries).filter(
        (entry) => !isAasimarCelestialRevelationStatusEntry(entry)
      ),
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: option.name,
        source: "Celestial Revelation",
        sourceType: STATUS_ENTRY_SOURCE_TYPE.SPECIES,
        duration: {
          kind: STATUS_DURATION_KIND.ROUNDS,
          amount: celestialRevelationDurationRounds,
          tickOn: STATUS_DURATION_ROUND_TICK.ROUND_END
        },
        sourceId: getAasimarCelestialRevelationStatusSourceId(option.key),
        description
      })
    ]
  };
}

function getAasimarHealingHandsAction(
  character: SpeciesFeatureRuntimeCharacter
): FeatureActionCard {
  const total = getAasimarHealingHandsUsesTotal(character);
  const remaining = getAasimarHealingHandsUsesRemaining(character);
  const description = getAasimarHealingHandsDescription();
  const disabledReason =
    remaining <= 0 ? "Healing Hands recharges when you finish a Long Rest." : undefined;

  return {
    key: aasimarHealingHandsActionKey,
    name: "Healing Hands",
    summary: "Touch a creature and roll d4s equal to your Proficiency Bonus.",
    detail: "The creature regains Hit Points equal to the total rolled.",
    breakdown: "Roll healing d4s",
    economyType: ECONOMY_TYPE.ACTION,
    actionCategory: ACTION_CATEGORY.MAGIC,
    usesRemaining: remaining,
    usesTotal: total,
    cardUsage: createChargesCardUsage(remaining, total),
    disabled: remaining <= 0,
    disabledReason,
    description,
    facts: [getAasimarHealingHandsFormulaFact(character)],
    drawer: {
      kind: "custom-form",
      formKind: "aasimar-healing-hands",
      eyebrow: "Aasimar Trait",
      description,
      factsSectionTitle: null
    },
    execute: {
      kind: "custom-form",
      formKind: "aasimar-healing-hands"
    }
  };
}

function getAasimarCelestialRevelationAction(
  character: SpeciesFeatureRuntimeCharacter
): FeatureActionCard {
  const total = getAasimarCelestialRevelationUsesTotal(character);
  const remaining = getAasimarCelestialRevelationUsesRemaining(character);
  const isActive = hasActiveAasimarCelestialRevelation(character);
  const description = getAasimarCelestialRevelationDescription();
  const disabledReason = isActive
    ? "Celestial Revelation is already active."
    : remaining <= 0
      ? "Celestial Revelation recharges when you finish a Long Rest."
      : undefined;

  return {
    key: aasimarCelestialRevelationActionKey,
    name: "Celestial Revelation",
    summary: "Transform with celestial power for 10 turns.",
    detail: "Choose Heavenly Wings, Inner Radiance, or Necrotic Shroud.",
    breakdown: isActive ? "Revelation is active" : "Choose celestial transformation",
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
      kind: "custom-form",
      formKind: "aasimar-celestial-revelation",
      eyebrow: "Aasimar Trait",
      description
    },
    execute: {
      kind: "custom-form",
      formKind: "aasimar-celestial-revelation"
    }
  };
}

export function getAasimarCelestialRevelationOptions(): AasimarCelestialRevelationOption[] {
  const entry = getAasimarEntry();

  return aasimarCelestialRevelationOptionDetails.map(({ fallbackDescription, ...option }) => ({
    ...option,
    description: entry
      ? getSpeciesDescriptionPlainText(entry, option.name, fallbackDescription)
      : fallbackDescription
  }));
}

export function getSpeciesActionsForCharacter(character: Character): FeatureActionCard[] {
  if (isAasimarSpecies(character.species)) {
    return [
      getAasimarHealingHandsAction(character),
      ...(character.level >= 3 ? [getAasimarCelestialRevelationAction(character)] : [])
    ];
  }

  return [
    ...getDragonbornActionsForCharacter(character),
    ...getDwarfActionsForCharacter(character),
    ...getGoliathActionsForCharacter(character)
  ];
}

export function transformSpeciesCommonActionForCharacter(
  character: Pick<Character, "species" | "level"> & Partial<Pick<Character, "speciesFeatureState">>,
  action: FeatureActionCard
): FeatureActionCard {
  return getOrcCommonActionForCharacter(character, action);
}

export function getSpeciesGrantedCantripEntriesForCharacter(
  character: Pick<Character, "species"> & Partial<Pick<Character, "speciesChoices">>
): SpellEntry[] {
  const grantedCantrips: SpellEntry[] = [];

  if (isAasimarSpecies(character.species)) {
    const light = getSpellEntryById(aasimarLightCantripId);

    if (light) {
      grantedCantrips.push(light);
    }
  }

  grantedCantrips.push(...getElfGrantedCantripEntriesForCharacter(character));
  grantedCantrips.push(...getGnomeGrantedCantripEntriesForCharacter(character));
  grantedCantrips.push(...getTieflingGrantedCantripEntriesForCharacter(character));

  return grantedCantrips;
}

export function getSpeciesAlwaysPreparedCantripEntriesForCharacter(
  character: Pick<Character, "species"> & Partial<Pick<Character, "speciesChoices">>
): SpellEntry[] {
  return getSpeciesGrantedCantripEntriesForCharacter(character);
}

export function getSpeciesAlwaysPreparedSpellIdsForCharacter(
  character: Pick<Character, "species"> & Partial<Pick<Character, "level" | "speciesChoices">>
): string[] {
  return [
    ...getElfAlwaysPreparedSpellIdsForCharacter(character),
    ...getGnomeAlwaysPreparedSpellIdsForCharacter(character),
    ...getTieflingAlwaysPreparedSpellIdsForCharacter(character)
  ];
}

export function getSpeciesAlwaysPreparedSpellSourceMapForCharacter(
  character: Pick<Character, "species"> & Partial<Pick<Character, "level" | "speciesChoices">>
): SpellSourceMap {
  const sourceMap: SpellSourceMap = {
    ...getElfAlwaysPreparedSpellSourceMapForCharacter(character),
    ...getGnomeAlwaysPreparedSpellSourceMapForCharacter(character),
    ...getTieflingAlwaysPreparedSpellSourceMapForCharacter(character)
  };

  if (isAasimarSpecies(character.species)) {
    addSpellSource(sourceMap, aasimarLightCantripId, "Aasimar");
  }

  return sourceMap;
}

export function getSpeciesSpellcastingAbilityForCharacter(
  character: Pick<Character, "species"> & Partial<Pick<Character, "speciesChoices">>,
  spellId: string
): AbilityKey | null {
  if (isAasimarSpecies(character.species) && spellId === aasimarLightCantripId) {
    return "CHA";
  }

  const elfSpellcastingAbility = getElfSpellcastingAbilityForCharacter(character, spellId);

  if (elfSpellcastingAbility) {
    return elfSpellcastingAbility;
  }

  const gnomeSpellcastingAbility = getGnomeSpellcastingAbilityForCharacter(character, spellId);

  if (gnomeSpellcastingAbility) {
    return gnomeSpellcastingAbility;
  }

  return getTieflingSpellcastingAbilityForCharacter(character, spellId);
}

export function getSpeciesSpellEntryForCharacter(
  character: Pick<Character, "species"> & Partial<Pick<Character, "speciesChoices">>,
  spell: SpellEntry
): SpellEntry {
  return getGnomeSpellEntryForCharacter(character, spell);
}

export function getSpeciesSpeedBonusesForCharacter(
  character: Pick<Character, "species"> &
    Partial<Pick<Character, "speciesChoices" | "statusEntries">>
): FeatureSpeedBonus[] {
  const hasHeavenlyWingsActive = normalizeCharacterStatusEntries(character.statusEntries).some(
    (entry) => getAasimarCelestialRevelationStatusOptionKey(entry) === "heavenly-wings"
  );
  const aasimarSpeedBonuses =
    isAasimarSpecies(character.species) && hasHeavenlyWingsActive
      ? [
          {
            label: "Heavenly Wings",
            value: 0,
            movementType: "fly" as const,
            setBaseFromWalkMultiplier: 1
          }
        ]
      : [];

  return [
    ...aasimarSpeedBonuses,
    ...getDragonbornSpeedBonusesForCharacter(character),
    ...getElfSpeedBonusesForCharacter(character),
    ...getGoliathSpeedBonusesForCharacter(character)
  ];
}

function createAasimarStatusEntry(
  options: Pick<CharacterStatusEntry, "group" | "value"> &
    Partial<Pick<CharacterStatusEntry, "rangeFeet" | "description">> & {
      sourceId: string;
    }
): CharacterStatusEntry {
  return {
    id: options.sourceId,
    group: options.group,
    value: options.value,
    source: "Aasimar",
    sourceType: STATUS_ENTRY_SOURCE_TYPE.SPECIES,
    duration: {
      kind: STATUS_DURATION_KIND.INFINITE
    },
    sourceId: options.sourceId,
    rangeFeet: options.rangeFeet ?? null,
    description: options.description
  };
}

function getAasimarDerivedStatusEntries(entry: SpeciesEntry): CharacterStatusEntry[] {
  const celestialResistanceDescription = getSpeciesDescriptionText(
    entry,
    "Celestial Resistance",
    "You have Resistance to Necrotic damage and Radiant damage."
  );
  const darkvisionDescription = getSpeciesDescriptionText(
    entry,
    "Darkvision",
    "You have Darkvision with a range of 60 feet."
  );

  return [
    createAasimarStatusEntry({
      group: STATUS_ENTRY_GROUP.RESISTANCES,
      value: DAMAGE_TYPE.NECROTIC,
      sourceId: "species-aasimar-celestial-resistance-necrotic",
      description: celestialResistanceDescription
    }),
    createAasimarStatusEntry({
      group: STATUS_ENTRY_GROUP.RESISTANCES,
      value: DAMAGE_TYPE.RADIANT,
      sourceId: "species-aasimar-celestial-resistance-radiant",
      description: celestialResistanceDescription
    }),
    createAasimarStatusEntry({
      group: STATUS_ENTRY_GROUP.SENSES,
      value: SENSE.DARKVISION,
      sourceId: "species-aasimar-darkvision",
      rangeFeet: 60,
      description: darkvisionDescription
    })
  ];
}

export function getSpeciesDerivedStatusEntriesForCharacter(
  character: Pick<Character, "species"> & Partial<Pick<Character, "speciesChoices">>
): CharacterStatusEntry[] {
  const entry = getSpeciesEntry(character.species);

  if (!entry) {
    return [];
  }

  switch (entry.id) {
    case "species-aasimar-2024":
      return getAasimarDerivedStatusEntries(entry);
    case "species-dragonborn-2024":
      return getDragonbornDerivedStatusEntriesForCharacter(character);
    case "species-dwarf-2024":
      return getDwarfDerivedStatusEntriesForCharacter(character);
    case "species-elf-2024":
      return getElfDerivedStatusEntriesForCharacter(character);
    case "species-gnome-2024":
      return getGnomeDerivedStatusEntriesForCharacter(character);
    case "species-goliath-2024":
      return getGoliathDerivedStatusEntriesForCharacter(character);
    case "species-halfling-2024":
      return getHalflingDerivedStatusEntriesForCharacter(character);
    case "species-orc-2024":
      return getOrcDerivedStatusEntriesForCharacter(character);
    case "species-tiefling-2024":
      return getTieflingDerivedStatusEntriesForCharacter(character);
    default:
      return [];
  }
}
