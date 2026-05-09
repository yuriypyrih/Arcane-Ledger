import type { Character } from "../../../../types";
import { getAutomaticMaxHitPointsForCharacter } from "../../../../pages/CharactersPage/gameplay";
import { getBoonOfFortitudeHealingBonusForCharacter } from "../../../../pages/CharactersPage/feats/runtime";
import { clampNumber } from "../../../../pages/CharactersPage/CharacterSheetPage/utils";
import {
  getEffectiveHitPointMaximumForCharacter,
  reconcileCharacterStatusConsequences
} from "../../../../pages/CharactersPage/traits";
import {
  MANUAL_TEMPORARY_HIT_POINTS_SOURCE,
  createDefaultDeathSaves,
  createMagicTemporaryHitPointsAssignment,
  createTemporaryHitPointsAssignment,
  normalizeDeathSaves,
  normalizeMagicTemporaryHitPoints,
  normalizeMaxHitPointsMode,
  normalizeTemporaryHitPoints,
  type MaxHitPointsMode
} from "./gameplayStateUtils";

type HitPointEditInput = {
  hitPoints: number;
  currentHitPoints: number;
  maxHitPointsMode: MaxHitPointsMode;
};

const MAX_HIT_POINTS = 9999;

function getResolvedDeathSaves(character: Character, nextCurrentHitPoints: number) {
  return nextCurrentHitPoints > 0
    ? createDefaultDeathSaves()
    : normalizeDeathSaves(character.deathSaves);
}

function getEffectiveHitPointsForBase(character: Character, baseHitPoints: number) {
  return getEffectiveHitPointMaximumForCharacter({
    ...character,
    hitPoints: baseHitPoints
  });
}

export function syncAutomaticHitPointsForCharacter(character: Character): Character {
  if (normalizeMaxHitPointsMode(character.maxHitPointsMode) !== "automatic") {
    return character;
  }

  const nextAutomaticHitPoints = getAutomaticMaxHitPointsForCharacter(character);

  if (character.hitPoints === nextAutomaticHitPoints) {
    return character;
  }

  const hitPointDelta = nextAutomaticHitPoints - character.hitPoints;
  const nextEffectiveHitPoints = getEffectiveHitPointsForBase(character, nextAutomaticHitPoints);
  const nextCurrentHitPoints = clampNumber(
    character.currentHitPoints + hitPointDelta,
    0,
    nextEffectiveHitPoints,
    character.currentHitPoints
  );

  return reconcileCharacterStatusConsequences({
    ...character,
    hitPoints: nextAutomaticHitPoints,
    currentHitPoints: nextCurrentHitPoints,
    deathSaves: getResolvedDeathSaves(character, nextCurrentHitPoints)
  });
}

export function applyHealingToCharacter(character: Character, amount: number): Character {
  const normalizedAmount = clampNumber(amount, 0, 999, 0);

  if (normalizedAmount === 0) {
    return character;
  }

  const healingAmount = normalizedAmount + getBoonOfFortitudeHealingBonusForCharacter(character);
  const nextEffectiveHitPoints = getEffectiveHitPointMaximumForCharacter(character);
  const nextCurrentHitPoints = clampNumber(
    character.currentHitPoints + healingAmount,
    0,
    nextEffectiveHitPoints,
    character.currentHitPoints
  );

  if (nextCurrentHitPoints === character.currentHitPoints) {
    return character;
  }

  return reconcileCharacterStatusConsequences({
    ...character,
    currentHitPoints: nextCurrentHitPoints,
    deathSaves: getResolvedDeathSaves(character, nextCurrentHitPoints)
  });
}

export function applyDamageToCharacter(character: Character, amount: number): Character {
  const normalizedAmount = clampNumber(amount, 0, 999, 0);

  if (normalizedAmount === 0) {
    return character;
  }

  const currentMagicTemporaryHitPoints = normalizeMagicTemporaryHitPoints(
    character.magicTemporaryHitPoints
  );
  const absorbedByMagicTemporaryHitPoints = Math.min(
    normalizedAmount,
    currentMagicTemporaryHitPoints
  );
  const nextMagicTemporaryHitPoints =
    currentMagicTemporaryHitPoints - absorbedByMagicTemporaryHitPoints;
  const damageAfterMagicTemporaryHitPoints = normalizedAmount - absorbedByMagicTemporaryHitPoints;
  const currentTemporaryHitPoints = normalizeTemporaryHitPoints(character.temporaryHitPoints);
  const absorbedByTemporaryHitPoints = Math.min(
    damageAfterMagicTemporaryHitPoints,
    currentTemporaryHitPoints
  );
  const nextTemporaryHitPoints = currentTemporaryHitPoints - absorbedByTemporaryHitPoints;
  const remainingDamage = damageAfterMagicTemporaryHitPoints - absorbedByTemporaryHitPoints;
  const nextEffectiveHitPoints = getEffectiveHitPointMaximumForCharacter(character);
  const nextCurrentHitPoints = clampNumber(
    character.currentHitPoints - remainingDamage,
    0,
    nextEffectiveHitPoints,
    character.currentHitPoints
  );

  if (
    nextMagicTemporaryHitPoints === currentMagicTemporaryHitPoints &&
    nextTemporaryHitPoints === currentTemporaryHitPoints &&
    nextCurrentHitPoints === character.currentHitPoints
  ) {
    return character;
  }

  return reconcileCharacterStatusConsequences({
    ...character,
    ...createMagicTemporaryHitPointsAssignment(
      nextMagicTemporaryHitPoints,
      nextMagicTemporaryHitPoints > 0 ? character.magicTemporaryHitPointsSource : undefined
    ),
    ...createTemporaryHitPointsAssignment(
      nextTemporaryHitPoints,
      nextTemporaryHitPoints > 0 ? character.temporaryHitPointsSource : undefined
    ),
    currentHitPoints: nextCurrentHitPoints,
    deathSaves: getResolvedDeathSaves(character, nextCurrentHitPoints)
  });
}

export function applyHitPointEditToCharacter(
  character: Character,
  { hitPoints, currentHitPoints, maxHitPointsMode }: HitPointEditInput
): Character {
  const nextBaseHitPoints = clampNumber(hitPoints, 1, MAX_HIT_POINTS, character.hitPoints);
  const nextEffectiveHitPoints = getEffectiveHitPointsForBase(character, nextBaseHitPoints);
  const nextCurrentHitPoints = clampNumber(
    currentHitPoints,
    0,
    nextEffectiveHitPoints,
    character.currentHitPoints
  );

  if (
    nextBaseHitPoints === character.hitPoints &&
    nextCurrentHitPoints === character.currentHitPoints &&
    maxHitPointsMode === normalizeMaxHitPointsMode(character.maxHitPointsMode)
  ) {
    return character;
  }

  return reconcileCharacterStatusConsequences({
    ...character,
    hitPoints: nextBaseHitPoints,
    currentHitPoints: nextCurrentHitPoints,
    maxHitPointsMode,
    deathSaves: getResolvedDeathSaves(character, nextCurrentHitPoints)
  });
}

export function assignManualTemporaryHitPointsForCharacter(
  character: Character,
  value: number
): Character {
  const nextTemporaryHitPoints = normalizeTemporaryHitPoints(value);
  const nextTemporaryHitPointsAssignment = createTemporaryHitPointsAssignment(
    nextTemporaryHitPoints,
    nextTemporaryHitPoints > 0 ? MANUAL_TEMPORARY_HIT_POINTS_SOURCE : undefined
  );

  if (
    nextTemporaryHitPointsAssignment.temporaryHitPoints === character.temporaryHitPoints &&
    nextTemporaryHitPointsAssignment.temporaryHitPointsSource === character.temporaryHitPointsSource
  ) {
    return character;
  }

  return {
    ...character,
    ...nextTemporaryHitPointsAssignment
  };
}

export function assignMagicTemporaryHitPointsForCharacter(
  character: Character,
  value: number,
  maximumValue: number,
  sourceLabel: string
): Character {
  const nextMagicTemporaryHitPointsAssignment = createMagicTemporaryHitPointsAssignment(
    Math.min(Math.max(0, Math.floor(maximumValue)), normalizeMagicTemporaryHitPoints(value)),
    sourceLabel
  );

  if (
    nextMagicTemporaryHitPointsAssignment.magicTemporaryHitPoints ===
      character.magicTemporaryHitPoints &&
    nextMagicTemporaryHitPointsAssignment.magicTemporaryHitPointsSource ===
      character.magicTemporaryHitPointsSource
  ) {
    return character;
  }

  return {
    ...character,
    ...nextMagicTemporaryHitPointsAssignment
  };
}
