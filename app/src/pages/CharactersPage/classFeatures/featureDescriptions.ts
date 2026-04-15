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

type FeatureDescriptionCharacter = Pick<Character, "className" | "level"> &
  Partial<Pick<Character, "subclassId">>;

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

function getBaseFeatureDetails(
  character: FeatureDescriptionCharacter,
  feature: CLASS_FEATURE
): FeatureMapEntry | null {
  const classEntry = getClassEntryByName(character.className);
  const matchingRow = [...(classEntry?.features ?? [])]
    .filter(
      (featureRow) =>
        featureRow.level <= character.level &&
        (featureRow.classFeatures.includes(feature) ||
          featureRow.featureOverrides?.[feature] !== undefined)
    )
    .sort((left, right) => right.level - left.level)[0];

  return (
    matchingRow?.featureOverrides?.[feature] ?? classFeatureMapsByName[character.className]?.[feature] ?? null
  );
}

export function getFeatureDescriptionForCharacter(
  character: FeatureDescriptionCharacter,
  feature: CLASS_FEATURE
): SpellDescriptionEntry[] {
  const subclass = getSelectedSubclassForCharacter(character);
  const subclassDetails = getSubclassFeatureDetails(subclass, character.level, feature);

  if (subclassDetails?.description.length) {
    return cloneDescription(subclassDetails.description);
  }

  return cloneDescription(getBaseFeatureDetails(character, feature)?.description);
}
