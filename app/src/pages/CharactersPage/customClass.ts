import type {
  AbilityKey,
  CharacterClassRulesConfig,
  CharacterCustomClassConfig,
  CharacterCustomClassMechanics,
  CharacterCustomHitDie
} from "../../types";
import { sanitizeUserInput } from "../../utils/userInputSanitization";

export const CUSTOM_CLASS_NAME = "Custom";
export const CUSTOM_CLASS_ID_PREFIX = "custom-class-";
export const CUSTOM_CLASS_NAME_MAX_LENGTH = 16;
export const CUSTOM_CLASS_SPELL_SLOT_MAXIMUM = 10;
export const CUSTOM_CLASS_EXTRA_ATTACK_MINIMUM = 1;
export const CUSTOM_CLASS_EXTRA_ATTACK_MAXIMUM = 10;
export const customClassHitDice: CharacterCustomHitDie[] = ["d6", "d8", "d10", "d12"];
export const defaultCustomClassSpellSlotMaximums = [1, 0, 0, 0, 0, 0, 0, 0, 0];

const customClassHitDieSet = new Set<string>(customClassHitDice);
const abilityKeySet = new Set<string>(["STR", "DEX", "CON", "INT", "WIS", "CHA"]);

export const defaultCustomClassMechanics: CharacterCustomClassMechanics = {
  extraAttacks: {
    enabled: false,
    count: CUSTOM_CLASS_EXTRA_ATTACK_MINIMUM
  },
  eldritchInvocations: {
    enabled: false,
    selectionIds: []
  },
  spellcasting: {
    enabled: false
  }
};

export const defaultCustomClassConfig: CharacterCustomClassConfig = {
  id: undefined,
  name: undefined,
  hitDie: "d8",
  mechanics: {
    extraAttacks: { ...defaultCustomClassMechanics.extraAttacks },
    eldritchInvocations: {
      ...defaultCustomClassMechanics.eldritchInvocations,
      selectionIds: [...defaultCustomClassMechanics.eldritchInvocations.selectionIds]
    },
    spellcasting: { ...defaultCustomClassMechanics.spellcasting }
  },
  spellcastingAbility: "INT",
  spellSlotMaximums: [...defaultCustomClassSpellSlotMaximums]
};

export const defaultCharacterClassRulesConfig: CharacterClassRulesConfig = {
  classRulesEnforced: true,
  spellcastingRulesEnforced: true,
  hitDie: defaultCustomClassConfig.hitDie,
  spellcastingAbility: defaultCustomClassConfig.spellcastingAbility,
  spellSlotMaximums: [...defaultCustomClassSpellSlotMaximums],
  mechanics: {
    extraAttacks: { ...defaultCustomClassMechanics.extraAttacks },
    eldritchInvocations: {
      ...defaultCustomClassMechanics.eldritchInvocations,
      selectionIds: [...defaultCustomClassMechanics.eldritchInvocations.selectionIds]
    },
    spellcasting: { ...defaultCustomClassMechanics.spellcasting }
  }
};

export function isCustomClassName(className: string | null | undefined): boolean {
  return className?.trim() === CUSTOM_CLASS_NAME;
}

function normalizeCustomClassId(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalizedValue = value.trim();
  return normalizedValue.startsWith(CUSTOM_CLASS_ID_PREFIX) ? normalizedValue : undefined;
}

function normalizeCustomClassName(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalizedValue = sanitizeUserInput(value).slice(0, CUSTOM_CLASS_NAME_MAX_LENGTH);
  return normalizedValue.length > 0 ? normalizedValue : undefined;
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

function normalizeBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

export function normalizeCustomClassExtraAttackCount(value: unknown): number {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue)
    ? Math.min(
        CUSTOM_CLASS_EXTRA_ATTACK_MAXIMUM,
        Math.max(CUSTOM_CLASS_EXTRA_ATTACK_MINIMUM, Math.floor(parsedValue))
      )
    : defaultCustomClassMechanics.extraAttacks.count;
}

export function normalizeCustomClassInvocationSelectionIds(value: unknown): string[] {
  const rawValues = Array.isArray(value) ? value : [];

  return [
    ...new Set(
      rawValues
        .filter((selectionId): selectionId is string => typeof selectionId === "string")
        .map((selectionId) => selectionId.trim())
        .filter((selectionId) => selectionId.length > 0)
    )
  ];
}

export function normalizeCustomClassMechanics(
  value: unknown,
  options: { legacySpellcastingEnabled?: boolean } = {}
): CharacterCustomClassMechanics {
  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const extraAttacksRecord =
    record.extraAttacks && typeof record.extraAttacks === "object"
      ? (record.extraAttacks as Record<string, unknown>)
      : {};
  const eldritchInvocationsRecord =
    record.eldritchInvocations && typeof record.eldritchInvocations === "object"
      ? (record.eldritchInvocations as Record<string, unknown>)
      : {};
  const spellcastingRecord =
    record.spellcasting && typeof record.spellcasting === "object"
      ? (record.spellcasting as Record<string, unknown>)
      : {};

  return {
    extraAttacks: {
      enabled: normalizeBoolean(
        extraAttacksRecord.enabled,
        defaultCustomClassMechanics.extraAttacks.enabled
      ),
      count: normalizeCustomClassExtraAttackCount(extraAttacksRecord.count)
    },
    eldritchInvocations: {
      enabled: normalizeBoolean(
        eldritchInvocationsRecord.enabled,
        defaultCustomClassMechanics.eldritchInvocations.enabled
      ),
      selectionIds: normalizeCustomClassInvocationSelectionIds(
        eldritchInvocationsRecord.selectionIds
      )
    },
    spellcasting: {
      enabled: normalizeBoolean(
        spellcastingRecord.enabled,
        options.legacySpellcastingEnabled ?? defaultCustomClassMechanics.spellcasting.enabled
      )
    }
  };
}

export function normalizeCustomClassConfig(
  value: unknown,
  options: { legacySpellcastingEnabled?: boolean } = {}
): CharacterCustomClassConfig {
  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const hasLegacyCustomClassShape =
    options.legacySpellcastingEnabled === true ||
    (!("mechanics" in record) &&
      ("hitDie" in record || "spellcastingAbility" in record || "spellSlotMaximums" in record));

  return {
    id: normalizeCustomClassId(record.id),
    name: normalizeCustomClassName(record.name),
    hitDie: normalizeCustomClassHitDie(record.hitDie),
    mechanics: normalizeCustomClassMechanics(record.mechanics, {
      legacySpellcastingEnabled: hasLegacyCustomClassShape
    }),
    spellcastingAbility: normalizeCustomClassSpellcastingAbility(record.spellcastingAbility),
    spellSlotMaximums: normalizeCustomClassSpellSlotMaximums(record.spellSlotMaximums)
  };
}

export function normalizeCharacterClassRulesConfig(
  value: unknown,
  options: {
    className?: string | null;
    legacyCustomClass?: unknown;
    legacySpellcastingEnabled?: boolean;
  } = {}
): CharacterClassRulesConfig {
  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const hasPersistedRules = value && typeof value === "object";
  const isCustomClass = isCustomClassName(options.className);
  const legacyCustomClass = normalizeCustomClassConfig(options.legacyCustomClass, {
    legacySpellcastingEnabled: options.legacySpellcastingEnabled
  });
  const mechanicsSource =
    "mechanics" in record
      ? record.mechanics
      : hasPersistedRules
        ? undefined
        : legacyCustomClass.mechanics;

  return {
    classRulesEnforced: isCustomClass
      ? false
      : normalizeBoolean(record.classRulesEnforced, defaultCharacterClassRulesConfig.classRulesEnforced),
    spellcastingRulesEnforced: isCustomClass
      ? false
      : normalizeBoolean(
          record.spellcastingRulesEnforced,
          defaultCharacterClassRulesConfig.spellcastingRulesEnforced
        ),
    hitDie:
      "hitDie" in record
        ? normalizeCustomClassHitDie(record.hitDie)
        : legacyCustomClass.hitDie,
    spellcastingAbility:
      "spellcastingAbility" in record
        ? normalizeCustomClassSpellcastingAbility(record.spellcastingAbility)
        : legacyCustomClass.spellcastingAbility,
    spellSlotMaximums:
      "spellSlotMaximums" in record
        ? normalizeCustomClassSpellSlotMaximums(record.spellSlotMaximums)
        : legacyCustomClass.spellSlotMaximums,
    mechanics: normalizeCustomClassMechanics(mechanicsSource, {
      legacySpellcastingEnabled:
        options.legacySpellcastingEnabled ??
        (!hasPersistedRules && legacyCustomClass.mechanics.spellcasting.enabled)
    })
  };
}

type ClassRulesCharacter = {
  className?: string | null;
  classRules?: CharacterClassRulesConfig;
  customClass?: CharacterCustomClassConfig;
};

export function getCharacterClassRulesConfig(
  character: ClassRulesCharacter
): CharacterClassRulesConfig {
  return normalizeCharacterClassRulesConfig(character.classRules, {
    className: character.className,
    legacyCustomClass: character.customClass
  });
}

export function areCharacterClassRulesEnforced(character: ClassRulesCharacter): boolean {
  return !isCustomClassName(character.className) && getCharacterClassRulesConfig(character).classRulesEnforced;
}

export function areCharacterSpellcastingRulesEnforced(character: ClassRulesCharacter): boolean {
  return (
    !isCustomClassName(character.className) &&
    getCharacterClassRulesConfig(character).spellcastingRulesEnforced
  );
}

export function canUseClassNeutralMechanics(character: ClassRulesCharacter): boolean {
  return isCustomClassName(character.className) || !areCharacterClassRulesEnforced(character);
}

export function getCharacterClassRulesHitDie(character: ClassRulesCharacter): CharacterCustomHitDie {
  return getCharacterClassRulesConfig(character).hitDie;
}

export function getCharacterClassRulesSpellcastingAbility(
  character: ClassRulesCharacter
): AbilityKey {
  return getCharacterClassRulesConfig(character).spellcastingAbility;
}

export function getCharacterClassRulesSpellSlotMaximums(
  character: ClassRulesCharacter
): number[] {
  return getCharacterClassRulesConfig(character).spellSlotMaximums;
}

export function getCharacterClassRulesMechanics(
  character: ClassRulesCharacter
): CharacterCustomClassMechanics {
  return getCharacterClassRulesConfig(character).mechanics;
}

export function isCharacterClassRulesExtraAttacksEnabled(
  character: ClassRulesCharacter
): boolean {
  return canUseClassNeutralMechanics(character) && getCharacterClassRulesMechanics(character).extraAttacks.enabled;
}

export function getCharacterClassRulesExtraAttackCount(
  character: ClassRulesCharacter
): number {
  const mechanics = getCharacterClassRulesMechanics(character);

  return isCharacterClassRulesExtraAttacksEnabled(character) ? mechanics.extraAttacks.count : 0;
}

export function isCharacterClassRulesEldritchInvocationsEnabled(
  character: ClassRulesCharacter
): boolean {
  return (
    canUseClassNeutralMechanics(character) &&
    getCharacterClassRulesMechanics(character).eldritchInvocations.enabled
  );
}

export function getCharacterClassRulesEldritchInvocationSelectionIds(
  character: ClassRulesCharacter
): string[] {
  const mechanics = getCharacterClassRulesMechanics(character);

  return isCharacterClassRulesEldritchInvocationsEnabled(character)
    ? mechanics.eldritchInvocations.selectionIds
    : [];
}

export function isCharacterClassRulesSpellcastingEnabled(
  character: ClassRulesCharacter
): boolean {
  return canUseClassNeutralMechanics(character) && getCharacterClassRulesMechanics(character).spellcasting.enabled;
}

export function isCustomClassExtraAttacksEnabled(
  customClass?: CharacterCustomClassConfig
): boolean {
  return normalizeCustomClassConfig(customClass).mechanics.extraAttacks.enabled;
}

export function getCustomClassExtraAttackCount(
  customClass?: CharacterCustomClassConfig
): number {
  const mechanics = normalizeCustomClassConfig(customClass).mechanics;

  return mechanics.extraAttacks.enabled ? mechanics.extraAttacks.count : 0;
}

export function isCustomClassEldritchInvocationsEnabled(
  customClass?: CharacterCustomClassConfig
): boolean {
  return normalizeCustomClassConfig(customClass).mechanics.eldritchInvocations.enabled;
}

export function getCustomClassEldritchInvocationSelectionIds(
  customClass?: CharacterCustomClassConfig
): string[] {
  const mechanics = normalizeCustomClassConfig(customClass).mechanics;

  return mechanics.eldritchInvocations.enabled
    ? mechanics.eldritchInvocations.selectionIds
    : [];
}

export function isCustomClassSpellcastingEnabled(
  customClass?: CharacterCustomClassConfig
): boolean {
  return normalizeCustomClassConfig(customClass).mechanics.spellcasting.enabled;
}
