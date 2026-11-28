import { useCallback, useEffect } from "react";
import type { Character } from "../../../../../types";
import type { PersistCharacterUpdater } from "../../../../../pages/CharactersPage/CharacterSheetPage/types";
import {
  getDeathSaveDescriptionAdditionsForCharacter,
  getDeathSaveNaturalTwentyBenefitMinimumForCharacter,
  getDeathSaveRollIndicatorsForCharacter
} from "../../../../../pages/CharactersPage/deathSaves";
import { getRollModeFromResolvedRollState, resolveFeatureIndicators } from "../../../../../pages/CharactersPage/rollState";
import { formatD20Formula } from "../../../../../pages/CharactersPage/shared";
import { getExhaustionD20TestPenalty } from "../../../../../pages/CharactersPage/statusEntries";
import { removeConjuredInventoryItemsForCharacterDeath } from "../../../../../pages/CharactersPage/inventoryItems";
import {
  getEffectiveHitPointMaximumForCharacter,
  reconcileCharacterStatusConsequences
} from "../../../../../pages/CharactersPage/traits";
import { createDefaultDeathSaves, normalizeDeathSaves } from "../gameplayStateUtils";
import DeathSavesTracker from "./DeathSavesTracker";
import { resourcePersistOptions } from "./persistOptions";

type DeathSavesWidgetProps = {
  character: Character;
  onPersistCharacter: PersistCharacterUpdater;
};

function DeathSavesWidget({ character, onPersistCharacter }: DeathSavesWidgetProps) {
  const deathSaves = normalizeDeathSaves(character.deathSaves);
  const isAtZeroHitPoints = character.currentHitPoints === 0;
  const rollIndicators = getDeathSaveRollIndicatorsForCharacter(character);
  const rollState = resolveFeatureIndicators(rollIndicators);
  const naturalTwentyBenefitMinimum = getDeathSaveNaturalTwentyBenefitMinimumForCharacter(character);

  const updateDeathSaves = useCallback(
    (track: "success" | "failure") => {
      onPersistCharacter((currentCharacter) => {
        if (currentCharacter.currentHitPoints > 0) {
          return currentCharacter;
        }

        const currentDeathSaves = normalizeDeathSaves(currentCharacter.deathSaves);

        if (currentDeathSaves.successes >= 3 || currentDeathSaves.failures >= 3) {
          return currentCharacter;
        }

        if (track === "success") {
          const nextSuccesses = Math.min(3, currentDeathSaves.successes + 1);

          if (nextSuccesses === currentDeathSaves.successes) {
            return currentCharacter;
          }

          return {
            ...currentCharacter,
            deathSaves: {
              ...currentDeathSaves,
              successes: nextSuccesses
            }
          };
        }

        const nextFailures = Math.min(3, currentDeathSaves.failures + 1);

        if (nextFailures === currentDeathSaves.failures) {
          return currentCharacter;
        }

        const nextCharacter = {
          ...currentCharacter,
          deathSaves: {
            ...currentDeathSaves,
            failures: nextFailures
          }
        };

        return nextFailures >= 3
          ? removeConjuredInventoryItemsForCharacterDeath(nextCharacter)
          : nextCharacter;
      }, resourcePersistOptions);
    },
    [onPersistCharacter]
  );

  const resetDeathSaves = useCallback(() => {
    onPersistCharacter((currentCharacter) => {
      const currentDeathSaves = normalizeDeathSaves(currentCharacter.deathSaves);

      if (currentDeathSaves.successes === 0 && currentDeathSaves.failures === 0) {
        return currentCharacter;
      }

      return {
        ...currentCharacter,
        deathSaves: createDefaultDeathSaves()
      };
    }, resourcePersistOptions);
  }, [onPersistCharacter]);

  const applyNaturalTwentyBenefit = useCallback(() => {
    onPersistCharacter((currentCharacter) => {
      if (currentCharacter.currentHitPoints > 0) {
        return currentCharacter;
      }

      const currentDeathSaves = normalizeDeathSaves(currentCharacter.deathSaves);

      if (currentDeathSaves.successes >= 3 || currentDeathSaves.failures >= 3) {
        return currentCharacter;
      }

      const nextCurrentHitPoints = Math.min(
        getEffectiveHitPointMaximumForCharacter(currentCharacter),
        1
      );

      if (nextCurrentHitPoints <= currentCharacter.currentHitPoints) {
        return currentCharacter;
      }

      return reconcileCharacterStatusConsequences({
        ...currentCharacter,
        currentHitPoints: nextCurrentHitPoints,
        deathSaves: createDefaultDeathSaves()
      });
    }, resourcePersistOptions);
  }, [onPersistCharacter]);

  useEffect(() => {
    if (character.currentHitPoints <= 0) {
      return;
    }

    if (deathSaves.successes === 0 && deathSaves.failures === 0) {
      return;
    }

    onPersistCharacter(
      (currentCharacter) => ({
        ...currentCharacter,
        deathSaves: createDefaultDeathSaves()
      }),
      resourcePersistOptions
    );
  }, [character.currentHitPoints, deathSaves.failures, deathSaves.successes, onPersistCharacter]);

  const exhaustionPenalty = getExhaustionD20TestPenalty(character.statusEntries);
  const deathSaveFormula = formatD20Formula(exhaustionPenalty);
  const exhaustionDescription =
    exhaustionPenalty !== 0 ? ` Exhaustion applies ${exhaustionPenalty} to D20 Tests.` : "";
  const naturalTwentyDescription =
    naturalTwentyBenefitMinimum !== null
      ? naturalTwentyBenefitMinimum <= 1
        ? " Any d20 roll gains the benefit of rolling a 20."
        : ` Rolls of ${naturalTwentyBenefitMinimum}-20 gain the benefit of rolling a 20.`
      : "";
  const rollDescription = rollState && rollState.tone !== "neutralized"
    ? `Roll a death saving throw with ${rollState.label} from ${rollState.sources.join(", ")}.${exhaustionDescription}${naturalTwentyDescription}`
    : `Roll a death saving throw.${exhaustionDescription}${naturalTwentyDescription}`;

  if (!isAtZeroHitPoints) {
    return null;
  }

  return (
    <DeathSavesTracker
      deathSaves={deathSaves}
      descriptionAdditions={getDeathSaveDescriptionAdditionsForCharacter(character)}
      rollIndicators={rollIndicators}
      rollFormula={deathSaveFormula}
      rollFormulaDisplay={deathSaveFormula}
      rollMode={getRollModeFromResolvedRollState(rollState)}
      rollDescription={rollDescription}
      naturalTwentyBenefitMinimum={naturalTwentyBenefitMinimum}
      onNaturalTwentyBenefit={applyNaturalTwentyBenefit}
      onReset={resetDeathSaves}
      onUpdate={updateDeathSaves}
    />
  );
}

export default DeathSavesWidget;
