import {
  LANGUAGE_PROFICIENCY,
  PROF_LEVEL,
  PROFICIENCY_SOURCE,
  type LanguageProficiencyEntry
} from "../../../types";
import {
  languageProficiencyLabels,
  languageProficiencyOptions
} from "../proficiencyOptions";
import { sourceStrMetadataSeparator } from "../proficiency/core";

export const cultOfDragonInitiateDefaultLanguage = LANGUAGE_PROFICIENCY.DRACONIC;

export const cultOfDragonInitiateLanguageOptions = languageProficiencyOptions.filter(
  (language) =>
    language !== LANGUAGE_PROFICIENCY.DRUIDIC &&
    language !== LANGUAGE_PROFICIENCY.THIEVES_CANT
);

const cultOfDragonInitiateLanguageOptionSet = new Set<LANGUAGE_PROFICIENCY>(
  cultOfDragonInitiateLanguageOptions
);

export function isCultOfDragonInitiateLanguage(
  value: unknown
): value is LANGUAGE_PROFICIENCY {
  return (
    typeof value === "string" &&
    cultOfDragonInitiateLanguageOptionSet.has(value as LANGUAGE_PROFICIENCY)
  );
}

function isPositiveLanguageEntry(entry: LanguageProficiencyEntry): boolean {
  return entry.proficiencyLevel !== PROF_LEVEL.NONE;
}

function isEntryFromFeat(entry: LanguageProficiencyEntry, ignoredFeatEntryId?: string | null) {
  if (!ignoredFeatEntryId || entry.source !== PROFICIENCY_SOURCE.FEAT || !entry.sourceStr) {
    return false;
  }

  return entry.sourceStr.endsWith(`${sourceStrMetadataSeparator}${ignoredFeatEntryId}`);
}

export function hasDraconicLanguageFromOtherSource(
  entries: readonly LanguageProficiencyEntry[],
  ignoredFeatEntryId?: string | null
): boolean {
  return entries.some(
    (entry) =>
      entry.proficiency === LANGUAGE_PROFICIENCY.DRACONIC &&
      isPositiveLanguageEntry(entry) &&
      !isEntryFromFeat(entry, ignoredFeatEntryId)
  );
}

export function getDefaultCultOfDragonInitiateLanguage(
  knowsDraconicFromOtherSource = false
): LANGUAGE_PROFICIENCY {
  if (!knowsDraconicFromOtherSource) {
    return cultOfDragonInitiateDefaultLanguage;
  }

  return (
    cultOfDragonInitiateLanguageOptions.find(
      (language) => language !== cultOfDragonInitiateDefaultLanguage
    ) ?? LANGUAGE_PROFICIENCY.COMMON
  );
}

export function getCultOfDragonInitiateLanguageLabel(language: LANGUAGE_PROFICIENCY): string {
  return languageProficiencyLabels[language];
}
