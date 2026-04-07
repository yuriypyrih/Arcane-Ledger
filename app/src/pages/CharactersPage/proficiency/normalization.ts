import type {
  AbilityKey,
  ArmorProficiencyEntry,
  CharacterProficiencyCollections,
  LanguageProficiencyEntry,
  SavingThrowProficiencyEntry,
  SkillProficiencyEntry,
  ToolProficiencyEntry,
  WeaponProficiencyEntry
} from "../../../types";
import {
  PROFICIENCY_OVERRIDE_POLICY,
  PROFICIENCY_SOURCE,
  PROF_LEVEL,
  SAVING_THROW_PROFICIENCY,
  SKILL_PROFICIENCY
} from "../../../types";
import {
  getSavingThrowProficiencyForAbilityKey,
  getClassProficiencyProfile
} from "../proficiencyClassData";
import { isLanguageProficiency } from "../proficiencyOptions";
import { getSkillProficiencyForName } from "../proficiencyResolvers";
import {
  getAutomaticProficiencyCollectionsForCharacter,
  normalizeManualSkillSelections,
  normalizeSkillSelectionsForClass,
  normalizeToolProficiencySelections,
  splitLegacySkillSelectionsForClass,
  splitLegacyToolSelectionsForClass
} from "./automatic";
import {
  createLanguageEntry,
  createSavingThrowEntry,
  createSkillEntry,
  createToolEntry,
  dedupe,
  getLegacyToolProficiency,
  isArmorProficiency,
  isProfLevel,
  isProficiencyOverridePolicy,
  isProficiencySource,
  isSavingThrowProficiency,
  isSkillProficiency,
  isToolProficiency,
  isWeaponProficiency,
  mergeProficiencyEntries,
  normalizeProficiencyEntries,
  proficiencyLevelRank,
  stripAutomaticEntries
} from "./core";
import {
  getSelectedClassSkillSelectionsFromEntries,
  getSelectedClassToolSelectionsFromEntries
} from "./manual";
import type { NormalizeCharacterProficienciesOptions } from "./types";

function normalizeLegacySavingThrowSelections(values: string[]): AbilityKey[] {
  const validAbilityKeys = new Set<AbilityKey>(["STR", "DEX", "CON", "INT", "WIS", "CHA"]);

  return dedupe(
    values.filter(
      (ability): ability is AbilityKey =>
        typeof ability === "string" && validAbilityKeys.has(ability as AbilityKey)
    )
  );
}

function normalizeLegacyManualSkillEntries(
  selectedSkills: string[],
  selectedSkillExpertise: string[]
): SkillProficiencyEntry[] {
  const normalizedManualSkills = normalizeManualSkillSelections(selectedSkills);
  const manualSkillSet = new Set<SKILL_PROFICIENCY>(
    normalizedManualSkills
      .map((skill) => getSkillProficiencyForName(skill))
      .filter((skill): skill is SKILL_PROFICIENCY => skill !== null)
  );
  const expertSkillSet = new Set<SKILL_PROFICIENCY>(
    selectedSkillExpertise
      .map((skill) => getSkillProficiencyForName(skill))
      .filter((skill): skill is SKILL_PROFICIENCY => skill !== null)
  );

  return mergeProficiencyEntries([
    ...[...manualSkillSet].map((skill) =>
      createSkillEntry(skill, PROFICIENCY_SOURCE.MANUAL, undefined, PROF_LEVEL.PROFICIENT)
    ),
    ...[...expertSkillSet].map((skill) =>
      createSkillEntry(skill, PROFICIENCY_SOURCE.MANUAL, undefined, PROF_LEVEL.EXPERT)
    )
  ]);
}

function normalizeLegacyManualToolEntries(selectedToolProficiencies: string[]): ToolProficiencyEntry[] {
  return mergeProficiencyEntries(
    normalizeToolProficiencySelections(selectedToolProficiencies).map((toolProficiency) =>
      createToolEntry(toolProficiency, PROFICIENCY_SOURCE.MANUAL, undefined, PROF_LEVEL.PROFICIENT)
    )
  );
}

function normalizeLegacyManualSavingThrowEntries(
  className: string,
  selectedSavingThrows: string[]
): SavingThrowProficiencyEntry[] {
  const automaticSavingThrowSet = new Set<SAVING_THROW_PROFICIENCY>(
    getClassProficiencyProfile(className)?.savingThrowProficiencies ?? []
  );

  return mergeProficiencyEntries(
    normalizeLegacySavingThrowSelections(selectedSavingThrows)
      .map((ability) => getSavingThrowProficiencyForAbilityKey(ability))
      .filter((savingThrow): savingThrow is SAVING_THROW_PROFICIENCY => savingThrow !== undefined)
      .filter((savingThrow) => !automaticSavingThrowSet.has(savingThrow))
      .map((savingThrow) =>
        createSavingThrowEntry(
          savingThrow,
          PROFICIENCY_SOURCE.MANUAL,
          undefined,
          PROF_LEVEL.PROFICIENT
        )
      )
  );
}

function normalizeSkillProficiencyEntries(value: unknown): SkillProficiencyEntry[] {
  return normalizeProficiencyEntries<SkillProficiencyEntry>(value, isSkillProficiency);
}

function normalizeSavingThrowProficiencyEntries(value: unknown): SavingThrowProficiencyEntry[] {
  return normalizeProficiencyEntries<SavingThrowProficiencyEntry>(value, isSavingThrowProficiency);
}

function normalizeWeaponProficiencyEntries(value: unknown): WeaponProficiencyEntry[] {
  return normalizeProficiencyEntries<WeaponProficiencyEntry>(value, isWeaponProficiency);
}

function normalizeArmorProficiencyEntries(value: unknown): ArmorProficiencyEntry[] {
  return normalizeProficiencyEntries<ArmorProficiencyEntry>(value, isArmorProficiency);
}

function normalizeToolProficiencyEntries(value: unknown): ToolProficiencyEntry[] {
  return normalizeProficiencyEntries<ToolProficiencyEntry>(value, isToolProficiency);
}

function normalizeLanguageProficiencyEntries(value: unknown): LanguageProficiencyEntry[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return mergeProficiencyEntries(
    value
      .map((rawEntry) => {
        if (!rawEntry || typeof rawEntry !== "object") {
          return null;
        }

        const entry = rawEntry as Partial<LanguageProficiencyEntry>;

        if (
          typeof entry.proficiency !== "string" ||
          !isLanguageProficiency(entry.proficiency) ||
          typeof entry.source !== "string" ||
          !isProficiencySource(entry.source)
        ) {
          return null;
        }

        const proficiencyLevel =
          typeof entry.proficiencyLevel === "string" && isProfLevel(entry.proficiencyLevel)
            ? entry.proficiencyLevel
            : PROF_LEVEL.PROFICIENT;

        return createLanguageEntry(
          entry.proficiency,
          entry.source,
          typeof entry.sourceStr === "string" ? entry.sourceStr : undefined,
          proficiencyLevel,
          typeof entry.overridePolicy === "string" &&
            isProficiencyOverridePolicy(entry.overridePolicy)
            ? entry.overridePolicy
            : PROFICIENCY_OVERRIDE_POLICY.OVERRIDABLE,
          typeof entry.customDescription === "string" ? entry.customDescription : undefined
        );
      })
      .filter((entry): entry is LanguageProficiencyEntry => entry !== null)
  );
}

export function normalizeCharacterProficiencies(
  options: NormalizeCharacterProficienciesOptions
): CharacterProficiencyCollections {
  const normalizedStoredSkillEntries = normalizeSkillProficiencyEntries(options.skillProficiencies);
  const normalizedStoredSavingThrowEntries = normalizeSavingThrowProficiencyEntries(
    options.savingThrowProficiencies
  );
  const normalizedStoredWeaponEntries = normalizeWeaponProficiencyEntries(options.weaponProficiencies);
  const normalizedStoredArmorEntries = normalizeArmorProficiencyEntries(options.armorProficiencies);
  const normalizedStoredToolEntries = normalizeToolProficiencyEntries(options.toolProficiencies);
  const normalizedStoredLanguageEntries = normalizeLanguageProficiencyEntries(
    options.languageProficiencies
  );
  const legacySkillSelections = splitLegacySkillSelectionsForClass(
    options.className,
    options.legacySkills ?? [],
    options.species,
    options.background
  );
  const legacyToolSelections = splitLegacyToolSelectionsForClass(
    options.className,
    options.legacyToolProficiencies ?? []
  );
  const automaticCollections = getAutomaticProficiencyCollectionsForCharacter(
    options.className,
    options.species,
    options.background,
    {
      level: options.level,
      subclassId: options.subclassId,
      classFeatureState: options.classFeatureState,
      skillProficiencies: normalizedStoredSkillEntries,
      savingThrowProficiencies: normalizedStoredSavingThrowEntries,
      selectedClassSkills: [
        ...getSelectedClassSkillSelectionsFromEntries(
          normalizedStoredSkillEntries,
          options.className
        ),
        ...legacySkillSelections.classSelections
      ],
      selectedClassToolProficiencies: [
        ...getSelectedClassToolSelectionsFromEntries(
          normalizedStoredToolEntries,
          options.className
        ),
        ...legacyToolSelections.classSelections
      ]
    }
  );

  const normalizedSkillEntries = mergeProficiencyEntries([
    ...stripAutomaticEntries(normalizedStoredSkillEntries),
    ...normalizeLegacyManualSkillEntries(
      legacySkillSelections.manualSelections,
      options.legacySkillExpertise ?? []
    ),
    ...automaticCollections.skillProficiencies
  ]);

  const normalizedSavingThrowEntries = mergeProficiencyEntries([
    ...stripAutomaticEntries(normalizedStoredSavingThrowEntries),
    ...normalizeLegacyManualSavingThrowEntries(
      options.className,
      options.legacySavingThrowProficiencies ?? []
    ),
    ...automaticCollections.savingThrowProficiencies
  ]);

  const normalizedWeaponEntries = mergeProficiencyEntries([
    ...stripAutomaticEntries(normalizedStoredWeaponEntries),
    ...automaticCollections.weaponProficiencies
  ]);

  const normalizedArmorEntries = mergeProficiencyEntries([
    ...stripAutomaticEntries(normalizedStoredArmorEntries),
    ...automaticCollections.armorProficiencies
  ]);

  const normalizedToolEntries = mergeProficiencyEntries([
    ...stripAutomaticEntries(normalizedStoredToolEntries),
    ...normalizeLegacyManualToolEntries(legacyToolSelections.manualSelections),
    ...automaticCollections.toolProficiencies
  ]);

  const normalizedLanguageEntries = mergeProficiencyEntries([
    ...stripAutomaticEntries(normalizedStoredLanguageEntries),
    ...automaticCollections.languageProficiencies
  ]);

  return {
    skillProficiencies: normalizedSkillEntries,
    savingThrowProficiencies: normalizedSavingThrowEntries,
    weaponProficiencies: normalizedWeaponEntries,
    armorProficiencies: normalizedArmorEntries,
    toolProficiencies: normalizedToolEntries,
    languageProficiencies: normalizedLanguageEntries
  };
}
