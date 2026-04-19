import { CLASS_FEATURE, type SpellDescriptionEntry } from "../../../../codex/entries";
import type { Character } from "../../../../types";
import { getFeatureDescriptionForCharacter } from "../featureDescriptions";

export type DruidFeatureDescriptionCharacter = Pick<Character, "className" | "level"> &
  Partial<Pick<Character, "classFeatureState" | "subclassId">>;

const druidFeatureMinimumLevels: Partial<Record<CLASS_FEATURE, number>> = {
  [CLASS_FEATURE.WILD_SHAPE]: 2,
  [CLASS_FEATURE.ELEMENTAL_FURY]: 7,
  [CLASS_FEATURE.IMPROVED_ELEMENTAL_FURY]: 15,
  [CLASS_FEATURE.BEAST_SPELLS]: 18
};

export function hasDruidFeature(
  character: Pick<Character, "className" | "level">,
  feature: CLASS_FEATURE
): boolean {
  if (character.className !== "Druid") {
    return false;
  }

  const minimumLevel = druidFeatureMinimumLevels[feature];
  return typeof minimumLevel === "number" ? character.level >= minimumLevel : false;
}

export function getDruidFeatureDescription(
  character: DruidFeatureDescriptionCharacter,
  feature: CLASS_FEATURE
): SpellDescriptionEntry[] {
  return getFeatureDescriptionForCharacter(character, feature);
}

export function extractFeatureDescriptionSection(
  description: readonly SpellDescriptionEntry[],
  heading: string,
  options?: {
    stripHeading?: boolean;
  }
): SpellDescriptionEntry[] {
  const headingMarker = `<strong>${heading}</strong>`;
  const startIndex = description.findIndex(
    (entry) => typeof entry === "string" && entry.includes(headingMarker)
  );

  if (startIndex < 0) {
    return [];
  }

  const section: SpellDescriptionEntry[] = [];

  for (let index = startIndex; index < description.length; index += 1) {
    const entry = description[index]!;

    if (index > startIndex && typeof entry === "string" && entry.startsWith("<strong>")) {
      break;
    }

    if (index === startIndex && typeof entry === "string" && options?.stripHeading === true) {
      const strippedEntry = entry.replace(headingMarker, "").trim();

      if (strippedEntry.length > 0) {
        section.push(strippedEntry);
      }

      continue;
    }

    section.push(entry);
  }

  return section;
}

export function getDruidFeatureDescriptionSection(
  character: DruidFeatureDescriptionCharacter,
  feature: CLASS_FEATURE,
  heading: string,
  options?: {
    stripHeading?: boolean;
  }
): SpellDescriptionEntry[] {
  return extractFeatureDescriptionSection(
    getDruidFeatureDescription(character, feature),
    heading,
    options
  );
}

export function getDruidFeatureDescriptionSections(
  character: DruidFeatureDescriptionCharacter,
  feature: CLASS_FEATURE,
  headings: readonly string[],
  options?: {
    stripHeading?: boolean;
  }
): SpellDescriptionEntry[] {
  return headings.flatMap((heading) =>
    getDruidFeatureDescriptionSection(character, feature, heading, options)
  );
}
