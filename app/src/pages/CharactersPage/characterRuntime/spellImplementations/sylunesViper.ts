import {
  STATUS_ENTRY_GROUP,
  type Character,
  type CharacterStatusEntry
} from "../../../../types";
import type { FeatureSpeedBonus } from "../../classFeatures/types";
import { applyBoonOfBountifulHealthTemporaryHitPointsBonus } from "../../feats/runtime/bountifulHealth";
import {
  createTemporaryHitPointsAssignment,
  normalizeTemporaryHitPoints,
  normalizeTemporaryHitPointsSource
} from "../../shared";
import {
  normalizeCharacterStatusEntries,
  pruneLinkedStatusEntries
} from "../../statusEntries";
import {
  sylunesViperSpellId,
  sylunesViperStatusValue,
  sylunesViperTemporaryHitPointsSource
} from "./sylunesViperConfig";
import type { SpellImplementationApplyContext } from "./types";
export {
  sylunesViperSpellId,
  sylunesViperStatusValue,
  sylunesViperTemporaryHitPointsSource
} from "./sylunesViperConfig";

const sylunesViperBaseSpellLevel = 3;
const sylunesViperBaseTemporaryHitPoints = 15;
const sylunesViperTemporaryHitPointsPerUpcastLevel = 5;

export function normalizeSylunesViperSourceSpellSlotLevel(
  sourceSpellSlotLevel: unknown
): number {
  const numericSpellSlotLevel = Number(sourceSpellSlotLevel);

  if (!Number.isFinite(numericSpellSlotLevel)) {
    return sylunesViperBaseSpellLevel;
  }

  return Math.max(sylunesViperBaseSpellLevel, Math.floor(numericSpellSlotLevel));
}

export function getSylunesViperTemporaryHitPoints(sourceSpellSlotLevel: unknown): number {
  const spellSlotLevel = normalizeSylunesViperSourceSpellSlotLevel(sourceSpellSlotLevel);

  return (
    sylunesViperBaseTemporaryHitPoints +
    Math.max(0, spellSlotLevel - sylunesViperBaseSpellLevel) *
      sylunesViperTemporaryHitPointsPerUpcastLevel
  );
}

export function isActiveSylunesViperStatusEntry(
  entry: CharacterStatusEntry | null | undefined
): entry is CharacterStatusEntry {
  if (!entry) {
    return false;
  }

  return (
    entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
    entry.sourceSpellId === sylunesViperSpellId &&
    entry.value === sylunesViperStatusValue &&
    entry.sourceSpellTarget !== "other" &&
    entry.disabled !== true
  );
}

export function hasActiveSylunesViperStatus(
  character: Partial<Pick<Character, "statusEntries">>
): boolean {
  return normalizeCharacterStatusEntries(character.statusEntries).some(
    isActiveSylunesViperStatusEntry
  );
}

export function hasActiveSylunesViperTemporaryHitPoints(
  character: Partial<Pick<Character, "temporaryHitPoints" | "temporaryHitPointsSource">>
): boolean {
  return (
    normalizeTemporaryHitPoints(character.temporaryHitPoints) > 0 &&
    normalizeTemporaryHitPointsSource(character.temporaryHitPointsSource) ===
      sylunesViperTemporaryHitPointsSource
  );
}

export function hasActiveSylunesViperBenefitsForCharacter(
  character: Partial<
    Pick<Character, "statusEntries" | "temporaryHitPoints" | "temporaryHitPointsSource">
  >
): boolean {
  return (
    hasActiveSylunesViperStatus(character) &&
    hasActiveSylunesViperTemporaryHitPoints(character)
  );
}

export function applySylunesViperTemporaryHitPointsToCharacter(
  character: Character,
  sourceSpellSlotLevel: unknown
): Character {
  const temporaryHitPoints = applyBoonOfBountifulHealthTemporaryHitPointsBonus(
    character,
    getSylunesViperTemporaryHitPoints(sourceSpellSlotLevel)
  );

  return {
    ...character,
    ...createTemporaryHitPointsAssignment(
      temporaryHitPoints,
      sylunesViperTemporaryHitPointsSource
    )
  };
}

function applySylunesViperSpellImplementation(
  context: SpellImplementationApplyContext
): Character {
  return applySylunesViperTemporaryHitPointsToCharacter(
    context.character,
    context.sourceSpellSlotLevel
  );
}

function getSylunesViperStatusOptions() {
  return {
    sourceSpellTarget: "self" as const
  };
}

export function getSylunesViperSpeedBonusesForCharacter(
  character: Partial<
    Pick<Character, "statusEntries" | "temporaryHitPoints" | "temporaryHitPointsSource">
  >
): FeatureSpeedBonus[] {
  if (!hasActiveSylunesViperBenefitsForCharacter(character)) {
    return [];
  }

  return [
    {
      label: sylunesViperStatusValue,
      value: 0,
      movementType: "climb",
      setBaseFromWalkMultiplier: 1
    }
  ];
}

export function reconcileSylunesViperStatusForCharacter(character: Character): Character {
  if (
    !hasActiveSylunesViperStatus(character) ||
    hasActiveSylunesViperTemporaryHitPoints(character)
  ) {
    return character;
  }

  const statusEntries = normalizeCharacterStatusEntries(character.statusEntries);
  const nextStatusEntries = statusEntries.filter(
    (entry) =>
      !(
        entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
        entry.sourceSpellId === sylunesViperSpellId
      )
  );

  if (nextStatusEntries.length === statusEntries.length) {
    return character;
  }

  return {
    ...character,
    statusEntries: pruneLinkedStatusEntries(nextStatusEntries)
  };
}

export const sylunesViperSpellImplementationSpec = {
  source: {
    type: "spell" as const,
    id: sylunesViperSpellId,
    label: sylunesViperStatusValue
  },
  spellId: sylunesViperSpellId,
  applyOnCast: applySylunesViperSpellImplementation,
  getStatusOptions: getSylunesViperStatusOptions
};
