import type {
  AbilityKey,
  ArmorProficiencyEntry,
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
  PROFICIENCY_OVERRIDE_POLICY,
  PROFICIENCY_SOURCE,
  PROF_LEVEL,
  SAVING_THROW_PROFICIENCY,
  SKILL_PROFICIENCY,
  TOOL_PROFICIENCY,
  WEAPON_PROFICIENCY,
  getSkillNameForProficiency as getSharedSkillNameForProficiency,
  languageEntries
} from "../../../types";
import {
  createCustomLanguageProficiency,
  isCustomLanguageProficiency,
  languageProficiencyOptions,
  toolProficiencyOptions
} from "../proficiencyOptions";
import type { ToolProficiency } from "../proficiencyOptions";
import {
  getClassProficiencyProfile,
  getSavingThrowAbilityKey
} from "../proficiencyClassData";
import {
  getMatchingWeaponProficiencies,
  getWeaponProficiencyLabel,
  getWeaponProficiencyOptionsForClass,
  type WeaponType
} from "../proficiencyWeaponLabels";
import { getSavingThrowLevelFromEntries } from "../proficiencyResolvers";
import {
  armorProficiencyOptions,
  createArmorEntry,
  createLanguageEntry,
  createSavingThrowEntry,
  createSkillEntry,
  createToolEntry,
  createWeaponEntry,
  dedupe,
  getDisplayProficiencyEntries,
  getHighestEntryLevel,
  getNonManualPositiveEntries,
  getProficiencyLabel,
  getResolvedProficiencyEntry,
  getResolvedSkillSourceLabels,
  getStoredManualOverrideEntry,
  hasLockedNonManualPositiveEntry,
  mergeProficiencyEntries,
  proficiencyLevelRank,
  upsertManualEntry
} from "./core";
import type { ProficiencyDisplayEntry, ResolvedProficiencyEntry } from "./types";

export function getManualSkillSelectionsFromEntries(entries: SkillProficiencyEntry[]): SkillName[] {
  return mergeProficiencyEntries(entries)
    .filter(
      (entry) =>
        entry.source === PROFICIENCY_SOURCE.MANUAL &&
        proficiencyLevelRank[entry.proficiencyLevel] >= proficiencyLevelRank[PROF_LEVEL.PROFICIENT]
    )
    .map((entry) => getSharedSkillNameForProficiency(entry.proficiency));
}

export function getManualSkillExpertiseSelectionsFromEntries(
  entries: SkillProficiencyEntry[]
): SkillName[] {
  return mergeProficiencyEntries(entries)
    .filter(
      (entry) =>
        entry.source === PROFICIENCY_SOURCE.MANUAL && entry.proficiencyLevel === PROF_LEVEL.EXPERT
    )
    .map((entry) => getSharedSkillNameForProficiency(entry.proficiency));
}

export function getManualToolSelectionsFromEntries(entries: ToolProficiencyEntry[]): ToolProficiency[] {
  return mergeProficiencyEntries(entries)
    .filter(
      (entry) =>
        entry.source === PROFICIENCY_SOURCE.MANUAL &&
        proficiencyLevelRank[entry.proficiencyLevel] >= proficiencyLevelRank[PROF_LEVEL.PROFICIENT]
    )
    .map((entry) => entry.proficiency);
}

export function getSavingThrowSelectionsFromEntries(
  entries: SavingThrowProficiencyEntry[]
): AbilityKey[] {
  return dedupe(
    entries
      .filter(
        (entry) =>
          entry.source === PROFICIENCY_SOURCE.MANUAL &&
          proficiencyLevelRank[entry.proficiencyLevel] >= proficiencyLevelRank[PROF_LEVEL.PROFICIENT]
      )
      .map((entry) => getSavingThrowAbilityKey(entry.proficiency))
  );
}

export function getSelectedClassSkillSelectionsFromEntries(
  entries: SkillProficiencyEntry[],
  className: string
): SkillName[] {
  const profile = getClassProficiencyProfile(className);

  if (!profile) {
    return [];
  }

  const allowedSkillSet = new Set(profile.skillProficiencyOptions);
  const grantedSkillSet = new Set(profile.grantedSkillProficiencies ?? []);

  return dedupe(
    entries
      .filter(
        (entry) =>
          entry.source === PROFICIENCY_SOURCE.CLASS &&
          entry.sourceStr === className &&
          proficiencyLevelRank[entry.proficiencyLevel] >= proficiencyLevelRank[PROF_LEVEL.PROFICIENT]
      )
      .map((entry) => getSharedSkillNameForProficiency(entry.proficiency))
      .filter((skill) => allowedSkillSet.has(skill))
      .filter((skill) => !grantedSkillSet.has(skill))
  ).slice(0, profile.skillProficiencyCount);
}

export function getSelectedClassToolSelectionsFromEntries(
  entries: ToolProficiencyEntry[],
  className: string
): ToolProficiency[] {
  const profile = getClassProficiencyProfile(className);

  if (!profile) {
    return [];
  }

  const allowedToolSet = new Set(profile.toolProficiencyChoices ?? []);
  const grantedToolSet = new Set(profile.grantedToolProficiencies ?? []);

  return dedupe(
    entries
      .filter(
        (entry) =>
          entry.source === PROFICIENCY_SOURCE.CLASS &&
          entry.sourceStr === className &&
          proficiencyLevelRank[entry.proficiencyLevel] >= proficiencyLevelRank[PROF_LEVEL.PROFICIENT]
      )
      .map((entry) => entry.proficiency)
      .filter((tool) => allowedToolSet.has(tool))
      .filter((tool) => !grantedToolSet.has(tool))
  ).slice(0, profile.toolProficiencyChoiceCount ?? 0);
}

export function getSkillLevelFromEntries(
  entries: SkillProficiencyEntry[],
  proficiency: SKILL_PROFICIENCY
): PROF_LEVEL {
  return getResolvedProficiencyEntry(entries, proficiency).proficiencyLevel;
}

export function getResolvedSkillProficiencyEntry(
  entries: SkillProficiencyEntry[],
  proficiency: SKILL_PROFICIENCY
): ResolvedProficiencyEntry<SKILL_PROFICIENCY> {
  const manualOverride = getStoredManualOverrideEntry(entries, proficiency);
  const automaticEntries = getNonManualPositiveEntries(entries, proficiency);
  const positiveEntries = manualOverride
    ? [...automaticEntries, manualOverride].filter(
        (entry) =>
          proficiencyLevelRank[entry.proficiencyLevel] >= proficiencyLevelRank[PROF_LEVEL.PROFICIENT]
      )
    : automaticEntries;

  if (positiveEntries.length === 0) {
    return {
      proficiency,
      proficiencyLevel: PROF_LEVEL.NONE,
      sourceLabels: [],
      locked: false,
      overridePolicy: PROFICIENCY_OVERRIDE_POLICY.OVERRIDABLE
    };
  }

  const hasAutomaticEntries = automaticEntries.length > 0;

  return {
    proficiency,
    proficiencyLevel: getHighestEntryLevel(positiveEntries),
    sourceLabels: getResolvedSkillSourceLabels(entries, proficiency),
    locked: hasAutomaticEntries,
    overridePolicy: hasAutomaticEntries
      ? PROFICIENCY_OVERRIDE_POLICY.LOCKED
      : PROFICIENCY_OVERRIDE_POLICY.OVERRIDABLE
  };
}

export function getWeaponLevelFromEntries(
  entries: WeaponProficiencyEntry[],
  proficiency: WEAPON_PROFICIENCY
): PROF_LEVEL {
  return getResolvedProficiencyEntry(entries, proficiency).proficiencyLevel;
}

export function getAppliedWeaponProficiency(
  entries: WeaponProficiencyEntry[],
  training: WeaponType,
  options?: {
    baseWeapon?: string;
    combatType?: string;
    properties?: string[];
  }
): { proficiency: WEAPON_PROFICIENCY; label: string; level: PROF_LEVEL } | null {
  const matchingProficiencies = getMatchingWeaponProficiencies(
    training,
    options as Parameters<typeof getMatchingWeaponProficiencies>[1]
  );

  for (const proficiency of matchingProficiencies) {
    const level = getWeaponLevelFromEntries(entries, proficiency);

    if (level !== PROF_LEVEL.NONE) {
      return {
        proficiency,
        label: getWeaponProficiencyLabel(proficiency),
        level
      };
    }
  }

  return null;
}

export function getArmorLevelFromEntries(
  entries: ArmorProficiencyEntry[],
  proficiency: ARMOR_PROFICIENCY
): PROF_LEVEL {
  return getResolvedProficiencyEntry(entries, proficiency).proficiencyLevel;
}

export function getToolLevelFromEntries(
  entries: ToolProficiencyEntry[],
  proficiency: TOOL_PROFICIENCY
): PROF_LEVEL {
  return getResolvedProficiencyEntry(entries, proficiency).proficiencyLevel;
}

export function getLanguageLevelFromEntries(
  entries: LanguageProficiencyEntry[],
  proficiency: LanguageProficiency
): PROF_LEVEL {
  return getResolvedProficiencyEntry(entries, proficiency).proficiencyLevel;
}

export function hasLockedSkillEntry(
  entries: SkillProficiencyEntry[],
  proficiency: SKILL_PROFICIENCY
): boolean {
  return hasLockedNonManualPositiveEntry(entries, proficiency);
}

export function isManualSkillLevelSelectable(
  entries: SkillProficiencyEntry[],
  proficiency: SKILL_PROFICIENCY,
  nextLevel: PROF_LEVEL
): boolean {
  const nonManualFloor = getHighestEntryLevel(getNonManualPositiveEntries(entries, proficiency));

  return proficiencyLevelRank[nextLevel] >= proficiencyLevelRank[nonManualFloor];
}

export function hasLockedSavingThrowEntry(
  entries: SavingThrowProficiencyEntry[],
  proficiency: SAVING_THROW_PROFICIENCY
): boolean {
  return hasLockedNonManualPositiveEntry(entries, proficiency);
}

export function hasLockedWeaponEntry(
  entries: WeaponProficiencyEntry[],
  proficiency: WEAPON_PROFICIENCY
): boolean {
  return hasLockedNonManualPositiveEntry(entries, proficiency);
}

export function hasLockedArmorEntry(
  entries: ArmorProficiencyEntry[],
  proficiency: ARMOR_PROFICIENCY
): boolean {
  return hasLockedNonManualPositiveEntry(entries, proficiency);
}

export function hasLockedToolEntry(
  entries: ToolProficiencyEntry[],
  proficiency: TOOL_PROFICIENCY
): boolean {
  return hasLockedNonManualPositiveEntry(entries, proficiency);
}

export function hasLockedLanguageEntry(
  entries: LanguageProficiencyEntry[],
  proficiency: LanguageProficiency
): boolean {
  return hasLockedNonManualPositiveEntry(entries, proficiency);
}

export function hasNonManualSkillEntry(
  entries: SkillProficiencyEntry[],
  proficiency: SKILL_PROFICIENCY
): boolean {
  return entries.some(
    (entry) =>
      entry.proficiency === proficiency &&
      entry.source !== PROFICIENCY_SOURCE.MANUAL &&
      proficiencyLevelRank[entry.proficiencyLevel] >= proficiencyLevelRank[PROF_LEVEL.PROFICIENT]
  );
}

export function hasNonManualSavingThrowEntry(
  entries: SavingThrowProficiencyEntry[],
  proficiency: SAVING_THROW_PROFICIENCY
): boolean {
  return entries.some(
    (entry) =>
      entry.proficiency === proficiency &&
      entry.source !== PROFICIENCY_SOURCE.MANUAL &&
      proficiencyLevelRank[entry.proficiencyLevel] >= proficiencyLevelRank[PROF_LEVEL.PROFICIENT]
  );
}

export function upsertManualSkillEntry(
  entries: SkillProficiencyEntry[],
  proficiency: SKILL_PROFICIENCY,
  proficiencyLevel: PROF_LEVEL
): SkillProficiencyEntry[] {
  const existingManualOverride = getStoredManualOverrideEntry(entries, proficiency);
  const automaticEntries = getNonManualPositiveEntries(entries, proficiency);
  const automaticHighestLevel = getHighestEntryLevel(automaticEntries);
  const hasAutomaticProficiencyFloor = automaticEntries.some(
    (entry) => entry.proficiencyLevel === PROF_LEVEL.PROFICIENT
  );
  const nextEntries = entries.filter(
    (entry) => !(entry.source === PROFICIENCY_SOURCE.MANUAL && entry.proficiency === proficiency)
  );

  if (proficiencyLevel === PROF_LEVEL.NONE) {
    if (
      automaticHighestLevel === PROF_LEVEL.EXPERT &&
      !hasAutomaticProficiencyFloor &&
      existingManualOverride &&
      proficiencyLevelRank[existingManualOverride.proficiencyLevel] >=
        proficiencyLevelRank[PROF_LEVEL.PROFICIENT]
    ) {
      return mergeProficiencyEntries([
        ...nextEntries,
        createSkillEntry(proficiency, PROFICIENCY_SOURCE.MANUAL, undefined, PROF_LEVEL.PROFICIENT)
      ]);
    }

    return mergeProficiencyEntries(nextEntries);
  }

  if (
    automaticHighestLevel === PROF_LEVEL.EXPERT &&
    proficiencyLevel === PROF_LEVEL.PROFICIENT &&
    !hasAutomaticProficiencyFloor
  ) {
    return mergeProficiencyEntries([
      ...nextEntries,
      createSkillEntry(proficiency, PROFICIENCY_SOURCE.MANUAL, undefined, PROF_LEVEL.PROFICIENT)
    ]);
  }

  if (proficiencyLevelRank[proficiencyLevel] <= proficiencyLevelRank[automaticHighestLevel]) {
    return mergeProficiencyEntries(nextEntries);
  }

  return mergeProficiencyEntries([
    ...nextEntries,
    createSkillEntry(proficiency, PROFICIENCY_SOURCE.MANUAL, undefined, proficiencyLevel)
  ]);
}

export function setManualWeaponEntry(
  entries: WeaponProficiencyEntry[],
  proficiency: WEAPON_PROFICIENCY,
  proficiencyLevel: PROF_LEVEL
): WeaponProficiencyEntry[] {
  return upsertManualEntry(entries, proficiency, proficiencyLevel, createWeaponEntry);
}

export function setManualArmorEntry(
  entries: ArmorProficiencyEntry[],
  proficiency: ARMOR_PROFICIENCY,
  proficiencyLevel: PROF_LEVEL
): ArmorProficiencyEntry[] {
  return upsertManualEntry(entries, proficiency, proficiencyLevel, createArmorEntry);
}

export function setManualToolEntry(
  entries: ToolProficiencyEntry[],
  proficiency: TOOL_PROFICIENCY,
  proficiencyLevel: PROF_LEVEL
): ToolProficiencyEntry[] {
  return upsertManualEntry(entries, proficiency, proficiencyLevel, createToolEntry);
}

export function setManualSavingThrowEntry(
  entries: SavingThrowProficiencyEntry[],
  proficiency: SAVING_THROW_PROFICIENCY,
  proficiencyLevel: PROF_LEVEL
): SavingThrowProficiencyEntry[] {
  return upsertManualEntry(entries, proficiency, proficiencyLevel, createSavingThrowEntry);
}

export function setManualLanguageEntry(
  entries: LanguageProficiencyEntry[],
  proficiency: LanguageProficiency,
  proficiencyLevel: PROF_LEVEL
): LanguageProficiencyEntry[] {
  return upsertManualEntry(entries, proficiency, proficiencyLevel, createLanguageEntry);
}

export function addManualCustomLanguageEntry(
  entries: LanguageProficiencyEntry[],
  name: string,
  description?: string
): LanguageProficiencyEntry[] {
  const builtInMatch = languageEntries.find(
    (entry) => entry.name.trim().toLowerCase() === name.trim().toLowerCase()
  );

  if (builtInMatch) {
    return setManualLanguageEntry(entries, builtInMatch.proficiency, PROF_LEVEL.PROFICIENT);
  }

  const proficiency = createCustomLanguageProficiency(name);

  if (!proficiency) {
    return mergeProficiencyEntries(entries);
  }

  const nextEntries = entries.filter(
    (entry) => !(entry.source === PROFICIENCY_SOURCE.MANUAL && entry.proficiency === proficiency)
  );

  return mergeProficiencyEntries([
    ...nextEntries,
    createLanguageEntry(
      proficiency,
      PROFICIENCY_SOURCE.MANUAL,
      undefined,
      PROF_LEVEL.PROFICIENT,
      PROFICIENCY_OVERRIDE_POLICY.OVERRIDABLE,
      description
    )
  ]);
}

export function toggleManualToolEntry(
  entries: ToolProficiencyEntry[],
  proficiency: TOOL_PROFICIENCY
): ToolProficiencyEntry[] {
  return setManualToolEntry(
    entries,
    proficiency,
    getToolLevelFromEntries(entries, proficiency) === PROF_LEVEL.NONE
      ? PROF_LEVEL.PROFICIENT
      : PROF_LEVEL.NONE
  );
}

export function toggleManualSavingThrowEntry(
  entries: SavingThrowProficiencyEntry[],
  proficiency: SAVING_THROW_PROFICIENCY
): SavingThrowProficiencyEntry[] {
  return setManualSavingThrowEntry(
    entries,
    proficiency,
    getSavingThrowLevelFromEntries(entries, proficiency) === PROF_LEVEL.NONE
      ? PROF_LEVEL.PROFICIENT
      : PROF_LEVEL.NONE
  );
}

export function getDisplaySkillLevels(
  entries: SkillProficiencyEntry[]
): { proficient: SkillName[]; expert: SkillName[] } {
  const proficient: SkillName[] = [];
  const expert: SkillName[] = [];

  Object.values(SKILL_PROFICIENCY).forEach((skillProficiency) => {
    const skillLevel = getSkillLevelFromEntries(entries, skillProficiency);

    if (proficiencyLevelRank[skillLevel] >= proficiencyLevelRank[PROF_LEVEL.PROFICIENT]) {
      proficient.push(getSharedSkillNameForProficiency(skillProficiency));
    }

    if (skillLevel === PROF_LEVEL.EXPERT) {
      expert.push(getSharedSkillNameForProficiency(skillProficiency));
    }
  });

  return {
    proficient,
    expert
  };
}

export function getDisplaySkillProficiencyEntries(
  entries: SkillProficiencyEntry[]
): ProficiencyDisplayEntry<SKILL_PROFICIENCY>[] {
  return Object.values(SKILL_PROFICIENCY)
    .reduce<ProficiencyDisplayEntry<SKILL_PROFICIENCY>[]>((displayEntries, proficiency) => {
      const resolvedEntry = getResolvedSkillProficiencyEntry(entries, proficiency);

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

export function getDisplaySavingThrowProficiencyEntries(
  entries: SavingThrowProficiencyEntry[]
): ProficiencyDisplayEntry<SAVING_THROW_PROFICIENCY>[] {
  return getDisplayProficiencyEntries(entries, Object.values(SAVING_THROW_PROFICIENCY));
}

export function getDisplayWeaponProficiencyEntries(
  entries: WeaponProficiencyEntry[],
  className?: string
): ProficiencyDisplayEntry<WEAPON_PROFICIENCY>[] {
  return getDisplayProficiencyEntries(entries, getWeaponProficiencyOptionsForClass(className));
}

export function getDisplayArmorProficiencyEntries(
  entries: ArmorProficiencyEntry[]
): ProficiencyDisplayEntry<ARMOR_PROFICIENCY>[] {
  return getDisplayProficiencyEntries(entries, armorProficiencyOptions);
}

export function getDisplayToolProficiencyEntries(
  entries: ToolProficiencyEntry[]
): ProficiencyDisplayEntry<TOOL_PROFICIENCY>[] {
  return getDisplayProficiencyEntries(entries, toolProficiencyOptions);
}

export function getDisplayLanguageProficiencyEntries(
  entries: LanguageProficiencyEntry[]
): ProficiencyDisplayEntry<LanguageProficiency>[] {
  const builtInGrantedLanguageOptions = dedupe(
    mergeProficiencyEntries(entries)
      .filter(
        (entry) =>
          entry.proficiencyLevel !== PROF_LEVEL.NONE &&
          !isCustomLanguageProficiency(entry.proficiency) &&
          !languageProficiencyOptions.includes(entry.proficiency as typeof languageProficiencyOptions[number])
      )
      .map((entry) => entry.proficiency)
  );
  const customLanguageOptions = dedupe(
    mergeProficiencyEntries(entries)
      .filter(
        (entry) =>
          entry.proficiencyLevel !== PROF_LEVEL.NONE && isCustomLanguageProficiency(entry.proficiency)
      )
      .map((entry) => entry.proficiency)
  );

  return getDisplayProficiencyEntries(entries, [
    ...languageProficiencyOptions,
    ...builtInGrantedLanguageOptions,
    ...customLanguageOptions
  ]);
}
