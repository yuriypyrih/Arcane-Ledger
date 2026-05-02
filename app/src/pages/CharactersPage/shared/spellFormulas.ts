import { ABILITY_TYPES, type SpellEntry } from "../../../codex/entries";
import type { RollMode } from "../../../types";
import type { AbilityKey, Character } from "../../../types";
import { isInnateSorceryActiveForSpell } from "../classFeatures/sorcerer/innateSorcerySpell";
import { getAbilityModifierForCharacter } from "../abilities";
import { getProficiencyBonus } from "../gameplay";
import {
  formatD20Formula,
  formatFormulaCell,
  formatFormulaRangeLabel,
  formatFormulaTerms,
  formatSignedFormulaTerm,
  parseFormulaRange
} from "./formulas";

export type SpellFormulaCell = {
  label: string;
  content: string;
  breakdown?: string;
};

export type SpellAttackRollFormula = {
  formula: string;
  formulaDisplay: string;
  attackBonus: number;
  rollMode?: RollMode;
  hasInnateSorceryAdvantage?: boolean;
};

const spellcastingAbilityByClassName: Record<string, AbilityKey> = {
  Artificer: "INT",
  Bard: "CHA",
  Cleric: "WIS",
  Druid: "WIS",
  Paladin: "CHA",
  Ranger: "WIS",
  Sorcerer: "CHA",
  Warlock: "CHA",
  Wizard: "INT"
};

const spellcastingAbilityBySubclassId: Record<string, AbilityKey> = {
  "fighter-eldritch-knight": "INT",
  "monk-warrior-of-the-elements": "WIS",
  "rogue-arcane-trickster": "INT"
};

const abilityNameByAbilityType: Record<ABILITY_TYPES, string> = {
  [ABILITY_TYPES.STR]: "Strength",
  [ABILITY_TYPES.DEX]: "Dexterity",
  [ABILITY_TYPES.CON]: "Constitution",
  [ABILITY_TYPES.INT]: "Intelligence",
  [ABILITY_TYPES.WIS]: "Wisdom",
  [ABILITY_TYPES.CHA]: "Charisma"
};

function getSavingThrowDcLabel(ability: ABILITY_TYPES | null | undefined): string {
  return ability ? `${abilityNameByAbilityType[ability]} DC` : "Spell Save DC";
}

export function getSpellcastingAbilityForCharacter(character: Character): AbilityKey | null {
  if (character.subclassId) {
    const subclassAbility = spellcastingAbilityBySubclassId[character.subclassId];

    if (subclassAbility) {
      return subclassAbility;
    }
  }

  return spellcastingAbilityByClassName[character.className] ?? null;
}

export function getSpellSaveFormulaCell(
  spell: Pick<
    SpellEntry,
    "isAttackSpell" | "isSavingThrowSpell" | "savingThrowAbility" | "spellLists"
  >,
  character?: Character | null,
  spellcastingAbilityOverride?: AbilityKey | null
): SpellFormulaCell | null {
  if (spell.isSavingThrowSpell !== true) {
    return null;
  }

  const saveLabel = getSavingThrowDcLabel(spell.savingThrowAbility);
  const spellcastingAbility =
    spellcastingAbilityOverride ?? (character ? getSpellcastingAbilityForCharacter(character) : null);

  if (!character || !spellcastingAbility) {
    const formulaCell = formatFormulaCell({
      formula: "8",
      displayTerms: ["DC 8 (Base)", "+ Prof. Bonus", "+ Spellcasting Ability Mod"]
    });

    return {
      label: "Spell DC Formula",
      content: `${saveLabel} = ${formulaCell.value}`,
      breakdown: formulaCell.breakdown
    };
  }

  const proficiencyBonus = getProficiencyBonus(character.level ?? 1);
  const abilityModifier = getAbilityModifierForCharacter(character, spellcastingAbility);
  const innateSorceryBonus = isInnateSorceryActiveForSpell(character, spell) ? 1 : 0;
  const dc = 8 + proficiencyBonus + abilityModifier + innateSorceryBonus;
  const formulaCell = formatFormulaCell({
    formula: String(dc),
    displayTerms: [
      "DC 8 (Base)",
      formatSignedFormulaTerm(proficiencyBonus, "Prof. Bonus"),
      formatSignedFormulaTerm(abilityModifier, spellcastingAbility),
      innateSorceryBonus > 0 ? formatSignedFormulaTerm(innateSorceryBonus, "Innate Sorcery") : null
    ]
  });

  return {
    label: "Spell DC Formula",
    content: `${saveLabel} ${dc} = ${formulaCell.value}`,
    breakdown: formulaCell.breakdown
  };
}

export function getSpellAttackRollFormulaForCharacter(
  spell: Pick<SpellEntry, "isAttackSpell" | "isSavingThrowSpell" | "spellLists">,
  character: Character,
  spellcastingAbilityOverride?: AbilityKey | null
): SpellAttackRollFormula | null {
  if (spell.isAttackSpell !== true) {
    return null;
  }

  const spellcastingAbility =
    spellcastingAbilityOverride ?? getSpellcastingAbilityForCharacter(character);

  if (!spellcastingAbility) {
    return null;
  }

  const proficiencyBonus = getProficiencyBonus(character.level ?? 1);
  const abilityModifier = getAbilityModifierForCharacter(character, spellcastingAbility);
  const attackBonus = proficiencyBonus + abilityModifier;
  const innateSorceryActive = isInnateSorceryActiveForSpell(character, spell);
  const displayTerms = [
    "1d20",
    formatSignedFormulaTerm(proficiencyBonus, "Prof. Bonus"),
    formatSignedFormulaTerm(abilityModifier, spellcastingAbility)
  ];

  return {
    formula: formatD20Formula(attackBonus),
    formulaDisplay: formatFormulaTerms(displayTerms),
    attackBonus,
    rollMode: innateSorceryActive ? "advantage" : undefined,
    hasInnateSorceryAdvantage: innateSorceryActive
  };
}

export function getSpellAttackFormulaCell(
  spell: Pick<SpellEntry, "isAttackSpell" | "isSavingThrowSpell" | "spellLists">,
  character?: Character | null,
  spellcastingAbilityOverride?: AbilityKey | null
): SpellFormulaCell | null {
  if (spell.isAttackSpell !== true) {
    return null;
  }

  const attackRollFormula = character
    ? getSpellAttackRollFormulaForCharacter(spell, character, spellcastingAbilityOverride)
    : null;

  if (!attackRollFormula) {
    const formulaCell = formatFormulaCell({
      formula: "1d20",
      displayTerms: ["1d20", "+ Prof. Bonus", "+ Spellcasting Ability Mod"]
    });

    return {
      label: "Spell Attack Formula",
      content: `Spell Attack = ${formulaCell.value}`,
      breakdown: formulaCell.breakdown
    };
  }

  const formulaCell = formatFormulaCell({
    formula: attackRollFormula.formula,
    displayTerms: [attackRollFormula.formulaDisplay],
    breakdownTerms: attackRollFormula.hasInnateSorceryAdvantage ? ["+Advantage"] : undefined
  });
  const attackRange = parseFormulaRange(attackRollFormula.formula);

  return {
    label: "Spell Attack Formula",
    content: `Spell Attack ${attackRange ? formatFormulaRangeLabel(attackRange) : attackRollFormula.attackBonus} = ${formulaCell.value}`,
    breakdown: formulaCell.breakdown
  };
}
