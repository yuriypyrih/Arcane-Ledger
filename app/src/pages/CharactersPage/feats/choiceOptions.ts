import { DAMAGE_TYPE, SPELL_LIST_CLASS } from "../../../codex/entries";
import { SKILL } from "../../../types";
import { abilityKeys } from "../constants";
import { getWeaponMasteryOptions } from "../classFeatures/weaponMastery";

export const magicInitiateSpellListOptions = [
  SPELL_LIST_CLASS.CLERIC,
  SPELL_LIST_CLASS.DRUID,
  SPELL_LIST_CLASS.WIZARD
] as const;

export const magicInitiateSpellcastingAbilityOptions = ["INT", "WIS", "CHA"] as const;
export const emeraldEnclaveFledglingSpellcastingAbilityOptions =
  magicInitiateSpellcastingAbilityOptions;
export const elementalAdeptAbilityOptions = ["INT", "WIS", "CHA"] as const;

export const elementalAdeptDamageTypeOptions = [
  DAMAGE_TYPE.ACID,
  DAMAGE_TYPE.COLD,
  DAMAGE_TYPE.FIRE,
  DAMAGE_TYPE.LIGHTNING,
  DAMAGE_TYPE.THUNDER
] as const;

export const boonOfEnergyResistanceDamageTypeOptions = [
  DAMAGE_TYPE.ACID,
  DAMAGE_TYPE.COLD,
  DAMAGE_TYPE.FIRE,
  DAMAGE_TYPE.LIGHTNING,
  DAMAGE_TYPE.NECROTIC,
  DAMAGE_TYPE.POISON,
  DAMAGE_TYPE.PSYCHIC,
  DAMAGE_TYPE.RADIANT,
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
export const polearmMasterAbilityOptions = ["DEX", "STR"] as const;
export const ritualCasterAbilityOptions = ["INT", "WIS", "CHA"] as const;
export const resilientAbilityOptions = abilityKeys;
export const sentinelAbilityOptions = ["STR", "DEX"] as const;
export const shadowTouchedAbilityOptions = ["INT", "WIS", "CHA"] as const;
export const slasherAbilityOptions = ["STR", "DEX"] as const;
export const spellSniperAbilityOptions = ["INT", "WIS", "CHA"] as const;
export const telekineticAbilityOptions = ["INT", "WIS", "CHA"] as const;
export const telepathicAbilityOptions = ["INT", "WIS", "CHA"] as const;
export const warCasterAbilityOptions = ["INT", "WIS", "CHA"] as const;
export const skillExpertAbilityOptions = abilityKeys;
export const speedyAbilityOptions = ["DEX", "CON"] as const;
export const weaponMasterAbilityOptions = ["STR", "DEX"] as const;
export const weaponMasterMasteryOptions = getWeaponMasteryOptions();
