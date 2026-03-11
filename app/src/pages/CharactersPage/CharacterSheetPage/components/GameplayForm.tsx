import clsx from "clsx";
import { HeartPlus, Pencil, Save, Sword, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import NumberInput from "../../../../components/CharactersPage/FormInputs/NumberInput";
import { useDiceRollerPopup } from "../../../../components/DicePage/DiceRollerPopup";
import { useBodyScrollLock } from "../../../../lib/useBodyScrollLock";
import type { Character } from "../../../../types";
import { formatAbilityModifier, getWeaponActionsForCharacter } from "../../gameplay";
import type { HpDraft, PersistCharacterUpdater } from "../types";
import { clampNumber } from "../utils";
import sheetStyles from "../CharacterSheetPage.module.css";
import shared from "./CharacterSheetSectionShared.module.css";
import styles from "./GameplayForm.module.css";

type GameplayFormProps = {
  className?: string;
  onPersistCharacter: PersistCharacterUpdater;
};

function createHpDraft(character: Character): HpDraft {
  return {
    hitPoints: character.hitPoints,
    currentHitPoints: character.currentHitPoints
  };
}

function GameplayForm({ className, onPersistCharacter }: GameplayFormProps) {
  const { watch } = useFormContext<Character>();
  const character = watch() as Character;
  const [isEditing, setIsEditing] = useState(false);
  const [hpDraft, setHpDraft] = useState<HpDraft>(() => createHpDraft(character));
  const [hitPointStep, setHitPointStep] = useState(1);
  const [isRestPopupOpen, setIsRestPopupOpen] = useState(false);
  const { openDiceRoller, diceRollerPopup } = useDiceRollerPopup();

  useBodyScrollLock(isRestPopupOpen);

  useEffect(() => {
    if (!isEditing) {
      setHpDraft(createHpDraft(character));
    }
  }, [character.hitPoints, character.currentHitPoints, isEditing]);

  useEffect(() => {
    if (!isRestPopupOpen) {
      return;
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        setIsRestPopupOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isRestPopupOpen]);

  function beginEditing() {
    setHpDraft(createHpDraft(character));
    setIsEditing(true);
  }

  function cancelEditing() {
    setHpDraft(createHpDraft(character));
    setIsEditing(false);
  }

  function saveHitPoints() {
    const nextMaxHitPoints = clampNumber(hpDraft.hitPoints, 1, 999, character.hitPoints);
    const nextCurrentHitPoints = clampNumber(
      hpDraft.currentHitPoints,
      0,
      nextMaxHitPoints,
      character.currentHitPoints
    );

    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      hitPoints: nextMaxHitPoints,
      currentHitPoints: nextCurrentHitPoints
    }));

    setIsEditing(false);
  }

  function adjustHitPoints(direction: -1 | 1) {
    const amount = clampNumber(hitPointStep, 1, 999, 1);
    const nextCurrentHitPoints = clampNumber(
      character.currentHitPoints + amount * direction,
      0,
      character.hitPoints,
      character.currentHitPoints
    );

    if (nextCurrentHitPoints === character.currentHitPoints) {
      return;
    }

    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      currentHitPoints: nextCurrentHitPoints
    }));
  }

  function takeShortRest() {
    if (shortRestsRemaining <= 0) {
      return;
    }

    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      currentHitPoints: clampNumber(
        currentCharacter.currentHitPoints + shortRestHealAmount,
        0,
        currentCharacter.hitPoints,
        currentCharacter.currentHitPoints
      ),
      shortRestsUsedToday: shortRestsUsedToday + 1
    }));

    setIsRestPopupOpen(false);
  }

  function takeLongRest() {
    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      currentHitPoints: currentCharacter.hitPoints,
      shortRestsUsedToday: 0,
      spellSlotsExpended: Array.from({ length: 9 }, () => 0)
    }));

    setIsRestPopupOpen(false);
  }

  const hitPointPercent =
    character.hitPoints > 0 ? (character.currentHitPoints / character.hitPoints) * 100 : 0;
  const weaponActions = getWeaponActionsForCharacter(character);
  const shortRestsUsedToday = clampNumber(character.shortRestsUsedToday, 0, 2, 0);
  const shortRestsRemaining = Math.max(0, 2 - shortRestsUsedToday);
  const shortRestHealAmount = Math.ceil(character.hitPoints / 2);

  return (
    <article className={clsx(shared.sectionCard, className)}>
      <div className={shared.sectionHeader}>
        <div>
          <p className={shared.eyebrow}>Gameplay</p>
        </div>
        {isEditing ? null : (
          <button type="button" className={shared.editButton} onClick={beginEditing}>
            <Pencil size={16} />
            Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <div className={shared.formGrid}>
          <label className={shared.field}>
            <span>Max HP</span>
            <NumberInput
              min={1}
              value={hpDraft.hitPoints}
              onChange={(event) =>
                setHpDraft((current) => ({
                  ...current,
                  hitPoints: clampNumber(event.target.value, 1, 999, current.hitPoints)
                }))
              }
            />
          </label>
          <label className={shared.field}>
            <span>Current HP</span>
            <NumberInput
              min={0}
              max={hpDraft.hitPoints}
              value={hpDraft.currentHitPoints}
              onChange={(event) =>
                setHpDraft((current) => ({
                  ...current,
                  currentHitPoints: clampNumber(
                    event.target.value,
                    0,
                    current.hitPoints,
                    current.currentHitPoints
                  )
                }))
              }
            />
          </label>
          <div className={shared.formActions}>
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
          <div className={styles.gameplayHpRow}>
            <div className={styles.hpMeter}>
              <div className={styles.hpSummary}>
                <strong>
                  {character.currentHitPoints}/{character.hitPoints} HP
                </strong>
                <span>
                  {character.currentHitPoints === 0
                    ? "Unconscious"
                    : character.currentHitPoints <= Math.ceil(character.hitPoints * 0.35)
                      ? "Critical"
                      : "Stable"}
                </span>
              </div>
              <div className={styles.hpBarTrack}>
                <div className={styles.hpBarFill} style={{ width: `${Math.max(0, hitPointPercent)}%` }} />
              </div>
            </div>
            <div className={styles.hpStepControl}>
              <NumberInput
                min={1}
                className={styles.hpStepInput}
                value={hitPointStep}
                onChange={(event) =>
                  setHitPointStep((current) => clampNumber(event.target.value, 1, 999, current))
                }
              />
              <button
                type="button"
                className={clsx(styles.hpActionButton, styles.hpDamage)}
                onClick={() => adjustHitPoints(-1)}
                title={`Deal ${hitPointStep} hit points`}
              >
                <Sword size={16} />
              </button>
              <button
                type="button"
                className={clsx(styles.hpActionButton, styles.hpHeal)}
                onClick={() => adjustHitPoints(1)}
                title={`Heal ${hitPointStep} hit points`}
              >
                <HeartPlus size={16} />
              </button>
            </div>
          </div>

          {weaponActions.length === 0 ? (
            <p className={shared.emptyText}>No weapon actions available. Equip a weapon to roll attacks.</p>
          ) : (
            <div className={styles.weaponActionGrid}>
              {weaponActions.map((action) => (
                <button
                  key={action.name}
                  type="button"
                  className={styles.weaponActionButton}
                  onClick={() =>
                    openDiceRoller({
                      title: `${action.name} attack`,
                      formula: action.rollFormula,
                      description: `${action.ability} ${formatAbilityModifier(action.abilityModifier)} | Proficiency (${action.proficiencyLabel}) ${formatAbilityModifier(action.proficiencyBonus)}`
                    })
                  }
                >
                  <strong>
                    {action.name} ({action.damageFormula})
                  </strong>
                  <span>
                    {action.ability} {formatAbilityModifier(action.abilityModifier)} | Proficiency (
                    {action.proficiencyLabel}) {formatAbilityModifier(action.proficiencyBonus)}
                  </span>
                  <small>Roll: {action.rollDisplay}</small>
                </button>
              ))}
            </div>
          )}

          <div className={styles.gameplayCampButtonRow}>
            <button type="button" className={styles.campButton} onClick={() => setIsRestPopupOpen(true)}>
              <span>Camp</span>
            </button>
          </div>
        </>
      )}

      {isRestPopupOpen ? (
        <div
          className={sheetStyles.restPopupBackdrop}
          role="presentation"
          onClick={() => setIsRestPopupOpen(false)}
        >
          <section
            className={sheetStyles.restPopupCard}
            role="dialog"
            aria-modal="true"
            aria-labelledby="rest-popup-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={sheetStyles.restPopupHeader}>
              <div>
                <p className={sheetStyles.eyebrow}>Camp</p>
                <h3 id="rest-popup-title">Choose your rest</h3>
              </div>
              <button
                type="button"
                className={sheetStyles.spellManagementCloseButton}
                onClick={() => setIsRestPopupOpen(false)}
                aria-label="Close rest options"
              >
                <X size={18} />
              </button>
            </div>

            <div className={sheetStyles.restOptionGrid}>
              <button
                type="button"
                className={sheetStyles.restOptionButton}
                onClick={takeShortRest}
                disabled={shortRestsRemaining <= 0}
              >
                <strong>Short rest</strong>
                <small>Heal {shortRestHealAmount} HP (half your max HP).</small>
                <div
                  className={sheetStyles.shortRestDots}
                  aria-label={`${shortRestsRemaining} short rests remaining today`}
                >
                  {Array.from({ length: 2 }, (_, index) => (
                    <span
                      key={index}
                      className={clsx(
                        sheetStyles.shortRestDot,
                        index < shortRestsRemaining && sheetStyles.shortRestDotActive
                      )}
                    />
                  ))}
                </div>
              </button>

              <button type="button" className={sheetStyles.restOptionButton} onClick={takeLongRest}>
                <strong>Long rest</strong>
                <small>Restore full HP and refresh all spell slots.</small>
                <span className={sheetStyles.longRestNote}>Also resets short rests.</span>
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {diceRollerPopup}
    </article>
  );
}

export default GameplayForm;
