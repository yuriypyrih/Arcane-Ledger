import { sorcererFeatures } from "../../../../codex/classes";
import { CLASS_FEATURE, type SpellDescriptionEntry } from "../../../../codex/entries";
import type { Character } from "../../../../types";
import { createFeatureSourcedDescriptionEntries } from "../../actionModalDescriptions";
import { getFeatureDescriptionForCharacter } from "../featureDescriptions";

type SorcererDescriptionCharacter = Pick<Character, "className" | "level"> &
  Partial<Pick<Character, "subclassId">>;

function getUnlockedSorcererFeatures(level: number): Set<CLASS_FEATURE> {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));

  return sorcererFeatures
    .filter((row) => row.level <= normalizedLevel)
    .reduce((featureSet, row) => {
      row.classFeatures.forEach((feature) => {
        featureSet.add(feature);
      });

      return featureSet;
    }, new Set<CLASS_FEATURE>());
}

function hasSorcererFeature(
  character: Pick<Character, "className" | "level">,
  feature: CLASS_FEATURE
): boolean {
  return (
    character.className === "Sorcerer" && getUnlockedSorcererFeatures(character.level).has(feature)
  );
}

function getSorcererFeatureDescriptionSection(
  character: SorcererDescriptionCharacter,
  feature: CLASS_FEATURE,
  options: {
    start?: number;
    take?: number;
  } = {}
): SpellDescriptionEntry[] | null {
  const description = getFeatureDescriptionForCharacter(character, feature);
  const start = Math.max(0, options.start ?? 0);
  const end = options.take === undefined ? undefined : start + Math.max(0, options.take);
  const injectedDescription = description.slice(start, end);
  const section = createFeatureSourcedDescriptionEntries(character, feature, injectedDescription);

  return section.length > 0 ? section : null;
}

export function getSorcererInnateSorceryDescriptionAdditions(
  character: SorcererDescriptionCharacter
): SpellDescriptionEntry[][] {
  if (!hasSorcererFeature(character, CLASS_FEATURE.SORCERY_INCARNATE)) {
    return [];
  }

  const section = getSorcererFeatureDescriptionSection(character, CLASS_FEATURE.SORCERY_INCARNATE, {
    take: 1
  });

  return section ? [section] : [];
}

export function getSorcererMetamagicDescriptionAdditions(
  character: SorcererDescriptionCharacter
): SpellDescriptionEntry[][] {
  const descriptionAdditions: SpellDescriptionEntry[][] = [];

  if (hasSorcererFeature(character, CLASS_FEATURE.SORCERY_INCARNATE)) {
    const section = getSorcererFeatureDescriptionSection(
      character,
      CLASS_FEATURE.SORCERY_INCARNATE,
      {
        start: 1,
        take: 1
      }
    );

    if (section) {
      descriptionAdditions.push(section);
    }
  }

  if (hasSorcererFeature(character, CLASS_FEATURE.ARCANE_APOTHEOSIS)) {
    const section = getSorcererFeatureDescriptionSection(
      character,
      CLASS_FEATURE.ARCANE_APOTHEOSIS
    );

    if (section) {
      descriptionAdditions.push(section);
    }
  }

  return descriptionAdditions;
}
