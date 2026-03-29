import type { ReactNode } from "react";
import {
  CLASS_FEATURE,
  FEAT_CATEGORY,
  FEATS,
  type DivinityEntry,
  type SpellEntry
} from "../../../../codex/entries";
import { createCharacterFeatEntry } from "../../../../pages/CharactersPage/feats";
import {
  getLanguageLevelFromEntries,
  getSkillLevelFromEntries,
  getSkillProficiencyForName,
  languageProficiencyOptions
} from "../../../../pages/CharactersPage/proficiency";
import { PROF_LEVEL } from "../../../../types";
import type {
  Character,
  CharacterFeatEntry,
  CharacterFeatSource,
  LANGUAGE_PROFICIENCY,
  SkillName
} from "../../../../types";
import { renderCodexRichText } from "../../../../utils/codex/renderCodexRichText";
import styles from "./ClassFeaturesAndFeats.module.css";

export const wizardScholarSkillOptions: SkillName[] = [
  "Arcana",
  "History",
  "Investigation",
  "Medicine",
  "Nature",
  "Religion"
];

export function isFeatChoiceFeature(feature: CLASS_FEATURE): boolean {
  return (
    feature === CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT ||
    feature === CLASS_FEATURE.EPIC_BOON ||
    feature === CLASS_FEATURE.FIGHTING_STYLE
  );
}

export function getBardExpertiseTierForLevel(level: number): "level2" | "level9" | null {
  if (level === 2) {
    return "level2";
  }

  if (level === 9) {
    return "level9";
  }

  return null;
}

export function getRogueExpertiseTierForLevel(level: number): "level1" | "level6" | null {
  if (level === 1) {
    return "level1";
  }

  if (level === 6) {
    return "level6";
  }

  return null;
}

export function getDefaultFeatCategoryForFeature(feature: CLASS_FEATURE): FEAT_CATEGORY {
  if (feature === CLASS_FEATURE.FIGHTING_STYLE) {
    return FEAT_CATEGORY.FIGHTING_STYLE;
  }

  if (feature === CLASS_FEATURE.EPIC_BOON) {
    return FEAT_CATEGORY.EPIC_BOON;
  }

  return FEAT_CATEGORY.GENERAL;
}

export function createClassFeatureFeatSource(
  level: number,
  feature: CLASS_FEATURE
): CharacterFeatSource & {
  type: "class-feature";
} {
  return {
    type: "class-feature",
    level,
    feature
  };
}

export function isFeatFromClassFeatureSource(
  entry: CharacterFeatEntry,
  level: number,
  feature: CLASS_FEATURE
): boolean {
  return (
    entry.source.type === "class-feature" &&
    entry.source.level === level &&
    entry.source.feature === feature
  );
}

export function renderDescriptionLine(
  line: string,
  onOpenKeyword: (keywordKey: string, title?: string) => void,
  onOpenFeat: (feat: FEATS) => void,
  onOpenSpell: (spell: SpellEntry) => void,
  onOpenDivinity: (divinity: DivinityEntry) => void
): ReactNode {
  return renderCodexRichText(line, {
    linkClassName: styles.keywordButton,
    onOpenKeyword: (resolvedKeyword) => onOpenKeyword(resolvedKeyword.key, resolvedKeyword.title),
    onOpenSpell,
    onOpenDivinity,
    onOpenFeat: (feat) => onOpenFeat(feat)
  });
}

export function buildSelectionArray(
  currentSelections: readonly string[],
  length: number
): string[] {
  return Array.from({ length }, (_, index) => currentSelections[index] ?? "");
}

export function updateSelectionAtIndex(
  currentSelections: readonly string[],
  length: number,
  index: number,
  nextValue: string
): string[] {
  const nextSelections = buildSelectionArray(currentSelections, length);
  nextSelections[index] = nextValue;
  return nextSelections;
}

export function filterAvailableChoices<T extends string>(
  allOptions: readonly T[],
  currentValue: T | null | undefined,
  blockedSelections: readonly T[]
): T[] {
  const blockedSelectionSet = new Set(blockedSelections);

  return allOptions.filter((option) => {
    if (currentValue === option) {
      return true;
    }

    return !blockedSelectionSet.has(option);
  });
}

export function getSelectableProficientSkillOptions(
  character: Pick<Character, "skillProficiencies">,
  options: readonly SkillName[],
  currentValue: SkillName | null | undefined,
  blockedSelections: readonly SkillName[] = []
): SkillName[] {
  return filterAvailableChoices(options, currentValue, blockedSelections).filter((skillName) => {
    if (currentValue === skillName) {
      return true;
    }

    const proficiency = getSkillProficiencyForName(skillName);

    return (
      proficiency !== null &&
      getSkillLevelFromEntries(character.skillProficiencies ?? [], proficiency) ===
        PROF_LEVEL.PROFICIENT
    );
  });
}

export function getSelectableLanguageOptions(
  character: Pick<Character, "languageProficiencies">,
  currentValue: LANGUAGE_PROFICIENCY | null | undefined,
  blockedSelections: readonly LANGUAGE_PROFICIENCY[] = []
): LANGUAGE_PROFICIENCY[] {
  return filterAvailableChoices(languageProficiencyOptions, currentValue, blockedSelections).filter(
    (proficiency) => {
      if (currentValue === proficiency) {
        return true;
      }

      return (
        getLanguageLevelFromEntries(character.languageProficiencies ?? [], proficiency) ===
        PROF_LEVEL.NONE
      );
    }
  );
}

export function createFeatEntryForContext(
  feat: FEATS,
  featTakenAtLevel: number,
  options?: Parameters<typeof createCharacterFeatEntry>[2]
) {
  return createCharacterFeatEntry(feat, featTakenAtLevel, options);
}
