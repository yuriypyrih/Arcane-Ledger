import type { Character, CharacterStatOverrides, CharacterStatOverrideValue } from "../../types";

export const statOverrideKeys = [
  "armorClass",
  "initiative",
  "passivePerception",
  "proficiencyBonus",
  "speed"
] as const;
export type StatOverrideKey = (typeof statOverrideKeys)[number];
export const movementOverrideKeys = ["walk", "climb", "swim", "fly", "burrow"] as const;
export type MovementOverrideKey = (typeof movementOverrideKeys)[number];
export type NumericStatOverrideKey = Exclude<StatOverrideKey, "speed">;

export const statOverrideLabels: Record<StatOverrideKey, string> = {
  armorClass: "Armor Class",
  initiative: "Initiative",
  passivePerception: "Passive Perception",
  proficiencyBonus: "Proficiency Bonus",
  speed: "Speed"
};
export const movementOverrideLabels: Record<MovementOverrideKey, string> = {
  walk: "Walk",
  climb: "Climb",
  swim: "Swim",
  fly: "Fly",
  burrow: "Burrow"
};

export function getStatOverrideMaximum(key: StatOverrideKey): number {
  return key === "speed" ? 300 : key === "proficiencyBonus" ? 10 : 30;
}

export function isValidStatOverrideValue(value: unknown, key: StatOverrideKey): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= getStatOverrideMaximum(key)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function normalizeStatOverrides(value: unknown): CharacterStatOverrides | undefined {
  if (!isRecord(value)) return undefined;
  const result: CharacterStatOverrides = {};
  for (const key of statOverrideKeys) {
    const entry = value[key];
    if (!isRecord(entry) || typeof entry.enabled !== "boolean") continue;
    if (key === "speed") {
      if (!isRecord(entry.values)) continue;
      const values: NonNullable<CharacterStatOverrides["speed"]>["values"] = {};
      for (const movement of movementOverrideKeys) {
        if (isValidStatOverrideValue(entry.values[movement], key)) {
          values[movement] = entry.values[movement];
        }
      }
      if (Object.keys(values).length) result.speed = { enabled: entry.enabled, values };
    } else if (isValidStatOverrideValue(entry.value, key)) {
      result[key] = { enabled: entry.enabled, value: entry.value };
    }
  }
  return Object.keys(result).length ? result : undefined;
}

export function getStatOverride(character: object, key: NumericStatOverrideKey): number | null {
  const entry = (character as Pick<Character, "statOverrides">).statOverrides?.[key];
  return entry?.enabled && isValidStatOverrideValue(entry.value, key) ? entry.value : null;
}

/** Retain spent uses when an override is lowered or switched off. */
export function getProficiencyNormalizationLimit(character: object): number | undefined {
  return (character as Pick<Character, "statOverrides">).statOverrides?.proficiencyBonus
    ? getStatOverrideMaximum("proficiencyBonus")
    : undefined;
}

export function getSpeedOverride(character: object, movement: MovementOverrideKey): number | null {
  const entry = (character as Pick<Character, "statOverrides">).statOverrides?.speed;
  const value = entry?.values?.[movement];
  return entry?.enabled && isValidStatOverrideValue(value, "speed") ? value : null;
}

export function setStatOverride(
  character: Character,
  key: StatOverrideKey,
  entry: CharacterStatOverrideValue | NonNullable<CharacterStatOverrides["speed"]>
): Character {
  return {
    ...character,
    statOverrides: normalizeStatOverrides({ ...character.statOverrides, [key]: entry })
  };
}

export function formatStatOverrideFormula(value: number, label: string): string {
  return `${value} ${label} = + ${value} (OVERWRITTEN)`;
}
