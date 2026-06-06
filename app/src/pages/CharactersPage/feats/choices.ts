import { getSpellEntriesForSpellListClass } from "../../../codex/classes/spellAccess";
import {
  DAMAGE_TYPE,
  FEATS,
  MAGIC_SCHOOL,
  SPELL_LIST_CLASS,
  getSpellEntries,
  type SpellEntry
} from "../../../codex/entries";
import {
  ALL_SKILLS,
  LANGUAGE_PROFICIENCY,
  TOOL_PROFICIENCY,
  type WEAPON_PROFICIENCY
} from "../../../types";
import type {
  AbilityKey,
  BlessedWarriorChoice,
  CharacterFeatEntry,
  CrusherChoice,
  CultOfDragonInitiateChoice,
  DualWielderChoice,
  ElementalAdeptChoice,
  EmeraldEnclaveFledglingChoice,
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
  PolearmMasterChoice,
  RitualCasterChoice,
  ResilientChoice,
  SentinelChoice,
  ShadowTouchedChoice,
  SlasherChoice,
  SpellSniperChoice,
  TelekineticChoice,
  TelepathicChoice,
  WarCasterChoice,
  SkillExpertChoice,
  SpeedyChoice,
  WeaponMasterChoice,
  LuckyChoice,
  MagicInitiateChoice,
  MusicianChoice,
  SkillName
} from "../../../types";
import type {
  AbilityScoreImprovementChoice,
  BoonOfEnergyResistanceChoice,
  BoonOfSkillChoice,
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
import { getCrafterChoiceSummary } from "./crafter";
import {
  getCultOfDragonInitiateLanguageLabel,
  isCultOfDragonInitiateLanguage
} from "./cultOfDragonInitiate";
import {
  boonOfEnergyResistanceDamageTypeOptions,
  emeraldEnclaveFledglingSpellcastingAbilityOptions,
  elementalAdeptAbilityOptions,
  elementalAdeptDamageTypeOptions,
  feyTouchedAbilityOptions,
  heavilyArmoredAbilityOptions,
  heavyArmorMasterAbilityOptions,
  inspiringLeaderAbilityOptions,
  keenMindSkillOptions,
  lightlyArmoredAbilityOptions,
  mageSlayerAbilityOptions,
  magicInitiateSpellcastingAbilityOptions,
  magicInitiateSpellListOptions,
  martialWeaponTrainingAbilityOptions,
  mediumArmorMasterAbilityOptions,
  moderatelyArmoredAbilityOptions,
  mountedCombatantAbilityOptions,
  observantAbilityOptions,
  observantSkillOptions,
  piercerAbilityOptions,
  poisonerAbilityOptions,
  polearmMasterAbilityOptions,
  resilientAbilityOptions,
  ritualCasterAbilityOptions,
  sentinelAbilityOptions,
  shadowTouchedAbilityOptions,
  skillExpertAbilityOptions,
  slasherAbilityOptions,
  speedyAbilityOptions,
  spellSniperAbilityOptions,
  telekineticAbilityOptions,
  telepathicAbilityOptions,
  warCasterAbilityOptions,
  weaponMasterAbilityOptions,
  weaponMasterMasteryOptions
} from "./choiceOptions";

const abilityKeySet = new Set<AbilityKey>(abilityKeys);
const skillNameSet = new Set<SkillName>(ALL_SKILLS);

function normalizeFeatSpellId(value: string): string {
  return value.trim();
}
const allEpicBoonAbilityOptions: AbilityKey[] = [...abilityKeys];
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
const magicInitiateSpellListOptionSet = new Set<SPELL_LIST_CLASS>(magicInitiateSpellListOptions);
const magicInitiateSpellcastingAbilityOptionSet = new Set<AbilityKey>(
  magicInitiateSpellcastingAbilityOptions
);
const emeraldEnclaveFledglingSpellcastingAbilityOptionSet = new Set<AbilityKey>(
  emeraldEnclaveFledglingSpellcastingAbilityOptions
);
const elementalAdeptAbilityOptionSet = new Set<AbilityKey>(elementalAdeptAbilityOptions);
const elementalAdeptDamageTypeOptionSet = new Set<DAMAGE_TYPE>(elementalAdeptDamageTypeOptions);
const boonOfEnergyResistanceDamageTypeOptionSet = new Set<DAMAGE_TYPE>(
  boonOfEnergyResistanceDamageTypeOptions
);
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
const polearmMasterAbilityOptionSet = new Set<AbilityKey>(polearmMasterAbilityOptions);
const ritualCasterAbilityOptionSet = new Set<AbilityKey>(ritualCasterAbilityOptions);
const resilientAbilityOptionSet = new Set<AbilityKey>(resilientAbilityOptions);
const sentinelAbilityOptionSet = new Set<AbilityKey>(sentinelAbilityOptions);
const shadowTouchedAbilityOptionSet = new Set<AbilityKey>(shadowTouchedAbilityOptions);
const slasherAbilityOptionSet = new Set<AbilityKey>(slasherAbilityOptions);
const spellSniperAbilityOptionSet = new Set<AbilityKey>(spellSniperAbilityOptions);
const telekineticAbilityOptionSet = new Set<AbilityKey>(telekineticAbilityOptions);
const telepathicAbilityOptionSet = new Set<AbilityKey>(telepathicAbilityOptions);
const warCasterAbilityOptionSet = new Set<AbilityKey>(warCasterAbilityOptions);
const skillExpertAbilityOptionSet = new Set<AbilityKey>(skillExpertAbilityOptions);
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
const ritualCasterSpellOptions = getSpellEntries()
  .filter((spell) => spell.spellLevel === 1 && spell.ritual === true)
  .sort((left, right) => left.name.localeCompare(right.name));
const ritualCasterSpellOptionsById = new Map(
  ritualCasterSpellOptions.map((spell) => [spell.id, spell] as const)
);
const shadowTouchedSpellSchoolOptions = new Set<MAGIC_SCHOOL>([
  MAGIC_SCHOOL.ILLUSION,
  MAGIC_SCHOOL.NECROMANCY
]);
const shadowTouchedFreeCastSpellIds = new Set(["spell-invisibility"]);
const shadowTouchedSpellOptions = getSpellEntries()
  .filter(
    (spell) => spell.spellLevel === 1 && shadowTouchedSpellSchoolOptions.has(spell.magicSchool)
  )
  .sort((left, right) => left.name.localeCompare(right.name));
const shadowTouchedSpellOptionsById = new Map(
  shadowTouchedSpellOptions.map((spell) => [spell.id, spell] as const)
);
type FeatAbilityIncreaseConfig = {
  abilityOptions: AbilityKey[];
  maxScore: number;
};

const spellcastingAbilityOptions: AbilityKey[] = ["INT", "WIS", "CHA"];

export const featAbilityIncreaseConfigs = new Map<FEATS, FeatAbilityIncreaseConfig>([
  [FEATS.COLD_CASTER, { abilityOptions: spellcastingAbilityOptions, maxScore: 20 }],
  [FEATS.DRAGONSCARRED, { abilityOptions: ["CON", "CHA"], maxScore: 20 }],
  [FEATS.ENCLAVE_MAGIC, { abilityOptions: spellcastingAbilityOptions, maxScore: 20 }],
  [FEATS.FAIRY_TRICKSTER, { abilityOptions: ["DEX", "CHA"], maxScore: 20 }],
  [FEATS.GENIE_MAGIC, { abilityOptions: spellcastingAbilityOptions, maxScore: 20 }],
  [FEATS.HARPER_TEAMWORK, { abilityOptions: ["DEX", "CHA"], maxScore: 20 }],
  [FEATS.LORDLY_RESOLVE, { abilityOptions: ["STR", "CHA"], maxScore: 20 }],
  [FEATS.MYTHAL_TOUCHED, { abilityOptions: spellcastingAbilityOptions, maxScore: 20 }],
  [FEATS.ORDERS_RESILIENCE, { abilityOptions: ["STR", "WIS", "CHA"], maxScore: 20 }],
  [FEATS.PURPLE_DRAGON_COMMANDANT, { abilityOptions: ["STR", "DEX"], maxScore: 20 }],
  [FEATS.SPELLFIRE_ADEPT, { abilityOptions: spellcastingAbilityOptions, maxScore: 20 }],
  [FEATS.STREET_JUSTICE, { abilityOptions: ["STR", "DEX"], maxScore: 20 }],
  [FEATS.ZHENTARIM_TACTICS, { abilityOptions: ["DEX", "CHA"], maxScore: 20 }],
  [FEATS.BOON_OF_BLOODSHED, { abilityOptions: allEpicBoonAbilityOptions, maxScore: 30 }],
  [FEATS.BOON_OF_BOUNTIFUL_HEALTH, { abilityOptions: allEpicBoonAbilityOptions, maxScore: 30 }],
  [FEATS.BOON_OF_BRIGHT_SUN, { abilityOptions: ["CON", "WIS", "CHA"], maxScore: 30 }],
  [FEATS.BOON_OF_COMMUNICATION, { abilityOptions: spellcastingAbilityOptions, maxScore: 30 }],
  [FEATS.BOON_OF_COMBAT_PROWESS, { abilityOptions: allEpicBoonAbilityOptions, maxScore: 30 }],
  [FEATS.BOON_OF_DESPERATE_RESILIENCE, { abilityOptions: ["STR", "CON"], maxScore: 30 }],
  [FEATS.BOON_OF_DIMENSIONAL_TRAVEL, { abilityOptions: allEpicBoonAbilityOptions, maxScore: 30 }],
  [FEATS.BOON_OF_ENERGY_RESISTANCE, { abilityOptions: allEpicBoonAbilityOptions, maxScore: 30 }],
  [FEATS.BOON_OF_EXQUISITE_RADIANCE, { abilityOptions: allEpicBoonAbilityOptions, maxScore: 30 }],
  [FEATS.BOON_OF_FATE, { abilityOptions: allEpicBoonAbilityOptions, maxScore: 30 }],
  [FEATS.BOON_OF_FLUID_FORMS, { abilityOptions: spellcastingAbilityOptions, maxScore: 30 }],
  [FEATS.BOON_OF_FORTITUDE, { abilityOptions: allEpicBoonAbilityOptions, maxScore: 30 }],
  [FEATS.BOON_OF_FORTUNES_FAVOR, { abilityOptions: allEpicBoonAbilityOptions, maxScore: 30 }],
  [FEATS.BOON_OF_FURIOUS_STORM, { abilityOptions: spellcastingAbilityOptions, maxScore: 30 }],
  [FEATS.BOON_OF_IRRESISTIBLE_OFFENSE, { abilityOptions: allEpicBoonAbilityOptions, maxScore: 30 }],
  [FEATS.BOON_OF_POISON_MASTERY, { abilityOptions: allEpicBoonAbilityOptions, maxScore: 30 }],
  [FEATS.BOON_OF_RECOVERY, { abilityOptions: allEpicBoonAbilityOptions, maxScore: 30 }],
  [FEATS.BOON_OF_REVELRY, { abilityOptions: spellcastingAbilityOptions, maxScore: 30 }],
  [FEATS.BOON_OF_SKILL, { abilityOptions: allEpicBoonAbilityOptions, maxScore: 30 }],
  [FEATS.BOON_OF_SOUL_DRINKER, { abilityOptions: allEpicBoonAbilityOptions, maxScore: 30 }],
  [FEATS.BOON_OF_SPEED, { abilityOptions: allEpicBoonAbilityOptions, maxScore: 30 }],
  [FEATS.BOON_OF_TERROR, { abilityOptions: ["CHA"], maxScore: 30 }],
  [FEATS.BOON_OF_THE_NIGHT_SPIRIT, { abilityOptions: allEpicBoonAbilityOptions, maxScore: 30 }],
  [FEATS.BOON_OF_SPELL_RECALL, { abilityOptions: spellcastingAbilityOptions, maxScore: 30 }],
  [FEATS.BOON_OF_TRUESIGHT, { abilityOptions: allEpicBoonAbilityOptions, maxScore: 30 }]
]);

export const epicBoonAbilityIncreaseFeatOptions = new Map<FEATS, AbilityKey[]>([
  ...featAbilityIncreaseConfigs.entries()
].map(([feat, config]) => [feat, config.abilityOptions]));

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
  const spellId =
    typeof record.spellId === "string" ? normalizeFeatSpellId(record.spellId) : "";

  if (
    typeof record.ability !== "string" ||
    !feyTouchedAbilityOptionSet.has(record.ability as AbilityKey) ||
    !feyTouchedSpellOptionsById.has(spellId)
  ) {
    return undefined;
  }

  const freeCastExpendedSpellIds = Array.isArray(record.freeCastExpendedSpellIds)
    ? [
        ...new Set(
          record.freeCastExpendedSpellIds
            .filter((freeCastSpellId): freeCastSpellId is string => typeof freeCastSpellId === "string")
            .map(normalizeFeatSpellId)
            .filter(
              (freeCastSpellId) =>
                freeCastSpellId === spellId || feyTouchedFreeCastSpellIds.has(freeCastSpellId)
            )
        )
      ]
    : [];

  return {
    ability: record.ability as FeyTouchedChoice["ability"],
    spellId,
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

export function normalizePolearmMasterChoice(value: unknown): PolearmMasterChoice | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<PolearmMasterChoice>;

  if (
    typeof record.ability === "string" &&
    polearmMasterAbilityOptionSet.has(record.ability as AbilityKey)
  ) {
    return {
      ability: record.ability as PolearmMasterChoice["ability"]
    };
  }

  return undefined;
}

export function normalizeRitualCasterChoice(value: unknown): RitualCasterChoice | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<RitualCasterChoice>;

  if (
    typeof record.ability !== "string" ||
    !ritualCasterAbilityOptionSet.has(record.ability as AbilityKey) ||
    !Array.isArray(record.spellIds)
  ) {
    return undefined;
  }

  const spellIds = [
    ...new Set(
      record.spellIds
        .filter((id): id is string => typeof id === "string")
        .map(normalizeFeatSpellId)
    )
  ].filter((spellId) => ritualCasterSpellOptionsById.has(spellId));

  if (spellIds.length === 0) {
    return undefined;
  }

  return {
    ability: record.ability as RitualCasterChoice["ability"],
    spellIds,
    quickRitualExpended: record.quickRitualExpended === true ? true : undefined
  };
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

export function normalizeSentinelChoice(value: unknown): SentinelChoice | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<SentinelChoice>;

  if (
    typeof record.ability === "string" &&
    sentinelAbilityOptionSet.has(record.ability as AbilityKey)
  ) {
    return {
      ability: record.ability as SentinelChoice["ability"]
    };
  }

  return undefined;
}

export function normalizeShadowTouchedChoice(value: unknown): ShadowTouchedChoice | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<ShadowTouchedChoice>;
  const spellId =
    typeof record.spellId === "string" ? normalizeFeatSpellId(record.spellId) : "";

  if (
    typeof record.ability !== "string" ||
    !shadowTouchedAbilityOptionSet.has(record.ability as AbilityKey) ||
    !shadowTouchedSpellOptionsById.has(spellId)
  ) {
    return undefined;
  }

  const freeCastExpendedSpellIds = Array.isArray(record.freeCastExpendedSpellIds)
    ? [
        ...new Set(
          record.freeCastExpendedSpellIds
            .filter((freeCastSpellId): freeCastSpellId is string => typeof freeCastSpellId === "string")
            .map(normalizeFeatSpellId)
            .filter(
              (freeCastSpellId) =>
                freeCastSpellId === spellId || shadowTouchedFreeCastSpellIds.has(freeCastSpellId)
            )
        )
      ]
    : [];

  return {
    ability: record.ability as ShadowTouchedChoice["ability"],
    spellId,
    freeCastExpendedSpellIds:
      freeCastExpendedSpellIds.length > 0 ? freeCastExpendedSpellIds : undefined
  };
}

export function normalizeSlasherChoice(value: unknown): SlasherChoice | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<SlasherChoice>;

  if (
    typeof record.ability === "string" &&
    slasherAbilityOptionSet.has(record.ability as AbilityKey)
  ) {
    return {
      ability: record.ability as SlasherChoice["ability"]
    };
  }

  return undefined;
}

export function normalizeSpellSniperChoice(value: unknown): SpellSniperChoice | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<SpellSniperChoice>;

  if (
    typeof record.ability === "string" &&
    spellSniperAbilityOptionSet.has(record.ability as AbilityKey)
  ) {
    return {
      ability: record.ability as SpellSniperChoice["ability"]
    };
  }

  return undefined;
}

export function normalizeTelekineticChoice(value: unknown): TelekineticChoice | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<TelekineticChoice>;

  if (
    typeof record.ability === "string" &&
    telekineticAbilityOptionSet.has(record.ability as AbilityKey)
  ) {
    return {
      ability: record.ability as TelekineticChoice["ability"]
    };
  }

  return undefined;
}

export function normalizeTelepathicChoice(value: unknown): TelepathicChoice | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<TelepathicChoice>;

  if (
    typeof record.ability === "string" &&
    telepathicAbilityOptionSet.has(record.ability as AbilityKey)
  ) {
    return {
      ability: record.ability as TelepathicChoice["ability"],
      detectThoughtsExpended: record.detectThoughtsExpended === true ? true : undefined
    };
  }

  return undefined;
}

export function normalizeWarCasterChoice(value: unknown): WarCasterChoice | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<WarCasterChoice>;

  if (
    typeof record.ability === "string" &&
    warCasterAbilityOptionSet.has(record.ability as AbilityKey)
  ) {
    return {
      ability: record.ability as WarCasterChoice["ability"]
    };
  }

  return undefined;
}

export function normalizeSkillExpertChoice(value: unknown): SkillExpertChoice | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<SkillExpertChoice>;

  if (
    typeof record.ability === "string" &&
    skillExpertAbilityOptionSet.has(record.ability as AbilityKey) &&
    typeof record.skillProficiency === "string" &&
    skillNameSet.has(record.skillProficiency as SkillName) &&
    typeof record.skillExpertise === "string" &&
    skillNameSet.has(record.skillExpertise as SkillName)
  ) {
    return {
      ability: record.ability as SkillExpertChoice["ability"],
      skillProficiency: record.skillProficiency as SkillExpertChoice["skillProficiency"],
      skillExpertise: record.skillExpertise as SkillExpertChoice["skillExpertise"]
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

export function normalizeBoonOfEnergyResistanceChoice(
  value: unknown
): BoonOfEnergyResistanceChoice | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<BoonOfEnergyResistanceChoice>;

  if (typeof record.ability !== "string" || !isAbilityKey(record.ability)) {
    return undefined;
  }

  if (!Array.isArray(record.damageTypes) || record.damageTypes.length !== 2) {
    return undefined;
  }

  const damageTypes = record.damageTypes;

  if (
    damageTypes[0] === damageTypes[1] ||
    !boonOfEnergyResistanceDamageTypeOptionSet.has(damageTypes[0]) ||
    !boonOfEnergyResistanceDamageTypeOptionSet.has(damageTypes[1])
  ) {
    return undefined;
  }

  return {
    ability: record.ability,
    damageTypes: [damageTypes[0], damageTypes[1]]
  };
}

export function normalizeBoonOfSkillChoice(value: unknown): BoonOfSkillChoice | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<BoonOfSkillChoice>;

  if (
    typeof record.ability === "string" &&
    isAbilityKey(record.ability) &&
    typeof record.skillExpertise === "string" &&
    skillNameSet.has(record.skillExpertise)
  ) {
    return {
      ability: record.ability,
      skillExpertise: record.skillExpertise
    };
  }

  return undefined;
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
    ...new Set(
      record.cantripIds
        .filter((id): id is string => typeof id === "string")
        .map(normalizeFeatSpellId)
    )
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
    ...new Set(
      record.cantripIds
        .filter((id): id is string => typeof id === "string")
        .map(normalizeFeatSpellId)
    )
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
    ...new Set(
      record.cantripIds
        .filter((id): id is string => typeof id === "string")
        .map(normalizeFeatSpellId)
    )
  ];
  const levelOneSpellId =
    typeof record.levelOneSpellId === "string"
      ? normalizeFeatSpellId(record.levelOneSpellId)
      : "";

  if (
    cantripIds.length !== 2 ||
    !cantripOptionsById ||
    !cantripIds.every((id) => cantripOptionsById.has(id))
  ) {
    return undefined;
  }

  if (
    !levelOneSpellId ||
    !levelOneSpellOptionsById?.has(levelOneSpellId)
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
    levelOneSpellId,
    spellcastingAbility: record.spellcastingAbility as MagicInitiateChoice["spellcastingAbility"],
    freeCastExpended: record.freeCastExpended === true ? true : undefined
  };
}

export function normalizeCultOfDragonInitiateChoice(
  value: unknown
): CultOfDragonInitiateChoice | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<CultOfDragonInitiateChoice>;

  if (!isCultOfDragonInitiateLanguage(record.language)) {
    return undefined;
  }

  return {
    language: record.language as LANGUAGE_PROFICIENCY,
    inspiredByFearExpended: record.inspiredByFearExpended === true ? true : undefined
  };
}

export function normalizeEmeraldEnclaveFledglingChoice(
  value: unknown
): EmeraldEnclaveFledglingChoice | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<EmeraldEnclaveFledglingChoice>;

  if (
    typeof record.spellcastingAbility !== "string" ||
    !emeraldEnclaveFledglingSpellcastingAbilityOptionSet.has(
      record.spellcastingAbility as AbilityKey
    )
  ) {
    return undefined;
  }

  return {
    spellcastingAbility:
      record.spellcastingAbility as EmeraldEnclaveFledglingChoice["spellcastingAbility"]
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

export function getFeatProficiencyBonusForLevel(level: number): number {
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

export function getBoonOfEnergyResistanceChoiceSummary(
  choice?: BoonOfEnergyResistanceChoice
): string | null {
  return choice
    ? `${choice.ability} +1, ${choice.damageTypes.map((damageType) => formatCodexLabel(damageType)).join(", ")}`
    : null;
}

export function getBoonOfSkillChoiceSummary(choice?: BoonOfSkillChoice): string | null {
  return choice ? `${choice.ability} +1, Expertise: ${choice.skillExpertise}` : null;
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

export function getPolearmMasterChoiceSummary(choice?: PolearmMasterChoice): string | null {
  return choice ? `${choice.ability} +1, Pole Strike` : null;
}

export function getRitualCasterChoiceSummary(choice?: RitualCasterChoice): string | null {
  if (!choice) {
    return null;
  }

  const spellNames = choice.spellIds
    .map((spellId) => ritualCasterSpellOptionsById.get(spellId)?.name)
    .filter((name): name is string => Boolean(name));

  return spellNames.length > 0
    ? `${choice.ability} +1, ${spellNames.join(", ")}`
    : `${choice.ability} +1`;
}

export function getResilientChoiceSummary(choice?: ResilientChoice): string | null {
  return choice ? `${choice.ability} +1, ${choice.ability} Saving Throw` : null;
}

export function getSentinelChoiceSummary(choice?: SentinelChoice): string | null {
  return choice ? `${choice.ability} +1, Guardian, Halt` : null;
}

export function getShadowTouchedChoiceSummary(choice?: ShadowTouchedChoice): string | null {
  if (!choice) {
    return null;
  }

  const spellName = shadowTouchedSpellOptionsById.get(choice.spellId)?.name;

  return spellName ? `${choice.ability} +1, ${spellName}` : `${choice.ability} +1`;
}

export function getSlasherChoiceSummary(choice?: SlasherChoice): string | null {
  return choice ? `${choice.ability} +1, Slashing damage` : null;
}

export function getSpellSniperChoiceSummary(choice?: SpellSniperChoice): string | null {
  return choice ? `${choice.ability} +1, Spell attacks` : null;
}

export function getTelekineticChoiceSummary(choice?: TelekineticChoice): string | null {
  return choice ? `${choice.ability} +1, Mage Hand, Telekinetic Shove` : null;
}

export function getTelepathicChoiceSummary(choice?: TelepathicChoice): string | null {
  return choice ? `${choice.ability} +1, Telepathic, Detect Thoughts` : null;
}

export function getWarCasterChoiceSummary(choice?: WarCasterChoice): string | null {
  return choice ? `${choice.ability} +1, Reactive Spell` : null;
}

export function getSkillExpertChoiceSummary(choice?: SkillExpertChoice): string | null {
  return choice
    ? `${choice.ability} +1, ${choice.skillProficiency}, Expertise: ${choice.skillExpertise}`
    : null;
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

export function getCultOfDragonInitiateChoiceSummary(
  choice?: CultOfDragonInitiateChoice
): string | null {
  return choice ? `Language: ${getCultOfDragonInitiateLanguageLabel(choice.language)}` : null;
}

export function getEmeraldEnclaveFledglingChoiceSummary(
  choice?: EmeraldEnclaveFledglingChoice
): string | null {
  return choice ? `Spellcasting Ability: ${choice.spellcastingAbility}` : null;
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

  if (entry.feat === FEATS.CULT_OF_THE_DRAGON_INITIATE) {
    return getCultOfDragonInitiateChoiceSummary(entry.cultOfDragonInitiate);
  }

  if (entry.feat === FEATS.EMERALD_ENCLAVE_FLEDGLING) {
    return getEmeraldEnclaveFledglingChoiceSummary(entry.emeraldEnclaveFledgling);
  }

  if (entry.feat === FEATS.CRAFTER) {
    return getCrafterChoiceSummary(entry.crafter);
  }

  if (entry.feat === FEATS.BOON_OF_ENERGY_RESISTANCE) {
    return getBoonOfEnergyResistanceChoiceSummary(entry.boonOfEnergyResistance);
  }

  if (entry.feat === FEATS.BOON_OF_SKILL) {
    return getBoonOfSkillChoiceSummary(entry.boonOfSkill);
  }

  if (entry.feat === FEATS.BOON_OF_IRRESISTIBLE_OFFENSE) {
    if (entry.boonOfIrresistibleOffense) {
      return `${entry.boonOfIrresistibleOffense.ability} +1`;
    }
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

  if (entry.feat === FEATS.POLEARM_MASTER) {
    return getPolearmMasterChoiceSummary(entry.polearmMaster);
  }

  if (entry.feat === FEATS.RITUAL_CASTER) {
    return getRitualCasterChoiceSummary(entry.ritualCaster);
  }

  if (entry.feat === FEATS.RESILIENT) {
    return getResilientChoiceSummary(entry.resilient);
  }

  if (entry.feat === FEATS.SENTINEL) {
    return getSentinelChoiceSummary(entry.sentinel);
  }

  if (entry.feat === FEATS.SHADOW_TOUCHED) {
    return getShadowTouchedChoiceSummary(entry.shadowTouched);
  }

  if (entry.feat === FEATS.SLASHER) {
    return getSlasherChoiceSummary(entry.slasher);
  }

  if (entry.feat === FEATS.SPELL_SNIPER) {
    return getSpellSniperChoiceSummary(entry.spellSniper);
  }

  if (entry.feat === FEATS.TELEKINETIC) {
    return getTelekineticChoiceSummary(entry.telekinetic);
  }

  if (entry.feat === FEATS.TELEPATHIC) {
    return getTelepathicChoiceSummary(entry.telepathic);
  }

  if (entry.feat === FEATS.WAR_CASTER) {
    return getWarCasterChoiceSummary(entry.warCaster);
  }

  if (entry.feat === FEATS.SKILL_EXPERT) {
    return getSkillExpertChoiceSummary(entry.skillExpert);
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

export function getRitualCasterSpellOptions(): SpellEntry[] {
  return ritualCasterSpellOptions;
}

export function getShadowTouchedSpellOptions(): SpellEntry[] {
  return shadowTouchedSpellOptions;
}

export function getEpicBoonAbilityOptions(feat: FEATS): AbilityKey[] | null {
  const options = epicBoonAbilityIncreaseFeatOptions.get(feat);

  return options ? [...options] : null;
}

export function getFeatAbilityIncreaseMaxScore(feat: FEATS): number | null {
  return featAbilityIncreaseConfigs.get(feat)?.maxScore ?? null;
}
