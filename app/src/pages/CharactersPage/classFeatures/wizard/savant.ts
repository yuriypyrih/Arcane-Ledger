import { hasCharacterClass, getClassLevel, getClassSubclassId } from "../../multiclassState";
import { type SpellEntry } from "../../../../codex/entries";
import { CLASS_FEATURE, MAGIC_SCHOOL } from "../../../../codex/entries/enums";
import type { Character } from "../../../../types";
import { getPreparedSpellSelectionOptionsForCharacter } from "../../preparedSpellSelection";

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
  },
  "wizard-necromancer": {
    feature: CLASS_FEATURE.NECROMANCY_SAVANT,
    school: MAGIC_SCHOOL.NECROMANCY,
    schoolLabel: "Necromancy"
  },
  "wizard-transmuter": {
    feature: CLASS_FEATURE.TRANSMUTATION_SAVANT,
    school: MAGIC_SCHOOL.TRANSMUTATION,
    schoolLabel: "Transmutation"
  },
  "wizard-enchanter": {
    feature: CLASS_FEATURE.ENCHANTMENT_SAVANT,
    school: MAGIC_SCHOOL.ENCHANTMENT,
    schoolLabel: "Enchantment"
  },
  "wizard-conjurer": {
    feature: CLASS_FEATURE.CONJURATION_SAVANT,
    school: MAGIC_SCHOOL.CONJURATION,
    schoolLabel: "Conjuration"
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
    hasCharacterClass(character, "Wizard") &&
    getWizardSavantConfigForSubclassId(getClassSubclassId(character, "Wizard")) !== null &&
    getWizardSavantSelectionCount(getClassLevel(character, "Wizard")) > 0
  );
}

function getSavantChoiceSpellLevelLimit(config: WizardSavantConfig, selectionIndex?: number) {
  return (config.feature === CLASS_FEATURE.NECROMANCY_SAVANT ||
    config.feature === CLASS_FEATURE.TRANSMUTATION_SAVANT ||
    config.feature === CLASS_FEATURE.ENCHANTMENT_SAVANT ||
    config.feature === CLASS_FEATURE.CONJURATION_SAVANT) &&
    selectionIndex !== undefined
    ? Math.max(2, selectionIndex + 1)
    : 9;
}

export function getWizardSavantSpellOptions(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>,
  selectionIndex?: number
): SpellEntry[] {
  const savantConfig = getWizardSavantConfigForSubclassId(getClassSubclassId(character, "Wizard"));

  if (!hasCharacterClass(character, "Wizard") || !savantConfig) {
    return [];
  }

  return getPreparedSpellSelectionOptionsForCharacter(
    "Wizard",
    getClassLevel(character, "Wizard"),
    getClassSubclassId(character, "Wizard")
  )
    .filter(
      (spell) =>
        spell.magicSchool === savantConfig.school &&
        spell.spellLevel > 0 &&
        spell.spellLevel <= getSavantChoiceSpellLevelLimit(savantConfig, selectionIndex)
    )
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

  const selectionCount = getWizardSavantSelectionCount(getClassLevel(character, "Wizard"));
  const savantConfig = getWizardSavantConfigForSubclassId(getClassSubclassId(character, "Wizard"));
  const availableSpells = new Map(
    getWizardSavantSpellOptions(character).map((spell) => [spell.id, spell])
  );
  const rawSpellIds = Array.isArray(value)
    ? value.map((spellId) => (typeof spellId === "string" ? spellId.trim() : ""))
    : [];
  const selectedSpellIds = new Set<string>();

  // Keep empty positions so choices retain the spell-level limit of their unlock slot.
  return rawSpellIds.slice(0, selectionCount).map((spellId, index) => {
    const spell = availableSpells.get(spellId);
    if (
      selectedSpellIds.has(spellId) ||
      !spell ||
      !savantConfig ||
      spell.spellLevel > getSavantChoiceSpellLevelLimit(savantConfig, index)
    ) {
      return "";
    }
    selectedSpellIds.add(spellId);
    return spellId;
  });
}

export function getWizardSavantSpellIdsFromFeatureState(
  character: Pick<Character, "className" | "level"> &
    Partial<Pick<Character, "classFeatureState" | "subclassId">>
): string[] {
  return normalizeWizardSavantSpellIds(
    character.classFeatureState?.wizard?.savantSpellIds,
    character
  ).filter(Boolean);
}
