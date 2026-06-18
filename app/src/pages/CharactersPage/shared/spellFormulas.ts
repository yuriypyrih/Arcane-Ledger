import { ABILITY_TYPES, type SpellEntry } from "../../../codex/entries";
import type { RollMode } from "../../../types";
import type { AbilityKey, Character } from "../../../types";
import { isInnateSorceryActiveForSpell } from "../classFeatures/sorcerer/innateSorcerySpell";
import { getAbilityModifierForCharacter } from "../abilities";
import { getProficiencyBonus } from "../gameplay";
import { getExhaustionD20TestPenalty } from "../statusEntries";
import { getCharacterCustomTraitEffectInput } from "../characterRuntime/customEffectRuntime";
import {
  formatCustomTraitBonusFormulaTerm,
  formatCustomTraitBonusRollFormulaTerm,
  getCustomTraitSpellAttackBonuses,
  getCustomTraitSpellAttackRollIndicators,
  getCustomTraitSpellDcBonuses,
  type CustomTraitFlatBonus,
  type CustomTraitRollIndicator
} from "../customTraitEffects";
import {
  formatD20Formula,
  formatFormulaBreakdown,
  formatFormulaCell,
  formatFormulaRangeLabel,
  formatFormulaTerms,
  formatSignedFormulaTerm,
  parseFormulaRange
} from "./formulas";
import { getSpellcastingAbilityForCharacter } from "./spellcastingAbility";
export {
  getBuiltInSpellcastingAbilityForCharacter,
  getSpellcastingAbilityForCharacter,
  getSpellcastingAbilityForCharacterSpell
} from "./spellcastingAbility";

export type SpellFormulaCell = {
  label: string;
  content: string;
  breakdown?: string;
};

export type SpellAttackRollFormula = {
  formula: string;
  formulaDisplay: string;
  formulaBreakdownTerms: string[];
  attackBonus: number;
  rollMode?: RollMode;
  hasInnateSorceryAdvantage?: boolean;
  rollModeBreakdownTerms?: string[];
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

function dedupeLabels(labels: string[]): string[] {
  return [...new Set(labels.map((label) => label.trim()).filter(Boolean))];
}

function formatRollModeSourceSuffix(sources: string[]): string {
  const dedupedSources = dedupeLabels(sources);
  return dedupedSources.length > 0 ? ` (${dedupedSources.join(", ")})` : "";
}

function stripLeadingFormulaPlus(term: string): string {
  return term.trim().replace(/^\+\s*/, "");
}

function formatSpellAttackFormulaBreakdown(
  formulaBreakdownTerms: string[],
  rollModeBreakdownTerms: string[] = []
): string | undefined {
  const normalizedFormulaTerms = formulaBreakdownTerms
    .map((term, index) => (index === 0 ? stripLeadingFormulaPlus(term) : term.trim()))
    .filter(Boolean);
  const normalizedRollModeTerms = rollModeBreakdownTerms
    .map(stripLeadingFormulaPlus)
    .filter(Boolean);
  const formulaBreakdown = formatFormulaBreakdown(normalizedFormulaTerms);

  if (!formulaBreakdown) {
    return normalizedRollModeTerms.length > 0
      ? `[= ${normalizedRollModeTerms.join("; ")}]`
      : undefined;
  }

  if (normalizedRollModeTerms.length === 0) {
    return formulaBreakdown;
  }

  return `${formulaBreakdown.replace(/\]$/, "")}; ${normalizedRollModeTerms.join("; ")}]`;
}

function getSpellAttackRollModeState(
  innateSorceryActive: boolean,
  customIndicators: CustomTraitRollIndicator[]
): Pick<SpellAttackRollFormula, "rollMode" | "rollModeBreakdownTerms"> {
  const advantageSources = [
    innateSorceryActive ? "Innate Sorcery" : null,
    ...customIndicators
      .filter((indicator) => indicator.tone === "advantage")
      .map((indicator) => indicator.source)
  ].filter((source): source is string => source !== null);
  const disadvantageSources = customIndicators
    .filter((indicator) => indicator.tone === "disadvantage")
    .map((indicator) => indicator.source);
  const hasAdvantage = advantageSources.length > 0;
  const hasDisadvantage = disadvantageSources.length > 0;

  if (hasAdvantage && hasDisadvantage) {
    return {
      rollMode: "normal",
      rollModeBreakdownTerms: [
        `Advantage/Disadvantage neutralized${formatRollModeSourceSuffix([
          ...advantageSources,
          ...disadvantageSources
        ])}`
      ]
    };
  }

  if (hasAdvantage) {
    return {
      rollMode: "advantage",
      rollModeBreakdownTerms: [
        `+Advantage${formatRollModeSourceSuffix(advantageSources)}`
      ]
    };
  }

  if (hasDisadvantage) {
    return {
      rollMode: "disadvantage",
      rollModeBreakdownTerms: [
        `+Disadvantage${formatRollModeSourceSuffix(disadvantageSources)}`
      ]
    };
  }

  return {};
}

function getResolvedCustomTraitBonusValue(
  character: Character,
  bonus: CustomTraitFlatBonus
): number {
  if (!bonus.abilityModifierSource) {
    return bonus.value;
  }

  return (
    getAbilityModifierForCharacter(character, bonus.abilityModifierSource) *
    (bonus.abilityModifierMultiplier ?? 1)
  );
}

function getResolvedCustomTraitFormulaEntries(
  character: Character,
  bonuses: CustomTraitFlatBonus[]
): Array<{ value: number; formulaTerm: string | null; rollFormulaTerm: string | null }> {
  return bonuses.flatMap((bonus) => {
    const value = getResolvedCustomTraitBonusValue(character, bonus);
    const rollFormulaTerm = formatCustomTraitBonusRollFormulaTerm(bonus);

    if (value === 0 && !rollFormulaTerm) {
      return [];
    }

    return [
      {
        value,
        formulaTerm: formatCustomTraitBonusFormulaTerm({
          ...bonus,
          value
        }),
        rollFormulaTerm
      }
    ];
  });
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
  const customTraitEffectInput = getCharacterCustomTraitEffectInput(character);
  const customDcEntries = getResolvedCustomTraitFormulaEntries(
    character,
    getCustomTraitSpellDcBonuses(customTraitEffectInput)
  );
  const customDcBonus = customDcEntries.reduce((total, entry) => total + entry.value, 0);
  const dc = 8 + proficiencyBonus + abilityModifier + innateSorceryBonus + customDcBonus;
  const formulaCell = formatFormulaCell({
    formula: String(dc),
    displayTerms: [
      "DC 8 (Base)",
      formatSignedFormulaTerm(proficiencyBonus, "Prof. Bonus"),
      formatSignedFormulaTerm(abilityModifier, spellcastingAbility),
      innateSorceryBonus > 0 ? formatSignedFormulaTerm(innateSorceryBonus, "Innate Sorcery") : null,
      ...customDcEntries.map((entry) => entry.formulaTerm)
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
  const exhaustionPenalty = getExhaustionD20TestPenalty(character.statusEntries);
  const customTraitEffectInput = getCharacterCustomTraitEffectInput(character);
  const customAttackEntries = getResolvedCustomTraitFormulaEntries(
    character,
    getCustomTraitSpellAttackBonuses(customTraitEffectInput)
  );
  const customAttackBonus = customAttackEntries.reduce((total, entry) => total + entry.value, 0);
  const attackBonus = proficiencyBonus + abilityModifier + exhaustionPenalty + customAttackBonus;
  const innateSorceryActive = isInnateSorceryActiveForSpell(character, spell);
  const rollModeState = getSpellAttackRollModeState(
    innateSorceryActive,
    getCustomTraitSpellAttackRollIndicators(customTraitEffectInput)
  );
  const formulaBreakdownTerms = [
    formatSignedFormulaTerm(proficiencyBonus, "Prof. Bonus"),
    formatSignedFormulaTerm(abilityModifier, spellcastingAbility),
    exhaustionPenalty !== 0 ? formatSignedFormulaTerm(exhaustionPenalty, "Exhaustion") : null,
    ...customAttackEntries.map((entry) => entry.formulaTerm)
  ].filter((term): term is string => term !== null);
  const displayTerms = ["1d20", ...formulaBreakdownTerms];

  return {
    formula: formatFormulaTerms([
      formatD20Formula(attackBonus),
      ...customAttackEntries.map((entry) => entry.rollFormulaTerm)
    ]),
    formulaDisplay: formatFormulaTerms(displayTerms),
    formulaBreakdownTerms,
    attackBonus,
    rollMode: rollModeState.rollMode,
    hasInnateSorceryAdvantage: innateSorceryActive,
    rollModeBreakdownTerms: rollModeState.rollModeBreakdownTerms
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
      formula: "1d20"
    });

    return {
      label: "Spell Attack Formula",
      content: `Spell Attack = ${formulaCell.value}`,
      breakdown: formatSpellAttackFormulaBreakdown([
        "Prof. Bonus",
        "+ Spellcasting Ability Mod"
      ])
    };
  }

  const formulaCell = formatFormulaCell({
    formula: attackRollFormula.formula
  });
  const attackRange = parseFormulaRange(attackRollFormula.formula);

  return {
    label: "Spell Attack Formula",
    content: `Spell Attack ${attackRange ? formatFormulaRangeLabel(attackRange) : attackRollFormula.attackBonus} = ${formulaCell.value}`,
    breakdown: formatSpellAttackFormulaBreakdown(
      attackRollFormula.formulaBreakdownTerms,
      attackRollFormula.rollModeBreakdownTerms
    )
  };
}
