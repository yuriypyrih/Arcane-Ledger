import {
  ARMOR_PROFICIENCY,
  PROFICIENCY_OVERRIDE_POLICY,
  PROFICIENCY_SOURCE,
  PROF_LEVEL,
  TOOL_PROFICIENCY,
  WEAPON_PROFICIENCY,
  type ArmorProficiencyEntry,
  type ToolProficiencyEntry,
  type WeaponProficiencyEntry
} from "../../../../../types";
import type {
  FeatureArmorProficiencyEntry,
  FeatureToolProficiencyEntry,
  FeatureWeaponProficiencyEntry
} from "../../types";
import type { SubclassRuntimeCharacter } from "../../subclassRuntime";

export function hasArtificerSubclassFeature(
  character: SubclassRuntimeCharacter,
  subclassId: string,
  minimumLevel: number
): boolean {
  return (
    character.className === "Artificer" &&
    character.subclassId === subclassId &&
    (character.level ?? 0) >= minimumLevel
  );
}

export function createArtificerToolProficiencyEntries(
  proficiencies: readonly TOOL_PROFICIENCY[],
  sourceStr: string
): FeatureToolProficiencyEntry[] {
  return proficiencies.map(
    (proficiency) =>
      ({
        source: PROFICIENCY_SOURCE.CLASS,
        sourceStr,
        proficiency,
        proficiencyLevel: PROF_LEVEL.PROFICIENT,
        overridePolicy: PROFICIENCY_OVERRIDE_POLICY.LOCKED
      }) satisfies ToolProficiencyEntry
  );
}

export function createArtificerArmorProficiencyEntries(
  proficiencies: readonly ARMOR_PROFICIENCY[],
  sourceStr: string
): FeatureArmorProficiencyEntry[] {
  return proficiencies.map(
    (proficiency) =>
      ({
        source: PROFICIENCY_SOURCE.CLASS,
        sourceStr,
        proficiency,
        proficiencyLevel: PROF_LEVEL.PROFICIENT,
        overridePolicy: PROFICIENCY_OVERRIDE_POLICY.LOCKED
      }) satisfies ArmorProficiencyEntry
  );
}

export function createArtificerWeaponProficiencyEntries(
  proficiencies: readonly WEAPON_PROFICIENCY[],
  sourceStr: string
): FeatureWeaponProficiencyEntry[] {
  return proficiencies.map(
    (proficiency) =>
      ({
        source: PROFICIENCY_SOURCE.CLASS,
        sourceStr,
        proficiency,
        proficiencyLevel: PROF_LEVEL.PROFICIENT,
        overridePolicy: PROFICIENCY_OVERRIDE_POLICY.LOCKED
      }) satisfies WeaponProficiencyEntry
  );
}
