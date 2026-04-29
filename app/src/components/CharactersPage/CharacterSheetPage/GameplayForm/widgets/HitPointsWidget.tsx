import clsx from "clsx";
import { Pencil, Save, X } from "lucide-react";
import type { ChangeEvent } from "react";
import { useEffect, useState } from "react";
import NumberInput from "../../../FormInputs/NumberInput";
import type { Character } from "../../../../../types";
import type { PersistCharacterUpdater } from "../../../../../pages/CharactersPage/CharacterSheetPage/types";
import { getMagicTemporaryHitPointsFeatureForCharacter } from "../../../../../pages/CharactersPage/classFeatures/magicTemporaryHitPoints";
import { clampNumber } from "../../../../../pages/CharactersPage/CharacterSheetPage/utils";
import { getAutomaticMaxHitPointsForCharacter } from "../../../../../pages/CharactersPage/gameplay";
import { getEffectiveHitPointMaximumForCharacter } from "../../../../../pages/CharactersPage/traits";
import HitPointControls from "../../HitPointControls/HitPointControls";
import MagicTemporaryHitPoints from "../../MagicTemporaryHitPoints";
import shared from "../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import widgetShellStyles from "../GameplayWidgetShared.module.css";
import {
  createHpDraft,
  normalizeDeathSaves,
  normalizeMagicTemporaryHitPoints,
  normalizeMaxHitPointsMode,
  normalizeTemporaryHitPoints,
  type MaxHitPointsMode
} from "../gameplayStateUtils";
import {
  applyDamageToCharacter,
  applyHealingToCharacter,
  applyHitPointEditToCharacter,
  assignManualTemporaryHitPointsForCharacter,
  syncAutomaticHitPointsForCharacter
} from "../hitPointState";
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
  const effectiveHitPoints = getEffectiveHitPointMaximumForCharacter(character);

  function getEffectiveHitPointsForBase(baseHitPoints: number): number {
    return getEffectiveHitPointMaximumForCharacter({
      ...character,
      hitPoints: baseHitPoints
    });
  }

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

    const nextCharacter = syncAutomaticHitPointsForCharacter(character);

    if (nextCharacter === character) {
      return;
    }

    onPersistCharacter((currentCharacter) => syncAutomaticHitPointsForCharacter(currentCharacter));
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
  const magicTemporaryHitPoints = normalizeMagicTemporaryHitPoints(character.magicTemporaryHitPoints);
  const magicTemporaryHitPointsFeature = getMagicTemporaryHitPointsFeatureForCharacter(character);
  const deathSaves = normalizeDeathSaves(character.deathSaves);
  const statusLabel =
    deathSaves.failures >= 3
      ? "Dead"
      : deathSaves.successes >= 3
        ? "Stable"
        : character.currentHitPoints === 0
          ? "Unconscious"
          : character.currentHitPoints <= Math.ceil(effectiveHitPoints * 0.35)
            ? "Critical"
            : "Stable";

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
    const nextBaseHitPoints =
      hpModeDraft === "automatic"
        ? getAutomaticMaxHitPointsForCharacter(character)
        : clampNumber(hpDraft.hitPoints, 1, 999, character.hitPoints);
    const nextEffectiveHitPoints = getEffectiveHitPointsForBase(nextBaseHitPoints);
    const nextCurrentHitPoints = clampNumber(
      hpDraft.currentHitPoints,
      0,
      nextEffectiveHitPoints,
      character.currentHitPoints
    );

    onPersistCharacter((currentCharacter) =>
      applyHitPointEditToCharacter(currentCharacter, {
        hitPoints: nextBaseHitPoints,
        currentHitPoints: nextCurrentHitPoints,
        maxHitPointsMode: hpModeDraft
      })
    );

    setIsEditing(false);
  }

  function setHitPointMode(nextMode: MaxHitPointsMode) {
    setHpModeDraft(nextMode);

    if (nextMode !== "automatic") {
      return;
    }

    const automaticHitPoints = getAutomaticMaxHitPointsForCharacter(character);
    const automaticEffectiveHitPoints = getEffectiveHitPointsForBase(automaticHitPoints);

    setHpDraft((currentDraft) => ({
      hitPoints: automaticHitPoints,
      currentHitPoints: clampNumber(
        currentDraft.currentHitPoints,
        0,
        automaticEffectiveHitPoints,
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
      currentHitPoints: clampNumber(
        value,
        0,
        getEffectiveHitPointsForBase(current.hitPoints),
        current.currentHitPoints
      )
    }));
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
              max={getEffectiveHitPointsForBase(hpDraft.hitPoints)}
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
        <HitPointControls
          currentHitPoints={character.currentHitPoints}
          maxHitPoints={effectiveHitPoints}
          temporaryHitPoints={temporaryHitPoints}
          temporaryHitPointsSource={character.temporaryHitPointsSource}
          magicTemporaryHitPoints={magicTemporaryHitPoints}
          statusText={statusLabel}
          temporaryHitPointsDescription="When taking damage the temporary hit points are consumed first. They do not stack and they vanish after resting at a camp."
          extraTemporaryHitPointControl={
            magicTemporaryHitPointsFeature ? (
              <MagicTemporaryHitPoints
                feature={magicTemporaryHitPointsFeature}
                magicTemporaryHitPoints={magicTemporaryHitPoints}
                magicTemporaryHitPointsSource={character.magicTemporaryHitPointsSource}
                onPersistCharacter={onPersistCharacter}
              />
            ) : null
          }
          onDamage={(amount) =>
            onPersistCharacter((currentCharacter) =>
              applyDamageToCharacter(currentCharacter, amount)
            )
          }
          onHeal={(amount) =>
            onPersistCharacter((currentCharacter) =>
              applyHealingToCharacter(currentCharacter, amount)
            )
          }
          onSaveTemporaryHitPoints={(value) =>
            onPersistCharacter((currentCharacter) =>
              assignManualTemporaryHitPointsForCharacter(currentCharacter, value)
            )
          }
        />
      )}
    </section>
  );
}

export default HitPointsWidget;
