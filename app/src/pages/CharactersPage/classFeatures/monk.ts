import { monkFeatures, type MonkFeatureClassObj } from "../../../codex/classes";
import { CLASS_FEATURE, DICE } from "../../../codex/entries";
import type { Character } from "../../../types";
import type { ArmorClassFeatureContext, FeatureArmorClassMode } from "./types";

type MonkMartialArtsContext = {
  hasWornBodyArmor: boolean;
  hasShieldEquipped: boolean;
  wieldsOnlyMonkWeaponsOrUnarmed: boolean;
};

function getMonkFeatureRow(level: number): MonkFeatureClassObj | null {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));
  const matchingRows = monkFeatures
    .filter((row) => row.level <= normalizedLevel)
    .sort((left, right) => left.level - right.level);

  return matchingRows.length > 0 ? matchingRows[matchingRows.length - 1] ?? null : null;
}

function getUnlockedMonkFeatures(level: number): Set<CLASS_FEATURE> {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));

  return monkFeatures
    .filter((row) => row.level <= normalizedLevel)
    .reduce((featureSet, row) => {
      row.classFeatures.forEach((feature) => {
        featureSet.add(feature);
      });

      return featureSet;
    }, new Set<CLASS_FEATURE>());
}

export function hasMonkFeature(
  character: Pick<Character, "className" | "level">,
  feature: CLASS_FEATURE
): boolean {
  if (character.className !== "Monk") {
    return false;
  }

  return getUnlockedMonkFeatures(character.level).has(feature);
}

export function getMonkMartialArtsDie(
  character: Pick<Character, "className" | "level">
): DICE | null {
  if (!hasMonkFeature(character, CLASS_FEATURE.MARTIAL_ARTS)) {
    return null;
  }

  return getMonkFeatureRow(character.level)?.martialArts ?? null;
}

export function canUseMonkMartialArts(
  character: Pick<Character, "className" | "level">,
  context: MonkMartialArtsContext
): boolean {
  if (!hasMonkFeature(character, CLASS_FEATURE.MARTIAL_ARTS)) {
    return false;
  }

  return (
    !context.hasWornBodyArmor &&
    !context.hasShieldEquipped &&
    context.wieldsOnlyMonkWeaponsOrUnarmed
  );
}

export function getMonkArmorClassModes(
  character: Pick<Character, "className" | "level">,
  context: ArmorClassFeatureContext
): FeatureArmorClassMode[] {
  if (
    !hasMonkFeature(character, CLASS_FEATURE.UNARMORED_DEFENSE) ||
    context.hasWornBodyArmor ||
    context.hasShieldEquipped
  ) {
    return [];
  }

  return [
    {
      key: "monk-unarmored-defense",
      label: "Unarmored Defense",
      baseValue: 10,
      abilityModifiers: ["DEX", "WIS"],
      shieldAllowed: false,
      detail: "Monk feature"
    }
  ];
}
