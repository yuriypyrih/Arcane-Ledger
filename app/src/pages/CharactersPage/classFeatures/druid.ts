import { druidFeatures } from "../../../codex/classes";
import { CLASS_FEATURE } from "../../../codex/entries";
import type {
  Character,
  CharacterDruidFeatureState,
  DruidPrimalOrderChoice
} from "../../../types";
import {
  ARMOR_PROFICIENCY,
  LANGUAGE_PROFICIENCY,
  PROFICIENCY_SOURCE,
  PROF_LEVEL,
  WEAPON_PROFICIENCY,
  type ArmorProficiencyEntry,
  type LanguageProficiencyEntry,
  type SkillName,
  type WeaponProficiencyEntry
} from "../../../types";
import type {
  FeatureArmorProficiencyEntry,
  FeatureLanguageProficiencyEntry,
  FeatureSkillBonus,
  FeatureWeaponProficiencyEntry
} from "./types";

const primalOrderWardenSource = "Primal Order";
const druidicSource = "Druidic";
const speakWithAnimalsSpellId = "spell-speak-with-animals";

function getDruidFeatureRow(level: number) {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));
  const matchingRows = druidFeatures
    .filter((row) => row.level <= normalizedLevel)
    .sort((left, right) => left.level - right.level);

  return matchingRows.length > 0 ? matchingRows[matchingRows.length - 1] : null;
}

function getUnlockedDruidFeatures(level: number): Set<CLASS_FEATURE> {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));

  return druidFeatures
    .filter((row) => row.level <= normalizedLevel)
    .reduce((featureSet, row) => {
      row.classFeatures.forEach((feature) => {
        featureSet.add(feature);
      });

      return featureSet;
    }, new Set<CLASS_FEATURE>());
}

function hasDruidFeature(
  character: Pick<Character, "className" | "level">,
  feature: CLASS_FEATURE
): boolean {
  if (character.className !== "Druid") {
    return false;
  }

  return getUnlockedDruidFeatures(character.level).has(feature);
}

function getDruidWisdomModifier(
  character: Pick<Character, "abilities">
): number {
  return Math.floor((Math.max(1, Math.floor(character.abilities.WIS)) - 10) / 2);
}

export function normalizeDruidFeatureState(
  value: unknown,
  character: Pick<Character, "className" | "level">
): CharacterDruidFeatureState {
  if (!hasDruidFeature(character, CLASS_FEATURE.PRIMAL_ORDER)) {
    return {};
  }

  const record =
    value && typeof value === "object" ? (value as Partial<CharacterDruidFeatureState>) : {};

  return {
    primalOrderChoice:
      record.primalOrderChoice === "magician" || record.primalOrderChoice === "warden"
        ? record.primalOrderChoice
        : undefined
  };
}

export function getDruidPrimalOrderChoice(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): DruidPrimalOrderChoice | null {
  if (!hasDruidFeature(character, CLASS_FEATURE.PRIMAL_ORDER)) {
    return null;
  }

  return normalizeDruidFeatureState(character.classFeatureState?.druid, character)
    .primalOrderChoice ?? null;
}

export function setDruidPrimalOrderChoice(
  character: Character,
  primalOrderChoice: DruidPrimalOrderChoice
): Character {
  if (!hasDruidFeature(character, CLASS_FEATURE.PRIMAL_ORDER)) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      druid: {
        ...normalizeDruidFeatureState(character.classFeatureState?.druid, character),
        primalOrderChoice
      }
    }
  };
}

export function getDruidCantripBonus(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  return getDruidPrimalOrderChoice(character) === "magician" ? 1 : 0;
}

export function getDruidSkillBonuses(
  character: Pick<Character, "className" | "level" | "classFeatureState">,
  skill: SkillName
): FeatureSkillBonus[] {
  if (getDruidPrimalOrderChoice(character) !== "magician") {
    return [];
  }

  if (skill !== "Arcana" && skill !== "Nature") {
    return [];
  }

  return [
    {
      label: "WIS (Primal Order)",
      abilityModifierSource: "WIS",
      minimumValue: 1
    }
  ];
}

export function getDruidWeaponProficiencyEntries(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureWeaponProficiencyEntry[] {
  if (getDruidPrimalOrderChoice(character) !== "warden") {
    return [];
  }

  return [
    {
      source: PROFICIENCY_SOURCE.CLASS,
      sourceStr: primalOrderWardenSource,
      proficiency: WEAPON_PROFICIENCY.MARTIAL,
      proficiencyLevel: PROF_LEVEL.PROFICIENT
    } satisfies WeaponProficiencyEntry
  ];
}

export function getDruidArmorProficiencyEntries(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureArmorProficiencyEntry[] {
  if (getDruidPrimalOrderChoice(character) !== "warden") {
    return [];
  }

  return [
    {
      source: PROFICIENCY_SOURCE.CLASS,
      sourceStr: primalOrderWardenSource,
      proficiency: ARMOR_PROFICIENCY.MEDIUM,
      proficiencyLevel: PROF_LEVEL.PROFICIENT
    } satisfies ArmorProficiencyEntry
  ];
}

export function getDruidLanguageProficiencyEntries(
  character: Pick<Character, "className" | "level">
): FeatureLanguageProficiencyEntry[] {
  if (!hasDruidFeature(character, CLASS_FEATURE.DRUIDIC)) {
    return [];
  }

  return [
    {
      source: PROFICIENCY_SOURCE.CLASS,
      sourceStr: druidicSource,
      proficiency: LANGUAGE_PROFICIENCY.DRUIDIC,
      proficiencyLevel: PROF_LEVEL.PROFICIENT
    } satisfies LanguageProficiencyEntry
  ];
}

export function getDruidAlwaysPreparedSpellIds(
  character: Pick<Character, "className" | "level">
): string[] {
  if (!hasDruidFeature(character, CLASS_FEATURE.DRUIDIC)) {
    return [];
  }

  return [speakWithAnimalsSpellId];
}

export function hasDruidSpellcastingFeature(
  character: Pick<Character, "className" | "level">
): boolean {
  return hasDruidFeature(character, CLASS_FEATURE.SPELLCASTING);
}

export function getDruidCantripCountForLevel(level: number): number | null {
  const cantripCount = getDruidFeatureRow(level)?.cantrips;
  return typeof cantripCount === "number" ? Math.max(0, Math.floor(cantripCount)) : null;
}

export function getDruidSpellPreparationCountForLevel(level: number): number | null {
  const preparedSpells = getDruidFeatureRow(level)?.preparedSpells;
  return typeof preparedSpells === "number" ? Math.max(0, Math.floor(preparedSpells)) : null;
}

export function getDruidPrimalOrderWisdomModifier(
  character: Pick<Character, "abilities">
): number {
  return getDruidWisdomModifier(character);
}
