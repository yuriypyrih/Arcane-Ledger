import {
  DICE,
  DAMAGE_TYPE,
  ENTRY_CATEGORIES,
  FEATS,
  WEAPON_COMBAT_TYPE,
  WEAPON_TRAINING,
  WEAPON_PROPERTY,
  type SpellDescriptionEntry,
  type ClassEntry,
  type WeaponDamage,
  type WeaponDamageAmount,
  type WeaponDamageType,
  type WeaponEntry
} from "../../codex/entries";
import { getClassEntries, getWeaponEntries } from "../../codex/selectors";
import type { AbilityKey, AbilityScores, Character, SkillName } from "../../types";
import { PROF_LEVEL, SKILL } from "../../types";
import { formatCodexLabel, formatWeaponDamage, formatWeaponDamageFormula } from "../../utils/codex";
import {
  getAbilityModifierForCharacter,
  getAbilityScoreForCharacter,
  getAbilityScoresForCharacter
} from "./abilities";
import {
  canUseMonkMartialArtsForCharacter,
  getAdditionalWeaponMasteriesForCharacter,
  type FeatureActionFact,
  getFeatureWeaponActionsForCharacter,
  hasBatteringRootsBonusForCharacter,
  getInitiativeBonusesForCharacter,
  getUnarmedStrikeConfigForCharacter,
  transformWeaponActionForCharacter,
  getFeatureDamageBonusesForWeaponAction,
  getMonkMartialArtsDieForCharacter,
  getMonkUnarmedDamageTypeLabelForCharacter,
  getSkillBonusesForCharacter,
  getWeaponAttackIndicatorsForCharacter,
  type FeatureDamageBonus
} from "./classFeatures";
import type { FeatureIndicator } from "./classFeatures";
import {
  ACTION_CATEGORY,
  ECONOMY_TYPE,
  type ActionCategory,
  type EconomyType
} from "./actionEconomy";
import {
  createHeldShieldDescriptor,
  createHeldWeaponDescriptor,
  hasVersatileHandBonus,
  type HeldWeaponDescriptor
} from "./inventory";
import { getWornBodyArmorTypeForCharacter } from "./armor";
import { isMonkWeapon } from "./monkWeapons";
import { normalizeCharacterFeats } from "./feats";
import {
  createHeldDescriptorForInventoryItem,
  getAdaptedItemWeapon,
  isItemShieldRecord
} from "./inventoryItems";
import {
  getAppliedWeaponProficiency,
  getEquipmentByName,
  getPrimaryAbilityForClass,
  getSavingThrowAbilityKeysForClass,
  getSkillLevelFromEntries,
  getSkillProficiencyForName
} from "./proficiency";
import { getResolvedCustomLoadoutEntries, type ResolvedCustomWeaponEntry } from "./customEquipment";
import { skillGroupsByAbility } from "./skillDefinitions";

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
  combatType?: WEAPON_COMBAT_TYPE | null;
  weaponTraining?: WEAPON_TRAINING | null;
  properties?: WEAPON_PROPERTY[];
  economyType: EconomyType;
  actionCategory: ActionCategory;
  economyMultiCount?: number;
  damageLabel: string;
  damageFormula: string;
  damageBreakdownLabel?: string;
  rollDisplay: string;
  rollFormulaDisplay: string;
  ability: AbilityKey;
  abilityModifier: number;
  damageAbility?: AbilityKey;
  damageAbilityModifier?: number;
  proficiencyLabel: string;
  proficiencyBonus: number;
  totalModifier: number;
  indicators: FeatureIndicator[];
  damageBonusEntries: FeatureDamageBonus[];
  rollFormula: string;
  hasVersatileBonus: boolean;
  hasGreatWeaponFighting: boolean;
  hasMartialArtsDamageDie: boolean;
  hasBatteringRootsBonus: boolean;
  isBatteringRootsEligible?: boolean;
  drawerEyebrow?: string;
  description?: SpellDescriptionEntry[];
  descriptionAdditions?: SpellDescriptionEntry[][];
  facts?: FeatureActionFact[];
  details?: Array<{
    label: string;
    value: string;
  }>;
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
  getWeaponEntries().map((entry) => [entry.name, entry])
);

const codexClassEntriesByName = new Map<string, ClassEntry>(
  getClassEntries().map((entry) => [entry.name, entry])
);

const unarmedStrikeDescription: SpellDescriptionEntry[] = [
  "An Unarmed Strike is a melee attack made without a weapon, using your body (such as a punch, kick, or headbutt). On a hit, it deals bludgeoning damage equal to 1 + your Strength modifier, unless modified by a feature. It counts as a melee weapon attack for rules and effects."
];

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
  return normalizeWeaponDamageTypes(damageType)
    .map((entry) => formatCodexLabel(entry))
    .join("/");
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

function getWeaponDamageFaceCount(amount: WeaponDamageAmount): number {
  if (typeof amount === "number") {
    return amount;
  }

  const parsedFaces = Number(String(amount).replace(/\D/g, ""));
  return Number.isFinite(parsedFaces) ? parsedFaces : 0;
}

function applyMartialArtsDamageDie(
  damage: WeaponDamage,
  martialArtsDie: DICE
): { damage: WeaponDamage; applied: boolean } {
  if (damage.length === 0) {
    return {
      damage,
      applied: false
    };
  }

  const [primaryAmount, primaryType] = damage[0];

  if (getWeaponDamageFaceCount(primaryAmount) >= getWeaponDamageFaceCount(martialArtsDie)) {
    return {
      damage,
      applied: false
    };
  }

  return {
    damage: [[martialArtsDie, primaryType], ...damage.slice(1)],
    applied: true
  };
}

function getSelectedWeaponDamage(
  weapon: Pick<WeaponEntry, "damage" | "versatileDamage">,
  options?: {
    useVersatileDamage?: boolean;
  }
): WeaponDamage {
  return options?.useVersatileDamage &&
    Array.isArray(weapon.versatileDamage) &&
    weapon.versatileDamage.length > 0
    ? weapon.versatileDamage
    : weapon.damage;
}

function hasGreatWeaponFightingFeat(character: Pick<Character, "feats" | "level">): boolean {
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
    damageOverride?: WeaponDamage;
    abilityRuleOverride?: WeaponAbilityRule;
  }
): WeaponReference | null {
  const damage = options?.damageOverride ?? getSelectedWeaponDamage(weapon, options);
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
    abilityRule: options?.abilityRuleOverride ?? getWeaponAbilityRule(weapon),
    hasVersatileBonus: Boolean(options?.useVersatileDamage),
    hasGreatWeaponFighting: applyGreatWeaponFighting
  };
}

function getWeaponReference(
  name: string,
  options?: {
    useVersatileDamage?: boolean;
    applyGreatWeaponFighting?: boolean;
    damageOverride?: WeaponDamage;
    abilityRuleOverride?: WeaponAbilityRule;
  }
): WeaponReference | null {
  const codexWeapon = codexWeaponEntriesByName.get(name);

  if (codexWeapon) {
    return getWeaponReferenceFromEntry(codexWeapon, options);
  }

  return fallbackWeaponReferencesByName.get(name) ?? null;
}

function getWeaponReferenceFromItemRecord(
  item: Character["inventoryItems"][number]["item"],
  options?: {
    useVersatileDamage?: boolean;
    applyGreatWeaponFighting?: boolean;
    damageOverride?: WeaponDamage;
    abilityRuleOverride?: WeaponAbilityRule;
  }
): WeaponReference | null {
  const adaptedWeapon = getAdaptedItemWeapon(item);
  const damage = options?.damageOverride ?? adaptedWeapon?.damage;

  if (!adaptedWeapon || !damage) {
    return null;
  }

  return getWeaponReferenceFromEntry(
    {
      type: adaptedWeapon.type,
      damage,
      properties: adaptedWeapon.properties,
      versatileDamage: adaptedWeapon.versatileDamage ?? undefined
    },
    {
      useVersatileDamage: options?.useVersatileDamage,
      applyGreatWeaponFighting: options?.applyGreatWeaponFighting,
      damageOverride: options?.damageOverride,
      abilityRuleOverride: options?.abilityRuleOverride
    }
  );
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

export function createWeaponAction(
  character: Pick<
    Character,
    "className" | "level" | "classFeatureState" | "statusEntries" | "subclassId"
  > &
    Partial<Pick<Character, "roundTracker">>,
  options: {
    key: string;
    name: string;
    attackKind: "weapon" | "unarmed";
    combatType?: WEAPON_COMBAT_TYPE | null;
    weaponTraining?: WEAPON_TRAINING | null;
    properties?: WEAPON_PROPERTY[];
    damageLabel: string;
    damageFormula: string;
    rollFormulaBase: string;
    damageBreakdownLabel?: string;
    ability: AbilityKey;
    abilityModifier: number;
    damageAbility?: AbilityKey;
    damageAbilityModifier?: number;
    proficiencyLabel: string;
    proficiencyBonus: number;
    economyType?: EconomyType;
    economyMultiCount?: number;
    hasVersatileBonus: boolean;
    hasGreatWeaponFighting: boolean;
    hasMartialArtsDamageDie?: boolean;
    skipFeatureDerivedLookups?: boolean;
  }
): WeaponAction {
  const damageBonusEntries = options.skipFeatureDerivedLookups
    ? []
    : getFeatureDamageBonusesForWeaponAction(character, {
        name: options.name,
        ability: options.ability,
        attackKind: options.attackKind,
        combatType: options.combatType ?? null
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
  const damageAbilityModifier = options.damageAbilityModifier ?? options.abilityModifier;
  const damageAbility = options.damageAbility ?? options.ability;
  const totalModifier = damageAbilityModifier + getDamageBonusTotal(damageBonusEntries);
  const indicators = options.skipFeatureDerivedLookups
    ? []
    : getWeaponAttackIndicatorsForCharacter(character);
  const hasBatteringRootsBonus = options.skipFeatureDerivedLookups
    ? false
    : hasBatteringRootsBonusForCharacter(character, {
        attackKind: options.attackKind,
        combatType: options.combatType ?? null,
        properties: options.properties
      });
  const isBatteringRootsEligible = options.skipFeatureDerivedLookups
    ? false
    : getAdditionalWeaponMasteriesForCharacter(character, {
        attackKind: options.attackKind,
        combatType: options.combatType ?? null,
        properties: options.properties
      }).some((entry) => entry.source === "Battering Roots");

  return {
    key: options.key,
    name: options.name,
    attackKind: options.attackKind,
    combatType: options.combatType ?? null,
    weaponTraining: options.weaponTraining ?? null,
    properties: options.properties ?? [],
    economyType: options.economyType ?? ECONOMY_TYPE.ACTION,
    actionCategory: ACTION_CATEGORY.ATTACK,
    economyMultiCount: options.economyMultiCount,
    damageLabel,
    damageFormula,
    damageBreakdownLabel: options.damageBreakdownLabel,
    rollDisplay: createRollDisplay(damageFormula, totalModifier),
    rollFormulaDisplay: createRollFormula(damageFormula, totalModifier),
    ability: options.ability,
    abilityModifier: options.abilityModifier,
    damageAbility,
    damageAbilityModifier,
    proficiencyLabel: options.proficiencyLabel,
    proficiencyBonus: options.proficiencyBonus,
    totalModifier,
    indicators,
    damageBonusEntries,
    rollFormula: createRollFormula(rollFormulaBase, totalModifier),
    hasVersatileBonus: options.hasVersatileBonus,
    hasGreatWeaponFighting: options.hasGreatWeaponFighting,
    hasMartialArtsDamageDie: Boolean(options.hasMartialArtsDamageDie),
    hasBatteringRootsBonus,
    isBatteringRootsEligible
  };
}

export function getProficiencyBonus(level: number): number {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));
  return Math.floor((normalizedLevel - 1) / 4) + 2;
}

export function getMainAbilityForClass(className: string): AbilityKey | null {
  return getPrimaryAbilityForClass(className);
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
  return getSavingThrowAbilityKeysForClass(className);
}

export function getInitiativeBreakdownForCharacter(character: Character): InitiativeBreakdown {
  const entries: InitiativeBreakdownEntry[] = [
    {
      label: "DEX",
      value: getAbilityModifierForCharacter(character, "DEX")
    }
  ];
  const initiativeBonuses = getInitiativeBonusesForCharacter(character);
  const normalizedFeats = normalizeCharacterFeats(character.feats, character.level);

  initiativeBonuses.forEach((bonus) => {
    const value = bonus.abilityModifierSource
      ? (() => {
          const sourceValue = getAbilityModifierForCharacter(
            character,
            bonus.abilityModifierSource
          );
          return typeof bonus.minimumValue === "number"
            ? Math.max(bonus.minimumValue, sourceValue)
            : sourceValue;
        })()
      : (bonus.value ?? 0);

    if (value === 0) {
      return;
    }

    entries.push({
      label: bonus.label,
      value
    });
  });

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
    skillLevel === PROF_LEVEL.EXPERT ? 2 : skillLevel === PROF_LEVEL.PROFICIENT ? 1 : 0;
  const defaultAbility =
    skillGroupsByAbility.find((group) => group.skills.includes(skill))?.ability ?? "WIS";
  const skillBonuses = getSkillBonusesForCharacter(character, skill, skillLevel);
  const replacementEntry = skillBonuses.find(
    (entry) => entry.replacesBaseAbility && entry.abilityModifierSource
  );
  const abilityModifier = getAbilityModifierForCharacter(
    character,
    replacementEntry?.abilityModifierSource ?? defaultAbility
  );
  const featureBonus = skillBonuses.reduce((total, bonus) => {
    if (bonus.replacesBaseAbility && bonus.abilityModifierSource) {
      return total;
    }

    if (bonus.abilityModifierSource) {
      const sourceValue = getAbilityModifierForCharacter(character, bonus.abilityModifierSource);
      return (
        total +
        (typeof bonus.minimumValue === "number"
          ? Math.max(bonus.minimumValue, sourceValue)
          : sourceValue)
      );
    }

    return total + (bonus.value ?? 0);
  }, 0);

  return abilityModifier + proficiencyMultiplier * proficiencyBonus + featureBonus;
}

export function getPassivePerceptionForCharacter(character: Character): number {
  return 10 + getSkillModifierForCharacter(character, SKILL.PERCEPTION);
}

function createUnarmedStrikeAction(
  character: Pick<
    Character,
    | "abilities"
    | "className"
    | "level"
    | "classFeatureState"
    | "subclassId"
    | "roundTracker"
    | "equipment"
    | "customEquipment"
  >,
  options?: {
    martialArtsDie?: DICE | null;
    economyType?: EconomyType;
    economyMultiCount?: number;
  }
): WeaponAction {
  const effectiveAbilityScores = getAbilityScoresForCharacter(character);
  const unarmedStrikeConfig = getUnarmedStrikeConfigForCharacter(character);
  const attackAbilityRule: WeaponAbilityRule =
    unarmedStrikeConfig?.attackAbility === "finesse"
      ? "finesse"
      : unarmedStrikeConfig?.attackAbility === "DEX"
        ? "dexterity"
        : unarmedStrikeConfig?.attackAbility === "STR"
          ? "strength"
          : options?.martialArtsDie
            ? "finesse"
            : "strength";
  const ability = resolveWeaponAbility(attackAbilityRule, effectiveAbilityScores);
  const abilityModifier = getAbilityModifier(getAbilityScoreForCharacter(character, ability));
  const damageAbility = unarmedStrikeConfig?.damageAbility ?? ability;
  const damageAbilityModifier = getAbilityModifier(
    getAbilityScoreForCharacter(character, damageAbility)
  );
  const damageFormula =
    unarmedStrikeConfig?.damageFormula ??
    (options?.martialArtsDie ? `1${String(options.martialArtsDie).toLowerCase()}` : "1");
  const damageTypeLabel =
    unarmedStrikeConfig?.damageTypeLabel ?? getMonkUnarmedDamageTypeLabelForCharacter(character);
  const proficiencyBonus = getProficiencyBonus(character.level);

  return {
    ...createWeaponAction(character, {
      key: "unarmed-strike",
      name: "Unarmed Strike",
      attackKind: "unarmed",
      combatType: WEAPON_COMBAT_TYPE.MELEE,
      weaponTraining: null,
      properties: [],
      damageLabel: `${damageFormula} ${damageTypeLabel}`,
      damageFormula,
      rollFormulaBase: damageFormula,
      damageBreakdownLabel: unarmedStrikeConfig?.damageBreakdownLabel,
      ability,
      abilityModifier,
      damageAbility,
      damageAbilityModifier,
      proficiencyLabel: "",
      proficiencyBonus,
      economyType: options?.economyType,
      economyMultiCount: options?.economyMultiCount,
      hasVersatileBonus: false,
      hasGreatWeaponFighting: false,
      hasMartialArtsDamageDie: Boolean(options?.martialArtsDie)
    }),
    description: unarmedStrikeDescription
  };
}

export function getWeaponActionsForCharacter(character: Character): WeaponAction[] {
  const proficiencyBonus = getProficiencyBonus(character.level);
  const effectiveAbilityScores = getAbilityScoresForCharacter(character);
  const hasGreatWeaponFighting = hasGreatWeaponFightingFeat(character);
  const heldCustomWeapons = getResolvedCustomLoadoutEntries(character.customEquipment).filter(
    (entry): entry is ResolvedCustomWeaponEntry =>
      entry.category === ENTRY_CATEGORIES.WEAPONS && entry.onHand
  );
  const heldInventoryItems = character.inventoryItems.filter((entry) => entry.onHand);
  const heldInventoryWeapons = heldInventoryItems.filter((entry) => Boolean(entry.item.weapon));
  const heldCodexWeapons = character.equipment.filter((item) => item.onHand);
  const heldCodexWeaponEntries = heldCodexWeapons.reduce<WeaponEntry[]>((entries, item) => {
    const entry = codexWeaponEntriesByName.get(item.name);

    return entry ? [...entries, entry] : entries;
  }, []);
  const heldInventoryWeaponEntries = heldInventoryWeapons
    .map((entry) => {
      const adaptedWeapon = getAdaptedItemWeapon(entry.item);

      if (!adaptedWeapon?.damage) {
        return null;
      }

      return {
        type: adaptedWeapon.type,
        damage: adaptedWeapon.damage,
        properties: adaptedWeapon.properties
      };
    })
    .filter(
      (
        entry
      ): entry is {
        type: WeaponEntry["type"];
        damage: WeaponDamage;
        properties: WeaponEntry["properties"];
      } => entry !== null
    );
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
  const heldInventoryWeaponDescriptors = heldInventoryItems.flatMap((entry) => {
    const descriptor = createHeldDescriptorForInventoryItem(`inventory-${entry.id}`, entry.item);
    return descriptor ? [descriptor] : [];
  });
  const heldWeaponDescriptors: HeldWeaponDescriptor[] = [
    ...heldCodexWeaponDescriptors,
    ...heldInventoryWeaponDescriptors,
    ...heldCustomWeaponDescriptors
  ];
  const hasShieldEquipped =
    heldCodexWeapons.some((item) => {
      const equipmentDefinition = getEquipmentByName(item.name);
      return equipmentDefinition?.category === "armor" && equipmentDefinition.type === "shield";
    }) || heldInventoryItems.some((entry) => isItemShieldRecord(entry.item));
  const monkMartialArtsDie = getMonkMartialArtsDieForCharacter(character);
  const monkMartialArtsActive =
    monkMartialArtsDie !== null &&
    canUseMonkMartialArtsForCharacter(character, {
      hasWornBodyArmor: getWornBodyArmorTypeForCharacter(character) !== null,
      hasShieldEquipped,
      wieldsOnlyMonkWeaponsOrUnarmed: [
        ...heldCodexWeaponEntries,
        ...heldCustomWeapons,
        ...heldInventoryWeaponEntries
      ].every((weapon) => isMonkWeapon(weapon))
    });

  const codexWeaponActions = heldCodexWeapons.reduce<WeaponAction[]>((actions, equipmentItem) => {
    const equipmentDefinition = getEquipmentByName(equipmentItem.name);

    if (!equipmentDefinition || equipmentDefinition.category !== "weapon") {
      return actions;
    }

    const weaponEntry = codexWeaponEntriesByName.get(equipmentItem.name);

    if (!weaponEntry) {
      return actions;
    }

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
    const isEligibleMonkWeapon = monkMartialArtsActive && isMonkWeapon(weaponEntry);
    const monkDamageAdjustment =
      isEligibleMonkWeapon && monkMartialArtsDie
        ? applyMartialArtsDamageDie(
            getSelectedWeaponDamage(weaponEntry, { useVersatileDamage }),
            monkMartialArtsDie
          )
        : null;
    const weaponReference = getWeaponReference(equipmentItem.name, {
      useVersatileDamage,
      applyGreatWeaponFighting: hasGreatWeaponFighting,
      damageOverride: monkDamageAdjustment?.damage,
      abilityRuleOverride: isEligibleMonkWeapon ? "finesse" : undefined
    });

    if (!weaponReference) {
      return actions;
    }

    const ability = resolveWeaponAbility(weaponReference.abilityRule, effectiveAbilityScores);
    const abilityModifier = getAbilityModifier(getAbilityScoreForCharacter(character, ability));
    const appliedWeaponProficiency = getAppliedWeaponProficiency(
      character.weaponProficiencies,
      equipmentDefinition.training,
      {
        baseWeapon: equipmentDefinition.baseWeapon,
        combatType: weaponEntry.type.combat,
        properties: weaponEntry.properties
      }
    );
    const appliedProficiencyBonus = appliedWeaponProficiency ? proficiencyBonus : 0;
    const proficiencyLabel = appliedWeaponProficiency?.label ?? "";

    return [
      ...actions,
      createWeaponAction(character, {
        key: `codex-${equipmentItem.name}`,
        name: equipmentItem.name,
        attackKind: "weapon",
        combatType: weaponEntry.type.combat,
        weaponTraining: weaponEntry.type.training,
        properties: weaponEntry.properties,
        damageLabel: weaponReference.damageLabel,
        damageFormula: weaponReference.damageFormula,
        rollFormulaBase: weaponReference.rollFormulaBase,
        ability,
        abilityModifier,
        proficiencyLabel,
        proficiencyBonus: appliedProficiencyBonus,
        hasVersatileBonus: weaponReference.hasVersatileBonus,
        hasGreatWeaponFighting: weaponReference.hasGreatWeaponFighting,
        hasMartialArtsDamageDie: Boolean(monkDamageAdjustment?.applied)
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
    const monkDamageAdjustment =
      monkMartialArtsActive && monkMartialArtsDie && isMonkWeapon(weaponEntry)
        ? applyMartialArtsDamageDie(
            getSelectedWeaponDamage(weaponEntry, { useVersatileDamage }),
            monkMartialArtsDie
          )
        : null;
    const weaponReference = getWeaponReferenceFromEntry(weaponEntry, {
      useVersatileDamage,
      applyGreatWeaponFighting: hasGreatWeaponFighting,
      damageOverride: monkDamageAdjustment?.damage,
      abilityRuleOverride:
        monkMartialArtsActive && isMonkWeapon(weaponEntry) ? "finesse" : undefined
    });

    if (!weaponReference) {
      return actions;
    }

    const ability = resolveWeaponAbility(weaponReference.abilityRule, effectiveAbilityScores);
    const abilityModifier = getAbilityModifier(getAbilityScoreForCharacter(character, ability));
    const appliedWeaponProficiency = getAppliedWeaponProficiency(
      character.weaponProficiencies,
      weaponEntry.type.training,
      {
        baseWeapon: weaponEntry.baseWeapon,
        combatType: weaponEntry.type.combat,
        properties: weaponEntry.properties
      }
    );
    const appliedProficiencyBonus = appliedWeaponProficiency ? proficiencyBonus : 0;
    const proficiencyLabel = appliedWeaponProficiency?.label ?? "";

    return [
      ...actions,
      createWeaponAction(character, {
        key: `custom-${weaponEntry.customEquipmentId}`,
        name: weaponEntry.name,
        attackKind: "weapon",
        combatType: weaponEntry.type.combat,
        weaponTraining: weaponEntry.type.training,
        properties: weaponEntry.properties,
        damageLabel: weaponReference.damageLabel,
        damageFormula: weaponReference.damageFormula,
        rollFormulaBase: weaponReference.rollFormulaBase,
        ability,
        abilityModifier,
        proficiencyLabel,
        proficiencyBonus: appliedProficiencyBonus,
        hasVersatileBonus: weaponReference.hasVersatileBonus,
        hasGreatWeaponFighting: weaponReference.hasGreatWeaponFighting,
        hasMartialArtsDamageDie: Boolean(monkDamageAdjustment?.applied)
      })
    ];
  }, []);
  const inventoryWeaponActions = heldInventoryWeapons.reduce<WeaponAction[]>(
    (actions, inventoryItem) => {
      const adaptedWeapon = getAdaptedItemWeapon(inventoryItem.item);
      const weaponDescriptor = createHeldDescriptorForInventoryItem(
        `inventory-${inventoryItem.id}`,
        inventoryItem.item
      );
      const weaponType = adaptedWeapon?.type ?? null;
      const weaponProperties = adaptedWeapon?.properties ?? [];
      const useVersatileDamage =
        weaponDescriptor !== null
          ? hasVersatileHandBonus(weaponDescriptor, heldWeaponDescriptors)
          : false;
      const baseDamage = adaptedWeapon?.damage
        ? getSelectedWeaponDamage(
            {
              damage: adaptedWeapon.damage,
              versatileDamage: adaptedWeapon.versatileDamage ?? undefined
            },
            { useVersatileDamage }
          )
        : null;
      const isEligibleMonkWeapon =
        monkMartialArtsActive &&
        weaponType &&
        isMonkWeapon({
          type: weaponType,
          properties: weaponProperties
        });
      const monkDamageAdjustment =
        isEligibleMonkWeapon && monkMartialArtsDie && baseDamage
          ? applyMartialArtsDamageDie(baseDamage, monkMartialArtsDie)
          : null;
      const weaponReference = getWeaponReferenceFromItemRecord(inventoryItem.item, {
        useVersatileDamage,
        applyGreatWeaponFighting: hasGreatWeaponFighting,
        damageOverride: monkDamageAdjustment?.damage,
        abilityRuleOverride: isEligibleMonkWeapon ? "finesse" : undefined
      });

      if (!weaponType || !weaponReference) {
        return actions;
      }

      const ability = resolveWeaponAbility(weaponReference.abilityRule, effectiveAbilityScores);
      const abilityModifier = getAbilityModifier(getAbilityScoreForCharacter(character, ability));
      const appliedWeaponProficiency = getAppliedWeaponProficiency(
        character.weaponProficiencies,
        weaponType.training,
        {
          combatType: weaponType.combat,
          properties: weaponProperties
        }
      );
      const appliedProficiencyBonus = appliedWeaponProficiency ? proficiencyBonus : 0;
      const proficiencyLabel = appliedWeaponProficiency?.label ?? "";

      return [
        ...actions,
        createWeaponAction(character, {
          key: `inventory-${inventoryItem.id}`,
          name: inventoryItem.item.name ?? inventoryItem.item.key ?? "Weapon",
          attackKind: "weapon",
          combatType: weaponType.combat,
          weaponTraining: weaponType.training,
          properties: weaponProperties,
          damageLabel: weaponReference.damageLabel,
          damageFormula: weaponReference.damageFormula,
          rollFormulaBase: weaponReference.rollFormulaBase,
          ability,
          abilityModifier,
          proficiencyLabel,
          proficiencyBonus: appliedProficiencyBonus,
          hasVersatileBonus: weaponReference.hasVersatileBonus,
          hasGreatWeaponFighting: weaponReference.hasGreatWeaponFighting,
          hasMartialArtsDamageDie: Boolean(monkDamageAdjustment?.applied)
        })
      ];
    },
    []
  );
  const featureWeaponActions = getFeatureWeaponActionsForCharacter(character);
  const resolvedWeaponActions = [
    ...featureWeaponActions,
    createUnarmedStrikeAction(character, {
      martialArtsDie: monkMartialArtsActive ? monkMartialArtsDie : null,
      economyType: ECONOMY_TYPE.ACTION
    }),
    ...codexWeaponActions,
    ...inventoryWeaponActions,
    ...customWeaponActions
  ];

  return resolvedWeaponActions.map((action) =>
    transformWeaponActionForCharacter(character, action)
  );
}
