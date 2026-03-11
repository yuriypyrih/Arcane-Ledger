export enum Skill {
  Acrobatics = "Acrobatics",
  AnimalHandling = "Animal Handling",
  Arcana = "Arcana",
  Athletics = "Athletics",
  Deception = "Deception",
  History = "History",
  Insight = "Insight",
  Intimidation = "Intimidation",
  Investigation = "Investigation",
  Medicine = "Medicine",
  Nature = "Nature",
  Perception = "Perception",
  Performance = "Performance",
  Persuasion = "Persuasion",
  Religion = "Religion",
  SleightOfHand = "Sleight of Hand",
  Stealth = "Stealth",
  Survival = "Survival"
}

export type SkillName = `${Skill}`;

export const ALL_SKILLS = [
  Skill.Acrobatics,
  Skill.AnimalHandling,
  Skill.Arcana,
  Skill.Athletics,
  Skill.Deception,
  Skill.History,
  Skill.Insight,
  Skill.Intimidation,
  Skill.Investigation,
  Skill.Medicine,
  Skill.Nature,
  Skill.Perception,
  Skill.Performance,
  Skill.Persuasion,
  Skill.Religion,
  Skill.SleightOfHand,
  Skill.Stealth,
  Skill.Survival
] as const satisfies readonly SkillName[];
