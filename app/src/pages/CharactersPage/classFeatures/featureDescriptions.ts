import {
  getClassEntryByName,
  type CLASS_FEATURE,
  type FeatureMapEntry,
  type SpellDescriptionEntry
} from "../../../codex/entries";
import {
  artificerFeatureMap,
  barbarianFeatureMap,
  bardFeatureMap,
  clericFeatureMap,
  druidFeatureMap,
  fighterFeatureMap,
  monkFeatureMap,
  paladinFeatureMap,
  rangerFeatureMap,
  rogueFeatureMap,
  sorcererFeatureMap,
  warlockFeatureMap,
  wizardFeatureMap
} from "../../../codex/classes";
import type { Character } from "../../../types";
import { getSelectedSubclassForCharacter, getSubclassFeatureDetails } from "../subclasses";

type FeatureDescriptionCharacter = Partial<Pick<Character, "className" | "level" | "subclassId">>;

export type FeatureDescriptionMetadata = {
  description: SpellDescriptionEntry[];
  level: number;
  name: string;
};

const classFeatureMapsByName: Record<string, Partial<Record<CLASS_FEATURE, FeatureMapEntry>>> = {
  Artificer: artificerFeatureMap,
  Barbarian: barbarianFeatureMap,
  Bard: bardFeatureMap,
  Cleric: clericFeatureMap,
  Druid: druidFeatureMap,
  Fighter: fighterFeatureMap,
  Monk: monkFeatureMap,
  Paladin: paladinFeatureMap,
  Ranger: rangerFeatureMap,
  Rogue: rogueFeatureMap,
  Sorcerer: sorcererFeatureMap,
  Warlock: warlockFeatureMap,
  Wizard: wizardFeatureMap
};

function cloneDescription(description?: string[]): SpellDescriptionEntry[] {
  return description ? [...description] : [];
}

function formatClassFeatureName(feature: CLASS_FEATURE): string {
  return feature
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function getBaseFeatureMetadata(
  character: FeatureDescriptionCharacter,
  feature: CLASS_FEATURE
): FeatureDescriptionMetadata | null {
  if (typeof character.className !== "string") {
    return null;
  }

  const normalizedLevel = Math.max(1, Math.floor(character.level ?? 1));
  const classEntry = getClassEntryByName(character.className);
  const matchingRow = [...(classEntry?.features ?? [])]
    .filter(
      (featureRow) =>
        featureRow.level <= normalizedLevel &&
        (featureRow.classFeatures.includes(feature) ||
          featureRow.featureOverrides?.[feature] !== undefined)
    )
    .sort((left, right) => right.level - left.level)[0];

  if (!matchingRow) {
    return null;
  }

  const details =
    matchingRow.featureOverrides?.[feature] ??
    classFeatureMapsByName[character.className]?.[feature];

  return details
    ? {
        description: cloneDescription(details.description),
        level: matchingRow.level,
        name: formatClassFeatureName(feature)
      }
    : null;
}

function getSubclassFeatureMetadata(
  character: FeatureDescriptionCharacter,
  feature: CLASS_FEATURE
): FeatureDescriptionMetadata | null {
  if (typeof character.className !== "string") {
    return null;
  }

  const normalizedLevel = Math.max(1, Math.floor(character.level ?? 1));
  const subclass = getSelectedSubclassForCharacter({
    className: character.className,
    subclassId: character.subclassId
  });
  const matchingRow = [...(subclass?.features ?? [])]
    .filter(
      (featureRow) =>
        featureRow.level <= normalizedLevel &&
        (featureRow.classFeatures.includes(feature) ||
          featureRow.featureOverrides?.[feature] !== undefined)
    )
    .sort((left, right) => right.level - left.level)[0];
  const details = matchingRow?.featureOverrides?.[feature];

  return details
    ? {
        description: cloneDescription(details.description),
        level: matchingRow.level,
        name: formatClassFeatureName(feature)
      }
    : null;
}

export function getFeatureDescriptionMetadataForCharacter(
  character: FeatureDescriptionCharacter,
  feature: CLASS_FEATURE
): FeatureDescriptionMetadata | null {
  return (
    getSubclassFeatureMetadata(character, feature) ?? getBaseFeatureMetadata(character, feature)
  );
}

export function getFeatureDescriptionForCharacter(
  character: FeatureDescriptionCharacter,
  feature: CLASS_FEATURE
): SpellDescriptionEntry[] {
  if (typeof character.className !== "string") {
    return [];
  }

  const normalizedLevel = Math.max(1, Math.floor(character.level ?? 1));
  const subclass = getSelectedSubclassForCharacter({
    className: character.className,
    subclassId: character.subclassId
  });
  const subclassDetails = getSubclassFeatureDetails(subclass, normalizedLevel, feature);

  if (subclassDetails?.description.length) {
    return cloneDescription(subclassDetails.description);
  }

  return getBaseFeatureMetadata(character, feature)?.description ?? [];
}
