import type { DicePoolRollResult, DiceSelection, RolledDie } from "../../types";
import { createDiceId } from "./createDiceId";
import { rollDie } from "./rollDie";
import { selectableDice } from "./constants";
import type { CustomDiceTerm } from "./customDice";

export function rollDicePool(
  selection: DiceSelection,
  customDiceTerms: CustomDiceTerm[] = []
): DicePoolRollResult {
  const dice: RolledDie[] = [];
  let total = 0;

  for (const sides of selectableDice) {
    const count = selection[sides];

    for (let index = 0; index < count; index += 1) {
      const value = rollDie(sides);
      dice.push({
        id: createDiceId(sides, index),
        sides,
        value,
        theme: sides === 100 ? "wildMagic" : "default"
      });
      total += value;
    }
  }

  for (const term of customDiceTerms) {
    for (let index = 0; index < term.count; index += 1) {
      const value = rollDie(term.sides);

      dice.push({
        id: createDiceId(term.sides, index),
        sides: term.sides,
        value,
        theme: "custom"
      });
      total += value;
    }
  }

  return {
    dice,
    total,
    breakdown: dice.map((die) => `d${die.sides}:${die.value}`).join("  ")
  };
}
