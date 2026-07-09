import {
  DAMAGE_TYPE,
  DICE,
  ENTRY_CATEGORIES,
  WEAPON_COMBAT_TYPE,
  WEAPON_MASTERY,
  WEAPON_PROPERTY,
  WEAPON_TRAINING,
  getSpellEntryById,
  type SpellDescriptionEntry,
  type WeaponDamage
} from "../../../codex/entries";
import {
  hasActiveSylunesViperTemporaryHitPoints,
  isActiveSylunesViperStatusEntry,
  normalizeSylunesViperSourceSpellSlotLevel,
  sylunesViperStatusValue
} from "../characterRuntime/spellImplementations/sylunesViper";
import {
  psychicBladeWeaponName,
  psychicBladeWeaponSummary
} from "../../../codex/entries/featureWeapons";
import { getCodexEntryByName } from "../../../codex/selectors";
import { ECONOMY_TYPE } from "../actionEconomy";
import {
  bladeOfDisasterSpellId,
  flameBladeSpellId,
  shadowBladeSpellId,
  sylunesViperSpellId
} from "./spellIds";
import type {
  EphemeralWeaponActionContext,
  EphemeralWeaponCharacter,
  EphemeralWeaponDefinition
} from "./types";

export const psychicBladeWeaponEntry = (() => {
  const entry = getCodexEntryByName(psychicBladeWeaponName);
  return entry?.category === ENTRY_CATEGORIES.WEAPONS ? entry : null;
})();

const defaultPsychicBladeDamage = [[DICE.D6, DAMAGE_TYPE.PSYCHIC]] satisfies WeaponDamage;
export const psychicBladeBonusDamage = [[DICE.D4, DAMAGE_TYPE.PSYCHIC]] satisfies WeaponDamage;
const defaultPsychicBladeRange = { normal: 60, long: 120 };
const shadowBladeRange = { normal: 20, long: 60 };
const venomousBiteRange = { normal: 50, long: 50 };
const shadowBladeBaseSpellLevel = 2;
const flameBladeBaseSpellLevel = 2;

function createRepeatedDamageDice(
  diceCount: number,
  die: DICE,
  damageType: DAMAGE_TYPE
): WeaponDamage {
  return Array.from({ length: Math.max(0, Math.floor(diceCount)) }, () => [
    die,
    damageType
  ]);
}

function getSourceSpellSlotLevel(
  context: EphemeralWeaponActionContext,
  fallbackLevel: number
): number {
  const sourceValue = context.sourceSpellSlotLevel ?? context.sourceStatusEntry?.sourceSpellSlotLevel;
  const numericValue = Number(sourceValue);

  return Number.isFinite(numericValue) ? Math.max(fallbackLevel, Math.floor(numericValue)) : fallbackLevel;
}

function getSpellDescription(spellId: string): SpellDescriptionEntry[] {
  return getSpellEntryById(spellId)?.description ?? [];
}

const getShadowBladeDamage = (
  _character: EphemeralWeaponCharacter,
  context: EphemeralWeaponActionContext
): WeaponDamage => {
  const slotLevel = getSourceSpellSlotLevel(context, shadowBladeBaseSpellLevel);
  const diceCount = slotLevel >= 7 ? 5 : slotLevel >= 5 ? 4 : slotLevel >= 3 ? 3 : 2;

  return createRepeatedDamageDice(diceCount, DICE.D8, DAMAGE_TYPE.PSYCHIC);
};

const getFlameBladeDamage = (
  _character: EphemeralWeaponCharacter,
  context: EphemeralWeaponActionContext
): WeaponDamage => {
  const slotLevel = getSourceSpellSlotLevel(context, flameBladeBaseSpellLevel);
  const diceCount = 3 + Math.max(0, slotLevel - flameBladeBaseSpellLevel);

  return createRepeatedDamageDice(diceCount, DICE.D6, DAMAGE_TYPE.FIRE);
};

const getBladeOfDisasterDamage = (): WeaponDamage =>
  createRepeatedDamageDice(10, DICE.D6, DAMAGE_TYPE.FORCE);

const getVenomousBiteDamage = (
  _character: EphemeralWeaponCharacter,
  context: EphemeralWeaponActionContext
): WeaponDamage => {
  const slotLevel = normalizeSylunesViperSourceSpellSlotLevel(
    context.sourceSpellSlotLevel ?? context.sourceStatusEntry?.sourceSpellSlotLevel
  );
  const diceCount = 1 + Math.max(0, slotLevel - 3);

  return createRepeatedDamageDice(diceCount, DICE.D6, DAMAGE_TYPE.FORCE);
};

export const psychicBladeEphemeralWeaponDefinition: EphemeralWeaponDefinition = {
  id: "rogue-soulknife-psychic-blade",
  key: "rogue-soulknife-psychic-blade",
  name: psychicBladeWeaponEntry?.name ?? psychicBladeWeaponName,
  sourceLabel: "Psychic Blades",
  activation: {
    kind: "feature",
    sourceId: "rogue-soulknife-psychic-blades"
  },
  attackKind: "weapon",
  combatType: psychicBladeWeaponEntry?.type.combat ?? WEAPON_COMBAT_TYPE.MELEE,
  weaponTraining: psychicBladeWeaponEntry?.type.training ?? WEAPON_TRAINING.SIMPLE,
  properties: psychicBladeWeaponEntry?.properties ?? [
    WEAPON_PROPERTY.FINESSE,
    WEAPON_PROPERTY.THROWN,
    WEAPON_PROPERTY.RANGE
  ],
  range: psychicBladeWeaponEntry?.range ?? defaultPsychicBladeRange,
  mastery: psychicBladeWeaponEntry?.mastery ?? WEAPON_MASTERY.VEX,
  damage: psychicBladeWeaponEntry?.damage ?? defaultPsychicBladeDamage,
  ability: "finesse",
  proficiencyLabel: "Simple weapon",
  isProficient: true,
  economyType: ECONOMY_TYPE.ACTION,
  hasActiveMastery: true,
  skipFeatureDerivedLookups: true
};

export const shadowBladeEphemeralWeaponDefinition: EphemeralWeaponDefinition = {
  id: shadowBladeSpellId,
  key: "spell-shadow-blade-weapon",
  name: "Shadow Blade",
  sourceLabel: "Shadow Blade",
  activation: {
    kind: "spell-status",
    spellId: shadowBladeSpellId
  },
  attackKind: "weapon",
  combatType: WEAPON_COMBAT_TYPE.MELEE,
  weaponTraining: WEAPON_TRAINING.SIMPLE,
  properties: [
    WEAPON_PROPERTY.FINESSE,
    WEAPON_PROPERTY.LIGHT,
    WEAPON_PROPERTY.THROWN,
    WEAPON_PROPERTY.RANGE
  ],
  range: shadowBladeRange,
  mastery: null,
  getDamage: getShadowBladeDamage,
  ability: "finesse",
  proficiencyLabel: "Simple weapon",
  isProficient: true,
  economyType: ECONOMY_TYPE.ACTION,
  getDescription: () => getSpellDescription(shadowBladeSpellId)
};

export const flameBladeEphemeralWeaponDefinition: EphemeralWeaponDefinition = {
  id: flameBladeSpellId,
  key: "spell-flame-blade-weapon",
  name: "Flame Blade",
  sourceLabel: "Flame Blade",
  activation: {
    kind: "spell-status",
    spellId: flameBladeSpellId
  },
  attackKind: "weapon",
  combatType: null,
  weaponTraining: null,
  properties: [],
  mastery: null,
  getDamage: getFlameBladeDamage,
  ability: "spellcasting",
  damageAbility: "attack",
  proficiencyLabel: "Spell attack",
  isProficient: true,
  economyType: ECONOMY_TYPE.ACTION,
  getDescription: () => getSpellDescription(flameBladeSpellId),
  skipFeatureDerivedLookups: true
};

export const bladeOfDisasterEphemeralWeaponDefinition: EphemeralWeaponDefinition = {
  id: bladeOfDisasterSpellId,
  key: "spell-blade-of-disaster-weapon",
  name: "Blade of Disaster",
  sourceLabel: "Blade of Disaster",
  activation: {
    kind: "spell-status",
    spellId: bladeOfDisasterSpellId
  },
  attackKind: "weapon",
  combatType: null,
  weaponTraining: null,
  properties: [],
  mastery: null,
  getDamage: getBladeOfDisasterDamage,
  ability: "spellcasting",
  damageAbility: "none",
  proficiencyLabel: "Spell attack",
  isProficient: true,
  economyType: ECONOMY_TYPE.BONUS_ACTION,
  economyMultiCount: 1,
  getDescription: () => getSpellDescription(bladeOfDisasterSpellId),
  skipFeatureDerivedLookups: true
};

export const venomousBiteEphemeralWeaponDefinition: EphemeralWeaponDefinition = {
  id: `${sylunesViperSpellId}-venomous-bite`,
  key: "spell-sylunes-viper-venomous-bite",
  name: "Venomous Bite",
  sourceLabel: sylunesViperStatusValue,
  activation: {
    kind: "spell-status",
    spellId: sylunesViperSpellId
  },
  attackKind: "weapon",
  combatType: WEAPON_COMBAT_TYPE.RANGED,
  weaponTraining: null,
  properties: [WEAPON_PROPERTY.RANGE],
  range: venomousBiteRange,
  mastery: null,
  getDamage: getVenomousBiteDamage,
  ability: "spellcasting",
  damageAbility: "none",
  proficiencyLabel: "Ranged spell attack",
  isProficient: true,
  economyType: ECONOMY_TYPE.ACTION,
  getDescription: () => getSpellDescription(sylunesViperSpellId),
  isAvailable: (character, context) =>
    isActiveSylunesViperStatusEntry(context.sourceStatusEntry) &&
    hasActiveSylunesViperTemporaryHitPoints(character),
  skipFeatureDerivedLookups: true
};

export const spellEphemeralWeaponDefinitions = [
  shadowBladeEphemeralWeaponDefinition,
  flameBladeEphemeralWeaponDefinition,
  bladeOfDisasterEphemeralWeaponDefinition,
  venomousBiteEphemeralWeaponDefinition
];

export const psychicBladeEquipmentSummary = psychicBladeWeaponSummary;
