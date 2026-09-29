import { FEATS } from "../../../codex/entries/enums";
import { singleAbilityChoices } from "./singleAbilityChoices";
import { DAMAGE_TYPE, SPELL_LIST_CLASS } from "../../../codex/entries/enums";
import { SKILL } from "../../../types";
import { abilityKeys } from "../constants";
import { getWeaponMasteryOptions } from "../classFeatures/weaponMastery";

export const magicInitiateSpellListOptions = [
  SPELL_LIST_CLASS.CLERIC,
  SPELL_LIST_CLASS.DRUID,
  SPELL_LIST_CLASS.WIZARD
] as const;

export const magicInitiateSpellcastingAbilityOptions = ["INT", "WIS", "CHA"] as const;
export const coldCasterAbilityOptions = magicInitiateSpellcastingAbilityOptions;
export const dragonscarredAbilityOptions = ["CON", "CHA"] as const;
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

export const dragonscarredDamageTypeOptions = [
  DAMAGE_TYPE.ACID,
  DAMAGE_TYPE.COLD,
  DAMAGE_TYPE.FIRE,
  DAMAGE_TYPE.LIGHTNING,
  DAMAGE_TYPE.POISON
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
export const heavilyArmoredAbilityOptions = singleAbilityChoices[FEATS.HEAVILY_ARMORED].abilities;
export const heavyArmorMasterAbilityOptions =
  singleAbilityChoices[FEATS.HEAVY_ARMOR_MASTER].abilities;
export const inspiringLeaderAbilityOptions = singleAbilityChoices[FEATS.INSPIRING_LEADER].abilities;

export const keenMindSkillOptions = [
  SKILL.ARCANA,
  SKILL.HISTORY,
  SKILL.INVESTIGATION,
  SKILL.NATURE,
  SKILL.RELIGION
] as const;

export const lightlyArmoredAbilityOptions = singleAbilityChoices[FEATS.LIGHTLY_ARMORED].abilities;
export const mageSlayerAbilityOptions = singleAbilityChoices[FEATS.MAGE_SLAYER].abilities;
export const martialWeaponTrainingAbilityOptions =
  singleAbilityChoices[FEATS.MARTIAL_WEAPON_TRAINING].abilities;
export const mediumArmorMasterAbilityOptions =
  singleAbilityChoices[FEATS.MEDIUM_ARMOR_MASTER].abilities;
export const moderatelyArmoredAbilityOptions =
  singleAbilityChoices[FEATS.MODERATELY_ARMORED].abilities;
export const mountedCombatantAbilityOptions =
  singleAbilityChoices[FEATS.MOUNTED_COMBATANT].abilities;
export const observantAbilityOptions = ["INT", "WIS"] as const;

export const observantSkillOptions = [
  SKILL.INSIGHT,
  SKILL.INVESTIGATION,
  SKILL.PERCEPTION
] as const;

export const piercerAbilityOptions = singleAbilityChoices[FEATS.PIERCER].abilities;
export const poisonerAbilityOptions = singleAbilityChoices[FEATS.POISONER].abilities;
export const polearmMasterAbilityOptions = singleAbilityChoices[FEATS.POLEARM_MASTER].abilities;
export const ritualCasterAbilityOptions = ["INT", "WIS", "CHA"] as const;
export const resilientAbilityOptions = abilityKeys;
export const sentinelAbilityOptions = singleAbilityChoices[FEATS.SENTINEL].abilities;
export const shadowTouchedAbilityOptions = ["INT", "WIS", "CHA"] as const;
export const slasherAbilityOptions = singleAbilityChoices[FEATS.SLASHER].abilities;
export const spellSniperAbilityOptions = singleAbilityChoices[FEATS.SPELL_SNIPER].abilities;
export const telekineticAbilityOptions = singleAbilityChoices[FEATS.TELEKINETIC].abilities;
export const telepathicAbilityOptions = singleAbilityChoices[FEATS.TELEPATHIC].abilities;
export const warCasterAbilityOptions = singleAbilityChoices[FEATS.WAR_CASTER].abilities;
export const skillExpertAbilityOptions = abilityKeys;
export const speedyAbilityOptions = singleAbilityChoices[FEATS.SPEEDY].abilities;
export const weaponMasterAbilityOptions = ["STR", "DEX"] as const;
export const weaponMasterMasteryOptions = getWeaponMasteryOptions();
