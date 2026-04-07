import type {
  AbilityKey,
  ArmorProficiencyEntry,
  CharacterDraft,
  CharacterEquipmentItem,
  LanguageProficiency,
  LanguageProficiencyEntry,
  SavingThrowProficiencyEntry,
  SkillName,
  SkillProficiencyEntry,
  ToolProficiencyEntry,
  WeaponProficiencyEntry
} from "../../../types";
import {
  ARMOR_PROFICIENCY,
  LANGUAGE_PROFICIENCY,
  PROFICIENCY_OVERRIDE_POLICY,
  PROFICIENCY_SOURCE,
  PROF_LEVEL,
  SAVING_THROW_PROFICIENCY,
  SKILL_PROFICIENCY,
  TOOL_PROFICIENCY,
  WEAPON_PROFICIENCY,
  getSkillNameForProficiency as getSharedSkillNameForProficiency
} from "../../../types";
import { languageEntries } from "../../../types";
import { TOOL_PROFICIENCIES as LEGACY_TOOL_PROFICIENCIES } from "../../../codex/entries";
import {
  createCustomLanguageProficiency,
  getCustomLanguageNameFromProficiency,
  isCustomLanguageProficiency,
  isLanguageProficiency,
  languageProficiencyLabels,
  skillsOptions,
  toolProficiencyLabels
} from "../proficiencyOptions";
import {
  getWeaponProficiencyLabel,
  getWeaponProficiencyOptionsForClass
} from "../proficiencyWeaponLabels";
import { getSkillProficiencyForName } from "../proficiencyResolvers";
import type { WeaponType } from "../proficiencyWeaponLabels";
import type { ToolProficiency } from "../proficiencyOptions";
import type { ClassProficiencyProfile } from "../proficiencyClassData";
import type {
  GrantedProficiency,
  GrantedProficiencyKind,
  GrantedSkillProficiency,
  NormalizeCharacterProficienciesOptions,
  ProficiencyDisplayEntry,
  ProficiencyEntry,
  ResolvedProficiencyEntry,
  ResolvedSkillProficiencies
} from "./types";

export type {
  GrantedProficiency,
  GrantedProficiencyKind,
  GrantedSkillProficiency,
  NormalizeCharacterProficienciesOptions,
  ProficiencyDisplayEntry,
  ProficiencyEntry,
  ResolvedProficiencyEntry,
  ResolvedSkillProficiencies
} from "./types";

export const skillOptionSet = new Set<string>(skillsOptions);
export const sourceStrMetadataSeparator = "::";
export const proficiencyLevelRank: Record<PROF_LEVEL, number> = {
  [PROF_LEVEL.NONE]: 0,
  [PROF_LEVEL.PROFICIENT]: 1,
  [PROF_LEVEL.EXPERT]: 2
};
export const proficiencyOverridePolicyRank: Record<PROFICIENCY_OVERRIDE_POLICY, number> = {
  [PROFICIENCY_OVERRIDE_POLICY.OVERRIDABLE]: 0,
  [PROFICIENCY_OVERRIDE_POLICY.LOCKED]: 1
};

export const toolProficiencyByLegacyType: Record<LEGACY_TOOL_PROFICIENCIES, TOOL_PROFICIENCY> = {
  [LEGACY_TOOL_PROFICIENCIES.THIEVES_TOOLKIT]: TOOL_PROFICIENCY.THIEVES_TOOLKIT,
  [LEGACY_TOOL_PROFICIENCIES.SMITHS_TOOLKIT]: TOOL_PROFICIENCY.SMITHS_TOOLKIT,
  [LEGACY_TOOL_PROFICIENCIES.DISGUIDE_KIT]: TOOL_PROFICIENCY.DISGUISE_KIT,
  [LEGACY_TOOL_PROFICIENCIES.DISARM_KIT]: TOOL_PROFICIENCY.DISARM_KIT
};

export const skillProficiencySet = new Set<string>(Object.values(SKILL_PROFICIENCY));
export const savingThrowProficiencySet = new Set<string>(Object.values(SAVING_THROW_PROFICIENCY));
export const weaponProficiencySet = new Set<string>(Object.values(WEAPON_PROFICIENCY));
export const armorProficiencySet = new Set<string>(Object.values(ARMOR_PROFICIENCY));
export const toolProficiencySet = new Set<string>(Object.values(TOOL_PROFICIENCY));
export const proficiencySourceSet = new Set<string>(Object.values(PROFICIENCY_SOURCE));
export const profLevelSet = new Set<string>(Object.values(PROF_LEVEL));
export const proficiencyOverridePolicySet = new Set<string>(
  Object.values(PROFICIENCY_OVERRIDE_POLICY)
);

export const armorProficiencyLabels: Record<ARMOR_PROFICIENCY, string> = {
  [ARMOR_PROFICIENCY.LIGHT]: "Light armor",
  [ARMOR_PROFICIENCY.MEDIUM]: "Medium armor",
  [ARMOR_PROFICIENCY.HEAVY]: "Heavy armor",
  [ARMOR_PROFICIENCY.SHIELD]: "Shield"
};

export const savingThrowProficiencyLabels: Record<SAVING_THROW_PROFICIENCY, string> = {
  [SAVING_THROW_PROFICIENCY.STR]: "STR Saving Throw",
  [SAVING_THROW_PROFICIENCY.DEX]: "DEX Saving Throw",
  [SAVING_THROW_PROFICIENCY.CON]: "CON Saving Throw",
  [SAVING_THROW_PROFICIENCY.INT]: "INT Saving Throw",
  [SAVING_THROW_PROFICIENCY.WIS]: "WIS Saving Throw",
  [SAVING_THROW_PROFICIENCY.CHA]: "CHA Saving Throw"
};

export const skillProficiencyOptions = Object.values(SKILL_PROFICIENCY) as SKILL_PROFICIENCY[];
export const savingThrowProficiencyOptions = Object.values(
  SAVING_THROW_PROFICIENCY
) as SAVING_THROW_PROFICIENCY[];
export const armorProficiencyOptions = Object.values(ARMOR_PROFICIENCY) as ARMOR_PROFICIENCY[];

export function dedupe<T>(values: T[]): T[] {
  return [...new Set(values)];
}

export function isSkillProficiency(value: string): value is SKILL_PROFICIENCY {
  return skillProficiencySet.has(value);
}

export function isSavingThrowProficiency(value: string): value is SAVING_THROW_PROFICIENCY {
  return savingThrowProficiencySet.has(value);
}

export function isWeaponProficiency(value: string): value is WEAPON_PROFICIENCY {
  return weaponProficiencySet.has(value);
}

export function isArmorProficiency(value: string): value is ARMOR_PROFICIENCY {
  return armorProficiencySet.has(value);
}

export function isToolProficiency(value: string): value is TOOL_PROFICIENCY {
  return toolProficiencySet.has(value);
}

export function isProficiencySource(value: string): value is PROFICIENCY_SOURCE {
  return proficiencySourceSet.has(value);
}

export function isProfLevel(value: string): value is PROF_LEVEL {
  return profLevelSet.has(value);
}

export function isProficiencyOverridePolicy(
  value: string
): value is PROFICIENCY_OVERRIDE_POLICY {
  return proficiencyOverridePolicySet.has(value);
}

export function normalizeOverridePolicy(
  value: PROFICIENCY_OVERRIDE_POLICY | undefined
): PROFICIENCY_OVERRIDE_POLICY {
  return value === PROFICIENCY_OVERRIDE_POLICY.LOCKED
    ? PROFICIENCY_OVERRIDE_POLICY.LOCKED
    : PROFICIENCY_OVERRIDE_POLICY.OVERRIDABLE;
}

export function compareProficiencyLevels(left: PROF_LEVEL, right: PROF_LEVEL): number {
  return proficiencyLevelRank[left] - proficiencyLevelRank[right];
}

export function getLegacyToolProficiency(value: string): TOOL_PROFICIENCY | null {
  if (!Object.values(LEGACY_TOOL_PROFICIENCIES).includes(value as LEGACY_TOOL_PROFICIENCIES)) {
    return null;
  }

  return toolProficiencyByLegacyType[value as LEGACY_TOOL_PROFICIENCIES];
}

export function getSourceLabel(source: PROFICIENCY_SOURCE, sourceStr?: string): string {
  const normalizedSourceStr = sourceStr?.trim();

  if (normalizedSourceStr && normalizedSourceStr.length > 0) {
    const [label] = normalizedSourceStr.split(sourceStrMetadataSeparator);
    return label;
  }

  return source;
}

export function createFeatProficiencySourceStr(sourceLabel: string, sourceKey: string): string {
  return `${sourceLabel.trim()}${sourceStrMetadataSeparator}${sourceKey.trim()}`;
}

export function createFeatureProficiencySourceStr(
  sourceLabel: string,
  sourceKey: string
): string {
  return `${sourceLabel.trim()}${sourceStrMetadataSeparator}${sourceKey.trim()}`;
}

export function createSkillEntry(
  proficiency: SKILL_PROFICIENCY,
  source: PROFICIENCY_SOURCE,
  sourceStr: string | undefined,
  proficiencyLevel: PROF_LEVEL,
  overridePolicy = PROFICIENCY_OVERRIDE_POLICY.OVERRIDABLE
): SkillProficiencyEntry {
  return {
    source,
    sourceStr: sourceStr?.trim() || undefined,
    proficiency,
    proficiencyLevel,
    overridePolicy: normalizeOverridePolicy(overridePolicy)
  };
}

export function createSavingThrowEntry(
  proficiency: SAVING_THROW_PROFICIENCY,
  source: PROFICIENCY_SOURCE,
  sourceStr: string | undefined,
  proficiencyLevel: PROF_LEVEL,
  overridePolicy = PROFICIENCY_OVERRIDE_POLICY.OVERRIDABLE
): SavingThrowProficiencyEntry {
  return {
    source,
    sourceStr: sourceStr?.trim() || undefined,
    proficiency,
    proficiencyLevel,
    overridePolicy: normalizeOverridePolicy(overridePolicy)
  };
}

export function createWeaponEntry(
  proficiency: WEAPON_PROFICIENCY,
  source: PROFICIENCY_SOURCE,
  sourceStr: string | undefined,
  proficiencyLevel: PROF_LEVEL,
  overridePolicy = PROFICIENCY_OVERRIDE_POLICY.OVERRIDABLE
): WeaponProficiencyEntry {
  return {
    source,
    sourceStr: sourceStr?.trim() || undefined,
    proficiency,
    proficiencyLevel,
    overridePolicy: normalizeOverridePolicy(overridePolicy)
  };
}

export function createArmorEntry(
  proficiency: ARMOR_PROFICIENCY,
  source: PROFICIENCY_SOURCE,
  sourceStr: string | undefined,
  proficiencyLevel: PROF_LEVEL,
  overridePolicy = PROFICIENCY_OVERRIDE_POLICY.OVERRIDABLE
): ArmorProficiencyEntry {
  return {
    source,
    sourceStr: sourceStr?.trim() || undefined,
    proficiency,
    proficiencyLevel,
    overridePolicy: normalizeOverridePolicy(overridePolicy)
  };
}

export function createToolEntry(
  proficiency: TOOL_PROFICIENCY,
  source: PROFICIENCY_SOURCE,
  sourceStr: string | undefined,
  proficiencyLevel: PROF_LEVEL,
  overridePolicy = PROFICIENCY_OVERRIDE_POLICY.OVERRIDABLE
): ToolProficiencyEntry {
  return {
    source,
    sourceStr: sourceStr?.trim() || undefined,
    proficiency,
    proficiencyLevel,
    overridePolicy: normalizeOverridePolicy(overridePolicy)
  };
}

export function addFeatGrantedSkillEntries(
  entries: SkillProficiencyEntry[],
  skills: SkillName[],
  featLabel: string,
  featEntryId: string
): SkillProficiencyEntry[] {
  const sourceStr = createFeatProficiencySourceStr(featLabel, featEntryId);
  const manualProficiencies = new Set(
    entries
      .filter(
        (entry) =>
          entry.source === PROFICIENCY_SOURCE.MANUAL &&
          hasPositiveProficiencyLevel(entry.proficiencyLevel)
      )
      .map((entry) => entry.proficiency)
  );

  return mergeProficiencyEntries([
    ...entries,
    ...skills
      .map((skill) => getSkillProficiencyForName(skill))
      .filter((proficiency): proficiency is SKILL_PROFICIENCY => proficiency !== null)
      .filter((proficiency) => !manualProficiencies.has(proficiency))
      .map((proficiency) =>
        createSkillEntry(
          proficiency,
          PROFICIENCY_SOURCE.FEAT,
          sourceStr,
          PROF_LEVEL.PROFICIENT
        )
      )
  ]);
}

export function removeFeatGrantedSkillEntries(
  entries: SkillProficiencyEntry[],
  skills: SkillName[],
  featLabel: string,
  featEntryId: string
): SkillProficiencyEntry[] {
  const sourceStr = createFeatProficiencySourceStr(featLabel, featEntryId);
  const proficienciesToRemove = new Set(
    skills
      .map((skill) => getSkillProficiencyForName(skill))
      .filter((proficiency): proficiency is SKILL_PROFICIENCY => proficiency !== null)
  );

  return mergeProficiencyEntries(
    entries.filter(
      (entry) =>
        !(
          entry.source === PROFICIENCY_SOURCE.FEAT &&
          entry.sourceStr === sourceStr &&
          proficienciesToRemove.has(entry.proficiency)
        )
    )
  );
}

export function addFeatGrantedToolEntries(
  entries: ToolProficiencyEntry[],
  tools: ToolProficiency[],
  featLabel: string,
  featEntryId: string
): ToolProficiencyEntry[] {
  const sourceStr = createFeatProficiencySourceStr(featLabel, featEntryId);
  const manualProficiencies = new Set(
    entries
      .filter(
        (entry) =>
          entry.source === PROFICIENCY_SOURCE.MANUAL &&
          hasPositiveProficiencyLevel(entry.proficiencyLevel)
      )
      .map((entry) => entry.proficiency)
  );

  return mergeProficiencyEntries([
    ...entries,
    ...tools
      .filter((tool) => !manualProficiencies.has(tool))
      .map((tool) =>
        createToolEntry(tool, PROFICIENCY_SOURCE.FEAT, sourceStr, PROF_LEVEL.PROFICIENT)
      )
  ]);
}

export function removeFeatGrantedToolEntries(
  entries: ToolProficiencyEntry[],
  tools: ToolProficiency[],
  featLabel: string,
  featEntryId: string
): ToolProficiencyEntry[] {
  const sourceStr = createFeatProficiencySourceStr(featLabel, featEntryId);
  const toolsToRemove = new Set<ToolProficiency>(tools);

  return mergeProficiencyEntries(
    entries.filter(
      (entry) =>
        !(
          entry.source === PROFICIENCY_SOURCE.FEAT &&
          entry.sourceStr === sourceStr &&
          toolsToRemove.has(entry.proficiency)
        )
    )
  );
}

export function createLanguageEntry(
  proficiency: LanguageProficiency,
  source: PROFICIENCY_SOURCE,
  sourceStr: string | undefined,
  proficiencyLevel: PROF_LEVEL,
  overridePolicy = PROFICIENCY_OVERRIDE_POLICY.OVERRIDABLE,
  customDescription?: string
): LanguageProficiencyEntry {
  return {
    source,
    sourceStr: sourceStr?.trim() || undefined,
    proficiency,
    proficiencyLevel,
    overridePolicy: normalizeOverridePolicy(overridePolicy),
    customDescription:
      typeof customDescription === "string" && customDescription.trim().length > 0
        ? customDescription.trim()
        : undefined
  };
}

export function createEntryIdentityKey(entry: ProficiencyEntry): string {
  return `${entry.proficiency}:${entry.source}:${entry.sourceStr ?? ""}`;
}

export function getProficiencyLabel(
  proficiency:
    | SKILL_PROFICIENCY
    | SAVING_THROW_PROFICIENCY
    | WEAPON_PROFICIENCY
    | ARMOR_PROFICIENCY
    | TOOL_PROFICIENCY
    | LanguageProficiency
): string {
  if (skillProficiencySet.has(proficiency as string)) {
    return getSharedSkillNameForProficiency(proficiency as SKILL_PROFICIENCY);
  }

  if (proficiency in savingThrowProficiencyLabels) {
    return savingThrowProficiencyLabels[proficiency as SAVING_THROW_PROFICIENCY];
  }

  if (weaponProficiencySet.has(proficiency as string)) {
    return getWeaponProficiencyLabel(proficiency as WEAPON_PROFICIENCY);
  }

  if (proficiency in armorProficiencyLabels) {
    return armorProficiencyLabels[proficiency as ARMOR_PROFICIENCY];
  }

  if (proficiency in toolProficiencyLabels) {
    return toolProficiencyLabels[proficiency as TOOL_PROFICIENCY];
  }

  if (isCustomLanguageProficiency(proficiency)) {
    return getCustomLanguageNameFromProficiency(proficiency) ?? "Custom language";
  }

  return languageProficiencyLabels[proficiency as LANGUAGE_PROFICIENCY];
}

export function getProficiencyKeyword(
  proficiency:
    | SKILL_PROFICIENCY
    | SAVING_THROW_PROFICIENCY
    | WEAPON_PROFICIENCY
    | ARMOR_PROFICIENCY
    | TOOL_PROFICIENCY
    | LanguageProficiency
): string {
  return getProficiencyLabel(proficiency);
}

export function getProficiencySourceLabel(entry: Pick<ProficiencyEntry, "source" | "sourceStr">): string {
  return getSourceLabel(entry.source, entry.sourceStr);
}

export function getSkillNameFromProficiency(proficiency: SKILL_PROFICIENCY): SkillName {
  return getSharedSkillNameForProficiency(proficiency);
}

export function mergeProficiencyEntries<T extends ProficiencyEntry>(entries: T[]): T[] {
  const entriesByKey = new Map<string, T>();

  entries.forEach((entry) => {
    const key = createEntryIdentityKey(entry);
    const existingEntry = entriesByKey.get(key);
    const normalizedEntry = {
      ...entry,
      overridePolicy: normalizeOverridePolicy(entry.overridePolicy)
    } as T;

    if (
      !existingEntry ||
      compareProficiencyLevels(existingEntry.proficiencyLevel, normalizedEntry.proficiencyLevel) < 0 ||
      (
        compareProficiencyLevels(existingEntry.proficiencyLevel, normalizedEntry.proficiencyLevel) === 0 &&
        proficiencyOverridePolicyRank[normalizeOverridePolicy(existingEntry.overridePolicy)] <
          proficiencyOverridePolicyRank[normalizeOverridePolicy(normalizedEntry.overridePolicy)]
      )
    ) {
      entriesByKey.set(key, normalizedEntry);
    }
  });

  return [...entriesByKey.values()].sort((left, right) => {
    const labelComparison = getProficiencyLabel(left.proficiency).localeCompare(
      getProficiencyLabel(right.proficiency)
    );

    if (labelComparison !== 0) {
      return labelComparison;
    }

    return getSourceLabel(left.source, left.sourceStr).localeCompare(
      getSourceLabel(right.source, right.sourceStr)
    );
  });
}

export function hasPositiveProficiencyLevel(level: PROF_LEVEL): boolean {
  return proficiencyLevelRank[level] >= proficiencyLevelRank[PROF_LEVEL.PROFICIENT];
}

export function getStoredManualOverrideEntry<TEntry extends ProficiencyEntry>(
  entries: TEntry[],
  proficiency: TEntry["proficiency"]
): TEntry | null {
  return entries.reduce<TEntry | null>((highestEntry, entry) => {
    if (entry.proficiency !== proficiency || entry.source !== PROFICIENCY_SOURCE.MANUAL) {
      return highestEntry;
    }

    if (
      !highestEntry ||
      compareProficiencyLevels(highestEntry.proficiencyLevel, entry.proficiencyLevel) < 0
    ) {
      return entry;
    }

    return highestEntry;
  }, null);
}

export function hasNonManualPositiveEntry<TEntry extends ProficiencyEntry>(
  entries: TEntry[],
  proficiency: TEntry["proficiency"]
): boolean {
  return entries.some(
    (entry) =>
      entry.proficiency === proficiency &&
      entry.source !== PROFICIENCY_SOURCE.MANUAL &&
      hasPositiveProficiencyLevel(entry.proficiencyLevel)
  );
}

export function getHighestEntryLevel<TEntry extends ProficiencyEntry>(entries: TEntry[]): PROF_LEVEL {
  return entries.reduce<PROF_LEVEL>(
    (highestLevel, entry) =>
      compareProficiencyLevels(highestLevel, entry.proficiencyLevel) >= 0
        ? highestLevel
        : entry.proficiencyLevel,
    PROF_LEVEL.NONE
  );
}

export function getNonManualPositiveEntries<TEntry extends ProficiencyEntry>(
  entries: TEntry[],
  proficiency: TEntry["proficiency"]
): TEntry[] {
  return entries.filter(
    (entry) =>
      entry.proficiency === proficiency &&
      entry.source !== PROFICIENCY_SOURCE.MANUAL &&
      hasPositiveProficiencyLevel(entry.proficiencyLevel)
  );
}

export function hasLockedNonManualPositiveEntry<TEntry extends ProficiencyEntry>(
  entries: TEntry[],
  proficiency: TEntry["proficiency"]
): boolean {
  return hasNonManualPositiveEntry(entries, proficiency);
}

export function getSourceIdentityKey(entry: Pick<ProficiencyEntry, "source" | "sourceStr">): string {
  return `${entry.source}:${entry.sourceStr ?? ""}`;
}

export function getResolvedSkillSourceLabels(
  entries: SkillProficiencyEntry[],
  proficiency: SKILL_PROFICIENCY
): string[] {
  const positiveEntries = entries.filter(
    (entry) => entry.proficiency === proficiency && hasPositiveProficiencyLevel(entry.proficiencyLevel)
  );
  const sourceLevels = new Map<string, { label: string; proficiencyLevel: PROF_LEVEL }>();

  positiveEntries.forEach((entry) => {
    const key = getSourceIdentityKey(entry);
    const existingEntry = sourceLevels.get(key);
    const nextLevel =
      existingEntry &&
      compareProficiencyLevels(existingEntry.proficiencyLevel, entry.proficiencyLevel) >= 0
        ? existingEntry.proficiencyLevel
        : entry.proficiencyLevel;

    sourceLevels.set(key, {
      label: getSourceLabel(entry.source, entry.sourceStr),
      proficiencyLevel: nextLevel
    });
  });

  return [...sourceLevels.values()]
    .sort((left, right) => {
      const proficiencyComparison =
        proficiencyLevelRank[left.proficiencyLevel] - proficiencyLevelRank[right.proficiencyLevel];

      if (proficiencyComparison !== 0) {
        return proficiencyComparison;
      }

      return left.label.localeCompare(right.label);
    })
    .map((entry) => entry.label);
}

export function getResolvedProficiencyEntry<TEntry extends ProficiencyEntry>(
  entries: TEntry[],
  proficiency: TEntry["proficiency"]
): ResolvedProficiencyEntry<TEntry["proficiency"]> {
  const manualOverride = getStoredManualOverrideEntry(entries, proficiency);
  const automaticEntries = getNonManualPositiveEntries(entries, proficiency);

  if (automaticEntries.length > 0) {
    return {
      proficiency,
      proficiencyLevel: getHighestEntryLevel(automaticEntries),
      sourceLabels: dedupe(
        automaticEntries.map((entry) => getSourceLabel(entry.source, entry.sourceStr))
      ),
      locked: true,
      overridePolicy: PROFICIENCY_OVERRIDE_POLICY.LOCKED
    };
  }

  if (manualOverride) {
    return {
      proficiency,
      proficiencyLevel: manualOverride.proficiencyLevel,
      sourceLabels:
        manualOverride.proficiencyLevel === PROF_LEVEL.NONE
          ? []
          : [getSourceLabel(manualOverride.source, manualOverride.sourceStr)],
      locked: false,
      overridePolicy: PROFICIENCY_OVERRIDE_POLICY.OVERRIDABLE
    };
  }

  return {
    proficiency,
    proficiencyLevel: PROF_LEVEL.NONE,
    sourceLabels: [],
    locked: false,
    overridePolicy: PROFICIENCY_OVERRIDE_POLICY.OVERRIDABLE
  };
}

export function getDisplayProficiencyEntries<TEntry extends ProficiencyEntry>(
  entries: TEntry[],
  options: readonly TEntry["proficiency"][]
): ProficiencyDisplayEntry<TEntry["proficiency"]>[] {
  return options
    .reduce<ProficiencyDisplayEntry<TEntry["proficiency"]>[]>((displayEntries, proficiency) => {
      const resolvedEntry = getResolvedProficiencyEntry(entries, proficiency);

      if (resolvedEntry.proficiencyLevel === PROF_LEVEL.NONE) {
        return displayEntries;
      }

      displayEntries.push({
        proficiency,
        proficiencyLevel: resolvedEntry.proficiencyLevel,
        sourceLabels: resolvedEntry.sourceLabels,
        locked: resolvedEntry.locked
      });

      return displayEntries;
    }, [])
    .sort((left, right) =>
      getProficiencyLabel(left.proficiency).localeCompare(getProficiencyLabel(right.proficiency))
    );
}

export function normalizeProficiencyEntries<T extends ProficiencyEntry>(
  value: unknown,
  isValidProficiency: (value: string) => value is T["proficiency"]
): T[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return mergeProficiencyEntries(
    value
      .map((rawEntry) => {
        if (!rawEntry || typeof rawEntry !== "object") {
          return null;
        }

        const entry = rawEntry as Partial<T>;

        if (
          typeof entry.proficiency !== "string" ||
          !isValidProficiency(entry.proficiency) ||
          typeof entry.source !== "string" ||
          !isProficiencySource(entry.source)
        ) {
          return null;
        }

        const proficiencyLevel =
          typeof entry.proficiencyLevel === "string" && isProfLevel(entry.proficiencyLevel)
            ? entry.proficiencyLevel
            : PROF_LEVEL.PROFICIENT;

        return {
          source: entry.source,
          sourceStr:
            typeof entry.sourceStr === "string" && entry.sourceStr.trim().length > 0
              ? entry.sourceStr.trim()
              : undefined,
          proficiency: entry.proficiency,
          proficiencyLevel,
          overridePolicy:
            typeof entry.overridePolicy === "string" &&
            isProficiencyOverridePolicy(entry.overridePolicy)
              ? entry.overridePolicy
              : PROFICIENCY_OVERRIDE_POLICY.OVERRIDABLE
        } as T;
      })
      .filter((entry): entry is T => entry !== null)
  );
}

export function isAutomaticSource(source: PROFICIENCY_SOURCE): boolean {
  return (
    source === PROFICIENCY_SOURCE.CLASS ||
    source === PROFICIENCY_SOURCE.SPECIES ||
    source === PROFICIENCY_SOURCE.BACKGROUND
  );
}

export function stripAutomaticEntries<T extends ProficiencyEntry>(entries: T[]): T[] {
  return entries.filter((entry) => !isAutomaticSource(entry.source));
}

type ProficiencyEntryFactory<TEntry extends ProficiencyEntry> = (
  proficiency: TEntry["proficiency"],
  source: PROFICIENCY_SOURCE,
  sourceStr: string | undefined,
  proficiencyLevel: PROF_LEVEL
) => TEntry;

export function upsertManualEntry<TEntry extends ProficiencyEntry>(
  entries: TEntry[],
  proficiency: TEntry["proficiency"],
  proficiencyLevel: PROF_LEVEL,
  createEntry: ProficiencyEntryFactory<TEntry>
): TEntry[] {
  const nextEntries = entries.filter(
    (entry) => !(entry.source === PROFICIENCY_SOURCE.MANUAL && entry.proficiency === proficiency)
  );

  if (proficiencyLevel === PROF_LEVEL.NONE && !hasNonManualPositiveEntry(entries, proficiency)) {
    return mergeProficiencyEntries(nextEntries);
  }

  return mergeProficiencyEntries([
    ...nextEntries,
    createEntry(proficiency, PROFICIENCY_SOURCE.MANUAL, undefined, proficiencyLevel)
  ]);
}

export function buildGrantedEntriesFromCollections(
  collections: {
    skillProficiencies: SkillProficiencyEntry[];
    savingThrowProficiencies: SavingThrowProficiencyEntry[];
    weaponProficiencies: WeaponProficiencyEntry[];
    armorProficiencies: ArmorProficiencyEntry[];
    toolProficiencies: ToolProficiencyEntry[];
    languageProficiencies: LanguageProficiencyEntry[];
  }
): GrantedProficiency[] {
  const grantedByKey = new Map<
    string,
    { kind: GrantedProficiencyKind; name: string; sources: Set<string> }
  >();

  const allEntries: Array<readonly [GrantedProficiencyKind, ProficiencyEntry]> = [
    ...collections.skillProficiencies.map((entry) => ["skill", entry] as const),
    ...collections.savingThrowProficiencies.map((entry) => ["savingThrow", entry] as const),
    ...collections.weaponProficiencies.map((entry) => ["weapon", entry] as const),
    ...collections.armorProficiencies.map((entry) => ["armor", entry] as const),
    ...collections.toolProficiencies.map((entry) => ["tool", entry] as const),
    ...collections.languageProficiencies.map((entry) => ["language", entry] as const)
  ];

  allEntries.forEach(([kind, entry]) => {
    const name = getProficiencyLabel(entry.proficiency);
    const key = `${kind}:${name}`;
    const grantedEntry = grantedByKey.get(key) ?? {
      kind,
      name,
      sources: new Set<string>()
    };

    grantedEntry.sources.add(getSourceLabel(entry.source, entry.sourceStr));
    grantedByKey.set(key, grantedEntry);
  });

  return [...grantedByKey.values()].map((entry) => ({
    kind: entry.kind,
    name: entry.name,
    sources: [...entry.sources]
  }));
}
