import { SKILL, type SkillName } from "../../../../types";
import type { FeatureSkillBonusContribution } from "../../featureContributions";

export const smoothTalkerSkills: readonly SkillName[] = [
  SKILL.DECEPTION,
  SKILL.INTIMIDATION,
  SKILL.PERSUASION
];

export const smoothTalkerSkillBonus: FeatureSkillBonusContribution = {
  id: "feat-arcane-eloquence-smooth-talker",
  getBonuses: (skill, _proficiencyLevel, ability) =>
    ability === "CHA" && smoothTalkerSkills.includes(skill)
      ? [{ label: "Smooth Talker", formula: "1d4", formulaSourceLabel: "Smooth Talker" }]
      : []
};
