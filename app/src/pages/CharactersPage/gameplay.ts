import {
  ARMOR_TYPES,
  ENTRY_CATEGORIES,
  WEAPON_COMBAT_TYPE,
  WEAPON_PROPERTY,
  WEAPON_TRAINING,
  hardcodedCodexEntries,
  type ArmorEntry,
  type ClassEntry,
  type CodexEntry,
  type SpeciesEntry,
  type WeaponEntry
} from "../../codex/entries";
import type { AbilityKey, AbilityScores, Character, SkillName } from "../../types";
import { formatWeaponDamage, formatWeaponDamageFormula } from "../../utils/codex";
import {
  createHeldWeaponDescriptor,
  getCharacterEquipmentNames,
  hasVersatileHandBonus,
  type HeldWeaponDescriptor
} from "./inventory";
import {
  getEquipmentByName,
  getClassProficiencyProfile,
  getGrantedSkillProficienciesForCharacter,
  normalizeManualSkillSelections,
  normalizeSkillExpertiseSelectionsForCharacter,
  type ArmorType
} from "./proficiency";
import {
  getResolvedCustomLoadoutEntries,
  type ResolvedCustomArmorEntry,
  type ResolvedCustomWeaponEntry
} from "./customEquipment";

type WeaponAbilityRule = "strength" | "dexterity" | "finesse";

type WeaponReference = {
  damageLabel: string;
  damageFormula: string;
  abilityRule: WeaponAbilityRule;
  hasVersatileBonus: boolean;
};

type ArmorReference = {
  armorBase: number;
  maxDexModifier: number | null;
  shieldBonus: number;
};

export type WeaponAction = {
  key: string;
  name: string;
  damageLabel: string;
  damageFormula: string;
  rollDisplay: string;
  ability: AbilityKey;
  abilityModifier: number;
  proficiencyLabel: string;
  proficiencyBonus: number;
  totalModifier: number;
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

const codexArmorEntriesByName = new Map<string, ArmorEntry>(
  hardcodedCodexEntries
    .filter(
      (entry): entry is ArmorEntry =>
        isArmorEntry(entry) && entry.category === ENTRY_CATEGORIES.ARMOR
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

function isArmorEntry(entry: CodexEntry): entry is ArmorEntry {
  return entry.category === ENTRY_CATEGORIES.ARMOR;
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

const fallbackArmorReferencesByType: Record<ArmorType, ArmorReference> = {
  light: {
    armorBase: 11,
    maxDexModifier: null,
    shieldBonus: 0
  },
  medium: {
    armorBase: 14,
    maxDexModifier: 2,
    shieldBonus: 0
  },
  heavy: {
    armorBase: 16,
    maxDexModifier: 0,
    shieldBonus: 0
  },
  shield: {
    armorBase: 0,
    maxDexModifier: null,
    shieldBonus: 2
  }
};

function getArmorReference(name: string): ArmorReference | null {
  const codexArmor = codexArmorEntriesByName.get(name);

  if (codexArmor) {
    return {
      armorBase: codexArmor.armorBase,
      maxDexModifier: codexArmor.maxDexModifier,
      shieldBonus: codexArmor.shieldBonus
    };
  }

  const equipment = getEquipmentByName(name);

  if (!equipment || equipment.category !== "armor") {
    return null;
  }

  return fallbackArmorReferencesByType[equipment.type];
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

export function getArmorClassForCharacter(character: Character): number {
  const uniqueEquipment = [...new Set(getCharacterEquipmentNames(character.equipment))];
  const customArmorEntries = getResolvedCustomLoadoutEntries(character.customEquipment).filter(
    (entry): entry is ResolvedCustomArmorEntry => entry.category === ENTRY_CATEGORIES.ARMOR
  );
  const dexterityModifier = getAbilityModifier(character.abilities.DEX);
  let selectedArmorReference: ArmorReference | null = null;
  let shieldBonus = 0;

  for (const equipmentName of uniqueEquipment) {
    const equipmentDefinition = getEquipmentByName(equipmentName);

    if (!equipmentDefinition || equipmentDefinition.category !== "armor") {
      continue;
    }

    const armorReference = getArmorReference(equipmentName);

    if (!armorReference) {
      continue;
    }

    if (equipmentDefinition.type === "shield") {
      shieldBonus += armorReference.shieldBonus;
      continue;
    }

    if (!selectedArmorReference || armorReference.armorBase > selectedArmorReference.armorBase) {
      selectedArmorReference = armorReference;
    }
  }

  for (const customArmor of customArmorEntries) {
    const armorReference: ArmorReference = {
      armorBase: customArmor.armorBase,
      maxDexModifier: customArmor.maxDexModifier,
      shieldBonus: customArmor.shieldBonus
    };

    if (customArmor.tags.includes(ARMOR_TYPES.SHIELD)) {
      shieldBonus += armorReference.shieldBonus;
      continue;
    }

    if (!selectedArmorReference || armorReference.armorBase > selectedArmorReference.armorBase) {
      selectedArmorReference = armorReference;
    }
  }

  const armorBase = selectedArmorReference ? selectedArmorReference.armorBase : 10;
  let allowedDexterityModifier = dexterityModifier;

  if (selectedArmorReference) {
    if (selectedArmorReference.maxDexModifier === 0) {
      allowedDexterityModifier = 0;
    } else if (selectedArmorReference.maxDexModifier !== null) {
      allowedDexterityModifier = Math.min(
        dexterityModifier,
        selectedArmorReference.maxDexModifier
      );
    }
  }

  return armorBase + allowedDexterityModifier + shieldBonus;
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
  const grantedSkills = getGrantedSkillProficienciesForCharacter(
    character.className,
    character.species,
    character.background
  ).map((entry) => entry.skill);
  const normalizedManualSkills = normalizeManualSkillSelections(character.skills);
  const normalizedExpertSkills = normalizeSkillExpertiseSelectionsForCharacter(
    character.className,
    character.species,
    character.background,
    normalizedManualSkills,
    character.skillExpertise ?? []
  );
  const proficientSkillSet = new Set<SkillName>([...grantedSkills, ...normalizedManualSkills]);
  const expertSkillSet = new Set<SkillName>(normalizedExpertSkills);
  const proficiencyMultiplier = expertSkillSet.has(skill)
    ? 2
    : proficientSkillSet.has(skill)
      ? 1
      : 0;

  // Perception currently maps to Wisdom.
  const abilityModifier = getAbilityModifier(character.abilities.WIS);

  return abilityModifier + proficiencyMultiplier * proficiencyBonus;
}

export function getPassivePerceptionForCharacter(character: Character): number {
  return 10 + getSkillModifierForCharacter(character, "Perception");
}

export function getWeaponActionsForCharacter(character: Character): WeaponAction[] {
  const proficiencyProfile = getClassProficiencyProfile(character.className);
  const proficiencyBonus = getProficiencyBonus(character.level);
  const heldCustomWeapons = getResolvedCustomLoadoutEntries(character.customEquipment).filter(
    (entry): entry is ResolvedCustomWeaponEntry =>
      entry.category === ENTRY_CATEGORIES.WEAPONS && entry.onHand
  );
  const heldCodexWeapons = character.equipment.filter((item) => item.onHand);
  const heldCodexWeaponDescriptors = heldCodexWeapons.reduce<HeldWeaponDescriptor[]>(
    (descriptors, item) => {
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
    const appliedProficiencyBonus =
      proficiencyProfile?.weaponProficiencies.includes(equipmentDefinition.training)
        ? proficiencyBonus
        : 0;
    const totalModifier = abilityModifier + appliedProficiencyBonus;
    const proficiencyLabel =
      equipmentDefinition.training === WEAPON_TRAINING.SIMPLE ? "Simple weapon" : "Martial weapon";

    return [
      ...actions,
      {
        key: `codex-${equipmentItem.name}`,
        name: equipmentItem.name,
        damageLabel: weaponReference.damageLabel,
        damageFormula: weaponReference.damageFormula,
        rollDisplay: createRollDisplay(weaponReference.damageFormula, totalModifier),
        ability,
        abilityModifier,
        proficiencyLabel,
        proficiencyBonus: appliedProficiencyBonus,
        totalModifier,
        rollFormula: createRollFormula(weaponReference.damageFormula, totalModifier),
        hasVersatileBonus: weaponReference.hasVersatileBonus
      }
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
    const appliedProficiencyBonus =
      proficiencyProfile?.weaponProficiencies.includes(weaponEntry.type.training)
        ? proficiencyBonus
        : 0;
    const totalModifier = abilityModifier + appliedProficiencyBonus;
    const proficiencyLabel =
      weaponEntry.type.training === WEAPON_TRAINING.SIMPLE ? "Simple weapon" : "Martial weapon";

    return [
      ...actions,
      {
        key: `custom-${weaponEntry.customEquipmentId}`,
        name: weaponEntry.name,
        damageLabel: weaponReference.damageLabel,
        damageFormula: weaponReference.damageFormula,
        rollDisplay: createRollDisplay(weaponReference.damageFormula, totalModifier),
        ability,
        abilityModifier,
        proficiencyLabel,
        proficiencyBonus: appliedProficiencyBonus,
        totalModifier,
        rollFormula: createRollFormula(weaponReference.damageFormula, totalModifier),
        hasVersatileBonus: weaponReference.hasVersatileBonus
      }
    ];
  }, []);

  return [...codexWeaponActions, ...customWeaponActions];
}
