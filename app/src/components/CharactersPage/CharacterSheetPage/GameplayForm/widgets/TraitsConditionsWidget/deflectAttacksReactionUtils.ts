import { getAbilityModifierForCharacter } from "../../../../../../pages/CharactersPage/abilities";
import {
  getMonkMartialArtsDieForCharacter,
  type FeatureActionFact
} from "../../../../../../pages/CharactersPage/classFeatures";
import {
  formatFormulaCell,
  formatFormulaTerms,
  formatSignedFormulaTerm
} from "../../../../../../pages/CharactersPage/shared/formulas";
import type { Character } from "../../../../../../types";
import type { DiceRollerRequest } from "../../../../../DicePage/DiceRollerPopup";
import type { DICE } from "../../../../../../codex/entries";

const deflectAttacksLabel = "Deflect Attacks";
const reflectedDamageLabel = "Reflected Damage";

function formatSignedFormula(baseTerm: string, modifiers: number[]): string {
  return modifiers.reduce((formula, modifier) => {
    if (modifier === 0) {
      return formula;
    }

    return `${formula} ${modifier > 0 ? "+" : "-"} ${Math.abs(modifier)}`;
  }, baseTerm);
}

function formatDamageFormula(die: DICE): string {
  return `2${String(die).toLowerCase()}`;
}

function formatLabeledModifier(value: number, label: string): string | null {
  if (value === 0) {
    return null;
  }

  return formatSignedFormulaTerm(value, label);
}

function formatFormulaValue(formula: string, terms: string[], resultLabel: string): string {
  return formatFormulaCell({
    formula,
    displayTerms: terms,
    resultLabel
  }).value;
}

export function getDeflectAttacksReactionFacts(
  character: Pick<Character, "abilities" | "classFeatureState" | "className" | "feats" | "level">
): FeatureActionFact[] {
  const monkMartialArtsDie = getMonkMartialArtsDieForCharacter(character);
  const dexterityModifier = getAbilityModifierForCharacter(character, "DEX");
  const monkLevel = Math.max(0, Math.floor(character.level ?? 0));
  const deflectFormula = formatSignedFormula("1d10", [dexterityModifier, monkLevel]);
  const reflectedDamageFormula = monkMartialArtsDie
    ? formatSignedFormula(formatDamageFormula(monkMartialArtsDie), [dexterityModifier])
    : null;

  return [
    {
      label: "Reduced Damage Formula",
      value: formatFormulaValue(
        deflectFormula,
        [
          "1d10",
          formatLabeledModifier(dexterityModifier, "DEX"),
          monkLevel > 0 ? `+ ${monkLevel} Monk Level` : null
        ].filter((term): term is string => term !== null),
        "Damage Reduction"
      ),
      fullWidth: true
    },
    ...(reflectedDamageFormula
      ? [
          {
            label: "Reflected Damage Formula",
            value: formatFormulaValue(
              reflectedDamageFormula,
              [
                formatDamageFormula(monkMartialArtsDie!),
                formatLabeledModifier(dexterityModifier, "DEX")
              ].filter((term): term is string => term !== null),
              "Damage"
            ),
            fullWidth: true
          }
        ]
      : [])
  ];
}

export function getSlowFallReactionFacts(character: Pick<Character, "level">): FeatureActionFact[] {
  const monkLevel = Math.max(0, Math.floor(character.level ?? 0));
  const reducedDamage = monkLevel * 5;

  return [
    {
      label: "Fall Damage Reduction formula",
      value: `${reducedDamage} = 5 x ${monkLevel} Monk Level`,
      fullWidth: true
    }
  ];
}

export function createDeflectAttacksReactionRollRequest(
  character: Pick<Character, "abilities" | "classFeatureState" | "className" | "feats" | "level">
): DiceRollerRequest | null {
  const monkMartialArtsDie = getMonkMartialArtsDieForCharacter(character);

  if (!monkMartialArtsDie) {
    return null;
  }

  const dexterityModifier = getAbilityModifierForCharacter(character, "DEX");

  return {
    title: deflectAttacksLabel,
    entries: [
      {
        label: deflectAttacksLabel,
        formula: formatSignedFormula("1d10", [dexterityModifier, character.level]),
        formulaDisplay: formatFormulaTerms(
          [
            "1d10",
            formatLabeledModifier(dexterityModifier, "DEX"),
            `+ ${character.level} Monk Level`
          ].filter((term): term is string => term !== null)
        )
      },
      {
        label: reflectedDamageLabel,
        formula: formatSignedFormula(formatDamageFormula(monkMartialArtsDie), [dexterityModifier]),
        formulaDisplay: formatFormulaTerms(
          [
            formatDamageFormula(monkMartialArtsDie),
            formatLabeledModifier(dexterityModifier, "DEX")
          ].filter((term): term is string => term !== null)
        )
      }
    ]
  };
}
