import { getAbilityModifierForCharacter } from "../../../../../../pages/CharactersPage/abilities";
import { parseRollFormulaRange } from "../../../../../../pages/CharactersPage/actionOutcome";
import {
  getMonkMartialArtsDieForCharacter,
  type FeatureActionFact
} from "../../../../../../pages/CharactersPage/classFeatures";
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

  return `${value > 0 ? "+" : "-"} ${Math.abs(value)} ${label}`;
}

function formatFormulaValue(formula: string, terms: string[]): string {
  const parsedRange = parseRollFormulaRange(formula);
  const formulaText = terms.filter(Boolean).join(" ");

  if (!parsedRange) {
    return formulaText;
  }

  if (parsedRange.minimum === parsedRange.maximum) {
    return `${parsedRange.minimum} = ${formulaText}`;
  }

  return `${parsedRange.minimum}~${parsedRange.maximum} = ${formulaText}`;
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
        ].filter((term): term is string => term !== null)
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
              ].filter((term): term is string => term !== null)
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
        formulaDisplay: [
          "1d10",
          formatLabeledModifier(dexterityModifier, "DEX"),
          `+ ${character.level} Monk Level`
        ]
          .filter((term): term is string => term !== null)
          .join(" ")
      },
      {
        label: reflectedDamageLabel,
        formula: formatSignedFormula(formatDamageFormula(monkMartialArtsDie), [dexterityModifier]),
        formulaDisplay: [
          formatDamageFormula(monkMartialArtsDie),
          formatLabeledModifier(dexterityModifier, "DEX")
        ]
          .filter((term): term is string => term !== null)
          .join(" ")
      }
    ]
  };
}
