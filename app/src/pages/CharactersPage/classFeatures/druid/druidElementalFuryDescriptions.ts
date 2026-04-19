import { getSpellEntriesForClassName } from "../../../../codex/classes";
import {
  CLASS_FEATURE,
  WEAPON_COMBAT_TYPE,
  type SpellDescriptionEntry,
  type SpellEntry
} from "../../../../codex/entries";
import type { DruidElementalFuryChoice } from "../../../../types";
import { appendSourcedDescriptionAddition } from "../../actionModalDescriptions";
import type { WeaponAction } from "../../gameplay";
import {
  type DruidFeatureDescriptionCharacter,
  getDruidFeatureDescriptionSection,
  hasDruidFeature
} from "./druidFeatureDescriptionSections";

type DruidElementalFuryCharacter = DruidFeatureDescriptionCharacter;

const potentSpellcastingSource = "Elemental Fury / Potent Spellcasting";
const improvedPotentSpellcastingSource = "Improved Elemental Fury / Potent Spellcasting";
const primalStrikeSource = "Elemental Fury / Primal Strike";
const improvedPrimalStrikeSource = "Improved Elemental Fury / Primal Strike";
const potentSpellcastingHeading = "Potent Spellcasting.";
const primalStrikeHeading = "Primal Strike.";

const druidCantripIds = new Set(
  getSpellEntriesForClassName("Druid")
    .filter((spell) => spell.spellLevel === 0)
    .map((spell) => spell.id)
);

function getSpellRangeFeet(spell: Pick<SpellEntry, "range">): number | null {
  const match = spell.range.match(/(\d+)\s*feet\b/i);

  if (!match) {
    return null;
  }

  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
}

function appendElementalFuryDescriptions<T extends SpellEntry | WeaponAction>(
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

export function isDruidPrimalStrikeEligibleAttack(
  action: Pick<WeaponAction, "attackKind" | "combatType">
): boolean {
  return (
    action.attackKind === "unarmed" ||
    (action.attackKind === "weapon" && action.combatType === WEAPON_COMBAT_TYPE.MELEE)
  );
}

function getWeaponDescriptionSections(
  character: DruidElementalFuryCharacter,
  elementalFuryChoice: DruidElementalFuryChoice | null
): Array<{
  source: string;
  description: SpellDescriptionEntry[];
}> {
  if (elementalFuryChoice !== "primal-strike") {
    return [];
  }

  const sections = [
    {
      source: primalStrikeSource,
      description: getDruidFeatureDescriptionSection(
        character,
        CLASS_FEATURE.ELEMENTAL_FURY,
        primalStrikeHeading,
        { stripHeading: true }
      )
    }
  ];

  if (hasDruidFeature(character, CLASS_FEATURE.IMPROVED_ELEMENTAL_FURY)) {
    sections.push({
      source: improvedPrimalStrikeSource,
      description: getDruidFeatureDescriptionSection(
        character,
        CLASS_FEATURE.IMPROVED_ELEMENTAL_FURY,
        primalStrikeHeading,
        { stripHeading: true }
      )
    });
  }

  return sections;
}

function getSpellDescriptionSections(
  character: DruidElementalFuryCharacter,
  elementalFuryChoice: DruidElementalFuryChoice | null,
  spell: SpellEntry
): Array<{
  source: string;
  description: SpellDescriptionEntry[];
}> {
  if (elementalFuryChoice !== "potent-spellcasting") {
    return [];
  }

  const isDruidCantrip = spell.spellLevel === 0 && druidCantripIds.has(spell.id);

  if (!isDruidCantrip) {
    return [];
  }

  const sections: Array<{
    source: string;
    description: SpellDescriptionEntry[];
  }> = [];

  if (spell.damage.length > 0) {
    sections.push({
      source: potentSpellcastingSource,
      description: getDruidFeatureDescriptionSection(
        character,
        CLASS_FEATURE.ELEMENTAL_FURY,
        potentSpellcastingHeading,
        { stripHeading: true }
      )
    });
  }

  if (
    hasDruidFeature(character, CLASS_FEATURE.IMPROVED_ELEMENTAL_FURY) &&
    (getSpellRangeFeet(spell) ?? 0) >= 10
  ) {
    sections.push({
      source: improvedPotentSpellcastingSource,
      description: getDruidFeatureDescriptionSection(
        character,
        CLASS_FEATURE.IMPROVED_ELEMENTAL_FURY,
        potentSpellcastingHeading,
        { stripHeading: true }
      )
    });
  }

  return sections;
}

export function getDruidElementalFuryWeaponAction(
  character: DruidElementalFuryCharacter,
  elementalFuryChoice: DruidElementalFuryChoice | null,
  action: WeaponAction
): WeaponAction {
  if (!isDruidPrimalStrikeEligibleAttack(action)) {
    return action;
  }

  return appendElementalFuryDescriptions(
    action,
    getWeaponDescriptionSections(character, elementalFuryChoice)
  );
}

export function getDruidElementalFurySpellEntry(
  character: DruidElementalFuryCharacter,
  elementalFuryChoice: DruidElementalFuryChoice | null,
  spell: SpellEntry
): SpellEntry {
  return appendElementalFuryDescriptions(
    spell,
    getSpellDescriptionSections(character, elementalFuryChoice, spell)
  );
}
