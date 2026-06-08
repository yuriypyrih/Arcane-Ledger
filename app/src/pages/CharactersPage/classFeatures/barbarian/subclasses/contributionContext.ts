import { barbarianFeatures } from "../../../../../codex/classes";
import { CLASS_FEATURE } from "../../../../../codex/entries";
import type { Character, CharacterRageFeatureState } from "../../../../../types";

export type BarbarianSubclassContributionCharacter = Pick<Character, "className"> &
  Partial<Pick<Character, "level" | "classFeatureState" | "subclassId">>;

function getNormalizedLevel(level: number | undefined): number {
  return Math.max(1, Math.min(20, Math.floor(level ?? 1)));
}

function getUnlockedBarbarianFeatures(level: number | undefined): Set<CLASS_FEATURE> {
  const normalizedLevel = getNormalizedLevel(level);

  return barbarianFeatures
    .filter((row) => row.level <= normalizedLevel)
    .reduce((featureSet, row) => {
      row.classFeatures.forEach((feature) => {
        featureSet.add(feature);
      });

      return featureSet;
    }, new Set<CLASS_FEATURE>());
}

function getBarbarianFeatureRow(level: number | undefined) {
  const normalizedLevel = getNormalizedLevel(level);
  const matchingRows = barbarianFeatures
    .filter((row) => row.level <= normalizedLevel)
    .sort((left, right) => left.level - right.level);

  return matchingRows[matchingRows.length - 1] ?? null;
}

export function getBarbarianSubclassContributionRageState(
  character: BarbarianSubclassContributionCharacter
): CharacterRageFeatureState {
  const value = character.classFeatureState?.rage;
  const record =
    value && typeof value === "object" ? (value as Partial<CharacterRageFeatureState>) : {};
  const usesExpended = Number(record.usesExpended);

  return {
    ...record,
    usesExpended: Number.isFinite(usesExpended) ? Math.max(0, Math.floor(usesExpended)) : 0,
    active: record.active === true
  };
}

export function getBarbarianSubclassContributionRageUsesTotal(
  character: BarbarianSubclassContributionCharacter
): number {
  if (
    character.className !== "Barbarian" ||
    !getUnlockedBarbarianFeatures(character.level).has(CLASS_FEATURE.RAGE)
  ) {
    return 0;
  }

  return getBarbarianFeatureRow(character.level)?.rages ?? 0;
}

export function getBarbarianSubclassContributionRageUsesRemaining(
  character: BarbarianSubclassContributionCharacter,
  rageState = getBarbarianSubclassContributionRageState(character)
): number {
  return Math.max(
    0,
    getBarbarianSubclassContributionRageUsesTotal(character) - rageState.usesExpended
  );
}

export function getBarbarianSubclassContributionRageDamageBonus(
  character: BarbarianSubclassContributionCharacter
): number {
  if (
    character.className !== "Barbarian" ||
    !getUnlockedBarbarianFeatures(character.level).has(CLASS_FEATURE.RAGE)
  ) {
    return 0;
  }

  return getBarbarianFeatureRow(character.level)?.rageDamage ?? 0;
}

export function isBarbarianSubclassContributionRaging(
  character: BarbarianSubclassContributionCharacter,
  rageState = getBarbarianSubclassContributionRageState(character)
): boolean {
  return (
    character.className === "Barbarian" &&
    getUnlockedBarbarianFeatures(character.level).has(CLASS_FEATURE.RAGE) &&
    rageState.active === true
  );
}
