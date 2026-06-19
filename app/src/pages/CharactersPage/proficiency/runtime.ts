import type {
  ArmorProficiencyEntry,
  CharacterStatusEntry,
  CharacterProficiencyCollections,
  LanguageProficiency,
  LanguageProficiencyEntry,
  SavingThrowProficiencyEntry,
  SkillName,
  SkillProficiencyEntry,
  ToolProficiencyEntry,
  WeaponProficiencyEntry
} from "../../../types";
import {
  ARMOR_PROFICIENCY,
  PROF_LEVEL,
  SAVING_THROW_PROFICIENCY,
  SKILL_PROFICIENCY,
  TOOL_PROFICIENCY,
  WEAPON_PROFICIENCY
} from "../../../types";
import { getSkillProficiencyForName } from "../proficiencyResolvers";
import { getBorrowedKnowledgeSkillProficiencyEntriesForCharacter } from "../characterRuntime/spellImplementations/borrowedKnowledge";
import { languageProficiencyOptions, type ToolProficiency } from "../proficiencyOptions";
import {
  mergeProficiencyEntries,
  getResolvedProficiencyEntry,
  type ResolvedProficiencyEntry
} from "./core";
import { getResolvedSkillProficiencyEntry } from "./manual";

type ProficiencyRuntimeCharacter = Partial<CharacterProficiencyCollections> & {
  statusEntries?: CharacterStatusEntry[];
};

type ProficiencyChoiceRuntime = {
  skills: <TSkill extends SkillName>(
    options: readonly TSkill[],
    currentValue: TSkill | null | undefined,
    blockedSelections?: readonly TSkill[]
  ) => TSkill[];
  tools: <TTool extends ToolProficiency>(
    options: readonly TTool[],
    currentValue: TTool | null | undefined,
    blockedSelections?: readonly TTool[]
  ) => TTool[];
  languages: <TLanguage extends LanguageProficiency>(
    options: readonly TLanguage[],
    currentValue: TLanguage | null | undefined,
    blockedSelections?: readonly TLanguage[]
  ) => TLanguage[];
  savingThrows: <TSavingThrow extends SAVING_THROW_PROFICIENCY>(
    options: readonly TSavingThrow[],
    currentValue: TSavingThrow | null | undefined,
    blockedSelections?: readonly TSavingThrow[]
  ) => TSavingThrow[];
};

export type CharacterProficiencySummaryRuntime = {
  getSkill: (skill: SkillName) => ResolvedProficiencyEntry<SKILL_PROFICIENCY> | null;
  getSkillProficiency: (
    proficiency: SKILL_PROFICIENCY
  ) => ResolvedProficiencyEntry<SKILL_PROFICIENCY>;
  getSavingThrow: (
    proficiency: SAVING_THROW_PROFICIENCY
  ) => ResolvedProficiencyEntry<SAVING_THROW_PROFICIENCY>;
  getWeapon: (proficiency: WEAPON_PROFICIENCY) => ResolvedProficiencyEntry<WEAPON_PROFICIENCY>;
  getArmor: (proficiency: ARMOR_PROFICIENCY) => ResolvedProficiencyEntry<ARMOR_PROFICIENCY>;
  getTool: (proficiency: TOOL_PROFICIENCY) => ResolvedProficiencyEntry<TOOL_PROFICIENCY>;
  getLanguage: (proficiency: LanguageProficiency) => ResolvedProficiencyEntry<LanguageProficiency>;
};

export type CharacterEffectiveProficiencyChoiceRuntime = {
  proficientSkills: ProficiencyChoiceRuntime["skills"];
  nonExpertSkills: ProficiencyChoiceRuntime["skills"];
  unproficientSkills: ProficiencyChoiceRuntime["skills"];
  unproficientTools: ProficiencyChoiceRuntime["tools"];
  unproficientSavingThrows: ProficiencyChoiceRuntime["savingThrows"];
};

export type CharacterProficiencyRuntime = {
  collections: CharacterProficiencyCollections;
  summary: CharacterProficiencySummaryRuntime;
  sourceChoices: ProficiencyChoiceRuntime;
  effectiveChoices: CharacterEffectiveProficiencyChoiceRuntime;
};

const proficiencyRuntimeByCharacter = new WeakMap<object, CharacterProficiencyRuntime>();

const emptyCollections: CharacterProficiencyCollections = {
  skillProficiencies: [],
  savingThrowProficiencies: [],
  weaponProficiencies: [],
  armorProficiencies: [],
  toolProficiencies: [],
  languageProficiencies: []
};

function createCollections(
  character: ProficiencyRuntimeCharacter
): CharacterProficiencyCollections {
  const spellSkillProficiencies =
    getBorrowedKnowledgeSkillProficiencyEntriesForCharacter(character);

  return {
    skillProficiencies: mergeProficiencyEntries([
      ...(character.skillProficiencies ?? emptyCollections.skillProficiencies),
      ...spellSkillProficiencies
    ]),
    savingThrowProficiencies:
      character.savingThrowProficiencies ?? emptyCollections.savingThrowProficiencies,
    weaponProficiencies: character.weaponProficiencies ?? emptyCollections.weaponProficiencies,
    armorProficiencies: character.armorProficiencies ?? emptyCollections.armorProficiencies,
    toolProficiencies: character.toolProficiencies ?? emptyCollections.toolProficiencies,
    languageProficiencies:
      character.languageProficiencies ?? emptyCollections.languageProficiencies
  };
}

function filterSourceChoices<TValue extends string>(
  options: readonly TValue[],
  currentValue: TValue | null | undefined,
  blockedSelections: readonly TValue[] = []
): TValue[] {
  const blockedSelectionSet = new Set(blockedSelections);

  return options.filter((option) => currentValue === option || !blockedSelectionSet.has(option));
}

function filterEffectiveChoices<TValue extends string>(
  options: readonly TValue[],
  currentValue: TValue | null | undefined,
  blockedSelections: readonly TValue[] | undefined,
  isAvailable: (option: TValue) => boolean
): TValue[] {
  return filterSourceChoices(options, currentValue, blockedSelections).filter((option) => {
    if (currentValue === option) {
      return true;
    }

    return isAvailable(option);
  });
}

function createSummaryRuntime(
  collections: CharacterProficiencyCollections
): CharacterProficiencySummaryRuntime {
  return {
    getSkill: (skill) => {
      const proficiency = getSkillProficiencyForName(skill);

      return proficiency
        ? getResolvedSkillProficiencyEntry(collections.skillProficiencies, proficiency)
        : null;
    },
    getSkillProficiency: (proficiency) =>
      getResolvedSkillProficiencyEntry(collections.skillProficiencies, proficiency),
    getSavingThrow: (proficiency) =>
      getResolvedProficiencyEntry(collections.savingThrowProficiencies, proficiency),
    getWeapon: (proficiency) =>
      getResolvedProficiencyEntry(collections.weaponProficiencies, proficiency),
    getArmor: (proficiency) =>
      getResolvedProficiencyEntry(collections.armorProficiencies, proficiency),
    getTool: (proficiency) => getResolvedProficiencyEntry(collections.toolProficiencies, proficiency),
    getLanguage: (proficiency) =>
      getResolvedProficiencyEntry(collections.languageProficiencies, proficiency)
  };
}

function createSourceChoiceRuntime(): ProficiencyChoiceRuntime {
  return {
    skills: filterSourceChoices,
    tools: filterSourceChoices,
    languages: filterSourceChoices,
    savingThrows: filterSourceChoices
  };
}

function createEffectiveChoiceRuntime(
  summary: CharacterProficiencySummaryRuntime
): CharacterEffectiveProficiencyChoiceRuntime {
  return {
    proficientSkills: (options, currentValue, blockedSelections) =>
      filterEffectiveChoices(
        options,
        currentValue,
        blockedSelections,
        (skill) => summary.getSkill(skill)?.proficiencyLevel === PROF_LEVEL.PROFICIENT
      ),
    nonExpertSkills: (options, currentValue, blockedSelections) =>
      filterEffectiveChoices(
        options,
        currentValue,
        blockedSelections,
        (skill) => summary.getSkill(skill)?.proficiencyLevel !== PROF_LEVEL.EXPERT
      ),
    unproficientSkills: (options, currentValue, blockedSelections) =>
      filterEffectiveChoices(
        options,
        currentValue,
        blockedSelections,
        (skill) => summary.getSkill(skill)?.proficiencyLevel === PROF_LEVEL.NONE
      ),
    unproficientTools: (options, currentValue, blockedSelections) =>
      filterEffectiveChoices(
        options,
        currentValue,
        blockedSelections,
        (tool) => summary.getTool(tool).proficiencyLevel === PROF_LEVEL.NONE
      ),
    unproficientSavingThrows: (options, currentValue, blockedSelections) =>
      filterEffectiveChoices(
        options,
        currentValue,
        blockedSelections,
        (savingThrow) => summary.getSavingThrow(savingThrow).proficiencyLevel === PROF_LEVEL.NONE
      )
  };
}

function createProficiencyRuntime(
  character: ProficiencyRuntimeCharacter
): CharacterProficiencyRuntime {
  const collections = createCollections(character);
  const summary = createSummaryRuntime(collections);

  return {
    collections,
    summary,
    sourceChoices: createSourceChoiceRuntime(),
    effectiveChoices: createEffectiveChoiceRuntime(summary)
  };
}

export function getProficiencyRuntimeForCharacter(
  character: ProficiencyRuntimeCharacter
): CharacterProficiencyRuntime {
  const cachedRuntime = proficiencyRuntimeByCharacter.get(character);

  if (cachedRuntime) {
    return cachedRuntime;
  }

  const runtime = createProficiencyRuntime(character);
  proficiencyRuntimeByCharacter.set(character, runtime);
  return runtime;
}

export function getSourceChoiceSkillOptions<TSkill extends SkillName>(
  character: ProficiencyRuntimeCharacter,
  options: readonly TSkill[],
  currentValue: TSkill | null | undefined,
  blockedSelections: readonly TSkill[] = []
): TSkill[] {
  return getProficiencyRuntimeForCharacter(character).sourceChoices.skills(
    options,
    currentValue,
    blockedSelections
  );
}

export function getSourceChoiceToolOptions<TTool extends ToolProficiency>(
  character: ProficiencyRuntimeCharacter,
  options: readonly TTool[],
  currentValue: TTool | null | undefined,
  blockedSelections: readonly TTool[] = []
): TTool[] {
  return getProficiencyRuntimeForCharacter(character).sourceChoices.tools(
    options,
    currentValue,
    blockedSelections
  );
}

export function getSourceChoiceLanguageOptions<TLanguage extends LanguageProficiency>(
  character: ProficiencyRuntimeCharacter,
  currentValue: TLanguage | null | undefined,
  blockedSelections: readonly TLanguage[] = [],
  options: readonly TLanguage[] = languageProficiencyOptions as unknown as readonly TLanguage[]
): TLanguage[] {
  return getProficiencyRuntimeForCharacter(character).sourceChoices.languages(
    options,
    currentValue,
    blockedSelections
  );
}

export function getSourceChoiceSavingThrowOptions<TSavingThrow extends SAVING_THROW_PROFICIENCY>(
  character: ProficiencyRuntimeCharacter,
  options: readonly TSavingThrow[],
  currentValue: TSavingThrow | null | undefined,
  blockedSelections: readonly TSavingThrow[] = []
): TSavingThrow[] {
  return getProficiencyRuntimeForCharacter(character).sourceChoices.savingThrows(
    options,
    currentValue,
    blockedSelections
  );
}

export function getEffectiveProficientSkillOptions<TSkill extends SkillName>(
  character: ProficiencyRuntimeCharacter,
  options: readonly TSkill[],
  currentValue: TSkill | null | undefined,
  blockedSelections: readonly TSkill[] = []
): TSkill[] {
  return getProficiencyRuntimeForCharacter(character).effectiveChoices.proficientSkills(
    options,
    currentValue,
    blockedSelections
  );
}

export function getEffectiveNonExpertSkillOptions<TSkill extends SkillName>(
  character: ProficiencyRuntimeCharacter,
  options: readonly TSkill[],
  currentValue: TSkill | null | undefined,
  blockedSelections: readonly TSkill[] = []
): TSkill[] {
  return getProficiencyRuntimeForCharacter(character).effectiveChoices.nonExpertSkills(
    options,
    currentValue,
    blockedSelections
  );
}

export function getEffectiveUnproficientSkillOptions<TSkill extends SkillName>(
  character: ProficiencyRuntimeCharacter,
  options: readonly TSkill[],
  currentValue: TSkill | null | undefined,
  blockedSelections: readonly TSkill[] = []
): TSkill[] {
  return getProficiencyRuntimeForCharacter(character).effectiveChoices.unproficientSkills(
    options,
    currentValue,
    blockedSelections
  );
}

export function getEffectiveUnproficientToolOptions<TTool extends ToolProficiency>(
  character: ProficiencyRuntimeCharacter,
  options: readonly TTool[],
  currentValue: TTool | null | undefined,
  blockedSelections: readonly TTool[] = []
): TTool[] {
  return getProficiencyRuntimeForCharacter(character).effectiveChoices.unproficientTools(
    options,
    currentValue,
    blockedSelections
  );
}

export function getEffectiveUnproficientSavingThrowOptions<
  TSavingThrow extends SAVING_THROW_PROFICIENCY
>(
  character: ProficiencyRuntimeCharacter,
  options: readonly TSavingThrow[],
  currentValue: TSavingThrow | null | undefined,
  blockedSelections: readonly TSavingThrow[] = []
): TSavingThrow[] {
  return getProficiencyRuntimeForCharacter(character).effectiveChoices.unproficientSavingThrows(
    options,
    currentValue,
    blockedSelections
  );
}

export function getRuntimeSkillLevel(
  character: ProficiencyRuntimeCharacter,
  skill: SkillName
): PROF_LEVEL {
  return getProficiencyRuntimeForCharacter(character).summary.getSkill(skill)?.proficiencyLevel ??
    PROF_LEVEL.NONE;
}

export function getRuntimeToolLevel(
  character: ProficiencyRuntimeCharacter,
  tool: TOOL_PROFICIENCY
): PROF_LEVEL {
  return getProficiencyRuntimeForCharacter(character).summary.getTool(tool).proficiencyLevel;
}

export function getRuntimeSavingThrowLevel(
  character: ProficiencyRuntimeCharacter,
  savingThrow: SAVING_THROW_PROFICIENCY
): PROF_LEVEL {
  return getProficiencyRuntimeForCharacter(character).summary.getSavingThrow(savingThrow)
    .proficiencyLevel;
}

export function getRuntimeLanguageLevel(
  character: ProficiencyRuntimeCharacter,
  language: LanguageProficiency
): PROF_LEVEL {
  return getProficiencyRuntimeForCharacter(character).summary.getLanguage(language).proficiencyLevel;
}

export function getRuntimeWeaponLevel(
  character: ProficiencyRuntimeCharacter,
  weapon: WEAPON_PROFICIENCY
): PROF_LEVEL {
  return getProficiencyRuntimeForCharacter(character).summary.getWeapon(weapon).proficiencyLevel;
}

export function getRuntimeArmorLevel(
  character: ProficiencyRuntimeCharacter,
  armor: ARMOR_PROFICIENCY
): PROF_LEVEL {
  return getProficiencyRuntimeForCharacter(character).summary.getArmor(armor).proficiencyLevel;
}

export type RuntimeProficiencyEntry =
  | SkillProficiencyEntry
  | SavingThrowProficiencyEntry
  | WeaponProficiencyEntry
  | ArmorProficiencyEntry
  | ToolProficiencyEntry
  | LanguageProficiencyEntry;
