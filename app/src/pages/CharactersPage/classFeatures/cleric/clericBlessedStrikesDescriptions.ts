import { getSpellEntriesForClassName } from "../../../../codex/classes";
import {
  CLASS_FEATURE,
  type SpellDescriptionEntry,
  type SpellEntry
} from "../../../../codex/entries";
import type { Character, ClericBlessedStrikesChoice } from "../../../../types";
import { appendSourcedDescriptionAddition } from "../../actionModalDescriptions";
import type { WeaponAction } from "../../gameplay";
import { getFeatureDescriptionForCharacter } from "../featureDescriptions";
import { hasClericFeature } from "./clericFeatureState";

type ClericBlessedStrikesCharacter = Pick<Character, "className" | "level"> &
  Partial<Pick<Character, "classFeatureState">>;

const divineStrikeSource = "Blessed Strike / Divine Strike";
const potentSpellcastingSource = "Blessed Strikes / Potent Spellcasting";
const improvedDivineStrikeSource = "Improved Blessed Strikes / Divine Strike";
const improvedPotentSpellcastingSource = "Improved Blessed Strikes / Potent Spellcasting";
const divineStrikeHeading = "Divine Strike.";
const potentSpellcastingHeading = "Potent Spellcasting.";

const clericDamageCantripIds = new Set(
  getSpellEntriesForClassName("Cleric")
    .filter((spell) => spell.spellLevel === 0 && spell.damage.length > 0)
    .map((spell) => spell.id)
);

function extractFeatureDescriptionSection(
  description: readonly SpellDescriptionEntry[],
  heading: string
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

    if (index === startIndex && typeof entry === "string") {
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

function getClericFeatureSection(
  character: ClericBlessedStrikesCharacter,
  feature: CLASS_FEATURE,
  heading: string
): SpellDescriptionEntry[] {
  return extractFeatureDescriptionSection(
    getFeatureDescriptionForCharacter(character, feature),
    heading
  );
}

function appendBlessedStrikesDescriptions<T extends SpellEntry | WeaponAction>(
  value: T,
  sections: Array<{
    source: string;
    description: SpellDescriptionEntry[];
  }>
): T {
  return sections.reduce(
    (currentValue, section) =>
      section.description.length > 0
        ? appendSourcedDescriptionAddition(currentValue, section.source, section.description)
        : currentValue,
    value
  );
}

function getWeaponDescriptionSections(
  character: ClericBlessedStrikesCharacter,
  blessedStrikesChoice: ClericBlessedStrikesChoice | null
): Array<{
  source: string;
  description: SpellDescriptionEntry[];
}> {
  if (blessedStrikesChoice !== "blessed-strike") {
    return [];
  }

  const sections = [
    {
      source: divineStrikeSource,
      description: getClericFeatureSection(character, CLASS_FEATURE.BLESSED_STRIKES, divineStrikeHeading)
    }
  ];

  if (hasClericFeature(character, CLASS_FEATURE.IMPROVED_BLESSED_STRIKES)) {
    sections.push({
      source: improvedDivineStrikeSource,
      description: getClericFeatureSection(
        character,
        CLASS_FEATURE.IMPROVED_BLESSED_STRIKES,
        divineStrikeHeading
      )
    });
  }

  return sections;
}

function getSpellDescriptionSections(
  character: ClericBlessedStrikesCharacter,
  blessedStrikesChoice: ClericBlessedStrikesChoice | null
): Array<{
  source: string;
  description: SpellDescriptionEntry[];
}> {
  if (blessedStrikesChoice !== "potent-spellcasting") {
    return [];
  }

  const sections = [
    {
      source: potentSpellcastingSource,
      description: getClericFeatureSection(
        character,
        CLASS_FEATURE.BLESSED_STRIKES,
        potentSpellcastingHeading
      )
    }
  ];

  if (hasClericFeature(character, CLASS_FEATURE.IMPROVED_BLESSED_STRIKES)) {
    sections.push({
      source: improvedPotentSpellcastingSource,
      description: getClericFeatureSection(
        character,
        CLASS_FEATURE.IMPROVED_BLESSED_STRIKES,
        potentSpellcastingHeading
      )
    });
  }

  return sections;
}

export function getClericBlessedStrikesWeaponAction(
  character: ClericBlessedStrikesCharacter,
  blessedStrikesChoice: ClericBlessedStrikesChoice | null,
  action: WeaponAction
): WeaponAction {
  if (action.attackKind !== "weapon") {
    return action;
  }

  return appendBlessedStrikesDescriptions(
    action,
    getWeaponDescriptionSections(character, blessedStrikesChoice)
  );
}

export function getClericBlessedStrikesSpellEntry(
  character: ClericBlessedStrikesCharacter,
  blessedStrikesChoice: ClericBlessedStrikesChoice | null,
  spell: SpellEntry
): SpellEntry {
  if (spell.spellLevel !== 0 || !clericDamageCantripIds.has(spell.id)) {
    return spell;
  }

  return appendBlessedStrikesDescriptions(
    spell,
    getSpellDescriptionSections(character, blessedStrikesChoice)
  );
}
