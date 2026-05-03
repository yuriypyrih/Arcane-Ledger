import { getSpellEntriesForSpellListClass } from "../../../codex/classes/spellAccess";
import {
  DAMAGE_TYPE,
  FEATS,
  MAGIC_SCHOOL,
  SPELL_LIST_CLASS,
  getSpellEntries,
  type SpellEntry
} from "../../../codex/entries";
import { ALL_SKILLS, SKILL, TOOL_PROFICIENCY, type WEAPON_PROFICIENCY } from "../../../types";
import type {
  AbilityKey,
  BlessedWarriorChoice,
  CharacterFeatEntry,
  CrusherChoice,
  DualWielderChoice,
  ElementalAdeptChoice,
  DruidicWarriorChoice,
  FeyTouchedChoice,
  HeavilyArmoredChoice,
  HeavyArmorMasterChoice,
  InspiringLeaderChoice,
  KeenMindChoice,
  LightlyArmoredChoice,
  MageSlayerChoice,
  MartialWeaponTrainingChoice,
  MediumArmorMasterChoice,
  ModeratelyArmoredChoice,
  MountedCombatantChoice,
  ObservantChoice,
  PiercerChoice,
  PoisonerChoice,
  ResilientChoice,
  SpeedyChoice,
  WeaponMasterChoice,
  LuckyChoice,
  MagicInitiateChoice,
  MusicianChoice,
  SkillName
} from "../../../types";
import type {
  AbilityScoreImprovementChoice,
  AthleteChoice,
  BoonOfIrresistibleOffenseChoice,
  ChargerChoice,
  ChefChoice,
  EpicBoonAbilityChoice,
  SkilledChoice,
  SkilledFeatSelection
} from "../../../types/feats";
import { formatCodexLabel } from "../../../utils/codex";
import { abilityKeys } from "../constants";
import { getToolProficiencyLabel, musicalInstrumentToolProficiencies } from "../proficiencyOptions";
import { getWeaponProficiencyLabel } from "../proficiencyWeaponLabels";
import { getWeaponMasteryOptions } from "../classFeatures/weaponMastery";
import { getCrafterChoiceSummary } from "./crafter";

const abilityKeySet = new Set<AbilityKey>(abilityKeys);
const skillNameSet = new Set<SkillName>(ALL_SKILLS);
const allEpicBoonAbilityOptions: AbilityKey[] = [...abilityKeys];
const spellRecallAbilityOptions: AbilityKey[] = ["INT", "WIS", "CHA"];
const blessedWarriorCantripOptions = getSpellEntriesForSpellListClass(
  SPELL_LIST_CLASS.CLERIC
).filter((spell) => spell.spellLevel === 0);
const blessedWarriorCantripOptionsById = new Map(
  blessedWarriorCantripOptions.map((spell) => [spell.id, spell] as const)
);
const druidicWarriorCantripOptions = getSpellEntriesForSpellListClass(
  SPELL_LIST_CLASS.DRUID
).filter((spell) => spell.spellLevel === 0);
const druidicWarriorCantripOptionsById = new Map(
  druidicWarriorCantripOptions.map((spell) => [spell.id, spell] as const)
);
export const magicInitiateSpellListOptions = [
  SPELL_LIST_CLASS.CLERIC,
  SPELL_LIST_CLASS.DRUID,
  SPELL_LIST_CLASS.WIZARD
] as const;
export const magicInitiateSpellcastingAbilityOptions = ["INT", "WIS", "CHA"] as const;
export const elementalAdeptAbilityOptions = ["INT", "WIS", "CHA"] as const;
export const elementalAdeptDamageTypeOptions = [
  DAMAGE_TYPE.ACID,
  DAMAGE_TYPE.COLD,
  DAMAGE_TYPE.FIRE,
  DAMAGE_TYPE.LIGHTNING,
  DAMAGE_TYPE.THUNDER
] as const;
export const feyTouchedAbilityOptions = ["INT", "WIS", "CHA"] as const;
export const heavilyArmoredAbilityOptions = ["CON", "STR"] as const;
export const heavyArmorMasterAbilityOptions = ["CON", "STR"] as const;
export const inspiringLeaderAbilityOptions = ["WIS", "CHA"] as const;
export const keenMindSkillOptions = [
  SKILL.ARCANA,
  SKILL.HISTORY,
  SKILL.INVESTIGATION,
  SKILL.NATURE,
  SKILL.RELIGION
] as const;
export const lightlyArmoredAbilityOptions = ["STR", "DEX"] as const;
export const mageSlayerAbilityOptions = ["STR", "DEX"] as const;
export const martialWeaponTrainingAbilityOptions = ["STR", "DEX"] as const;
export const mediumArmorMasterAbilityOptions = ["STR", "DEX"] as const;
export const moderatelyArmoredAbilityOptions = ["STR", "DEX"] as const;
export const mountedCombatantAbilityOptions = ["STR", "DEX", "WIS"] as const;
export const observantAbilityOptions = ["INT", "WIS"] as const;
export const observantSkillOptions = [
  SKILL.INSIGHT,
  SKILL.INVESTIGATION,
  SKILL.PERCEPTION
] as const;
export const piercerAbilityOptions = ["STR", "DEX"] as const;
export const poisonerAbilityOptions = ["DEX", "INT"] as const;
export const resilientAbilityOptions = abilityKeys;
export const speedyAbilityOptions = ["DEX", "CON"] as const;
export const weaponMasterAbilityOptions = ["STR", "DEX"] as const;
export const weaponMasterMasteryOptions = getWeaponMasteryOptions();
const magicInitiateSpellListOptionSet = new Set<SPELL_LIST_CLASS>(magicInitiateSpellListOptions);
const magicInitiateSpellcastingAbilityOptionSet = new Set<AbilityKey>(
  magicInitiateSpellcastingAbilityOptions
);
const elementalAdeptAbilityOptionSet = new Set<AbilityKey>(elementalAdeptAbilityOptions);
const elementalAdeptDamageTypeOptionSet = new Set<DAMAGE_TYPE>(elementalAdeptDamageTypeOptions);
const feyTouchedAbilityOptionSet = new Set<AbilityKey>(feyTouchedAbilityOptions);
const heavilyArmoredAbilityOptionSet = new Set<AbilityKey>(heavilyArmoredAbilityOptions);
const heavyArmorMasterAbilityOptionSet = new Set<AbilityKey>(heavyArmorMasterAbilityOptions);
const inspiringLeaderAbilityOptionSet = new Set<AbilityKey>(inspiringLeaderAbilityOptions);
const keenMindSkillOptionSet = new Set<SkillName>(keenMindSkillOptions);
const lightlyArmoredAbilityOptionSet = new Set<AbilityKey>(lightlyArmoredAbilityOptions);
const mageSlayerAbilityOptionSet = new Set<AbilityKey>(mageSlayerAbilityOptions);
const martialWeaponTrainingAbilityOptionSet = new Set<AbilityKey>(
  martialWeaponTrainingAbilityOptions
);
const mediumArmorMasterAbilityOptionSet = new Set<AbilityKey>(mediumArmorMasterAbilityOptions);
const moderatelyArmoredAbilityOptionSet = new Set<AbilityKey>(moderatelyArmoredAbilityOptions);
const mountedCombatantAbilityOptionSet = new Set<AbilityKey>(mountedCombatantAbilityOptions);
const observantAbilityOptionSet = new Set<AbilityKey>(observantAbilityOptions);
const observantSkillOptionSet = new Set<SkillName>(observantSkillOptions);
const piercerAbilityOptionSet = new Set<AbilityKey>(piercerAbilityOptions);
const poisonerAbilityOptionSet = new Set<AbilityKey>(poisonerAbilityOptions);
const resilientAbilityOptionSet = new Set<AbilityKey>(resilientAbilityOptions);
const speedyAbilityOptionSet = new Set<AbilityKey>(speedyAbilityOptions);
const weaponMasterAbilityOptionSet = new Set<AbilityKey>(weaponMasterAbilityOptions);
const weaponMasterMasteryOptionSet = new Set<WEAPON_PROFICIENCY>(weaponMasterMasteryOptions);
const feyTouchedSpellSchoolOptions = new Set<MAGIC_SCHOOL>([
  MAGIC_SCHOOL.DIVINATION,
  MAGIC_SCHOOL.ENCHANTMENT
]);
const feyTouchedFreeCastSpellIds = new Set(["spell-misty-step"]);
const magicInitiateCantripOptionsBySpellList = new Map<
  MagicInitiateChoice["spellList"],
  SpellEntry[]
>(
  magicInitiateSpellListOptions.map((spellList) => [
    spellList,
    getSpellEntriesForSpellListClass(spellList).filter((spell) => spell.spellLevel === 0)
  ])
);
const magicInitiateLevelOneSpellOptionsBySpellList = new Map<
  MagicInitiateChoice["spellList"],
  SpellEntry[]
>(
  magicInitiateSpellListOptions.map((spellList) => [
    spellList,
    getSpellEntriesForSpellListClass(spellList).filter((spell) => spell.spellLevel === 1)
  ])
);
const magicInitiateCantripOptionsBySpellListAndId = new Map<
  MagicInitiateChoice["spellList"],
  Map<string, SpellEntry>
>(
  magicInitiateSpellListOptions.map((spellList) => [
    spellList,
    new Map(
      (magicInitiateCantripOptionsBySpellList.get(spellList) ?? []).map(
        (spell) => [spell.id, spell] as const
      )
    )
  ])
);
const magicInitiateLevelOneSpellOptionsBySpellListAndId = new Map<
  MagicInitiateChoice["spellList"],
  Map<string, SpellEntry>
>(
  magicInitiateSpellListOptions.map((spellList) => [
    spellList,
    new Map(
      (magicInitiateLevelOneSpellOptionsBySpellList.get(spellList) ?? []).map(
        (spell) => [spell.id, spell] as const
      )
    )
  ])
);
const musicalInstrumentToolProficiencySet = new Set<TOOL_PROFICIENCY>(
  musicalInstrumentToolProficiencies
);
const feyTouchedSpellOptions = getSpellEntries()
  .filter(
    (spell) => spell.spellLevel === 1 && feyTouchedSpellSchoolOptions.has(spell.magicSchool)
  )
  .sort((left, right) => left.name.localeCompare(right.name));
const feyTouchedSpellOptionsById = new Map(
  feyTouchedSpellOptions.map((spell) => [spell.id, spell] as const)
);
export const epicBoonAbilityIncreaseFeatOptions = new Map<FEATS, AbilityKey[]>([
  [FEATS.BOON_OF_COMBAT_PROWESS, allEpicBoonAbilityOptions],
  [FEATS.BOON_OF_DIMENSIONAL_TRAVEL, allEpicBoonAbilityOptions],
  [FEATS.BOON_OF_FATE, allEpicBoonAbilityOptions],
  [FEATS.BOON_OF_THE_NIGHT_SPIRIT, allEpicBoonAbilityOptions],
  [FEATS.BOON_OF_SPELL_RECALL, spellRecallAbilityOptions],
  [FEATS.BOON_OF_TRUESIGHT, allEpicBoonAbilityOptions]
]);

function isAbilityKey(value: unknown): value is AbilityKey {
  return typeof value === "string" && abilityKeySet.has(value as AbilityKey);
}

export function normalizeAbilityScoreImprovementChoice(
  value: unknown
): AbilityScoreImprovementChoice | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<AbilityScoreImprovementChoice>;

  if (record.mode === "single" && isAbilityKey(record.primaryAbility)) {
    return {
      mode: "single",
      primaryAbility: record.primaryAbility
    };
  }

  if (
    record.mode === "split" &&
    isAbilityKey(record.primaryAbility) &&
    isAbilityKey(record.secondaryAbility) &&
    record.primaryAbility !== record.secondaryAbility
  ) {
    return {
      mode: "split",
      primaryAbility: record.primaryAbility,
      secondaryAbility: record.secondaryAbility
    };
  }

  return undefined;
}

export function normalizeBoonOfIrresistibleOffenseChoice(
  value: unknown
): BoonOfIrresistibleOffenseChoice | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<BoonOfIrresistibleOffenseChoice>;

  if (record.ability === "STR" || record.ability === "DEX") {
    return {
      ability: record.ability
    };
  }

  return undefined;
}

export function normalizeAthleteChoice(value: unknown): AthleteChoice | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<AthleteChoice>;

  if (record.ability === "STR" || record.ability === "DEX") {
    return {
      ability: record.ability
    };
  }

  return undefined;
}

export function normalizeChargerChoice(value: unknown): ChargerChoice | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<ChargerChoice>;

  if (record.ability === "STR" || record.ability === "DEX") {
    return {
      ability: record.ability
    };
  }

  return undefined;
}

export function normalizeChefChoice(value: unknown): ChefChoice | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<ChefChoice>;

  if (record.ability === "CON" || record.ability === "WIS") {
    return {
      ability: record.ability
    };
  }

  return undefined;
}

export function normalizeCrusherChoice(value: unknown): CrusherChoice | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<CrusherChoice>;

  if (record.ability === "STR" || record.ability === "CON") {
    return {
      ability: record.ability
    };
  }

  return undefined;
}

export function normalizeDualWielderChoice(value: unknown): DualWielderChoice | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<DualWielderChoice>;

  if (record.ability === "STR" || record.ability === "DEX") {
    return {
      ability: record.ability
    };
  }

  return undefined;
}

export function normalizeElementalAdeptChoice(value: unknown): ElementalAdeptChoice | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<ElementalAdeptChoice>;

  if (
    typeof record.ability === "string" &&
    typeof record.damageType === "string" &&
    elementalAdeptAbilityOptionSet.has(record.ability as AbilityKey) &&
    elementalAdeptDamageTypeOptionSet.has(record.damageType as DAMAGE_TYPE)
  ) {
    return {
      ability: record.ability as ElementalAdeptChoice["ability"],
      damageType: record.damageType as ElementalAdeptChoice["damageType"]
    };
  }

  return undefined;
}

export function normalizeFeyTouchedChoice(value: unknown): FeyTouchedChoice | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<FeyTouchedChoice>;

  if (
    typeof record.ability !== "string" ||
    typeof record.spellId !== "string" ||
    !feyTouchedAbilityOptionSet.has(record.ability as AbilityKey) ||
    !feyTouchedSpellOptionsById.has(record.spellId)
  ) {
    return undefined;
  }

  const freeCastExpendedSpellIds = Array.isArray(record.freeCastExpendedSpellIds)
    ? [
        ...new Set(
          record.freeCastExpendedSpellIds.filter(
            (spellId): spellId is string =>
              spellId === record.spellId || feyTouchedFreeCastSpellIds.has(spellId)
          )
        )
      ]
    : [];

  return {
    ability: record.ability as FeyTouchedChoice["ability"],
    spellId: record.spellId,
    freeCastExpendedSpellIds:
      freeCastExpendedSpellIds.length > 0 ? freeCastExpendedSpellIds : undefined
  };
}

export function normalizeHeavilyArmoredChoice(value: unknown): HeavilyArmoredChoice | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<HeavilyArmoredChoice>;

  if (
    typeof record.ability === "string" &&
    heavilyArmoredAbilityOptionSet.has(record.ability as AbilityKey)
  ) {
    return {
      ability: record.ability as HeavilyArmoredChoice["ability"]
    };
  }

  return undefined;
}

export function normalizeHeavyArmorMasterChoice(
  value: unknown
): HeavyArmorMasterChoice | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<HeavyArmorMasterChoice>;

  if (
    typeof record.ability === "string" &&
    heavyArmorMasterAbilityOptionSet.has(record.ability as AbilityKey)
  ) {
    return {
      ability: record.ability as HeavyArmorMasterChoice["ability"]
    };
  }

  return undefined;
}

export function normalizeInspiringLeaderChoice(
  value: unknown
): InspiringLeaderChoice | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<InspiringLeaderChoice>;

  if (
    typeof record.ability === "string" &&
    inspiringLeaderAbilityOptionSet.has(record.ability as AbilityKey)
  ) {
    return {
      ability: record.ability as InspiringLeaderChoice["ability"]
    };
  }

  return undefined;
}

export function normalizeKeenMindChoice(value: unknown): KeenMindChoice | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<KeenMindChoice>;

  if (typeof record.skill === "string" && keenMindSkillOptionSet.has(record.skill as SkillName)) {
    return {
      skill: record.skill as KeenMindChoice["skill"]
    };
  }

  return undefined;
}

export function normalizeLightlyArmoredChoice(value: unknown): LightlyArmoredChoice | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<LightlyArmoredChoice>;

  if (
    typeof record.ability === "string" &&
    lightlyArmoredAbilityOptionSet.has(record.ability as AbilityKey)
  ) {
    return {
      ability: record.ability as LightlyArmoredChoice["ability"]
    };
  }

  return undefined;
}

export function normalizeMageSlayerChoice(value: unknown): MageSlayerChoice | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<MageSlayerChoice>;

  if (
    typeof record.ability === "string" &&
    mageSlayerAbilityOptionSet.has(record.ability as AbilityKey)
  ) {
    return {
      ability: record.ability as MageSlayerChoice["ability"],
      guardedMindExpended: record.guardedMindExpended === true ? true : undefined
    };
  }

  return undefined;
}

export function normalizeMartialWeaponTrainingChoice(
  value: unknown
): MartialWeaponTrainingChoice | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<MartialWeaponTrainingChoice>;

  if (
    typeof record.ability === "string" &&
    martialWeaponTrainingAbilityOptionSet.has(record.ability as AbilityKey)
  ) {
    return {
      ability: record.ability as MartialWeaponTrainingChoice["ability"]
    };
  }

  return undefined;
}

export function normalizeMediumArmorMasterChoice(
  value: unknown
): MediumArmorMasterChoice | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<MediumArmorMasterChoice>;

  if (
    typeof record.ability === "string" &&
    mediumArmorMasterAbilityOptionSet.has(record.ability as AbilityKey)
  ) {
    return {
      ability: record.ability as MediumArmorMasterChoice["ability"]
    };
  }

  return undefined;
}

export function normalizeModeratelyArmoredChoice(
  value: unknown
): ModeratelyArmoredChoice | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<ModeratelyArmoredChoice>;

  if (
    typeof record.ability === "string" &&
    moderatelyArmoredAbilityOptionSet.has(record.ability as AbilityKey)
  ) {
    return {
      ability: record.ability as ModeratelyArmoredChoice["ability"]
    };
  }

  return undefined;
}

export function normalizeMountedCombatantChoice(
  value: unknown
): MountedCombatantChoice | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<MountedCombatantChoice>;

  if (
    typeof record.ability === "string" &&
    mountedCombatantAbilityOptionSet.has(record.ability as AbilityKey)
  ) {
    return {
      ability: record.ability as MountedCombatantChoice["ability"]
    };
  }

  return undefined;
}

export function normalizeObservantChoice(value: unknown): ObservantChoice | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<ObservantChoice>;

  if (
    typeof record.ability === "string" &&
    observantAbilityOptionSet.has(record.ability as AbilityKey) &&
    typeof record.skill === "string" &&
    observantSkillOptionSet.has(record.skill as SkillName)
  ) {
    return {
      ability: record.ability as ObservantChoice["ability"],
      skill: record.skill as ObservantChoice["skill"]
    };
  }

  return undefined;
}

export function normalizePiercerChoice(value: unknown): PiercerChoice | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<PiercerChoice>;

  if (
    typeof record.ability === "string" &&
    piercerAbilityOptionSet.has(record.ability as AbilityKey)
  ) {
    return {
      ability: record.ability as PiercerChoice["ability"]
    };
  }

  return undefined;
}

export function normalizePoisonerChoice(value: unknown): PoisonerChoice | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<PoisonerChoice>;

  if (
    typeof record.ability === "string" &&
    poisonerAbilityOptionSet.has(record.ability as AbilityKey)
  ) {
    return {
      ability: record.ability as PoisonerChoice["ability"]
    };
  }

  return undefined;
}

export function normalizeResilientChoice(value: unknown): ResilientChoice | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<ResilientChoice>;

  if (
    typeof record.ability === "string" &&
    resilientAbilityOptionSet.has(record.ability as AbilityKey)
  ) {
    return {
      ability: record.ability as ResilientChoice["ability"]
    };
  }

  return undefined;
}

export function normalizeSpeedyChoice(value: unknown): SpeedyChoice | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<SpeedyChoice>;

  if (typeof record.ability === "string" && speedyAbilityOptionSet.has(record.ability as AbilityKey)) {
    return {
      ability: record.ability as SpeedyChoice["ability"]
    };
  }

  return undefined;
}

export function normalizeWeaponMasterChoice(value: unknown): WeaponMasterChoice | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<WeaponMasterChoice>;

  if (
    typeof record.ability === "string" &&
    weaponMasterAbilityOptionSet.has(record.ability as AbilityKey) &&
    typeof record.weaponMastery === "string" &&
    weaponMasterMasteryOptionSet.has(record.weaponMastery as WEAPON_PROFICIENCY)
  ) {
    return {
      ability: record.ability as WeaponMasterChoice["ability"],
      weaponMastery: record.weaponMastery as WeaponMasterChoice["weaponMastery"]
    };
  }

  return undefined;
}

export function normalizeEpicBoonAbilityChoice(
  feat: FEATS,
  value: unknown
): EpicBoonAbilityChoice | undefined {
  const allowedAbilities = epicBoonAbilityIncreaseFeatOptions.get(feat);

  if (!allowedAbilities || !value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<EpicBoonAbilityChoice>;

  if (typeof record.ability !== "string") {
    return undefined;
  }

  const ability = record.ability as AbilityKey;

  if (!allowedAbilities.includes(ability)) {
    return undefined;
  }

  return {
    ability
  };
}

export function normalizeBlessedWarriorChoice(value: unknown): BlessedWarriorChoice | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<BlessedWarriorChoice>;

  if (!Array.isArray(record.cantripIds) || record.cantripIds.length !== 2) {
    return undefined;
  }

  const cantripIds = [
    ...new Set(record.cantripIds.filter((id): id is string => typeof id === "string"))
  ];

  if (cantripIds.length !== 2) {
    return undefined;
  }

  if (!cantripIds.every((id) => blessedWarriorCantripOptionsById.has(id))) {
    return undefined;
  }

  return {
    cantripIds: cantripIds as BlessedWarriorChoice["cantripIds"]
  };
}

export function normalizeDruidicWarriorChoice(value: unknown): DruidicWarriorChoice | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<DruidicWarriorChoice>;

  if (!Array.isArray(record.cantripIds) || record.cantripIds.length !== 2) {
    return undefined;
  }

  const cantripIds = [
    ...new Set(record.cantripIds.filter((id): id is string => typeof id === "string"))
  ];

  if (cantripIds.length !== 2) {
    return undefined;
  }

  if (!cantripIds.every((id) => druidicWarriorCantripOptionsById.has(id))) {
    return undefined;
  }

  return {
    cantripIds: cantripIds as DruidicWarriorChoice["cantripIds"]
  };
}

export function isMagicInitiateSpellList(
  value: unknown
): value is MagicInitiateChoice["spellList"] {
  return (
    typeof value === "string" &&
    magicInitiateSpellListOptionSet.has(value as MagicInitiateChoice["spellList"])
  );
}

export function normalizeMagicInitiateChoice(value: unknown): MagicInitiateChoice | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<MagicInitiateChoice>;

  if (!isMagicInitiateSpellList(record.spellList)) {
    return undefined;
  }

  if (!Array.isArray(record.cantripIds) || record.cantripIds.length !== 2) {
    return undefined;
  }

  const cantripOptionsById = magicInitiateCantripOptionsBySpellListAndId.get(record.spellList);
  const levelOneSpellOptionsById = magicInitiateLevelOneSpellOptionsBySpellListAndId.get(
    record.spellList
  );
  const cantripIds = [
    ...new Set(record.cantripIds.filter((id): id is string => typeof id === "string"))
  ];

  if (
    cantripIds.length !== 2 ||
    !cantripOptionsById ||
    !cantripIds.every((id) => cantripOptionsById.has(id))
  ) {
    return undefined;
  }

  if (
    typeof record.levelOneSpellId !== "string" ||
    !levelOneSpellOptionsById?.has(record.levelOneSpellId)
  ) {
    return undefined;
  }

  if (
    typeof record.spellcastingAbility !== "string" ||
    !magicInitiateSpellcastingAbilityOptionSet.has(record.spellcastingAbility as AbilityKey)
  ) {
    return undefined;
  }

  return {
    spellList: record.spellList,
    cantripIds: cantripIds as MagicInitiateChoice["cantripIds"],
    levelOneSpellId: record.levelOneSpellId,
    spellcastingAbility: record.spellcastingAbility as MagicInitiateChoice["spellcastingAbility"],
    freeCastExpended: record.freeCastExpended === true ? true : undefined
  };
}

function isSkilledTool(value: unknown): value is TOOL_PROFICIENCY {
  return (
    typeof value === "string" && Object.values(TOOL_PROFICIENCY).includes(value as TOOL_PROFICIENCY)
  );
}

function normalizeSkilledSelection(value: unknown): SkilledFeatSelection | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Partial<SkilledFeatSelection>;

  if (
    record.kind === "skill" &&
    typeof record.skill === "string" &&
    skillNameSet.has(record.skill as SkillName)
  ) {
    return {
      kind: "skill",
      skill: record.skill as SkillName
    };
  }

  if (record.kind === "tool" && isSkilledTool(record.tool)) {
    return {
      kind: "tool",
      tool: record.tool
    };
  }

  return null;
}

export function normalizeSkilledChoice(value: unknown): SkilledChoice | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<SkilledChoice>;

  if (!Array.isArray(record.selections) || record.selections.length !== 3) {
    return undefined;
  }

  const selections = record.selections
    .map((selection) => normalizeSkilledSelection(selection))
    .filter((selection): selection is SkilledFeatSelection => selection !== null);

  if (selections.length !== 3) {
    return undefined;
  }

  return {
    selections: selections as SkilledChoice["selections"]
  };
}

function isMusicianInstrument(value: unknown): value is TOOL_PROFICIENCY {
  return (
    typeof value === "string" && musicalInstrumentToolProficiencySet.has(value as TOOL_PROFICIENCY)
  );
}

export function normalizeMusicianChoice(value: unknown): MusicianChoice | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<MusicianChoice>;

  if (!Array.isArray(record.toolProficiencies) || record.toolProficiencies.length !== 3) {
    return undefined;
  }

  const toolProficiencies = record.toolProficiencies.filter(isMusicianInstrument);
  const uniqueToolProficiencies = [...new Set(toolProficiencies)];

  if (uniqueToolProficiencies.length !== 3) {
    return undefined;
  }

  return {
    toolProficiencies: uniqueToolProficiencies as MusicianChoice["toolProficiencies"]
  };
}

function getFeatProficiencyBonusForLevel(level: number): number {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));
  return Math.floor((normalizedLevel - 1) / 4) + 2;
}

export function normalizeLuckyChoice(
  value: unknown,
  currentLevel: number
): LuckyChoice | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const rawPointsExpended = Number((value as Partial<LuckyChoice>).pointsExpended);
  const pointsExpended = Number.isFinite(rawPointsExpended) ? Math.floor(rawPointsExpended) : 0;
  const maxPoints = getFeatProficiencyBonusForLevel(currentLevel);
  const normalizedPointsExpended = Math.max(0, Math.min(maxPoints, pointsExpended));

  return normalizedPointsExpended > 0
    ? {
        pointsExpended: normalizedPointsExpended
      }
    : undefined;
}

export function getAbilityScoreImprovementSummary(
  choice?: AbilityScoreImprovementChoice
): string | null {
  if (!choice) {
    return null;
  }

  if (choice.mode === "single") {
    return `${choice.primaryAbility} +2`;
  }

  return `${choice.primaryAbility} +1, ${choice.secondaryAbility} +1`;
}

export function getSkilledSelectionLabel(selection: SkilledFeatSelection): string {
  return selection.kind === "skill" ? selection.skill : getToolProficiencyLabel(selection.tool);
}

export function getSkilledChoiceSummary(choice?: SkilledChoice): string | null {
  if (!choice) {
    return null;
  }

  return choice.selections.map((selection) => getSkilledSelectionLabel(selection)).join(", ");
}

export function getMusicianChoiceSummary(choice?: MusicianChoice): string | null {
  if (!choice) {
    return null;
  }

  return choice.toolProficiencies.map((tool) => getToolProficiencyLabel(tool)).join(", ");
}

export function getEpicBoonAbilityChoiceSummary(choice?: EpicBoonAbilityChoice): string | null {
  return choice ? `${choice.ability} +1` : null;
}

export function getAthleteChoiceSummary(choice?: AthleteChoice): string | null {
  return choice ? `${choice.ability} +1` : null;
}

export function getChargerChoiceSummary(choice?: ChargerChoice): string | null {
  return choice ? `${choice.ability} +1` : null;
}

export function getChefChoiceSummary(choice?: ChefChoice): string | null {
  return choice ? `${choice.ability} +1` : null;
}

export function getCrusherChoiceSummary(choice?: CrusherChoice): string | null {
  return choice ? `${choice.ability} +1` : null;
}

export function getDualWielderChoiceSummary(choice?: DualWielderChoice): string | null {
  return choice ? `${choice.ability} +1` : null;
}

export function getElementalAdeptChoiceSummary(choice?: ElementalAdeptChoice): string | null {
  return choice ? `${choice.ability} +1, ${formatCodexLabel(choice.damageType)}` : null;
}

export function getFeyTouchedChoiceSummary(choice?: FeyTouchedChoice): string | null {
  if (!choice) {
    return null;
  }

  const spellName = feyTouchedSpellOptionsById.get(choice.spellId)?.name;

  return spellName ? `${choice.ability} +1, ${spellName}` : `${choice.ability} +1`;
}

export function getHeavilyArmoredChoiceSummary(choice?: HeavilyArmoredChoice): string | null {
  return choice ? `${choice.ability} +1, Heavy armor` : null;
}

export function getHeavyArmorMasterChoiceSummary(
  choice?: HeavyArmorMasterChoice
): string | null {
  return choice ? `${choice.ability} +1, Damage Reduction` : null;
}

export function getInspiringLeaderChoiceSummary(choice?: InspiringLeaderChoice): string | null {
  return choice ? `${choice.ability} +1, Bolstering Performance` : null;
}

export function getKeenMindChoiceSummary(choice?: KeenMindChoice): string | null {
  return choice ? `INT +1, ${choice.skill}` : null;
}

export function getLightlyArmoredChoiceSummary(choice?: LightlyArmoredChoice): string | null {
  return choice ? `${choice.ability} +1, Light armor, Shield` : null;
}

export function getMageSlayerChoiceSummary(choice?: MageSlayerChoice): string | null {
  return choice ? `${choice.ability} +1, Guarded Mind` : null;
}

export function getMartialWeaponTrainingChoiceSummary(
  choice?: MartialWeaponTrainingChoice
): string | null {
  return choice ? `${choice.ability} +1, Martial weapons` : null;
}

export function getMediumArmorMasterChoiceSummary(
  choice?: MediumArmorMasterChoice
): string | null {
  return choice ? `${choice.ability} +1, Dexterous Wearer` : null;
}

export function getModeratelyArmoredChoiceSummary(
  choice?: ModeratelyArmoredChoice
): string | null {
  return choice ? `${choice.ability} +1, Medium armor` : null;
}

export function getMountedCombatantChoiceSummary(
  choice?: MountedCombatantChoice
): string | null {
  return choice ? `${choice.ability} +1` : null;
}

export function getObservantChoiceSummary(choice?: ObservantChoice): string | null {
  return choice ? `${choice.ability} +1 (max 10), ${choice.skill}` : null;
}

export function getPiercerChoiceSummary(choice?: PiercerChoice): string | null {
  return choice ? `${choice.ability} +1, Piercing damage` : null;
}

export function getPoisonerChoiceSummary(choice?: PoisonerChoice): string | null {
  return choice ? `${choice.ability} +1, Potent Poison` : null;
}

export function getResilientChoiceSummary(choice?: ResilientChoice): string | null {
  return choice ? `${choice.ability} +1, ${choice.ability} Saving Throw` : null;
}

export function getSpeedyChoiceSummary(choice?: SpeedyChoice): string | null {
  return choice ? `${choice.ability} +1, Speed +10` : null;
}

export function getWeaponMasterChoiceSummary(choice?: WeaponMasterChoice): string | null {
  return choice
    ? `${choice.ability} +1, ${getWeaponProficiencyLabel(choice.weaponMastery)} mastery`
    : null;
}

export function getBlessedWarriorChoiceSummary(choice?: BlessedWarriorChoice): string | null {
  if (!choice) {
    return null;
  }

  const cantripNames = choice.cantripIds
    .map((cantripId) => blessedWarriorCantripOptionsById.get(cantripId)?.name)
    .filter((name): name is string => Boolean(name));

  return cantripNames.length > 0 ? cantripNames.join(", ") : null;
}

export function getDruidicWarriorChoiceSummary(choice?: DruidicWarriorChoice): string | null {
  if (!choice) {
    return null;
  }

  const cantripNames = choice.cantripIds
    .map((cantripId) => druidicWarriorCantripOptionsById.get(cantripId)?.name)
    .filter((name): name is string => Boolean(name));

  return cantripNames.length > 0 ? cantripNames.join(", ") : null;
}

export function getMagicInitiateSpellListLabel(
  spellList: MagicInitiateChoice["spellList"]
): string {
  return formatCodexLabel(spellList);
}

export function getMagicInitiateChoiceSummary(choice?: MagicInitiateChoice): string | null {
  if (!choice) {
    return null;
  }

  const cantripOptionsById = magicInitiateCantripOptionsBySpellListAndId.get(choice.spellList);
  const levelOneSpellOptionsById = magicInitiateLevelOneSpellOptionsBySpellListAndId.get(
    choice.spellList
  );
  const cantripNames = choice.cantripIds
    .map((cantripId) => cantripOptionsById?.get(cantripId)?.name)
    .filter((name): name is string => Boolean(name));
  const levelOneSpellName = levelOneSpellOptionsById?.get(choice.levelOneSpellId)?.name;
  const spellNames = [...cantripNames, levelOneSpellName].filter((name): name is string =>
    Boolean(name)
  );

  return spellNames.length > 0
    ? `${getMagicInitiateSpellListLabel(choice.spellList)} (${choice.spellcastingAbility}): ${spellNames.join(", ")}`
    : null;
}

export function getCharacterFeatSummary(entry: CharacterFeatEntry): string | null {
  if (entry.feat === FEATS.ABILITY_SCORE_IMPROVEMENT) {
    return getAbilityScoreImprovementSummary(entry.abilityScoreImprovement);
  }

  if (entry.feat === FEATS.BLESSED_WARRIOR) {
    return getBlessedWarriorChoiceSummary(entry.blessedWarrior);
  }

  if (entry.feat === FEATS.DRUIDIC_WARRIOR) {
    return getDruidicWarriorChoiceSummary(entry.druidicWarrior);
  }

  if (entry.feat === FEATS.MAGIC_INITIATE) {
    return getMagicInitiateChoiceSummary(entry.magicInitiate);
  }

  if (entry.feat === FEATS.CRAFTER) {
    return getCrafterChoiceSummary(entry.crafter);
  }

  if (entry.feat === FEATS.BOON_OF_IRRESISTIBLE_OFFENSE) {
    return entry.boonOfIrresistibleOffense ? `${entry.boonOfIrresistibleOffense.ability} +1` : null;
  }

  if (entry.feat === FEATS.ATHLETE) {
    return getAthleteChoiceSummary(entry.athlete);
  }

  if (entry.feat === FEATS.CHARGER) {
    return getChargerChoiceSummary(entry.charger);
  }

  if (entry.feat === FEATS.CHEF) {
    return getChefChoiceSummary(entry.chef);
  }

  if (entry.feat === FEATS.CRUSHER) {
    return getCrusherChoiceSummary(entry.crusher);
  }

  if (entry.feat === FEATS.DUAL_WIELDER) {
    return getDualWielderChoiceSummary(entry.dualWielder);
  }

  if (entry.feat === FEATS.ELEMENTAL_ADEPT) {
    return getElementalAdeptChoiceSummary(entry.elementalAdept);
  }

  if (entry.feat === FEATS.FEY_TOUCHED) {
    return getFeyTouchedChoiceSummary(entry.feyTouched);
  }

  if (entry.feat === FEATS.HEAVILY_ARMORED) {
    return getHeavilyArmoredChoiceSummary(entry.heavilyArmored);
  }

  if (entry.feat === FEATS.HEAVY_ARMOR_MASTER) {
    return getHeavyArmorMasterChoiceSummary(entry.heavyArmorMaster);
  }

  if (entry.feat === FEATS.INSPIRING_LEADER) {
    return getInspiringLeaderChoiceSummary(entry.inspiringLeader);
  }

  if (entry.feat === FEATS.KEEN_MIND) {
    return getKeenMindChoiceSummary(entry.keenMind);
  }

  if (entry.feat === FEATS.LIGHTLY_ARMORED) {
    return getLightlyArmoredChoiceSummary(entry.lightlyArmored);
  }

  if (entry.feat === FEATS.MAGE_SLAYER) {
    return getMageSlayerChoiceSummary(entry.mageSlayer);
  }

  if (entry.feat === FEATS.MARTIAL_WEAPON_TRAINING) {
    return getMartialWeaponTrainingChoiceSummary(entry.martialWeaponTraining);
  }

  if (entry.feat === FEATS.MEDIUM_ARMOR_MASTER) {
    return getMediumArmorMasterChoiceSummary(entry.mediumArmorMaster);
  }

  if (entry.feat === FEATS.MODERATELY_ARMORED) {
    return getModeratelyArmoredChoiceSummary(entry.moderatelyArmored);
  }

  if (entry.feat === FEATS.MOUNTED_COMBATANT) {
    return getMountedCombatantChoiceSummary(entry.mountedCombatant);
  }

  if (entry.feat === FEATS.OBSERVANT) {
    return getObservantChoiceSummary(entry.observant);
  }

  if (entry.feat === FEATS.PIERCER) {
    return getPiercerChoiceSummary(entry.piercer);
  }

  if (entry.feat === FEATS.POISONER) {
    return getPoisonerChoiceSummary(entry.poisoner);
  }

  if (entry.feat === FEATS.RESILIENT) {
    return getResilientChoiceSummary(entry.resilient);
  }

  if (entry.feat === FEATS.SPEEDY) {
    return getSpeedyChoiceSummary(entry.speedy);
  }

  if (entry.feat === FEATS.WEAPON_MASTER) {
    return getWeaponMasterChoiceSummary(entry.weaponMaster);
  }

  if (entry.epicBoonAbilityChoice) {
    return getEpicBoonAbilityChoiceSummary(entry.epicBoonAbilityChoice);
  }

  if (entry.feat === FEATS.SKILLED) {
    return getSkilledChoiceSummary(entry.skilled);
  }

  if (entry.feat === FEATS.MUSICIAN) {
    return getMusicianChoiceSummary(entry.musician);
  }

  return null;
}

export function getBlessedWarriorCantripOptions(): SpellEntry[] {
  return blessedWarriorCantripOptions;
}

export function getDruidicWarriorCantripOptions(): SpellEntry[] {
  return druidicWarriorCantripOptions;
}

export function getMagicInitiateCantripOptions(
  spellList: MagicInitiateChoice["spellList"]
): SpellEntry[] {
  return magicInitiateCantripOptionsBySpellList.get(spellList) ?? [];
}

export function getMagicInitiateLevelOneSpellOptions(
  spellList: MagicInitiateChoice["spellList"]
): SpellEntry[] {
  return magicInitiateLevelOneSpellOptionsBySpellList.get(spellList) ?? [];
}

export function getFeyTouchedSpellOptions(): SpellEntry[] {
  return feyTouchedSpellOptions;
}

export function getEpicBoonAbilityOptions(feat: FEATS): AbilityKey[] | null {
  const options = epicBoonAbilityIncreaseFeatOptions.get(feat);

  return options ? [...options] : null;
}
