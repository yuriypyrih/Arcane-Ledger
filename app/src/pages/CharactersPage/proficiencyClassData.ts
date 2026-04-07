import type { AbilityKey, SkillName } from "../../types";
import {
  ARMOR_PROFICIENCY,
  SAVING_THROW_PROFICIENCY,
  SKILL,
  TOOL_PROFICIENCY,
  WEAPON_PROFICIENCY
} from "../../types";
import { getClassStarterPack } from "../../codex/classes/starterPack";
import type { ToolProficiency } from "./proficiencyOptions";
import { getWeaponProficiencyLabel } from "./proficiencyWeaponLabels";

export type ArmorType = "light" | "medium" | "heavy" | "shield";

export type EquipmentProficiencyLabels = {
  weapons: string[];
  armor: string[];
};

export type ClassProficiencyProfile = {
  primaryAbility: AbilityKey | null;
  savingThrowProficiencies: SAVING_THROW_PROFICIENCY[];
  weaponProficiencies: WEAPON_PROFICIENCY[];
  armorProficiencies: ArmorType[];
  grantedSkillProficiencies?: SkillName[];
  skillProficiencyOptions: SkillName[];
  skillProficiencyCount: number;
  grantedToolProficiencies?: ToolProficiency[];
  toolProficiencyChoices?: ToolProficiency[];
  toolProficiencyChoiceCount?: number;
};

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

export const classProficiencyProfiles: Record<ClassName, ClassProficiencyProfile> = {
  Artificer: {
    primaryAbility: "INT",
    savingThrowProficiencies: [SAVING_THROW_PROFICIENCY.CON, SAVING_THROW_PROFICIENCY.INT],
    weaponProficiencies: [WEAPON_PROFICIENCY.SIMPLE],
    armorProficiencies: ["light", "medium", "shield"],
    skillProficiencyOptions: [
      SKILL.ARCANA,
      SKILL.HISTORY,
      SKILL.INVESTIGATION,
      SKILL.MEDICINE,
      SKILL.NATURE,
      SKILL.PERCEPTION,
      SKILL.SLEIGHT_OF_HAND
    ],
    skillProficiencyCount: 2,
    toolProficiencyChoices: [
      TOOL_PROFICIENCY.THIEVES_TOOLKIT,
      TOOL_PROFICIENCY.SMITHS_TOOLKIT,
      TOOL_PROFICIENCY.DISGUISE_KIT,
      TOOL_PROFICIENCY.DISARM_KIT
    ],
    toolProficiencyChoiceCount: 1
  },
  Barbarian: {
    primaryAbility: "STR",
    savingThrowProficiencies: [SAVING_THROW_PROFICIENCY.STR, SAVING_THROW_PROFICIENCY.CON],
    weaponProficiencies: [WEAPON_PROFICIENCY.SIMPLE, WEAPON_PROFICIENCY.MARTIAL],
    armorProficiencies: ["light", "medium", "shield"],
    skillProficiencyOptions: [
      SKILL.ANIMAL_HANDLING,
      SKILL.ATHLETICS,
      SKILL.INTIMIDATION,
      SKILL.NATURE,
      SKILL.PERCEPTION,
      SKILL.SURVIVAL
    ],
    skillProficiencyCount: 2
  },
  Bard: {
    primaryAbility: "CHA",
    savingThrowProficiencies: [SAVING_THROW_PROFICIENCY.DEX, SAVING_THROW_PROFICIENCY.CHA],
    weaponProficiencies: [WEAPON_PROFICIENCY.SIMPLE, WEAPON_PROFICIENCY.MARTIAL],
    armorProficiencies: ["light"],
    skillProficiencyOptions: [
      SKILL.ACROBATICS,
      SKILL.ANIMAL_HANDLING,
      SKILL.ARCANA,
      SKILL.ATHLETICS,
      SKILL.DECEPTION,
      SKILL.HISTORY,
      SKILL.INSIGHT,
      SKILL.INTIMIDATION,
      SKILL.INVESTIGATION,
      SKILL.MEDICINE,
      SKILL.NATURE,
      SKILL.PERCEPTION,
      SKILL.PERFORMANCE,
      SKILL.PERSUASION,
      SKILL.RELIGION,
      SKILL.SLEIGHT_OF_HAND,
      SKILL.STEALTH,
      SKILL.SURVIVAL
    ],
    skillProficiencyCount: 3,
    toolProficiencyChoices: [
      TOOL_PROFICIENCY.DISGUISE_KIT,
      TOOL_PROFICIENCY.THIEVES_TOOLKIT
    ],
    toolProficiencyChoiceCount: 1
  },
  Cleric: {
    primaryAbility: "WIS",
    savingThrowProficiencies: [SAVING_THROW_PROFICIENCY.WIS, SAVING_THROW_PROFICIENCY.CHA],
    weaponProficiencies: [WEAPON_PROFICIENCY.SIMPLE],
    armorProficiencies: ["light", "medium", "shield"],
    skillProficiencyOptions: [
      SKILL.HISTORY,
      SKILL.INSIGHT,
      SKILL.MEDICINE,
      SKILL.PERSUASION,
      SKILL.RELIGION
    ],
    skillProficiencyCount: 2
  },
  Druid: {
    primaryAbility: "WIS",
    savingThrowProficiencies: [SAVING_THROW_PROFICIENCY.INT, SAVING_THROW_PROFICIENCY.WIS],
    weaponProficiencies: [WEAPON_PROFICIENCY.SIMPLE],
    armorProficiencies: ["light", "medium", "shield"],
    skillProficiencyOptions: [
      SKILL.ARCANA,
      SKILL.ANIMAL_HANDLING,
      SKILL.INSIGHT,
      SKILL.MEDICINE,
      SKILL.NATURE,
      SKILL.PERCEPTION,
      SKILL.RELIGION,
      SKILL.SURVIVAL
    ],
    skillProficiencyCount: 2
  },
  Fighter: {
    primaryAbility: "STR",
    savingThrowProficiencies: [SAVING_THROW_PROFICIENCY.STR, SAVING_THROW_PROFICIENCY.CON],
    weaponProficiencies: [WEAPON_PROFICIENCY.SIMPLE, WEAPON_PROFICIENCY.MARTIAL],
    armorProficiencies: ["light", "medium", "heavy", "shield"],
    skillProficiencyOptions: [
      SKILL.ACROBATICS,
      SKILL.ANIMAL_HANDLING,
      SKILL.ATHLETICS,
      SKILL.HISTORY,
      SKILL.INSIGHT,
      SKILL.INTIMIDATION,
      SKILL.PERCEPTION,
      SKILL.SURVIVAL
    ],
    skillProficiencyCount: 2,
    toolProficiencyChoices: [
      TOOL_PROFICIENCY.SMITHS_TOOLKIT,
      TOOL_PROFICIENCY.DISARM_KIT
    ],
    toolProficiencyChoiceCount: 1
  },
  Monk: {
    primaryAbility: "DEX",
    savingThrowProficiencies: [SAVING_THROW_PROFICIENCY.STR, SAVING_THROW_PROFICIENCY.DEX],
    weaponProficiencies: [
      WEAPON_PROFICIENCY.SIMPLE_MELEE,
      WEAPON_PROFICIENCY.MARTIAL_MELEE_LIGHT
    ],
    armorProficiencies: [],
    skillProficiencyOptions: [
      SKILL.ACROBATICS,
      SKILL.ATHLETICS,
      SKILL.HISTORY,
      SKILL.INSIGHT,
      SKILL.RELIGION,
      SKILL.STEALTH
    ],
    skillProficiencyCount: 2
  },
  Paladin: {
    primaryAbility: "STR",
    savingThrowProficiencies: [SAVING_THROW_PROFICIENCY.WIS, SAVING_THROW_PROFICIENCY.CHA],
    weaponProficiencies: [WEAPON_PROFICIENCY.SIMPLE, WEAPON_PROFICIENCY.MARTIAL],
    armorProficiencies: ["light", "medium", "heavy", "shield"],
    skillProficiencyOptions: [
      SKILL.ATHLETICS,
      SKILL.INSIGHT,
      SKILL.INTIMIDATION,
      SKILL.MEDICINE,
      SKILL.PERSUASION,
      SKILL.RELIGION
    ],
    skillProficiencyCount: 2,
    toolProficiencyChoices: [TOOL_PROFICIENCY.SMITHS_TOOLKIT],
    toolProficiencyChoiceCount: 1
  },
  Ranger: {
    primaryAbility: "DEX",
    savingThrowProficiencies: [SAVING_THROW_PROFICIENCY.STR, SAVING_THROW_PROFICIENCY.DEX],
    weaponProficiencies: [WEAPON_PROFICIENCY.SIMPLE, WEAPON_PROFICIENCY.MARTIAL],
    armorProficiencies: ["light", "medium", "shield"],
    skillProficiencyOptions: [
      SKILL.ANIMAL_HANDLING,
      SKILL.ATHLETICS,
      SKILL.INSIGHT,
      SKILL.INVESTIGATION,
      SKILL.NATURE,
      SKILL.PERCEPTION,
      SKILL.STEALTH,
      SKILL.SURVIVAL
    ],
    skillProficiencyCount: 3,
    toolProficiencyChoices: [
      TOOL_PROFICIENCY.DISARM_KIT,
      TOOL_PROFICIENCY.THIEVES_TOOLKIT
    ],
    toolProficiencyChoiceCount: 1
  },
  Rogue: {
    primaryAbility: "DEX",
    savingThrowProficiencies: [SAVING_THROW_PROFICIENCY.DEX, SAVING_THROW_PROFICIENCY.INT],
    weaponProficiencies: [WEAPON_PROFICIENCY.SIMPLE, WEAPON_PROFICIENCY.MARTIAL],
    armorProficiencies: ["light"],
    skillProficiencyOptions: [
      SKILL.ACROBATICS,
      SKILL.ATHLETICS,
      SKILL.DECEPTION,
      SKILL.INSIGHT,
      SKILL.INTIMIDATION,
      SKILL.INVESTIGATION,
      SKILL.PERCEPTION,
      SKILL.PERFORMANCE,
      SKILL.PERSUASION,
      SKILL.SLEIGHT_OF_HAND,
      SKILL.STEALTH
    ],
    skillProficiencyCount: 4,
    grantedToolProficiencies: [TOOL_PROFICIENCY.THIEVES_TOOLKIT],
    toolProficiencyChoices: [
      TOOL_PROFICIENCY.DISGUISE_KIT,
      TOOL_PROFICIENCY.DISARM_KIT
    ],
    toolProficiencyChoiceCount: 1
  },
  Sorcerer: {
    primaryAbility: "CHA",
    savingThrowProficiencies: [SAVING_THROW_PROFICIENCY.CON, SAVING_THROW_PROFICIENCY.CHA],
    weaponProficiencies: [WEAPON_PROFICIENCY.SIMPLE],
    armorProficiencies: [],
    skillProficiencyOptions: [
      SKILL.ARCANA,
      SKILL.DECEPTION,
      SKILL.INSIGHT,
      SKILL.INTIMIDATION,
      SKILL.PERSUASION,
      SKILL.RELIGION
    ],
    skillProficiencyCount: 2
  },
  Warlock: {
    primaryAbility: "CHA",
    savingThrowProficiencies: [SAVING_THROW_PROFICIENCY.WIS, SAVING_THROW_PROFICIENCY.CHA],
    weaponProficiencies: [WEAPON_PROFICIENCY.SIMPLE],
    armorProficiencies: ["light"],
    skillProficiencyOptions: [
      SKILL.ARCANA,
      SKILL.DECEPTION,
      SKILL.HISTORY,
      SKILL.INTIMIDATION,
      SKILL.INVESTIGATION,
      SKILL.NATURE,
      SKILL.RELIGION
    ],
    skillProficiencyCount: 2
  },
  Wizard: {
    primaryAbility: "INT",
    savingThrowProficiencies: [SAVING_THROW_PROFICIENCY.INT, SAVING_THROW_PROFICIENCY.WIS],
    weaponProficiencies: [WEAPON_PROFICIENCY.SIMPLE],
    armorProficiencies: [],
    skillProficiencyOptions: [
      SKILL.ARCANA,
      SKILL.HISTORY,
      SKILL.INSIGHT,
      SKILL.INVESTIGATION,
      SKILL.MEDICINE,
      SKILL.RELIGION
    ],
    skillProficiencyCount: 2,
    toolProficiencyChoices: [TOOL_PROFICIENCY.DISGUISE_KIT],
    toolProficiencyChoiceCount: 1
  }
};

const classOptionSet = new Set<string>(classOptions);

const savingThrowProficiencyByAbilityKey: Record<AbilityKey, SAVING_THROW_PROFICIENCY> = {
  STR: SAVING_THROW_PROFICIENCY.STR,
  DEX: SAVING_THROW_PROFICIENCY.DEX,
  CON: SAVING_THROW_PROFICIENCY.CON,
  INT: SAVING_THROW_PROFICIENCY.INT,
  WIS: SAVING_THROW_PROFICIENCY.WIS,
  CHA: SAVING_THROW_PROFICIENCY.CHA
};

const abilityKeyBySavingThrowProficiency: Record<SAVING_THROW_PROFICIENCY, AbilityKey> = {
  [SAVING_THROW_PROFICIENCY.STR]: "STR",
  [SAVING_THROW_PROFICIENCY.DEX]: "DEX",
  [SAVING_THROW_PROFICIENCY.CON]: "CON",
  [SAVING_THROW_PROFICIENCY.INT]: "INT",
  [SAVING_THROW_PROFICIENCY.WIS]: "WIS",
  [SAVING_THROW_PROFICIENCY.CHA]: "CHA"
};

const armorProficiencyByType: Record<ArmorType, ARMOR_PROFICIENCY> = {
  light: ARMOR_PROFICIENCY.LIGHT,
  medium: ARMOR_PROFICIENCY.MEDIUM,
  heavy: ARMOR_PROFICIENCY.HEAVY,
  shield: ARMOR_PROFICIENCY.SHIELD
};

const armorTypeByProficiency: Record<ARMOR_PROFICIENCY, ArmorType> = {
  [ARMOR_PROFICIENCY.LIGHT]: "light",
  [ARMOR_PROFICIENCY.MEDIUM]: "medium",
  [ARMOR_PROFICIENCY.HEAVY]: "heavy",
  [ARMOR_PROFICIENCY.SHIELD]: "shield"
};

export const armorProficiencyLabelsByType: Record<ArmorType, string> = {
  light: "Light armor",
  medium: "Medium armor",
  heavy: "Heavy armor",
  shield: "Shield"
};

export function getSavingThrowAbilityKey(
  proficiency: SAVING_THROW_PROFICIENCY
): AbilityKey {
  return abilityKeyBySavingThrowProficiency[proficiency];
}

export function getSavingThrowProficiencyForAbilityKey(
  ability: AbilityKey
): SAVING_THROW_PROFICIENCY {
  return savingThrowProficiencyByAbilityKey[ability];
}

export function getArmorProficiencyForType(type: ArmorType): ARMOR_PROFICIENCY {
  return armorProficiencyByType[type];
}

export function isClassName(value: string): value is ClassName {
  return classOptionSet.has(value);
}

export function getClassProficiencyProfile(className: string): ClassProficiencyProfile | null {
  if (!isClassName(className)) {
    return null;
  }

  const baseProfile = classProficiencyProfiles[className];
  const starterPack = getClassStarterPack(className);

  if (!starterPack) {
    return baseProfile;
  }

  return {
    ...baseProfile,
    primaryAbility: starterPack.primaryAbility,
    savingThrowProficiencies: [...starterPack.savingThrowProficiencies],
    grantedSkillProficiencies: starterPack.grantedSkillProficiencies ?? [],
    skillProficiencyOptions: [...starterPack.skillProficiencies],
    skillProficiencyCount: starterPack.skillProficiencySelectionCount,
    grantedToolProficiencies: starterPack.grantedToolProficiencies ?? [],
    toolProficiencyChoices: starterPack.toolProficiencyChoices ?? [],
    toolProficiencyChoiceCount: starterPack.toolProficiencyChoiceCount ?? 0,
    weaponProficiencies: [...starterPack.weaponProficiencies],
    armorProficiencies: starterPack.armorTrainingProficiencies.map(
      (proficiency) => armorTypeByProficiency[proficiency]
    )
  };
}

export function getPrimaryAbilityForClass(className: string): AbilityKey | null {
  return getClassProficiencyProfile(className)?.primaryAbility ?? null;
}

export function getSavingThrowAbilityKeysForClass(className: string): AbilityKey[] {
  return (getClassProficiencyProfile(className)?.savingThrowProficiencies ?? []).map(
    (proficiency) => abilityKeyBySavingThrowProficiency[proficiency]
  );
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

export function getEquipmentProficiencyLabelsForClass(
  className: string
): EquipmentProficiencyLabels {
  const profile = getClassProficiencyProfile(className);

  if (!profile) {
    return {
      weapons: [],
      armor: []
    };
  }

  return {
    weapons: profile.weaponProficiencies.map((proficiency) => getWeaponProficiencyLabel(proficiency)),
    armor: profile.armorProficiencies.map((type) => armorProficiencyLabelsByType[type])
  };
}
