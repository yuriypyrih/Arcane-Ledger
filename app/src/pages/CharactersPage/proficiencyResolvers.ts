import type { SavingThrowProficiencyEntry } from "../../types";
import {
  PROFICIENCY_SOURCE,
  PROF_LEVEL,
  SAVING_THROW_PROFICIENCY,
  SKILL_PROFICIENCY
} from "../../types";
import {
  getSkillProficiencyForSkillName,
  isSkillName
} from "../../types";

const proficiencyLevelRank: Record<PROF_LEVEL, number> = {
  [PROF_LEVEL.NONE]: 0,
  [PROF_LEVEL.PROFICIENT]: 1,
  [PROF_LEVEL.EXPERT]: 2
};

function compareProficiencyLevels(left: PROF_LEVEL, right: PROF_LEVEL): number {
  return proficiencyLevelRank[left] - proficiencyLevelRank[right];
}

function hasPositiveProficiencyLevel(level: PROF_LEVEL): boolean {
  return proficiencyLevelRank[level] >= proficiencyLevelRank[PROF_LEVEL.PROFICIENT];
}

export function getSkillProficiencyForName(skill: string): SKILL_PROFICIENCY | null {
  if (!isSkillName(skill)) {
    return null;
  }

  return getSkillProficiencyForSkillName(skill);
}

export function getSavingThrowLevelFromEntries(
  entries: SavingThrowProficiencyEntry[],
  proficiency: SAVING_THROW_PROFICIENCY
): PROF_LEVEL {
  const automaticEntries = entries.filter(
    (entry) =>
      entry.proficiency === proficiency &&
      entry.source !== PROFICIENCY_SOURCE.MANUAL &&
      hasPositiveProficiencyLevel(entry.proficiencyLevel)
  );

  if (automaticEntries.length > 0) {
    return automaticEntries.reduce(
      (highestLevel, entry) =>
        compareProficiencyLevels(highestLevel, entry.proficiencyLevel) >= 0
          ? highestLevel
          : entry.proficiencyLevel,
      PROF_LEVEL.NONE
    );
  }

  const manualEntry = entries.reduce<SavingThrowProficiencyEntry | null>((highestEntry, entry) => {
    if (
      entry.proficiency !== proficiency ||
      entry.source !== PROFICIENCY_SOURCE.MANUAL
    ) {
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

  return manualEntry?.proficiencyLevel ?? PROF_LEVEL.NONE;
}
