import { getSpellEntriesForSpellListClasses } from "../../../../../codex/classes";
import {
  CLASS_FEATURE,
  getReactionEntryById,
  SPELL_LIST_CLASS,
  type SpellEntry
} from "../../../../../codex/entries";
import type {
  Character,
  CharacterBardFeatureState,
  SkillName,
  SkillProficiencyEntry
} from "../../../../../types";
import {
  PROFICIENCY_OVERRIDE_POLICY,
  PROFICIENCY_SOURCE,
  PROF_LEVEL,
  getSkillProficiencyForSkillName,
  isSkillName
} from "../../../../../types";
import { getSpellLevel, getSpellSlotTotalsForCharacter } from "../../../spellcasting";
import { getFeatureDescriptionForCharacter } from "../../featureDescriptions";
import type { FeatureSkillProficiencyEntry } from "../../types";
import type { SubclassRuntimeResolver } from "../../subclassRuntime";

export const collegeOfLoreSubclassId = "bard-college-of-lore";
const bardLoreBonusProficienciesSourceLabel = "College of Lore: Bonus Proficiencies";

type BardLoreCharacter = Pick<Character, "className"> &
  Partial<
    Pick<Character, "level" | "subclassId" | "classFeatureState">
  >;

export function hasBardCollegeOfLoreBonusProficienciesFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Bard" &&
    character.subclassId === collegeOfLoreSubclassId &&
    (character.level ?? 0) >= 3
  );
}

export function hasBardCollegeOfLoreMagicalDiscoveriesFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Bard" &&
    character.subclassId === collegeOfLoreSubclassId &&
    (character.level ?? 0) >= 6
  );
}

export function normalizeBardCollegeOfLoreBonusProficiencySelections(value: unknown): SkillName[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return [
    ...new Set(
      value.filter((entry): entry is SkillName => typeof entry === "string" && isSkillName(entry))
    )
  ].slice(0, 3);
}

export function normalizeBardCollegeOfLoreMagicalDiscoveriesSpellIds(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return [
    ...new Set(
      value.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0)
    )
  ].slice(0, 2);
}

export function normalizeBardCollegeOfLoreFeatureState(
  value: Partial<CharacterBardFeatureState>,
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): Pick<CharacterBardFeatureState, "loreBonusProficiencies" | "magicalDiscoveriesSpellIds"> {
  return {
    loreBonusProficiencies: hasBardCollegeOfLoreBonusProficienciesFeature(character)
      ? normalizeBardCollegeOfLoreBonusProficiencySelections(value.loreBonusProficiencies)
      : undefined,
    magicalDiscoveriesSpellIds: hasBardCollegeOfLoreMagicalDiscoveriesFeature(character)
      ? normalizeBardCollegeOfLoreMagicalDiscoveriesSpellIds(value.magicalDiscoveriesSpellIds)
      : undefined
  };
}

export function getBardCollegeOfLoreBonusProficiencySelections(
  character: BardLoreCharacter
): SkillName[] {
  return character.classFeatureState?.bard?.loreBonusProficiencies ?? [];
}

function createBardCollegeOfLoreBonusProficiencyEntry(
  skill: SkillName
): SkillProficiencyEntry | null {
  return {
    source: PROFICIENCY_SOURCE.CLASS,
    sourceStr: bardLoreBonusProficienciesSourceLabel,
    proficiency: getSkillProficiencyForSkillName(skill),
    proficiencyLevel: PROF_LEVEL.PROFICIENT,
    overridePolicy: PROFICIENCY_OVERRIDE_POLICY.LOCKED
  };
}

export function getBardCollegeOfLoreSkillProficiencyEntries(
  character: BardLoreCharacter
): FeatureSkillProficiencyEntry[] {
  if (!hasBardCollegeOfLoreBonusProficienciesFeature(character)) {
    return [];
  }

  return getBardCollegeOfLoreBonusProficiencySelections(character)
    .map((skill) => createBardCollegeOfLoreBonusProficiencyEntry(skill))
    .filter((entry): entry is SkillProficiencyEntry => entry !== null);
}

export function setBardCollegeOfLoreBonusProficiencySelections(
  character: Character,
  bardState: CharacterBardFeatureState,
  selections: SkillName[]
): Character {
  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      bard: {
        ...bardState,
        loreBonusProficiencies: normalizeBardCollegeOfLoreBonusProficiencySelections(selections)
      }
    }
  };
}

export function getBardCollegeOfLoreMagicalDiscoveriesSpellOptions(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): SpellEntry[] {
  if (!hasBardCollegeOfLoreMagicalDiscoveriesFeature(character)) {
    return [];
  }

  const highestSlotLevel = getSpellSlotTotalsForCharacter(
    character.className,
    character.level
  ).reduce((highestLevel, totalSlots, index) => (totalSlots > 0 ? index + 1 : highestLevel), 0);

  return getSpellEntriesForSpellListClasses([
    SPELL_LIST_CLASS.CLERIC,
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.WIZARD
  ]).filter((spell) => {
    const spellLevel = getSpellLevel(spell);
    return spellLevel === 0 || spellLevel <= highestSlotLevel;
  });
}

export function getBardCollegeOfLoreMagicalDiscoveriesSpellIds(
  character: BardLoreCharacter
): string[] {
  if (!hasBardCollegeOfLoreMagicalDiscoveriesFeature(character)) {
    return [];
  }

  const availableSpellIds = new Set(
    getBardCollegeOfLoreMagicalDiscoveriesSpellOptions({
      className: character.className,
      level: character.level ?? 0,
      subclassId: character.subclassId
    }).map((spell) => spell.id)
  );

  return (character.classFeatureState?.bard?.magicalDiscoveriesSpellIds ?? []).filter((spellId) =>
    availableSpellIds.has(spellId)
  );
}

export function setBardCollegeOfLoreMagicalDiscoveriesSpellIds(
  character: Character,
  bardState: CharacterBardFeatureState,
  spellIds: string[]
): Character {
  if (!hasBardCollegeOfLoreMagicalDiscoveriesFeature(character)) {
    return character;
  }

  const availableSpellIds = new Set(
    getBardCollegeOfLoreMagicalDiscoveriesSpellOptions(character).map((spell) => spell.id)
  );

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      bard: {
        ...bardState,
        magicalDiscoveriesSpellIds: normalizeBardCollegeOfLoreMagicalDiscoveriesSpellIds(
          spellIds
        ).filter((spellId) => availableSpellIds.has(spellId))
      }
    }
  };
}

export const getBardCollegeOfLoreDerivedFeatureState: SubclassRuntimeResolver = (character) => {
  if (
    character.className !== "Bard" ||
    character.subclassId !== collegeOfLoreSubclassId ||
    (character.level ?? 0) < 3
  ) {
    return {};
  }

  const cuttingWords = getReactionEntryById("reaction-cutting-words");

  return cuttingWords
    ? {
        reactionEntries: [
          {
            ...cuttingWords,
            description: getFeatureDescriptionForCharacter(character, CLASS_FEATURE.CUTTING_WORDS)
          }
        ]
      }
    : {};
};
