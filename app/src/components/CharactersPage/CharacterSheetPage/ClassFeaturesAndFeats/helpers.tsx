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
  getEffectiveNonExpertSkillOptions,
  getEffectiveProficientSkillOptions,
  getEffectiveUnproficientSavingThrowOptions,
  getEffectiveUnproficientSkillOptions,
  getEffectiveUnproficientToolOptions,
  getSourceChoiceLanguageOptions,
  getSourceChoiceSavingThrowOptions,
  getSourceChoiceSkillOptions,
  getSourceChoiceToolOptions
} from "../../../../pages/CharactersPage/proficiency";
import {
  getToolProficiencyLabel,
  type ToolProficiency
} from "../../../../pages/CharactersPage/proficiencyOptions";
import { SKILL } from "../../../../types";
import type {
  CharacterFeatEntry,
  CharacterFeatSource,
  SkillName
} from "../../../../types";
import { featureDisclosureStyles } from "../../../FeatureDisclosure";
import { renderCodexRichText } from "../../../../utils/codex/renderCodexRichText";

export const wizardScholarSkillOptions: SkillName[] = [
  SKILL.ARCANA,
  SKILL.HISTORY,
  SKILL.INVESTIGATION,
  SKILL.MEDICINE,
  SKILL.NATURE,
  SKILL.RELIGION
];

export function isFeatChoiceFeature(feature: CLASS_FEATURE): boolean {
  return (
    feature === CLASS_FEATURE.ABILITY_SCORE_IMPROVEMENT ||
    feature === CLASS_FEATURE.EPIC_BOON ||
    feature === CLASS_FEATURE.FIGHTING_STYLE ||
    feature === CLASS_FEATURE.ADDITIONAL_FIGHTING_STYLE
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
  if (
    feature === CLASS_FEATURE.FIGHTING_STYLE ||
    feature === CLASS_FEATURE.ADDITIONAL_FIGHTING_STYLE
  ) {
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
    linkClassName: featureDisclosureStyles.inlineLinkButton,
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

export type SkillSelectOption<TSkill extends SkillName = SkillName> = {
  skill: TSkill;
  disabled: boolean;
  label: string;
};

export type ToolSelectOption<TTool extends ToolProficiency = ToolProficiency> = {
  tool: TTool;
  disabled: boolean;
  label: string;
};

export function buildSkillSelectOptions<TSkill extends SkillName>(
  allOptions: readonly TSkill[],
  availableOptions: readonly TSkill[],
  currentValue: TSkill | null | undefined
): SkillSelectOption<TSkill>[] {
  const availableOptionSet = new Set(availableOptions);

  return allOptions.map((skill) => ({
    skill,
    disabled: currentValue !== skill && !availableOptionSet.has(skill),
    label: skill
  }));
}

export function buildToolSelectOptions<TTool extends ToolProficiency>(
  allOptions: readonly TTool[],
  availableOptions: readonly TTool[],
  currentValue: TTool | null | undefined
): ToolSelectOption<TTool>[] {
  const availableOptionSet = new Set(availableOptions);

  return allOptions.map((tool) => ({
    tool,
    disabled: currentValue !== tool && !availableOptionSet.has(tool),
    label: getToolProficiencyLabel(tool)
  }));
}

export {
  getEffectiveNonExpertSkillOptions,
  getEffectiveProficientSkillOptions,
  getEffectiveUnproficientSavingThrowOptions,
  getEffectiveUnproficientSkillOptions,
  getEffectiveUnproficientToolOptions,
  getSourceChoiceLanguageOptions,
  getSourceChoiceSavingThrowOptions,
  getSourceChoiceSkillOptions,
  getSourceChoiceToolOptions
};

export function createFeatEntryForContext(
  feat: FEATS,
  featTakenAtLevel: number,
  options?: Parameters<typeof createCharacterFeatEntry>[2]
) {
  return createCharacterFeatEntry(feat, featTakenAtLevel, options);
}
