import {
  CLASS_FEATURE,
  getSpellEntryByName,
  type SpellDescriptionEntry,
  type SpellEntry
} from "../../../../../codex/entries";
import type { Character, DruidCosmicOmenSelection } from "../../../../../types";
import {
  appendSourcedDescriptionAddition,
  createSourcedDescriptionEntries
} from "../../../actionModalDescriptions";
import { normalizeCharacterStatusEntries } from "../../../traits";
import { getDruidFeatureDescriptionSection } from "../druidFeatureDescriptionSections";
import { getFeatureDescriptionForCharacter } from "../../featureDescriptions";

type DruidCircleOfTheStarsDescriptionCharacter = Pick<Character, "className" | "level"> &
  Partial<Pick<Character, "subclassId" | "statusEntries">>;

const starMapSource = "Star Map";
const starryFormChaliceSource = "Starry Form / Chalice";
const twinklingConstellationsSource = "Twinkling Constellations";
const guidingBoltSpellId = getSpellEntryByName("Guiding Bolt")?.id ?? null;
const druidStarryFormStatusSourceId = "feature-druid-starry-form";
const starMapGuidingBoltDescriptionPrefixes = [
  "While holding the map, you have",
  "You can cast it in that way"
] as const;
const chaliceHeading = "Chalice.";
const cosmicOmenWealHeading = "Weal (even).";
const cosmicOmenWoeHeading = "Woe (odd).";
const cosmicOmenOptionHeadingMarkers = [
  `<strong>${cosmicOmenWealHeading}</strong>`,
  `<strong>${cosmicOmenWoeHeading}</strong>`
] as const;

function hasDruidCircleOfTheStarsStarMapFeature(
  character: DruidCircleOfTheStarsDescriptionCharacter
): boolean {
  return (
    character.className === "Druid" &&
    character.subclassId === "druid-circle-of-the-stars" &&
    Math.max(1, Math.min(20, Math.floor(character.level))) >= 3
  );
}

function getDruidCircleOfTheStarsGuidingBoltDescriptionEntries(
  character: DruidCircleOfTheStarsDescriptionCharacter
): SpellDescriptionEntry[] {
  if (!hasDruidCircleOfTheStarsStarMapFeature(character)) {
    return [];
  }

  return getFeatureDescriptionForCharacter(character, CLASS_FEATURE.STAR_MAP).filter(
    (entry) =>
      typeof entry === "string" &&
      starMapGuidingBoltDescriptionPrefixes.some((prefix) => entry.startsWith(prefix))
  );
}

export function getDruidCircleOfTheStarsGuidingBoltSpellEntry(
  character: DruidCircleOfTheStarsDescriptionCharacter,
  spell: SpellEntry
): SpellEntry {
  if (!guidingBoltSpellId || spell.id !== guidingBoltSpellId) {
    return spell;
  }

  const descriptionEntries = getDruidCircleOfTheStarsGuidingBoltDescriptionEntries(character);

  return descriptionEntries.length > 0
    ? appendSourcedDescriptionAddition(spell, starMapSource, descriptionEntries)
    : spell;
}

function hasActiveDruidChaliceForm(character: Partial<Pick<Character, "statusEntries">>): boolean {
  const activeEntry = normalizeCharacterStatusEntries(character.statusEntries).find(
    (entry) => entry.sourceId === druidStarryFormStatusSourceId
  );

  return (
    typeof activeEntry?.value === "string" && activeEntry.value.trim() === "Starry Form (Chalice)"
  );
}

function hasDruidCircleOfTheStarsTwinklingConstellationsFeature(
  character: DruidCircleOfTheStarsDescriptionCharacter
): boolean {
  return (
    character.className === "Druid" &&
    character.subclassId === "druid-circle-of-the-stars" &&
    Math.max(1, Math.min(20, Math.floor(character.level))) >= 10
  );
}

export function getDruidCircleOfTheStarsTwinklingConstellationsDescriptionEntries(
  character: DruidCircleOfTheStarsDescriptionCharacter
): SpellDescriptionEntry[] {
  return hasDruidCircleOfTheStarsTwinklingConstellationsFeature(character)
    ? getFeatureDescriptionForCharacter(character, CLASS_FEATURE.TWINKLING_CONSTELLATIONS)
    : [];
}

export function getDruidCircleOfTheStarsTwinklingConstellationsDescriptionAdditions(
  character: DruidCircleOfTheStarsDescriptionCharacter
): SpellDescriptionEntry[][] {
  const descriptionEntries =
    getDruidCircleOfTheStarsTwinklingConstellationsDescriptionEntries(character);

  return descriptionEntries.length > 0
    ? [createSourcedDescriptionEntries(twinklingConstellationsSource, descriptionEntries)]
    : [];
}

function getDruidCircleOfTheStarsChaliceDescriptionEntries(
  character: DruidCircleOfTheStarsDescriptionCharacter
): SpellDescriptionEntry[] {
  return getDruidFeatureDescriptionSection(character, CLASS_FEATURE.STARRY_FORM, chaliceHeading, {
    stripHeading: true
  });
}

export function getDruidCircleOfTheStarsChaliceHealingSpellEntry(
  character: DruidCircleOfTheStarsDescriptionCharacter,
  spell: SpellEntry,
  isPrepared: boolean
): SpellEntry {
  if (
    isPrepared !== true ||
    spell.isHealingSpell !== true ||
    !hasActiveDruidChaliceForm(character)
  ) {
    return spell;
  }

  const descriptionEntries = getDruidCircleOfTheStarsChaliceDescriptionEntries(character);
  const twinklingDescriptionEntries =
    getDruidCircleOfTheStarsTwinklingConstellationsDescriptionEntries(character);

  const nextSpell =
    descriptionEntries.length > 0
      ? appendSourcedDescriptionAddition(spell, starryFormChaliceSource, descriptionEntries)
      : spell;

  return twinklingDescriptionEntries.length > 0
    ? appendSourcedDescriptionAddition(
        nextSpell,
        twinklingConstellationsSource,
        twinklingDescriptionEntries
      )
    : nextSpell;
}

function hasDruidCircleOfTheStarsCosmicOmenFeature(
  character: DruidCircleOfTheStarsDescriptionCharacter
): boolean {
  return (
    character.className === "Druid" &&
    character.subclassId === "druid-circle-of-the-stars" &&
    Math.max(1, Math.min(20, Math.floor(character.level))) >= 6
  );
}

function getDruidCircleOfTheStarsCosmicOmenDescription(
  character: DruidCircleOfTheStarsDescriptionCharacter
): SpellDescriptionEntry[] {
  return hasDruidCircleOfTheStarsCosmicOmenFeature(character)
    ? getFeatureDescriptionForCharacter(character, CLASS_FEATURE.COSMIC_OMEN)
    : [];
}

function isCosmicOmenOptionEntry(entry: SpellDescriptionEntry): boolean {
  return (
    typeof entry === "string" &&
    cosmicOmenOptionHeadingMarkers.some((headingMarker) => entry.includes(headingMarker))
  );
}

export function getDruidCircleOfTheStarsCosmicOmenIntroDescriptionEntries(
  character: DruidCircleOfTheStarsDescriptionCharacter
): SpellDescriptionEntry[] {
  const description = getDruidCircleOfTheStarsCosmicOmenDescription(character);
  const firstOptionIndex = description.findIndex(isCosmicOmenOptionEntry);

  return firstOptionIndex >= 0 ? description.slice(0, firstOptionIndex) : description;
}

export function getDruidCircleOfTheStarsCosmicOmenUsesDescriptionEntries(
  character: DruidCircleOfTheStarsDescriptionCharacter
): SpellDescriptionEntry[] {
  const description = getDruidCircleOfTheStarsCosmicOmenDescription(character);
  let lastOptionIndex = -1;

  description.forEach((entry, index) => {
    if (isCosmicOmenOptionEntry(entry)) {
      lastOptionIndex = index;
    }
  });

  return lastOptionIndex >= 0 ? description.slice(lastOptionIndex + 1) : [];
}

export function getDruidCircleOfTheStarsCosmicOmenOptionDescriptionEntries(
  character: DruidCircleOfTheStarsDescriptionCharacter,
  selection: DruidCosmicOmenSelection
): SpellDescriptionEntry[] {
  return getDruidFeatureDescriptionSection(
    character,
    CLASS_FEATURE.COSMIC_OMEN,
    selection === "woe" ? cosmicOmenWoeHeading : cosmicOmenWealHeading,
    {
      stripHeading: true
    }
  );
}
