import clsx from "clsx";
import { HeartPlus, Pencil, Save, Sword, X } from "lucide-react";
import type { ChangeEvent } from "react";
import { useEffect, useState } from "react";
import NumberInput from "../../../FormInputs/NumberInput";
import type { Character } from "../../../../../types";
import type { PersistCharacterUpdater } from "../../../../../pages/CharactersPage/CharacterSheetPage/types";
import {
  clampNumber
} from "../../../../../pages/CharactersPage/CharacterSheetPage/utils";
import { getAutomaticMaxHitPointsForCharacter } from "../../../../../pages/CharactersPage/gameplay";
import TemporaryHitPoints from "../../TemporaryHitPoints";
import shared from "../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import widgetShellStyles from "../GameplayWidgetShared.module.css";
import {
  createDefaultDeathSaves,
  createHpDraft,
  normalizeDeathSaves,
  normalizeMaxHitPointsMode,
  normalizeTemporaryHitPoints,
  type MaxHitPointsMode
} from "../gameplayStateUtils";
import styles from "./HitPointsWidget.module.css";

type HitPointsWidgetProps = {
  character: Character;
  onPersistCharacter: PersistCharacterUpdater;
};

function HitPointsWidget({ character, onPersistCharacter }: HitPointsWidgetProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [hpDraft, setHpDraft] = useState(() => createHpDraft(character));
  const [hpModeDraft, setHpModeDraft] = useState<MaxHitPointsMode>(() =>
    normalizeMaxHitPointsMode(character.maxHitPointsMode)
  );
  const [hitPointStep, setHitPointStep] = useState(1);

  useEffect(() => {
    if (!isEditing) {
      setHpDraft(createHpDraft(character));
      setHpModeDraft(normalizeMaxHitPointsMode(character.maxHitPointsMode));
    }
  }, [character, character.maxHitPointsMode, isEditing]);

  useEffect(() => {
    if (normalizeMaxHitPointsMode(character.maxHitPointsMode) !== "automatic") {
      return;
    }

    const automaticHitPoints = getAutomaticMaxHitPointsForCharacter(character);

    if (character.hitPoints === automaticHitPoints) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      if (normalizeMaxHitPointsMode(currentCharacter.maxHitPointsMode) !== "automatic") {
        return currentCharacter;
      }

      const nextAutomaticHitPoints = getAutomaticMaxHitPointsForCharacter(currentCharacter);

      if (currentCharacter.hitPoints === nextAutomaticHitPoints) {
        return currentCharacter;
      }

      const nextCurrentHitPoints = clampNumber(
        currentCharacter.currentHitPoints,
        0,
        nextAutomaticHitPoints,
        currentCharacter.currentHitPoints
      );

      return {
        ...currentCharacter,
        hitPoints: nextAutomaticHitPoints,
        currentHitPoints: nextCurrentHitPoints,
        deathSaves:
          nextCurrentHitPoints > 0
            ? createDefaultDeathSaves()
            : normalizeDeathSaves(currentCharacter.deathSaves)
      };
    });
  }, [
    character,
    character.abilities.CON,
    character.className,
    character.currentHitPoints,
    character.hitPoints,
    character.level,
    character.maxHitPointsMode,
    onPersistCharacter
  ]);

  const temporaryHitPoints = normalizeTemporaryHitPoints(character.temporaryHitPoints);
  const currentHitPointPercent =
    character.hitPoints > 0 ? (character.currentHitPoints / character.hitPoints) * 100 : 0;
  const temporaryHitPointPercent =
    character.hitPoints > 0 ? (temporaryHitPoints / character.hitPoints) * 100 : 0;
  const temporaryHitPointOverflow =
    character.currentHitPoints + temporaryHitPoints > character.hitPoints;

  function beginEditing() {
    setHpDraft(createHpDraft(character));
    setHpModeDraft(normalizeMaxHitPointsMode(character.maxHitPointsMode));
    setIsEditing(true);
  }

  function cancelEditing() {
    setHpDraft(createHpDraft(character));
    setHpModeDraft(normalizeMaxHitPointsMode(character.maxHitPointsMode));
    setIsEditing(false);
  }

  function saveHitPoints() {
    const nextMaxHitPoints =
      hpModeDraft === "automatic"
        ? getAutomaticMaxHitPointsForCharacter(character)
        : clampNumber(hpDraft.hitPoints, 1, 999, character.hitPoints);
    const nextCurrentHitPoints = clampNumber(
      hpDraft.currentHitPoints,
      0,
      nextMaxHitPoints,
      character.currentHitPoints
    );

    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      hitPoints: nextMaxHitPoints,
      currentHitPoints: nextCurrentHitPoints,
      maxHitPointsMode: hpModeDraft,
      deathSaves:
        nextCurrentHitPoints > 0
          ? createDefaultDeathSaves()
          : normalizeDeathSaves(currentCharacter.deathSaves)
    }));

    setIsEditing(false);
  }

  function setHitPointMode(nextMode: MaxHitPointsMode) {
    setHpModeDraft(nextMode);

    if (nextMode !== "automatic") {
      return;
    }

    const automaticHitPoints = getAutomaticMaxHitPointsForCharacter(character);

    setHpDraft((currentDraft) => ({
      hitPoints: automaticHitPoints,
      currentHitPoints: clampNumber(
        currentDraft.currentHitPoints,
        0,
        automaticHitPoints,
        currentDraft.currentHitPoints
      )
    }));
  }

  function updateHitPointDraftValue(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setHpDraft((current) => ({
      ...current,
      hitPoints: clampNumber(value, 1, 999, current.hitPoints)
    }));
  }

  function updateCurrentHitPointDraftValue(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setHpDraft((current) => ({
      ...current,
      currentHitPoints: clampNumber(value, 0, current.hitPoints, current.currentHitPoints)
    }));
  }

  function updateHitPointStep(event: ChangeEvent<HTMLInputElement>) {
    const normalizedValue = event.target.value.replace(/^0+(?=\d)/, "");
    setHitPointStep(clampNumber(normalizedValue, 0, 999, 0));
  }

  function adjustHitPoints(direction: -1 | 1) {
    const amount = clampNumber(hitPointStep, 0, 999, 0);

    if (amount === 0) {
      setHitPointStep(1);
      return;
    }

    onPersistCharacter((currentCharacter) => {
      if (direction > 0) {
        const nextCurrentHitPoints = clampNumber(
          currentCharacter.currentHitPoints + amount,
          0,
          currentCharacter.hitPoints,
          currentCharacter.currentHitPoints
        );

        if (nextCurrentHitPoints === currentCharacter.currentHitPoints) {
          return currentCharacter;
        }

        return {
          ...currentCharacter,
          currentHitPoints: nextCurrentHitPoints,
          deathSaves:
            nextCurrentHitPoints > 0
              ? createDefaultDeathSaves()
              : normalizeDeathSaves(currentCharacter.deathSaves)
        };
      }

      const currentTemporaryHitPoints = normalizeTemporaryHitPoints(currentCharacter.temporaryHitPoints);
      const absorbedByTemporaryHitPoints = Math.min(amount, currentTemporaryHitPoints);
      const nextTemporaryHitPoints = currentTemporaryHitPoints - absorbedByTemporaryHitPoints;
      const remainingDamage = amount - absorbedByTemporaryHitPoints;
      const nextCurrentHitPoints = clampNumber(
        currentCharacter.currentHitPoints - remainingDamage,
        0,
        currentCharacter.hitPoints,
        currentCharacter.currentHitPoints
      );

      if (
        nextTemporaryHitPoints === currentTemporaryHitPoints &&
        nextCurrentHitPoints === currentCharacter.currentHitPoints
      ) {
        return currentCharacter;
      }

      return {
        ...currentCharacter,
        temporaryHitPoints: nextTemporaryHitPoints,
        currentHitPoints: nextCurrentHitPoints,
        deathSaves:
          nextCurrentHitPoints > 0
            ? createDefaultDeathSaves()
            : normalizeDeathSaves(currentCharacter.deathSaves)
      };
    });

    setHitPointStep(1);
  }

  return (
    <section className={clsx(widgetShellStyles.widgetCard, styles.root)}>
      <header className={widgetShellStyles.widgetHeader}>
        <p className={widgetShellStyles.widgetTitle}>Hit Points</p>
        {isEditing ? null : (
          <button
            type="button"
            className={clsx(shared.editButton, styles.editButton)}
            onClick={beginEditing}
          >
            <Pencil size={16} />
            Edit
          </button>
        )}
      </header>

      {isEditing ? (
        <div className={styles.editGrid}>
          <div className={styles.modeSwitch} role="tablist" aria-label="Max HP mode">
            <button
              type="button"
              className={clsx(
                styles.modeSwitchButton,
                hpModeDraft === "automatic" && styles.modeSwitchButtonActive
              )}
              onClick={() => setHitPointMode("automatic")}
              aria-pressed={hpModeDraft === "automatic"}
            >
              Automatic
            </button>
            <button
              type="button"
              className={clsx(
                styles.modeSwitchButton,
                hpModeDraft === "custom" && styles.modeSwitchButtonActive
              )}
              onClick={() => setHitPointMode("custom")}
              aria-pressed={hpModeDraft === "custom"}
            >
              Custom
            </button>
          </div>

          <label className={widgetShellStyles.widgetField}>
            <span>Max HP</span>
            <NumberInput
              min={1}
              disabled={hpModeDraft === "automatic"}
              value={hpDraft.hitPoints}
              onChange={updateHitPointDraftValue}
            />
          </label>
          <label className={widgetShellStyles.widgetField}>
            <span>Current HP</span>
            <NumberInput
              min={0}
              max={hpDraft.hitPoints}
              value={hpDraft.currentHitPoints}
              onChange={updateCurrentHitPointDraftValue}
            />
          </label>
          <div className={styles.editActions}>
            <button type="button" className={shared.saveButton} onClick={saveHitPoints}>
              <Save size={16} />
              Save
            </button>
            <button type="button" className={shared.cancelButton} onClick={cancelEditing}>
              <X size={16} />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.summary}>
            <div className={styles.valueRow}>
              <div className={styles.summaryCopy}>
                <div className={styles.currentRow}>
                  <strong>
                    {character.currentHitPoints}/{character.hitPoints} HP
                  </strong>
                  <TemporaryHitPoints
                    temporaryHitPoints={temporaryHitPoints}
                    onPersistCharacter={onPersistCharacter}
                  />
                </div>

                <span>
                  {character.currentHitPoints === 0
                    ? "Unconscious"
                    : character.currentHitPoints <= Math.ceil(character.hitPoints * 0.35)
                      ? "Critical"
                      : "Stable"}
                </span>
              </div>
            </div>
          </div>
          <div className={styles.actionRow}>
            <div className={styles.barTrack}>
              <div className={styles.barMeter}>
                <div className={styles.barFill} style={{ width: `${Math.max(0, currentHitPointPercent)}%` }} />
                {temporaryHitPointPercent > 0 ? (
                  <div
                    className={clsx(styles.barTempFill, temporaryHitPointOverflow && styles.tempOverflow)}
                    style={{ width: `${temporaryHitPointPercent}%` }}
                  />
                ) : null}
              </div>
            </div>
            <div className={styles.stepControl}>
              <NumberInput
                min={0}
                className={styles.stepInput}
                value={hitPointStep}
                onChange={updateHitPointStep}
              />
              <button
                type="button"
                className={clsx(styles.actionButton, styles.damageButton)}
                onClick={() => adjustHitPoints(-1)}
                title={`Deal ${hitPointStep} hit points`}
              >
                <Sword size={20} />
              </button>
              <button
                type="button"
                className={clsx(styles.actionButton, styles.healButton)}
                onClick={() => adjustHitPoints(1)}
                title={`Heal ${hitPointStep} hit points`}
              >
                <HeartPlus size={20} />
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default HitPointsWidget;
