import {
  getCantripLimitForCharacter,
  getCantripSelectionOptionsForCharacter
} from "../../../../../pages/CharactersPage/spellcasting";
import {
  getDruidWildShapeKnownFormsForCharacter,
  getDruidWildShapeRulesForCharacter,
  setDruidCircleOfTheLandChoiceForCharacter,
  setDruidElementalFuryChoiceForCharacter,
  setDruidPrimalOrderChoiceForCharacter,
  setDruidWildShapeKnownFormsForCharacter
} from "../../../../../pages/CharactersPage/classFeatures";
import type { MonsterRecord } from "../../../../../types";
import { recomputeCharacterFeatureProficiencies, type ClassFeatureChoiceModelArgs } from "./shared";

export function createDruidFeatureChoiceModel({
  character,
  onPersistCharacter
}: ClassFeatureChoiceModelArgs) {
  function updateDruidPrimalOrderChoice(choice: "magician" | "warden") {
    onPersistCharacter((currentCharacter) => {
      const nextCharacter = setDruidPrimalOrderChoiceForCharacter(currentCharacter, choice);
      const nextProficientCharacter = recomputeCharacterFeatureProficiencies(nextCharacter);
      const cantripLimit = getCantripLimitForCharacter(
        nextProficientCharacter.className,
        nextProficientCharacter.level,
        nextProficientCharacter.classFeatureState
      );
      const cantripSelectionOptionIds = new Set(
        getCantripSelectionOptionsForCharacter(
          nextProficientCharacter.className,
          nextProficientCharacter.level
        ).map((spell) => spell.id)
      );

      return {
        ...nextProficientCharacter,
        cantripIds: [...new Set(nextProficientCharacter.cantripIds ?? [])]
          .filter((spellId) => cantripSelectionOptionIds.has(spellId))
          .slice(0, cantripLimit ?? Number.POSITIVE_INFINITY)
      };
    });
  }

  function updateDruidCircleOfTheLandChoice(choice: "arid" | "polar" | "temperate" | "tropical") {
    onPersistCharacter((currentCharacter) =>
      setDruidCircleOfTheLandChoiceForCharacter(currentCharacter, choice)
    );
  }

  function updateDruidElementalFuryChoice(choice: "potent-spellcasting" | "primal-strike") {
    onPersistCharacter((currentCharacter) =>
      setDruidElementalFuryChoiceForCharacter(currentCharacter, choice)
    );
  }

  function getDruidWildShapeKnownForms(): MonsterRecord[] {
    return getDruidWildShapeKnownFormsForCharacter(character);
  }

  function getDruidWildShapeRules() {
    return getDruidWildShapeRulesForCharacter(character);
  }

  function updateDruidWildShapeKnownForms(monsters: MonsterRecord[]) {
    onPersistCharacter((currentCharacter) =>
      setDruidWildShapeKnownFormsForCharacter(currentCharacter, monsters)
    );
  }

  return {
    getDruidWildShapeKnownForms,
    getDruidWildShapeRules,
    updateDruidCircleOfTheLandChoice,
    updateDruidElementalFuryChoice,
    updateDruidPrimalOrderChoice,
    updateDruidWildShapeKnownForms
  };
}
