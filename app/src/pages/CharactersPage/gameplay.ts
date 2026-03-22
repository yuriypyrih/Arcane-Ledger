import {
  ENTRY_CATEGORIES,
  WEAPON_COMBAT_TYPE,
  WEAPON_PROPERTY,
  WEAPON_TRAINING,
  hardcodedCodexEntries,
  type ClassEntry,
  type CodexEntry,
  type SpeciesEntry,
  type WeaponEntry
} from "../../codex/entries";
import type { AbilityKey, AbilityScores, Character, SkillName } from "../../types";
import { PROF_LEVEL } from "../../types";
import { formatWeaponDamage, formatWeaponDamageFormula } from "../../utils/codex";
import {
  getFeatureDamageBonusesForWeaponAction,
  type FeatureDamageBonus
} from "./classFeatures";
import {
  createHeldShieldDescriptor,
  createHeldWeaponDescriptor,
  getHeldWeaponSlotCount,
  hasVersatileHandBonus,
  type HeldWeaponDescriptor
} from "./inventory";
import {
  getEquipmentByName,
  getSkillLevelFromEntries,
  getSkillProficiencyForName,
  getWeaponLevelFromEntries,
  getWeaponProficiencyForTraining
} from "./proficiency";
import {
  getResolvedCustomLoadoutEntries,
  type ResolvedCustomWeaponEntry
} from "./customEquipment";

type WeaponAbilityRule = "strength" | "dexterity" | "finesse";

type WeaponReference = {
  damageLabel: string;
  damageFormula: string;
  abilityRule: WeaponAbilityRule;
  hasVersatileBonus: boolean;
};

export type WeaponAction = {
  key: string;
  name: string;
  attackKind: "weapon" | "unarmed";
  damageLabel: string;
  damageFormula: string;
  rollDisplay: string;
  ability: AbilityKey;
  abilityModifier: number;
  proficiencyLabel: string;
  proficiencyBonus: number;
  totalModifier: number;
  damageBonusEntries: FeatureDamageBonus[];
  rollFormula: string;
  hasVersatileBonus: boolean;
};

const fallbackWeaponReferencesByName = new Map<string, WeaponReference>([
  [
    "Dagger",
    { damageLabel: "1d4 Piercing", damageFormula: "1d4", abilityRule: "finesse", hasVersatileBonus: false }
  ],
  [
    "Shortsword",
    { damageLabel: "1d6 Piercing", damageFormula: "1d6", abilityRule: "finesse", hasVersatileBonus: false }
  ],
  [
    "Longsword",
    { damageLabel: "1d8 Slashing", damageFormula: "1d8", abilityRule: "strength", hasVersatileBonus: false }
  ]
]);

const codexWeaponEntriesByName = new Map<string, WeaponEntry>(
  hardcodedCodexEntries
    .filter(
      (entry): entry is WeaponEntry =>
        isWeaponEntry(entry) && entry.category === ENTRY_CATEGORIES.WEAPONS
    )
    .map((entry) => [entry.name, entry])
);

const codexClassEntriesByName = new Map<string, ClassEntry>(
  hardcodedCodexEntries
    .filter(
      (entry): entry is ClassEntry =>
        entry.category === ENTRY_CATEGORIES.CLASSES
    )
    .map((entry) => [entry.name, entry])
);

const codexSpeciesEntriesByName = new Map<string, SpeciesEntry>(
  hardcodedCodexEntries
    .filter(
      (entry): entry is SpeciesEntry =>
        isSpeciesEntry(entry) && entry.category === ENTRY_CATEGORIES.SPECIES
    )
    .map((entry) => [entry.name, entry])
);

function isWeaponEntry(entry: CodexEntry): entry is WeaponEntry {
  return entry.category === ENTRY_CATEGORIES.WEAPONS;
}

function isSpeciesEntry(entry: CodexEntry): entry is SpeciesEntry {
  return entry.category === ENTRY_CATEGORIES.SPECIES;
}

function getWeaponAbilityRule(weapon: Pick<WeaponEntry, "type" | "properties">): WeaponAbilityRule {
  if (weapon.type.combat === WEAPON_COMBAT_TYPE.RANGED) {
    return "dexterity";
  }

  if (weapon.properties.includes(WEAPON_PROPERTY.FINESSE)) {
    return "finesse";
  }

  return "strength";
}

function getWeaponReferenceFromEntry(
  weapon: Pick<WeaponEntry, "damage" | "type" | "properties" | "versatileDamage">,
  options?: {
    useVersatileDamage?: boolean;
  }
): WeaponReference | null {
  const damage =
    options?.useVersatileDamage && Array.isArray(weapon.versatileDamage) && weapon.versatileDamage.length > 0
      ? weapon.versatileDamage
      : weapon.damage;

  if (damage.length === 0) {
    return null;
  }

  return {
    damageLabel: formatWeaponDamage(damage),
    damageFormula: formatWeaponDamageFormula(damage),
    abilityRule: getWeaponAbilityRule(weapon),
    hasVersatileBonus: Boolean(options?.useVersatileDamage)
  };
}

function getWeaponReference(
  name: string,
  options?: {
    useVersatileDamage?: boolean;
  }
): WeaponReference | null {
  const codexWeapon = codexWeaponEntriesByName.get(name);

  if (codexWeapon) {
    return getWeaponReferenceFromEntry(codexWeapon, options);
  }

  return fallbackWeaponReferencesByName.get(name) ?? null;
}

function resolveWeaponAbility(rule: WeaponAbilityRule, abilities: AbilityScores): AbilityKey {
  if (rule === "dexterity") {
    return "DEX";
  }

  if (rule === "strength") {
    return "STR";
  }

  return getAbilityModifier(abilities.DEX) >= getAbilityModifier(abilities.STR) ? "DEX" : "STR";
}

function createRollFormula(baseFormula: string, modifier: number): string {
  if (modifier === 0) {
    return baseFormula;
  }

  return `${baseFormula}${modifier > 0 ? "+" : ""}${modifier}`;
}

function createRollDisplay(baseFormula: string, modifier: number): string {
  if (modifier === 0) {
    return baseFormula;
  }

  return `${baseFormula} ${formatAbilityModifier(modifier)}`;
}

export function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function formatAbilityModifier(modifier: number): string {
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
}

function getDamageBonusTotal(damageBonusEntries: FeatureDamageBonus[]): number {
  return damageBonusEntries.reduce((total, entry) => total + entry.value, 0);
}

function createWeaponAction(
  character: Pick<Character, "className" | "level" | "classFeatureState">,
  options: {
    key: string;
    name: string;
    attackKind: "weapon" | "unarmed";
    damageLabel: string;
    damageFormula: string;
    ability: AbilityKey;
    abilityModifier: number;
    proficiencyLabel: string;
    proficiencyBonus: number;
    hasVersatileBonus: boolean;
  }
): WeaponAction {
  const damageBonusEntries = getFeatureDamageBonusesForWeaponAction(character, {
    name: options.name,
    ability: options.ability,
    attackKind: options.attackKind
  });
  const totalModifier =
    options.abilityModifier + options.proficiencyBonus + getDamageBonusTotal(damageBonusEntries);

  return {
    key: options.key,
    name: options.name,
    attackKind: options.attackKind,
    damageLabel: options.damageLabel,
    damageFormula: options.damageFormula,
    rollDisplay: createRollDisplay(options.damageFormula, totalModifier),
    ability: options.ability,
    abilityModifier: options.abilityModifier,
    proficiencyLabel: options.proficiencyLabel,
    proficiencyBonus: options.proficiencyBonus,
    totalModifier,
    damageBonusEntries,
    rollFormula: createRollFormula(options.damageFormula, totalModifier),
    hasVersatileBonus: options.hasVersatileBonus
  };
}

export function getProficiencyBonus(level: number): number {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));
  return Math.floor((normalizedLevel - 1) / 4) + 2;
}

export function getMainAbilityForClass(className: string): AbilityKey | null {
  const classEntry = codexClassEntriesByName.get(className);

  if (!classEntry || classEntry.primaryAbilityModifiers.length === 0) {
    return null;
  }

  return classEntry.primaryAbilityModifiers[0] as AbilityKey;
}

export function getHitDieFormulaForClass(className: string): string {
  const classEntry = codexClassEntriesByName.get(className);

  if (!classEntry) {
    return "1d8";
  }

  const rawDie = String(classEntry.hitPointDie).toLowerCase();
  return rawDie.startsWith("d") ? `1${rawDie}` : "1d8";
}

function getHitDieMaximumForClass(className: string): number {
  const classEntry = codexClassEntriesByName.get(className);
  const rawHitDie = classEntry ? String(classEntry.hitPointDie) : "D8";
  const parsedMaximum = Number(rawHitDie.replace(/\D/g, ""));

  if (!Number.isFinite(parsedMaximum) || parsedMaximum <= 0) {
    return 8;
  }

  return parsedMaximum;
}

export function getAutomaticMaxHitPointsForCharacter(
  character: Pick<Character, "className" | "level" | "abilities">
): number {
  const hitDieMaximum = getHitDieMaximumForClass(character.className);
  const hitDieAverage = Math.floor(hitDieMaximum / 2) + 1;
  const constitutionModifier = getAbilityModifier(character.abilities.CON);
  const normalizedLevel = Math.max(1, Math.floor(character.level));
  const computedHitPoints =
    hitDieMaximum +
    constitutionModifier +
    (normalizedLevel - 1) * (hitDieAverage + constitutionModifier);

  return Math.max(1, Math.floor(computedHitPoints));
}

export function getHitDiceRemainingForCharacter(character: Character): number {
  const parsedRemaining = Number(character.hitDiceRemaining);

  if (!Number.isFinite(parsedRemaining)) {
    return character.level;
  }

  return Math.max(0, Math.min(character.level, Math.floor(parsedRemaining)));
}

export function getHitDiceDisplayForCharacter(character: Character): string {
  const hitDieFormula = getHitDieFormulaForClass(character.className);
  const totalHitDice = Math.max(1, Math.floor(character.level));
  const availableHitDice = getHitDiceRemainingForCharacter(character);

  return `${hitDieFormula} (${availableHitDice}/${totalHitDice})`;
}

export function getSavingThrowProficienciesForClass(className: string): AbilityKey[] {
  const classEntry = codexClassEntriesByName.get(className);

  if (!classEntry) {
    return [];
  }

  return classEntry.savingThrowProficiencies as AbilityKey[];
}

export function getInitiativeForCharacter(character: Character): number {
  return getAbilityModifier(character.abilities.DEX);
}

export function getSpeedForCharacter(character: Character): number {
  const speciesEntry = codexSpeciesEntriesByName.get(character.species);
  return speciesEntry?.speed ?? 30;
}

function getSkillModifierForCharacter(character: Character, skill: SkillName): number {
  const proficiencyBonus = getProficiencyBonus(character.level);
  const skillProficiency = getSkillProficiencyForName(skill);
  const skillLevel = skillProficiency
    ? getSkillLevelFromEntries(character.skillProficiencies, skillProficiency)
    : PROF_LEVEL.NONE;
  const proficiencyMultiplier =
    skillLevel === PROF_LEVEL.EXPERT
      ? 2
      : skillLevel === PROF_LEVEL.PROFICIENT
        ? 1
        : 0;

  // Perception currently maps to Wisdom.
  const abilityModifier = getAbilityModifier(character.abilities.WIS);

  return abilityModifier + proficiencyMultiplier * proficiencyBonus;
}

export function getPassivePerceptionForCharacter(character: Character): number {
  return 10 + getSkillModifierForCharacter(character, "Perception");
}

function createUnarmedStrikeAction(
  character: Pick<Character, "abilities" | "className" | "level" | "classFeatureState">
): WeaponAction {
  const ability: AbilityKey = "STR";
  const abilityModifier = getAbilityModifier(character.abilities.STR);
  const damageFormula = "1";

  return createWeaponAction(character, {
    key: "unarmed-strike",
    name: "Unarmed Strike",
    attackKind: "unarmed",
    damageLabel: "1 Bludgeoning",
    damageFormula,
    ability,
    abilityModifier,
    proficiencyLabel: "Unarmed strike",
    proficiencyBonus: 0,
    hasVersatileBonus: false
  });
}

export function getWeaponActionsForCharacter(character: Character): WeaponAction[] {
  const proficiencyBonus = getProficiencyBonus(character.level);
  const heldCustomWeapons = getResolvedCustomLoadoutEntries(character.customEquipment).filter(
    (entry): entry is ResolvedCustomWeaponEntry =>
      entry.category === ENTRY_CATEGORIES.WEAPONS && entry.onHand
  );
  const heldCodexWeapons = character.equipment.filter((item) => item.onHand);
  const heldCodexWeaponDescriptors = heldCodexWeapons.reduce<HeldWeaponDescriptor[]>(
    (descriptors, item) => {
      const equipmentDefinition = getEquipmentByName(item.name);

      if (!equipmentDefinition) {
        return descriptors;
      }

      if (equipmentDefinition.category === "armor" && equipmentDefinition.type === "shield") {
        return [...descriptors, createHeldShieldDescriptor(`codex-${item.name}`)];
      }

      const entry = codexWeaponEntriesByName.get(item.name);

      if (!entry) {
        return descriptors;
      }

      return [...descriptors, createHeldWeaponDescriptor(`codex-${item.name}`, entry)];
    },
    []
  );
  const heldCustomWeaponDescriptors = heldCustomWeapons.map((entry) =>
    createHeldWeaponDescriptor(`custom-${entry.customEquipmentId}`, entry)
  );
  const heldWeaponDescriptors: HeldWeaponDescriptor[] = [
    ...heldCodexWeaponDescriptors,
    ...heldCustomWeaponDescriptors
  ];
  const hasFreeHand = getHeldWeaponSlotCount(heldWeaponDescriptors) < 2;

  const codexWeaponActions = heldCodexWeapons.reduce<WeaponAction[]>((actions, equipmentItem) => {
    const equipmentDefinition = getEquipmentByName(equipmentItem.name);

    if (!equipmentDefinition || equipmentDefinition.category !== "weapon") {
      return actions;
    }

    const weaponEntry = codexWeaponEntriesByName.get(equipmentItem.name);
    const weaponDescriptor = weaponEntry
      ? {
          key: `codex-${equipmentItem.name}`,
          properties: weaponEntry.properties,
          versatileDamage: weaponEntry.versatileDamage
        }
      : null;
    const useVersatileDamage = weaponDescriptor
      ? hasVersatileHandBonus(weaponDescriptor, heldWeaponDescriptors)
      : false;
    const weaponReference = getWeaponReference(equipmentItem.name, {
      useVersatileDamage
    });

    if (!weaponReference) {
      return actions;
    }

    const ability = resolveWeaponAbility(weaponReference.abilityRule, character.abilities);
    const abilityModifier = getAbilityModifier(character.abilities[ability]);
    const weaponProficiency = getWeaponProficiencyForTraining(equipmentDefinition.training);
    const appliedProficiencyBonus =
      getWeaponLevelFromEntries(character.weaponProficiencies, weaponProficiency) !==
      PROF_LEVEL.NONE
        ? proficiencyBonus
        : 0;
    const proficiencyLabel =
      equipmentDefinition.training === WEAPON_TRAINING.SIMPLE ? "Simple weapon" : "Martial weapon";

    return [
      ...actions,
      createWeaponAction(character, {
        key: `codex-${equipmentItem.name}`,
        name: equipmentItem.name,
        attackKind: "weapon",
        damageLabel: weaponReference.damageLabel,
        damageFormula: weaponReference.damageFormula,
        ability,
        abilityModifier,
        proficiencyLabel,
        proficiencyBonus: appliedProficiencyBonus,
        hasVersatileBonus: weaponReference.hasVersatileBonus
      })
    ];
  }, []);

  const customWeaponActions = heldCustomWeapons.reduce<WeaponAction[]>((actions, weaponEntry) => {
    const weaponDescriptor = {
      key: `custom-${weaponEntry.customEquipmentId}`,
      properties: weaponEntry.properties,
      versatileDamage: weaponEntry.versatileDamage
    } satisfies HeldWeaponDescriptor;
    const useVersatileDamage = hasVersatileHandBonus(weaponDescriptor, heldWeaponDescriptors);
    const weaponReference = getWeaponReferenceFromEntry(weaponEntry, {
      useVersatileDamage
    });

    if (!weaponReference) {
      return actions;
    }

    const ability = resolveWeaponAbility(weaponReference.abilityRule, character.abilities);
    const abilityModifier = getAbilityModifier(character.abilities[ability]);
    const weaponProficiency = getWeaponProficiencyForTraining(weaponEntry.type.training);
    const appliedProficiencyBonus =
      getWeaponLevelFromEntries(character.weaponProficiencies, weaponProficiency) !==
      PROF_LEVEL.NONE
        ? proficiencyBonus
        : 0;
    const proficiencyLabel =
      weaponEntry.type.training === WEAPON_TRAINING.SIMPLE ? "Simple weapon" : "Martial weapon";

    return [
      ...actions,
      createWeaponAction(character, {
        key: `custom-${weaponEntry.customEquipmentId}`,
        name: weaponEntry.name,
        attackKind: "weapon",
        damageLabel: weaponReference.damageLabel,
        damageFormula: weaponReference.damageFormula,
        ability,
        abilityModifier,
        proficiencyLabel,
        proficiencyBonus: appliedProficiencyBonus,
        hasVersatileBonus: weaponReference.hasVersatileBonus
      })
    ];
  }, []);

  return [
    ...(hasFreeHand ? [createUnarmedStrikeAction(character)] : []),
    ...codexWeaponActions,
    ...customWeaponActions
  ];
}
