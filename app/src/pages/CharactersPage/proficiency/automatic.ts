import type {
  CharacterClassFeatureState,
  CharacterDraft,
  CharacterEquipmentItem,
  CharacterProficiencyCollections,
  SavingThrowProficiencyEntry,
  SkillName,
  SkillProficiencyEntry,
  ToolProficiencyEntry
} from "../../../types";
import {
  PROFICIENCY_OVERRIDE_POLICY,
  PROFICIENCY_SOURCE,
  PROF_LEVEL,
  SKILL_PROFICIENCY
} from "../../../types";
import { isSkillName, getSkillNameForProficiency as getSharedSkillNameForProficiency } from "../../../types";
import {
  createCharacterEquipmentItem,
  getCharacterEquipmentNames,
  normalizeCharacterEquipmentItems
} from "../inventory";
import {
  getFeatureArmorProficiencyEntriesForCharacter,
  getFeatureLanguageProficiencyEntriesForCharacter,
  getFeatureSavingThrowProficiencyEntriesForCharacter,
  getFeatureSkillProficiencyEntriesForCharacter,
  getFeatureToolProficiencyEntriesForCharacter,
  getFeatureWeaponProficiencyEntriesForCharacter
} from "../classFeatures";
import {
  getArmorProficiencyForType,
  getClassProficiencyProfile,
  getToolProficiencyChoicesForClass,
  type ClassProficiencyProfile
} from "../proficiencyClassData";
import {
  backgroundOptions,
  equipmentCatalog,
  equipmentOptions,
  getBackgroundEntryByName,
  getEquipmentByName,
  getSpeciesEntryByName,
  type EquipmentDefinition
} from "../proficiencyCodexData";
import type { ToolProficiency } from "../proficiencyOptions";
import {
  doesWeaponProficiencyMatchWeapon,
  isMonkOnlyWeaponProficiency
} from "../proficiencyWeaponLabels";
import { getSkillProficiencyForName } from "../proficiencyResolvers";
import {
  buildGrantedEntriesFromCollections,
  createArmorEntry,
  createSavingThrowEntry,
  createSkillEntry,
  createToolEntry,
  createWeaponEntry,
  dedupe,
  getLegacyToolProficiency,
  getSourceLabel,
  mergeProficiencyEntries,
  skillOptionSet
} from "./core";
import type {
  GrantedProficiency,
  GrantedSkillProficiency,
  ResolvedSkillProficiencies
} from "./types";

export function isBackgroundName(value: string): boolean {
  return backgroundOptions.includes(value);
}

function isProficientWithEquipmentType(
  profile: ClassProficiencyProfile,
  equipment: EquipmentDefinition
): boolean {
  if (equipment.category === "gear") {
    return true;
  }

  if (equipment.category === "weapon") {
    return profile.weaponProficiencies.some((proficiency) =>
      doesWeaponProficiencyMatchWeapon(proficiency, equipment.training, {
        baseWeapon: equipment.baseWeapon,
        combatType: equipment.combatType,
        properties: equipment.properties
      })
    );
  }

  return profile.armorProficiencies.includes(equipment.type);
}

export function getAvailableEquipmentForClass(className: string): EquipmentDefinition[] {
  const profile = getClassProficiencyProfile(className);

  if (!profile) {
    return equipmentCatalog.filter((item) => item.category === "gear");
  }

  return equipmentCatalog.filter((item) => isProficientWithEquipmentType(profile, item));
}

export function getAvailableEquipmentNamesForClass(className: string): string[] {
  return getAvailableEquipmentForClass(className).map((item) => item.name);
}

export function normalizeToolProficiencySelections(selectedToolProficiencies: string[]): ToolProficiency[] {
  return dedupe(
    selectedToolProficiencies
      .map((toolProficiency) => getLegacyToolProficiency(toolProficiency) ?? toolProficiency)
      .filter(
        (toolProficiency): toolProficiency is ToolProficiency => typeof toolProficiency === "string"
      )
  );
}

function normalizeSkillName(value: string): SkillName | null {
  return isSkillName(value) ? value : null;
}

function getBackgroundGrantedSkillProficiencies(background: string): SkillName[] {
  const entry = getBackgroundEntryByName(background);

  if (!entry) {
    return [];
  }

  return entry.grantedSkillProficiencies
    .map((skill) => normalizeSkillName(skill))
    .filter((skill): skill is SkillName => skill !== null);
}

function getBackgroundGrantedToolProficiencies(background: string): ToolProficiency[] {
  const entry = getBackgroundEntryByName(background);

  if (!entry) {
    return [];
  }

  return entry.grantedToolProficiencies
    .map((toolProficiency) => getLegacyToolProficiency(toolProficiency))
    .filter((toolProficiency): toolProficiency is ToolProficiency => toolProficiency !== null);
}

function getSpeciesGrantedSkillProficiencies(species: string): SkillName[] {
  const entry = getSpeciesEntryByName(species);

  if (!entry) {
    return [];
  }

  return entry.grantedSkillProficiencies
    .map((skill) => normalizeSkillName(skill))
    .filter((skill): skill is SkillName => skill !== null);
}

function getSpeciesGrantedToolProficiencies(species: string): ToolProficiency[] {
  const entry = getSpeciesEntryByName(species);

  if (!entry) {
    return [];
  }

  return entry.grantedToolProficiencies
    .map((toolProficiency) => getLegacyToolProficiency(toolProficiency))
    .filter((toolProficiency): toolProficiency is ToolProficiency => toolProficiency !== null);
}

function getClassGrantedSkillProficiencies(className: string): SkillName[] {
  return (getClassProficiencyProfile(className)?.grantedSkillProficiencies ?? [])
    .map((skill) => normalizeSkillName(skill))
    .filter((skill): skill is SkillName => skill !== null);
}

function getClassGrantedToolProficiencies(className: string): ToolProficiency[] {
  const profile = getClassProficiencyProfile(className);

  return mergeProficiencyEntries(
    [...dedupe([...(profile?.grantedToolProficiencies ?? [])])].map((toolProficiency) =>
      createToolEntry(toolProficiency, PROFICIENCY_SOURCE.CLASS, className, PROF_LEVEL.PROFICIENT)
    )
  ).map((entry) => entry.proficiency);
}

function getAutomaticSkillEntries(
  className: string,
  species: string,
  background = "",
  selectedClassSkills: SkillName[] = []
): SkillProficiencyEntry[] {
  const classSourceLabel = className.trim() || undefined;
  const speciesSourceLabel = species.trim() || undefined;
  const backgroundSourceLabel = background.trim() || undefined;

  return mergeProficiencyEntries([
    ...getClassGrantedSkillProficiencies(className)
      .map((skill) => getSkillProficiencyForName(skill))
      .filter((skill): skill is SKILL_PROFICIENCY => skill !== null)
      .map((skill) =>
        createSkillEntry(skill, PROFICIENCY_SOURCE.CLASS, classSourceLabel, PROF_LEVEL.PROFICIENT)
      ),
    ...getSpeciesGrantedSkillProficiencies(species)
      .map((skill) => getSkillProficiencyForName(skill))
      .filter((skill): skill is SKILL_PROFICIENCY => skill !== null)
      .map((skill) =>
        createSkillEntry(
          skill,
          PROFICIENCY_SOURCE.SPECIES,
          speciesSourceLabel,
          PROF_LEVEL.PROFICIENT
        )
      ),
    ...getBackgroundGrantedSkillProficiencies(background)
      .map((skill) => getSkillProficiencyForName(skill))
      .filter((skill): skill is SKILL_PROFICIENCY => skill !== null)
      .map((skill) =>
        createSkillEntry(
          skill,
          PROFICIENCY_SOURCE.BACKGROUND,
          backgroundSourceLabel,
          PROF_LEVEL.PROFICIENT
        )
      ),
    ...selectedClassSkills
      .map((skill) => getSkillProficiencyForName(skill))
      .filter((skill): skill is SKILL_PROFICIENCY => skill !== null)
      .map((skill) =>
        createSkillEntry(skill, PROFICIENCY_SOURCE.CLASS, classSourceLabel, PROF_LEVEL.PROFICIENT)
      )
  ]);
}

function getAutomaticSavingThrowEntries(className: string): SavingThrowProficiencyEntry[] {
  const savingThrowProficiencies = getClassProficiencyProfile(className)?.savingThrowProficiencies;
  const sourceStr = className.trim() || undefined;

  if (!savingThrowProficiencies || savingThrowProficiencies.length === 0) {
    return [];
  }

  return mergeProficiencyEntries(
    savingThrowProficiencies.map((savingThrow) =>
      createSavingThrowEntry(
        savingThrow,
        PROFICIENCY_SOURCE.CLASS,
        sourceStr,
        PROF_LEVEL.PROFICIENT
      )
    )
  );
}

function getAutomaticWeaponEntries(className: string) {
  const profile = getClassProficiencyProfile(className);
  const sourceStr = className.trim() || undefined;

  if (!profile) {
    return [];
  }

  return mergeProficiencyEntries(
    profile.weaponProficiencies.map((proficiency) =>
      createWeaponEntry(
        proficiency,
        PROFICIENCY_SOURCE.CLASS,
        sourceStr,
        PROF_LEVEL.PROFICIENT,
        isMonkOnlyWeaponProficiency(proficiency)
          ? PROFICIENCY_OVERRIDE_POLICY.LOCKED
          : PROFICIENCY_OVERRIDE_POLICY.OVERRIDABLE
      )
    )
  );
}

function getAutomaticArmorEntries(className: string) {
  const profile = getClassProficiencyProfile(className);
  const sourceStr = className.trim() || undefined;

  if (!profile) {
    return [];
  }

  return mergeProficiencyEntries(
    profile.armorProficiencies.map((armorType) =>
      createArmorEntry(
        getArmorProficiencyForType(armorType),
        PROFICIENCY_SOURCE.CLASS,
        sourceStr,
        PROF_LEVEL.PROFICIENT
      )
    )
  );
}

function getAutomaticToolEntries(
  className: string,
  species: string,
  background = "",
  selectedClassTools: ToolProficiency[] = []
): ToolProficiencyEntry[] {
  const classSourceLabel = className.trim() || undefined;
  const speciesSourceLabel = species.trim() || undefined;
  const backgroundSourceLabel = background.trim() || undefined;

  return mergeProficiencyEntries([
    ...getClassGrantedToolProficiencies(className).map((toolProficiency) =>
      createToolEntry(
        toolProficiency,
        PROFICIENCY_SOURCE.CLASS,
        classSourceLabel,
        PROF_LEVEL.PROFICIENT
      )
    ),
    ...getSpeciesGrantedToolProficiencies(species).map((toolProficiency) =>
      createToolEntry(
        toolProficiency,
        PROFICIENCY_SOURCE.SPECIES,
        speciesSourceLabel,
        PROF_LEVEL.PROFICIENT
      )
    ),
    ...getBackgroundGrantedToolProficiencies(background).map((toolProficiency) =>
      createToolEntry(
        toolProficiency,
        PROFICIENCY_SOURCE.BACKGROUND,
        backgroundSourceLabel,
        PROF_LEVEL.PROFICIENT
      )
    ),
    ...selectedClassTools.map((toolProficiency) =>
      createToolEntry(
        toolProficiency,
        PROFICIENCY_SOURCE.CLASS,
        classSourceLabel,
        PROF_LEVEL.PROFICIENT
      )
    )
  ]);
}

function getFeatureProficiencyCollectionsForCharacter(
  className: string,
  options?: {
    level?: number;
    subclassId?: string;
    classFeatureState?: CharacterClassFeatureState;
    skillProficiencies?: SkillProficiencyEntry[];
    savingThrowProficiencies?: SavingThrowProficiencyEntry[];
  }
): CharacterProficiencyCollections {
  const featureCharacter = {
    className,
    level: options?.level ?? 1,
    subclassId: options?.subclassId,
    classFeatureState: options?.classFeatureState,
    skillProficiencies: options?.skillProficiencies ?? [],
    savingThrowProficiencies: options?.savingThrowProficiencies ?? []
  };

  return {
    skillProficiencies: mergeProficiencyEntries(
      getFeatureSkillProficiencyEntriesForCharacter(featureCharacter)
    ),
    savingThrowProficiencies: mergeProficiencyEntries(
      getFeatureSavingThrowProficiencyEntriesForCharacter(featureCharacter)
    ),
    weaponProficiencies: mergeProficiencyEntries(
      getFeatureWeaponProficiencyEntriesForCharacter(featureCharacter)
    ),
    armorProficiencies: mergeProficiencyEntries(
      getFeatureArmorProficiencyEntriesForCharacter(featureCharacter)
    ),
    toolProficiencies: mergeProficiencyEntries(
      getFeatureToolProficiencyEntriesForCharacter(featureCharacter)
    ),
    languageProficiencies: mergeProficiencyEntries(
      getFeatureLanguageProficiencyEntriesForCharacter(featureCharacter)
    )
  };
}

export function normalizeSkillSelectionsForClass(
  className: string,
  selectedSkills: string[],
  species = "",
  background = ""
): SkillName[] {
  const profile = getClassProficiencyProfile(className);

  if (!profile) {
    return [];
  }

  const allowedSkillSet = new Set<string>(profile.skillProficiencyOptions);
  const grantedSkillSet = new Set<string>(
    getGrantedSkillProficienciesForCharacter(className, species, background).map(
      (entry) => entry.skill
    )
  );

  return dedupe(selectedSkills)
    .filter((skill): skill is SkillName => allowedSkillSet.has(skill))
    .filter((skill) => !grantedSkillSet.has(skill))
    .slice(0, profile.skillProficiencyCount);
}

export function splitLegacySkillSelectionsForClass(
  className: string,
  selectedSkills: string[],
  species = "",
  background = ""
): { classSelections: SkillName[]; manualSelections: SkillName[] } {
  const classSelections = normalizeSkillSelectionsForClass(
    className,
    selectedSkills,
    species,
    background
  );
  const classSelectionSet = new Set(classSelections);
  const manualSelections = normalizeManualSkillSelections(selectedSkills).filter(
    (skill) => !classSelectionSet.has(skill)
  );

  return {
    classSelections,
    manualSelections
  };
}

export function normalizeToolSelectionsForClass(
  className: string,
  selectedTools: string[]
): ToolProficiency[] {
  const { choices, count } = getToolProficiencyChoicesForClass(className);
  const allowedToolSet = new Set<ToolProficiency>(choices);

  return dedupe(
    normalizeToolProficiencySelections(selectedTools).filter((tool) => allowedToolSet.has(tool))
  ).slice(0, count);
}

export function splitLegacyToolSelectionsForClass(
  className: string,
  selectedTools: string[]
): { classSelections: ToolProficiency[]; manualSelections: ToolProficiency[] } {
  const classSelections = normalizeToolSelectionsForClass(className, selectedTools);
  const classSelectionSet = new Set(classSelections);
  const manualSelections = normalizeToolProficiencySelections(selectedTools).filter(
    (tool) => !classSelectionSet.has(tool)
  );

  return {
    classSelections,
    manualSelections
  };
}

export function normalizeManualSkillSelections(selectedSkills: string[]): SkillName[] {
  return dedupe(selectedSkills).filter((skill): skill is SkillName => skillOptionSet.has(skill));
}

export function normalizeSkillExpertiseSelections(
  proficientSkills: string[],
  selectedSkillExpertise: string[]
): SkillName[] {
  const proficientSkillSet = new Set<string>(normalizeManualSkillSelections(proficientSkills));

  return dedupe(selectedSkillExpertise)
    .filter((skill): skill is SkillName => skillOptionSet.has(skill))
    .filter((skill) => proficientSkillSet.has(skill));
}

export function normalizeSkillExpertiseSelectionsForCharacter(
  className: string,
  species: string,
  background: string,
  selectedSkills: string[],
  selectedSkillExpertise: string[]
): SkillName[] {
  const grantedSkillSet = new Set<string>(
    getGrantedSkillProficienciesForCharacter(className, species, background).map(
      (entry) => entry.skill
    )
  );
  const manualSkillSet = new Set<string>(normalizeManualSkillSelections(selectedSkills));
  const proficientSkills = [...new Set([...grantedSkillSet, ...manualSkillSet])];

  return normalizeSkillExpertiseSelections(proficientSkills, selectedSkillExpertise);
}

export function getAutomaticProficiencyCollectionsForCharacter(
  className: string,
  species: string,
  background = "",
  options?: {
    level?: number;
    subclassId?: string;
    classFeatureState?: CharacterClassFeatureState;
    skillProficiencies?: SkillProficiencyEntry[];
    savingThrowProficiencies?: SavingThrowProficiencyEntry[];
    selectedClassSkills?: string[];
    selectedClassToolProficiencies?: string[];
  }
): CharacterProficiencyCollections {
  const normalizedSelectedClassSkills = normalizeSkillSelectionsForClass(
    className,
    options?.selectedClassSkills ?? [],
    species,
    background
  );
  const normalizedSelectedClassTools = normalizeToolSelectionsForClass(
    className,
    options?.selectedClassToolProficiencies ?? []
  );
  const featureCollections = getFeatureProficiencyCollectionsForCharacter(className, options);

  return {
    skillProficiencies: mergeProficiencyEntries([
      ...getAutomaticSkillEntries(className, species, background, normalizedSelectedClassSkills),
      ...featureCollections.skillProficiencies
    ]),
    savingThrowProficiencies: mergeProficiencyEntries([
      ...getAutomaticSavingThrowEntries(className),
      ...featureCollections.savingThrowProficiencies
    ]),
    weaponProficiencies: mergeProficiencyEntries([
      ...getAutomaticWeaponEntries(className),
      ...featureCollections.weaponProficiencies
    ]),
    armorProficiencies: mergeProficiencyEntries([
      ...getAutomaticArmorEntries(className),
      ...featureCollections.armorProficiencies
    ]),
    toolProficiencies: mergeProficiencyEntries([
      ...getAutomaticToolEntries(className, species, background, normalizedSelectedClassTools),
      ...featureCollections.toolProficiencies
    ]),
    languageProficiencies: featureCollections.languageProficiencies
  };
}

export function getGrantedProficienciesForCharacter(
  className: string,
  species: string,
  background = ""
): GrantedProficiency[] {
  return buildGrantedEntriesFromCollections(
    getAutomaticProficiencyCollectionsForCharacter(className, species, background)
  );
}

export function getGrantedSkillProficienciesForCharacter(
  className: string,
  species: string,
  background = ""
): GrantedSkillProficiency[] {
  const grantedBySkill = new Map<SkillName, Set<string>>();

  getAutomaticSkillEntries(className, species, background).forEach((entry) => {
    const skill = getSharedSkillNameForProficiency(entry.proficiency);
    const sources = grantedBySkill.get(skill) ?? new Set<string>();
    sources.add(getSourceLabel(entry.source, entry.sourceStr));
    grantedBySkill.set(skill, sources);
  });

  return [...grantedBySkill.entries()].map(([skill, sources]) => ({
    skill,
    sources: [...sources]
  }));
}

export function normalizeEquipmentSelectionsForClass(
  className: string,
  selectedEquipment: string[]
): string[] {
  const allowedEquipmentSet = new Set<string>(getAvailableEquipmentNamesForClass(className));

  return dedupe(selectedEquipment).filter((item) => allowedEquipmentSet.has(item));
}

export function normalizeEquipmentSelections(selectedEquipment: string[]): string[] {
  const allowedEquipmentSet = new Set<string>(equipmentOptions);

  return dedupe(selectedEquipment).filter((item) => allowedEquipmentSet.has(item));
}

export function normalizeCharacterEquipmentSelectionsForClass(
  className: string,
  selectedEquipment: Array<string | CharacterEquipmentItem>
): CharacterEquipmentItem[] {
  const allowedEquipmentSet = new Set<string>(getAvailableEquipmentNamesForClass(className));

  return normalizeCharacterEquipmentItems(selectedEquipment)
    .filter((item) => allowedEquipmentSet.has(item.name))
    .map((item) => {
      const equipmentDefinition = getEquipmentByName(item.name);

      return createCharacterEquipmentItem(
        item.name,
        equipmentDefinition?.category === "weapon" ||
          (equipmentDefinition?.category === "armor" && equipmentDefinition.type === "shield")
          ? item.onHand || item.worn
          : false,
        equipmentDefinition?.category === "armor" && equipmentDefinition.type !== "shield"
          ? item.worn
          : false
      );
    });
}

export function normalizeCharacterEquipmentSelections(
  selectedEquipment: Array<string | CharacterEquipmentItem>
): CharacterEquipmentItem[] {
  return normalizeCharacterEquipmentItems(selectedEquipment)
    .filter((item) => getEquipmentByName(item.name) !== undefined)
    .map((item) => {
      const equipmentDefinition = getEquipmentByName(item.name);

      return createCharacterEquipmentItem(
        item.name,
        equipmentDefinition?.category === "weapon" ||
          (equipmentDefinition?.category === "armor" && equipmentDefinition.type === "shield")
          ? item.onHand || item.worn
          : false,
        equipmentDefinition?.category === "armor" && equipmentDefinition.type !== "shield"
          ? item.worn
          : false
      );
    });
}

export function normalizeSelectionsForClass(
  className: string,
  selectedSkills: string[],
  selectedEquipment: string[],
  species = "",
  background = ""
): Pick<CharacterDraft, "skills" | "equipment"> {
  return {
    skills: normalizeSkillSelectionsForClass(className, selectedSkills, species, background),
    equipment: normalizeEquipmentSelectionsForClass(
      className,
      getCharacterEquipmentNames(selectedEquipment)
    )
  };
}

export function resolveSkillProficienciesForCharacter(
  className: string,
  species: string,
  background: string,
  selectedSkills: string[]
): ResolvedSkillProficiencies {
  const granted = getGrantedSkillProficienciesForCharacter(className, species, background);
  const manual = normalizeSkillSelectionsForClass(className, selectedSkills, species, background);
  const all = dedupe([...granted.map((entry) => entry.skill), ...manual]).filter(
    (skill): skill is SkillName => skillOptionSet.has(skill)
  );

  return {
    granted,
    manual,
    all
  };
}
