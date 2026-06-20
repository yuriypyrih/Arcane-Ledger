import {
  DICE,
  DAMAGE_TYPE,
  ENTRY_CATEGORIES,
  FEATS,
  WEAPON_BASE,
  WEAPON_COMBAT_TYPE,
  WEAPON_MASTERY,
  WEAPON_TRAINING,
  WEAPON_PROPERTY,
  getSpellEntryById,
  type SpellDescriptionEntry,
  type WeaponDamage,
  type WeaponDamageAmount,
  type WeaponDamageType,
  type WeaponEntry
} from "../../codex/entries";
import { getWeaponEntries } from "../../codex/selectors";
import type {
  AbilityKey,
  AbilityScores,
  Character,
  CharacterInventoryFeatureTag,
  SkillName
} from "../../types";
import { PROF_LEVEL, SKILL } from "../../types";
import { formatCodexLabel, formatWeaponDamage, formatWeaponDamageFormula } from "../../utils/codex";
import {
  getAbilityModifierBreakdownForCharacter,
  getAbilityModifierForCharacter,
  getAbilityScoresForCharacter
} from "./abilities";
import type { AbilityModifierBonusEntry } from "./abilities";
import { getEquipmentRuntimeForCharacter } from "./characterRuntime/equipmentRuntime";
import { measureCharacterRuntime } from "./characterRuntime/performance";
import {
  divineFavorSpellId,
  getGiftOfAlacrityInitiativeBonusesForCharacter,
  getDivineFavorWeaponDamageBonusesForCharacter,
  getShillelaghDamageAdjustmentForWeapon,
  getShillelaghSpellcastingAbilityForWeapon,
  getTrueStrikeDamageAdjustmentForWeapon,
  getTrueStrikeEconomyMultiCountForWeapon,
  getTrueStrikeExtraRadiantDamageFormulaForLevel,
  getTrueStrikeSpellcastingAbilityForWeapon,
  hasDivineFavorStatus,
  shillelaghSpellId,
  shillelaghStatusValue,
  trueStrikeSpellId,
  trueStrikeStatusValue
} from "./characterRuntime/spellImplementations";
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
import type { ACTION_CARD_THEME } from "./actionCardTheme";
import { abilityKeys } from "./constants";
import {
  ACTION_CATEGORY,
  ECONOMY_TYPE,
  type ActionCategory,
  type EconomyType
} from "./actionEconomy";
import {
  createHeldShieldDescriptor,
  createHeldWeaponDescriptor,
  getHeldWeaponSlotCount,
  getWeaponHandSlots,
  hasVersatileHandBonus,
  type HeldWeaponDescriptor
} from "./inventory";
import { getWornBodyArmorTypeForCharacter } from "./armor";
import { isMonkWeapon } from "./monkWeapons";
import { hasFeatForCharacter } from "./feats/runtime";
import {
  formatCustomTraitBonusFormulaTerm,
  formatCustomTraitBonusRollFormulaTerm,
  getCustomTraitPassivePerceptionBonuses,
  type CustomTraitBonusInput
} from "./customTraitEffects";
import { getCharacterCustomTraitEffectInput } from "./characterRuntime/customEffectRuntime";
import { formatFormulaTerms } from "./shared";
import {
  createHeldDescriptorForInventoryItem,
  getAdaptedItemWeapon,
  isItemShieldRecord
} from "./inventoryItems";
import { resolveWeaponBaseReference } from "../../utils/items/resolveWeaponBaseReference";
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
import { getHitDieMaximumForClass } from "./hitDice";
import { getExhaustionD20TestPenalty } from "./statusEntries";
import { createSourcedDescriptionEntries } from "./actionModalDescriptions";
export {
  getHitDiceDisplayForCharacter,
  getHitDiceRemainingForCharacter,
  getHitDieFormulaForClass
} from "./hitDice";

type WeaponAbilityRule = "strength" | "dexterity" | "finesse" | AbilityKey;

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
  cardTheme?: ACTION_CARD_THEME;
  attackKind: "weapon" | "unarmed";
  baseWeapon?: WEAPON_BASE | null;
  combatType?: WEAPON_COMBAT_TYPE | null;
  weaponTraining?: WEAPON_TRAINING | null;
  properties?: WEAPON_PROPERTY[];
  mastery?: WEAPON_MASTERY | null;
  economyType: EconomyType;
  actionCategory: ActionCategory;
  economyMultiCount?: number;
  damageLabel: string;
  damageFormula: string;
  damageBreakdownLabel?: string;
  rollDisplay: string;
  rollFormulaDisplay: string;
  ability: AbilityKey;
  abilityFormulaLabel?: string;
  cardBaseAbility: AbilityKey;
  abilityModifierBaseValue: number;
  abilityModifier: number;
  cardBaseAbilityModifier: number;
  abilityModifierBonusEntries: AbilityModifierBonusEntry[];
  attackBonusEntries?: Array<{
    label: string;
    value: number;
  }>;
  damageAbility?: AbilityKey;
  damageAbilityFormulaLabel?: string;
  damageAbilityModifierBaseValue?: number;
  damageAbilityModifier?: number;
  damageAbilityModifierBonusEntries?: AbilityModifierBonusEntry[];
  damageAbilityModifierSuppressionLabel?: string;
  proficiencyLabel: string;
  proficiencyBonus: number;
  totalModifier: number;
  indicators: FeatureIndicator[];
  damageBonusEntries: FeatureDamageBonus[];
  cardBonusLabels: string[];
  rollFormula: string;
  hasVersatileBonus: boolean;
  hasGreatWeaponFighting: boolean;
  hasMartialArtsDamageDie: boolean;
  hasBatteringRootsBonus: boolean;
  hasActiveMastery?: boolean;
  isBatteringRootsEligible?: boolean;
  isMagicWeapon?: boolean;
  drawerEyebrow?: string;
  description?: SpellDescriptionEntry[];
  descriptionAdditions?: SpellDescriptionEntry[][];
  facts?: FeatureActionFact[];
  details?: Array<{
    label: string;
    value: string;
    referenceTitle?: string;
    referenceKeywords?: string[];
  }>;
  inventoryStackId?: string;
  inventoryFeatureTags?: CharacterInventoryFeatureTag[];
};

const weaponActionsByCharacter = new WeakMap<Character, WeaponAction[]>();

export type InitiativeBreakdownEntry = {
  label: string;
  value: number;
  formula?: string;
  formulaMultiplier?: 1 | -1;
  abilityModifierSource?: AbilityKey;
  formulaSourceLabel?: string;
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

  if (abilityKeys.includes(amount as AbilityKey)) {
    return count === 1 ? amount : `${count} ${amount}`;
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
      const minimumLabel =
        typeof amount === "string" && !abilityKeys.includes(amount as AbilityKey)
          ? ` (min ${minimumPerDie})`
          : "";

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

      if (typeof amount !== "string" || abilityKeys.includes(amount as AbilityKey)) {
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

  if (abilityKeys.includes(amount as AbilityKey)) {
    return 0;
  }

  const parsedFaces = Number(String(amount).replace(/\D/g, ""));
  return Number.isFinite(parsedFaces) ? parsedFaces : 0;
}

function resolveAbilityDamageAmounts(
  damage: WeaponDamage,
  character: Pick<Character, "abilities" | "level" | "className" | "classFeatureState" | "feats"> &
    Partial<Pick<Character, "inventoryItems" | "statusEntries" | "subclassId">>
): WeaponDamage {
  return damage.map(([amount, damageType]) =>
    abilityKeys.includes(amount as AbilityKey)
      ? [getAbilityModifierForCharacter(character, amount as AbilityKey), damageType]
      : [amount, damageType]
  );
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
  return hasFeatForCharacter(character, FEATS.GREAT_WEAPON_FIGHTING);
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
    formulaDamageOverride?: WeaponDamage;
    abilityRuleOverride?: WeaponAbilityRule;
  }
): WeaponReference | null {
  const damage = options?.damageOverride ?? getSelectedWeaponDamage(weapon, options);
  const formulaDamage = options?.formulaDamageOverride ?? damage;
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
      ? formatWeaponDamageFormulaWithMinimum(formulaDamage, 3)
      : formatWeaponDamageFormula(formulaDamage),
    rollFormulaBase: applyGreatWeaponFighting
      ? formatWeaponDamageFormulaWithMinimum(formulaDamage, 3, { internal: true })
      : formatWeaponDamageFormula(formulaDamage),
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
    formulaDamageOverride?: WeaponDamage;
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
    formulaDamageOverride?: WeaponDamage;
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
      formulaDamageOverride: options?.formulaDamageOverride,
      abilityRuleOverride: options?.abilityRuleOverride
    }
  );
}

function resolveWeaponAbility(rule: WeaponAbilityRule, abilities: AbilityScores): AbilityKey {
  if (abilityKeys.includes(rule as AbilityKey)) {
    return rule as AbilityKey;
  }

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

function getAbilitySourcedFeatureBonusValue(
  character: Partial<
    Pick<
      Character,
      | "abilities"
      | "level"
      | "className"
      | "classFeatureState"
      | "feats"
      | "inventoryItems"
      | "statusEntries"
      | "subclassId"
    >
  >,
  bonus: {
    value?: number;
    abilityModifierSource?: AbilityKey;
    abilityModifierMultiplier?: 1 | -1;
    minimumValue?: number;
  },
  options?: {
    customTraitEffectInput?: CustomTraitBonusInput;
  }
): number {
  if (!bonus.abilityModifierSource) {
    return bonus.value ?? 0;
  }

  const sourceValue = getAbilityModifierForCharacter(character, bonus.abilityModifierSource, {
    customTraitEffectInput: options?.customTraitEffectInput
  });
  const clampedValue =
    typeof bonus.minimumValue === "number"
      ? Math.max(bonus.minimumValue, sourceValue)
      : sourceValue;

  return clampedValue * (bonus.abilityModifierMultiplier ?? 1);
}

function resolveFeatureDamageBonusEntry(
  character: Parameters<typeof getAbilitySourcedFeatureBonusValue>[0],
  entry: FeatureDamageBonus
): FeatureDamageBonus {
  if (!entry.abilityModifierSource || (entry.value ?? 0) !== 0) {
    return entry;
  }

  const value = getAbilitySourcedFeatureBonusValue(character, entry);

  return {
    ...entry,
    value,
    displayLabel: entry.formulaSourceLabel
      ? (formatCustomTraitBonusFormulaTerm({
          ...entry,
          value
        }) ?? entry.displayLabel)
      : entry.displayLabel
  };
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

  return formatFormulaTerms([baseExpression, ...formattedBonuses]);
}

function formatFeatureDamageBonusLabel(entry: FeatureDamageBonus): string | null {
  if (entry.displayLabel) {
    return entry.displayLabel;
  }

  const customFormulaLabel = formatCustomTraitBonusFormulaTerm({
    value: entry.value ?? 0,
    formula: entry.formula,
    formulaMultiplier: entry.formulaMultiplier,
    abilityModifierSource: entry.abilityModifierSource,
    formulaSourceLabel: entry.formulaSourceLabel
  });

  if (customFormulaLabel) {
    return customFormulaLabel;
  }

  if (entry.formula) {
    return entry.formula;
  }

  return null;
}

function formatFeatureDamageBonusFormula(entry: FeatureDamageBonus): string | null {
  return formatCustomTraitBonusRollFormulaTerm(entry) ?? entry.formula ?? null;
}

function isDuelingDamageBonusHandState(
  targetWeapon: HeldWeaponDescriptor,
  heldWeapons: HeldWeaponDescriptor[]
): boolean {
  return (
    heldWeapons[0]?.key === targetWeapon.key &&
    getWeaponHandSlots(targetWeapon) === 1 &&
    getHeldWeaponSlotCount(heldWeapons) === 1
  );
}

function getDuelingDamageBonusEntriesForWeaponAction(
  character: Pick<Character, "level"> & Partial<Pick<Character, "feats">>,
  context: {
    attackKind: "weapon" | "unarmed";
    combatType?: WEAPON_COMBAT_TYPE | null;
  },
  targetWeapon: HeldWeaponDescriptor,
  heldWeapons: HeldWeaponDescriptor[]
): FeatureDamageBonus[] {
  if (
    !hasFeatForCharacter(character, FEATS.DUELING) ||
    context.attackKind !== "weapon" ||
    context.combatType !== WEAPON_COMBAT_TYPE.MELEE ||
    !isDuelingDamageBonusHandState(targetWeapon, heldWeapons)
  ) {
    return [];
  }

  return [
    {
      label: "Dueling",
      value: 2,
      displayLabel: "2 Dueling"
    }
  ];
}

function getTrueStrikeDamageBonusEntriesForWeaponAction(
  character: Pick<Character, "level" | "statusEntries">,
  context: {
    attackKind: "weapon" | "unarmed";
  }
): FeatureDamageBonus[] {
  if (getTrueStrikeEconomyMultiCountForWeapon(character, context) === 0) {
    return [];
  }

  const formula = getTrueStrikeExtraRadiantDamageFormulaForLevel(character.level);

  return formula
    ? [
        {
          label: trueStrikeStatusValue,
          formula,
          displayLabel: `${formula} Radiant`,
          formulaSourceLabel: trueStrikeStatusValue
        }
      ]
    : [];
}

function getWeaponSpellCardBonusLabels(options: {
  trueStrikeEconomyMultiCount: number;
  hasShillelagh: boolean;
}): string[] {
  return [
    ...(options.trueStrikeEconomyMultiCount > 0 ? [trueStrikeStatusValue] : []),
    ...(options.hasShillelagh ? [shillelaghStatusValue] : [])
  ];
}

function getSpellDescriptionAddition(spellId: string): SpellDescriptionEntry[] {
  const spell = getSpellEntryById(spellId);

  return spell ? createSourcedDescriptionEntries(spell.name, spell.description) : [];
}

function getWeaponSpellDescriptionAdditions(options: {
  trueStrikeEconomyMultiCount: number;
  hasShillelagh: boolean;
}): SpellDescriptionEntry[][] {
  return [
    ...(options.trueStrikeEconomyMultiCount > 0
      ? [getSpellDescriptionAddition(trueStrikeSpellId)]
      : []),
    ...(options.hasShillelagh ? [getSpellDescriptionAddition(shillelaghSpellId)] : [])
  ].filter((section) => section.length > 0);
}

export function createWeaponAction(
  character: Pick<
    Character,
    "className" | "level" | "classFeatureState" | "statusEntries" | "subclassId"
  > &
    Partial<Pick<Character, "abilities" | "feats" | "roundTracker">>,
  options: {
    key: string;
    name: string;
    attackKind: "weapon" | "unarmed";
    baseWeapon?: WEAPON_BASE | null;
    combatType?: WEAPON_COMBAT_TYPE | null;
    weaponTraining?: WEAPON_TRAINING | null;
    properties?: WEAPON_PROPERTY[];
    mastery?: WEAPON_MASTERY | null;
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
    damageBonusEntries?: FeatureDamageBonus[];
    cardBonusLabels?: string[];
    description?: SpellDescriptionEntry[];
    descriptionAdditions?: SpellDescriptionEntry[][];
    economyType?: EconomyType;
    economyMultiCount?: number;
    hasVersatileBonus: boolean;
    hasGreatWeaponFighting: boolean;
    hasMartialArtsDamageDie?: boolean;
    hasActiveMastery?: boolean;
    isMagicWeapon?: boolean;
    skipFeatureDerivedLookups?: boolean;
    inventoryStackId?: string;
    inventoryFeatureTags?: CharacterInventoryFeatureTag[];
  }
): WeaponAction {
  const attackAbilityBreakdown =
    !options.skipFeatureDerivedLookups && character.abilities
      ? getAbilityModifierBreakdownForCharacter(character as Character, options.ability)
      : {
          baseValue: options.abilityModifier,
          bonusEntries: [] as AbilityModifierBonusEntry[],
          total: options.abilityModifier
        };
  const damageBonusEntries = [
    ...(options.damageBonusEntries ?? []),
    ...(options.skipFeatureDerivedLookups
      ? []
      : getDivineFavorWeaponDamageBonusesForCharacter(character)),
    ...(options.skipFeatureDerivedLookups
      ? []
      : getFeatureDamageBonusesForWeaponAction(character, {
          name: options.name,
          ability: options.ability,
          attackKind: options.attackKind,
          combatType: options.combatType ?? null
        }))
  ].map((entry) => resolveFeatureDamageBonusEntry(character, entry));
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
  const damageAbility = options.damageAbility ?? options.ability;
  const damageAbilityBreakdown =
    !options.skipFeatureDerivedLookups && character.abilities
      ? getAbilityModifierBreakdownForCharacter(character as Character, damageAbility)
      : {
          baseValue: options.damageAbilityModifier ?? options.abilityModifier,
          bonusEntries: [] as AbilityModifierBonusEntry[],
          total: options.damageAbilityModifier ?? options.abilityModifier
        };
  const damageAbilityModifier = damageAbilityBreakdown.total;
  const descriptionAdditions = [
    ...(options.descriptionAdditions ?? []),
    ...(!options.skipFeatureDerivedLookups && hasDivineFavorStatus(character.statusEntries)
      ? [getSpellDescriptionAddition(divineFavorSpellId)]
      : [])
  ].filter((section) => section.length > 0);
  const totalModifier = damageAbilityModifier + getDamageBonusTotal(damageBonusEntries);
  const indicators = options.skipFeatureDerivedLookups
    ? []
    : getWeaponAttackIndicatorsForCharacter(character, {
        attackKind: options.attackKind,
        combatType: options.combatType ?? null
      });
  const hasBatteringRootsBonus = options.skipFeatureDerivedLookups
    ? false
    : hasBatteringRootsBonusForCharacter(character, {
        attackKind: options.attackKind,
        combatType: options.combatType ?? null,
        properties: options.properties
      });
  const exhaustionPenalty = getExhaustionD20TestPenalty(character.statusEntries);
  const attackBonusEntries =
    exhaustionPenalty !== 0
      ? [
          {
            label: "Exhaustion",
            value: exhaustionPenalty
          }
        ]
      : [];
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
    baseWeapon: options.baseWeapon ?? null,
    combatType: options.combatType ?? null,
    weaponTraining: options.weaponTraining ?? null,
    properties: options.properties ?? [],
    mastery: options.mastery ?? null,
    economyType: options.economyType ?? ECONOMY_TYPE.ACTION,
    actionCategory: ACTION_CATEGORY.ATTACK,
    economyMultiCount: options.economyMultiCount,
    damageLabel,
    damageFormula,
    damageBreakdownLabel: options.damageBreakdownLabel,
    rollDisplay: createRollDisplay(damageFormula, totalModifier),
    rollFormulaDisplay: createRollFormula(damageFormula, totalModifier),
    ability: options.ability,
    cardBaseAbility: options.ability,
    abilityModifierBaseValue: attackAbilityBreakdown.baseValue,
    abilityModifier: attackAbilityBreakdown.total,
    cardBaseAbilityModifier: attackAbilityBreakdown.total,
    abilityModifierBonusEntries: attackAbilityBreakdown.bonusEntries,
    attackBonusEntries,
    damageAbility,
    damageAbilityModifierBaseValue: damageAbilityBreakdown.baseValue,
    damageAbilityModifier,
    damageAbilityModifierBonusEntries: damageAbilityBreakdown.bonusEntries,
    proficiencyLabel: options.proficiencyLabel,
    proficiencyBonus: options.proficiencyBonus,
    totalModifier,
    indicators,
    damageBonusEntries,
    cardBonusLabels: options.cardBonusLabels ?? [],
    rollFormula: createRollFormula(rollFormulaBase, totalModifier),
    hasVersatileBonus: options.hasVersatileBonus,
    hasGreatWeaponFighting: options.hasGreatWeaponFighting,
    hasMartialArtsDamageDie: Boolean(options.hasMartialArtsDamageDie),
    hasBatteringRootsBonus,
    hasActiveMastery: options.hasActiveMastery,
    isBatteringRootsEligible,
    isMagicWeapon: options.isMagicWeapon,
    description: options.description,
    descriptionAdditions,
    inventoryStackId: options.inventoryStackId,
    inventoryFeatureTags: options.inventoryFeatureTags
  };
}

export function getProficiencyBonus(level: number): number {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));
  return Math.floor((normalizedLevel - 1) / 4) + 2;
}

export function getMainAbilityForClass(className: string): AbilityKey | null {
  return getPrimaryAbilityForClass(className);
}

export function getAutomaticMaxHitPointsForCharacter(
  character: Pick<Character, "className" | "level" | "abilities" | "classFeatureState"> &
    Partial<Pick<Character, "background" | "backgroundChoices" | "classRules" | "customClass">>
): number {
  const hitDieMaximum = getHitDieMaximumForClass(
    character.className,
    character.customClass,
    character.classRules
  );
  const hitDieAverage = Math.floor(hitDieMaximum / 2) + 1;
  const constitutionModifier = getAbilityModifierForCharacter(character, "CON");
  const normalizedLevel = Math.max(1, Math.floor(character.level));
  const computedHitPoints =
    hitDieMaximum +
    constitutionModifier +
    (normalizedLevel - 1) * (hitDieAverage + constitutionModifier);

  return Math.max(1, Math.floor(computedHitPoints));
}

export function getSavingThrowProficienciesForClass(className: string): AbilityKey[] {
  return getSavingThrowAbilityKeysForClass(className);
}

export function getInitiativeBreakdownForCharacter(character: Character): InitiativeBreakdown {
  const customTraitEffectInput = getCharacterCustomTraitEffectInput(character);
  const dexterityModifierBreakdown = getAbilityModifierBreakdownForCharacter(character, "DEX", {
    customTraitEffectInput
  });
  const entries: InitiativeBreakdownEntry[] = [
    {
      label: "DEX",
      value: dexterityModifierBreakdown.baseValue
    },
    ...dexterityModifierBreakdown.bonusEntries
  ];
  const initiativeBonuses = [
    ...getInitiativeBonusesForCharacter(character, {
      customTraitEffectInput
    }),
    ...getGiftOfAlacrityInitiativeBonusesForCharacter(character)
  ];

  initiativeBonuses.forEach((bonus) => {
    const value = getAbilitySourcedFeatureBonusValue(character, bonus, {
      customTraitEffectInput
    });
    const formula = bonus.formula?.trim();

    if (value === 0 && !formula) {
      return;
    }

    entries.push({
      label: bonus.label,
      value,
      formula: bonus.formula,
      formulaMultiplier: bonus.formulaMultiplier,
      abilityModifierSource: bonus.abilityModifierSource,
      formulaSourceLabel: bonus.formulaSourceLabel
    });
  });

  if (hasFeatForCharacter(character, FEATS.ALERT)) {
    entries.push({
      label: "Proficiency Bonus (Alert)",
      value: getProficiencyBonus(character.level)
    });
  }

  const exhaustionPenalty = getExhaustionD20TestPenalty(character.statusEntries);

  if (exhaustionPenalty !== 0) {
    entries.push({
      label: "Exhaustion",
      value: exhaustionPenalty
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

function getSkillModifierForCharacter(
  character: Character,
  skill: SkillName,
  options?: {
    customTraitEffectInput?: CustomTraitBonusInput;
  }
): number {
  const proficiencyBonus = getProficiencyBonus(character.level);
  const skillProficiency = getSkillProficiencyForName(skill);
  const skillLevel = skillProficiency
    ? getSkillLevelFromEntries(character.skillProficiencies, skillProficiency)
    : PROF_LEVEL.NONE;
  const proficiencyMultiplier =
    skillLevel === PROF_LEVEL.EXPERT ? 2 : skillLevel === PROF_LEVEL.PROFICIENT ? 1 : 0;
  const defaultAbility =
    skillGroupsByAbility.find((group) => group.skills.includes(skill))?.ability ?? "WIS";
  const skillBonuses = getSkillBonusesForCharacter(
    character,
    skill,
    skillLevel,
    {
      customTraitEffectInput: options?.customTraitEffectInput
    }
  );
  const replacementEntry = skillBonuses.find(
    (entry) => entry.replacesBaseAbility && entry.abilityModifierSource
  );
  const abilityModifier = getAbilityModifierForCharacter(
    character,
    replacementEntry?.abilityModifierSource ?? defaultAbility,
    {
      customTraitEffectInput: options?.customTraitEffectInput
    }
  );
  const featureBonus = skillBonuses.reduce((total, bonus) => {
    if (bonus.replacesBaseAbility && bonus.abilityModifierSource) {
      return total;
    }

    if (bonus.abilityModifierSource) {
      return total + getAbilitySourcedFeatureBonusValue(character, bonus, {
        customTraitEffectInput: options?.customTraitEffectInput
      });
    }

    return total + (bonus.value ?? 0);
  }, 0);

  return abilityModifier + proficiencyMultiplier * proficiencyBonus + featureBonus;
}

export function getPassivePerceptionForCharacter(character: Character): number {
  const customTraitEffectInput = getCharacterCustomTraitEffectInput(character);

  return (
    10 +
    getSkillModifierForCharacter(character, SKILL.PERCEPTION, { customTraitEffectInput }) +
    getCustomTraitPassivePerceptionBonuses(customTraitEffectInput).reduce(
      (sum, entry) =>
        sum +
        getAbilitySourcedFeatureBonusValue(character, entry, {
          customTraitEffectInput
        }),
      0
    )
  );
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
  const abilityModifier = getAbilityModifierForCharacter(character, ability);
  const damageAbility = unarmedStrikeConfig?.damageAbility ?? ability;
  const damageAbilityModifier = getAbilityModifierForCharacter(character, damageAbility);
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
      mastery: null,
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

function createWeaponActionsForCharacter(character: Character): WeaponAction[] {
  const proficiencyBonus = getProficiencyBonus(character.level);
  const effectiveAbilityScores = getAbilityScoresForCharacter(character);
  const hasGreatWeaponFighting = hasGreatWeaponFightingFeat(character);
  const equipmentRuntime = getEquipmentRuntimeForCharacter(character);
  const heldCustomWeapons = getResolvedCustomLoadoutEntries(character.customEquipment).filter(
    (entry): entry is ResolvedCustomWeaponEntry =>
      entry.category === ENTRY_CATEGORIES.WEAPONS && entry.onHand
  );
  const heldInventoryItems = equipmentRuntime.heldInventoryCopies;
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
  const heldInventoryWeaponDescriptors = equipmentRuntime.heldInventoryDescriptors;
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

    const weaponDescriptor = {
      key: `codex-${equipmentItem.name}`,
      properties: weaponEntry.properties,
      versatileDamage: weaponEntry.versatileDamage
    };
    const useVersatileDamage = hasVersatileHandBonus(weaponDescriptor, heldWeaponDescriptors);
    const baseWeapon = equipmentDefinition.baseWeapon ?? null;
    const selectedDamage = getSelectedWeaponDamage(weaponEntry, { useVersatileDamage });
    const weaponSpellContext = {
      attackKind: "weapon" as const,
      baseWeapon,
      combatType: weaponEntry.type.combat
    };
    const trueStrikeAbility = getTrueStrikeSpellcastingAbilityForWeapon(
      character,
      weaponSpellContext
    );
    const trueStrikeDamageAdjustment = getTrueStrikeDamageAdjustmentForWeapon(
      character,
      weaponSpellContext,
      selectedDamage
    );
    const trueStrikeEconomyMultiCount = getTrueStrikeEconomyMultiCountForWeapon(
      character,
      weaponSpellContext
    );
    const shillelaghAbility = getShillelaghSpellcastingAbilityForWeapon(
      character,
      weaponSpellContext
    );
    const shillelaghDamageAdjustment = getShillelaghDamageAdjustmentForWeapon(
      character,
      weaponSpellContext,
      trueStrikeDamageAdjustment?.damage ?? selectedDamage
    );
    const isEligibleMonkWeapon = monkMartialArtsActive && isMonkWeapon(weaponEntry);
    const monkDamageAdjustment =
      isEligibleMonkWeapon && monkMartialArtsDie
        ? applyMartialArtsDamageDie(
            shillelaghDamageAdjustment?.damage ??
              trueStrikeDamageAdjustment?.damage ??
              selectedDamage,
            monkMartialArtsDie
          )
        : null;
    const weaponReference = getWeaponReference(equipmentItem.name, {
      useVersatileDamage,
      applyGreatWeaponFighting: hasGreatWeaponFighting,
      damageOverride:
        monkDamageAdjustment?.damage ??
        shillelaghDamageAdjustment?.damage ??
        trueStrikeDamageAdjustment?.damage,
      abilityRuleOverride:
        trueStrikeAbility ?? shillelaghAbility ?? (isEligibleMonkWeapon ? "finesse" : undefined)
    });

    if (!weaponReference) {
      return actions;
    }

    const ability = resolveWeaponAbility(weaponReference.abilityRule, effectiveAbilityScores);
    const abilityModifier = getAbilityModifierForCharacter(character, ability);
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
        baseWeapon,
        combatType: weaponEntry.type.combat,
        weaponTraining: weaponEntry.type.training,
        properties: weaponEntry.properties,
        mastery: weaponEntry.mastery,
        damageLabel: weaponReference.damageLabel,
        damageFormula: weaponReference.damageFormula,
        rollFormulaBase: weaponReference.rollFormulaBase,
        ability,
        abilityModifier,
        proficiencyLabel,
        proficiencyBonus: appliedProficiencyBonus,
        damageBonusEntries: [
          ...getDuelingDamageBonusEntriesForWeaponAction(
            character,
            {
              attackKind: "weapon",
              combatType: weaponEntry.type.combat
            },
            weaponDescriptor,
            heldWeaponDescriptors
          ),
          ...getTrueStrikeDamageBonusEntriesForWeaponAction(character, weaponSpellContext)
        ],
        cardBonusLabels: getWeaponSpellCardBonusLabels({
          trueStrikeEconomyMultiCount,
          hasShillelagh: shillelaghAbility !== null || shillelaghDamageAdjustment?.applied === true
        }),
        descriptionAdditions: getWeaponSpellDescriptionAdditions({
          trueStrikeEconomyMultiCount,
          hasShillelagh: shillelaghAbility !== null || shillelaghDamageAdjustment?.applied === true
        }),
        economyMultiCount: trueStrikeEconomyMultiCount,
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
    const selectedDamage = getSelectedWeaponDamage(weaponEntry, { useVersatileDamage });
    const weaponSpellContext = {
      attackKind: "weapon" as const,
      baseWeapon: weaponEntry.baseWeapon,
      combatType: weaponEntry.type.combat
    };
    const trueStrikeAbility = getTrueStrikeSpellcastingAbilityForWeapon(
      character,
      weaponSpellContext
    );
    const trueStrikeDamageAdjustment = getTrueStrikeDamageAdjustmentForWeapon(
      character,
      weaponSpellContext,
      selectedDamage
    );
    const trueStrikeEconomyMultiCount = getTrueStrikeEconomyMultiCountForWeapon(
      character,
      weaponSpellContext
    );
    const shillelaghAbility = getShillelaghSpellcastingAbilityForWeapon(
      character,
      weaponSpellContext
    );
    const shillelaghDamageAdjustment = getShillelaghDamageAdjustmentForWeapon(
      character,
      weaponSpellContext,
      trueStrikeDamageAdjustment?.damage ?? selectedDamage
    );
    const monkDamageAdjustment =
      monkMartialArtsActive && monkMartialArtsDie && isMonkWeapon(weaponEntry)
        ? applyMartialArtsDamageDie(
            shillelaghDamageAdjustment?.damage ??
              trueStrikeDamageAdjustment?.damage ??
              selectedDamage,
            monkMartialArtsDie
          )
        : null;
    const weaponReference = getWeaponReferenceFromEntry(weaponEntry, {
      useVersatileDamage,
      applyGreatWeaponFighting: hasGreatWeaponFighting,
      damageOverride:
        monkDamageAdjustment?.damage ??
        shillelaghDamageAdjustment?.damage ??
        trueStrikeDamageAdjustment?.damage,
      abilityRuleOverride:
        trueStrikeAbility ??
        shillelaghAbility ??
        (monkMartialArtsActive && isMonkWeapon(weaponEntry) ? "finesse" : undefined)
    });

    if (!weaponReference) {
      return actions;
    }

    const ability = resolveWeaponAbility(weaponReference.abilityRule, effectiveAbilityScores);
    const abilityModifier = getAbilityModifierForCharacter(character, ability);
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
        baseWeapon: weaponEntry.baseWeapon,
        combatType: weaponEntry.type.combat,
        weaponTraining: weaponEntry.type.training,
        properties: weaponEntry.properties,
        mastery: weaponEntry.mastery,
        damageLabel: weaponReference.damageLabel,
        damageFormula: weaponReference.damageFormula,
        rollFormulaBase: weaponReference.rollFormulaBase,
        ability,
        abilityModifier,
        proficiencyLabel,
        proficiencyBonus: appliedProficiencyBonus,
        damageBonusEntries: [
          ...getDuelingDamageBonusEntriesForWeaponAction(
            character,
            {
              attackKind: "weapon",
              combatType: weaponEntry.type.combat
            },
            weaponDescriptor,
            heldWeaponDescriptors
          ),
          ...getTrueStrikeDamageBonusEntriesForWeaponAction(character, weaponSpellContext)
        ],
        cardBonusLabels: getWeaponSpellCardBonusLabels({
          trueStrikeEconomyMultiCount,
          hasShillelagh: shillelaghAbility !== null || shillelaghDamageAdjustment?.applied === true
        }),
        descriptionAdditions: getWeaponSpellDescriptionAdditions({
          trueStrikeEconomyMultiCount,
          hasShillelagh: shillelaghAbility !== null || shillelaghDamageAdjustment?.applied === true
        }),
        economyMultiCount: trueStrikeEconomyMultiCount,
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
      const baseWeapon = resolveWeaponBaseReference({
        name: inventoryItem.item.weapon?.name ?? inventoryItem.item.name,
        key: inventoryItem.item.key
      });
      const weaponSpellContext = {
        attackKind: "weapon" as const,
        baseWeapon,
        combatType: weaponType?.combat ?? null
      };
      const trueStrikeAbility = getTrueStrikeSpellcastingAbilityForWeapon(
        character,
        weaponSpellContext
      );
      const trueStrikeDamageAdjustment = baseDamage
        ? getTrueStrikeDamageAdjustmentForWeapon(character, weaponSpellContext, baseDamage)
        : null;
      const trueStrikeEconomyMultiCount = getTrueStrikeEconomyMultiCountForWeapon(
        character,
        weaponSpellContext
      );
      const shillelaghAbility = getShillelaghSpellcastingAbilityForWeapon(
        character,
        weaponSpellContext
      );
      const shillelaghDamageAdjustment = baseDamage
        ? getShillelaghDamageAdjustmentForWeapon(
            character,
            weaponSpellContext,
            trueStrikeDamageAdjustment?.damage ?? baseDamage
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
          ? applyMartialArtsDamageDie(
              shillelaghDamageAdjustment?.damage ??
                trueStrikeDamageAdjustment?.damage ??
                baseDamage,
              monkMartialArtsDie
            )
          : null;
      const formulaDamage =
        monkDamageAdjustment?.damage ??
        shillelaghDamageAdjustment?.damage ??
        trueStrikeDamageAdjustment?.damage ??
        baseDamage;
      const weaponReference = getWeaponReferenceFromItemRecord(inventoryItem.item, {
        useVersatileDamage,
        applyGreatWeaponFighting: hasGreatWeaponFighting,
        damageOverride:
          monkDamageAdjustment?.damage ??
          shillelaghDamageAdjustment?.damage ??
          trueStrikeDamageAdjustment?.damage,
        formulaDamageOverride: formulaDamage
          ? resolveAbilityDamageAmounts(formulaDamage, character)
          : undefined,
        abilityRuleOverride:
          trueStrikeAbility ?? shillelaghAbility ?? (isEligibleMonkWeapon ? "finesse" : undefined)
      });

      if (!adaptedWeapon || !weaponType || !weaponReference) {
        return actions;
      }

      const ability = resolveWeaponAbility(weaponReference.abilityRule, effectiveAbilityScores);
      const abilityModifier = getAbilityModifierForCharacter(character, ability);
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
          baseWeapon,
          combatType: weaponType.combat,
          weaponTraining: weaponType.training,
          properties: weaponProperties,
          mastery: adaptedWeapon.mastery,
          damageLabel: weaponReference.damageLabel,
          damageFormula: weaponReference.damageFormula,
          rollFormulaBase: weaponReference.rollFormulaBase,
          ability,
          abilityModifier,
          proficiencyLabel,
          proficiencyBonus: appliedProficiencyBonus,
          damageBonusEntries: [
            ...(weaponDescriptor
              ? getDuelingDamageBonusEntriesForWeaponAction(
                  character,
                  {
                    attackKind: "weapon",
                    combatType: weaponType.combat
                  },
                  weaponDescriptor,
                  heldWeaponDescriptors
                )
              : []),
            ...getTrueStrikeDamageBonusEntriesForWeaponAction(character, weaponSpellContext)
          ],
          cardBonusLabels: getWeaponSpellCardBonusLabels({
            trueStrikeEconomyMultiCount,
            hasShillelagh:
              shillelaghAbility !== null || shillelaghDamageAdjustment?.applied === true
          }),
          descriptionAdditions: getWeaponSpellDescriptionAdditions({
            trueStrikeEconomyMultiCount,
            hasShillelagh:
              shillelaghAbility !== null || shillelaghDamageAdjustment?.applied === true
          }),
          economyMultiCount: trueStrikeEconomyMultiCount,
          hasVersatileBonus: weaponReference.hasVersatileBonus,
          hasGreatWeaponFighting: weaponReference.hasGreatWeaponFighting,
          hasMartialArtsDamageDie: Boolean(monkDamageAdjustment?.applied),
          isMagicWeapon: inventoryItem.item.is_magic_item === true,
          inventoryStackId: inventoryItem.stackId,
          inventoryFeatureTags: inventoryItem.featureTags
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

export function getWeaponActionsForCharacter(character: Character): WeaponAction[] {
  const cachedActions = weaponActionsByCharacter.get(character);

  if (cachedActions) {
    return cachedActions;
  }

  const weaponActions = measureCharacterRuntime("character-sheet:weapon-actions", () =>
    createWeaponActionsForCharacter(character)
  );
  weaponActionsByCharacter.set(character, weaponActions);
  return weaponActions;
}
