import type { CharacterDraft, CharacterEquipmentItem, SkillName } from "../../types";
import {
  ARMOR_TYPES,
  ENTRY_CATEGORIES,
  ITEM_TYPES,
  TOOL_PROFICIENCIES,
  WEAPON_TRAINING,
  hardcodedCodexEntries,
  type ArmorEntry,
  type BackgroundEntry,
  type ItemEntry,
  type WeaponEntry
} from "../../codex/entries";
import { ALL_SKILLS } from "../../types";
import {
  createCharacterEquipmentItem,
  getCharacterEquipmentNames,
  normalizeCharacterEquipmentItems
} from "./inventory";

export const skillsOptions = ALL_SKILLS;
export type SkillProficiencySource = "class" | "species" | "other";
export type GrantedProficiencyKind = "skill" | "weapon" | "armor" | "tool";
export type ToolProficiency = TOOL_PROFICIENCIES;

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

export type WeaponType = WEAPON_TRAINING;
export type ArmorType = "light" | "medium" | "heavy" | "shield";
export type GearType = "adventuring" | "toolkit";
export type EquipmentCategory = "weapon" | "armor" | "gear";
export type LoadoutCodexEntry = WeaponEntry | ArmorEntry | ItemEntry;

export type WeaponEquipmentDefinition = {
  entryId: string;
  name: string;
  category: "weapon";
  training: WeaponType;
};

export type ArmorEquipmentDefinition = {
  entryId: string;
  name: string;
  category: "armor";
  type: ArmorType;
};

export type GearEquipmentDefinition = {
  entryId: string;
  name: string;
  category: "gear";
  type: GearType;
};

export type EquipmentDefinition =
  | WeaponEquipmentDefinition
  | ArmorEquipmentDefinition
  | GearEquipmentDefinition;

export type EquipmentProficiencyLabels = {
  weapons: string[];
  armor: string[];
};

function isLoadoutCodexEntry(entry: unknown): entry is LoadoutCodexEntry {
  return (
    typeof entry === "object" &&
    entry !== null &&
    "category" in entry &&
    (entry.category === ENTRY_CATEGORIES.WEAPONS ||
      entry.category === ENTRY_CATEGORIES.ARMOR ||
      entry.category === ENTRY_CATEGORIES.ITEMS)
  );
}

function getArmorTypeFromTags(tags: ArmorEntry["tags"]): ArmorType | null {
  if (tags.includes(ARMOR_TYPES.LIGHT_ARMOR)) {
    return "light";
  }

  if (tags.includes(ARMOR_TYPES.MEDIUM_ARMOR)) {
    return "medium";
  }

  if (tags.includes(ARMOR_TYPES.HEAVY_ARMOR)) {
    return "heavy";
  }

  if (tags.includes(ARMOR_TYPES.SHIELD)) {
    return "shield";
  }

  return null;
}

function getGearTypeFromTags(tags: ItemEntry["tags"]): GearType {
  return tags.includes(ITEM_TYPES.TOOLKIT) ? "toolkit" : "adventuring";
}

function toEquipmentDefinition(entry: LoadoutCodexEntry): EquipmentDefinition | null {
  if (entry.category === ENTRY_CATEGORIES.WEAPONS) {
    return {
      entryId: entry.id,
      name: entry.name,
      category: "weapon",
      training: entry.type.training
    };
  }

  if (entry.category === ENTRY_CATEGORIES.ARMOR) {
    const type = getArmorTypeFromTags(entry.tags);

    if (!type) {
      return null;
    }

    return {
      entryId: entry.id,
      name: entry.name,
      category: "armor",
      type
    };
  }

  return {
    entryId: entry.id,
    name: entry.name,
    category: "gear",
    type: getGearTypeFromTags(entry.tags)
  };
}

const loadoutCodexEntries: LoadoutCodexEntry[] = hardcodedCodexEntries.filter((entry) =>
  isLoadoutCodexEntry(entry)
);

export const equipmentCatalog: EquipmentDefinition[] = loadoutCodexEntries
  .map((entry) => toEquipmentDefinition(entry))
  .filter((entry): entry is EquipmentDefinition => entry !== null)
  .sort((left, right) => left.name.localeCompare(right.name));

export const equipmentOptions = equipmentCatalog.map((item) => item.name);

export const classOptions = [
  "Artificer",
  "Barbarian",
  "Bard",
  "Cleric",
  "Druid",
  "Fighter",
  "Monk",
  "Paladin",
  "Ranger",
  "Rogue",
  "Sorcerer",
  "Warlock",
  "Wizard"
] as const;

export type ClassName = (typeof classOptions)[number];

export type ClassProficiencyProfile = {
  weaponProficiencies: WeaponType[];
  armorProficiencies: ArmorType[];
  skillProficiencyOptions: SkillName[];
  skillProficiencyCount: number;
  grantedToolProficiencies?: ToolProficiency[];
  toolProficiencyChoices?: ToolProficiency[];
  toolProficiencyChoiceCount?: number;
};

export const classProficiencyProfiles: Record<ClassName, ClassProficiencyProfile> = {
  Artificer: {
    weaponProficiencies: [WEAPON_TRAINING.SIMPLE],
    armorProficiencies: ["light", "medium", "shield"],
    skillProficiencyOptions: [
      "Arcana",
      "History",
      "Investigation",
      "Medicine",
      "Nature",
      "Perception",
      "Sleight of Hand"
    ],
    skillProficiencyCount: 2,
    toolProficiencyChoices: [
      TOOL_PROFICIENCIES.THIEVES_TOOLKIT,
      TOOL_PROFICIENCIES.SMITHS_TOOLKIT,
      TOOL_PROFICIENCIES.DISGUIDE_KIT,
      TOOL_PROFICIENCIES.DISARM_KIT
    ],
    toolProficiencyChoiceCount: 1
  },
  Barbarian: {
    weaponProficiencies: [WEAPON_TRAINING.SIMPLE, WEAPON_TRAINING.MARTIAL],
    armorProficiencies: ["light", "medium", "shield"],
    skillProficiencyOptions: [
      "Animal Handling",
      "Athletics",
      "Intimidation",
      "Nature",
      "Perception",
      "Survival"
    ],
    skillProficiencyCount: 2
  },
  Bard: {
    weaponProficiencies: [WEAPON_TRAINING.SIMPLE, WEAPON_TRAINING.MARTIAL],
    armorProficiencies: ["light"],
    skillProficiencyOptions: [
      "Acrobatics",
      "Animal Handling",
      "Arcana",
      "Athletics",
      "Deception",
      "History",
      "Insight",
      "Intimidation",
      "Investigation",
      "Medicine",
      "Nature",
      "Perception",
      "Performance",
      "Persuasion",
      "Religion",
      "Sleight of Hand",
      "Stealth",
      "Survival"
    ],
    skillProficiencyCount: 3,
    toolProficiencyChoices: [
      TOOL_PROFICIENCIES.DISGUIDE_KIT,
      TOOL_PROFICIENCIES.THIEVES_TOOLKIT
    ],
    toolProficiencyChoiceCount: 1
  },
  Cleric: {
    weaponProficiencies: [WEAPON_TRAINING.SIMPLE],
    armorProficiencies: ["light", "medium", "shield"],
    skillProficiencyOptions: ["History", "Insight", "Medicine", "Persuasion", "Religion"],
    skillProficiencyCount: 2
  },
  Druid: {
    weaponProficiencies: [WEAPON_TRAINING.SIMPLE],
    armorProficiencies: ["light", "medium", "shield"],
    skillProficiencyOptions: [
      "Arcana",
      "Animal Handling",
      "Insight",
      "Medicine",
      "Nature",
      "Perception",
      "Religion",
      "Survival"
    ],
    skillProficiencyCount: 2
  },
  Fighter: {
    weaponProficiencies: [WEAPON_TRAINING.SIMPLE, WEAPON_TRAINING.MARTIAL],
    armorProficiencies: ["light", "medium", "heavy", "shield"],
    skillProficiencyOptions: [
      "Acrobatics",
      "Animal Handling",
      "Athletics",
      "History",
      "Insight",
      "Intimidation",
      "Perception",
      "Survival"
    ],
    skillProficiencyCount: 2,
    toolProficiencyChoices: [
      TOOL_PROFICIENCIES.SMITHS_TOOLKIT,
      TOOL_PROFICIENCIES.DISARM_KIT
    ],
    toolProficiencyChoiceCount: 1
  },
  Monk: {
    weaponProficiencies: [WEAPON_TRAINING.SIMPLE],
    armorProficiencies: [],
    skillProficiencyOptions: [
      "Acrobatics",
      "Athletics",
      "History",
      "Insight",
      "Religion",
      "Stealth"
    ],
    skillProficiencyCount: 2
  },
  Paladin: {
    weaponProficiencies: [WEAPON_TRAINING.SIMPLE, WEAPON_TRAINING.MARTIAL],
    armorProficiencies: ["light", "medium", "heavy", "shield"],
    skillProficiencyOptions: [
      "Athletics",
      "Insight",
      "Intimidation",
      "Medicine",
      "Persuasion",
      "Religion"
    ],
    skillProficiencyCount: 2,
    toolProficiencyChoices: [TOOL_PROFICIENCIES.SMITHS_TOOLKIT],
    toolProficiencyChoiceCount: 1
  },
  Ranger: {
    weaponProficiencies: [WEAPON_TRAINING.SIMPLE, WEAPON_TRAINING.MARTIAL],
    armorProficiencies: ["light", "medium", "shield"],
    skillProficiencyOptions: [
      "Animal Handling",
      "Athletics",
      "Insight",
      "Investigation",
      "Nature",
      "Perception",
      "Stealth",
      "Survival"
    ],
    skillProficiencyCount: 3,
    toolProficiencyChoices: [
      TOOL_PROFICIENCIES.DISARM_KIT,
      TOOL_PROFICIENCIES.THIEVES_TOOLKIT
    ],
    toolProficiencyChoiceCount: 1
  },
  Rogue: {
    weaponProficiencies: [WEAPON_TRAINING.SIMPLE, WEAPON_TRAINING.MARTIAL],
    armorProficiencies: ["light"],
    skillProficiencyOptions: [
      "Acrobatics",
      "Athletics",
      "Deception",
      "Insight",
      "Intimidation",
      "Investigation",
      "Perception",
      "Performance",
      "Persuasion",
      "Sleight of Hand",
      "Stealth"
    ],
    skillProficiencyCount: 4,
    grantedToolProficiencies: [TOOL_PROFICIENCIES.THIEVES_TOOLKIT],
    toolProficiencyChoices: [
      TOOL_PROFICIENCIES.DISGUIDE_KIT,
      TOOL_PROFICIENCIES.DISARM_KIT
    ],
    toolProficiencyChoiceCount: 1
  },
  Sorcerer: {
    weaponProficiencies: [WEAPON_TRAINING.SIMPLE],
    armorProficiencies: [],
    skillProficiencyOptions: [
      "Arcana",
      "Deception",
      "Insight",
      "Intimidation",
      "Persuasion",
      "Religion"
    ],
    skillProficiencyCount: 2
  },
  Warlock: {
    weaponProficiencies: [WEAPON_TRAINING.SIMPLE],
    armorProficiencies: ["light"],
    skillProficiencyOptions: [
      "Arcana",
      "Deception",
      "History",
      "Intimidation",
      "Investigation",
      "Nature",
      "Religion"
    ],
    skillProficiencyCount: 2
  },
  Wizard: {
    weaponProficiencies: [WEAPON_TRAINING.SIMPLE],
    armorProficiencies: [],
    skillProficiencyOptions: ["Arcana", "History", "Insight", "Investigation", "Medicine", "Religion"],
    skillProficiencyCount: 2,
    toolProficiencyChoices: [TOOL_PROFICIENCIES.DISGUIDE_KIT],
    toolProficiencyChoiceCount: 1
  }
};

const classOptionSet = new Set<string>(classOptions);
const skillOptionSet = new Set<string>(skillsOptions);
const weaponProficiencyLabelsByType: Record<WeaponType, string> = {
  [WEAPON_TRAINING.SIMPLE]: "Simple weapons",
  [WEAPON_TRAINING.MARTIAL]: "Martial weapons"
};
const armorProficiencyLabelsByType: Record<ArmorType, string> = {
  light: "Light armor",
  medium: "Medium armor",
  heavy: "Heavy armor",
  shield: "Shield"
};
const toolProficiencyLabelsByType: Record<ToolProficiency, string> = {
  [TOOL_PROFICIENCIES.THIEVES_TOOLKIT]: "Thieve's Toolkit",
  [TOOL_PROFICIENCIES.SMITHS_TOOLKIT]: "Smith's Toolkit",
  [TOOL_PROFICIENCIES.DISGUIDE_KIT]: "Disguide Kit",
  [TOOL_PROFICIENCIES.DISARM_KIT]: "Disarm Kit"
};
export const toolProficiencyOptions = Object.values(TOOL_PROFICIENCIES) as ToolProficiency[];
const toolProficiencyOptionSet = new Set<string>(toolProficiencyOptions);

const classGrantedSkillProficiencies: Partial<Record<ClassName, SkillName[]>> = {
  Artificer: ["Arcana"],
  Barbarian: ["Athletics"],
  Bard: ["Performance"],
  Cleric: ["Religion"],
  Druid: ["Nature"],
  Fighter: ["Athletics"],
  Monk: ["Acrobatics"],
  Paladin: ["Persuasion"],
  Ranger: ["Survival"],
  Rogue: ["Stealth"],
  Sorcerer: ["Arcana"],
  Warlock: ["Deception"],
  Wizard: ["Arcana"]
};

const speciesGrantedSkillProficiencies: Partial<Record<string, SkillName[]>> = {
  Dragonborn: ["Intimidation"],
  Dwarf: ["History"],
  Elf: ["Perception"],
  Gnome: ["Investigation"],
  "Half-Elf": ["Persuasion"],
  "Half-Orc": ["Intimidation"],
  Halfling: ["Stealth"],
  Human: ["Insight"],
  Tiefling: ["Deception"]
};

const equipmentCatalogByName = new Map<string, EquipmentDefinition>(
  equipmentCatalog.map((item) => [item.name, item])
);
const loadoutCodexEntriesByName = new Map<string, LoadoutCodexEntry>(
  loadoutCodexEntries.map((entry) => [entry.name, entry])
);
const backgroundCodexEntriesByName = new Map<string, BackgroundEntry>(
  hardcodedCodexEntries
    .filter(
      (entry): entry is BackgroundEntry => entry.category === ENTRY_CATEGORIES.BACKGROUNDS
    )
    .map((entry) => [entry.name, entry])
);
export const backgroundOptions = [...backgroundCodexEntriesByName.keys()].sort((left, right) =>
  left.localeCompare(right)
);
const backgroundOptionSet = new Set(backgroundOptions);

export function isClassName(value: string): value is ClassName {
  return classOptionSet.has(value);
}

export function isBackgroundName(value: string): boolean {
  return backgroundOptionSet.has(value);
}

export function getBackgroundEntryByName(backgroundName: string): BackgroundEntry | undefined {
  return backgroundCodexEntriesByName.get(backgroundName);
}

export function getClassProficiencyProfile(className: string): ClassProficiencyProfile | null {
  if (!isClassName(className)) {
    return null;
  }

  return classProficiencyProfiles[className];
}

export function getSkillProficiencyOptionsForClass(className: string): SkillName[] {
  const profile = getClassProficiencyProfile(className);
  return profile ? [...profile.skillProficiencyOptions] : [];
}

export function getSkillSelectionLimitForClass(className: string): number {
  const profile = getClassProficiencyProfile(className);
  return profile ? profile.skillProficiencyCount : 0;
}

export function getToolProficiencyChoicesForClass(
  className: string
): { choices: ToolProficiency[]; count: number } {
  const profile = getClassProficiencyProfile(className);

  if (!profile) {
    return { choices: [], count: 0 };
  }

  return {
    choices: profile.toolProficiencyChoices ?? [],
    count: profile.toolProficiencyChoiceCount ?? 0
  };
}

export function getEquipmentProficiencyLabelsForClass(className: string): EquipmentProficiencyLabels {
  const profile = getClassProficiencyProfile(className);

  if (!profile) {
    return {
      weapons: [],
      armor: []
    };
  }

  return {
    weapons: profile.weaponProficiencies.map((type) => weaponProficiencyLabelsByType[type]),
    armor: profile.armorProficiencies.map((type) => armorProficiencyLabelsByType[type])
  };
}

function isProficientWithEquipmentType(
  profile: ClassProficiencyProfile,
  equipment: EquipmentDefinition
): boolean {
  if (equipment.category === "gear") {
    return true;
  }

  if (equipment.category === "weapon") {
    return profile.weaponProficiencies.includes(equipment.training);
  }

  return profile.armorProficiencies.includes(equipment.type);
}

export function getEquipmentByName(name: string): EquipmentDefinition | undefined {
  return equipmentCatalogByName.get(name);
}

export function getLoadoutCodexEntryByName(name: string): LoadoutCodexEntry | undefined {
  return loadoutCodexEntriesByName.get(name);
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

function dedupe(values: string[]): string[] {
  return [...new Set(values)];
}

export function normalizeToolProficiencySelections(
  selectedToolProficiencies: string[]
): ToolProficiency[] {
  return dedupe(selectedToolProficiencies).filter(
    (tool): tool is ToolProficiency => toolProficiencyOptionSet.has(tool)
  );
}

export function getToolProficiencyLabel(toolProficiency: ToolProficiency): string {
  return toolProficiencyLabelsByType[toolProficiency];
}

function normalizeSkillName(value: string): SkillName | null {
  return skillOptionSet.has(value) ? (value as SkillName) : null;
}

function getBackgroundGrantedSkillProficiencies(background: string): SkillName[] {
  const entry = backgroundCodexEntriesByName.get(background);

  if (!entry) {
    return [];
  }

  return entry.grantedSkillProficiencies
    .map((skill) => normalizeSkillName(skill))
    .filter((skill): skill is SkillName => skill !== null);
}

function getBackgroundGrantedToolProficiencies(background: string): ToolProficiency[] {
  const entry = backgroundCodexEntriesByName.get(background);

  if (!entry) {
    return [];
  }

  return normalizeToolProficiencySelections(entry.grantedToolProficiencies);
}

function resolveGrantedProficiencyEntries(
  className: string,
  species: string,
  background = ""
): GrantedProficiency[] {
  const grantedByKey = new Map<string, { kind: GrantedProficiencyKind; name: string; sources: Set<string> }>();
  const classGrants = isClassName(className) ? classGrantedSkillProficiencies[className] ?? [] : [];
  const speciesGrants = speciesGrantedSkillProficiencies[species] ?? [];
  const backgroundSkillGrants = getBackgroundGrantedSkillProficiencies(background);
  const backgroundToolGrants = getBackgroundGrantedToolProficiencies(background);
  const classProfile = getClassProficiencyProfile(className);
  const classSourceLabel = className.trim();
  const speciesSourceLabel = species.trim();
  const backgroundSourceLabel = background.trim();

  const sourceBuckets: Array<{ sourceLabel: string; kind: GrantedProficiencyKind; names: string[] }> = [
    { sourceLabel: classSourceLabel, kind: "skill", names: classGrants },
    { sourceLabel: speciesSourceLabel, kind: "skill", names: speciesGrants },
    { sourceLabel: backgroundSourceLabel, kind: "skill", names: backgroundSkillGrants },
    {
      sourceLabel: classSourceLabel,
      kind: "weapon",
      names: classProfile
        ? classProfile.weaponProficiencies.map((type) => weaponProficiencyLabelsByType[type])
        : []
    },
    {
      sourceLabel: classSourceLabel,
      kind: "armor",
      names: classProfile
        ? classProfile.armorProficiencies.map((type) => armorProficiencyLabelsByType[type])
        : []
    },
    {
      sourceLabel: classSourceLabel,
      kind: "tool",
      names: classProfile
        ? (classProfile.grantedToolProficiencies ?? []).map(
            (toolProficiency) => toolProficiencyLabelsByType[toolProficiency]
          )
        : []
    },
    {
      sourceLabel: backgroundSourceLabel,
      kind: "tool",
      names: backgroundToolGrants.map(
        (toolProficiency) => toolProficiencyLabelsByType[toolProficiency]
      )
    }
  ];

  sourceBuckets.forEach(({ sourceLabel, kind, names }) => {
    if (!sourceLabel) {
      return;
    }

    names.forEach((name) => {
      if (kind === "skill" && !normalizeSkillName(name)) {
        return;
      }

      const key = `${kind}:${name}`;
      const grantedEntry = grantedByKey.get(key) ?? {
        kind,
        name,
        sources: new Set<string>()
      };
      const { sources } = grantedEntry;
      sources.add(sourceLabel);
      grantedByKey.set(key, grantedEntry);
    });
  });

  return [...grantedByKey.values()].map((entry) => ({
    kind: entry.kind,
    name: entry.name,
    sources: [...entry.sources]
  }));
}

function resolveGrantedSkillEntries(
  className: string,
  species: string,
  background = ""
): GrantedSkillProficiency[] {
  return resolveGrantedProficiencyEntries(className, species, background)
    .filter((entry): entry is GrantedProficiency & { kind: "skill" } => entry.kind === "skill")
    .map((entry) => ({
      skill: entry.name as SkillName,
      sources: entry.sources
    }));
}

export function getGrantedProficienciesForCharacter(
  className: string,
  species: string,
  background = ""
): GrantedProficiency[] {
  return resolveGrantedProficiencyEntries(className, species, background);
}

export function getGrantedSkillProficienciesForCharacter(
  className: string,
  species: string,
  background = ""
): GrantedSkillProficiency[] {
  return resolveGrantedSkillEntries(className, species, background);
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
    resolveGrantedSkillEntries(className, species, background).map((entry) => entry.skill)
  );

  return dedupe(selectedSkills)
    .filter((skill): skill is SkillName => allowedSkillSet.has(skill))
    .filter((skill) => !grantedSkillSet.has(skill))
    .slice(0, profile.skillProficiencyCount);
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
    resolveGrantedSkillEntries(className, species, background).map((entry) => entry.skill)
  );
  const manualSkillSet = new Set<string>(normalizeManualSkillSelections(selectedSkills));
  const proficientSkills = [...new Set([...grantedSkillSet, ...manualSkillSet])];

  return normalizeSkillExpertiseSelections(proficientSkills, selectedSkillExpertise);
}

export function normalizeEquipmentSelectionsForClass(
  className: string,
  selectedEquipment: string[]
): string[] {
  const allowedEquipmentSet = new Set<string>(getAvailableEquipmentNamesForClass(className));

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
        equipmentDefinition?.category === "weapon" ? item.onHand : false
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
  const granted = resolveGrantedSkillEntries(className, species, background);
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
