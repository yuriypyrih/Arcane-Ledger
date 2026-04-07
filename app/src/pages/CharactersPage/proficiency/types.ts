import type {
  ArmorProficiencyEntry,
  CharacterClassFeatureState,
  LanguageProficiency,
  LanguageProficiencyEntry,
  SavingThrowProficiencyEntry,
  SkillName,
  SkillProficiencyEntry,
  ToolProficiencyEntry,
  WeaponProficiencyEntry
} from "../../../types";
import type { PROFICIENCY_OVERRIDE_POLICY, PROF_LEVEL } from "../../../types";

export type GrantedProficiencyKind =
  | "skill"
  | "savingThrow"
  | "weapon"
  | "armor"
  | "tool"
  | "language";

export type GrantedProficiency = {
  kind: GrantedProficiencyKind;
  name: string;
  sources: string[];
};

export type GrantedSkillProficiency = {
  skill: SkillName;
  sources: string[];
};

export type ResolvedSkillProficiencies = {
  granted: GrantedSkillProficiency[];
  manual: SkillName[];
  all: SkillName[];
};

export type ProficiencyEntry =
  | SkillProficiencyEntry
  | SavingThrowProficiencyEntry
  | WeaponProficiencyEntry
  | ArmorProficiencyEntry
  | ToolProficiencyEntry
  | LanguageProficiencyEntry;

export type ProficiencyDisplayEntry<
  TProficiency extends ProficiencyEntry["proficiency"] = ProficiencyEntry["proficiency"]
> = {
  proficiency: TProficiency;
  proficiencyLevel: PROF_LEVEL;
  sourceLabels: string[];
  locked?: boolean;
};

export type ResolvedProficiencyEntry<
  TProficiency extends ProficiencyEntry["proficiency"] = ProficiencyEntry["proficiency"]
> = {
  proficiency: TProficiency;
  proficiencyLevel: PROF_LEVEL;
  sourceLabels: string[];
  locked: boolean;
  overridePolicy: PROFICIENCY_OVERRIDE_POLICY;
};

export type NormalizeCharacterProficienciesOptions = {
  className: string;
  level: number;
  species: string;
  background: string;
  subclassId?: string;
  classFeatureState?: CharacterClassFeatureState;
  skillProficiencies?: unknown;
  savingThrowProficiencies?: unknown;
  weaponProficiencies?: unknown;
  armorProficiencies?: unknown;
  toolProficiencies?: unknown;
  languageProficiencies?: unknown;
  legacySkills?: string[];
  legacySkillExpertise?: string[];
  legacySavingThrowProficiencies?: string[];
  legacyToolProficiencies?: string[];
};
