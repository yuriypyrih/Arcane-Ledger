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
  type CharacterDhampirFeatureState,
  type CharacterDragonbornFeatureState,
  type CharacterDwarfFeatureState,
  type CharacterGenasiFeatureState,
  type CharacterGnomeFeatureState,
  type CharacterGoliathFeatureState,
  type CharacterHexbloodFeatureState,
  type CharacterLupinFeatureState,
  type CharacterOrcFeatureState,
  type CharacterRebornFeatureState,
  type CharacterShifterFeatureState,
  type CharacterSpeciesChoices,
  type CharacterSpeciesFeatureState,
  type CharacterStatusEntry,
  type CharacterTieflingFeatureState
} from "../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "./actionEconomy";
import { createChargesCardUsage } from "./classFeatures/cardUsage";
import type {
  FeatureActionCard,
  FeatureActionFact,
  FeatureArmorClassBonus,
  FeatureSpeedBonus,
  ArmorClassFeatureContext,
  SpellSourceMap
} from "./classFeatures/types";
import {
  applyFeatureSpellCastEffects,
  compileFeatureContributions,
  getFeatureDescriptionAdditions,
  type FeatureContributionSpec,
  type FeatureDescriptionContributionTarget,
  type FeatureSpellActionPathContribution,
  type FeatureSpellCastEffectContext
} from "./featureContributions";
import type { WeaponAction } from "./gameplay";
import { formatFormulaBreakdown, formatFormulaCell } from "./shared/formulas";
import { createCharacterStatusEntry, normalizeCharacterStatusEntries } from "./statusEntries";
import {
  getCharacterSpeciesDisplayName,
  isCustomSpeciesName,
  normalizeCustomSpeciesConfig
} from "./customOrigins";
import { getToolProficiencyLabel } from "./proficiencyOptions";
import {
  getDefaultDragonbornDraconicAncestryForSpecies,
  getDragonbornDraconicAncestryForCharacter,
  getDragonbornDraconicAncestryOptionsForSpecies,
  formatDragonbornDraconicAncestryOptionLabel as formatDragonbornDraconicAncestrySummaryLabel,
  isDragonbornDraconicFlightStatusEntry,
  isDragonbornSpecies,
  normalizeDragonbornDraconicAncestry,
  normalizeDragonbornDraconicFlightStatusEntry,
  normalizeDragonbornFeatureState
} from "./speciesDragonborn";
import {
  activateChangelingFeatureActionForCharacter,
  getChangelingSkillProficienciesForCharacter,
  getChangelingSkillProficiencyOptionsForSpecies,
  isChangelingShapeShifterStatusEntry,
  isChangelingSpecies,
  normalizeChangelingShapeShifterStatusEntry,
  normalizeChangelingSkillProficiencies
} from "./speciesChangeling";
import { isDhampirSpecies, normalizeDhampirFeatureState } from "./speciesDhampir";
import {
  isDwarfSpecies,
  isDwarfStonecunningStatusEntry,
  normalizeDwarfFeatureState,
  normalizeDwarfStonecunningStatusEntry
} from "./speciesDwarf";
import {
  getDefaultElfLineageForSpecies,
  getDefaultElfSkillProficiencyForSpecies,
  getDefaultElfSpellcastingAbilityForSpecies,
  getElfLineageOptionsForSpecies,
  getElfSkillProficiencyOptionsForSpecies,
  getElfSpellcastingAbilityOptionsForSpecies,
  formatElfLineageOptionLabel as formatElfLineageSummaryLabel,
  normalizeElfLineage,
  normalizeElfSkillProficiency,
  normalizeElfSpellcastingAbility
} from "./speciesElf";
import {
  formatGenasiLineageOptionLabel as formatGenasiLineageSummaryLabel,
  getDefaultGenasiLineageForSpecies,
  getDefaultGenasiSpellcastingAbilityForSpecies,
  getGenasiLineageForCharacter,
  getGenasiLineageOptionsForSpecies,
  getGenasiSpellcastingAbilityOptionsForSpecies,
  isGenasiSpecies,
  normalizeGenasiFeatureState,
  normalizeGenasiLineage,
  normalizeGenasiSpellcastingAbility
} from "./speciesGenasi";
import {
  getDefaultGnomeLineageForSpecies,
  getDefaultGnomeSpellcastingAbilityForSpecies,
  getGnomeLineageOptionsForSpecies,
  getGnomeSpellcastingAbilityOptionsForSpecies,
  formatGnomeLineageOptionLabel as formatGnomeLineageSummaryLabel,
  isGnomeSpecies,
  normalizeGnomeFeatureState,
  normalizeGnomeLineage,
  normalizeGnomeSpellcastingAbility
} from "./speciesGnome";
import {
  getDefaultGoliathGiantAncestryForSpecies,
  getGoliathBodySizeOverrideForCharacter,
  getGoliathGiantAncestryForCharacter,
  getGoliathGiantAncestryOptionsForSpecies,
  formatGoliathGiantAncestryOptionLabel as formatGoliathGiantAncestrySummaryLabel,
  isGoliathLargeFormStatusEntry,
  isGoliathSpecies,
  normalizeGoliathFeatureState,
  normalizeGoliathGiantAncestry,
  normalizeGoliathLargeFormStatusEntry
} from "./speciesGoliath";
import {
  activateHexbloodFeatureActionForCharacter,
  getDefaultHexbloodSpellcastingAbilityForSpecies,
  getHexbloodSpellcastingAbilityOptionsForSpecies,
  isHexbloodEerieTokenStatusEntry,
  isHexbloodSpecies,
  normalizeHexbloodEerieTokenStatusEntry,
  normalizeHexbloodFeatureState,
  normalizeHexbloodSpellcastingAbility
} from "./speciesHexblood";
import {
  getKalashtarSkillProficiencyForCharacter,
  getKalashtarSkillProficiencyOptionsForSpecies,
  normalizeKalashtarSkillProficiency
} from "./speciesKalashtar";
import {
  getDefaultKhoravarCantripIdForSpecies,
  getKhoravarCantripForCharacter,
  getKhoravarCantripOptionsForSpecies,
  getKhoravarFeyGiftSummaryLabel,
  getKhoravarProficiencyChoiceValueForCharacter,
  getKhoravarSkillProficiencyForCharacter,
  getKhoravarSkillProficiencyOptionsForSpecies,
  getKhoravarSkillVersatilitySummaryLabel,
  getKhoravarSpellcastingAbilityOptionsForSpecies,
  getKhoravarToolProficiencyForCharacter,
  getKhoravarToolProficiencyOptionsForSpecies,
  normalizeKhoravarCantripId,
  normalizeKhoravarSkillProficiency,
  normalizeKhoravarSpellcastingAbility,
  normalizeKhoravarToolProficiency
} from "./speciesKhoravar";
import {
  activateLupinFeatureActionForCharacter,
  getLupinSkillProficiencyForCharacter,
  getLupinSkillProficiencyOptionsForSpecies,
  isLupinSpecies,
  normalizeLupinFeatureState,
  normalizeLupinSkillProficiency
} from "./speciesLupin";
import {
  activateRebornFeatureActionForCharacter,
  getRebornResistanceForCharacter,
  getRebornResistanceOptionsForSpecies,
  getRebornSkillProficiencyForCharacter,
  getRebornSkillProficiencyOptionsForSpecies,
  isRebornSpecies,
  normalizeRebornFeatureState,
  normalizeRebornResistance,
  normalizeRebornSkillProficiency
} from "./speciesReborn";
import {
  activateShifterFeatureActionOptionForCharacter,
  getShifterSkillProficiencyForCharacter,
  getShifterSkillProficiencyOptionsForSpecies,
  isShifterShiftingStatusEntry,
  isShifterSpecies,
  normalizeShifterFeatureState,
  normalizeShifterShiftingStatusEntry,
  normalizeShifterSkillProficiency
} from "./speciesShifter";
import {
  getWarforgedSkillProficiencyForCharacter,
  getWarforgedSkillProficiencyOptionsForSpecies,
  getWarforgedSpecializedDesignSummaryLabel,
  getWarforgedToolProficiencyForCharacter,
  getWarforgedToolProficiencyOptionsForSpecies,
  normalizeWarforgedSkillProficiency,
  normalizeWarforgedToolProficiency
} from "./speciesWarforged";
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
import { isOrcSpecies, normalizeOrcFeatureState } from "./speciesOrc";
import {
  formatTieflingFiendishLegacyOptionLabel as formatTieflingFiendishLegacySummaryLabel,
  getDefaultTieflingFiendishLegacyForSpecies,
  getDefaultTieflingSpellcastingAbilityForSpecies,
  getTieflingFiendishLegacyForCharacter,
  getTieflingFiendishLegacyOptionsForSpecies,
  getTieflingSpellcastingAbilityOptionsForSpecies,
  isTieflingSpecies,
  normalizeTieflingFeatureState,
  normalizeTieflingFiendishLegacy,
  normalizeTieflingSpellcastingAbility
} from "./speciesTiefling";
import {
  getSpeciesFeatureContributionsForCharacter,
  type SpeciesContributionCharacter
} from "./speciesContributions";

export {
  getChangelingSkillProficiencyOptionsForSpecies,
  isChangelingSpecies,
  normalizeChangelingSkillProficiencies
} from "./speciesChangeling";
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
  applyDhampirVampiricBiteWeaponAction,
  consumeDhampirVampiricBiteUseForCharacter,
  getDhampirVampiricBiteUsesTotal,
  getDhampirVampiricBiteWeaponOptionState,
  restoreDhampirVampiricBiteOnLongRest
} from "./speciesDhampir";
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
  consumeGenasiBladeWardBonusActionUseForCharacter,
  consumeGenasiLineageFreeCastForCharacter,
  formatGenasiLineageOptionLabel,
  getGenasiBladeWardBonusActionUsesRemaining,
  getGenasiBladeWardBonusActionUsesTotal,
  getGenasiLineageFreeCastStateForCharacter,
  getGenasiLineageFreeCastUsesRemaining,
  getGenasiLineageFreeCastUsesTotal,
  getGenasiLineageOptionsForSpecies,
  getGenasiSpellcastingAbilityOptionsForSpecies,
  restoreGenasiBladeWardBonusActionUsesOnLongRest,
  restoreGenasiLineageFreeCastsOnLongRest
} from "./speciesGenasi";
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
  consumeHexbloodHexMagicFreeCastForCharacter,
  getHexbloodEerieTokenUsesTotal,
  getHexbloodHexMagicFreeCastStateForCharacter,
  getHexbloodHexMagicUsesTotal,
  getHexbloodSpellcastingAbilityOptionsForSpecies,
  restoreHexbloodEerieTokenOnLongRest,
  restoreHexbloodHexMagicOnLongRest
} from "./speciesHexblood";
export { getKalashtarSkillProficiencyOptionsForSpecies } from "./speciesKalashtar";
export {
  createKhoravarSkillProficiencyChoiceValue,
  createKhoravarToolProficiencyChoiceValue,
  getKhoravarCantripForCharacter,
  getKhoravarCantripOptionsForSpecies,
  getKhoravarProficiencyChoiceValueForCharacter,
  getKhoravarSkillProficiencyOptionsForSpecies,
  getKhoravarSpellcastingAbilityOptionsForSpecies,
  getKhoravarToolProficiencyOptionsForSpecies,
  parseKhoravarProficiencyChoiceValue
} from "./speciesKhoravar";
export {
  getLupinHowlUsesTotal,
  getLupinSkillProficiencyOptionsForSpecies,
  restoreLupinHowlOnLongRest
} from "./speciesLupin";
export {
  getRebornKnowledgeFromPastLifeUsesTotal,
  getRebornResistanceOptionsForSpecies,
  getRebornSkillProficiencyOptionsForSpecies,
  rebornKnowledgeFromPastLifeActionKey,
  rebornKnowledgeFromPastLifeRollFormula,
  restoreRebornKnowledgeFromPastLifeOnLongRest
} from "./speciesReborn";
export {
  applyShifterBeasthideTemporaryHitPointsRollForCharacter,
  getShifterShiftingUsesTotal,
  getShifterSkillProficiencyOptionsForSpecies,
  hasShifterLongtoothBonusUnarmedStrikeForCharacter,
  restoreShifterShiftingOnLongRest,
  shifterBeasthideOptionKey,
  shifterShiftingActionKey
} from "./speciesShifter";
export {
  getWarforgedLongRestDescriptionAdditionsForCharacter,
  getWarforgedSkillProficiencyOptionsForSpecies,
  getWarforgedToolProficiencyOptionsForSpecies
} from "./speciesWarforged";
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
  Partial<Pick<Character, "customSpecies" | "speciesChoices" | "statusEntries">>;
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
  const description = entry.rulesDescription.filter(
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

function normalizeDhampirSpeciesFeatureState(value: unknown): CharacterDhampirFeatureState {
  return normalizeDhampirFeatureState(value);
}

function normalizeDwarfSpeciesFeatureState(value: unknown): CharacterDwarfFeatureState {
  return normalizeDwarfFeatureState(value);
}

function normalizeGenasiSpeciesFeatureState(value: unknown): CharacterGenasiFeatureState {
  return normalizeGenasiFeatureState(value);
}

function normalizeGnomeSpeciesFeatureState(value: unknown): CharacterGnomeFeatureState {
  return normalizeGnomeFeatureState(value);
}

function normalizeGoliathSpeciesFeatureState(value: unknown): CharacterGoliathFeatureState {
  return normalizeGoliathFeatureState(value);
}

function normalizeHexbloodSpeciesFeatureState(value: unknown): CharacterHexbloodFeatureState {
  return normalizeHexbloodFeatureState(value);
}

function normalizeLupinSpeciesFeatureState(value: unknown): CharacterLupinFeatureState {
  return normalizeLupinFeatureState(value);
}

function normalizeRebornSpeciesFeatureState(value: unknown): CharacterRebornFeatureState {
  return normalizeRebornFeatureState(value);
}

function normalizeShifterSpeciesFeatureState(value: unknown): CharacterShifterFeatureState {
  return normalizeShifterFeatureState(value);
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

function formatDamageTypeLabel(damageType: string): string {
  return damageType.toLowerCase().replace(/(^|\s|-)\S/g, (match) => match.toUpperCase());
}

export function getSpeciesBodySizeOptions(species: string): BODY_SIZE[] {
  return [...(getSpeciesEntry(species)?.size ?? [])];
}

export function normalizeCharacterSpeciesChoices(
  species: string,
  value: unknown
): CharacterSpeciesChoices | undefined {
  const bodySizeOptions = getSpeciesBodySizeOptions(species);
  const changelingSkillProficiencyOptions = getChangelingSkillProficiencyOptionsForSpecies(species);
  const draconicAncestryOptions = getDragonbornDraconicAncestryOptionsForSpecies(species);
  const elvenLineageOptions = getElfLineageOptionsForSpecies(species);
  const elfSkillProficiencyOptions = getElfSkillProficiencyOptionsForSpecies(species);
  const elfSpellcastingAbilityOptions = getElfSpellcastingAbilityOptionsForSpecies(species);
  const genasiLineageOptions = getGenasiLineageOptionsForSpecies(species);
  const genasiSpellcastingAbilityOptions = getGenasiSpellcastingAbilityOptionsForSpecies(species);
  const gnomeLineageOptions = getGnomeLineageOptionsForSpecies(species);
  const gnomeSpellcastingAbilityOptions = getGnomeSpellcastingAbilityOptionsForSpecies(species);
  const giantAncestryOptions = getGoliathGiantAncestryOptionsForSpecies(species);
  const hexbloodSpellcastingAbilityOptions =
    getHexbloodSpellcastingAbilityOptionsForSpecies(species);
  const humanSkillOptions = getHumanSkillOptionsForSpecies(species);
  const humanOriginFeatOptions = getHumanOriginFeatOptionsForSpecies(species);
  const kalashtarSkillProficiencyOptions = getKalashtarSkillProficiencyOptionsForSpecies(species);
  const khoravarCantripOptions = getKhoravarCantripOptionsForSpecies(species);
  const khoravarSkillProficiencyOptions = getKhoravarSkillProficiencyOptionsForSpecies(species);
  const khoravarSpellcastingAbilityOptions =
    getKhoravarSpellcastingAbilityOptionsForSpecies(species);
  const khoravarToolProficiencyOptions = getKhoravarToolProficiencyOptionsForSpecies(species);
  const lupinSkillProficiencyOptions = getLupinSkillProficiencyOptionsForSpecies(species);
  const rebornResistanceOptions = getRebornResistanceOptionsForSpecies(species);
  const rebornSkillProficiencyOptions = getRebornSkillProficiencyOptionsForSpecies(species);
  const shifterSkillProficiencyOptions = getShifterSkillProficiencyOptionsForSpecies(species);
  const warforgedSkillProficiencyOptions = getWarforgedSkillProficiencyOptionsForSpecies(species);
  const warforgedToolProficiencyOptions = getWarforgedToolProficiencyOptionsForSpecies(species);
  const tieflingLegacyOptions = getTieflingFiendishLegacyOptionsForSpecies(species);
  const tieflingSpellcastingAbilityOptions =
    getTieflingSpellcastingAbilityOptionsForSpecies(species);

  if (
    bodySizeOptions.length === 0 &&
    changelingSkillProficiencyOptions.length === 0 &&
    draconicAncestryOptions.length === 0 &&
    elvenLineageOptions.length === 0 &&
    elfSkillProficiencyOptions.length === 0 &&
    elfSpellcastingAbilityOptions.length === 0 &&
    genasiLineageOptions.length === 0 &&
    genasiSpellcastingAbilityOptions.length === 0 &&
    gnomeLineageOptions.length === 0 &&
    gnomeSpellcastingAbilityOptions.length === 0 &&
    giantAncestryOptions.length === 0 &&
    hexbloodSpellcastingAbilityOptions.length === 0 &&
    humanSkillOptions.length === 0 &&
    humanOriginFeatOptions.length === 0 &&
    kalashtarSkillProficiencyOptions.length === 0 &&
    khoravarCantripOptions.length === 0 &&
    khoravarSkillProficiencyOptions.length === 0 &&
    khoravarSpellcastingAbilityOptions.length === 0 &&
    khoravarToolProficiencyOptions.length === 0 &&
    lupinSkillProficiencyOptions.length === 0 &&
    rebornResistanceOptions.length === 0 &&
    rebornSkillProficiencyOptions.length === 0 &&
    shifterSkillProficiencyOptions.length === 0 &&
    warforgedSkillProficiencyOptions.length === 0 &&
    warforgedToolProficiencyOptions.length === 0 &&
    tieflingLegacyOptions.length === 0 &&
    tieflingSpellcastingAbilityOptions.length === 0
  ) {
    return undefined;
  }

  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const rawBodySize = record.bodySize;
  const changelingSkillProficiencies = normalizeChangelingSkillProficiencies(
    record.changelingSkillProficiencies
  );
  const draconicAncestry = normalizeDragonbornDraconicAncestry(record.draconicAncestry);
  const elvenLineage = normalizeElfLineage(record.elvenLineage);
  const elvenSkillProficiency = normalizeElfSkillProficiency(record.elvenSkillProficiency);
  const elvenSpellcastingAbility = normalizeElfSpellcastingAbility(record.elvenSpellcastingAbility);
  const genasiLineage = normalizeGenasiLineage(record.genasiLineage);
  const genasiSpellcastingAbility = normalizeGenasiSpellcastingAbility(
    record.genasiSpellcastingAbility
  );
  const gnomeLineage = normalizeGnomeLineage(record.gnomeLineage);
  const gnomeSpellcastingAbility = normalizeGnomeSpellcastingAbility(
    record.gnomeSpellcastingAbility
  );
  const giantAncestry = normalizeGoliathGiantAncestry(record.giantAncestry);
  const hexbloodSpellcastingAbility = normalizeHexbloodSpellcastingAbility(
    record.hexbloodSpellcastingAbility
  );
  const humanSkillProficiency = normalizeHumanSkillProficiency(record.humanSkillProficiency);
  const humanOriginFeat = normalizeHumanOriginFeat(record.humanOriginFeat);
  const kalashtarSkillProficiency = normalizeKalashtarSkillProficiency(
    record.kalashtarSkillProficiency
  );
  const khoravarCantripId = normalizeKhoravarCantripId(record.khoravarCantripId);
  const khoravarSkillProficiency = normalizeKhoravarSkillProficiency(
    record.khoravarSkillProficiency
  );
  const khoravarSpellcastingAbility = normalizeKhoravarSpellcastingAbility(
    record.khoravarSpellcastingAbility
  );
  const khoravarToolProficiency = normalizeKhoravarToolProficiency(record.khoravarToolProficiency);
  const lupinSkillProficiency = normalizeLupinSkillProficiency(record.lupinSkillProficiency);
  const rebornResistance = normalizeRebornResistance(record.rebornResistance);
  const rebornSkillProficiency = normalizeRebornSkillProficiency(record.rebornSkillProficiency);
  const shifterSkillProficiency = normalizeShifterSkillProficiency(record.shifterSkillProficiency);
  const warforgedSkillProficiency = normalizeWarforgedSkillProficiency(
    record.warforgedSkillProficiency
  );
  const warforgedToolProficiency = normalizeWarforgedToolProficiency(
    record.warforgedToolProficiency
  );
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

  const validChangelingSkillProficiencies = changelingSkillProficiencies.filter((skill) =>
    changelingSkillProficiencyOptions.includes(skill)
  );

  if (validChangelingSkillProficiencies.length > 0) {
    normalizedChoices.changelingSkillProficiencies = validChangelingSkillProficiencies;
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

  if (genasiLineage && genasiLineageOptions.some((option) => option.key === genasiLineage)) {
    normalizedChoices.genasiLineage = genasiLineage;
  }

  if (
    genasiSpellcastingAbility &&
    genasiSpellcastingAbilityOptions.includes(genasiSpellcastingAbility)
  ) {
    normalizedChoices.genasiSpellcastingAbility = genasiSpellcastingAbility;
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

  if (
    hexbloodSpellcastingAbility &&
    hexbloodSpellcastingAbilityOptions.includes(hexbloodSpellcastingAbility)
  ) {
    normalizedChoices.hexbloodSpellcastingAbility = hexbloodSpellcastingAbility;
  }

  if (humanSkillProficiency && humanSkillOptions.includes(humanSkillProficiency)) {
    normalizedChoices.humanSkillProficiency = humanSkillProficiency;
  }

  if (humanOriginFeat && humanOriginFeatOptions.some((option) => option.feat === humanOriginFeat)) {
    normalizedChoices.humanOriginFeat = humanOriginFeat;
  }

  if (
    kalashtarSkillProficiency &&
    kalashtarSkillProficiencyOptions.includes(kalashtarSkillProficiency)
  ) {
    normalizedChoices.kalashtarSkillProficiency = kalashtarSkillProficiency;
  }

  if (khoravarCantripId && khoravarCantripOptions.some((spell) => spell.id === khoravarCantripId)) {
    normalizedChoices.khoravarCantripId = khoravarCantripId;
  }

  if (
    khoravarSkillProficiency &&
    khoravarSkillProficiencyOptions.includes(khoravarSkillProficiency)
  ) {
    normalizedChoices.khoravarSkillProficiency = khoravarSkillProficiency;
  } else if (
    khoravarToolProficiency &&
    khoravarToolProficiencyOptions.includes(khoravarToolProficiency)
  ) {
    normalizedChoices.khoravarToolProficiency = khoravarToolProficiency;
  }

  if (
    khoravarSpellcastingAbility &&
    khoravarSpellcastingAbilityOptions.includes(khoravarSpellcastingAbility)
  ) {
    normalizedChoices.khoravarSpellcastingAbility = khoravarSpellcastingAbility;
  }

  if (lupinSkillProficiency && lupinSkillProficiencyOptions.includes(lupinSkillProficiency)) {
    normalizedChoices.lupinSkillProficiency = lupinSkillProficiency;
  }

  if (rebornResistance && rebornResistanceOptions.includes(rebornResistance)) {
    normalizedChoices.rebornResistance = rebornResistance;
  }

  if (rebornSkillProficiency && rebornSkillProficiencyOptions.includes(rebornSkillProficiency)) {
    normalizedChoices.rebornSkillProficiency = rebornSkillProficiency;
  }

  if (shifterSkillProficiency && shifterSkillProficiencyOptions.includes(shifterSkillProficiency)) {
    normalizedChoices.shifterSkillProficiency = shifterSkillProficiency;
  }

  if (
    warforgedSkillProficiency &&
    warforgedSkillProficiencyOptions.includes(warforgedSkillProficiency)
  ) {
    normalizedChoices.warforgedSkillProficiency = warforgedSkillProficiency;
  }

  if (
    warforgedToolProficiency &&
    warforgedToolProficiencyOptions.includes(warforgedToolProficiency)
  ) {
    normalizedChoices.warforgedToolProficiency = warforgedToolProficiency;
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
  const genasiLineage = getDefaultGenasiLineageForSpecies(species);
  const genasiSpellcastingAbility = getDefaultGenasiSpellcastingAbilityForSpecies(species);
  const gnomeLineage = getDefaultGnomeLineageForSpecies(species);
  const gnomeSpellcastingAbility = getDefaultGnomeSpellcastingAbilityForSpecies(species);
  const giantAncestry = getDefaultGoliathGiantAncestryForSpecies(species);
  const hexbloodSpellcastingAbility = getDefaultHexbloodSpellcastingAbilityForSpecies(species);
  const humanSkillProficiency = getDefaultHumanSkillProficiencyForSpecies(species);
  const humanOriginFeat = getDefaultHumanOriginFeatForSpecies(species);
  const khoravarCantripId = getDefaultKhoravarCantripIdForSpecies(species);
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

  if (genasiLineage) {
    defaultChoices.genasiLineage = genasiLineage;
  }

  if (genasiSpellcastingAbility) {
    defaultChoices.genasiSpellcastingAbility = genasiSpellcastingAbility;
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

  if (hexbloodSpellcastingAbility) {
    defaultChoices.hexbloodSpellcastingAbility = hexbloodSpellcastingAbility;
  }

  if (humanSkillProficiency) {
    defaultChoices.humanSkillProficiency = humanSkillProficiency;
  }

  if (humanOriginFeat) {
    defaultChoices.humanOriginFeat = humanOriginFeat;
  }

  if (khoravarCantripId) {
    defaultChoices.khoravarCantripId = khoravarCantripId;
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

  if (isCustomSpeciesName(character.species)) {
    return normalizeCustomSpeciesConfig(character.customSpecies)?.size ?? null;
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
  if (isCustomSpeciesName(character.species)) {
    const customSpecies = normalizeCustomSpeciesConfig(character.customSpecies);

    return [
      {
        label: "Size",
        value: customSpecies ? formatBodySize(customSpecies.size) : "Not selected"
      },
      {
        label: "Speed",
        value: customSpecies ? `${customSpecies.speed} ft` : "Not selected"
      }
    ];
  }

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

  if (getChangelingSkillProficiencyOptionsForSpecies(character.species).length > 0) {
    const changelingSkillProficiencies = getChangelingSkillProficienciesForCharacter({
      species: character.species,
      speciesChoices: choices
    });

    items.push({
      label: "Changeling Instincts",
      value:
        changelingSkillProficiencies.length > 0
          ? changelingSkillProficiencies.join(", ")
          : "Not selected"
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

  const genasiLineageOptions = getGenasiLineageOptionsForSpecies(character.species);

  if (genasiLineageOptions.length > 0) {
    const lineage = getGenasiLineageForCharacter({
      species: character.species,
      speciesChoices: choices
    });
    const lineageOption = genasiLineageOptions.find((option) => option.key === lineage) ?? null;

    items.push({
      label: "Genasi Lineage",
      value: lineageOption ? formatGenasiLineageSummaryLabel(lineageOption) : "Not selected"
    });
  }

  if (getGenasiSpellcastingAbilityOptionsForSpecies(character.species).length > 0) {
    items.push({
      label: "Genasi Spellcasting",
      value: choices?.genasiSpellcastingAbility ?? "Not selected"
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

  if (getHexbloodSpellcastingAbilityOptionsForSpecies(character.species).length > 0) {
    items.push({
      label: "Hex Magic",
      value: choices?.hexbloodSpellcastingAbility ?? "Not selected"
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

  if (getKalashtarSkillProficiencyOptionsForSpecies(character.species).length > 0) {
    const kalashtarSkillProficiency = getKalashtarSkillProficiencyForCharacter({
      species: character.species,
      speciesChoices: choices
    });

    items.push({
      label: "Severed from Dreams",
      value: kalashtarSkillProficiency ?? "Not selected"
    });
  }

  if (
    getKhoravarSkillProficiencyOptionsForSpecies(character.species).length > 0 ||
    getKhoravarToolProficiencyOptionsForSpecies(character.species).length > 0
  ) {
    const khoravarSkillProficiency = getKhoravarSkillProficiencyForCharacter({
      species: character.species,
      speciesChoices: choices
    });
    const khoravarToolProficiency = getKhoravarToolProficiencyForCharacter({
      species: character.species,
      speciesChoices: choices
    });
    const khoravarChoiceValue = getKhoravarProficiencyChoiceValueForCharacter({
      species: character.species,
      speciesChoices: choices
    });

    items.push({
      label: getKhoravarSkillVersatilitySummaryLabel(),
      value: khoravarChoiceValue
        ? (khoravarSkillProficiency ??
          (khoravarToolProficiency
            ? getToolProficiencyLabel(khoravarToolProficiency)
            : "Not selected"))
        : "Not selected"
    });
  }

  if (getKhoravarCantripOptionsForSpecies(character.species).length > 0) {
    const khoravarCantrip = getKhoravarCantripForCharacter({
      species: character.species,
      speciesChoices: choices
    });

    items.push({
      label: `${getKhoravarFeyGiftSummaryLabel()} Cantrip`,
      value: khoravarCantrip?.name ?? "Not selected"
    });
  }

  if (getKhoravarSpellcastingAbilityOptionsForSpecies(character.species).length > 0) {
    items.push({
      label: `${getKhoravarFeyGiftSummaryLabel()} Spellcasting`,
      value: choices?.khoravarSpellcastingAbility ?? "Not selected"
    });
  }

  if (getLupinSkillProficiencyOptionsForSpecies(character.species).length > 0) {
    const lupinSkillProficiency = getLupinSkillProficiencyForCharacter({
      species: character.species,
      speciesChoices: choices
    });

    items.push({
      label: "Werewolf Instincts",
      value: lupinSkillProficiency ?? "Not selected"
    });
  }

  if (getRebornSkillProficiencyOptionsForSpecies(character.species).length > 0) {
    const rebornSkillProficiency = getRebornSkillProficiencyForCharacter({
      species: character.species,
      speciesChoices: choices
    });

    items.push({
      label: "Knowledge from a Past Life",
      value: rebornSkillProficiency ?? "Not selected"
    });
  }

  if (getRebornResistanceOptionsForSpecies(character.species).length > 0) {
    const rebornResistance = getRebornResistanceForCharacter({
      species: character.species,
      speciesChoices: choices
    });

    items.push({
      label: "Strange Endurance",
      value: rebornResistance ? formatDamageTypeLabel(rebornResistance) : "Not selected"
    });
  }

  if (getShifterSkillProficiencyOptionsForSpecies(character.species).length > 0) {
    const shifterSkillProficiency = getShifterSkillProficiencyForCharacter({
      species: character.species,
      speciesChoices: choices
    });

    items.push({
      label: "Bestial Instincts",
      value: shifterSkillProficiency ?? "Not selected"
    });
  }

  if (getWarforgedSkillProficiencyOptionsForSpecies(character.species).length > 0) {
    const warforgedSkillProficiency = getWarforgedSkillProficiencyForCharacter({
      species: character.species,
      speciesChoices: choices
    });

    items.push({
      label: `${getWarforgedSpecializedDesignSummaryLabel()} Skill`,
      value: warforgedSkillProficiency ?? "Not selected"
    });
  }

  if (getWarforgedToolProficiencyOptionsForSpecies(character.species).length > 0) {
    const warforgedToolProficiency = getWarforgedToolProficiencyForCharacter({
      species: character.species,
      speciesChoices: choices
    });

    items.push({
      label: `${getWarforgedSpecializedDesignSummaryLabel()} Tool`,
      value: warforgedToolProficiency
        ? getToolProficiencyLabel(warforgedToolProficiency)
        : "Not selected"
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
  character: Pick<Character, "species"> & Partial<Pick<Character, "customSpecies">>
): SpeciesSpeedDetails {
  if (isCustomSpeciesName(character.species)) {
    const customSpecies = normalizeCustomSpeciesConfig(character.customSpecies);

    if (customSpecies) {
      return {
        speed: customSpecies.speed,
        source: getCharacterSpeciesDisplayName(character)
      };
    }
  }

  const entry = getSpeciesEntry(character.species);

  return {
    speed: entry?.speed ?? fallbackWalkSpeed,
    source: entry?.name ?? "Base"
  };
}

export function getSpeciesSpeedForCharacter(
  character: Pick<Character, "species"> & Partial<Pick<Character, "customSpecies">>
): number {
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

  if (isDhampirSpecies(species)) {
    return {
      dhampir: normalizeDhampirSpeciesFeatureState(record.dhampir)
    };
  }

  if (isDwarfSpecies(species)) {
    return {
      dwarf: normalizeDwarfSpeciesFeatureState(record.dwarf)
    };
  }

  if (isGenasiSpecies(species)) {
    return {
      genasi: normalizeGenasiSpeciesFeatureState(record.genasi)
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

  if (isHexbloodSpecies(species)) {
    return {
      hexblood: normalizeHexbloodSpeciesFeatureState(record.hexblood)
    };
  }

  if (isLupinSpecies(species)) {
    return {
      lupin: normalizeLupinSpeciesFeatureState(record.lupin)
    };
  }

  if (isRebornSpecies(species)) {
    return {
      reborn: normalizeRebornSpeciesFeatureState(record.reborn)
    };
  }

  if (isShifterSpecies(species)) {
    return {
      shifter: normalizeShifterSpeciesFeatureState(record.shifter)
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

  if (isChangelingSpecies(character.species)) {
    statusEntries = statusEntries.map((entry) =>
      isChangelingShapeShifterStatusEntry(entry)
        ? normalizeChangelingShapeShifterStatusEntry(entry)
        : entry
    );
  } else {
    statusEntries = statusEntries.filter((entry) => !isChangelingShapeShifterStatusEntry(entry));
  }

  if (isHexbloodSpecies(character.species)) {
    statusEntries = statusEntries.map((entry) =>
      isHexbloodEerieTokenStatusEntry(entry) ? normalizeHexbloodEerieTokenStatusEntry(entry) : entry
    );
  } else {
    statusEntries = statusEntries.filter((entry) => !isHexbloodEerieTokenStatusEntry(entry));
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

  if (isShifterSpecies(character.species)) {
    statusEntries = statusEntries.map((entry) =>
      isShifterShiftingStatusEntry(entry) ? normalizeShifterShiftingStatusEntry(entry) : entry
    );
  } else {
    statusEntries = statusEntries.filter((entry) => !isShifterShiftingStatusEntry(entry));
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

function getAasimarFeatureContributionsForCharacter(
  character: SpeciesContributionCharacter
): FeatureContributionSpec[] {
  if (!isAasimarSpecies(character.species)) {
    return [];
  }

  const entry = getSpeciesEntry(character.species);
  const light = getSpellEntryById(aasimarLightCantripId);
  const canCreateActions = typeof character.level === "number";
  const hasHeavenlyWingsActive = normalizeCharacterStatusEntries(character.statusEntries).some(
    (statusEntry) => getAasimarCelestialRevelationStatusOptionKey(statusEntry) === "heavenly-wings"
  );

  return [
    {
      source: {
        type: "species",
        id: aasimarSpeciesId,
        label: "Aasimar"
      },
      resources: [
        {
          id: "species-aasimar-healing-hands",
          label: "Healing Hands",
          remaining: getAasimarHealingHandsUsesRemaining(character),
          total: getAasimarHealingHandsUsesTotal(character),
          recovery: "longRest" as const
        },
        {
          id: "species-aasimar-celestial-revelation",
          label: "Celestial Revelation",
          remaining: getAasimarCelestialRevelationUsesRemaining(character),
          total: getAasimarCelestialRevelationUsesTotal(character),
          recovery: "longRest" as const
        }
      ].filter((resource) => resource.total > 0),
      actions: canCreateActions
        ? [
            getAasimarHealingHandsAction(character as SpeciesFeatureRuntimeCharacter),
            ...((character.level ?? 1) >= 3
              ? [getAasimarCelestialRevelationAction(character as SpeciesFeatureRuntimeCharacter)]
              : [])
          ]
        : [],
      statuses: entry ? getAasimarDerivedStatusEntries(entry) : [],
      speedBonuses: hasHeavenlyWingsActive
        ? [
            {
              label: "Heavenly Wings",
              value: 0,
              movementType: "fly" as const,
              setBaseFromWalkMultiplier: 1
            }
          ]
        : [],
      spellGrants: light
        ? [
            {
              kind: "granted-cantrip",
              spell: light
            },
            {
              kind: "always-prepared-cantrip",
              spell: light,
              sourceLabel: "Aasimar",
              spellcastingAbility: "CHA"
            }
          ]
        : []
    }
  ];
}

function collectSpeciesContributionState(character: SpeciesContributionCharacter) {
  return compileFeatureContributions([
    ...getAasimarFeatureContributionsForCharacter(character),
    ...getSpeciesFeatureContributionsForCharacter(character)
  ]);
}

export function getSpeciesActionsForCharacter(character: Character): FeatureActionCard[] {
  return collectSpeciesContributionState(character).actions;
}

export function activateSpeciesFeatureActionForCharacter(
  character: Character,
  actionKey: string
): Character {
  const nextCharacter = activateChangelingFeatureActionForCharacter(character, actionKey);

  if (nextCharacter !== character) {
    return nextCharacter;
  }

  const hexbloodCharacter = activateHexbloodFeatureActionForCharacter(character, actionKey);

  if (hexbloodCharacter !== character) {
    return hexbloodCharacter;
  }

  const lupinCharacter = activateLupinFeatureActionForCharacter(character, actionKey);

  if (lupinCharacter !== character) {
    return lupinCharacter;
  }

  return activateRebornFeatureActionForCharacter(character, actionKey);
}

export function activateSpeciesFeatureActionOptionForCharacter(
  character: Character,
  actionKey: string,
  optionKey: string
): Character {
  return activateShifterFeatureActionOptionForCharacter(character, actionKey, optionKey);
}

export function getSpeciesActionOptionsForCharacter(
  character: SpeciesContributionCharacter,
  actionKey: string
) {
  return collectSpeciesContributionState(character).actionOptions[actionKey] ?? [];
}

export function getSpeciesAbilityCheckIndicatorsForCharacter(
  character: Pick<Character, "species"> &
    Partial<Pick<Character, "speciesChoices" | "statusEntries">>
) {
  return collectSpeciesContributionState(character).abilityCheckIndicators;
}

export function getSpeciesSavingThrowIndicatorsForCharacter(
  character: Pick<Character, "species"> &
    Partial<Pick<Character, "speciesChoices" | "statusEntries">>
) {
  return collectSpeciesContributionState(character).savingThrowIndicators;
}

export function getSpeciesSkillIndicatorsForCharacter(
  character: Pick<Character, "species"> &
    Partial<Pick<Character, "speciesChoices" | "statusEntries">>
) {
  return collectSpeciesContributionState(character).skillIndicators;
}

export function transformSpeciesCommonActionForCharacter(
  character: Pick<Character, "species" | "level"> & Partial<Pick<Character, "speciesFeatureState">>,
  action: FeatureActionCard
): FeatureActionCard {
  return collectSpeciesContributionState(character).commonActionTransforms.reduce(
    (currentAction, contribution) => contribution.transform(character as Character, currentAction),
    action
  );
}

export function transformSpeciesWeaponActionForCharacter(
  character: Pick<Character, "species" | "level"> &
    Partial<Pick<Character, "speciesChoices" | "speciesFeatureState" | "statusEntries">>,
  action: WeaponAction
): WeaponAction {
  return collectSpeciesContributionState(character).weaponActionTransforms.reduce<WeaponAction>(
    (currentAction, contribution) =>
      contribution.transform(character as Character, currentAction) as WeaponAction,
    action
  );
}

export function getSpeciesDescriptionAdditionsForCharacter(
  character: SpeciesContributionCharacter,
  target: FeatureDescriptionContributionTarget,
  targetKey?: string
) {
  return getFeatureDescriptionAdditions(collectSpeciesContributionState(character), target, {
    character: character as Character,
    targetKey
  });
}

export function getSpeciesGrantedCantripEntriesForCharacter(
  character: Pick<Character, "species"> & Partial<Pick<Character, "speciesChoices">>
): SpellEntry[] {
  return collectSpeciesContributionState(character).grantedCantripEntries;
}

export function getSpeciesAlwaysPreparedCantripEntriesForCharacter(
  character: Pick<Character, "species"> & Partial<Pick<Character, "speciesChoices">>
): SpellEntry[] {
  return collectSpeciesContributionState(character).alwaysPreparedCantripEntries;
}

export function getSpeciesAlwaysPreparedSpellIdsForCharacter(
  character: Pick<Character, "species"> & Partial<Pick<Character, "level" | "speciesChoices">>
): string[] {
  return collectSpeciesContributionState(character).alwaysPreparedSpellEntries.map(
    (spell) => spell.id
  );
}

export function getSpeciesAlwaysPreparedSpellSourceMapForCharacter(
  character: Pick<Character, "species"> & Partial<Pick<Character, "level" | "speciesChoices">>
): SpellSourceMap {
  return collectSpeciesContributionState(character).alwaysPreparedSpellSourceMap;
}

export function getSpeciesSpellcastingAbilityForCharacter(
  character: Pick<Character, "species"> & Partial<Pick<Character, "speciesChoices">>,
  spellId: string
): AbilityKey | null {
  return (
    collectSpeciesContributionState(character).spellcastingAbilityBySpellId.get(spellId) ?? null
  );
}

export function getSpeciesSpellEntryForCharacter(
  character: Pick<Character, "species"> & Partial<Pick<Character, "speciesChoices">>,
  spell: SpellEntry
): SpellEntry {
  return collectSpeciesContributionState(character).spellTransforms.reduce(
    (currentSpell, contribution) => contribution.transform(currentSpell),
    spell
  );
}

export function getSpeciesSpellActionPathContributionsForCharacter(
  character: Character,
  spell: Pick<SpellEntry, "id" | "castingTime" | "spellLevel">
): FeatureSpellActionPathContribution[] {
  return collectSpeciesContributionState(character).spellActionPaths.filter(
    (contribution) => contribution.spellId === spell.id
  );
}

export function applySpeciesSpellCastEffectsForCharacter(
  character: Character,
  spell: Pick<SpellEntry, "id" | "spellLevel">,
  spellCastEffectIds: readonly string[] | null | undefined,
  context: Omit<FeatureSpellCastEffectContext, "spell" | "spellCastEffectIds"> = {}
): Character | null {
  const effectIds = [...new Set(spellCastEffectIds ?? [])];

  if (effectIds.length === 0) {
    return character;
  }

  return applyFeatureSpellCastEffects(
    collectSpeciesContributionState(character).spellCastEffects,
    character,
    {
      ...context,
      spell
    },
    effectIds
  );
}

export function getSpeciesSpeedBonusesForCharacter(
  character: Pick<Character, "species"> &
    Partial<Pick<Character, "speciesChoices" | "statusEntries">>
): FeatureSpeedBonus[] {
  return collectSpeciesContributionState(character).speedBonuses;
}

export function getSpeciesArmorClassBonusesForCharacter(
  character: SpeciesContributionCharacter,
  context: ArmorClassFeatureContext
): FeatureArmorClassBonus[] {
  return collectSpeciesContributionState(character).armorClassBonuses.flatMap((contribution) =>
    contribution.getBonuses(context)
  );
}

export function getSpeciesReactionEntriesForCharacter(character: SpeciesContributionCharacter) {
  return collectSpeciesContributionState(character).reactions;
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
  return collectSpeciesContributionState(character).statuses;
}
