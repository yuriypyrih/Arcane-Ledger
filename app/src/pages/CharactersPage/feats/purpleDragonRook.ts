import type { PurpleDragonRookChoice, SkillName } from "../../../types";

export const purpleDragonRookSkillOptions: SkillName[] = [
  "Insight",
  "Performance",
  "Persuasion"
];

const purpleDragonRookSkillOptionSet = new Set<SkillName>(purpleDragonRookSkillOptions);

export function getDefaultPurpleDragonRookSkill(): PurpleDragonRookChoice["skill"] {
  return "Insight";
}

export function isPurpleDragonRookSkill(value: unknown): value is PurpleDragonRookChoice["skill"] {
  return (
    typeof value === "string" &&
    purpleDragonRookSkillOptionSet.has(value as PurpleDragonRookChoice["skill"])
  );
}

export function normalizePurpleDragonRookChoice(
  value: unknown
): PurpleDragonRookChoice | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<PurpleDragonRookChoice>;

  if (!isPurpleDragonRookSkill(record.skill)) {
    return undefined;
  }

  return {
    skill: record.skill,
    rallyingCryExpended: record.rallyingCryExpended === true ? true : undefined
  };
}

export function getPurpleDragonRookChoiceSummary(
  choice?: PurpleDragonRookChoice
): string | null {
  return choice ? `Skill: ${choice.skill}` : null;
}
