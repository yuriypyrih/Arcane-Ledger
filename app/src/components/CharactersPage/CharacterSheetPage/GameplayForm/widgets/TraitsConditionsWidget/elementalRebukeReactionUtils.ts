import { getAbilityModifierForCharacter } from "../../../../../../pages/CharactersPage/abilities";
import type { FeatureActionFact } from "../../../../../../pages/CharactersPage/classFeatures";
import {
  formatFormulaCell,
  formatFormulaTerms,
  formatSignedFormulaTerm
} from "../../../../../../pages/CharactersPage/shared/formulas";
import type { Character } from "../../../../../../types";
import type { DiceRollerRequest } from "../../../../../DicePage/DiceRollerPopup";

const elementalRebukeLabel = "Elemental Rebuke";
const elementalRebukeDamageLabel = "Damage";

function createElementalRebukeDamageFormula(charismaModifier: number): string {
  return `2d10${charismaModifier >= 0 ? "+" : ""}${charismaModifier}`;
}

function formatCharismaModifier(value: number): string {
  return formatSignedFormulaTerm(value, "CHA");
}

function formatElementalRebukeFormulaValue(character: Pick<Character, "abilities">): string {
  const charismaModifier = getAbilityModifierForCharacter(character, "CHA");
  const formula = createElementalRebukeDamageFormula(charismaModifier);
  const formulaDisplay = formatFormulaTerms(["2d10", formatCharismaModifier(charismaModifier)]);

  return formatFormulaCell({
    formula,
    displayTerms: [formulaDisplay],
    resultLabel: "Damage"
  }).value;
}

export function getElementalRebukeReactionFacts(
  character: Pick<Character, "abilities">
): FeatureActionFact[] {
  return [
    {
      label: "Damage Formula",
      value: formatElementalRebukeFormulaValue(character),
      fullWidth: true
    }
  ];
}

export function createElementalRebukeReactionRollRequest(
  character: Pick<Character, "abilities">
): DiceRollerRequest {
  const charismaModifier = getAbilityModifierForCharacter(character, "CHA");
  const formula = createElementalRebukeDamageFormula(charismaModifier);
  const formulaDisplay = formatFormulaTerms(["2d10", formatCharismaModifier(charismaModifier)]);

  return {
    title: elementalRebukeLabel,
    description: "Elemental Rebuke damage roll",
    formula,
    formulaDisplay,
    entries: [
      {
        label: elementalRebukeDamageLabel,
        formula,
        formulaDisplay
      }
    ]
  };
}
