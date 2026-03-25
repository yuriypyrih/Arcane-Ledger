import {
  DAMAGE_TYPE,
  ENTRY_CATEGORIES,
  FEATS,
  WEAPON_COMBAT_TYPE,
  WEAPON_PROPERTY,
  hardcodedCodexEntries,
  type ClassEntry,
  type CodexEntry,
  type WeaponDamage,
  type WeaponDamageAmount,
  type WeaponDamageType,
  type WeaponEntry
} from "../../codex/entries";
import type { AbilityKey, AbilityScores, Character, SkillName } from "../../types";
import { PROF_LEVEL } from "../../types";
import { formatCodexLabel, formatWeaponDamage, formatWeaponDamageFormula } from "../../utils/codex";
import {
  getAbilityModifierForCharacter,
  getAbilityScoreForCharacter,
  getAbilityScoresForCharacter
} from "./abilities";
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
import { normalizeCharacterFeats } from "./feats";
import {
  getAppliedWeaponProficiency,
  getEquipmentByName,
  getSkillLevelFromEntries,
  getSkillProficiencyForName
} from "./proficiency";
import {
  getResolvedCustomLoadoutEntries,
  type ResolvedCustomWeaponEntry
} from "./customEquipment";

type WeaponAbilityRule = "strength" | "dexterity" | "finesse";

type WeaponReference = {
  damageLabel: string;
  damageFormula: string;
  rollFormulaBase: string;
  abilityRule: WeaponAbilityRule;
  hasVersatileBonus: boolean;
  hasGreatWeaponFighting: boolean;
};

export type WeaponAction = {
  key: string;
  name: string;
  attackKind: "weapon" | "unarmed";
  damageLabel: string;
  damageFormula: string;
  rollDisplay: string;
  rollFormulaDisplay: string;
  ability: AbilityKey;
  abilityModifier: number;
  proficiencyLabel: string;
  proficiencyBonus: number;
  totalModifier: number;
  damageBonusEntries: FeatureDamageBonus[];
  rollFormula: string;
  hasVersatileBonus: boolean;
  hasGreatWeaponFighting: boolean;
};

export type InitiativeBreakdownEntry = {
  label: string;
  value: number;
};

export type InitiativeBreakdown = {
  total: number;
  entries: InitiativeBreakdownEntry[];
};

const fallbackWeaponReferencesByName = new Map<string, WeaponReference>([
  [
    "Dagger",
    {
      damageLabel: "1d4 Piercing",
      damageFormula: "1d4",
      rollFormulaBase: "1d4",
      abilityRule: "finesse",
      hasVersatileBonus: false,
      hasGreatWeaponFighting: false
    }
  ],
  [
    "Shortsword",
    {
      damageLabel: "1d6 Piercing",
      damageFormula: "1d6",
      rollFormulaBase: "1d6",
      abilityRule: "finesse",
      hasVersatileBonus: false,
      hasGreatWeaponFighting: false
    }
  ],
  [
    "Longsword",
    {
      damageLabel: "1d8 Slashing",
      damageFormula: "1d8",
      rollFormulaBase: "1d8",
      abilityRule: "strength",
      hasVersatileBonus: false,
      hasGreatWeaponFighting: false
    }
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

function isWeaponEntry(entry: CodexEntry): entry is WeaponEntry {
  return entry.category === ENTRY_CATEGORIES.WEAPONS;
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

function formatGroupedWeaponDamageAmount(amount: WeaponDamageAmount, count: number): string {
  if (typeof amount === "number") {
    return `${amount * count}`;
  }

  return `${count}${String(amount).toLowerCase()}`;
}

function normalizeWeaponDamageTypes(damageType: WeaponDamageType): DAMAGE_TYPE[] {
  return Array.isArray(damageType) ? damageType : [damageType];
}

function getWeaponDamageTypeKey(damageType: WeaponDamageType): string {
  return normalizeWeaponDamageTypes(damageType).join("/");
}

function formatWeaponDamageType(damageType: WeaponDamageType): string {
  return normalizeWeaponDamageTypes(damageType).map((entry) => formatCodexLabel(entry)).join("/");
}

function collapseWeaponDamage(damage: WeaponDamage) {
  const countsByKey = new Map<string, number>();
  const orderedEntries: WeaponDamage = [];

  damage.forEach(([amount, damageType]) => {
    const key = `${String(amount)}:${getWeaponDamageTypeKey(damageType)}`;

    if (!countsByKey.has(key)) {
      orderedEntries.push([amount, damageType]);
      countsByKey.set(key, 0);
    }

    countsByKey.set(key, (countsByKey.get(key) ?? 0) + 1);
  });

  return orderedEntries.map(([amount, damageType]) => ({
    amount,
    count: countsByKey.get(`${String(amount)}:${getWeaponDamageTypeKey(damageType)}`) ?? 1,
    damageType
  }));
}

function formatWeaponDamageWithMinimum(damage: WeaponDamage, minimumPerDie: number): string {
  if (damage.length === 0) {
    return "None";
  }

  return collapseWeaponDamage(damage)
    .map(({ amount, count, damageType }) => {
      const amountLabel = formatGroupedWeaponDamageAmount(amount, count);
      const minimumLabel = typeof amount === "string" ? ` (min ${minimumPerDie})` : "";

      return `${amountLabel}${minimumLabel} ${formatWeaponDamageType(damageType)}`;
    })
    .join(" + ");
}

function formatWeaponDamageFormulaWithMinimum(
  damage: WeaponDamage,
  minimumPerDie: number,
  options?: {
    internal?: boolean;
  }
): string {
  if (damage.length === 0) {
    return "0";
  }

  return collapseWeaponDamage(damage)
    .map(({ amount, count }) => {
      const amountLabel = formatGroupedWeaponDamageAmount(amount, count);

      if (typeof amount !== "string") {
        return amountLabel;
      }

      return options?.internal
        ? `${amountLabel}m${minimumPerDie}`
        : `${amountLabel} (min ${minimumPerDie})`;
    })
    .join(" + ");
}

function hasGreatWeaponFightingFeat(
  character: Pick<Character, "feats" | "level">
): boolean {
  return normalizeCharacterFeats(character.feats, character.level).some(
    (entry) => entry.feat === FEATS.GREAT_WEAPON_FIGHTING
  );
}

function canUseGreatWeaponFighting(
  weapon: Pick<WeaponEntry, "type" | "properties">,
  options?: {
    useVersatileDamage?: boolean;
  }
): boolean {
  if (weapon.type.combat !== WEAPON_COMBAT_TYPE.MELEE) {
    return false;
  }

  return (
    weapon.properties.includes(WEAPON_PROPERTY.TWO_HANDED) ||
    (Boolean(options?.useVersatileDamage) && weapon.properties.includes(WEAPON_PROPERTY.VERSATILE))
  );
}

function getWeaponReferenceFromEntry(
  weapon: Pick<WeaponEntry, "damage" | "type" | "properties" | "versatileDamage">,
  options?: {
    useVersatileDamage?: boolean;
    applyGreatWeaponFighting?: boolean;
  }
): WeaponReference | null {
  const damage =
    options?.useVersatileDamage && Array.isArray(weapon.versatileDamage) && weapon.versatileDamage.length > 0
      ? weapon.versatileDamage
      : weapon.damage;
  const applyGreatWeaponFighting =
    Boolean(options?.applyGreatWeaponFighting) && canUseGreatWeaponFighting(weapon, options);

  if (damage.length === 0) {
    return null;
  }

  return {
    damageLabel: applyGreatWeaponFighting
      ? formatWeaponDamageWithMinimum(damage, 3)
      : formatWeaponDamage(damage),
    damageFormula: applyGreatWeaponFighting
      ? formatWeaponDamageFormulaWithMinimum(damage, 3)
      : formatWeaponDamageFormula(damage),
    rollFormulaBase: applyGreatWeaponFighting
      ? formatWeaponDamageFormulaWithMinimum(damage, 3, { internal: true })
      : formatWeaponDamageFormula(damage),
    abilityRule: getWeaponAbilityRule(weapon),
    hasVersatileBonus: Boolean(options?.useVersatileDamage),
    hasGreatWeaponFighting: applyGreatWeaponFighting
  };
}

function getWeaponReference(
  name: string,
  options?: {
    useVersatileDamage?: boolean;
    applyGreatWeaponFighting?: boolean;
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
  return damageBonusEntries.reduce((total, entry) => total + (entry.value ?? 0), 0);
}

function appendFeatureDamageBonuses(
  baseExpression: string,
  damageBonusEntries: FeatureDamageBonus[],
  formatter: (entry: FeatureDamageBonus) => string | null
): string {
  const formattedBonuses = damageBonusEntries
    .map((entry) => formatter(entry))
    .filter((entry): entry is string => Boolean(entry && entry.trim().length > 0));

  if (formattedBonuses.length === 0) {
    return baseExpression;
  }

  return [baseExpression, ...formattedBonuses].join(" + ");
}

function formatFeatureDamageBonusLabel(entry: FeatureDamageBonus): string | null {
  if (entry.displayLabel) {
    return entry.displayLabel;
  }

  if (entry.formula) {
    return entry.formula;
  }

  return null;
}

function formatFeatureDamageBonusFormula(entry: FeatureDamageBonus): string | null {
  return entry.formula ?? null;
}

function createWeaponAction(
  character: Pick<Character, "className" | "level" | "classFeatureState">,
  options: {
    key: string;
    name: string;
    attackKind: "weapon" | "unarmed";
    damageLabel: string;
    damageFormula: string;
    rollFormulaBase: string;
    ability: AbilityKey;
    abilityModifier: number;
    proficiencyLabel: string;
    proficiencyBonus: number;
    hasVersatileBonus: boolean;
    hasGreatWeaponFighting: boolean;
  }
): WeaponAction {
  const damageBonusEntries = getFeatureDamageBonusesForWeaponAction(character, {
    name: options.name,
    ability: options.ability,
    attackKind: options.attackKind
  });
  const damageLabel = appendFeatureDamageBonuses(
    options.damageLabel,
    damageBonusEntries,
    formatFeatureDamageBonusLabel
  );
  const damageFormula = appendFeatureDamageBonuses(
    options.damageFormula,
    damageBonusEntries,
    formatFeatureDamageBonusFormula
  );
  const rollFormulaBase = appendFeatureDamageBonuses(
    options.rollFormulaBase,
    damageBonusEntries,
    formatFeatureDamageBonusFormula
  );
  const totalModifier =
    options.abilityModifier + options.proficiencyBonus + getDamageBonusTotal(damageBonusEntries);

  return {
    key: options.key,
    name: options.name,
    attackKind: options.attackKind,
    damageLabel,
    damageFormula,
    rollDisplay: createRollDisplay(damageFormula, totalModifier),
    rollFormulaDisplay: createRollFormula(damageFormula, totalModifier),
    ability: options.ability,
    abilityModifier: options.abilityModifier,
    proficiencyLabel: options.proficiencyLabel,
    proficiencyBonus: options.proficiencyBonus,
    totalModifier,
    damageBonusEntries,
    rollFormula: createRollFormula(rollFormulaBase, totalModifier),
    hasVersatileBonus: options.hasVersatileBonus,
    hasGreatWeaponFighting: options.hasGreatWeaponFighting
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
  character: Pick<Character, "className" | "level" | "abilities" | "classFeatureState">
): number {
  const hitDieMaximum = getHitDieMaximumForClass(character.className);
  const hitDieAverage = Math.floor(hitDieMaximum / 2) + 1;
  const constitutionModifier = getAbilityModifierForCharacter(character, "CON");
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

export function getInitiativeBreakdownForCharacter(character: Character): InitiativeBreakdown {
  const entries: InitiativeBreakdownEntry[] = [
    {
      label: "Dex",
      value: getAbilityModifierForCharacter(character, "DEX")
    }
  ];
  const normalizedFeats = normalizeCharacterFeats(character.feats, character.level);

  if (normalizedFeats.some((entry) => entry.feat === FEATS.ALERT)) {
    entries.push({
      label: "Proficiency Bonus (Alert)",
      value: getProficiencyBonus(character.level)
    });
  }

  return {
    total: entries.reduce((sum, entry) => sum + entry.value, 0),
    entries
  };
}

export function getInitiativeForCharacter(character: Character): number {
  return getInitiativeBreakdownForCharacter(character).total;
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
  const abilityModifier = getAbilityModifierForCharacter(character, "WIS");

  return abilityModifier + proficiencyMultiplier * proficiencyBonus;
}

export function getPassivePerceptionForCharacter(character: Character): number {
  return 10 + getSkillModifierForCharacter(character, "Perception");
}

function createUnarmedStrikeAction(
  character: Pick<Character, "abilities" | "className" | "level" | "classFeatureState">
): WeaponAction {
  const ability: AbilityKey = "STR";
  const abilityModifier = getAbilityModifierForCharacter(character, "STR");
  const damageFormula = "1";

  return createWeaponAction(character, {
    key: "unarmed-strike",
    name: "Unarmed Strike",
    attackKind: "unarmed",
    damageLabel: "1 Bludgeoning",
    damageFormula,
    rollFormulaBase: damageFormula,
    ability,
    abilityModifier,
    proficiencyLabel: "Unarmed strike",
    proficiencyBonus: 0,
    hasVersatileBonus: false,
    hasGreatWeaponFighting: false
  });
}

export function getWeaponActionsForCharacter(character: Character): WeaponAction[] {
  const proficiencyBonus = getProficiencyBonus(character.level);
  const effectiveAbilityScores = getAbilityScoresForCharacter(character);
  const hasGreatWeaponFighting = hasGreatWeaponFightingFeat(character);
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
      useVersatileDamage,
      applyGreatWeaponFighting: hasGreatWeaponFighting
    });

    if (!weaponReference) {
      return actions;
    }

    const ability = resolveWeaponAbility(weaponReference.abilityRule, effectiveAbilityScores);
    const abilityModifier = getAbilityModifier(getAbilityScoreForCharacter(character, ability));
    const appliedWeaponProficiency = getAppliedWeaponProficiency(
      character.weaponProficiencies,
      equipmentDefinition.training,
      equipmentDefinition.baseWeapon
    );
    const appliedProficiencyBonus = appliedWeaponProficiency ? proficiencyBonus : 0;
    const proficiencyLabel = appliedWeaponProficiency?.label ?? "";

    return [
      ...actions,
      createWeaponAction(character, {
        key: `codex-${equipmentItem.name}`,
        name: equipmentItem.name,
        attackKind: "weapon",
        damageLabel: weaponReference.damageLabel,
        damageFormula: weaponReference.damageFormula,
        rollFormulaBase: weaponReference.rollFormulaBase,
        ability,
        abilityModifier,
        proficiencyLabel,
        proficiencyBonus: appliedProficiencyBonus,
        hasVersatileBonus: weaponReference.hasVersatileBonus,
        hasGreatWeaponFighting: weaponReference.hasGreatWeaponFighting
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
      useVersatileDamage,
      applyGreatWeaponFighting: hasGreatWeaponFighting
    });

    if (!weaponReference) {
      return actions;
    }

    const ability = resolveWeaponAbility(weaponReference.abilityRule, effectiveAbilityScores);
    const abilityModifier = getAbilityModifier(getAbilityScoreForCharacter(character, ability));
    const appliedWeaponProficiency = getAppliedWeaponProficiency(
      character.weaponProficiencies,
      weaponEntry.type.training,
      weaponEntry.baseWeapon
    );
    const appliedProficiencyBonus = appliedWeaponProficiency ? proficiencyBonus : 0;
    const proficiencyLabel = appliedWeaponProficiency?.label ?? "";

    return [
      ...actions,
      createWeaponAction(character, {
        key: `custom-${weaponEntry.customEquipmentId}`,
        name: weaponEntry.name,
        attackKind: "weapon",
        damageLabel: weaponReference.damageLabel,
        damageFormula: weaponReference.damageFormula,
        rollFormulaBase: weaponReference.rollFormulaBase,
        ability,
        abilityModifier,
        proficiencyLabel,
        proficiencyBonus: appliedProficiencyBonus,
        hasVersatileBonus: weaponReference.hasVersatileBonus,
        hasGreatWeaponFighting: weaponReference.hasGreatWeaponFighting
      })
    ];
  }, []);

  return [
    ...(hasFreeHand ? [createUnarmedStrikeAction(character)] : []),
    ...codexWeaponActions,
    ...customWeaponActions
  ];
}
