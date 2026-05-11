import type {
  ArmorProficiencyEntry,
  CharacterProficiencyCollections,
  LanguageProficiencyEntry,
  SavingThrowProficiencyEntry,
  SkillProficiencyEntry,
  ToolProficiencyEntry,
  WeaponProficiencyEntry
} from "../../../types";
import { PROFICIENCY_OVERRIDE_POLICY, PROF_LEVEL } from "../../../types";
import { isLanguageProficiency } from "../proficiencyOptions";
import { getAutomaticProficiencyCollectionsForCharacter } from "./automatic";
import {
  createLanguageEntry,
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
  stripAutomaticEntries
} from "./core";
import {
  getSelectedClassSkillSelectionsFromEntries,
  getSelectedClassToolSelectionsFromEntries
} from "./manual";
import type { NormalizeCharacterProficienciesOptions } from "./types";

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
  const normalizedStoredWeaponEntries = normalizeWeaponProficiencyEntries(
    options.weaponProficiencies
  );
  const normalizedStoredArmorEntries = normalizeArmorProficiencyEntries(options.armorProficiencies);
  const normalizedStoredToolEntries = normalizeToolProficiencyEntries(options.toolProficiencies);
  const normalizedStoredLanguageEntries = normalizeLanguageProficiencyEntries(
    options.languageProficiencies
  );
  const automaticCollections = getAutomaticProficiencyCollectionsForCharacter(
    options.className,
    options.species,
    options.background,
    {
      backgroundChoices: options.backgroundChoices,
      level: options.level,
      subclassId: options.subclassId,
      classFeatureState: options.classFeatureState,
      speciesChoices: options.speciesChoices,
      skillProficiencies: normalizedStoredSkillEntries,
      savingThrowProficiencies: normalizedStoredSavingThrowEntries,
      selectedClassSkills: [
        ...getSelectedClassSkillSelectionsFromEntries(
          normalizedStoredSkillEntries,
          options.className
        )
      ],
      selectedClassToolProficiencies: [
        ...getSelectedClassToolSelectionsFromEntries(
          normalizedStoredToolEntries,
          options.className
        )
      ]
    }
  );

  const normalizedSkillEntries = mergeProficiencyEntries([
    ...stripAutomaticEntries(normalizedStoredSkillEntries),
    ...automaticCollections.skillProficiencies
  ]);

  const normalizedSavingThrowEntries = mergeProficiencyEntries([
    ...stripAutomaticEntries(normalizedStoredSavingThrowEntries),
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
