import {
  ACTION_TYPE,
  ABILITY_TYPES,
  DAMAGE_TYPE,
  DICE,
  DICE_TYPES,
  DURATION,
  SPELL_COMPONENT,
  TOOL_PROFICIENCIES,
  WEAPON_PROPERTY,
  type SpellEntry,
  type SpellCastingTimePart,
  type SpellDurationPart,
  type EquipmentCost,
  type DivinityEntry,
  type DivinityValue,
  type SpellHealing,
  type SpellHealingAmount,
  type WeaponDamage,
  type WeaponDamageAmount,
  type WeaponDamageType,
  type WEAPON_BASE,
  type WeaponEntry,
  type WeaponRange,
  type WeaponType
} from "../../codex/entries";

const ALWAYS_UPPERCASE_LABELS = new Set<string>([
  ...Object.values(ABILITY_TYPES),
  ...Object.values(DICE_TYPES),
  ...Object.values(DICE)
]);

const SPECIAL_LABELS: Record<string, string> = {
  [ACTION_TYPE.ACTION]: "1 action",
  [ACTION_TYPE.BONUS_ACTION]: "1 bonus action",
  [ACTION_TYPE.REACTION]: "1 reaction",
  [ACTION_TYPE.MINUTE]: "1 minute",
  [ACTION_TYPE.TEN_MINUTES]: "10 minutes",
  [ACTION_TYPE.HOUR]: "1 hour",
  [ACTION_TYPE.EIGHT_HOURS]: "8 hours",
  [ACTION_TYPE.TWELVE_HOURS]: "12 hours",
  [ACTION_TYPE.TWENTY_FOUR_HOURS]: "24 hours",
  [TOOL_PROFICIENCIES.THIEVES_TOOLKIT]: "Thieve's Toolkit",
  [TOOL_PROFICIENCIES.SMITHS_TOOLKIT]: "Smith's Toolkit",
  [TOOL_PROFICIENCIES.DISGUIDE_KIT]: "Disguide Kit",
  [TOOL_PROFICIENCIES.DISARM_KIT]: "Disarm Kit",
  [WEAPON_PROPERTY.TWO_HANDED]: "Two-Handed"
};

export function formatCodexLabel(value: string): string {
  if (value in SPECIAL_LABELS) {
    return SPECIAL_LABELS[value];
  }

  if (ALWAYS_UPPERCASE_LABELS.has(value)) {
    return value;
  }

  return value
    .toLowerCase()
    .split("_")
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}

export function formatCodexList(values: string[]): string {
  return values.map((value) => formatCodexLabel(value)).join(", ");
}

export function formatSpellLevelLabel(level: number): string {
  return level === 0 ? "Cantrip" : `Level ${level}`;
}

export function formatSpellSubtitle(spell: Pick<SpellEntry, "magicSchool" | "spellLevel">): string {
  return `${formatCodexLabel(spell.magicSchool)} ${formatSpellLevelLabel(spell.spellLevel).toLowerCase()}`;
}

export function formatSpellComponents(components: SPELL_COMPONENT[]): string {
  if (components.length === 0) {
    return "None";
  }

  return components.join(", ");
}

function isCastingTimeConnector(part: string): boolean {
  const normalizedPart = part.trim().toLowerCase();
  return normalizedPart === "or" || normalizedPart === "and";
}

function formatSpellCastingTimePart(part: SpellCastingTimePart): string {
  return typeof part === "string" ? part.trim() : formatCodexLabel(part);
}

function joinSpellCastingTimeParts(parts: string[]): string {
  return parts.reduce((result, part) => {
    const normalizedPart = part.trim();

    if (!normalizedPart) {
      return result;
    }

    if (!result) {
      return normalizedPart;
    }

    if (isCastingTimeConnector(normalizedPart)) {
      return `${result} ${normalizedPart}`;
    }

    if (/(?:\sor|\sand)$/i.test(result)) {
      return `${result} ${normalizedPart}`;
    }

    if (/^[,;:.]/.test(normalizedPart)) {
      return `${result}${normalizedPart}`;
    }

    return `${result}, ${normalizedPart}`;
  }, "");
}

export function formatSpellCastingTime(castingTime: SpellCastingTimePart[]): string {
  return joinSpellCastingTimeParts(castingTime.map((part) => formatSpellCastingTimePart(part)));
}

export function formatSpellCastingTimeSummary(castingTime: SpellCastingTimePart[]): string {
  const summaryParts = castingTime.filter(
    (part): part is Exclude<SpellCastingTimePart, string> => typeof part !== "string"
  );

  if (summaryParts.length === 0) {
    return formatSpellCastingTime(castingTime.slice(0, 1));
  }

  return summaryParts.map((part) => formatSpellCastingTimePart(part)).join(" / ");
}

export function formatSpellDurationPart(part: SpellDurationPart): string {
  if (part === DURATION.CONCENTRATION) {
    return "Concentration";
  }

  return part.trim();
}

export function formatSpellDuration(duration: SpellDurationPart[]): string {
  return duration
    .map((part) => formatSpellDurationPart(part))
    .filter((part) => part.length > 0)
    .join(", ");
}

export function getSpellDurationDisplayParts(duration: SpellDurationPart[]): {
  hasConcentration: boolean;
  detailText: string;
} {
  return {
    hasConcentration: duration.includes(DURATION.CONCENTRATION),
    detailText: duration
      .filter((part) => part !== DURATION.CONCENTRATION)
      .map((part) => formatSpellDurationPart(part))
      .filter((part) => part.length > 0)
      .join(", ")
  };
}

function isAbilityDamageAmount(amount: WeaponDamageAmount): boolean {
  return (
    typeof amount === "string" &&
    Object.values(ABILITY_TYPES).includes(amount as ABILITY_TYPES)
  );
}

function formatGroupedWeaponDamageAmount(amount: WeaponDamageAmount, count: number): string {
  if (typeof amount === "number") {
    return `${amount * count}`;
  }

  if (isAbilityDamageAmount(amount)) {
    return count === 1 ? amount : `${count} ${amount}`;
  }

  return `${count}${String(amount).toLowerCase()}`;
}

function normalizeWeaponDamageTypes(damageType: WeaponDamageType): DAMAGE_TYPE[] {
  return Array.isArray(damageType) ? damageType : [damageType];
}

function formatGroupedAmount(amount: WeaponDamageAmount, count: number): string {
  if (typeof amount === "number") {
    return `${amount * count}`;
  }

  if (isAbilityDamageAmount(amount)) {
    return count === 1 ? amount : `${count} ${amount}`;
  }

  return `${count}${String(amount).toLowerCase()}`;
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

function isSpellHealingLabel(healing: SpellHealing): healing is { label: string } {
  return !Array.isArray(healing);
}

function formatSpellHealingAmount(
  amount: SpellHealingAmount,
  count: number,
  spellcastingAbilityLabel: string,
  spellcastingAbilityModifier?: number | null
): string {
  if (amount === "spellcastingAbility") {
    if (typeof spellcastingAbilityModifier === "number") {
      const value = spellcastingAbilityModifier * count;
      return `${value} ${spellcastingAbilityLabel}`;
    }

    return count === 1 ? spellcastingAbilityLabel : `${count} ${spellcastingAbilityLabel}`;
  }

  return formatGroupedAmount(amount, count);
}

function joinHealingParts(parts: string[]): string {
  return parts.reduce((result, part) => {
    if (!result) {
      return part;
    }

    if (part.startsWith("-")) {
      return `${result} - ${part.slice(1).trim()}`;
    }

    return `${result} + ${part}`;
  }, "");
}

function collapseSpellHealingAmounts(healing: SpellHealingAmount[]) {
  const countsByKey = new Map<string, number>();
  const orderedAmounts: SpellHealingAmount[] = [];

  healing.forEach((amount) => {
    const key = String(amount);

    if (!countsByKey.has(key)) {
      orderedAmounts.push(amount);
      countsByKey.set(key, 0);
    }

    countsByKey.set(key, (countsByKey.get(key) ?? 0) + 1);
  });

  return orderedAmounts.map((amount) => ({
    amount,
    count: countsByKey.get(String(amount)) ?? 1
  }));
}

function formatRangeLabel(range: WeaponRange): string {
  const baseRange = `Range ${range.normal}/${range.long}`;
  return range.ammunition ? `${baseRange}; ${range.ammunition}` : baseRange;
}

export function formatWeaponDamage(damage: WeaponDamage): string {
  if (damage.length === 0) {
    return "None";
  }

  return collapseWeaponDamage(damage)
    .map(
      ({ amount, count, damageType }) =>
        `${formatGroupedWeaponDamageAmount(amount, count)} ${formatWeaponDamageType(damageType)}`
    )
    .join(" + ");
}

export function formatWeaponDamageFormula(damage: WeaponDamage): string {
  if (damage.length === 0) {
    return "0";
  }

  return collapseWeaponDamage(damage)
    .map(({ amount, count }) => formatGroupedWeaponDamageAmount(amount, count))
    .join(" + ");
}

export function formatSpellHealing(
  healing: SpellHealing,
  options: { spellcastingAbilityLabel?: string; spellcastingAbilityModifier?: number | null } = {}
): string {
  if (isSpellHealingLabel(healing)) {
    return healing.label;
  }

  if (healing.length === 0) {
    return "None";
  }

  const spellcastingAbilityLabel = options.spellcastingAbilityLabel ?? "Spell MOD";

  return joinHealingParts(
    collapseSpellHealingAmounts(healing).map(({ amount, count }) =>
      formatSpellHealingAmount(
        amount,
        count,
        spellcastingAbilityLabel,
        options.spellcastingAbilityModifier
      )
    )
  );
}

export function formatSpellHealingFormula(healing: SpellHealing): string {
  if (isSpellHealingLabel(healing) || healing.length === 0) {
    return "";
  }

  return collapseSpellHealingAmounts(healing)
    .map(({ amount, count }) =>
      amount === "spellcastingAbility" ? "MOD" : formatGroupedAmount(amount, count)
    )
    .join(" + ");
}

export function formatDivinityValueFormula(value: DivinityValue): string {
  const countsByAmount = new Map<string, number>();
  const orderedAmounts: WeaponDamageAmount[] = [];

  value.amounts.forEach((amount) => {
    const key = String(amount);

    if (!countsByAmount.has(key)) {
      orderedAmounts.push(amount);
      countsByAmount.set(key, 0);
    }

    countsByAmount.set(key, (countsByAmount.get(key) ?? 0) + 1);
  });

  return orderedAmounts
    .map((amount) => formatGroupedAmount(amount, countsByAmount.get(String(amount)) ?? 1))
    .join(" + ");
}

export function formatDivinityValue(value: DivinityValue): string {
  const baseFormula = formatDivinityValueFormula(value);

  if (!value.damageTypes || value.damageTypes.length === 0) {
    return baseFormula;
  }

  return `${baseFormula} ${value.damageTypes.map((type) => formatCodexLabel(type)).join("/")}`;
}

export function formatDivinitySubtitle(divinity: Pick<DivinityEntry, "sourceFeature">): string {
  return formatCodexLabel(divinity.sourceFeature);
}

export function formatWeaponType(weaponType: WeaponType): string {
  return `${formatCodexLabel(weaponType.training)} ${formatCodexLabel(weaponType.combat).toLowerCase()}`;
}

export function formatWeaponTypeWithBaseWeapon(
  weaponType: WeaponType,
  baseWeapon?: WEAPON_BASE | null
): string {
  const typeLabel = formatWeaponType(weaponType);

  return baseWeapon ? `${typeLabel} (${formatCodexLabel(baseWeapon)})` : typeLabel;
}

export function formatWeaponProperties(
  weapon: Pick<WeaponEntry, "properties" | "range" | "versatileDamage" | "propertyNotes">
): string {
  const visibleProperties: WEAPON_PROPERTY[] = weapon.properties.filter(
    (property) => property !== WEAPON_PROPERTY.RANGE
  );

  if (
    weapon.properties.includes(WEAPON_PROPERTY.RANGE) &&
    !weapon.properties.some(
      (property) => property === WEAPON_PROPERTY.THROWN || property === WEAPON_PROPERTY.AMMUNITION
    )
  ) {
    visibleProperties.push(WEAPON_PROPERTY.RANGE);
  }

  if (visibleProperties.length === 0) {
    return "None";
  }

  return visibleProperties
    .map((property) => {
      if (property === WEAPON_PROPERTY.THROWN && weapon.range) {
        return `Thrown (${formatRangeLabel(weapon.range)})`;
      }

      if (property === WEAPON_PROPERTY.AMMUNITION && weapon.range) {
        return `Ammunition (${formatRangeLabel(weapon.range)})`;
      }

      if (property === WEAPON_PROPERTY.RANGE && weapon.range) {
        return formatRangeLabel(weapon.range);
      }

      if (property === WEAPON_PROPERTY.VERSATILE && weapon.versatileDamage) {
        return `Versatile (${formatWeaponDamageFormula(weapon.versatileDamage)})`;
      }

      const label = formatCodexLabel(property);
      const note = weapon.propertyNotes?.[property];
      return note ? `${label} (${note})` : label;
    })
    .join(", ");
}

export function formatEquipmentWeight(weight: number | null): string {
  if (weight === null) {
    return "-";
  }

  const normalizedWeight = Number.isInteger(weight)
    ? `${weight}`
    : `${weight}`.replace(/\.0+$/, "");
  return `${normalizedWeight} lb.`;
}

export function formatEquipmentCost(cost: EquipmentCost): string {
  return `${cost.amount} ${cost.currency}`;
}

export const formatWeaponWeight = formatEquipmentWeight;
export const formatWeaponCost = formatEquipmentCost;

export function truncateCodexText(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trimEnd()}...`;
}
