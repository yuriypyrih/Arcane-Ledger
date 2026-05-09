import clsx from "clsx";
import { Skull } from "lucide-react";
import { useCallback, useEffect, useId, useState } from "react";
import ActionButton from "../../../../ActionButton";
import DescriptionContent from "../../../../DescriptionContent/DescriptionContent";
import { useDiceRollerPopup } from "../../../../DicePage/DiceRollerPopup";
import type { Character } from "../../../../../types";
import type { PersistCharacterUpdater } from "../../../../../pages/CharactersPage/CharacterSheetPage/types";
import {
  deathSaveDescription,
  getDeathSaveDescriptionAdditionsForCharacter,
  hasDeathSaveAdvantageForCharacter
} from "../../../../../pages/CharactersPage/deathSaves";
import { orderDescriptionAdditionSections } from "../../../../../pages/CharactersPage/actionModalDescriptions";
import { formatD20Formula } from "../../../../../pages/CharactersPage/shared";
import { getExhaustionD20TestPenalty } from "../../../../../pages/CharactersPage/statusEntries";
import d20Icon from "../../../../../assets/svg/d20.svg";
import {
  OverlayBody,
  OverlayCloseButton,
  OverlayEyebrow,
  OverlayFooter,
  OverlayHeader,
  OverlayHeaderContent,
  OverlayTitle,
  OverlayTitleRow,
  SheetModal,
  overlayClassNames
} from "../../../../Overlay";
import { createDefaultDeathSaves, normalizeDeathSaves } from "../gameplayStateUtils";
import DiceRollerSettingsButton from "./DiceRollerSettingsButton";
import { resourcePersistOptions } from "./persistOptions";
import styles from "./DeathSavesWidget.module.css";

type DeathSavesWidgetProps = {
  character: Character;
  onPersistCharacter: PersistCharacterUpdater;
};

function DeathSavesWidget({ character, onPersistCharacter }: DeathSavesWidgetProps) {
  const titleId = useId();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDiceRollerSettingsOpen, setIsDiceRollerSettingsOpen] = useState(false);
  const { openDiceRoller, diceRollerPopup } = useDiceRollerPopup();
  const deathSaves = normalizeDeathSaves(character.deathSaves);
  const isAtZeroHitPoints = character.currentHitPoints === 0;
  const isDeathSaveResolved = deathSaves.successes >= 3 || deathSaves.failures >= 3;
  const hasMarkedDeathSaves = deathSaves.successes > 0 || deathSaves.failures > 0;
  const hasDeathSaveAdvantage = hasDeathSaveAdvantageForCharacter(character);
  const descriptionSections = orderDescriptionAdditionSections(
    getDeathSaveDescriptionAdditionsForCharacter(character)
  );

  const updateDeathSaves = useCallback(
    (track: "success" | "failure") => {
      onPersistCharacter(
        (currentCharacter) => {
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
        },
        resourcePersistOptions
      );
    },
    [onPersistCharacter]
  );

  const resetDeathSaves = useCallback(() => {
    onPersistCharacter(
      (currentCharacter) => {
        const currentDeathSaves = normalizeDeathSaves(currentCharacter.deathSaves);

        if (currentDeathSaves.successes === 0 && currentDeathSaves.failures === 0) {
          return currentCharacter;
        }

        return {
          ...currentCharacter,
          deathSaves: createDefaultDeathSaves()
        };
      },
      resourcePersistOptions
    );
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

  useEffect(() => {
    if (isAtZeroHitPoints) {
      return;
    }

    setIsModalOpen(false);
    setIsDiceRollerSettingsOpen(false);
  }, [isAtZeroHitPoints]);

  function rollDeathSave() {
    const exhaustionPenalty = getExhaustionD20TestPenalty(character.statusEntries);
    const deathSaveFormula = formatD20Formula(exhaustionPenalty);
    const exhaustionDescription =
      exhaustionPenalty !== 0
        ? ` Exhaustion applies ${exhaustionPenalty} to D20 Tests.`
        : "";

    openDiceRoller({
      title: "Death save",
      formula: deathSaveFormula,
      formulaDisplay: deathSaveFormula,
      mode: hasDeathSaveAdvantage ? "advantage" : undefined,
      description: hasDeathSaveAdvantage
        ? `Roll a death saving throw with Advantage from Durable.${exhaustionDescription}`
        : `Roll a death saving throw.${exhaustionDescription}`,
      onResolvedResult: ({ result }) => {
        updateDeathSaves(result.total >= 10 ? "success" : "failure");
      }
    });
  }

  function renderDeathSaveDots(track: "success" | "failure") {
    const current = track === "success" ? deathSaves.successes : deathSaves.failures;
    const dotClassName = track === "success" ? styles.dotSuccess : styles.dotFailure;

    return (
      <span className={styles.dotsRow} aria-hidden="true">
        {Array.from({ length: 3 }, (_, index) => (
          <span
            key={`${track}-${index}`}
            className={clsx(styles.dot, dotClassName, index < current && styles.dotActive)}
          />
        ))}
      </span>
    );
  }

  if (!isAtZeroHitPoints) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setIsModalOpen(true)}
        aria-label={`Death saves: ${deathSaves.successes} successes and ${deathSaves.failures} failures`}
        title="Manage death saves"
      >
        <Skull size={15} aria-hidden="true" />
        <span className={styles.triggerLabel}>Death Saves</span>
        <span className={styles.triggerDots}>
          {renderDeathSaveDots("success")}
          <span className={styles.dotDivider} aria-hidden="true">
            |
          </span>
          {renderDeathSaveDots("failure")}
        </span>
      </button>

      {isModalOpen ? (
        <SheetModal titleId={titleId} onClose={() => setIsModalOpen(false)} size="medium">
          <OverlayHeader>
            <OverlayHeaderContent>
              <OverlayEyebrow>Gameplay</OverlayEyebrow>
              <OverlayTitleRow>
                <OverlayTitle id={titleId}>Death Saves</OverlayTitle>
              </OverlayTitleRow>
            </OverlayHeaderContent>
            <OverlayCloseButton
              label="Close death saves"
              onClick={() => setIsModalOpen(false)}
            />
          </OverlayHeader>

          <OverlayBody className={styles.modalBody}>
            <div className={styles.descriptionStack}>
              <DescriptionContent
                description={deathSaveDescription}
                className={`${overlayClassNames.descriptionList} ${overlayClassNames.descriptionSection}`}
                entryClassName={overlayClassNames.descriptionLine}
                strongClassName={overlayClassNames.descriptionStrong}
              />
              {descriptionSections.map((section, index) => (
                <div
                  key={`death-save-description-section-${index}`}
                  className={styles.descriptionSection}
                >
                  <hr className={styles.descriptionDivider} aria-hidden="true" />
                  <DescriptionContent
                    description={section}
                    className={`${overlayClassNames.descriptionList} ${overlayClassNames.descriptionSection}`}
                    entryClassName={overlayClassNames.descriptionLine}
                    strongClassName={overlayClassNames.descriptionStrong}
                  />
                </div>
              ))}
            </div>

            <div className={styles.modalTracker} aria-label="Death save tracker">
              <div className={styles.trackRow}>
                <span>Successes</span>
                {renderDeathSaveDots("success")}
              </div>
              <div className={styles.trackRow}>
                <span>Failures</span>
                {renderDeathSaveDots("failure")}
              </div>
            </div>
          </OverlayBody>

          <OverlayFooter className={styles.footer}>
            <div className={styles.footerActions}>
              <div className={styles.incrementRow}>
                <ActionButton
                  actionType="SUCCESS"
                  variant="OUTLINE"
                  className={styles.incrementButton}
                  onClick={() => updateDeathSaves("success")}
                  disabled={isDeathSaveResolved}
                >
                  + Success
                </ActionButton>
                <ActionButton
                  actionType="ERROR"
                  variant="OUTLINE"
                  className={styles.incrementButton}
                  onClick={() => updateDeathSaves("failure")}
                  disabled={isDeathSaveResolved}
                >
                  + Failure
                </ActionButton>
                <ActionButton
                  variant="GHOST"
                  className={styles.incrementButton}
                  onClick={resetDeathSaves}
                  disabled={!hasMarkedDeathSaves}
                >
                  Reset All
                </ActionButton>
              </div>
              <div className={styles.rollRow}>
                <ActionButton
                  className={styles.rollButton}
                  onClick={rollDeathSave}
                  disabled={isDeathSaveResolved}
                  icon={<img src={d20Icon} alt="" className={styles.rollButtonIcon} />}
                >
                  Roll
                </ActionButton>
                <DiceRollerSettingsButton
                  actionName="Death save"
                  className={styles.settingsButton}
                  isOpen={isDiceRollerSettingsOpen}
                  ariaLabel="Open death save dice roller settings"
                  onOpenChange={setIsDiceRollerSettingsOpen}
                />
              </div>
            </div>
          </OverlayFooter>
        </SheetModal>
      ) : null}

      {diceRollerPopup}
    </>
  );
}

export default DeathSavesWidget;
