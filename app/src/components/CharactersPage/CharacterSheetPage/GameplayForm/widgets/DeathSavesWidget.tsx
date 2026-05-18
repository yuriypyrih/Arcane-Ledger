import { useCallback, useEffect } from "react";
import type { Character } from "../../../../../types";
import type { PersistCharacterUpdater } from "../../../../../pages/CharactersPage/CharacterSheetPage/types";
import {
  getDeathSaveDescriptionAdditionsForCharacter,
  hasDeathSaveAdvantageForCharacter
} from "../../../../../pages/CharactersPage/deathSaves";
import { formatD20Formula } from "../../../../../pages/CharactersPage/shared";
import { getExhaustionD20TestPenalty } from "../../../../../pages/CharactersPage/statusEntries";
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
  const hasDeathSaveAdvantage = hasDeathSaveAdvantageForCharacter(character);

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

        return {
          ...currentCharacter,
          deathSaves: {
            ...currentDeathSaves,
            failures: nextFailures
          }
        };
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
  const rollDescription = hasDeathSaveAdvantage
    ? `Roll a death saving throw with Advantage from Durable.${exhaustionDescription}`
    : `Roll a death saving throw.${exhaustionDescription}`;

  if (!isAtZeroHitPoints) {
    return null;
  }

  return (
    <DeathSavesTracker
      deathSaves={deathSaves}
      descriptionAdditions={getDeathSaveDescriptionAdditionsForCharacter(character)}
      rollFormula={deathSaveFormula}
      rollFormulaDisplay={deathSaveFormula}
      rollMode={hasDeathSaveAdvantage ? "advantage" : undefined}
      rollDescription={rollDescription}
      onReset={resetDeathSaves}
      onUpdate={updateDeathSaves}
    />
  );
}

export default DeathSavesWidget;
