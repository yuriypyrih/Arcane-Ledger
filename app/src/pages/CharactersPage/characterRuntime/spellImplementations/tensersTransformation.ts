import {
  ARMOR_PROFICIENCY,
  EFFECT_NAME,
  PROFICIENCY_SOURCE,
  PROF_LEVEL,
  SAVING_THROW_PROFICIENCY,
  STATUS_ENTRY_GROUP,
  WEAPON_PROFICIENCY,
  type ArmorProficiencyEntry,
  type Character,
  type CharacterProficiencyCollections,
  type CharacterStatusEntry,
  type SavingThrowProficiencyEntry,
  type WeaponProficiencyEntry
} from "../../../../types";
import type {
  FeatureDamageBonus,
  FeatureIndicator,
  FeatureSpellcastingState
} from "../../classFeatures/types";
import { swapSystemTemporaryHitPointsAssignmentForCharacter } from "../../feats/runtime/bountifulHealth";
import { createTemporaryHitPointsAssignment, normalizeTemporaryHitPoints } from "../../shared";
import { normalizeCharacterStatusEntries } from "../../statusEntries";
import {
  tensersTransformationSpellId,
  tensersTransformationStatusValue,
  tensersTransformationTemporaryHitPoints,
  tensersTransformationTemporaryHitPointsSource
} from "./tensersTransformationConfig";
import type { SpellImplementationApplyContext } from "./types";
export {
  tensersTransformationExhaustionNote,
  tensersTransformationSpellId,
  tensersTransformationStatusValue,
  tensersTransformationTemporaryHitPoints,
  tensersTransformationTemporaryHitPointsSource
} from "./tensersTransformationConfig";

const tensersTransformationDamageFormula = "2d12";
const tensersTransformationDamageLabel = "2d12 Force";
const tensersTransformationSpellcastingBlockedReason =
  "Tenser's Transformation prevents you from casting spells while it persists.";

const tensersTransformationAdvantageIndicator: FeatureIndicator = {
  label: "Advantage",
  tone: "advantage",
  source: tensersTransformationStatusValue
};

const tensersTransformationArmorProficiencies = [
  ARMOR_PROFICIENCY.LIGHT,
  ARMOR_PROFICIENCY.MEDIUM,
  ARMOR_PROFICIENCY.HEAVY,
  ARMOR_PROFICIENCY.SHIELD
];
const tensersTransformationWeaponProficiencies = [
  WEAPON_PROFICIENCY.SIMPLE,
  WEAPON_PROFICIENCY.MARTIAL
];
const tensersTransformationSavingThrowProficiencies = [
  SAVING_THROW_PROFICIENCY.STR,
  SAVING_THROW_PROFICIENCY.CON
];
const emptyTensersTransformationProficiencyCollections = {
  savingThrowProficiencies: [],
  weaponProficiencies: [],
  armorProficiencies: []
} satisfies Pick<
  CharacterProficiencyCollections,
  "savingThrowProficiencies" | "weaponProficiencies" | "armorProficiencies"
>;

export function isActiveTensersTransformationStatusEntry(
  entry: CharacterStatusEntry | null | undefined
): entry is CharacterStatusEntry {
  if (!entry) {
    return false;
  }

  return (
    entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
    entry.sourceSpellId === tensersTransformationSpellId &&
    entry.value === EFFECT_NAME.CONCENTRATION &&
    entry.disabled !== true
  );
}

export function hasActiveTensersTransformationStatus(
  character: Partial<Pick<Character, "statusEntries">>
): boolean {
  return normalizeCharacterStatusEntries(character.statusEntries).some(
    isActiveTensersTransformationStatusEntry
  );
}

export function hasActiveTensersTransformationTemporaryHitPoints(
  character: Partial<Pick<Character, "temporaryHitPoints" | "temporaryHitPointsSource">>
): boolean {
  return (
    normalizeTemporaryHitPoints(character.temporaryHitPoints) > 0 &&
    character.temporaryHitPointsSource === tensersTransformationTemporaryHitPointsSource
  );
}

export function applyTensersTransformationTemporaryHitPointsToCharacter(
  character: Character
): Character {
  return {
    ...character,
    ...swapSystemTemporaryHitPointsAssignmentForCharacter(
      character,
      tensersTransformationTemporaryHitPoints,
      tensersTransformationTemporaryHitPointsSource
    )
  };
}

function applyTensersTransformationSpellImplementation(
  context: SpellImplementationApplyContext
): Character {
  return applyTensersTransformationTemporaryHitPointsToCharacter(context.character);
}

export function reconcileTensersTransformationStatusForCharacter(character: Character): Character {
  if (
    hasActiveTensersTransformationStatus(character) ||
    character.temporaryHitPointsSource !== tensersTransformationTemporaryHitPointsSource
  ) {
    return character;
  }

  return {
    ...character,
    ...createTemporaryHitPointsAssignment(0)
  };
}

export function getTensersTransformationWeaponAttackIndicatorsForCharacter(
  character: Partial<Pick<Character, "statusEntries">>,
  context?: {
    attackKind: "weapon" | "unarmed";
  }
): FeatureIndicator[] {
  if (
    !context ||
    context.attackKind !== "weapon" ||
    !hasActiveTensersTransformationStatus(character)
  ) {
    return [];
  }

  return [tensersTransformationAdvantageIndicator];
}

export function getTensersTransformationWeaponDamageBonusesForCharacter(
  character: Partial<Pick<Character, "statusEntries">>,
  context: {
    attackKind: "weapon" | "unarmed";
  }
): FeatureDamageBonus[] {
  if (context.attackKind !== "weapon" || !hasActiveTensersTransformationStatus(character)) {
    return [];
  }

  return [
    {
      label: tensersTransformationStatusValue,
      formula: tensersTransformationDamageFormula,
      displayLabel: tensersTransformationDamageLabel,
      breakdownLabel: tensersTransformationStatusValue,
      formulaSourceLabel: tensersTransformationStatusValue
    }
  ];
}

export function getTensersTransformationSpellcastingStateForCharacter(
  character: Partial<Pick<Character, "statusEntries">>
): FeatureSpellcastingState | null {
  return hasActiveTensersTransformationStatus(character)
    ? {
        blocked: true,
        reason: tensersTransformationSpellcastingBlockedReason
      }
    : null;
}

export function getTensersTransformationArmorProficiencyEntriesForCharacter(
  character: Partial<Pick<Character, "statusEntries">>
): ArmorProficiencyEntry[] {
  return getTensersTransformationProficiencyCollectionsForCharacter(character).armorProficiencies;
}

export function getTensersTransformationWeaponProficiencyEntriesForCharacter(
  character: Partial<Pick<Character, "statusEntries">>
): WeaponProficiencyEntry[] {
  return getTensersTransformationProficiencyCollectionsForCharacter(character).weaponProficiencies;
}

export function getTensersTransformationSavingThrowProficiencyEntriesForCharacter(
  character: Partial<Pick<Character, "statusEntries">>
): SavingThrowProficiencyEntry[] {
  return getTensersTransformationProficiencyCollectionsForCharacter(character)
    .savingThrowProficiencies;
}

export function getTensersTransformationProficiencyCollectionsForCharacter(
  character: Partial<Pick<Character, "statusEntries">>
): Pick<
  CharacterProficiencyCollections,
  "savingThrowProficiencies" | "weaponProficiencies" | "armorProficiencies"
> {
  if (!hasActiveTensersTransformationStatus(character)) {
    return emptyTensersTransformationProficiencyCollections;
  }

  return {
    savingThrowProficiencies: tensersTransformationSavingThrowProficiencies.map(
      (proficiency) => ({
        source: PROFICIENCY_SOURCE.SPELL,
        sourceStr: tensersTransformationStatusValue,
        proficiency,
        proficiencyLevel: PROF_LEVEL.PROFICIENT
      })
    ),
    weaponProficiencies: tensersTransformationWeaponProficiencies.map((proficiency) => ({
      source: PROFICIENCY_SOURCE.SPELL,
      sourceStr: tensersTransformationStatusValue,
      proficiency,
      proficiencyLevel: PROF_LEVEL.PROFICIENT
    })),
    armorProficiencies: tensersTransformationArmorProficiencies.map((proficiency) => ({
      source: PROFICIENCY_SOURCE.SPELL,
      sourceStr: tensersTransformationStatusValue,
      proficiency,
      proficiencyLevel: PROF_LEVEL.PROFICIENT
    }))
  };
}

export const tensersTransformationSpellImplementationSpec = {
  source: {
    type: "spell" as const,
    id: tensersTransformationSpellId,
    label: tensersTransformationStatusValue
  },
  spellId: tensersTransformationSpellId,
  applyOnCast: applyTensersTransformationSpellImplementation
};
