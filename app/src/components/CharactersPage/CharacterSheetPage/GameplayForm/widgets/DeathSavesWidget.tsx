import clsx from "clsx";
import { Dices, Skull } from "lucide-react";
import { useCallback, useEffect } from "react";
import { useDiceRollerPopup } from "../../../../DicePage/DiceRollerPopup";
import type { Character } from "../../../../../types";
import type { PersistCharacterUpdater } from "../../../../../pages/CharactersPage/CharacterSheetPage/types";
import widgetShellStyles from "../GameplayWidgetShared.module.css";
import { createDefaultDeathSaves, normalizeDeathSaves } from "../gameplayStateUtils";
import styles from "./DeathSavesWidget.module.css";

type DeathSavesWidgetProps = {
  character: Character;
  onPersistCharacter: PersistCharacterUpdater;
};

function DeathSavesWidget({ character, onPersistCharacter }: DeathSavesWidgetProps) {
  const { openDiceRoller, diceRollerPopup } = useDiceRollerPopup();
  const deathSaves = normalizeDeathSaves(character.deathSaves);
  const isAtZeroHitPoints = character.currentHitPoints === 0;
  const isDeathSaveResolved = deathSaves.successes >= 3 || deathSaves.failures >= 3;

  const updateDeathSaves = useCallback(
    (track: "success" | "failure") => {
      onPersistCharacter((currentCharacter) => {
        if (currentCharacter.currentHitPoints > 0) {
          return currentCharacter;
        }

        const currentDeathSaves = normalizeDeathSaves(currentCharacter.deathSaves);

        if (track === "success") {
          return {
            ...currentCharacter,
            deathSaves: {
              ...currentDeathSaves,
              successes: Math.min(3, currentDeathSaves.successes + 1)
            }
          };
        }

        return {
          ...currentCharacter,
          deathSaves: {
            ...currentDeathSaves,
            failures: Math.min(3, currentDeathSaves.failures + 1)
          }
        };
      });
    },
    [onPersistCharacter]
  );

  useEffect(() => {
    if (character.currentHitPoints <= 0) {
      return;
    }

    if (deathSaves.successes === 0 && deathSaves.failures === 0) {
      return;
    }

    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      deathSaves: createDefaultDeathSaves()
    }));
  }, [character.currentHitPoints, deathSaves.failures, deathSaves.successes, onPersistCharacter]);

  function rollDeathSave() {
    openDiceRoller({
      title: "Death save",
      formula: "1d20",
      formulaDisplay: "1d20",
      description: "Roll a death saving throw.",
      onResolvedResult: ({ result }) => {
        updateDeathSaves(result.total >= 10 ? "success" : "failure");
      }
    });
  }

  if (!isAtZeroHitPoints) {
    return null;
  }

  return (
    <>
      <section className={clsx(widgetShellStyles.widgetCard, styles.root)}>
        <header className={clsx(widgetShellStyles.widgetHeader, styles.headerRow)}>
          <div className={styles.headerMain}>
            <p className={widgetShellStyles.widgetTitle}>Death Saves</p>
            <div className={styles.stateRow}>
              <Skull size={16} />
              <strong>
                {deathSaves.failures >= 3
                  ? "Dead"
                  : deathSaves.successes >= 3
                    ? "Stabilized"
                    : "Make death saves"}
              </strong>
            </div>
          </div>
          <div className={styles.summaryRow}>
            <span>Successes</span>
            <span>Failures</span>
          </div>
        </header>

        <div className={styles.trackGrid}>
          <div className={styles.dotsRow}>
            {Array.from({ length: 3 }, (_, index) => (
              <span
                key={`success-${index}`}
                className={clsx(styles.dot, index < deathSaves.successes && styles.dotSuccess)}
              />
            ))}
          </div>
          <div className={styles.dotsRow}>
            {Array.from({ length: 3 }, (_, index) => (
              <span
                key={`failure-${index}`}
                className={clsx(styles.dot, index < deathSaves.failures && styles.dotFailure)}
              />
            ))}
          </div>
        </div>

        <div className={styles.actionRow}>
          <button
            type="button"
            className={styles.actionButton}
            onClick={() => updateDeathSaves("success")}
            disabled={isDeathSaveResolved}
          >
            Mark success
          </button>
          <button
            type="button"
            className={styles.actionButton}
            onClick={() => updateDeathSaves("failure")}
            disabled={isDeathSaveResolved}
          >
            Mark failure
          </button>
          <button
            type="button"
            className={clsx(styles.actionButton, styles.rollButton)}
            onClick={rollDeathSave}
            disabled={isDeathSaveResolved}
          >
            <Dices size={16} />
            Roll death save
          </button>
        </div>
      </section>

      {diceRollerPopup}
    </>
  );
}

export default DeathSavesWidget;
