import { CLASS_FEATURE, MAGIC_SCHOOL, type SpellEntry } from "../../../../codex/entries";
import type { Character } from "../../../../types";
import { getPreparedSpellSelectionOptionsForCharacter } from "../../spellcasting";

const wizardSavantConfigsBySubclassId = {
  "wizard-abjurer": {
    feature: CLASS_FEATURE.ABJURATION_SAVANT,
    school: MAGIC_SCHOOL.ABJURATION,
    schoolLabel: "Abjuration"
  },
  "wizard-diviner": {
    feature: CLASS_FEATURE.DIVINATION_SAVANT,
    school: MAGIC_SCHOOL.DIVINATION,
    schoolLabel: "Divination"
  },
  "wizard-evoker": {
    feature: CLASS_FEATURE.EVOCATION_SAVANT,
    school: MAGIC_SCHOOL.EVOCATION,
    schoolLabel: "Evocation"
  },
  "wizard-illusionist": {
    feature: CLASS_FEATURE.ILLUSION_SAVANT,
    school: MAGIC_SCHOOL.ILLUSION,
    schoolLabel: "Illusion"
  }
} as const;

const wizardSavantSelectionCountByLevel = [
  [17, 9],
  [15, 8],
  [13, 7],
  [11, 6],
  [9, 5],
  [7, 4],
  [5, 3],
  [3, 2]
] as const;

export type WizardSavantSubclassId = keyof typeof wizardSavantConfigsBySubclassId;
export type WizardSavantFeature =
  (typeof wizardSavantConfigsBySubclassId)[WizardSavantSubclassId]["feature"];
export type WizardSavantConfig = (typeof wizardSavantConfigsBySubclassId)[WizardSavantSubclassId];

export function isWizardSavantFeature(feature: CLASS_FEATURE): feature is WizardSavantFeature {
  return Object.values(wizardSavantConfigsBySubclassId).some(
    (config) => config.feature === feature
  );
}

export function getWizardSavantConfigForFeature(feature: CLASS_FEATURE): WizardSavantConfig | null {
  return (
    Object.values(wizardSavantConfigsBySubclassId).find((config) => config.feature === feature) ??
    null
  );
}

export function getWizardSavantConfigForSubclassId(
  subclassId: string | undefined
): WizardSavantConfig | null {
  if (!subclassId) {
    return null;
  }

  return wizardSavantConfigsBySubclassId[subclassId as WizardSavantSubclassId] ?? null;
}

export function getWizardSavantSelectionCount(level: number): number {
  const normalizedLevel = Math.max(1, Math.floor(level));

  for (const [unlockLevel, selectionCount] of wizardSavantSelectionCountByLevel) {
    if (normalizedLevel >= unlockLevel) {
      return selectionCount;
    }
  }

  return 0;
}

export function hasWizardSavantFeature(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): boolean {
  return (
    character.className === "Wizard" &&
    getWizardSavantConfigForSubclassId(character.subclassId) !== null &&
    getWizardSavantSelectionCount(character.level) > 0
  );
}

export function getWizardSavantSpellOptions(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): SpellEntry[] {
  const savantConfig = getWizardSavantConfigForSubclassId(character.subclassId);

  if (character.className !== "Wizard" || !savantConfig) {
    return [];
  }

  return getPreparedSpellSelectionOptionsForCharacter(
    character.className,
    character.level,
    character.subclassId
  )
    .filter((spell) => spell.magicSchool === savantConfig.school)
    .sort((left, right) => {
      if (left.spellLevel !== right.spellLevel) {
        return left.spellLevel - right.spellLevel;
      }

      return left.name.localeCompare(right.name);
    });
}

export function normalizeWizardSavantSpellIds(
  value: unknown,
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): string[] {
  if (!hasWizardSavantFeature(character)) {
    return [];
  }

  const selectionCount = getWizardSavantSelectionCount(character.level);
  const availableSpellIds = new Set(
    getWizardSavantSpellOptions(character).map((spell) => spell.id)
  );
  const rawSpellIds = Array.isArray(value)
    ? value.filter((spellId): spellId is string => typeof spellId === "string")
    : [];

  return [...new Set(rawSpellIds)]
    .filter((spellId) => availableSpellIds.has(spellId))
    .slice(0, selectionCount);
}

export function getWizardSavantSpellIdsFromFeatureState(
  character: Pick<Character, "className" | "level"> &
    Partial<Pick<Character, "classFeatureState" | "subclassId">>
): string[] {
  return normalizeWizardSavantSpellIds(character.classFeatureState?.wizard?.savantSpellIds, character);
}
