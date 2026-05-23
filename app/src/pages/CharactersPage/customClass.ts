import type { AbilityKey, CharacterCustomClassConfig, CharacterCustomHitDie } from "../../types";

export const CUSTOM_CLASS_NAME = "Custom";
export const CUSTOM_CLASS_SPELL_SLOT_MAXIMUM = 10;
export const customClassHitDice: CharacterCustomHitDie[] = ["d6", "d8", "d10", "d12"];
export const defaultCustomClassSpellSlotMaximums = [1, 0, 0, 0, 0, 0, 0, 0, 0];

const customClassHitDieSet = new Set<string>(customClassHitDice);
const abilityKeySet = new Set<string>(["STR", "DEX", "CON", "INT", "WIS", "CHA"]);

export const defaultCustomClassConfig: CharacterCustomClassConfig = {
  hitDie: "d8",
  spellcastingAbility: "INT",
  spellSlotMaximums: [...defaultCustomClassSpellSlotMaximums]
};

export function isCustomClassName(className: string | null | undefined): boolean {
  return className?.trim() === CUSTOM_CLASS_NAME;
}

export function normalizeCustomClassHitDie(value: unknown): CharacterCustomHitDie {
  if (typeof value !== "string") {
    return defaultCustomClassConfig.hitDie;
  }

  const normalizedValue = value.trim().toLowerCase();
  return customClassHitDieSet.has(normalizedValue)
    ? (normalizedValue as CharacterCustomHitDie)
    : defaultCustomClassConfig.hitDie;
}

export function normalizeCustomClassSpellcastingAbility(value: unknown): AbilityKey {
  return typeof value === "string" && abilityKeySet.has(value)
    ? (value as AbilityKey)
    : defaultCustomClassConfig.spellcastingAbility;
}

export function normalizeCustomClassSpellSlotMaximums(value: unknown): number[] {
  const rawValues = Array.isArray(value) ? value : [];

  return defaultCustomClassSpellSlotMaximums.map((fallback, index) => {
    const parsedValue = Number(rawValues[index]);

    return Number.isFinite(parsedValue)
      ? Math.min(CUSTOM_CLASS_SPELL_SLOT_MAXIMUM, Math.max(0, Math.floor(parsedValue)))
      : fallback;
  });
}

export function normalizeCustomClassConfig(value: unknown): CharacterCustomClassConfig {
  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : {};

  return {
    hitDie: normalizeCustomClassHitDie(record.hitDie),
    spellcastingAbility: normalizeCustomClassSpellcastingAbility(record.spellcastingAbility),
    spellSlotMaximums: normalizeCustomClassSpellSlotMaximums(record.spellSlotMaximums)
  };
}
