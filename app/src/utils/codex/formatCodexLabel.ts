import {
  ACTION_TYPE,
  ABILITY_TYPES,
  DICE,
  DICE_TYPES,
  SPELL_COMPONENT,
  TOOL_PROFICIENCIES,
  WEAPON_PROPERTY,
  type SpellEntry,
  type SpellCastingTimePart,
  type EquipmentCost,
  type WeaponDamage,
  type WeaponDamageAmount,
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
  const summaryParts = castingTime.filter((part): part is Exclude<SpellCastingTimePart, string> =>
    typeof part !== "string"
  );

  if (summaryParts.length === 0) {
    return formatSpellCastingTime(castingTime.slice(0, 1));
  }

  return summaryParts.map((part) => formatSpellCastingTimePart(part)).join(" / ");
}

function formatGroupedWeaponDamageAmount(amount: WeaponDamageAmount, count: number): string {
  if (typeof amount === "number") {
    return `${amount * count}`;
  }

  return `${count}${String(amount).toLowerCase()}`;
}

function collapseWeaponDamage(damage: WeaponDamage) {
  const countsByKey = new Map<string, number>();
  const orderedEntries: WeaponDamage = [];

  damage.forEach(([amount, damageType]) => {
    const key = `${String(amount)}:${damageType}`;

    if (!countsByKey.has(key)) {
      orderedEntries.push([amount, damageType]);
      countsByKey.set(key, 0);
    }

    countsByKey.set(key, (countsByKey.get(key) ?? 0) + 1);
  });

  return orderedEntries.map(([amount, damageType]) => ({
    amount,
    count: countsByKey.get(`${String(amount)}:${damageType}`) ?? 1,
    damageType
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
        `${formatGroupedWeaponDamageAmount(amount, count)} ${formatCodexLabel(damageType)}`
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

export function formatWeaponType(weaponType: WeaponType): string {
  return `${formatCodexLabel(weaponType.training)} ${formatCodexLabel(weaponType.combat).toLowerCase()}`;
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
